import json
from fastapi import APIRouter, Depends, BackgroundTasks, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import app.models as models
from app.schemas import SoulCreate, SoulRead, InquiryCreate, InquiryRead
from app.database import get_db
from app.scoring import calculate_score_for_new_soul, calculate_scores_for_inquiry
from app.config import MODEL

router = APIRouter()

@router.post("/souls", response_model=SoulRead, status_code=status.HTTP_201_CREATED)
async def create_soul(
    soul: SoulCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    soul_embedding = MODEL.encode(soul.text)
    vector_str = json.dumps(soul_embedding.tolist())
    
    db_soul = models.Soul(insider_id=soul.insider_id, text=soul.text, soul=vector_str)
    db.add(db_soul)
    await db.commit()
    await db.refresh(db_soul)
    
    background_tasks.add_task(calculate_score_for_new_soul, db_soul.id)
    return db_soul


@router.get("/souls/{soul_id}", response_model=SoulRead)
async def read_soul(soul_id: int, db: AsyncSession = Depends(get_db)):
    soul_stmt = select(models.Soul).where(models.Soul.id == soul_id)
    soul_result = await db.execute(soul_stmt)
    soul = soul_result.scalar_one_or_none()
    if soul is None:
        raise HTTPException(status_code=404, detail="Soul not found")
    return soul


@router.post("/inquiries", status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    inquiry: InquiryCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    query_vector = MODEL.encode(inquiry.text)
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


@router.get("/inquiries/{inquiry_id}", response_model=InquiryRead)
async def read_inquiry(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    inquiry_stmt = select(models.Inquiry).where(models.Inquiry.id == inquiry_id)
    inquiry_result = await db.execute(inquiry_stmt)
    inquiry = inquiry_result.scalar_one_or_none()
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry
