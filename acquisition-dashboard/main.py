from __future__ import annotations

import argparse
from pathlib import Path

from dotenv import load_dotenv

from agent import run_dashboard_agent

DAILY_GOAL = (
    "Review the current dashboard snapshot. Give me a short daily operating "
    "brief with the metrics that need attention, due follow-ups, and open sprint "
    "tasks to work next. Do not change records unless I explicitly asked."
)
AUTOPILOT_GOAL = (
    "Review the current dashboard snapshot against the 30-day acquisition "
    "strategy. Give a concise autopilot check-in with the best next work the "
    "agent can advance autonomously, any approval-gated outreach or publishing "
    "that is ready for the founder, and any human-only blocker. Do not claim "
    "external work happened without evidence."
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the EMC2Ops acquisition dashboard agent."
    )
    parser.add_argument("goal", nargs="*", help="Instruction for the dashboard agent.")
    parser.add_argument(
        "--daily-brief",
        action="store_true",
        help="Read the dashboard and print a concise daily operating brief.",
    )
    parser.add_argument(
        "--autopilot-checkin",
        action="store_true",
        help="Read the dashboard and print autonomous work plus founder handoffs.",
    )
    return parser.parse_args()


def main() -> None:
    load_dotenv(Path(__file__).with_name(".env.local"))
    args = parse_args()
    if args.daily_brief and args.autopilot_checkin:
        raise SystemExit("Choose --daily-brief or --autopilot-checkin.")
    if args.autopilot_checkin:
        goal = AUTOPILOT_GOAL
    elif args.daily_brief:
        goal = DAILY_GOAL
    else:
        goal = " ".join(args.goal).strip()
    if not goal:
        raise SystemExit("Pass a goal or use --daily-brief or --autopilot-checkin.")
    print(run_dashboard_agent(goal))


if __name__ == "__main__":
    main()
