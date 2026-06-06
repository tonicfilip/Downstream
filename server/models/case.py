from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, relationship
from models.step import Step
from models.base import Base
from config import get_database_url

engine = create_engine(get_database_url(), echo=True)

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    steps = relationship("Step", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Case {self.title}>"

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "steps": [step.to_dict() for step in sorted(self.steps, key=lambda s: s.order)]
        }