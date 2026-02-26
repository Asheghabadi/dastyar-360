from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

# Import schemas and DB models
from src import schemas
from src.models import identity
from src.models.database import SessionLocal

# --- Configuration ---
SECRET_KEY = "YOUR_VERY_SECRET_KEY_CHANGE_THIS"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(db: Session, email: str):
    return db.query(identity.User).filter(identity.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # Create a new, empty enterprise for this user
    # The user will fill in the details during the onboarding process
    new_enterprise = identity.EnterpriseProfile(
        name=f"بنگاه کاربر {user.email}", # Placeholder name
        national_id="", # To be filled in during onboarding
        registration_id="",
        scale_name="Small", # Default value
        ceo_name="",
        ceo_national_id="",
        address=""
    )
    db.add(new_enterprise)
    db.flush() # Use flush to get the ID of the new enterprise before committing

    hashed_password = get_password_hash(user.password)
    db_user = identity.User(
        email=user.email, 
        hashed_password=hashed_password, 
        enterprise_id=new_enterprise.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> identity.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user
