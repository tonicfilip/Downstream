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
                {"title": "Ugovor o izradi studije izvodljivosti", "content": ""}, 
                {"title": "Profaktura za placanje izrade studije", "content": ""}, 
                {"title": "Dokaz o uplati", "content": ""}, 
                {"title": "Studija", "content": ""}, 
                {"title": "Pregled u Nisu", "content": ""}, 
                {"title": "Pregled u Beogradu", "content": ""}, 
                {"title": "Potpis u Beogradu", "content": ""}, 
                {"title": "Zapisnik o primopredaji", "content": ""}, 
                {"title": "UPP", "content": ""}, 
                {"title": "Profaktura za placanje UPP", "content": ""}, {"title": "Dokaz o uplati", "content": ""}, 
                {"title": "UPP", "content": ""}, {"title": "Pregled u Nisu", "content": ""}, 
                {"title": "Pregled u Beogradu", "content": ""}, {"title": "Potpis u Beogradu", "content": ""}, 
                {"title": "Zavesti predmet i predati", "content": ""}, {"title": "ROP", "content": ""}, 
                {"title": "Resenje", "content": ""}, {"title": "Pregled u Nisu", "content": ""}, 
                {"title": "Pregled u Beogradu", "content": ""}, {"title": "Potpis u Beogradu", "content": ""}, 
                {"title": "Zavesti predmet i predati", "content": ""}, {"title": "UGP", "content": ""}, 
                {"title": "Ugovor", "content": ""}, {"title": "Potpis u Beogradu", "content": ""}, 
                {"title": "Zavesti predmet i predati", "content": ""}, {"title": "PZ", "content": ""}, 
                {"title": "PZ", "content": ""}, {"title": "Pregled u Nisu", "content": ""}, 
                {"title": "Pregled u Beogradu", "content": ""}, {"title": "Zavesti predmet i predati", "content": ""}, 
                {"title": "Zahtev za ITP", "content": ""}, 
                {"title": "Resenje komisije za ITP", "content": ""}, 
                {"title": "Potpis u Nisu", "content": ""}, {"title": "Potpis u Beogradu", "content": ""}, 
                {"title": "Zavesti predmet i predati", "content": ""}, 
                {"title": "ITP", "content": ""}, {"title": "Zavesti predmet", "content": ""}, 
                {"title": "Resenje o probnom radu", "content": ""}, 
                {"title": "Potpis u Nisu", "content": ""}, 
                {"title": "Potpis u Beogradu", "content": ""}, 
                {"title": "Nalog za vezivanje", "content": ""}, 
                {"title": "Potpis u Nisu", "content": ""}, 
                {"title": "Potpis u Beogradu", "content": ""}, 
                {"title": "Pustanje u rad", "content": ""}
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
