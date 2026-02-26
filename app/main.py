from fastapi import FastAPI
# Use absolute imports starting from the 'app' package root
from app.database import Base, engine
from app.identity.main import router as identity_router
from app.tax_fin.main import router as tax_fin_router
from app.watchdog.main import router as watchdog_router
from app.dynamic_roadmap.main import router as dynamic_roadmap_router

# This part remains the same
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dastyar 360 API")

app.include_router(identity_router, prefix="/api", tags=["Identity"])
app.include_router(tax_fin_router, prefix="/api", tags=["Tax & Fin"])
app.include_router(watchdog_router, prefix="/api", tags=["Watchdog"])
app.include_router(dynamic_roadmap_router, prefix="/api", tags=["Dynamic Roadmap"])

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the 360 Business Assistant API"}
