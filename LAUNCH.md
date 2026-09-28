# Founder Clarity OS launch handoff

Not live. Local implementation only. Existing index.html is unchanged.

Confirmed: github.com/abhishek-348/smartbooks-global → Vercel project smartbooks-global in abhishek-348s-projects → www.smartbooksglobal.com. Vercel Pro verified 29 September 2026. GitHub CLI authenticated as abhishek-348 with owner authorization. Vercel connector returned no teams, so dashboard was used. No existing environment variables.

## Before publication
1. Commercial hosting resolved: Pro verified.
2. Add Stripe sandbox key securely in Vercel preview environment. Use an existing account; do not expose keys. Creating credentials requires owner action.
3. Create private Blob store and connect project; upload customer v2 ZIP from outside this public repo. Set FOUNDER_BLOB_PATH. Never commit workbook, examples or ZIP to public GitHub.
4. Preview checkout uses the VERCEL_URL deployment origin and refuses live keys. Use test Stripe keys in Preview, live only in Production.
5. Verify paid, declined, cancelled, refunded and repeat-download paths with Stripe test mode and private storage; test the downloaded ZIP in a normal desktop browser.
6. Publish final seller/privacy/refund terms. Remove prelaunch copy only when complete. Decide tax configuration with the US seller; tax collection not enabled in this draft.
7. Add production credentials securely, publish reviewed changes and enable LAUNCH_ENABLED only after verification. This flag defaults closed. Download access survives closing sales.
8. Add homepage navigation once the product is ready. Review whether duplicate Vercel project project-axphx should receive these changes before pushing main.

## Delivery design and limitations
Server-created Stripe Checkout fixes the USD39 price; server verifies paid status, product metadata, amount, mode, refund/dispute status and live/test match before streaming a private Blob ZIP. The browser never receives storage credentials. Receipt-link session identifiers act as bearer access; keep them private. Download replies are never cacheable. No database, customer accounts or public ZIP.

Delivery currently happens on return from checkout, with repeat download from a bookmarked page. Signed Stripe webhook and Hostinger SMTP purchase email are implemented but not yet connected or verified against live providers. If the browser closes before returning, the owner must recover access using the receipt. Before launch, configure STRIPE_WEBHOOK_SECRET and SMTP_PASSWORD, subscribe the endpoint to checkout.session.completed, and verify real delivery to the buyer inbox in test mode. The private Blob sent marker suppresses subsequent completed retries. Concurrent events or a crash after SMTP acceptance but before recording can send duplicate recovery emails; delivery is at-least-once, not exactly-once. SMTP Message-ID is stable, but receiver deduplication is not guaranteed. Do not advertise automatic email delivery until verified.

Initial USD39 is fixed. No automatic first-ten order cap or USD59 transition is implemented; owner must track orders before opening sales or implement a durable order counter. No live payment has been attempted. Unit checks do not replace Stripe test-mode end-to-end verification.

Run npm install, npm test and npm run build. Public output contains only existing homepage and product/sample/success pages. api/ hosts server functions; lib/ and private deliverables are not copied into public output.
