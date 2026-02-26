from pydantic import BaseModel, EmailStr
import datetime
from src.models.finance import TransactionType

# --- User & Auth Schemas ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: EmailStr
    enterprise_id: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: EmailStr | None = None

# --- Enterprise Schemas ---

class EnterpriseCreate(BaseModel):
    name: str
    national_id: str
    registration_id: str
    scale_name: str
    ceo_name: str
    ceo_national_id: str
    address: str

class Enterprise(EnterpriseCreate):
    id: int
    class Config:
        orm_mode = True

# --- Alert & Task Schemas ---

class AlertCTA(BaseModel):
    text: str
    type: str
    target: str

class Alert(BaseModel):
    alert_id: str
    title: str
    summary: str
    crisis_level: str
    legal_reference: str
    financial_impact_usd: float
    call_to_action_button: AlertCTA
    source: str

class GanttTask(BaseModel):
    task_id: str
    title: str
    responsible_body: str
    due_date: datetime.date
    status: str

# --- Finance Schemas ---

class BankTransactionCreate(BaseModel):
    enterprise_id: int
    amount: int
    date: datetime.date
    ref_id: str
    description: str
    type: TransactionType

class BankTransaction(BankTransactionCreate):
    id: int
    class Config:
        orm_mode = True

class TaxInvoiceCreate(BaseModel):
    enterprise_id: int
    amount: int
    tax_id: str
    date: datetime.date
    description: str

class TaxInvoice(TaxInvoiceCreate):
    id: int
    class Config:
        orm_mode = True

class GazetteAnnouncement(BaseModel):
    id: int
    title: str
    date: str
    source_url: str
    content_hash: str

    class Config:
        orm_mode = True

class class TrademarkRegistration(BaseModel):
    id: int
    name: str
    owner_name: str
    source_url: str

    class Config:
        orm_mode = True

class CrawlerRunLog(BaseModel):
    crawler_name: str
    last_run_start: Optional[datetime.datetime] = None
    last_run_finish: Optional[datetime.datetime] = None
    status: Optional[str] = None
    items_added: Optional[int] = None
    details: Optional[str] = None

    class Config:
        orm_mode = True
