from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from src.models.database import Base

class TaskStatus(enum.Enum):
    pending = "Pending"
    completed = "Completed"
    overdue = "Overdue"

class LegalTask(Base):
    """Data model for a legal/regulatory task assigned to an enterprise."""
    __tablename__ = 'legal_tasks'

    id = Column(Integer, primary_key=True, index=True)
    enterprise_id = Column(Integer, ForeignKey('enterprise_profile.id'))
    task_id = Column(String, index=True)
    title = Column(String)
    responsible_body = Column(String)
    due_date = Column(Date)
    status = Column(Enum(TaskStatus), default=TaskStatus.pending)

    enterprise = relationship("EnterpriseProfile")

    def __repr__(self):
        return f"<LegalTask(title='{self.title}', due_date='{self.due_date}', status='{self.status.value}')>"
