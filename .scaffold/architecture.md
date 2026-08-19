---
type: architecture
schema_version: 2
updated: 2026-08-18
---

# Architecture

## Stack
One self-contained HTML file: `plain-calculator-v9.html`. Inline `<style>`, inline `<script>`, vanilla JavaScript, no framework.

No build step, no package manager, no bundler, no `node_modules`. This is deliberate — the file is opened directly and works.

Sole external dependency: the Inter webfont from Google Fonts, loaded by `<link>`. Nothing else leaves the page.

## Tenancy / isolation
Not applicable. Pure client-side, no server, no persistence, no multi-user model.

## Auth
None. Distribution is by internal URL; there is no login and no per-user state.

## Data access
Three reference tables live as `const` objects in the inline script.

**`PIPE`** — outside diameter and the permitted schedule set per NPS. Sourced from the EnerCorp schedule matrix; walls are ASME B36.10M nominal. Sizes 1-1/4, 2-1/2, 3-1/2, 5 and 22 are excluded by that matrix. Where STD and Sch 40 are identical (up to NPS 10) or XS and Sch 80 are identical (up to NPS 8), only one designation is listed. NPS 14 and above carry no XXS. NPS 16 carries no Sch 40, since it equals XS. Provenance and the source-matrix error are in `knowledge/reference-data-provenance.md`.

**`MATS`** — allowable stress by material, as a temperature/stress point list plus a maximum tabulated temperature. **Provisional.** Exactly one value is confirmed. See `knowledge/reference-data-provenance.md`; this is the release blocker.

**`CAS` / `JOINTS` / `TOLS`** — corrosion allowance options (0 through 1/4"), joint efficiency (1.00 / 0.90 / 0.80, matching the line-list rule that derives E from radiography coverage), and mill tolerance (12.5% default, 10% for API 5L, plus custom entry).

Splitting the reference data out of the calculation logic, so a reviewer can revise numbers without reading code, is scheduled work — see the active milestone.

## Deployment
Not deployed. The target is internal hosting with a distributed URL, gated behind the release-blocking action items in the active milestone. There is no pipeline; deployment will be a file copy.

Git remote: `https://github.com/mondreykr/pipe-calculator.git` (private).

## Conventions

**The engine.**
```
t          = P·D / (2·(S·E + Y·P))          pressure design thickness
minimum    = (t + c + q) / (1 − mill_tol)   minimum nominal wall to purchase
selection  = lightest permitted schedule whose wall ≥ minimum
```
`P` is design pressure (psig), `D` outside diameter (in), `S` allowable stress at design temperature (psi), `E` joint efficiency, `Y` = 0.4, `c` corrosion allowance (in), `q` thread or groove depth (fixed at zero). This is algebraically identical to the line-list method, which computes available wall as `(nominal × 0.875) − CA − thread` and requires it to exceed `t`. The equivalence is confirmed — see `knowledge/line-list-268782-verification.md`.

**The schedule ladder is sorted by wall thickness, never by schedule name or object insertion order.** This is not cosmetic. From NPS 8 upward XXS is thinner than Sch 160; from NPS 18 upward XS is thinner than Sch 40. A name-ordered list selects heavier pipe than required. The `.sort((a,b)=>a[1]-b[1])` in `run()` is load-bearing.

**Stop conditions suppress the selection entirely rather than degrading it.** Two of them: `t ≥ D/6` (the thin-wall formula no longer applies) and no permitted schedule satisfying the minimum. Each produces a plain refusal and no number.

**Temperature guard.** Each material carries a maximum tabulated temperature; above it the tool refuses rather than extrapolating. Below the lowest tabulated point, `interp` clamps to the lowest value — conservative for carbon steel, but an open question given the −50 °F MDMT on this equipment.

**`Y` is fixed at 0.4**, valid for ferritic materials below 900 °F. The material temperature ceilings currently keep every path inside that range, but the coupling is implicit rather than enforced in code.

**Thread and groove depth `Q` is fixed at zero**, correct for welded and flanged construction. If threaded connections enter scope the input must return.

**Every reference value carries its source in a comment.** Confirmed and provisional are different states and must be visibly different in the file.

## Run / env
`start plain-calculator-v9.html` opens it in the default browser. No server, no install, no network required beyond the Google Fonts request.

It loads with defaults applied and results already computed: NPS 8, 660 psig, 500 °F, A333 Gr 6, 1/4" corrosion allowance, E = 1.00, 12.5% mill tolerance. Every input recomputes on `input`.

**There is no test suite.** Building one is scheduled work in the active milestone; the seed fixture is in `knowledge/line-list-268782-verification.md`.
