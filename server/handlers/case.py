from sqlalchemy.orm import Session
from models.case import Case
from models.step import Step
import os
import uuid
from werkzeug.utils import secure_filename
from flask import g
from storage.r2 import download_file as r2_download_file, upload_file as r2_upload_file

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "docx", "xlsx", "xls", "txt"}
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

# Shared steps list - every case will have these exact steps
SHARED_STEPS = [
    {"title": "Ugovor o izradi studije izvodljivosti", "content": "Prepare and sign the contract for feasibility study"},
    {"title": "Profaktura za placanje izrade studije", "content": "Create proforma invoice for feasibility study payment"},
    {"title": "Dokaz o uplati", "content": "Upload proof of payment"},
    {"title": "Studija", "content": "Complete the feasibility study"},
    {"title": "Pregled u Nisu", "content": "Review in Nis"},
    {"title": "Pregled u Beogradu", "content": "Review in Belgrade"},
    {"title": "Potpis u Beogradu", "content": "Sign in Belgrade"},
    {"title": "Zapisnik o primopredaji", "content": "Handover report"},
    {"title": "UPP", "content": "UPP documentation"},
    {"title": "Profaktura za placanje UPP", "content": "Proforma invoice for UPP payment"},
    {"title": "Dokaz o uplati", "content": "Upload proof of payment"},
    {"title": "UPP", "content": "UPP phase completion"},
    {"title": "Pregled u Nisu", "content": "Review in Nis"},
    {"title": "Pregled u Beogradu", "content": "Review in Belgrade"},
    {"title": "Potpis u Beogradu", "content": "Sign in Belgrade"},
    {"title": "Zavesti predmet i predati", "content": "Register and submit case"},
    {"title": "ROP", "content": "ROP phase"},
    {"title": "Resenje", "content": "Decision document"},
    {"title": "Pregled u Nisu", "content": "Review in Nis"},
    {"title": "Pregled u Beogradu", "content": "Review in Belgrade"},
    {"title": "Potpis u Beogradu", "content": "Sign in Belgrade"},
    {"title": "Zavesti predmet i predati", "content": "Register and submit case"},
    {"title": "UGP", "content": "UGP phase"},
    {"title": "Ugovor", "content": "Contract agreement"},
    {"title": "Potpis u Beogradu", "content": "Sign in Belgrade"},
    {"title": "Zavesti predmet i predati", "content": "Register and submit case"},
    {"title": "PZ", "content": "PZ phase initial"},
    {"title": "PZ", "content": "PZ phase continuation"},
    {"title": "Pregled u Nisu", "content": "Review in Nis"},
    {"title": "Pregled u Beogradu", "content": "Review in Belgrade"},
    {"title": "Zavesti predmet i predati", "content": "Register and submit case"},
    {"title": "Zahtev za ITP", "content": "Request for ITP"},
    {"title": "Resenje komisije za ITP", "content": "ITP commission decision"},
    {"title": "Potpis u Nisu", "content": "Sign in Nis"},
    {"title": "Potpis u Beogradu", "content": "Sign in Belgrade"},
    {"title": "Zavesti predmet i predati", "content": "Register and submit case"},
    {"title": "ITP", "content": "ITP phase"},
    {"title": "Zavesti predmet", "content": "Register case"},
    {"title": "Resenje o probnom radu", "content": "Trial period decision"},
    {"title": "Potpis u Nisu", "content": "Sign in Nis"},
    {"title": "Potpis u Beogradu", "content": "Sign in Belgrade"},
    {"title": "Nalog za vezivanje", "content": "Binding order"},
    {"title": "Potpis u Nisu", "content": "Sign in Nis"},
    {"title": "Potpis u Beogradu", "content": "Sign in Belgrade"},
    {"title": "Pustanje u rad", "content": "Release to operation"},
]

def get_all(session: Session):
    cases = session.query(Case).all()
    return {"cases": [case.to_dict() for case in cases]}

def get_by_id(session: Session, id: int):
    case = session.query(Case).filter(Case.id == id).first()
    if not case:
        return {"error": "Case not found"}, 404
    return case.to_dict()

def create_case(session: Session, title: str):
    case = Case(title=title)
    session.add(case)
    session.commit()
    session.refresh(case)
    
    # Add all shared steps to the new case
    for order, step_data in enumerate(SHARED_STEPS):
        step = Step(
            case_id=case.id,
            title=step_data["title"],
            content=step_data["content"],
            order=order
        )
        session.add(step)
    
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

def update_step(session: Session, case_id: int, step_id: int, content: str, is_completed: bool = None):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404
    step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404
    step.content = content
    if is_completed is not None:
        step.isCompleted = is_completed
    session.commit()
    session.refresh(step)
    return case.to_dict()

# def upload_file(session: Session, case_id: int, step_id: int, file):
#     case = session.query(Case).filter(Case.id == case_id).first()
#     if not case:
#         return {"error": "Case not found"}, 404

#     step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
#     if not step:
#         return {"error": "Step not found"}, 404

#     # Save file with unique name
#     filename = secure_filename(file.filename)
#     unique_filename = f"{uuid.uuid4()}_{filename}"
#     filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
#     file.save(filepath)

#     # Update step with file reference
#     step.fileId = unique_filename
#     session.commit()
#     session.refresh(step)

#     return case.to_dict()

# def download_file(session: Session, case_id: int, step_id: int, filename: str):
#     from flask import send_from_directory

#     case = session.query(Case).filter(Case.id == case_id).first()
#     if not case:
#         return {"error": "Case not found"}, 404

#     step = session.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
#     if not step:
#         return {"error": "Step not found"}, 404

#     # Verify the file belongs to this step
#     if step.fileId != filename:
#         return {"error": "File not found"}, 404

#     filepath = os.path.join(UPLOAD_FOLDER, filename)
#     if not os.path.exists(filepath):
#         return {"error": "File not found"}, 404

#     return send_from_directory(UPLOAD_FOLDER, filename)

def upload_file_handler(db, case_id, step_id, file):
    # Validate extension
    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        return {"error": f"File type .{ext} not allowed"}, 400

    # Validate size
    file.seek(0, 2)  # seek to end
    size = file.tell()
    file.seek(0)     # reset
    if size > MAX_SIZE_BYTES:
        return {"error": "File exceeds 50MB limit"}, 400

    # Generate UUID for the file
    file_id = uuid.uuid4()

    # Store with a namespaced key: case/{case_id}/step/{step_id}/{file_id}_{filename}
    key = f"case/{case_id}/step/{step_id}/{file_id}_{filename}"
    r2_upload_file(file, key)

    step = db.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404

    # Append full R2 key to fileIds array
    if step.fileIds is None:
        step.fileIds = [key]
    else:
        step.fileIds.append(key)

    db.commit()
    db.refresh(step)

    case = db.query(Case).filter(Case.id == case_id).first()
    return case.to_dict(), 201

def download_file_handler(db, case_id, step_id, filename):
    step = db.query(Step).filter(Step.id == step_id, Step.case_id == case_id).first()
    if not step:
        return {"error": "Step not found"}, 404

    # filename parameter is expected to be part of the key, use it to find the full key
    if not step.fileIds:
        return {"error": "No files found"}, 404

    # Find the key that matches the filename
    matching_key = None
    for key in step.fileIds:
        if filename in key:
            matching_key = key
            break

    if not matching_key:
        return {"error": "File not found"}, 404

    url = r2_download_file(matching_key)
    return {"url": url}, 200


def delete_file_handler(db, case_id, step_id, filename):
    key = f"case/{case_id}/step/{step_id}/{filename}"
    delete_file(key)
    return {"deleted": filename}, 200

def delete_case(session: Session, case_id: int):
    case = session.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}, 404

    # Delete all files associated with this case's steps from R2
    for step in case.steps:
        if step.fileIds:
            for file_id in step.fileIds:
                key = f"case/{case_id}/step/{step.id}/{file_id}_*"
                # Note: R2 deletion needs the exact key, so we'd need to track filenames
                # For now, files will be orphaned in R2

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

    # Delete files from R2 if they exist
    if step.fileIds:
        for file_id in step.fileIds:
            # Files are stored as case/{case_id}/step/{step_id}/{file_id}_*
            # We'd need the full filename to delete; for now files are orphaned
            pass

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

    # Find and remove the key that matches filename
    if step.fileIds:
        matching_key = None
        for key in step.fileIds:
            if filename in key:
                matching_key = key
                break

        if matching_key:
            step.fileIds.remove(matching_key)
            session.commit()
            session.refresh(step)
            return case.to_dict()

    return {"error": "File not found"}, 404

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