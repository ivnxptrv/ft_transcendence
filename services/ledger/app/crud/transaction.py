from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.models.transaction import Transaction
from app import schemas

async def get_by_id(db: AsyncSession, tx_id: int) -> Optional[Transaction]:
    result = await db.execute(select(Transaction).where(Transaction.id == tx_id))
    return result.scalar_one_or_none()

async def get_by_request_id(db: AsyncSession, request_id: str) -> Optional[Transaction]:
    result = await db.execute(select(Transaction).where(Transaction.request_id == request_id))
    return result.scalar_one_or_none()

async def list_all(
    db: AsyncSession, 
    account_id: Optional[str] = None, 
    start_date: Optional[datetime] = None, 
    tx_type: Optional[str] = None
) -> List[Transaction]:
    query = select(Transaction)
    if account_id:
        query = query.where(Transaction.account_id == account_id)
    if start_date:
        query = query.where(Transaction.created_at >= start_date)
    if tx_type:
        query = query.where(Transaction.transaction_type == tx_type)
    
    result = await db.execute(query)
    return list(result.scalars().all())

async def calculate_balance(db: AsyncSession, account_id: str) -> float:
    query = select(
        func.sum(
            case(
                (Transaction.transaction_type == "credit", Transaction.amount),
                (Transaction.transaction_type == "debit", -Transaction.amount),
                else_=0.0
            )
        )
    ).where(Transaction.account_id == account_id)
    
    result = await db.execute(query)
    return float(result.scalar() or 0.0)

async def account_has_history(db: AsyncSession, account_id: str) -> bool:
    count_check = await db.execute(
        select(func.count(Transaction.id)).where(Transaction.account_id == account_id)
    )
    return count_check.scalar() > 0

async def create(db: AsyncSession, data: schemas.TransactionCreate) -> Transaction:
    new_tx = Transaction(**data.model_dump())
    db.add(new_tx)
    return new_tx