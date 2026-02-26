from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from src.models.database import Base

class GazetteAnnouncement(Base):
    """Data model for an announcement scraped from the Official Gazette."""
    __tablename__ = 'gazette_announcements'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(Date)
    announcement_type = Column(String)
    content = Column(Text)
    source_url = Column(String, unique=True)

    def __repr__(self):
        return f"<GazetteAnnouncement(title='{self.title}', date='{self.date}')>"

class TrademarkRegistration(Base):
    """Data model for a trademark scraped from the Intellectual Property Center."""
    __tablename__ = 'trademark_registrations'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    registration_number = Column(String, unique=True, nullable=False)
    owner_name = Column(String, index=True)
    status = Column(String)
    date = Column(Date)
    source_url = Column(String)

    def __repr__(self):
        return f"<TrademarkRegistration(name='{self.name}', owner='{self.owner_name}')>"

class CrawlerRunLog(Base):
    __tablename__ = 'crawler_run_logs'
    crawler_name = Column(String, primary_key=True, index=True)
    last_run_start = Column(DateTime, server_default=func.now())
    last_run_finish = Column(DateTime)
    status = Column(String) # e.g., 'running', 'success', 'failed'
    items_added = Column(Integer, default=0)
    details = Column(String, nullable=True)
