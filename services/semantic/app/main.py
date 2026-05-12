from fastapi import FastAPI, Depends, BackgroundTasks
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.middlewares.logging import ProcessTimeMiddleware
from . import models, schemas
from .database import engine, SessionLocal
from sqlalchemy.orm import Session

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

# Include All Routes
app.include_router(api_router, prefix="/api/v1")


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


async def calculate_scores_for_inquiry(inquiry_id: int):
    async with SessionLocal() as db:
        try:
            inquiry_stmt = select(models.Inquiry).where(models.Inquiry.id == inquiry_id)
            inquiry_result = await db.execute(inquiry_stmt)
            inquiry = inquiry_result.scalar_one_or_none()

            if not inquiry:
                return

            soul_stmt = select(models.Soul)
            soul_result = await db.execute(soul_stmt)
            souls = soul_result.scalars().all()

            for soul in souls:
                score_val = 0.0
                if any(word in soul.bio_essay.lower() for word in inquiry.query_text.lower().split()):
                    score_val = 0.9

                new_score = models.Score(
                    inquiry_id=inquiry.id,
                    soul_id=soul.id,
                    value=score_val
                )
                db.add(new_score)
            
            await db.commit()
        except Exception as e:
            print(f"Error in scoring task: {e}")
            await db.rollback()

@app.on_event("startup")
def save_openapi_yaml():
    with open("contract.yml", "w") as f:
        yaml.dump(app.openapi(), f, sort_keys=False)
        
# async def get_db():
# 	db = SessionLocal()
# 	try:
# 		yield db
# 	finally:
# 		await db.close()
          
@app.post("/soul", response_model=schemas.SoulRead)
async def create_soul(soul: schemas.SoulCreate, db: Session = Depends(get_db)):
    db_soul = models.Soul(bio_essay=soul.bio_essay)
    db.add(db_soul)
    await db.commit()
    await db.refresh(db_soul)
    return db_soul

@app.post("/inquiries")
async def create_inquiry(
    inquiry: schemas.InquiryCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    db_inquiry = models.Inquiry(query_text=inquiry.query_text)
    db.add(db_inquiry)
    await db.commit()
    await db.refresh(db_inquiry)

    background_tasks.add_task(calculate_scores_for_inquiry, db_inquiry.id)

    return {"message": "Inquiry received. Matching in progress...", "id": db_inquiry.id}

        

@app.get("/scores/{inquiry_id}")
def get_scores(inquiry_id: int, db: Session = Depends(get_db)):
    scores = db.query(models.Score).filter(models.Score.inquiry_id == inquiry_id).all()
    return scores