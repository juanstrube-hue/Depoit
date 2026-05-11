from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Contracts(Base):
    __tablename__ = "contracts"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    landlord_name = Column(String, nullable=False)
    landlord_email = Column(String, nullable=True)
    tenant_name = Column(String, nullable=False)
    tenant_email = Column(String, nullable=True)
    broker_name = Column(String, nullable=True)
    broker_email = Column(String, nullable=True)
    property_address = Column(String, nullable=False)
    property_city = Column(String, nullable=True)
    property_region = Column(String, nullable=True)
    property_type = Column(String, nullable=True)
    rent_amount = Column(Integer, nullable=False)
    deposit_amount = Column(Integer, nullable=False)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    status = Column(String, nullable=False)
    yield_generated = Column(Integer, nullable=True)
    signed_at = Column(String, nullable=True)
    deposit_received_at = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)