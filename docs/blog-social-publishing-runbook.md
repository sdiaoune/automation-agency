# EMC2Ops Blog Social Publishing Runbook

Last verified: 2026-08-06

This runbook documents how EMC2Ops blog promotion has actually been published and how the daily evergreen and news-cycle blog automations should handle partial failures.

## Historical publishing path

The blog publisher is invoked with:

```bash
npm run post:blog:social -- --slug <slug> --no-deploy
```

The command runs `scripts/x-blog-post.mjs`. It verifies the live article and Twitter card unless explicitly told not to, reads `.x-blog-post-history.json`, and publishes only the channels that do not already have a recorded post ID.

As of 2026-08-06, the history contains 130 blog promotion records:

- X succeeded for 108 records: 78 used `oauth2-link-post`, 29 used `oauth2-text-thread`, and one used the older localhost text-post path.
- LinkedIn succeeded for 125 records, all through Buffer using `buffer-shareNow`.
- Both channels succeeded for 103 records.

The current default blog promotion is therefore an X OAuth2 link post plus a LinkedIn Buffer immediate share. The generated social card is exposed through the article's `twitter:image` metadata; it is not uploaded to X as media by the default command.

## What a nonzero exit means

X and LinkedIn are attempted independently. A command can exit nonzero after one channel succeeds and the other fails. The publisher writes both outcomes to `.x-blog-post-history.json` before returning the partial-failure error.

Do not report “social posting failed” based only on the command exit code. Inspect the slug's history record and report each channel separately:

- X success requires `tweetId`; record `method` and `postedAt`.
- LinkedIn success requires `linkedInPostId`; record `linkedInMethod` and `linkedInPostedAt`.
- A failed channel records `<channel>LastError` and `<channel>LastFailedAt`.

## Duplicate-prevention rules

1. Run the combined publisher only once during the normal automation flow.
2. Never use `--force` in an automated blog run.
3. After the command returns, inspect `.x-blog-post-history.json` for the exact slug before deciding what succeeded.
4. If either channel already has its post ID, do not manually repost that channel.
5. Do not immediately rerun after an account, credit, permission, or credential error. Record the blocker and leave the successful channel untouched.
6. If a later, explicitly authorized recovery is needed, target only the missing channel with `--x-only` or `--linkedin-only`. The normal history guard should remain enabled.

## X failure interpretation

The direct X route first uses the saved OAuth2 connection. For recoverable failures it may try the OAuth1 credentials and then the localhost publisher. These fallbacks are not evidence of success; only a returned tweet ID is.

Recent observed blockers include:

- `Value passed for the token was invalid`: the saved OAuth2 access token was rejected. Reauthorize or repair the OAuth2 connection before retrying.
- `does not have any credits to fulfill this request` or an account usage-cap response: restore X developer-account posting capacity before retrying. Do not buy credits or change billing without founder approval.
- OAuth1 app permission errors: the direct fallback cannot post until the X app permissions are corrected and credentials are regenerated if required.
- `fetch failed` from `http://localhost:9876/api/social-post`: the optional local publisher is unavailable; this does not undo a successful LinkedIn post.

Do not repeatedly force X posts through alternate paths. Preserve the exact upstream error in automation memory and report the credential, permission, or capacity action required.

## Required automation sequence

1. Generate the custom card and verify the article's live `twitter:image` points to `/blog/social-assets/<slug>.png`.
2. Dry-review the social copy without publishing:

   ```bash
   npm run post:blog:social -- --slug <slug> --no-deploy --dry-run
   ```

3. If the hook and channel copy are acceptable, run the combined publisher once:

   ```bash
   npm run post:blog:social -- --slug <slug> --no-deploy
   ```

4. Read the slug's `.x-blog-post-history.json` record, even when the command exits nonzero.
5. Report X and LinkedIn separately with IDs, methods, timestamps, and exact blockers.
6. Store the result in the relevant automation memory. Never include OAuth tokens, refresh tokens, client secrets, or connection-file contents.

## 2026-08-06 incident finding

For `black-hat-ai-agent-permissions-property-management-workflows`, LinkedIn posted successfully through Buffer as `6a74a3659aa78dffa28beb78`. X did not post: OAuth2 rejected the token, OAuth1 lacked the required app permissions, and the localhost fallback was unavailable. The correct state is “LinkedIn posted; X blocked,” not “both failed,” and the combined publisher should not be forced again.
