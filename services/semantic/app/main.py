from fastapi import (
    FastAPI,
    Depends,
    BackgroundTasks,
    status,
    HTTPException,
)
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.middlewares.logging import ProcessTimeMiddleware
from . import models, schemas
from .database import engine, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sentence_transformers import SentenceTransformer, util
import json
import httpx
import numpy as np
import os


model = SentenceTransformer("BAAI/bge-m3")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

        def get_tables(connection):
            from sqlalchemy import inspect

            inspector = inspect(connection)
            return inspector.get_table_names()

        tables = await conn.run_sync(get_tables)
        print(f"--- Database Initialized. Tables found: {tables} ---")
    yield


app = FastAPI(
    title="Identity Service API",
    description="Microservice for User Registration and Authentication",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",  # You can even change the URL!
)

# Add Middleware
app.add_middleware(ProcessTimeMiddleware)


@app.get("/health")
async def health():
    return {"status": "up"}


async def get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()


import yaml

# TEST_ENDPOINT = "http://127.0.0.1:4012/api/v1/test-scores"  # need to update this to the actual endpoint of the service that will receive the scores

INTERACTION_URL = os.getenv("INTERACTION_URL")


async def calculate_score_for_new_soul(new_soul_id: int):
    async with SessionLocal() as db:
        try:
            soul_stmt = select(models.Soul).where(models.Soul.id == new_soul_id)
            soul_result = await db.execute(soul_stmt)
            soul = soul_result.scalar_one_or_none()

            if not soul or not soul.soul:
                return

            soul_vector = np.array(json.loads(soul.soul))

            inquiry_stmt = select(models.Inquiry)
            inquiry_result = await db.execute(inquiry_stmt)
            inquiries = inquiry_result.scalars().all()

            for inquiry in inquiries:
                if not inquiry.query:
                    continue

                inquiry_vector = np.array(json.loads(inquiry.query))
                similarity = util.cos_sim(inquiry_vector, soul_vector).item()
                new_score_value = round(similarity, 4)

                new_score = models.Score(
                    inquiry_id=inquiry.id, soul_id=soul.id, score_value=new_score_value
                )
                db.add(new_score)

                score_stmt = (
                    select(models.Score.score_value)
                    .where(models.Score.inquiry_id == inquiry.id)
                    .order_by(models.Score.score_value.desc())
                    .limit(1)
                )
                current_top_score_result = await db.execute(score_stmt)
                current_top_score = current_top_score_result.scalar_one_or_none()

                if current_top_score is None or new_score_value > current_top_score:

                    payload = [
                        {
                            "order_id": inquiry.order_id,
                            "insider_id": soul.insider_id,
                            "score": new_score_value,
                        }
                    ]

                    async with httpx.AsyncClient() as client:
                        response = await client.post(
                            f"{INTERACTION_URL}/api/v1/matches",
                            json=payload,
                            timeout=10.0,
                        )
                        if response.status_code in (200, 201, 202):
                            print(
                                f"🔥 New Top Match found! Notified endpoint for Inquiry {inquiry.id}"
                            )
                        else:
                            print(
                                f"Failed to forward update. Status: {response.status_code}"
                            )

            await db.commit()

        except Exception as e:
            print(f"Error in new soul scoring pipeline: {e}")
            await db.rollback()


async def calculate_scores_for_inquiry(inquiry_id: int):
    async with SessionLocal() as db:
        try:
            inquiry_stmt = select(models.Inquiry).where(models.Inquiry.id == inquiry_id)
            inquiry_result = await db.execute(inquiry_stmt)
            inquiry = inquiry_result.scalar_one_or_none()

            if not inquiry or not inquiry.query:
                return

            inquiry_vector = np.array(json.loads(inquiry.query))

            soul_stmt = select(models.Soul)
            soul_result = await db.execute(soul_stmt)
            souls = soul_result.scalars().all()

            calculated_scores = []

            for soul in souls:
                if not soul.soul:
                    continue

                soul_vector = np.array(json.loads(soul.soul))
                similarity = util.cos_sim(inquiry_vector, soul_vector).item()
                score_value = round(similarity, 4)

                new_score = models.Score(
                    inquiry_id=inquiry.id, soul_id=soul.id, score_value=score_value
                )
                db.add(new_score)

                calculated_scores.append(
                    {
                        "soul_id": soul.id,
                        "insider_id": soul.insider_id,
                        "score": score_value,
                    }
                )

            await db.commit()

            calculated_scores.sort(key=lambda x: x["score"], reverse=True)
            top_score = calculated_scores[:5]

            payload = [
                {
                    "order_id": inquiry.order_id,
                    "insider_id": score["insider_id"] if top_score else None,
                    "score": score["score"] if top_score else None,
                }
                for score in top_score
            ]

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{INTERACTION_URL}/api/v1/matches", json=payload, timeout=10.0
                )

                if response.status_code in (200, 201, 202):
                    print(
                        f"Successfully forwarded top 5 scores for Inquiry {inquiry_id}"
                    )
                else:
                    print(
                        f"Failed to forward scores. External API returned status: {response.status_code}"
                    )

        except Exception as e:
            print(f"Error in scoring task pipeline: {e}")
            await db.rollback()


@app.on_event("startup")
def save_openapi_yaml():
    with open("contract.yml", "w") as f:
        yaml.dump(app.openapi(), f, sort_keys=False)


@api_router.post(
    "/souls", response_model=schemas.SoulRead, status_code=status.HTTP_201_CREATED
)
async def create_soul(
    soul: schemas.SoulCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    soul_embedding = model.encode(soul.text)
    vector_str = json.dumps(soul_embedding.tolist())
    db_soul = models.Soul(insider_id=soul.insider_id, text=soul.text, soul=vector_str)
    db.add(db_soul)
    await db.commit()
    await db.refresh(db_soul)
    background_tasks.add_task(calculate_score_for_new_soul, db_soul.id)
    return db_soul


@api_router.get("/souls/{soul_id}", response_model=schemas.SoulRead)
async def read_soul(soul_id: int, db: AsyncSession = Depends(get_db)):
    soul_stmt = select(models.Soul).where(models.Soul.id == soul_id)
    soul_result = await db.execute(soul_stmt)
    soul = soul_result.scalar_one_or_none()
    if soul is None:
        raise HTTPException(status_code=404, detail="Soul not found")
    return soul


@api_router.post("/inquiries", status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    inquiry: schemas.InquiryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    query_vector = model.encode(inquiry.text)
    vector_str = json.dumps(query_vector.tolist())
    db_inquiry = models.Inquiry(
        text=inquiry.text,
        query=vector_str,
        client_id=inquiry.client_id,
        order_id=inquiry.order_id,
    )
    db.add(db_inquiry)
    await db.commit()
    await db.refresh(db_inquiry)

    background_tasks.add_task(calculate_scores_for_inquiry, db_inquiry.id)

    return {"message": "Inquiry received. Matching in progress...", "id": db_inquiry.id}


@api_router.get("/inquiries/{inquiry_id}", response_model=schemas.InquiryCreate)
async def read_inquiry(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    inquiry_stmt = select(models.Inquiry).where(models.Inquiry.id == inquiry_id)
    inquiry_result = await db.execute(inquiry_stmt)
    inquiry = inquiry_result.scalar_one_or_none()
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry


# @api_router.post("/test-scores", status_code=status.HTTP_200_OK)
# async def test_receiver(request: Request):
#     # 1. Parse the incoming JSON payload smoothly
#     payload = await request.json()
#     print("\n" + "=" * 50)
#     print("🚀 [TEST RECEIVER] INCOMING 3-KEY PAYLOAD:")
#     print(f"  Order ID:   {payload.get('order_id')}")
#     print(f"  Insider ID: {payload.get('insider_id')}")
#     print(f"  Score:      {payload.get('score')}")
#     print("=" * 50 + "\n")
#     # 3. Return a success confirmation to HTTPX
#     return {
#         "status": "received",
#         "captured_items_count": len(payload.get("top_matches", [])),
#     }


# Include All Routes
app.include_router(api_router, prefix="/api/v1")
