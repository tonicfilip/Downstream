from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, create_engine, ARRAY, UUID
from sqlalchemy.orm import DeclarativeBase, relationship
from models.base import Base

engine = create_engine("postgresql://filip:1234@localhost:5432/downstream", echo=True)

class Step(Base):
    __tablename__ = "steps"

    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("cases.id")) # The link
    title = Column(String(100), nullable=False)
    content = Column(String(1000), nullable=True, default="")
    fileIds = Column(ARRAY(String), nullable=True)
    isCompleted = Column(Boolean, nullable=False, default=False)
    order = Column(Integer, nullable=False, default=0)
    owner = relationship("Case", back_populates="steps")

    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "title": self.title,
            "content": self.content,
            "fileIds": self.fileIds,
            "isCompleted": self.isCompleted,
            "order": self.order,
        }
