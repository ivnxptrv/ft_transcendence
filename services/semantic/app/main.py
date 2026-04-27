from fastapi import FastAPI, Depends
from app.api.v1.api import api_router
from app.middlewares.logging import ProcessTimeMiddleware
from . import models, schemas
from .database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Identity Service API",
    description="Microservice for User Registration and Authentication",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",  # You can even change the URL!
)

# Add Middleware
app.add_middleware(ProcessTimeMiddleware)

# Include All Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "up"}


import yaml


@app.on_event("startup")
def save_openapi_yaml():
    with open("contract.yml", "w") as f:
        yaml.dump(app.openapi(), f, sort_keys=False)
        
def get_db():
    db = SessionLocal()
try:
	yield db
	finally:
		db.close()
          
@app.post("/soul", response_model=schemas.SoulRead)
def create_soul(soul: schemas.SoulCreate, db: Session = Depends(get_db)):
    db_soul = models.Soul(bio_essay=soul.bio_essay)
    db.add(db_soul)
    db.commit()
    db.refresh(db_soul)
    return db_soul

        

