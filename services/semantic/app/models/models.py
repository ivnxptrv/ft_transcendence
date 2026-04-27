from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Soul(Base):
	__tablename__ = "souls"

	id = Column(Integer, primary_key=True, index=True)
	bio_text = Column(Text, nullable=True)
	credibility_score = Column(Float, nullable=True, default=0.0)

	scores = relationship("Score", back_populates="soul")

class Inquiry(Base):
	__tablename__ = "inquiries"

	id = Column(Integer, primary_key=True, index=True)
	inquiry_text = Column(Text, nullable=False)

	scores = relationship("Score", back_populates="inquiry")

class Score(Base):
	__tablename__ = "scores"

	id = Column(Integer, primary_key=True, index=True)
	soul_id = Column(Integer, ForeignKey("souls.id"), nullable=False)
	inquiry_id = Column(Integer, ForeignKey("inquiries.id"), nullable=False)
	score_value = Column(Float, nullable=False)

	soul = relationship("Soul", back_populates="scores")
	inquiry = relationship("Inquiry", back_populates="scores")