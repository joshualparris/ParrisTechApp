# ParrisTechApp — Improvement Backlog

Ranked by value. Every item was observed in the codebase, not guessed.
Baseline: `app.js` 3,066 LOC, `npm test` passing.

## 1. `app.js` is a 3,066-line single file

Session state, checklist rules, invoicing, analytics, import/export,
printing and all rendering live together with no module boundaries. This
is the root cause of most items below.

## 2. Three TODO.md items remain open

- Configurable intro/outro text, including flagged follow-ups with due
  dates
- Per-module completion stats and average time by device/goal
- Timezone per session, friendly date formats, translation scaffolding

The stashed work already added `session.timeZone`, `formatDateTime()` and
`getAnalyticsMetrics()`, so items two and three are partly done. Finish
them rather than restarting.

## 3. The test asserts almost nothing — DONE

Steps 7 and 8 printed "ACCEPTED (BUG)" / "REJECTED (BUG)" and still exited
0, so a real regression reported as a pass. Now every step throws:
acknowledgement records signedAt, the export is non-empty valid JSON, five
malformed payloads must all be rejected, a valid round-trip must be
accepted, and analytics are range-checked. Mutation-verified.

## 4. No linter and no CI

Neither exists. The `item.title` / `item.step` mismatch is exactly what a
linter or types would have flagged.

## 5. `rules.json` is unvalidated at load

The checklist engine trusts its shape entirely. A malformed edit through
the rules editor UI can produce sessions with no items, surfacing as a
confusing empty checklist rather than an error.

## 6. Session data lives only in `localStorage`

Losing browser data loses every past session and invoice. Export exists but
is manual. An autosave-to-file path, or a documented backup step, would
protect real billing records.

## 7. Two stale backups are committed alongside the source

`app.js.full.bak` and `app.js.user-edits.bak` sit next to `app.js` with no
indication of which is current. They are now gitignored; delete them once
you have confirmed nothing is needed.

## 8. No schema version on exported sessions

Export/import round-trips have no version marker, so a future field rename
silently corrupts imports. The import path already rejects malformed data —
extend it to check a version.

## 9. Printing is CSS-only with no test

The handoff report is the client-facing output and the most embarrassing
thing to break. Nothing verifies it renders.

## 10. Invoicing uses floats — lower risk than it looks

Correction: amounts are raw floats summed with `reduce`, but `toFixed(2)`
masks the drift at realistic invoice sizes. Tested 15-line invoices and
half-cent boundaries with no divergence from integer-cent arithmetic. Worth
revisiting only if invoices grow much larger or gain per-line discounts;
not worth rewriting working money code today.
