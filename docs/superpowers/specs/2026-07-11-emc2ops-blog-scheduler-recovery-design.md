# EMC2Ops Blog Scheduler Recovery Design

## Goal

Restore the two daily EMC2Ops blog automations after the Codex update left their active scheduler records overdue and undispatched.

## Scope

Replace only the timing and invocation layer. The existing automation prompts, content validation, deployment, social-promotion rules, and automation memory remain the source of truth.

## Design

Two macOS `launchd` agents will invoke one small, generic runner at the existing local times:

- 1:00 PM: `daily-emc2ops-news-cycle-blog-post`
- 3:30 PM: `daily-emc2ops-blog-post`

The runner will read the selected automation's existing prompt from `~/.codex/automations/<id>/automation.toml`, execute it through the installed Codex CLI in the original workspace, and write timestamped stdout/stderr logs under `~/.codex/automation-logs/`.

Neither job will use `RunAtLoad`, so missed July 10 runs are not backfilled. Each run remains responsible for its own guarded validation and social-promotion steps exactly as defined in the saved prompt.

## Safety and Failure Handling

- The runner accepts only the two named blog automation IDs.
- It exits non-zero when the saved configuration or Codex executable is unavailable.
- `launchd` captures separate output and error logs for each schedule.
- The agents use `StartCalendarInterval`; scheduling is independent of the Codex desktop application's lifecycle.
- The existing obsolete Codex scheduler records are left untouched for audit history; the new jobs are clearly named as recovery jobs.

## Verification

Before loading the jobs, validate that the runner extracts both prompts and can perform a dry configuration check without invoking Codex. After loading, query `launchctl` to confirm both agents are registered and inspect their next scheduled execution configuration.

## Out of Scope

- Backfilling missed articles or social posts.
- Changing article prompts, social credentials, or content rules.
- Modifying the Codex internal SQLite scheduler database.
