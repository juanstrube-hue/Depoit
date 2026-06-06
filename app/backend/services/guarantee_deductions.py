import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.guarantee_deductions import GuaranteeDeduction, GuaranteeDeductionFile, GuaranteeDeductionEvent

logger = logging.getLogger(__name__)

VALID_STATUSES = {"pending", "negotiating", "approved", "rejected", "cancelled"}
VALID_TRANSITIONS = {
    "pending": {"negotiating", "approved", "rejected", "cancelled"},
    "negotiating": {"approved", "rejected", "cancelled"},
    "approved": set(),
    "rejected": set(),
    "cancelled": set(),
}


class GuaranteeDeductionsService:

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Deductions ─────────────────────────────────────────────────────────

    async def create(self, data: Dict[str, Any], user_id: str) -> GuaranteeDeduction:
        try:
            data["created_by"] = user_id
            data.setdefault("status", "pending")
            obj = GuaranteeDeduction(**data)
            self.db.add(obj)
            await self.db.flush()

            event = GuaranteeDeductionEvent(
                deduction_id=obj.id,
                user_id=user_id,
                event_type="created",
                proposed_amount=obj.requested_amount,
                comment="Propuesta creada",
            )
            self.db.add(event)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created guarantee_deduction id={obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating guarantee_deduction: {e}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[GuaranteeDeduction]:
        result = await self.db.execute(
            select(GuaranteeDeduction).where(GuaranteeDeduction.id == obj_id)
        )
        return result.scalar_one_or_none()

    async def get_list(
        self,
        skip: int = 0,
        limit: int = 20,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        try:
            q = select(GuaranteeDeduction)
            cq = select(func.count(GuaranteeDeduction.id))

            if user_id:
                q = q.where(GuaranteeDeduction.created_by == user_id)
                cq = cq.where(GuaranteeDeduction.created_by == user_id)

            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(GuaranteeDeduction, field):
                        q = q.where(getattr(GuaranteeDeduction, field) == value)
                        cq = cq.where(getattr(GuaranteeDeduction, field) == value)

            total = (await self.db.execute(cq)).scalar()

            if sort:
                field_name = sort.lstrip("-")
                if hasattr(GuaranteeDeduction, field_name):
                    col = getattr(GuaranteeDeduction, field_name)
                    q = q.order_by(col.desc() if sort.startswith("-") else col)
            else:
                q = q.order_by(GuaranteeDeduction.id.desc())

            items = (await self.db.execute(q.offset(skip).limit(limit))).scalars().all()
            return {"items": items, "total": total, "skip": skip, "limit": limit}
        except Exception as e:
            logger.error(f"Error listing guarantee_deductions: {e}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[GuaranteeDeduction]:
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key not in ("id", "created_by", "created_at"):
                    setattr(obj, key, value)
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating guarantee_deduction {obj_id}: {e}")
            raise

    async def delete(self, obj_id: int) -> bool:
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                return False
            await self.db.delete(obj)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting guarantee_deduction {obj_id}: {e}")
            raise

    # ── Negotiation actions ─────────────────────────────────────────────────

    async def accept(self, obj_id: int, user_id: str) -> GuaranteeDeduction:
        obj = await self.get_by_id(obj_id)
        if not obj:
            raise ValueError("Descuento no encontrado")
        if obj.status not in ("pending", "negotiating"):
            raise ValueError(f"No se puede aceptar desde estado '{obj.status}'")
        try:
            current_amount = obj.agreed_amount or obj.requested_amount
            obj.status = "approved"
            obj.agreed_amount = current_amount
            event = GuaranteeDeductionEvent(
                deduction_id=obj_id,
                user_id=user_id,
                event_type="accepted",
                previous_amount=current_amount,
                proposed_amount=current_amount,
                comment="Propuesta aceptada",
            )
            self.db.add(event)
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            await self.db.rollback()
            raise

    async def reject(self, obj_id: int, user_id: str, comment: Optional[str] = None) -> GuaranteeDeduction:
        obj = await self.get_by_id(obj_id)
        if not obj:
            raise ValueError("Descuento no encontrado")
        if obj.status not in ("pending", "negotiating"):
            raise ValueError(f"No se puede rechazar desde estado '{obj.status}'")
        try:
            obj.status = "rejected"
            event = GuaranteeDeductionEvent(
                deduction_id=obj_id,
                user_id=user_id,
                event_type="rejected",
                comment=comment or "Propuesta rechazada",
            )
            self.db.add(event)
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            await self.db.rollback()
            raise

    async def counter_propose(
        self, obj_id: int, user_id: str, new_amount: int, comment: Optional[str] = None
    ) -> GuaranteeDeduction:
        obj = await self.get_by_id(obj_id)
        if not obj:
            raise ValueError("Descuento no encontrado")
        if obj.status not in ("pending", "negotiating"):
            raise ValueError(f"No se puede contraofertar desde estado '{obj.status}'")
        if new_amount <= 0:
            raise ValueError("El monto debe ser mayor a cero")
        try:
            previous = obj.agreed_amount or obj.requested_amount
            obj.status = "negotiating"
            obj.agreed_amount = new_amount
            event = GuaranteeDeductionEvent(
                deduction_id=obj_id,
                user_id=user_id,
                event_type="counter_proposed",
                previous_amount=previous,
                proposed_amount=new_amount,
                comment=comment or "Contrapropuesta enviada",
            )
            self.db.add(event)
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            await self.db.rollback()
            raise

    async def cancel(self, obj_id: int, user_id: str) -> GuaranteeDeduction:
        obj = await self.get_by_id(obj_id)
        if not obj:
            raise ValueError("Descuento no encontrado")
        if obj.status in ("approved", "rejected", "cancelled"):
            raise ValueError(f"No se puede cancelar desde estado '{obj.status}'")
        try:
            obj.status = "cancelled"
            event = GuaranteeDeductionEvent(
                deduction_id=obj_id,
                user_id=user_id,
                event_type="cancelled",
                comment="Propuesta cancelada",
            )
            self.db.add(event)
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            await self.db.rollback()
            raise

    # ── Files ───────────────────────────────────────────────────────────────

    async def add_file(self, deduction_id: int, file_url: str, file_type: Optional[str] = None) -> GuaranteeDeductionFile:
        try:
            f = GuaranteeDeductionFile(deduction_id=deduction_id, file_url=file_url, file_type=file_type)
            self.db.add(f)
            await self.db.commit()
            await self.db.refresh(f)
            return f
        except Exception as e:
            await self.db.rollback()
            raise

    async def get_files(self, deduction_id: int) -> List[GuaranteeDeductionFile]:
        result = await self.db.execute(
            select(GuaranteeDeductionFile).where(GuaranteeDeductionFile.deduction_id == deduction_id)
        )
        return result.scalars().all()

    # ── Events ──────────────────────────────────────────────────────────────

    async def get_events(self, deduction_id: int) -> List[GuaranteeDeductionEvent]:
        result = await self.db.execute(
            select(GuaranteeDeductionEvent)
            .where(GuaranteeDeductionEvent.deduction_id == deduction_id)
            .order_by(GuaranteeDeductionEvent.created_at.asc())
        )
        return result.scalars().all()

    # ── Approved total for a contract ───────────────────────────────────────

    async def get_approved_total(self, contract_id: int) -> int:
        result = await self.db.execute(
            select(func.coalesce(func.sum(GuaranteeDeduction.agreed_amount), 0)).where(
                GuaranteeDeduction.contract_id == contract_id,
                GuaranteeDeduction.status == "approved",
            )
        )
        return result.scalar() or 0
