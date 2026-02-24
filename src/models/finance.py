
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, BigInteger, Enum
from sqlalchemy.orm import relationship
import datetime
import enum

from src.models.database import Base # Import the shared Base
from src.models.identity import EnterpriseProfile # Import the related model

# Enum for transaction type for better data integrity
class TransactionType(enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"

class BankTransaction(Base):
    "Data model for a single bank transaction."
    __tablename__ = 'bank_transactions'

    id = Column(Integer, primary_key=True)
    enterprise_id = Column(Integer, ForeignKey('enterprise_profile.id'), nullable=False, index=True)
    amount = Column(BigInteger, nullable=False) # Storing as integer (e.g., in Rials) to avoid floating point issues
    transaction_date = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    description = Column(String(512))
    reference_id = Column(String(255), unique=True) # Unique ID from the bank
    type = Column(Enum(TransactionType), nullable=False, default=TransactionType.DEPOSIT)

    # Relationship to the EnterpriseProfile
    enterprise = relationship("EnterpriseProfile")

    def __repr__(self):
        return f"<BankTransaction(amount={self.amount}, date='{self.transaction_date}')>"

class TaxInvoice(Base):
    "Data model for an invoice from the national tax system."
    __tablename__ = 'tax_invoices'

    id = Column(Integer, primary_key=True)
    enterprise_id = Column(Integer, ForeignKey('enterprise_profile.id'), nullable=False, index=True)
    amount = Column(BigInteger, nullable=False)
    issue_date = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    tax_id = Column(String(22), unique=True, nullable=False, index=True) # Unique ID from tax authority
    buyer_national_id = Column(String(11))

    enterprise = relationship("EnterpriseProfile")

    def __repr__(self):
        return f"<TaxInvoice(tax_id='{self.tax_id}', amount={self.amount})>"
