from sqlalchemy.orm import sessionmaker
from models.case import engine, Case
from models.step import Step
from models.base import Base

# Create all tables
Base.metadata.create_all(engine)

# Create session
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

# Clear existing data
session.query(Step).delete()
session.query(Case).delete()
session.commit()

# Shared steps list - every case will have these exact steps
shared_steps = [
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

# Dummy data - cases with dynamic titles but same steps
dummy_cases = [
    {
        "title": "Q4 Audit Review",
    }
]

# Create cases and steps
for case_data in dummy_cases:
    case = Case(
        title=case_data["title"]
    )
    session.add(case)
    session.flush()  # Get the case ID

    for order, step_data in enumerate(shared_steps):
        step = Step(
            case_id=case.id,
            title=step_data["title"],
            content=step_data["content"],
            order=order
        )
        session.add(step)

session.commit()
print("✅ Dummy data created successfully!")
print(f"Created {len(dummy_cases)} cases with steps")
session.close()
