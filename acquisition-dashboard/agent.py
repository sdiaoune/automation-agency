from __future__ import annotations

from functools import cache
import json
from typing import Annotated

from agents import Agent, Runner, function_tool
from pydantic import Field

from dashboard_store import (
    ACTIVITY_TYPES,
    EMAIL_APPROVAL_ACTIVITY_TYPES,
    EMAIL_APPROVAL_STATUSES,
    PROSPECT_STAGES,
    TASK_STATUSES,
    SupabaseDashboardStore,
    validate_choice,
)


def _json(value: object) -> str:
    return json.dumps(value, indent=2, sort_keys=True)


@cache
def dashboard_store() -> SupabaseDashboardStore:
    return SupabaseDashboardStore.from_env()


@function_tool
def get_dashboard_snapshot() -> str:
    """Read the current metrics, pipeline counts, due follow-ups, and open tasks."""
    return _json(dashboard_store().snapshot())


@function_tool
def list_prospects(
    stage: str | None = None,
    company_query: str | None = None,
) -> str:
    """Find up to 25 prospects before updating or linking dashboard records.

    Args:
        stage: Optional exact prospect stage filter.
        company_query: Optional case-insensitive company-name search.
    """
    if stage:
        validate_choice(stage, PROSPECT_STAGES, "prospect stage")
    return _json(dashboard_store().list_prospects(stage, company_query))


@function_tool
def add_prospect(
    company_name: Annotated[str, Field(min_length=1, max_length=180)],
    market: str = "",
    website: str = "",
    decision_maker: str = "",
    email: str = "",
    phone: str = "",
    source: str = "",
    software_clues: str = "",
    pain_signal: str = "",
    notes: str = "",
    next_follow_up_date: str | None = None,
) -> str:
    """Add a prospect from user context or verified public prospect research."""
    values = {
        "company_name": company_name,
        "market": market,
        "website": website,
        "decision_maker": decision_maker,
        "email": email,
        "phone": phone,
        "source": source,
        "software_clues": software_clues,
        "pain_signal": pain_signal,
        "notes": notes,
        "next_follow_up_date": next_follow_up_date,
    }
    return _json(dashboard_store().add_prospect(values))


@function_tool
def update_prospect(
    prospect_id: str,
    stage: str | None = None,
    next_follow_up_date: str | None = None,
    notes: str | None = None,
) -> str:
    """Update a known prospect stage, follow-up date, or notes by prospect id."""
    if stage:
        validate_choice(stage, PROSPECT_STAGES, "prospect stage")
    if not any((stage, next_follow_up_date, notes)):
        raise ValueError("Provide a stage, next_follow_up_date, or notes update.")
    return _json(
        dashboard_store().update_prospect(
            prospect_id, stage, next_follow_up_date, notes
        )
    )


@function_tool
def log_outreach_activity(
    activity_type: str,
    occurred_on: str,
    outcome: str = "",
    notes: str = "",
    prospect_id: str | None = None,
) -> str:
    """Log outreach that already happened in the dashboard.

    Args:
        activity_type: One supported activity type from the dashboard.
        occurred_on: Activity date in YYYY-MM-DD format.
        outcome: Short result of the activity.
        notes: Supporting notes supplied by the user.
        prospect_id: Optional linked prospect id from list_prospects.
    """
    validate_choice(activity_type, ACTIVITY_TYPES, "activity type")
    return _json(
        dashboard_store().log_activity(
            {
                "activity_type": activity_type,
                "occurred_on": occurred_on,
                "outcome": outcome,
                "notes": notes,
                "prospect_id": prospect_id,
            }
        )
    )


@function_tool
def list_email_approvals(status: str | None = None) -> str:
    """List agent-prepared email drafts waiting on founder review or sending."""
    if status:
        validate_choice(status, EMAIL_APPROVAL_STATUSES, "email approval status")
    return _json(dashboard_store().list_email_approvals(status))


@function_tool
def queue_email_approval(
    recipient_email: Annotated[str, Field(min_length=3, max_length=320)],
    subject: Annotated[str, Field(min_length=1, max_length=320)],
    body: Annotated[str, Field(min_length=1, max_length=12000)],
    activity_type: str = "cold_email",
    prospect_id: str | None = None,
) -> str:
    """Queue an email draft for founder approval before Office 365 sends it."""
    validate_choice(
        activity_type,
        EMAIL_APPROVAL_ACTIVITY_TYPES,
        "email approval activity type",
    )
    return _json(
        dashboard_store().add_email_approval(
            {
                "prospect_id": prospect_id,
                "recipient_email": recipient_email,
                "subject": subject,
                "body": body,
                "activity_type": activity_type,
            }
        )
    )


@function_tool
def list_sprint_tasks(
    week_number: Annotated[int | None, Field(ge=1, le=4)] = None,
    status: str | None = None,
) -> str:
    """List sprint tasks before creating or changing task records."""
    if status:
        validate_choice(status, TASK_STATUSES, "task status")
    return _json(dashboard_store().list_tasks(week_number, status))


@function_tool
def add_sprint_task(
    week_number: Annotated[int, Field(ge=1, le=4)],
    title: Annotated[str, Field(min_length=1, max_length=220)],
    due_date: str | None = None,
    notes: str = "",
) -> str:
    """Add a dashboard sprint task for a week in the 30-day plan."""
    return _json(
        dashboard_store().add_task(
            {
                "week_number": week_number,
                "title": title,
                "due_date": due_date,
                "notes": notes,
            }
        )
    )


@function_tool
def update_sprint_task_status(task_id: str, status: str) -> str:
    """Move a known dashboard sprint task between todo, doing, and done."""
    validate_choice(status, TASK_STATUSES, "task status")
    return _json(dashboard_store().update_task_status(task_id, status))


dashboard_agent = Agent(
    name="Acquisition dashboard operator",
    instructions=(
        "You maintain the EMC2Ops 30-day acquisition dashboard. "
        "Use get_dashboard_snapshot before advising on metrics or today's work. "
        "Use list tools before updating records when an id is needed. "
        "You may create prospects and sprint tasks, update prospect stages and "
        "follow-up dates, and move sprint task statuses. Prospects may come "
        "from the user or verified public research; keep the source, software "
        "clues, pain signal, and uncertainty in the record when available. "
        "Log outreach only when the user says it already happened or when "
        "trusted operating evidence proves it. Do not claim that an email, "
        "phone call, LinkedIn touch, proposal, audit, publication, or delivery "
        "task happened without that evidence. External contact, publishing, "
        "calendar changes, and anything that uses the founder's voice need "
        "explicit approval unless the user has already authorized that channel. "
        "Use queue_email_approval for emails that are ready for the founder to "
        "review instead of sending them. "
        "Do not mark a task done merely because it is due. For autopilot "
        "check-ins, separate work you can advance autonomously from work that "
        "needs the founder. Keep summaries concise and mention changed records "
        "after a mutation."
    ),
    tools=[
        get_dashboard_snapshot,
        list_prospects,
        add_prospect,
        update_prospect,
        log_outreach_activity,
        list_email_approvals,
        queue_email_approval,
        list_sprint_tasks,
        add_sprint_task,
        update_sprint_task_status,
    ],
)


def run_dashboard_agent(goal: str) -> str:
    result = Runner.run_sync(dashboard_agent, goal, max_turns=12)
    return str(result.final_output)
