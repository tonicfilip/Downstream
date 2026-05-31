import type { Case } from '../types';

export const MOCK_CASES: Case[] = [
    {
        "id": 1,
        "title": "Elektrana Nis 1",
        "steps": [
            {
                "id": 101,
                "case_id": 1,
                "title": "Identity Verification",
                "fileIds": ["id-scan-882.pdf"],
                "content": "Verified passport and social security card.",
                "isCompleted": true,
                "order": 0
            },
            {
                "id": 102,
                "case_id": 1,
                "title": "Background Check",
                "fileIds": null,
                "content": "Waiting for third-party clearing house response.",
                "isCompleted": false,
                "order": 1
            },
            {
                "id": 103,
                "case_id": 1,
                "title": "Contract Signing",
                "fileIds": null,
                "content": "",
                "isCompleted": false,
                "order": 2
            }
        ]
    },
    {
        "id": 2,
        "title": "Elektrana Puturovce - manja",
        "steps": [
            {
                "id": 201,
                "case_id": 2,
                "title": "Initial Briefing",
                "fileIds": ["brief-v1.docx"],
                "content": "Project scope involves internal restructuring.",
                "isCompleted": true,
                "order": 0
            },
            {
                "id": 202,
                "case_id": 2,
                "title": "Conflict of Interest Check",
                "fileIds": ["coi-form.pdf"],
                "content": "No conflicts found within the executive board.",
                "isCompleted": true,
                "order": 1
            },
            {
                "id": 203,
                "case_id": 2,
                "title": "Final Compliance Approval",
                "fileIds": null,
                "content": "Pending final signature from the Legal Director.",
                "isCompleted": false,
                "order": 2
            }
        ]
    },
    {
        "id": 3,
        "title": "Elektrana - sta li napisa Srbine",
        "steps": [
            {
                "id": 301,
                "case_id": 3,
                "title": "Equipment Listing",
                "fileIds": null,
                "content": "",
                "isCompleted": false,
                "order": 0
            },
            {
                "id": 302,
                "case_id": 3,
                "title": "Vendor Selection",
                "fileIds": null,
                "content": "",
                "isCompleted": false,
                "order": 1
            }
        ]
    }
]