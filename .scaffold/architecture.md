---
type: architecture
schema_version: 2
updated: 2026-08-18
---

# Architecture

## Stack
Vanilla JavaScript, ES6 modules, no framework and no build step. Layout matches `enercorp/bom-tool` so both repositories read the same way.

```
index.html            the page
css/styles.css        styling
js/main.js            form wiring and rendering — the only file that touches the DOM
js/calc.js            the engine — pure functions, no DOM, the tested surface
js/data/pipe.js       pipe dimensions and permitted schedules   (reference data, no logic)
js/data/materials.js  allowable stress by material              (reference data, no logic)
test/run-tests.js     regression suite, node only
package.json          declares "type": "module" and the test script — nothing is compiled
```

No runtime dependencies; `npm install` installs nothing. Sole external asset is the Inter webfont from Google Fonts, loaded by `<link>`. Nothing else leaves the page.

The `js/data/` split exists for one reason: an engineer verifying fifteen allowable stress values opens a file containing only those values, never the calculation logic.

## Tenancy / isolation
Not applicable. Pure client-side, no server, no persistence, no multi-user model.

## Auth
None. Distribution is by internal URL; there is no login and no per-user state.

## Data access
Two reference tables live as exported constants in `js/data/`, one file each, deliberately free of logic. The input option lists live in `js/main.js` because they configure the form rather than describing the world.

**`PIPE`** — outside diameter and the permitted schedule set per NPS. Sourced from the EnerCorp schedule matrix; walls are ASME B36.10M nominal. Sizes 1-1/4, 2-1/2, 3-1/2, 5 and 22 are excluded by that matrix. Where STD and Sch 40 are identical (up to NPS 10) or XS and Sch 80 are identical (up to NPS 8), only one designation is listed. NPS 14 and above carry no XXS. NPS 16 carries no Sch 40, since it equals XS. Provenance and the source-matrix error are in `knowledge/reference-data-provenance.md`.

**`MATS`** — allowable stress by material, as a temperature/stress point list plus a maximum tabulated temperature. **Provisional.** Exactly one value is confirmed. See `knowledge/reference-data-provenance.md`; this is the release blocker.

**`CAS` / `JOINTS` / `TOLS`** (in `js/main.js`) — corrosion allowance options (0 through 1/4"), joint efficiency (1.00 / 0.90 / 0.80, matching the line-list rule that derives E from radiography coverage), and mill tolerance (12.5% default, 10% for API 5L, plus custom entry).

## Deployment
Not deployed. The target is GitHub Pages serving the `main` branch from the root folder — the same configuration as `enercorp/bom-tool`, which GitHub reports as build type "legacy", meaning the committed files are served as-is with no build. Pushing to `main` is the deploy.

Git remote: `https://github.com/mondreykr/pipe-calculator.git` (private, personal account). `bom-tool` sits under the `enercorp` org instead; transferring this repository there is an open question.

**A Pages site is publicly reachable even when its repository is private.** Verified 2026-08-18: `enercorp/bom-tool` is a private repository, and an anonymous unauthenticated request to `https://enercorp.github.io/bom-tool/` returns HTTP 200 with the live application. The site is unlisted, not access-controlled. This is decision-relevant here because the release milestone loads ASME Table A-1 values into `js/data/materials.js`.

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
`python -m http.server 8000`, then `http://localhost:8000/`. Python 3.14 is on this machine; any static server does.

**Opening `index.html` from disk does not work.** Browsers block ES6 module loading over `file://`, and the failure is a blank page with a console error rather than anything visible. This is the cost of the module split and it was accepted knowingly — the delivery model is a bookmarked URL, not a file anyone opens locally.

It loads with defaults applied and results already computed: NPS 8, 660 psig, 500 °F, A333 Gr 6, 1/4" corrosion allowance, E = 1.00, 12.5% mill tolerance. Every input recomputes on `input`.

Tests: `npm test` (or `node test/run-tests.js`). Node only, nothing to install. 17 checks over `js/calc.js` and the data files. Nothing covers `js/main.js` — the form is verified by serving the page and looking at it.
