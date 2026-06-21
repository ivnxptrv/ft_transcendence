import httpx
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query

# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, INTERACTION_URL
from app.schemas.purchase import PurchaseCreate, PurchaseRead
from app.schemas.transaction import TransactionCreate
from app import crud
from decimal import Decimal

router = APIRouter()


async def get_insight_data(insight_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{INTERACTION_URL}/api/v1/insights/{insight_id}")
        if response.status_code != 200:
            raise HTTPException(
                status_code=404, detail="Insight not found in Interaction service"
            )
        return response.json()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=PurchaseRead)
async def create_purchase(
    db: Annotated[AsyncSession, Depends(get_db)], data: PurchaseCreate
):
    insight_data = await get_insight_data(data.insight_id)
    price = Decimal(str(insight_data.get("price")))
    insider_id = insight_data.get("insider_id")

    if not insider_id:
        raise HTTPException(
            status_code=500, detail="Insider ID missing for this insight"
        )

    balance = await crud.get_balance(db, data.client_id)
    if Decimal(str(balance)) < price:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient funds. Balance: {balance}, Required: {price}",
        )

    try:
        async with httpx.AsyncClient() as client:
            reserve = await client.patch(
                f"{INTERACTION_URL}/api/v1/insights/{data.insight_id}",
                json={"is_paid": True, "transaction_id": None},
            )
            if reserve.status_code != 204:
                raise HTTPException(
                    status_code=409,
                    detail="Insight already purchased or cannot be reserved",
                )

        debit_tx = await crud.create_transaction(
            db, TransactionCreate(user_id=data.client_id, amount=-price)
        )
        txn_id = debit_tx.transaction_id

        await crud.create_transaction(
            db, TransactionCreate(user_id=insider_id, amount=price)
        )

        purchase = await crud.purchase.create_purchase(
            db,
            client_id=data.client_id,
            insider_id=insider_id,
            insight_id=data.insight_id,
            amount=price,
            transaction_id=txn_id,
        )

        await db.commit()
        await db.refresh(purchase)

        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{INTERACTION_URL}/api/v1/insights/{data.insight_id}",
                json={"is_paid": True, "transaction_id": txn_id},
            )

        return purchase

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{INTERACTION_URL}/api/v1/insights/{data.insight_id}",
                json={"is_paid": False, "transaction_id": None},
            )
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")


# For public API
@router.get("/{user_id}", response_model=list[PurchaseRead])
async def get_purchases(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: str,
    limit: Annotated[int, Query(ge=1, le=20)] = 20,
    offset: Annotated[int, Query(ge=0, le=10)] = 0,
):
    return await crud.purchase.get_purchases_by_user(db, user_id, limit, offset)
