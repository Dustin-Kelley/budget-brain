# Budget Brain — app design refresh

**Source:** Claude Design project `7e6d0b14-a499-4eda-8cd2-6e0ff56f9d45`, file `Budget Brain App.dc.html`
(design system: `broadsheet-90b7ba2d-db60-49f5-bec1-355b958e747c`)
**Date:** 2026-07-24
**Status:** plan

The design is a six-screen app prototype (Overview, Allocation, Accounts, Transactions,
Plan, Settings) with its own token set layered on the Broadsheet design system. This
plan maps it onto the real Next.js + Supabase app.

---

## 1. What the design actually specifies

### Tokens (from the `.dc.html` `<style>` block)

Two themes, each a full palette. Light ground is warm paper (`#f4f3f2`), dark is cool
ink (`#15181b`). Two accents — cyan (`--c-cy`) and magenta (`--c-mg`) — each with a
"deep" text-safe variant and a tint. Two six/five-step ramps drive every chart:

| Role | Light | Dark |
|---|---|---|
| `--c-bg` ground | `#f4f3f2` | `#15181b` |
| `--c-surf` card | `#ffffff` | `#1e2225` |
| `--c-surf2` inset | `#efeeec` | `#262b2f` |
| `--c-text` | `#201e1d` | `#e9edf0` |
| `--c-sub` / `--c-dim` | `#5f5a54` / `#8a847c` | `#99a2aa` / `#78828a` |
| `--c-cy` / `--c-cyT` | `#0f7ba0` / `#005a77` | `#2aa4c9` / `#6cc7e4` |
| `--c-mg` / `--c-mgT` | `#e33f83` / `#c11563` | `#e5478d` / `#ff8ab5` |
| `--n1…--n6` (needs ramp) | `#005a77` → `#bfe9fa` | `#0e6a89` → `#c3e9f6` |
| `--w1…--w5` (wants ramp) | `#c11563` → `#ffd0e0` | `#a8155a` → `#fca6c8` |

The `T` ("text") variants are the ones that carry contrast — links, active nav, positive
figures. The plain variants are for fills.

Geometry: cards `16px` radius / `1px` line, controls `10px`, pills `20px`. Type scale
`11.5 / 12.5 / 13.5 / 14 / 15.5 / 26 / 28 / 38px`, kickers uppercase at `.12em`.

### Typeface

Broadsheet sets **both** `--font-heading` and `--font-body` to **Source Serif 4**, and the
app design's `.ghost` / `.solid` buttons resolve `var(--font-body)`. So the whole app is
set in a serif. This replaces Geist.

### Icons

Every icon is Phosphor **duotone** (`ph-duotone ph-*`). Not in the project today.

### Structural ideas the current app does not have

1. **Allocation is its own screen**, not a card on Overview.
2. **Navigation mode is a user preference** — sidebar (default) or top bar — set in
   Settings, applied immediately.
3. **Theme is a three-way picker** (light / dark / match system) rendered as preview
   cards, plus a one-click cycle in the header.
4. **The month stepper lives in the header**, on every screen.
5. **Transactions is a real table** with bucket filter chips and search.

---

## 2. Design → data reality

The prototype is populated with invented data. Everything below is the honest mapping.

| Design element | Backed by | Decision |
|---|---|---|
| Total balance + per-account chips | `accounts.current_balance` | **Real** |
| "Safe to spend" | no scheduled-bill data | **Re-scoped** to "Left this month" = `inflow − lifestyleOutflow` |
| Savings rate | `wealthMoveVolume / inflow` | **Real**, compared to a 20% target constant |
| Net kept, last six months | new `getNetByMonth()` query | **Real** |
| Latest activity | `getLedgerTransactions({limit:5})` | **Real** |
| Insight banner | derived (uncategorized spend → savings rate → net) | **Real**, rules in `lib/ledger/insight.ts` |
| Allocation donut | `summary.allocation` slices | **Real**, hand-built SVG (drops recharts here) |
| Needs / Wants / Savings vs 50-30-20 | `fixedOutflow` / `discretionaryOutflow` / `wealthMoveVolume` | **Real** actuals; **targets are constants** (see §5) |
| Every-category list | `summary.allocation` | **Real** |
| Account cards: out this month, avg/day, pace | new `getAccountActivity()` | **Real** |
| Account sparkline | daily outflow series per account | **Real** |
| "Bills still due" / "Buffer: Healthy" | nothing | **Dropped** |
| "Upcoming from checking" | no scheduled transactions | **Dropped** |
| Transactions table + bucket filters + search | ledger + `group_kind` | **Real** (`?q=`, `?bucket=`, `?account=` server-side) |
| Plan: monthly income + 50/30/20 split | `inflow` + constants | **Real** actuals, constant targets |
| Plan: savings goals cards | no goals table | **Dropped** — slot keeps the existing envelope planner |
| Plan: automatic rules | no rules engine | **Dropped** |
| Settings: connections | `accounts` list | **Real** |
| Settings: preferences (currency / month start / rounding) | `accounts.currency` only | **Partial** — currency real, rest shown as fixed defaults |

Dropped items are omitted rather than faked. Anything that would need a migration
(goals, rules, per-household allocation targets, scheduled bills) is a follow-up.

### Asset note

`assets/budget-brain-mark.png` decoded blank over the wire, and the repo's existing
`budget-brain-logo.png` is a 1.4 MB raster with a baked-in grey gradient. The mark is
rebuilt as an **inline SVG** (brain + bolt, `currentColor`) so it themes correctly at the
25–30 px the design uses it at.

---

## 3. Work plan

### WS1 — Foundation

1. `app/globals.css` — replace the palette. Define the `--bb-*` design tokens for both
   themes, then **bridge them onto the existing shadcn token names**
   (`--background`, `--card`, `--primary`, `--border`, `--muted-foreground`, `--chart-*`…).
   Every shadcn component and every untouched form inherits the new look for free.
   Add the design's component classes (`.bb-card`, `.bb-kicker`, `.bb-num`, `.bb-row`,
   `.bb-navi`, `.bb-tab`, `.bb-opt`, `.bb-dot`, `.bb-solid`, `.bb-ghost`) at their exact
   values — Tailwind can't express `11.5px` / `.12em` cleanly.
2. `app/layout.tsx` — Source Serif 4 via `next/font/google`, mapped to `--font-sans`.
   Root layout drops the shell (see WS2).
3. Add `@phosphor-icons/react`, importing from `/dist/ssr` so server components work.
   lucide-react stays for the legacy plan/auth forms not being rewritten.
4. `components/ui/logo.tsx` → inline SVG mark.

### WS2 — Shell

Replace the client `SidebarWrapper` pathname check with **route groups**:

```
app/layout.tsx          html · fonts · ThemeProvider · Toaster
app/(auth)/layout.tsx   bare — login, welcome, privacy, support, reset, verify, error
app/(app)/layout.tsx    AppShell — /, /allocation, /accounts, /transactions, /plan, /settings
```

Moves: `app/page.tsx`, `accounts/`, `transactions/`, `plan/`, `settings/` → `app/(app)/`;
`app/error/` → `app/(auth)/error/`. URLs are unchanged (route groups don't affect paths).
`app/components/`, `app/queries/`, `app/mutations/` are not route segments and stay put.

New `components/shell/`:

- `AppShell.tsx` — server; reads the `bb-nav` cookie, renders sidebar or top-bar chrome
- `SideNav.tsx` / `TopNav.tsx` — client, active state from `usePathname()`
- `AppHeader.tsx` — screen title (sidebar mode) or brand + tabs (top mode), theme cycle,
  month stepper, avatar
- `ThemeCycle.tsx` — one-click light↔dark, next-themes
- `MonthStepper.tsx` — the header pill, replaces the old oversized `MonthSelector`
- `nav.ts` — shared nav config

Nav mode is a **cookie** (`bb-nav`), read server-side so there is no flash, written by a
server action from Settings.

### WS3 — Queries

- `app/queries/getNetByMonth.ts` — trailing-6-month net series
- `app/queries/getAccountActivity.ts` — per-account outflow, daily series, txn count, pace
- `getCashFlowSummary` — add `savingsRate`, `needsOutflow`/`wantsOutflow`/`savingsOutflow`
  aliases and `accountTotals`
- `lib/ledger/buckets.ts` — `group_kind` + amount → `needs | wants | savings | income | uncategorized`,
  plus the ramp colour for a slice index
- `lib/ledger/targets.ts` — `ALLOCATION_TARGETS = { needs: 50, wants: 30, savings: 20 }`
- `lib/ledger/insight.ts` — the Overview banner rules

### WS4 — Screens

| Screen | Route | Notes |
|---|---|---|
| Overview | `/` | greeting · 3 stat cards · net-by-month bars + latest activity · insight banner |
| Allocation | `/allocation` **(new)** | summary strip · SVG donut · 50/30/20 bars · category list |
| Accounts | `/accounts` | account cards with sparklines · import form · add-account form (restyled) |
| Transactions | `/transactions` | search + bucket/account chips · table · inline recategorise · load more |
| Plan | `/plan` | split card (new) + existing envelope planner tabs, restyled |
| Settings | `/settings` | appearance (theme ×3, nav ×2) · connections · preferences · household · logout |

### WS5 — Verify

`npm run lint`, `npm run build`, and a pass over each screen in both themes and both nav
modes. Then PR.

---

## 4. Risks

- **Serif body type at 13.5 px in dense tables** is the design's call, not a slip — the
  design system sets one family for everything. Worth a look on real data before it ships.
- **Two icon libraries** during the transition. Follow-up: finish the lucide → phosphor
  migration in the plan/auth forms.
- **Route-group move** touches relative imports inside the moved pages. Those pages are
  being rewritten anyway; `app/plan/components/*` are the ones to watch.
- **50/30/20 targets are constants.** The UI reads as if they are the user's own targets.
  A `household_allocation_targets` column/table is the honest fix and needs a migration —
  deliberately out of scope here.

## 5. Follow-ups (not in this change)

1. Per-household allocation targets (migration + Settings editor).
2. Savings goals and automatic rules — the two Plan cards dropped above.
3. Scheduled/recurring bills, which would make "safe to spend" and "upcoming" real.
4. Finish lucide → phosphor.
