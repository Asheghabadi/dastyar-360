
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base # Import the shared Base

class EnterpriseProfile(Base):
    """Data model for the core identity of a business entity."""
    __tablename__ = 'enterprise_profile'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    national_id = Column(String(11), unique=True, nullable=False, index=True)
    economic_code = Column(String(14), unique=True, nullable=False)
    isic_code = Column(String(10), index=True) # International Standard Industrial Classification
    
    # This field will store sensitive tokens, encrypted at the application level.
    # Using Text to accommodate potentially long encrypted strings.
    encrypted_gov_tokens = Column(Text, nullable=True)

    users = relationship("User", back_populates="enterprise")

    def __repr__(self):
        return f"<EnterpriseProfile(name='{self.name}', national_id='{self.national_id}')>"


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    enterprise_id = Column(Integer, ForeignKey('enterprise_profile.id'))

    enterprise = relationship("EnterpriseProfile", back_populates="users")
