import json
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from services.guarantee_deductions import GuaranteeDeductionsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/guarantee_deductions", tags=["guarantee_deductions"])

VALID_CATEGORIES = {"limpieza", "pintura", "daño estructural", "equipamiento", "servicios pendientes", "otro"}


# ── Pydantic Schemas ────────────────────────────────────────────────────────

class GuaranteeDeductionData(BaseModel):
    contract_id: int
    category: str
    title: str
    description: Optional[str] = None
    requested_amount: int

    @field_validator("requested_amount")
    @classmethod
    def positive_amount(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("El monto debe ser mayor a cero")
        return v

    @field_validator("category")
    @classmethod
    def valid_category(cls, v: str) -> str:
        if v.lower() not in VALID_CATEGORIES:
            raise ValueError(f"Categoría inválida. Válidas: {VALID_CATEGORIES}")
        return v.lower()


class GuaranteeDeductionUpdateData(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    requested_amount: Optional[int] = None


class GuaranteeDeductionResponse(BaseModel):
    id: int
    contract_id: int
    created_by: str
    category: str
    title: str
    description: Optional[str] = None
    requested_amount: int
    agreed_amount: Optional[int] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GuaranteeDeductionListResponse(BaseModel):
    items: List[GuaranteeDeductionResponse]
    total: int
    skip: int
    limit: int


class GuaranteeDeductionFileResponse(BaseModel):
    id: int
    deduction_id: int
    file_url: str
    file_type: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GuaranteeDeductionEventResponse(BaseModel):
    id: int
    deduction_id: int
    user_id: str
    event_type: str
    previous_amount: Optional[int] = None
    proposed_amount: Optional[int] = None
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AcceptRequest(BaseModel):
    pass


class RejectRequest(BaseModel):
    comment: Optional[str] = None


class CounterProposeRequest(BaseModel):
    new_amount: int
    comment: Optional[str] = None

    @field_validator("new_amount")
    @classmethod
    def positive_amount(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("El monto debe ser mayor a cero")
        return v


class AddFileRequest(BaseModel):
    file_url: str
    file_type: Optional[str] = None


class ApprovedTotalResponse(BaseModel):
    contract_id: int
    approved_total: int


# ── CRUD Routes ─────────────────────────────────────────────────────────────

@router.get("", response_model=GuaranteeDeductionListResponse)
async def list_guarantee_deductions(
    query: str = Query(None),
    sort: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    try:
        query_dict = json.loads(query) if query else None
        return await service.get_list(
            skip=skip, limit=limit, query_dict=query_dict, sort=sort,
            user_id=str(current_user.id),
        )
    except Exception as e:
        logger.error(f"Error listing guarantee_deductions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all", response_model=GuaranteeDeductionListResponse)
async def list_guarantee_deductions_all(
    query: str = Query(None),
    sort: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    try:
        query_dict = json.loads(query) if query else None
        return await service.get_list(skip=skip, limit=limit, query_dict=query_dict, sort=sort)
    except Exception as e:
        logger.error(f"Error listing all guarantee_deductions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}", response_model=GuaranteeDeductionResponse)
async def get_guarantee_deduction(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    obj = await service.get_by_id(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Descuento garantía no encontrado")
    return obj


@router.post("", response_model=GuaranteeDeductionResponse, status_code=201)
async def create_guarantee_deduction(
    data: GuaranteeDeductionData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    try:
        return await service.create(data.model_dump(), user_id=str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating guarantee_deduction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}", response_model=GuaranteeDeductionResponse)
async def update_guarantee_deduction(
    id: int,
    data: GuaranteeDeductionUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    obj = await service.update(id, update_dict)
    if not obj:
        raise HTTPException(status_code=404, detail="Descuento garantía no encontrado")
    return obj


@router.delete("/{id}")
async def delete_guarantee_deduction(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    success = await service.delete(id)
    if not success:
        raise HTTPException(status_code=404, detail="Descuento garantía no encontrado")
    return {"message": "Descuento garantía eliminado", "id": id}


# ── Negotiation Actions ─────────────────────────────────────────────────────

@router.post("/{id}/accept", response_model=GuaranteeDeductionResponse)
async def accept_deduction(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    try:
        return await service.accept(id, user_id=str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error accepting deduction {id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{id}/reject", response_model=GuaranteeDeductionResponse)
async def reject_deduction(
    id: int,
    data: RejectRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    try:
        return await service.reject(id, user_id=str(current_user.id), comment=data.comment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error rejecting deduction {id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{id}/counter_propose", response_model=GuaranteeDeductionResponse)
async def counter_propose(
    id: int,
    data: CounterProposeRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    try:
        return await service.counter_propose(
            id, user_id=str(current_user.id), new_amount=data.new_amount, comment=data.comment
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error counter-proposing deduction {id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{id}/cancel", response_model=GuaranteeDeductionResponse)
async def cancel_deduction(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    try:
        return await service.cancel(id, user_id=str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error cancelling deduction {id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── Files ───────────────────────────────────────────────────────────────────

@router.get("/{id}/files", response_model=List[GuaranteeDeductionFileResponse])
async def get_files(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    return await service.get_files(id)


@router.post("/{id}/files", response_model=GuaranteeDeductionFileResponse, status_code=201)
async def add_file(
    id: int,
    data: AddFileRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    try:
        return await service.add_file(id, file_url=data.file_url, file_type=data.file_type)
    except Exception as e:
        logger.error(f"Error adding file to deduction {id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── Events / Timeline ────────────────────────────────────────────────────────

@router.get("/{id}/events", response_model=List[GuaranteeDeductionEventResponse])
async def get_events(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    return await service.get_events(id)


# ── Integration: approved total for returns ─────────────────────────────────

@router.get("/contract/{contract_id}/approved_total", response_model=ApprovedTotalResponse)
async def approved_total(
    contract_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuaranteeDeductionsService(db)
    total = await service.get_approved_total(contract_id)
    return {"contract_id": contract_id, "approved_total": total}
