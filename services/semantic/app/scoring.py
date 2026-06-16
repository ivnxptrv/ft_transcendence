import json
import httpx
import numpy as np
from sqlalchemy import select
from sentence_transformers import util

import app.models as models
from app.database import SessionLocal
from app.config import INTERACTION_URL

import os


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
