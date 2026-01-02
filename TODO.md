# ParrisTechApp To-Do

## Core workflow
- [x] Prefill session length from last visit and provide onsite/remote presets (onsite auto-selects Wi-Fi/Router).
- [x] Add “returning client” quick notes and use them to suggest default devices/goals.
- [x] Replace prompt-based note entry with inline editors.
- [x] Add session countdown with alerts and highlight overrunning modules.
- [x] Add search/filter for steps and hide-completed toggle.
- [x] Add undo for last action and module collapse.
 - [x] Track per-item time spent and auto-mark done when timebox reached.

## Checklist rules
- [x] Add printer module variants per platform and Wi-Fi signal survey note.
- [x] Add “data migration” module and “business client” flag that deepens security/backup steps.
- [x] Build simple rules editor UI to add/edit modules/goals/devices and save back to `rules.json` with validation.

## Billing
- [x] Add invoice panel with billable toggles, subtotal, tax toggle, and exportable line items.
- [x] Keep per-item invoice quick-toggle and sync to invoice list.

## Session history & data
- [x] Show past sessions with filters; open read-only view; allow duplicating prior session selections.
- [x] Add “Export all sessions” and “Import sessions”; optional daily autosave download.
- [x] Add client profile basics (contact, devices owned, past issues) and suggest default goals/devices from profile.

## Summary & print
- Allow configurable intro/outro text; include flagged follow-ups with due dates.
- [x] Add client-facing vs internal notes toggle in summaries.
- [x] Refine print stylesheet for handoff reports.

## UI/UX & accessibility
- [x] Add keyboard shortcuts for mark done/flag/note; ensure focus outlines and ARIA labels for buttons/progress.
- [x] Improve mobile/onsite mode: larger hit targets, sticky timer/progress, offline-friendly banners.

## Metrics
- Track per-module completion stats and average time by device/goal to refine playbooks.

## Localization
- Store timezone per session; friendly date formats; prep translation framework.

## New ideas
- Add multi-user support with operator login and per-operator session stats.
- Add reminders/follow-up scheduler with calendar export (ICS) and email template generator.
- Add photo attachments per step (local file reference) for before/after evidence.
- Add quick-quote generator: select billable lines, apply rates, export PDF invoice.
- Add offline cache download/upload button for transferring data between machines.
- Add “Playbook walkthrough” mode that shows only one step at a time with keyboard navigation.
- Add risk/consent capture with client e-sign stub and printable acknowledgment.
- Add KPI dashboard: sessions per week, average duration, top goals/devices, conversion to billables.
- Add data integrity check: validate rules.json/custom modules and highlight missing fields.
- Add onboarding wizard for new operators to learn the checklist flow and shortcuts.
