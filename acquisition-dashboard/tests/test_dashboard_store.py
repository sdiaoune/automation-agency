from datetime import date

import pytest

from dashboard_store import build_dashboard_snapshot, validate_choice
from office365_mail import send_approved_emails


def test_snapshot_matches_dashboard_metrics() -> None:
    snapshot = build_dashboard_snapshot(
        prospects=[
            {
                "id": "alpha",
                "company_name": "Alpha",
                "next_follow_up_date": "2026-05-21",
                "stage": "contacted",
            },
            {
                "id": "beta",
                "company_name": "Beta",
                "next_follow_up_date": "2026-05-22",
                "stage": "proposal_sent",
            },
            {
                "id": "gamma",
                "company_name": "Gamma",
                "next_follow_up_date": "2026-05-20",
                "stage": "won",
            },
        ],
        activities=[
            {"activity_type": "cold_email", "occurred_on": "2026-05-22"},
            {"activity_type": "partner_conversation", "occurred_on": "2026-05-22"},
            {"activity_type": "workflow_audit", "occurred_on": "2026-05-21"},
        ],
        tasks=[
            {
                "id": "done",
                "title": "Finished",
                "week_number": 1,
                "status": "done",
                "due_date": "2026-05-20",
            },
            {
                "id": "next",
                "title": "Next",
                "week_number": 2,
                "status": "todo",
                "due_date": "2026-05-22",
            },
        ],
        today=date(2026, 5, 22),
    )

    assert snapshot["metrics"] == {
        "booked_calls": 2,
        "outbound_touches": 1,
        "partner_conversations": 1,
        "paying_clients": 1,
        "proposals": 2,
        "qualified_calls": 2,
    }
    assert [row["id"] for row in snapshot["due_follow_ups"]] == ["alpha", "beta"]
    assert snapshot["today_activity"] == {
        "cold_email": 1,
        "partner_conversation": 1,
    }
    assert [row["id"] for row in snapshot["open_tasks"]] == ["next"]


def test_invalid_dashboard_choice_is_rejected() -> None:
    with pytest.raises(ValueError, match="Invalid task status"):
        validate_choice("skipped", {"todo", "done"}, "task status")


class FakeApprovalStore:
    def __init__(self) -> None:
        self.approvals = [
            {
                "id": "approval",
                "activity_type": "cold_email",
                "body": "Hello",
                "prospect_id": "alpha",
                "recipient_email": "leasing@example.com",
                "status": "approved",
                "subject": "Missed leasing calls",
            }
        ]
        self.activity = None

    def list_email_approvals(self, status=None):
        return [row for row in self.approvals if not status or row["status"] == status]

    def update_email_approval(self, approval_id, values, expected_status=None):
        row = self.approvals[0]
        assert approval_id == row["id"]
        assert not expected_status or row["status"] == expected_status
        row.update(values)
        return row

    def log_activity(self, values):
        self.activity = values
        return values


class FakeMailSender:
    def __init__(self) -> None:
        self.message = None

    def send_message(self, recipient_email, subject, body):
        self.message = (recipient_email, subject, body)


def test_sender_processes_only_approved_email_rows() -> None:
    store = FakeApprovalStore()
    sender = FakeMailSender()

    counts = send_approved_emails(store, sender)

    assert counts == {"failed": 0, "sent": 1}
    assert sender.message == ("leasing@example.com", "Missed leasing calls", "Hello")
    assert store.approvals[0]["status"] == "sent"
    assert store.activity == {
        "activity_type": "cold_email",
        "occurred_on": store.approvals[0]["sent_at"][:10],
        "outcome": "sent",
        "notes": "Sent from approved Office 365 queue: Missed leasing calls",
        "prospect_id": "alpha",
    }
