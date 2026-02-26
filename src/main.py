from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import datetime
import subprocess
import json
import os

# Import our business logic and auth utilities
from src.logic_engine import LogicEngine
from src import auth, schemas

# Import our SQLAlchemy models and database session management
from src.models import identity, finance, watchdog, gantt, database
from src.models.database import SessionLocal, engine
from src.models.finance import TransactionType # Import the enum
from pydantic import BaseModel, EmailStr

# Create all tables in the database
# This will include the new CrawlerRunLog table
database.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dastyar 360 API",
    description="The backend API for the Dastyar 360 Business Assistant.",
    version="0.1.0"
)



# --- Dependencies ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



async def get_current_active_user(current_user: schemas.User = Depends(auth.get_current_user)) -> schemas.User:
    # In the future, we can add a check here to see if the user is active.
    return current_user

# --- API Endpoints ---

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(identity.User).filter(identity.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return auth.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
    return current_user

@app.post("/enterprises/", response_model=schemas.Enterprise)
def create_enterprise(enterprise: schemas.EnterpriseCreate, db: Session = Depends(get_db)):
    db_enterprise = db.query(identity.EnterpriseProfile).filter(identity.EnterpriseProfile.national_id == enterprise.national_id).first()
    if db_enterprise:
        raise HTTPException(status_code=400, detail="Enterprise with this National ID already registered.")
    new_enterprise = identity.EnterpriseProfile(**enterprise.dict())
    db.add(new_enterprise)
    db.commit()
    db.refresh(new_enterprise)
    return new_enterprise

@app.get("/enterprises/my", response_model=schemas.Enterprise)
def get_my_enterprise(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_enterprise = db.query(identity.EnterpriseProfile).filter(identity.EnterpriseProfile.id == current_user.enterprise_id).first()
    if not db_enterprise:
        raise HTTPException(status_code=404, detail="Enterprise not found for the current user.")
    return db_enterprise

@app.put("/enterprises/my", response_model=schemas.Enterprise)
def update_my_enterprise(enterprise_update: schemas.EnterpriseCreate, current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_enterprise = db.query(identity.EnterpriseProfile).filter(identity.EnterpriseProfile.id == current_user.enterprise_id).first()
    if not db_enterprise:
        raise HTTPException(status_code=404, detail="Enterprise not found for the current user.")
    
    update_data = enterprise_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_enterprise, key, value)
    
    db.add(db_enterprise)
    db.commit()
    db.refresh(db_enterprise)
    return db_enterprise

@app.post("/enterprises/my/transactions/", response_model=schemas.BankTransaction)
def create_bank_transaction(transaction: schemas.BankTransactionCreate, current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    new_transaction = finance.BankTransaction(**transaction.dict(), enterprise_id=current_user.enterprise_id)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@app.get("/enterprises/my/transactions/", response_model=List[schemas.BankTransaction])
def get_bank_transactions(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    transactions = db.query(finance.BankTransaction).filter(finance.BankTransaction.enterprise_id == current_user.enterprise_id).order_by(finance.BankTransaction.transaction_date.desc()).all()
    return transactions

@app.post("/enterprises/my/invoices/", response_model=schemas.TaxInvoice)
def create_tax_invoice(invoice: schemas.TaxInvoiceCreate, current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    new_invoice = finance.TaxInvoice(**invoice.dict(), enterprise_id=current_user.enterprise_id)
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return new_invoice

@app.delete("/enterprises/my/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction_for_user(transaction_id: int, current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    enterprise_id = current_user.enterprise_id
    db_transaction = db.query(finance.BankTransaction).filter(
        finance.BankTransaction.id == transaction_id, 
        finance.BankTransaction.enterprise_id == enterprise_id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found or access denied.")
        
    db.delete(db_transaction)
    db.commit()
    return

@app.delete("/enterprises/my/invoices/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice_for_user(invoice_id: int, current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    enterprise_id = current_user.enterprise_id
    db_invoice = db.query(finance.TaxInvoice).filter(
        finance.TaxInvoice.id == invoice_id, 
        finance.TaxInvoice.enterprise_id == enterprise_id
    ).first()
    
    if not db_invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found or access denied.")
        
    db.delete(db_invoice)
    db.commit()
    return

@app.put("/enterprises/my/transactions/{transaction_id}", response_model=schemas.BankTransaction)
def update_transaction_for_user(transaction_id: int, transaction_update: schemas.BankTransactionCreate, current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    enterprise_id = current_user.enterprise_id
    db_transaction = db.query(finance.BankTransaction).filter(
        finance.BankTransaction.id == transaction_id, 
        finance.BankTransaction.enterprise_id == enterprise_id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found or access denied.")

    for key, value in transaction_update.dict().items():
        setattr(db_transaction, key, value)
        
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.put("/enterprises/my/invoices/{invoice_id}", response_model=schemas.TaxInvoice)
def update_invoice_for_user(invoice_id: int, invoice_update: schemas.TaxInvoiceCreate, current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    enterprise_id = current_user.enterprise_id
    db_invoice = db.query(finance.TaxInvoice).filter(
        finance.TaxInvoice.id == invoice_id, 
        finance.TaxInvoice.enterprise_id == enterprise_id
    ).first()
    
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found or access denied.")

    for key, value in invoice_update.dict().items():
        setattr(db_invoice, key, value)
        
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.get("/enterprises/my/invoices/", response_model=List[schemas.TaxInvoice])
def get_tax_invoices(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    invoices = db.query(finance.TaxInvoice).filter(finance.TaxInvoice.enterprise_id == current_user.enterprise_id).order_by(finance.TaxInvoice.invoice_date.desc()).all()
    return invoices

# Example of a protected endpoint
@app.get("/enterprises/my/financial-alerts/", response_model=List[schemas.Alert])
def get_financial_alerts(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    enterprise_id = current_user.enterprise_id
    db_enterprise = db.query(identity.EnterpriseProfile).filter(identity.EnterpriseProfile.id == enterprise_id).first()
    if not db_enterprise:
        raise HTTPException(status_code=404, detail="Enterprise not found for the current user.")

    transactions = db.query(finance.BankTransaction).filter(finance.BankTransaction.enterprise_id == enterprise_id).all()
    invoices = db.query(finance.TaxInvoice).filter(finance.TaxInvoice.enterprise_id == enterprise_id).all()

    try:
        logic_engine = LogicEngine()
        # Pass the raw SQLAlchemy objects to the logic engine
        alerts = logic_engine.reconcile_transactions(transactions, invoices)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error in logic engine: {e}")

@app.get("/enterprises/my/gantt-chart/", response_model=List[schemas.LegalTask])
def get_gantt_chart_tasks(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Generates and returns a list of legal tasks for the Gantt chart based on the user's enterprise profile.
    """
    enterprise_id = current_user.enterprise_id
    db_enterprise = db.query(identity.EnterpriseProfile).filter(identity.EnterpriseProfile.id == enterprise_id).first()
    if not db_enterprise:
        raise HTTPException(status_code=404, detail="Enterprise not found for the current user.")

    # Check if tasks already exist for this enterprise
    existing_tasks = db.query(gantt.LegalTask).filter(gantt.LegalTask.enterprise_id == enterprise_id).all()
    if existing_tasks:
        return existing_tasks

    # If not, generate them
    try:
        logic_engine = LogicEngine()
        enterprise_profile_dict = {
            "scale": db_enterprise.scale,
            "activity_type": db_enterprise.activity_type
        }
        tasks_to_create = logic_engine.generate_legal_gantt_chart(enterprise_profile_dict)

        new_tasks = []
        for task_data in tasks_to_create:
            new_task = gantt.LegalTask(
                enterprise_id=enterprise_id,
                name=task_data["name"],
                start_date=datetime.datetime.strptime(task_data["start"], "%Y-%m-%d").date(),
                end_date=datetime.datetime.strptime(task_data["end"], "%Y-%m-%d").date(),
                progress=task_data["progress"],
                dependencies=task_data.get("dependencies", "")
            )
            new_tasks.append(new_task)
        
        db.add_all(new_tasks)
        db.commit()
        
        # Re-query to get the objects with IDs
        for task in new_tasks:
            db.refresh(task)
            
        return new_tasks
    except Exception as e:
        # Rollback in case of error
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal error in logic engine: {e}")


# ... (rest of the endpoints remain the same for now)


def run_and_process_crawler(crawler_name: str, output_file: str, model, db_session: Session):
    """
    A background task function to run a Scrapy crawler, process its output, and log the status.
    """
    # Log the start of the crawler run
    log_entry = db_session.query(watchdog.CrawlerRunLog).filter_by(crawler_name=crawler_name).first()
    if not log_entry:
        log_entry = watchdog.CrawlerRunLog(crawler_name=crawler_name)
        db_session.add(log_entry)
    
    log_entry.last_run_start = datetime.datetime.utcnow()
    log_entry.status = 'running'
    log_entry.details = None
    log_entry.items_added = 0
    db_session.commit()

    try:
        # Define paths
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        crawler_project_path = os.path.join(project_root, 'crawlers', 'dastyar_crawlers')
        output_path = os.path.join(crawler_project_path, output_file)

        # Ensure the output file from previous runs is deleted
        if os.path.exists(output_path):
            os.remove(output_path)

        # Run the Scrapy crawler
        subprocess.run(
            ['scrapy', 'crawl', crawler_name, '-o', output_path],
            cwd=crawler_project_path,
            check=True,
            capture_output=True,
            text=True
        )

        # Process the output file
        if not os.path.exists(output_path):
            raise FileNotFoundError("Crawler did not produce an output file.")

        with open(output_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        items_added = 0
        for item_data in data:
            # Simple check to avoid duplicates based on source_url
            exists = db_session.query(model).filter_by(source_url=item_data.get('source_url')).first()
            if not exists:
                new_item = model(**item_data)
                db_session.add(new_item)
                items_added += 1
        
        # Update log with success status
        log_entry.status = 'success'
        log_entry.items_added = items_added
        log_entry.details = f"Successfully added {items_added} new items."

    except subprocess.CalledProcessError as e:
        log_entry.status = 'failed'
        log_entry.details = f"Crawler process failed: {e.stderr[:500]}" # Truncate error
    except FileNotFoundError as e:
        log_entry.status = 'failed'
        log_entry.details = f"File error: {e}"
    except Exception as e:
        log_entry.status = 'failed'
        log_entry.details = f"An unexpected error occurred: {str(e)[:500]}"
        db_session.rollback() # Rollback item additions if commit fails
    finally:
        log_entry.last_run_finish = datetime.datetime.utcnow()
        db_session.commit()
        
        # Clean up the output file
        if 'output_path' in locals() and os.path.exists(output_path):
            os.remove(output_path)
        
        db_session.close()


@app.post("/watchdog/run-gazette-crawler/", status_code=202)
def trigger_gazette_crawler(background_tasks: BackgroundTasks):
    """
    Triggers the Official Gazette crawler as a background task.
    """
    db_session = SessionLocal() # Create a new session for the background task
    background_tasks.add_task(
        run_and_process_crawler, 
        'gazette', 
        'gazette_output.json', 
        watchdog.GazetteAnnouncement, 
        db_session
    )
    return {"message": "Official Gazette crawler has been triggered. Processing will happen in the background."}


@app.post("/watchdog/run-brand-crawler/", status_code=202)
def trigger_brand_crawler(background_tasks: BackgroundTasks):
    """
    Triggers the Trademark crawler as a background task.
    """
    db_session = SessionLocal() # Create a new session for the background task
    background_tasks.add_task(
        run_and_process_crawler, 
        'brand', 
        'brand_output.json', 
        watchdog.TrademarkRegistration, 
        db_session
    )
    return {"message": "Trademark crawler has been triggered. Processing will happen in the background."}


@app.get("/enterprises/my/brand-alerts/", response_model=List[schemas.Alert])
def get_brand_alerts(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Analyzes registered trademarks for similarities to the current user's enterprise brand and returns alerts.
    """
    enterprise_id = current_user.enterprise_id
    db_enterprise = db.query(identity.EnterpriseProfile).filter(identity.EnterpriseProfile.id == enterprise_id).first()
    if not db_enterprise:
        raise HTTPException(status_code=404, detail="Enterprise not found for the current user.")

    client_brand_name = db_enterprise.name

    new_trademarks = db.query(watchdog.TrademarkRegistration).all()

    trademarks_dict = [
        {
            "name": tm.name,
            "owner_name": tm.owner_name,
            "source_url": tm.source_url
        }
        for tm in new_trademarks
    ]

    try:
        logic_engine = LogicEngine()
        alerts = logic_engine.check_brand_similarity(client_brand_name, trademarks_dict)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error in logic engine: {e}")


@app.get("/watchdog/gazette-announcements/", response_model=List[schemas.GazetteAnnouncement])
def get_gazette_announcements(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Returns a list of all scraped gazette announcements.
    """
    announcements = db.query(watchdog.GazetteAnnouncement).order_by(watchdog.GazetteAnnouncement.id.desc()).all()
    return announcements

@app.get("/watchdog/trademark-registrations/", response_model=List[schemas.TrademarkRegistration])
def get_trademark_registrations(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Returns a list of all scraped trademark registrations.
    """
    trademarks = db.query(watchdog.TrademarkRegistration).order_by(watchdog.TrademarkRegistration.id.desc()).all()
    return trademarks

@app.get("/watchdog/status/", response_model=List[schemas.CrawlerRunLog])
def get_crawler_status(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Returns the status of all crawlers.
    """
    logs = db.query(watchdog.CrawlerRunLog).all()
    return logs
