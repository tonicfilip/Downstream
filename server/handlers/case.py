from sqlalchemy.orm import Session
from models.case import Case
from models.step import Step
import os
import uuid
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_all(session: Session):
    cases = session.query(Case).all()
    return {"cases": [case.to_dict() for case in cases]}

def get_by_id(session: Session, id: int):
    case = session.query(Case).filter(Case.id == id).first()
    if not case:
        return {"error": "Case not found"}, 404
    return case.to_dict()

def create_case(session: Session, title: str, description: str = None):
    case = Case(title=title, description=description)
    session.add(case)
    session.commit()
    session.refresh(case)
    return case.to_dict()

def create_step(session: Session, case_id: int, title: str):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404
    # Set order to the next position
    max_order = session.query(Step).filter(Step.case_id == case_id).count()
    step = Step(case_id=case_id, title=title, order=max_order)
    session.add(step)
    session.commit()
    session.refresh(step)
    return case.to_dict()

def update_case(session: Session, case_id: int, description: str):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404
    case.description = description
    session.commit()
    session.refresh(case)
    return case.to_dict()

def update_step(session: Session, case_id: int, step_id: int, content: str):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404
    step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404
    step.content = content
    session.commit()
    session.refresh(step)
    return case.to_dict()

def upload_file(session: Session, case_id: int, step_id: int, file):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404

    step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404

    # Save file with unique name
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)

    # Update step with file reference
    step.fileId = unique_filename
    session.commit()
    session.refresh(step)

    return case.to_dict()

def download_file(session: Session, case_id: int, step_id: int, filename: str):
    from flask import send_from_directory

    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404

    step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404

    # Verify the file belongs to this step
    if step.fileId != filename:
        return {"error": "File not found"}, 404

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return {"error": "File not found"}, 404

    return send_from_directory(UPLOAD_FOLDER, filename)

def delete_case(session: Session, case_id: int):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404

    # Delete all files associated with this case's steps
    for step in case.steps:
        if step.fileId:
            filepath = os.path.join(UPLOAD_FOLDER, step.fileId)
            if os.path.exists(filepath):
                os.remove(filepath)

    # Delete the case (cascades to steps via foreign key)
    session.delete(case)
    session.commit()
    return {"success": True}

def delete_step(session: Session, case_id: int, step_id: int):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404

    step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404

    # Delete file if it exists
    if step.fileId:
        filepath = os.path.join(UPLOAD_FOLDER, step.fileId)
        if os.path.exists(filepath):
            os.remove(filepath)

    session.delete(step)
    session.commit()
    return case.to_dict()

def delete_file(session: Session, case_id: int, step_id: int, filename: str):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404

    step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404

    # Verify the file belongs to this step
    if step.fileId != filename:
        return {"error": "File not found"}, 404

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    step.fileId = None
    session.commit()
    session.refresh(step)
    return case.to_dict()

def rename_step(session: Session, case_id: int, step_id: int, title: str):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404

    step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404

    step.title = title
    session.commit()
    session.refresh(step)
    return case.to_dict()

def reorder_steps(session: Session, case_id: int, step_ids: list):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404

    # Update order for each step
    for new_order, step_id in enumerate(step_ids):
        step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
        if not step:
            return {"error": f"Step {step_id} not found"}, 404
        step.order = new_order

    session.commit()
    return case.to_dict()