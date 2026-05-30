from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import json
import os
from pathlib import Path
from typing import Any, Protocol
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import msal
from dotenv import load_dotenv

from dashboard_store import SupabaseDashboardStore

GRAPH_SCOPES = ["https://graph.microsoft.com/Mail.Send"]


class MailSender(Protocol):
    def send_message(self, recipient_email: str, subject: str, body: str) -> None: ...


class ApprovalStore(Protocol):
    def list_email_approvals(self, status: str | None = None) -> list[dict[str, Any]]: ...

    def update_email_approval(
        self, approval_id: str, values: dict[str, Any], expected_status: str | None = None
    ) -> dict[str, Any]: ...

    def log_activity(self, values: dict[str, Any]) -> dict[str, Any]: ...


@dataclass(frozen=True)
class Office365Settings:
    client_id: str
    tenant_id: str
    token_cache_path: Path

    @classmethod
    def from_env(cls) -> "Office365Settings":
        client_id = os.getenv("OFFICE365_CLIENT_ID")
        if not client_id:
            raise RuntimeError("Missing Office 365 environment variable: OFFICE365_CLIENT_ID")
        cache_path = Path(
            os.getenv(
                "OFFICE365_TOKEN_CACHE",
                Path.home() / ".cache" / "emc2ops" / "office365-msal-cache.json",
            )
        ).expanduser()
        return cls(
            client_id=client_id,
            tenant_id=os.getenv("OFFICE365_TENANT_ID", "organizations"),
            token_cache_path=cache_path,
        )


class Office365GraphSender:
    def __init__(self, settings: Office365Settings) -> None:
        self.settings = settings
        self.cache = msal.SerializableTokenCache()
        if settings.token_cache_path.exists():
            self.cache.deserialize(settings.token_cache_path.read_text())
        self.app = msal.PublicClientApplication(
            settings.client_id,
            authority=f"https://login.microsoftonline.com/{settings.tenant_id}",
            token_cache=self.cache,
        )

    def authenticate_device_flow(self) -> None:
        flow = self.app.initiate_device_flow(scopes=GRAPH_SCOPES)
        if "user_code" not in flow:
            raise RuntimeError(f"Could not start Office 365 device login: {flow}")
        print(flow["message"])
        result = self.app.acquire_token_by_device_flow(flow)
        self._raise_for_token_error(result)
        self._save_cache()
        print("Office 365 token cache updated.")

    def send_message(self, recipient_email: str, subject: str, body: str) -> None:
        token = self._access_token()
        payload = {
            "message": {
                "subject": subject,
                "body": {"contentType": "Text", "content": body},
                "toRecipients": [
                    {"emailAddress": {"address": recipient_email}},
                ],
            },
            "saveToSentItems": True,
        }
        request = Request(
            "https://graph.microsoft.com/v1.0/me/sendMail",
            data=json.dumps(payload).encode(),
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(request) as response:
                if response.status != 202:
                    raise RuntimeError(f"Microsoft Graph returned HTTP {response.status}.")
        except HTTPError as error:
            detail = error.read().decode(errors="replace")
            raise RuntimeError(
                f"Microsoft Graph sendMail failed with HTTP {error.code}: {detail}"
            ) from error

    def _access_token(self) -> str:
        accounts = self.app.get_accounts()
        result = (
            self.app.acquire_token_silent(GRAPH_SCOPES, account=accounts[0])
            if accounts
            else None
        )
        if not result:
            raise RuntimeError(
                "Office 365 is not authenticated. Run `python office365_mail.py auth`."
            )
        self._raise_for_token_error(result)
        self._save_cache()
        return str(result["access_token"])

    def _save_cache(self) -> None:
        if not self.cache.has_state_changed:
            return
        self.settings.token_cache_path.parent.mkdir(parents=True, exist_ok=True)
        self.settings.token_cache_path.write_text(self.cache.serialize())

    @staticmethod
    def _raise_for_token_error(result: dict[str, Any]) -> None:
        if "access_token" in result:
            return
        raise RuntimeError(
            f"Office 365 token request failed: {result.get('error_description') or result}"
        )


def send_approved_emails(store: ApprovalStore, sender: MailSender) -> dict[str, int]:
    counts = {"sent": 0, "failed": 0}
    for approval in store.list_email_approvals("approved"):
        store.update_email_approval(
            approval["id"],
            {"last_error": "", "status": "sending"},
            expected_status="approved",
        )
        try:
            sender.send_message(
                approval["recipient_email"],
                approval["subject"],
                approval["body"],
            )
            sent_at = datetime.now(timezone.utc).isoformat()
            store.update_email_approval(
                approval["id"],
                {
                    "provider_message_id": "microsoft-graph-sendmail-accepted",
                    "sent_at": sent_at,
                    "status": "sent",
                },
                expected_status="sending",
            )
            store.log_activity(
                {
                    "activity_type": approval["activity_type"],
                    "occurred_on": sent_at[:10],
                    "outcome": "sent",
                    "notes": f"Sent from approved Office 365 queue: {approval['subject']}",
                    "prospect_id": approval.get("prospect_id"),
                }
            )
            counts["sent"] += 1
        except Exception as error:
            store.update_email_approval(
                approval["id"],
                {"last_error": str(error), "status": "failed"},
                expected_status="sending",
            )
            counts["failed"] += 1
    return counts


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Authenticate Office 365 and send dashboard-approved emails."
    )
    parser.add_argument(
        "command",
        choices=("auth", "send-approved"),
        help="Authenticate once or send only approved dashboard email rows.",
    )
    return parser.parse_args()


def main() -> None:
    load_dotenv(Path(__file__).with_name(".env.local"))
    args = parse_args()
    graph_sender = Office365GraphSender(Office365Settings.from_env())
    if args.command == "auth":
        graph_sender.authenticate_device_flow()
        return

    counts = send_approved_emails(SupabaseDashboardStore.from_env(), graph_sender)
    print(f"Approved Office 365 sends: {counts['sent']} sent, {counts['failed']} failed.")


if __name__ == "__main__":
    main()
