import logging

from typing import Literal


from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.data.transactions_repository import (
    cancel_transaction,
    create_transaction,
    get_transaction,
    list_transactions,
    
)
from app.dependencies import get_current_admin
from app.schemas.transactions import (
    TransactionCancel,
    TransactionCreate,
    TransactionResponse,
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["transactions"])


def _raise_transaction_error(exc: Exception) -> None:
    logger.exception("Error registrando operación inmobiliaria: %s", exc)

    message = str(exc)
    lowered = message.lower()

    if (
        "property not found" in lowered
        or "propiedad no encontrada" in lowered
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada",
        ) from exc

    if (
        "not available" in lowered
        or "no está disponible" in lowered
        or "active transaction" in lowered
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La propiedad ya tiene una operación activa",
        ) from exc

    if "does not match property operation" in lowered:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "El tipo de operación no coincide con la propiedad. "
                "Una propiedad en venta debe marcarse como vendida y "
                "una propiedad en renta debe marcarse como rentada."
            ),
        ) from exc

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"No se pudo registrar la operación: {message}",
    ) from exc

@router.post(
    "/properties/{property_id}/mark-sold",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def mark_property_as_sold(
    property_id: str,
    payload: TransactionCreate,
    current_user: dict = Depends(get_current_admin),
) -> dict:
    try:
        return create_transaction(property_id, "sale", payload, current_user["id"])
    except Exception as exc:
        _raise_transaction_error(exc)


@router.post(
    "/properties/{property_id}/mark-rented",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def mark_property_as_rented(
    property_id: str,
    payload: TransactionCreate,
    current_user: dict = Depends(get_current_admin),
) -> dict:
    try:
        return create_transaction(property_id, "rent", payload, current_user["id"])
    except Exception as exc:
        _raise_transaction_error(exc)


@router.get("/transactions", response_model=list[TransactionResponse])
def get_all_transactions(
    transaction_type: Literal["sale", "rent"] | None = Query(
        default=None, alias="transactionType"
    ),
    transaction_status: Literal["active", "cancelled"] | None = Query(
        default=None, alias="status"
    ),
    current_user: dict = Depends(get_current_admin),
) -> list[dict]:
    return list_transactions(
        transaction_type=transaction_type, status=transaction_status
    )


@router.get("/transactions/sales", response_model=list[TransactionResponse])
def get_sales_history(current_user: dict = Depends(get_current_admin)) -> list[dict]:
    return list_transactions(transaction_type="sale")


@router.get("/transactions/rents", response_model=list[TransactionResponse])
def get_rents_history(current_user: dict = Depends(get_current_admin)) -> list[dict]:
    return list_transactions(transaction_type="rent")


@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction_by_id(
    transaction_id: str,
    current_user: dict = Depends(get_current_admin),
) -> dict:
    transaction = get_transaction(transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Operación no encontrada"
        )
    return transaction


@router.patch(
    "/transactions/{transaction_id}/cancel", response_model=TransactionResponse
)
def cancel_transaction_endpoint(
    transaction_id: str,
    payload: TransactionCancel,
    current_user: dict = Depends(get_current_admin),
) -> dict:
    try:
        transaction = cancel_transaction(
            transaction_id, current_user["id"], payload.reason
        )
    except Exception as exc:
        message = str(exc).lower()
        if "already cancelled" in message or "ya está cancelada" in message:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La operación ya está cancelada",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo cancelar la operación",
        ) from exc
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Operación no encontrada"
        )
    return transaction
