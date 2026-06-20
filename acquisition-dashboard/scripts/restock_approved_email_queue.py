from __future__ import annotations

import argparse
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path
import sys
from typing import Any
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
DASHBOARD_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(DASHBOARD_ROOT))

from dashboard_store import SupabaseDashboardStore  # noqa: E402


EASTERN = ZoneInfo("America/New_York")
FOLLOW_UP_DATE = "2026-06-20"
SUBJECT_BY_COHORT = {
    "missed_calls": "missed calls",
    "speed": "response time",
    "revenue": "lost leads",
}
GREETING_VARIANTS = [
    "Hi {first},",
    "Hey {first},",
    "Hello {first},",
    "{first},",
    "Good morning {first},",
]
BLOCKED_NOTE_TERMS = (
    "opt-out",
    "opted out",
    "do-not-send",
    "do not send",
    "unsubscribe",
    "remove me",
    "bounced",
)


@dataclass(frozen=True)
class Candidate:
    cohort: str
    prospect_id: str
    company_name: str
    first_name: str
    recipient_email: str
    source_ref: str


def template_body(cohort: str, greeting: str, company: str) -> str:
    if cohort == "missed_calls":
        return f"""{greeting}

I noticed {company} has active leasing paths where renters can reach the team by phone, listings, portals, or online inquiries.

Quick question: when a leasing call is missed after hours or while your team is tied up, does the renter get an immediate text-back and a clear next step?

I build a narrow missed-call recovery workflow for property managers: instant SMS reply, a few fit/timing questions, and a clean handoff to the right inbox or system.

Worth seeing where this would fit for {company}?

Diaoune
EMC2Ops"""
    if cohort == "speed":
        return f"""{greeting}

I noticed {company} has renter-facing leasing paths where speed matters: phone, listings, portals, or online inquiries.

Quick question: when a renter calls and no one can answer, how quickly do they get a useful next step?

I help property managers tighten that first response window: missed call -> instant text-back -> a few fit/timing questions -> routed summary for the team.

Worth seeing where the slowest handoff might be for {company}?

Diaoune
EMC2Ops"""
    return f"""{greeting}

I noticed {company} has renter-facing leasing paths where missed calls or slow follow-up can quietly turn into lost showing opportunities.

Quick question: do you have a clean way to see which leasing inquiries disappear before the team can respond?

I build a narrow recovery workflow for property managers: missed call -> instant text-back -> qualification -> routed showing request or team summary.

The point is not more software. It is recovering the leads that would otherwise go cold.

Worth a quick teardown for {company}?

Diaoune
EMC2Ops"""


def first_name(value: str) -> str:
    clean = (value or "").replace("(", ",").replace("-", ",").split(",")[0].strip()
    return clean.split()[0] if clean.split() else "there"


def is_suppressed(prospect: dict[str, Any] | None) -> bool:
    if not prospect:
        return True
    if prospect.get("stage") != "prospecting":
        return True
    notes = (prospect.get("notes") or "").lower()
    return any(term in notes for term in BLOCKED_NOTE_TERMS)


def load_candidates(prospects_by_id: dict[str, dict[str, Any]], prospects_by_email: dict[str, dict[str, Any]]) -> list[Candidate]:
    candidates: list[Candidate] = []

    missed_path = ROOT / "outputs/emc2ops-apollo-candidates-2026-06-18/candidates.json"
    for row in json.loads(missed_path.read_text()):
        if str(row.get("Email ready", "")).lower() != "yes":
            continue
        prospect = prospects_by_id.get(row.get("Prospect ID", ""))
        email = (row.get("Email") or (prospect or {}).get("email") or "").strip().lower()
        if not email:
            continue
        candidates.append(
            Candidate(
                cohort="missed_calls",
                prospect_id=(prospect or {}).get("id", ""),
                company_name=row.get("Company") or (prospect or {}).get("company_name", ""),
                first_name=first_name(row.get("Decision maker", "")),
                recipient_email=email,
                source_ref=str(missed_path),
            )
        )

    for cohort, rel_path in (
        ("speed", "outputs/emc2ops-apollo-wave2-2026-06-18/speed-to-lead-send-queue-2026-06-22.json"),
        ("revenue", "outputs/emc2ops-apollo-wave2-2026-06-18/revenue-recovery-send-queue-2026-06-23.json"),
    ):
        path = ROOT / rel_path
        for row in json.loads(path.read_text()).get("rows", []):
            if not (row.get("send_ready") is True or str(row.get("send_ready")).lower() == "true"):
                continue
            email = (row.get("email") or "").strip().lower()
            prospect = prospects_by_email.get(email)
            candidates.append(
                Candidate(
                    cohort=cohort,
                    prospect_id=(prospect or {}).get("id", ""),
                    company_name=row.get("company_name") or (prospect or {}).get("company_name", ""),
                    first_name=row.get("first_name") or first_name(row.get("name", "")),
                    recipient_email=email,
                    source_ref=str(path),
                )
            )
    return candidates


def select_candidates(
    candidates: list[Candidate],
    prospects_by_id: dict[str, dict[str, Any]],
    approvals: list[dict[str, Any]],
    sent_approvals_today: list[dict[str, Any]],
    needed: int,
) -> list[Candidate]:
    already_queued_or_sent = {
        row.get("prospect_id")
        for row in approvals
        if row.get("status") in {"approved", "sending", "sent"}
    }
    existing_email_subject = {
        ((row.get("recipient_email") or "").lower(), row.get("subject"))
        for row in approvals
        if row.get("status") in {"approved", "sending", "sent"}
    }
    subject_counts = Counter(row.get("subject") for row in approvals if row.get("status") == "approved")
    subject_counts.update(row.get("subject") for row in sent_approvals_today)
    selected: list[Candidate] = []
    seen_prospects: set[str] = set()

    def eligible(candidate: Candidate) -> bool:
        prospect = prospects_by_id.get(candidate.prospect_id)
        subject = SUBJECT_BY_COHORT[candidate.cohort]
        return (
            candidate.prospect_id
            and candidate.recipient_email
            and "@" in candidate.recipient_email
            and not is_suppressed(prospect)
            and candidate.prospect_id not in already_queued_or_sent
            and candidate.prospect_id not in seen_prospects
            and (candidate.recipient_email, subject) not in existing_email_subject
        )

    buckets = {
        cohort: [candidate for candidate in candidates if candidate.cohort == cohort]
        for cohort in SUBJECT_BY_COHORT
    }
    while len(selected) < needed:
        picked = None
        for cohort in sorted(
            SUBJECT_BY_COHORT,
            key=lambda key: (subject_counts[SUBJECT_BY_COHORT[key]], len(buckets[key])),
        ):
            while buckets[cohort]:
                candidate = buckets[cohort].pop(0)
                if eligible(candidate):
                    picked = candidate
                    break
            if picked:
                break
        if not picked:
            break
        selected.append(picked)
        seen_prospects.add(picked.prospect_id)
        already_queued_or_sent.add(picked.prospect_id)
        subject_counts[SUBJECT_BY_COHORT[picked.cohort]] += 1
    return selected


def main() -> None:
    parser = argparse.ArgumentParser(description="Top up approved EMC2Ops cold-email rows for paced sending.")
    parser.add_argument("--target-total", type=int, default=30)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    load_dotenv(DASHBOARD_ROOT / ".env.local")
    store = SupabaseDashboardStore.from_env()
    today = datetime.now(EASTERN).date().isoformat()
    now = datetime.now(EASTERN).astimezone(ZoneInfo("UTC")).isoformat()

    prospects = store.client.table("prospects").select("*").execute().data
    prospects_by_id = {row["id"]: row for row in prospects}
    prospects_by_email = {
        (row.get("email") or "").lower(): row for row in prospects if row.get("email")
    }
    approvals = (
        store.client.table("email_approvals")
        .select("id,prospect_id,recipient_email,subject,status,created_at,sent_at")
        .execute()
        .data
    )
    activities = (
        store.client.table("outreach_activities")
        .select("id,activity_type,outcome,occurred_on,notes,prospect_id")
        .eq("occurred_on", today)
        .in_("activity_type", ["cold_email", "follow_up_email"])
        .execute()
        .data
    )
    sent_today = [row for row in activities if row.get("outcome") == "sent"]
    sent_approvals_today = [
        row
        for row in approvals
        if row.get("status") == "sent" and str(row.get("sent_at") or "").startswith(today)
    ]
    approved = [row for row in approvals if row.get("status") == "approved"]
    desired_approved = max(args.target_total - len(sent_today), 0)
    needed = max(desired_approved - len(approved), 0)

    candidates = load_candidates(prospects_by_id, prospects_by_email)
    selected = select_candidates(candidates, prospects_by_id, approvals, sent_approvals_today, needed)
    rows = []
    for idx, candidate in enumerate(selected):
        subject = SUBJECT_BY_COHORT[candidate.cohort]
        greeting = GREETING_VARIANTS[(len(approved) + idx) % len(GREETING_VARIANTS)].format(
            first=candidate.first_name or "there"
        )
        rows.append(
            {
                "prospect_id": candidate.prospect_id,
                "recipient_email": candidate.recipient_email,
                "subject": subject,
                "body": template_body(candidate.cohort, greeting, candidate.company_name),
                "activity_type": "cold_email",
                "status": "approved",
                "approved_at": now,
                "last_error": "",
            }
        )

    inserted = [] if args.dry_run or not rows else store.client.table("email_approvals").insert(rows).execute().data
    result = {
        "as_of": now,
        "dry_run": args.dry_run,
        "target_total": args.target_total,
        "sent_today": len(sent_today),
        "approved_before": len(approved),
        "desired_approved": desired_approved,
        "needed": needed,
        "inserted": len(inserted),
        "selected": len(selected),
        "selected_by_subject": dict(Counter(row["subject"] for row in rows)),
        "approved_after_estimate": len(approved) + (len(rows) if args.dry_run else len(inserted)),
    }
    output_dir = ROOT / "outputs/emc2ops-apollo-wave2-2026-06-18"
    output_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H%M%SZ")
    (output_dir / f"queue-restock-run-{stamp}.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
