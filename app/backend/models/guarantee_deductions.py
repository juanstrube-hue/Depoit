from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey


class GuaranteeDeduction(Base):
    __tablename__ = "guarantee_deductions"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    contract_id = Column(Integer, nullable=False)
    created_by = Column(String, nullable=False)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    requested_amount = Column(Integer, nullable=False)
    agreed_amount = Column(Integer, nullable=True)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)


class GuaranteeDeductionFile(Base):
    __tablename__ = "guarantee_deduction_files"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    deduction_id = Column(Integer, nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)


class GuaranteeDeductionEvent(Base):
    __tablename__ = "guarantee_deduction_events"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    deduction_id = Column(Integer, nullable=False)
    user_id = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    previous_amount = Column(Integer, nullable=True)
    proposed_amount = Column(Integer, nullable=True)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
