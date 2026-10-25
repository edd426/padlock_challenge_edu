# HANDOFF: padlock_challenge_edu

## Status: OFFLINE, intentionally (since 2026-10-25)

The app was taken down during a security sweep. Do not redeploy it as it was. The steps below
are required before it runs anywhere public.

### Why it was taken down

- Production ran **Next.js 15.5.6 / React 19.2.0** with the App Router. That version is
  vulnerable to unauthenticated remote code execution: React2Shell (GHSA-9qr9-h5gf-34mp),
  mass-exploited since Dec 2025, plus two Image Optimization RCEs (GHSA-2464-fhr4-w9xw,
  GHSA-2xp9-vwfh-vxw4). It was exposed for about a year. `main` was patched to Next 15.5.28 /
  React 19.2.9 in `2570e46` just before the takedown.
- The server held `AZURE_STORAGE_CONNECTION_STRING`, which contains the storage **account
  key**: full read/write/delete on the storage account, no expiry. Treat that key as leaked.

### What was torn down

| Item | State |
|---|---|
| Static Web App `app-padlock-challenge` (`gentle-field-08c20650f.3.azurestaticapps.net`) | Deleted |
| Repo secret `AZURE_STATIC_WEB_APPS_API_TOKEN_GENTLE_FIELD_08C20650F` | Deleted |
| `.github/workflows/azure-static-web-apps-gentle-field-08c20650f.yml` | Removed (its target no longer exists) |
| Storage account `stpadlockchallenge` (rg `rg-padlock-challenge`) | Shared-key access and public network access **disabled**; scheduled for deletion by the owner. Do not reuse it. Create fresh storage. |

### Required before redeploying

1. **Patch first, re-check at deploy time.** Run `npm audit --omit=dev` and fix every
   high/critical before going live. Dependabot alerts are enabled on this repo; keep Next/React
   on the latest patch of their line.
2. **No storage account keys.** Replace `TableClient.fromConnectionString(...)` in
   `src/lib/azure.ts` with `new TableClient(url, table, new DefaultAzureCredential())`. Grant
   the app's **managed identity** the `Storage Table Data Contributor` role, and create the
   storage account with `allowSharedKeyAccess: false`. SWA managed functions can't use a
   managed identity on the Free plan, so either use SWA Standard with a linked Functions
   backend, or host on Azure Functions or Container Apps with a system-assigned identity.
3. **Fix the IaC leak.** `infra/main.bicep` line 48 outputs `storageConnectionString` built
   from `listKeys()`. Deployment outputs are stored in plaintext in the resource group's
   deployment history. Delete that output; with step 2 nothing needs it.
4. **Fix admin auth.** `src/app/api/challenge/route.ts:11` falls back to the hard-coded password
   `'swordfish'` when `ADMIN_PASSWORD` is unset. Make it fail closed (reject all writes if
   unset), compare with `crypto.timingSafeEqual`, and rate-limit `POST`. Better still, gate
   setup mode behind real auth (SWA built-in auth or Entra ID).
5. **New deploy workflow.** Write a fresh one for the new host. Pin third-party actions to
   commit SHAs. Keep the default `GITHUB_TOKEN` read-only, and never expose secrets to
   `pull_request` from forks.
6. **Consider dropping the server entirely.** The only server code is `/api/challenge` (one
   record: get/save the active challenge). If that can live client-side or in a static JSON
   file edited by the teacher, `output: 'export'` removes the whole server attack surface.

### Acceptance check before going live

- `npm audit --omit=dev` reports no high/critical.
- `grep -rn "fromConnectionString\|listKeys\|swordfish" src infra` returns nothing.
- The new storage account shows `allowSharedKeyAccess: false`.
- An unauthenticated `POST /api/challenge` is rejected.
