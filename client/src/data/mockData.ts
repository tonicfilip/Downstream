import type { Case } from '../types';

export const MOCK_CASES: Case[] = [
    {
        "id": "case-001",
        "title": "Elektrana Nis 1",
        "steps": [
            {
                "id": "step-101",
                "title": "Identity Verification",
                "fileId": "id-scan-882.pdf",
                "content": "Verified passport and social security card.",
                "isCompleted": true
            },
            {
                "id": "step-102",
                "title": "Background Check",
                "fileId": null,
                "content": "Waiting for third-party clearing house response.",
                "isCompleted": false
            },
            {
                "id": "step-103",
                "title": "Contract Signing",
                "fileId": null,
                "content": "",
                "isCompleted": false
            }
        ]
    },
    {
        "id": "case-002",
        "title": "Elektrana Puturovce - manja",
        "steps": [
            {
                "id": "step-201",
                "title": "Initial Briefing",
                "fileId": "brief-v1.docx",
                "content": "Project scope involves internal restructuring.",
                "isCompleted": true
            },
            {
                "id": "step-202",
                "title": "Conflict of Interest Check",
                "fileId": "coi-form.pdf",
                "content": "No conflicts found within the executive board.",
                "isCompleted": true
            },
            {
                "id": "step-203",
                "title": "Final Compliance Approval",
                "fileId": null,
                "content": "Pending final signature from the Legal Director.",
                "isCompleted": false
            }
        ]
    },
    {
        "id": "case-003",
        "title": "Elektrana - sta li napisa Srbine",
        "steps": [
            {
                "id": "step-301",
                "title": "Equipment Listing",
                "fileId": null,
                "content": "",
                "isCompleted": false
            },
            {
                "id": "step-302",
                "title": "Vendor Selection",
                "fileId": null,
                "content": "",
                "isCompleted": false
            }
        ]
    }
]