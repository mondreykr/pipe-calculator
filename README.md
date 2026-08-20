# Pipe Wall Calculator

An internal EnerCorp web tool that answers one question: for a given pipe size and design condition, what schedule do I specify?

It computes the minimum wall thickness required under ASME B31.3 para. 304.1.2, then lists the EnerCorp permitted schedules for that size and highlights the lightest one that satisfies the requirement.

**Preview:** https://mondreykr.github.io/pipe-calculator/ - a staging deployment on a personal account, not yet handed to anyone. See Status below.

## What it does

- **Minimum wall** - pressure design thickness plus corrosion allowance, grossed up for mill tolerance
- **Schedule ladder** - every permitted schedule for the size, ordered by wall thickness, with sub-minimum rows dimmed and the lightest passing row highlighted
- **Refuses rather than guesses** - out-of-range temperature, `t ≥ D/6`, or no permitted schedule thick enough each produce a plain statement and no number

Inputs: pipe size, design pressure, design temperature, material, corrosion allowance, joint efficiency, mill tolerance.

This is a screening tool. **The line list remains the calculation of record.**

## Out of scope

Branch reinforcement (304.3), external pressure and vacuum, thermal expansion and support loading, fatigue, Category M and severe cyclic service, flange and fitting ratings, MDMT. Also excluded: multi-line batch processing, cost output, saved sessions, user accounts.

Each of these was considered during specification and rejected. See `.scaffold/project.md`.

## Tech

Vanilla JavaScript (ES6 modules), no build step, no framework. Runs entirely in the browser. The only external asset is the Inter webfont from Google Fonts.

```
index.html            the page
css/styles.css        styling
js/main.js            form wiring and rendering
js/calc.js            the engine - pure functions, no DOM
js/data/pipe.js       pipe dimensions and permitted schedules   (reference data)
js/data/materials.js  allowable stress by material              (reference data)
test/run-tests.js     regression suite
```

The two files under `js/data/` are reference data with no logic in them, so values can be reviewed and revised without reading code.

## Running it locally

You don't have to - the preview URL above serves the current `main`. To run it yourself:

ES6 modules require HTTP - opening `index.html` from disk will not work.

```
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Tests

```
npm test          # or: node test/run-tests.js
```

Node only, no dependencies to install. Covers the six hand-verified cases from line list 268782, both schedule-ordering traps, both stop conditions, and the temperature guard.

**Green means the arithmetic and the selection logic still behave. Green does not mean the answers are right** - see Status.

## Status

**Working prototype. Both reference tables now verified against outside sources.**

The **allowable stress table** in `js/data/materials.js` is confirmed: six carbon steels - A106 Gr B, A333 Gr 6, A234 WPB, A420 WPL6, A105 and A350 LF2 Cl 1 - transcribed from page scans of a licensed ASME B31.3 Table A-1C, each read three times independently with no disagreements. Every entry is capped at 900 °F because `calc.js` uses a fixed `Y = 0.4`, which B31.3 allows only for ferritic materials at or below that temperature.

The **pipe dimension table** in `js/data/pipe.js` is confirmed against two independent sources: an ANSI B36.10 wall thickness chart and the EnerCorp SW Routing Component Criteria workbook. All 16 ODs, all 68 walls and the permitted schedule set per size matched both. One value is still open: NPS 1/2 Sch 160, where the chart says 0.187 and the workbook says 0.188; the code carries the conservative 0.187.

Method and evidence for both are recorded in `.scaffold/knowledge/reference-data-provenance.md`.

Release also needs recorded engineering sign-off and the repository moved to the `enercorp` org. See `.scaffold/milestones/01-release-readiness/milestone.md`.

## Project documentation

Durable project knowledge lives in `.scaffold/` - what the tool is and is not (`project.md`), how it is built (`architecture.md`), where the work stands (`state.md`), and the verification evidence (`knowledge/`). `CLAUDE.md` carries the rules for working in this repository.
