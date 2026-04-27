from fastapi import FastAPI, Depends, BackgroundTasks
from app.api.v1.api import api_router
from app.middlewares.logging import ProcessTimeMiddleware
from . import models, schemas
from .database import engine, SessionLocal
from sqlalchemy.orm import Session


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


def calculate_scores_for_inquiry(inquiry_id: int):
    db = SessionLocal()
    try:
        inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
        souls = db.query(models.Soul).all()

        for soul in souls:
            
            if any(word in soul.bio_essay.lower() for word in inquiry.query_text.lower().split()):
                score_val = 0.9 #change score value based on matching logic

            new_score = models.Score(
                inquiry_id=inquiry.id,
                soul_id=soul.id,
                value=score_val
            )
            db.add(new_score)
        
        db.commit()
    finally:
        db.close()

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

@app.post("/inquiries")
def create_inquiry(
    inquiry: schemas.InquiryCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    db_inquiry = models.Inquiry(query_text=inquiry.query_text)
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)

    background_tasks.add_task(calculate_scores_for_inquiry, db_inquiry.id)

    return {"message": "Inquiry received. Matching in progress...", "id": db_inquiry.id}

        

@app.get("/scores/{inquiry_id}")
def get_scores(inquiry_id: int, db: Session = Depends(get_db)):
    scores = db.query(models.Score).filter(models.Score.inquiry_id == inquiry_id).all()
    return scores