from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import date, datetime, timezone
import os
from typing import Any, Iterable

from supabase import Client, create_client

PROSPECT_STAGES = {
    "prospecting",
    "contacted",
    "replied",
    "audit_booked",
    "call_held",
    "proposal_sent",
    "won",
    "lost",
}
ACTIVITY_TYPES = {
    "cold_email",
    "follow_up_email",
    "phone_call",
    "linkedin_touch",
    "loom_audit",
    "workflow_audit",
    "partner_conversation",
    "proposal",
    "other",
}
TASK_STATUSES = {"todo", "doing", "done"}
EMAIL_APPROVAL_STATUSES = {
    "draft",
    "approved",
    "rejected",
    "sending",
    "sent",
    "failed",
}
EMAIL_APPROVAL_ACTIVITY_TYPES = {"cold_email", "follow_up_email"}
OUTBOUND_ACTIVITY_TYPES = {
    "cold_email",
    "follow_up_email",
    "phone_call",
    "linkedin_touch",
    "loom_audit",
}
BOOKED_STAGES = {"audit_booked", "call_held", "proposal_sent", "won"}
QUALIFIED_STAGES = {"call_held", "proposal_sent", "won"}


def build_dashboard_snapshot(
    prospects: Iterable[dict[str, Any]],
    activities: Iterable[dict[str, Any]],
    tasks: Iterable[dict[str, Any]],
    today: date | None = None,
) -> dict[str, Any]:
    current_day = (today or date.today()).isoformat()
    prospect_rows = list(prospects)
    activity_rows = list(activities)
    task_rows = list(tasks)
    stage_counts = Counter(row["stage"] for row in prospect_rows)
    today_activity_counts = Counter(
        row["activity_type"]
        for row in activity_rows
        if row["occurred_on"] == current_day
    )

    due_follow_ups = [
        {
            "id": row["id"],
            "company_name": row["company_name"],
            "next_follow_up_date": row["next_follow_up_date"],
            "stage": row["stage"],
        }
        for row in prospect_rows
        if row.get("next_follow_up_date")
        and row["next_follow_up_date"] <= current_day
        and row["stage"] not in {"won", "lost"}
    ]
    open_tasks = [
        {
            "id": row["id"],
            "title": row["title"],
            "week_number": row["week_number"],
            "status": row["status"],
            "due_date": row.get("due_date"),
        }
        for row in task_rows
        if row["status"] != "done"
    ]

    return {
        "as_of": current_day,
        "metrics": {
            "outbound_touches": sum(
                row["activity_type"] in OUTBOUND_ACTIVITY_TYPES
                for row in activity_rows
            ),
            "qualified_calls": sum(
                row["stage"] in QUALIFIED_STAGES for row in prospect_rows
            ),
            "paying_clients": stage_counts["won"],
            "partner_conversations": sum(
                row["activity_type"] == "partner_conversation"
                for row in activity_rows
            ),
            "booked_calls": sum(
                row["stage"] in BOOKED_STAGES for row in prospect_rows
            ),
            "proposals": stage_counts["proposal_sent"] + stage_counts["won"],
        },
        "pipeline": dict(stage_counts),
        "today_activity": dict(today_activity_counts),
        "due_follow_ups": sorted(
            due_follow_ups,
            key=lambda row: (row["next_follow_up_date"], row["company_name"]),
        ),
        "open_tasks": sorted(
            open_tasks,
            key=lambda row: (
                row["due_date"] is None,
                row["due_date"] or "",
                row["week_number"],
                row["title"],
            ),
        ),
    }


@dataclass(frozen=True)
class DashboardSettings:
    supabase_url: str
    supabase_key: str
    email: str
    password: str

    @classmethod
    def from_env(cls) -> "DashboardSettings":
        values = {
            "VITE_SUPABASE_URL": os.getenv("VITE_SUPABASE_URL"),
            "VITE_SUPABASE_PUBLISHABLE_KEY": os.getenv(
                "VITE_SUPABASE_PUBLISHABLE_KEY"
            ),
            "DASHBOARD_EMAIL": os.getenv("DASHBOARD_EMAIL"),
            "DASHBOARD_PASSWORD": os.getenv("DASHBOARD_PASSWORD"),
        }
        missing = [name for name, value in values.items() if not value]
        if missing:
            joined_names = ", ".join(missing)
            raise RuntimeError(f"Missing dashboard agent environment variables: {joined_names}")

        return cls(
            supabase_url=values["VITE_SUPABASE_URL"] or "",
            supabase_key=values["VITE_SUPABASE_PUBLISHABLE_KEY"] or "",
            email=values["DASHBOARD_EMAIL"] or "",
            password=values["DASHBOARD_PASSWORD"] or "",
        )


class SupabaseDashboardStore:
    def __init__(self, client: Client) -> None:
        self.client = client

    @classmethod
    def from_env(cls) -> "SupabaseDashboardStore":
        settings = DashboardSettings.from_env()
        client = create_client(settings.supabase_url, settings.supabase_key)
        client.auth.sign_in_with_password(
            {"email": settings.email, "password": settings.password}
        )
        return cls(client)

    def snapshot(self) -> dict[str, Any]:
        prospects = (
            self.client.table("prospects")
            .select("*")
            .order("created_at", desc=True)
            .execute()
            .data
        )
        activities = (
            self.client.table("outreach_activities")
            .select("*")
            .order("occurred_on", desc=True)
            .execute()
            .data
        )
        tasks = (
            self.client.table("sprint_tasks")
            .select("*")
            .order("week_number")
            .order("created_at")
            .execute()
            .data
        )
        return build_dashboard_snapshot(prospects, activities, tasks)

    def list_prospects(
        self, stage: str | None = None, company_query: str | None = None
    ) -> list[dict[str, Any]]:
        query = (
            self.client.table("prospects")
            .select(
                "id,company_name,market,decision_maker,email,stage,"
                "next_follow_up_date,notes"
            )
            .order("updated_at", desc=True)
            .limit(25)
        )
        if stage:
            query = query.eq("stage", stage)
        if company_query:
            query = query.ilike("company_name", f"%{company_query}%")
        return query.execute().data

    def add_prospect(self, values: dict[str, Any]) -> dict[str, Any]:
        return self.client.table("prospects").insert(values).execute().data[0]

    def update_prospect(
        self,
        prospect_id: str,
        stage: str | None = None,
        next_follow_up_date: str | None = None,
        notes: str | None = None,
    ) -> dict[str, Any]:
        values: dict[str, Any] = {}
        if stage:
            values["stage"] = stage
        if next_follow_up_date:
            values["next_follow_up_date"] = next_follow_up_date
        if notes:
            values["notes"] = notes
        values["updated_at"] = datetime.now(timezone.utc).isoformat()
        rows = (
            self.client.table("prospects")
            .update(values)
            .eq("id", prospect_id)
            .execute()
            .data
        )
        if not rows:
            raise RuntimeError(f"No prospect found for id {prospect_id}.")
        return rows[0]

    def log_activity(self, values: dict[str, Any]) -> dict[str, Any]:
        return (
            self.client.table("outreach_activities").insert(values).execute().data[0]
        )

    def list_email_approvals(
        self, status: str | None = None
    ) -> list[dict[str, Any]]:
        query = (
            self.client.table("email_approvals")
            .select(
                "id,prospect_id,recipient_email,subject,body,activity_type,"
                "status,approved_at,sent_at,last_error,created_at"
            )
            .order("created_at", desc=True)
            .limit(25)
        )
        if status:
            query = query.eq("status", status)
        return query.execute().data

    def add_email_approval(self, values: dict[str, Any]) -> dict[str, Any]:
        return self.client.table("email_approvals").insert(values).execute().data[0]

    def update_email_approval(
        self, approval_id: str, values: dict[str, Any], expected_status: str | None = None
    ) -> dict[str, Any]:
        query = self.client.table("email_approvals").update(
            {
                **values,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("id", approval_id)
        if expected_status:
            query = query.eq("status", expected_status)
        rows = query.execute().data
        if not rows:
            expected = f" in {expected_status}" if expected_status else ""
            raise RuntimeError(f"No email approval{expected} found for id {approval_id}.")
        return rows[0]

    def list_tasks(
        self, week_number: int | None = None, status: str | None = None
    ) -> list[dict[str, Any]]:
        query = (
            self.client.table("sprint_tasks")
            .select("id,week_number,title,status,due_date,notes")
            .order("week_number")
            .order("created_at")
        )
        if week_number:
            query = query.eq("week_number", week_number)
        if status:
            query = query.eq("status", status)
        return query.execute().data

    def add_task(self, values: dict[str, Any]) -> dict[str, Any]:
        return self.client.table("sprint_tasks").insert(values).execute().data[0]

    def update_task_status(self, task_id: str, status: str) -> dict[str, Any]:
        rows = (
            self.client.table("sprint_tasks")
            .update({"status": status})
            .eq("id", task_id)
            .execute()
            .data
        )
        if not rows:
            raise RuntimeError(f"No sprint task found for id {task_id}.")
        return rows[0]


def validate_choice(value: str, choices: set[str], label: str) -> str:
    if value not in choices:
        allowed = ", ".join(sorted(choices))
        raise ValueError(f"Invalid {label} '{value}'. Expected one of: {allowed}.")
    return value
