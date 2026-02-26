
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# In a real application, this would come from a config file
DATABASE_URL = "sqlite:///:memory:" # Using in-memory for tests

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is the single, shared Base for all models in the project
Base = declarative_base()
