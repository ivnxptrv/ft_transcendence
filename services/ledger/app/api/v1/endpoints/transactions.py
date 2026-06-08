# from datetime import datetime
# from typing import List, Optional
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.database import get_db
# from app import schemas, crud

# router = APIRouter()

# @router.get("/", response_model=List[schemas.Transaction])
# async def list_transactions(
#     account_id: Optional[str] = None, 
#     start_date: Optional[datetime] = None, 
#     tx_type: Optional[str] = None, 
#     db: AsyncSession = Depends(get_db)
# ):
#     return await crud.transaction.list_all(db, account_id, start_date, tx_type)

# @router.post("/", response_model=schemas.Transaction)
# async def create_transaction(data: schemas.TransactionCreate, db: AsyncSession = Depends(get_db)):
#     if data.amount <= 0:
#         raise HTTPException(status_code=400, detail="Amount must be greater than zero")
    
#     # RESTORE THIS IDEMPOTENCY CHECK BLOCK:
#     if await crud.transaction.get_by_request_id(db, data.request_id):
#         raise HTTPException(status_code=409, detail="Transaction already processed")

#     async with db.begin():
#         if data.transaction_type == "debit":
#             current_balance = await crud.transaction.calculate_balance(db, data.account_id)
#             if current_balance < data.amount:
#                 raise HTTPException(status_code=400, detail=f"Insufficient funds")
        
#         new_tx = await crud.transaction.create(db, data)
    
#     await db.refresh(new_tx)
#     return new_tx

# @router.get("/{tx_id}", response_model=schemas.Transaction)
# async def get_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
#     tx = await crud.transaction.get_by_id(db, tx_id)
#     if not tx:
#         raise HTTPException(status_code=404, detail="Transaction not found")
#     return tx

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app import schemas, crud

router = APIRouter()

@router.get("/", response_model=List[schemas.Transaction])
async def list_transactions(
    account_id: Optional[str] = None, 
    start_date: Optional[datetime] = None, 
    tx_type: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    return await crud.transaction.list_all(db, account_id, start_date, tx_type)

@router.post("/", response_model=schemas.Transaction)
async def create_transaction(data: schemas.TransactionCreate, db: AsyncSession = Depends(get_db)):
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")
    
    # Idempotency check block
    if await crud.transaction.get_by_request_id(db, data.request_id):
        raise HTTPException(status_code=409, detail="Transaction already processed")

    # 🛑 REMOVED: async with db.begin(): 
    # Operations now run directly on the transaction context provided by get_db
    if data.transaction_type == "debit":
        current_balance = await crud.transaction.calculate_balance(db, data.account_id)
        if current_balance < data.amount:
            raise HTTPException(status_code=400, detail="Insufficient funds")
    
    new_tx = await crud.transaction.create(db, data)
    
    # 🌟 Push changes to the staging layer so Postgres assigns an ID before refresh
    await db.flush() 
    await db.refresh(new_tx)
    return new_tx

@router.get("/{tx_id}", response_model=schemas.Transaction)
async def get_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
    tx = await crud.transaction.get_by_id(db, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx