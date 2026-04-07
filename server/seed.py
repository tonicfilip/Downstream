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

# Dummy data
dummy_cases = [
    {
        "title": "Q4 Audit Review",
        "description": "Complete financial audit for Q4 2024",
        "steps": [
            "Review financial statements",
            "Verify transactions",
            "Check compliance",
            "Generate audit report"
        ]
    },
    {
        "title": "Product Launch - Mobile App",
        "description": "Launch new mobile app to app stores",
        "steps": [
            "Final testing and QA",
            "App store submission",
            "Wait for approval",
            "Release to users",
            "Monitor crash reports"
        ]
    },
    {
        "title": "Client Onboarding - Acme Corp",
        "description": "Onboard new enterprise customer",
        "steps": [
            "Setup account and billing",
            "Configure integrations",
            "Train client team",
            "Go live",
            "Post-launch support"
        ]
    },
    {
        "title": "Infrastructure Migration",
        "description": "Migrate from AWS to GCP",
        "steps": [
            "Assess current infrastructure",
            "Plan migration strategy",
            "Setup GCP resources",
            "Migrate data",
            "Test and validate",
            "Cutover to production"
        ]
    },
    {
        "title": "Security Audit",
        "description": "Third-party security assessment",
        "steps": [
            "Vulnerability scanning",
            "Penetration testing",
            "Code review",
            "Risk assessment",
            "Remediation planning"
        ]
    }
]

# Create cases and steps
for case_data in dummy_cases:
    case = Case(
        title=case_data["title"],
        description=case_data["description"]
    )
    session.add(case)
    session.flush()  # Get the case ID

    for step_title in case_data["steps"]:
        step = Step(
            case_id=case.id,
            title=step_title
        )
        session.add(step)

session.commit()
print("✅ Dummy data created successfully!")
print(f"Created {len(dummy_cases)} cases with steps")
session.close()
