from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Deposit_returns(Base):
    __tablename__ = "deposit_returns"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    contract_id = Column(Integer, nullable=False)
    amount_returned = Column(Integer, nullable=False)
    total_deductions = Column(Integer, nullable=True)
    status = Column(String, nullable=False)
    initiated_by = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)