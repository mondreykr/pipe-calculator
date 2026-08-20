---
type: architecture
schema_version: 2
updated: 2026-08-20
---

# Architecture

## Stack
Vanilla JavaScript, ES6 modules, no framework and no build step. Layout matches `enercorp/bom-tool` so both repositories read the same way.

```
index.html            the page
css/styles.css        styling
js/main.js            form wiring and rendering - the only file that touches the DOM
js/calc.js            the engine - pure functions, no DOM, the tested surface
js/data/pipe.js       pipe dimensions and permitted schedules   (reference data, no logic)
js/data/materials.js  allowable stress by material              (reference data, no logic)
test/run-tests.js     regression suite, node only
package.json          declares "type": "module" and the test script - nothing is compiled
```

No runtime dependencies; `npm install` installs nothing. Sole external asset is the Inter webfont from Google Fonts, loaded by `<link>`. Nothing else leaves the page.

The `js/data/` split exists for one reason: an engineer verifying the allowable stress values opens a file containing only those values, never the calculation logic. That split is what made the 2026-08-20 verification a diff rather than a code review.

## Tenancy / isolation
Not applicable. Pure client-side, no server, no persistence, no multi-user model.

## Auth
None. Distribution is by internal URL; there is no login and no per-user state.

## Data access
Two reference tables live as exported constants in `js/data/`, one file each, deliberately free of logic. The input option lists live in `js/main.js` because they configure the form rather than describing the world.

**`PIPE`** - outside diameter and the permitted schedule set per NPS. Walls are ASME B36.10M nominal. **Verified 2026-08-20** against two independent sources: an ANSI B36.10 wall thickness chart and the EnerCorp SW Routing Component Criteria workbook. All 16 outside diameters, all 68 walls and the permitted schedule set per size matched both; one value stays open where the two sources disagree by 0.001 inch. Sizes 1-1/4, 2-1/2, 3-1/2, 5 and 22 are excluded by that matrix. Where STD and Sch 40 are identical (up to NPS 10) or XS and Sch 80 are identical (up to NPS 8), only one designation is listed. NPS 14 and above carry no XXS. NPS 16 carries no Sch 40, since it equals XS. Provenance and the source-matrix error are in `knowledge/reference-data-provenance.md`.

**`MATS`** - allowable stress by material, as a temperature/stress point list plus a minimum and a maximum temperature. **Verified 2026-08-20** against a licensed ASME B31.3 Table A-1C, six carbon steels, three independent transcriptions. `min` is Table A-1C's own figure, carried as a string where the table prints a Note (6) letter code instead of a number. `max` is this tool's `Y = 0.4` ceiling of 900 °F, not the table's, which reaches 1,000 or 1,100. Both limits warn and neither suppresses the answer. See `knowledge/reference-data-provenance.md`.

**`CAS` / `JOINTS` / `TOLS`** (in `js/main.js`) - corrosion allowance options (0 through 1/4"), joint efficiency (1.00 / 0.90 / 0.80, matching the line-list rule that derives E from radiography coverage), and mill tolerance (12.5% default, 10% for API 5L, plus custom entry).

## Deployment
GitHub Pages, serving the `main` branch from the root folder. GitHub reports build type "legacy", meaning the committed files are served as-is with no build. **Pushing to `main` is the deploy** - there is no pipeline and no build step.

Live at **https://mondreykr.github.io/pipe-calculator/** since 2026-08-18.

**This is a staging home, not the final one.** The repository is currently `mondreykr/pipe-calculator` (public, personal account) and is used this way so Adam can look at the real deployed page instead of a local server. The destination is the `enercorp` org, matching `enercorp/bom-tool`, at which point the URL changes and other people get access. Treat the current URL as Adam's own preview.

A Pages site is reachable by anyone with the URL regardless of repository visibility - verified 2026-08-18 against `enercorp/bom-tool`, a private repository whose Pages site answers an anonymous request with HTTP 200. Publishing the tool's extracted allowable stress values (72, being twelve temperature points for each of six materials) is settled and accepted: the extract is not a reproduction of Table A-1, EnerCorp holds a licence, and the risk was judged negligible. Do not re-raise it.

**The repository is public and that is deliberate.** Adam reviewed what `.scaffold/` exposes - the line list 268782 identifiers and line tags, and the noted error in the EnerCorp schedule matrix - and ruled none of it sensitive (2026-08-18). Settled. Do not re-raise repository visibility or the content of the knowledge files.

Local development does not require the deployed site - see Run / env.

## Conventions

**The engine.**
```
t          = P·D / (2·(S·E + Y·P))          pressure design thickness
minimum    = (t + c + q) / (1 − mill_tol)   minimum nominal wall to purchase
selection  = lightest permitted schedule whose wall ≥ minimum
```
`P` is design pressure (psig), `D` outside diameter (in), `S` allowable stress at design temperature (psi), `E` joint efficiency, `Y` = 0.4, `c` corrosion allowance (in), `q` thread or groove depth (fixed at zero). This is algebraically identical to the line-list method, which computes available wall as `(nominal × 0.875) − CA − thread` and requires it to exceed `t`. The equivalence is confirmed - see `knowledge/line-list-268782-verification.md`.

**The schedule ladder is sorted by wall thickness, never by schedule name or object insertion order.** This is not cosmetic. From NPS 8 upward XXS is thinner than Sch 160; from NPS 18 upward XS is thinner than Sch 40. A name-ordered list selects heavier pipe than required. The numeric sort in `ladder()` (`js/calc.js`) is load-bearing.

**Stop conditions suppress the selection entirely rather than degrading it.** Two of them: `t ≥ D/6` (the thin-wall formula no longer applies) and no permitted schedule satisfying the minimum. Each produces a plain refusal and no number.

**Temperature limits warn; they do not suppress.** Unlike the stop conditions above, both limits print a note and leave the ladder rendered with a schedule highlighted - Adam's decision 2026-08-20, on the grounds that a note is sufficient for a screening tool. Above `max` the interpolation clamps, so the answer stops responding to temperature. Below a numeric `min` the tool warns. Where Table A-1C prints a Note (6) letter code instead of a minimum, there is no number to compare and the tool says so rather than implying a pass; that applies to A106 Gr B and A234 WPB.

**`Y` is fixed at 0.4**, valid for ferritic materials below 900 °F. Every material's `max` is set to 900 for this reason rather than to its own tabulated ceiling, but the coupling is implicit rather than enforced in code - a new material or a raised ceiling has to be checked against it by hand.

**Thread and groove depth `Q` is fixed at zero**, correct for welded and flanged construction. If threaded connections enter scope the input must return.

**Every reference value carries its source in a comment**, citing its Table A-1C line number or the chart it was matched against. Confirmed and provisional are different states and must be visibly different in the file.

## Run / env
`python -m http.server 8000`, then `http://localhost:8000/`. Python 3.14 is on this machine; any static server does.

**Opening `index.html` from disk does not work.** Browsers block ES6 module loading over `file://`, and the failure is a blank page with a console error rather than anything visible. This is the cost of the module split and it was accepted knowingly - the delivery model is a bookmarked URL, not a file anyone opens locally.

It loads with defaults applied and results already computed: NPS 8, 660 psig, 500 °F, A333 Gr 6, 1/4" corrosion allowance, E = 1.00, 12.5% mill tolerance. Every input recomputes on `input`.

Tests: `npm test` (or `node test/run-tests.js`). Node only, nothing to install. 17 checks over `js/calc.js` and the data files. Nothing covers `js/main.js` - the form is verified by serving the page and looking at it.
