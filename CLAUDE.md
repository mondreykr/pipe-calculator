# Pipe Wall Calculator

## About this project
A single-page internal EnerCorp web tool that answers one question: for a given pipe size and design condition, what schedule do I specify? It computes minimum wall thickness per ASME B31.3 para. 304.1.2, then lists the EnerCorp permitted schedules for that size and highlights the lightest one that passes. Users are EnerCorp engineers doing one-off checks; the output is a screening answer, not the calculation of record - the line list remains that.

Durable project knowledge lives in `.scaffold/`. Orient with `/scaffold-status` each new session.

**CLAUDE.md prescribes.** A rule that changes what you type belongs in CLAUDE.md. **`.scaffold/architecture.md` describes.** The stack, the engine, the reference data, and the evidence behind each rule belongs in architecture.md and `.scaffold/knowledge/`.

## Build, Run, Deploy

- **Build**
  - None, deliberately. Vanilla JavaScript, ES6 modules, no bundler, no framework, no runtime dependencies. `package.json` exists only to declare `"type": "module"` and the test script - nothing is compiled, and `npm install` installs nothing. There is no typecheck and no lint, and adding either is a decision, not a tidy-up.
  - Only external asset is the Inter webfont from Google Fonts.

- **Run**
  - `python -m http.server 8000`, then open `http://localhost:8000/`.
  - **Opening `index.html` from disk does not work.** ES6 modules are blocked over `file://`, so a double-click gives a blank page with a console error, not a visible failure. Always serve it.
  - Loads with defaults applied (NPS 8, 660 psig, 500 °F, A333 Gr 6, 1/4" CA, E = 1.00, 12.5% mill tolerance) and results already computed.

- **Deploy - check**
  - `gh api repos/:owner/:repo/pages` reports the source branch, path and build status. Reports; changes nothing.
  - Live at https://mondreykr.github.io/pipe-calculator/

- **Deploy - publish**
  - **`git push origin main` is the deploy.** GitHub Pages serves `main` from the root folder with no build. There is no separate publish command, which means every push to `main` is visible to anyone with the URL within a minute.
  - **Adam's call on what reaches `main`. Never push unasked.** Downstream are engineers specifying pipe from screenshotted results - a wrong allowable stress value ships as a wrong wall thickness, and no one downstream is positioned to catch it.
  - The current URL is Adam's own preview, on his personal account. The destination is the `enercorp` org alongside `bom-tool`, at which point other people get access. Until that move, do not treat the deployed page as something anyone else is reading.
  - The ASME copyright question on publishing ~15 extracted stress values is **settled and accepted**. Do not re-raise it.

## Tests

- **`npm test`** - AUTOMATIC, before commit
  - `npm test`, or `node test/run-tests.js`. Node only, no dependencies to install, no framework. 23 checks.
  - **An edit is not finished until this passes and the page still loads clean in a browser.** The suite exercises `js/calc.js` and the data files; it never touches `js/main.js`, so a broken form is invisible to it - serve the page and look.
  - Green means the arithmetic and the selection logic still behave. Green does **not** mean the answers are right - a passing suite over provisional stress values still produces wrong walls.
  - **Never make a red run green by editing an expected value.** The line list cases were verified by hand against a real line list; the code is what moves.
  - Do not add a test framework or a runtime dependency to make it nicer. It is deliberately plain.

- **The line list 268782 fixture** - the six seed cases inside the above
  - Verified by hand against a real line list; the record is `.scaffold/knowledge/line-list-268782-verification.md`.
  - The cases pass `S` in directly rather than reading `MATS`, so a placeholder stress value can never make the suite look like verification. Keep it that way.
  - Every case sits at 660 psig / 500 °F, which lands on a tabulated stress point - so the fixture never exercises the stress interpolation. Do not read a green run as coverage of `MATS`.

- **The outside-truth check** - GATED, offer whenever `MATS` or `PIPE` is touched
  - Compare changed values against a licensed ASME B31.3 2024 Table A-1 (stress) or a controlled pipe chart / ASME B36.10M (walls) - evidence this repo did not author. This is the only kind of check that can catch a wrong number; the regression suite only confirms what the file already claims about itself. Every unexplained difference gets an explanation. "Close enough" is not an outcome.
  - Adam supplies the licensed source. Do not go find one.

## Reviews (always gated on Adam)
**Never run one unasked.** Name what you'd run and why. Offer at two junctures: **the change is risky**, or **Adam is about to commit.**

| Review | Reach for it when |
|--------|-------------------|
| `/code-review` (medium) | Correctness bugs. The default escalation |
| `/verify` | Behaviour matters more than the diff - open the page and drive the real inputs |
| `/simplify` | Works but messy. Applies changes - commit first |
| `/security-review` | Rarely applicable - no network calls, no credentials, no input beyond numbers |
| `/adversarial-review` | Any change to `PIPE`, `MATS`, `interp`, the ladder sort, or the stop conditions. These are the paths where a plausible-looking edit silently produces an unsafe wall thickness |

## Code Conventions
`.scaffold/architecture.md` carries the evidence; this list is the instruction.

- **Sort the schedule ladder by wall thickness, never by schedule name or object insertion order.** From NPS 8 up XXS is thinner than Sch 160; from NPS 18 up XS is thinner than Sch 40. A name-ordered list selects heavier pipe than required.
- **Refuse rather than degrade, for the two stop conditions only.** `t >= D/6` and "no permitted schedule is thick enough" suppress the schedule selection entirely. Never emit a partial answer there - partial answers get screenshotted into emails.
- **The temperature limits warn; they do not suppress.** Above `max` and below a numeric `min` the tool prints a red note and still renders the ladder with a schedule highlighted. Adam's decision, 2026-08-20: a note is sufficient for a screening tool. Do not convert either into a suppression without asking him, and do not describe them as refusals.
- **Never invent a minimum temperature.** Table A-1C prints a Note (6) letter code instead of a number for some materials. Carry the code as a string and tell the user the tool cannot check it. A guessed floor is worse than an admitted gap.
- **Show the ladder, not a single answer.** Every permitted schedule stays visible with the minimum highlighted. Do not collapse it to one recommendation.
- **Keep it selection, not verification.** This tool picks a schedule from a requirement; the line list does the reverse. Do not add a "does this wall pass?" mode.
- **Add no interpretation layer.** Prose verdicts, colour-coded margin, and pipe-capacity-versus-flange-rating comparison were built and rejected. Do not reintroduce them as a helpful touch.
- **Give every reference value its source in a comment.** Confirmed and provisional are different states and must be visibly different in the file.
- **Keep `js/data/` free of logic.** Those two files exist so an engineer can verify numbers without reading code. Exported constants and comments only - no functions, no conditionals.
- **Keep `js/calc.js` free of the DOM.** It is the tested surface; anything that touches `document` belongs in `js/main.js`.
- **No em-dashes anywhere in this project. Ever.** Not in the page, not in the code, not in comments, not in the docs, not in commit messages. Use a comma, a colon, parentheses, or a plain hyphen. Aside: the `.scaffold/archive/` handoff is left as written, being a historical record.
- **Dropdown labels put the qualifier in parentheses**, not after a dash: `1.00 (100% radiography)`, `A333 Gr 6 (seamless/welded carbon steel pipe, low-temperature service)`. Do not nest a second set of parentheses inside the qualifier.
- **Add no runtime dependencies and no build step.** No framework, no bundler, no npm packages that ship to the browser - unless Adam asks for one.

## Hard Constraints

- **Never source allowable stress values from public web calculators, scraped tables, or memory.** ASME B31.3 Table A-1 is copyright; those sites carry their own risk and it does not transfer to EnerCorp. Values come from a licensed copy Adam provides, or they do not go in.
- **Both reference tables are verified against outside sources.** `MATS`: six carbon steels off a licensed Table A-1C, three independent transcriptions, scans in `.scaffold/knowledge/asme-a1c-scans/`. `PIPE`: every OD, wall and permitted schedule matched against both an ANSI B36.10 chart and the EnerCorp SW Routing Component Criteria workbook. One value stays open, NPS 1/2 Sch 160, where the two sources disagree by 0.001 inch. The tool is still a screening answer and the line list is still the calculation of record, but reference data is no longer the release blocker. Sign-off and the org move are.
- **Never add a material without a licensed Table A-1 page for it.** A312 TP316 was removed rather than kept on placeholder values. `MATS` contains no unverified value and must stay that way.
- **A106 Gr B is an assumption** about what EnerCorp specifies for pipe - its stress values are confirmed, its presence on the list is not. Line list 268782 shows only A333 Gr 6. A420 WPL6, A234 WPB, A105 and A350 LF2 Cl 1 are fitting and forging materials, deliberately included; the output still reads as a pipe schedule and does not know a forging was selected.
- **`Y = 0.4` is valid only for ferritic materials below 900 °F.** Every `MATS` entry is capped at 900 for this reason, below the 1,000/1,100 °F the table actually reaches. The cap warns rather than refuses, so a user can still read an answer above it; the note says the stress is held flat and the result is not valid. Nothing in the code enforces the coupling. Raising a ceiling means implementing the Y-versus-temperature table first, not pasting in the remaining stress columns.
- **Thread and groove depth `Q` is fixed at zero** - correct for welded and flanged construction only. If threaded connections enter scope the input must come back; it is not a constant to be quietly deleted.
- **NPS 2 OD is 2.375, not 2.38.** The source EnerCorp schedule matrix has the rounding error, which propagated into its ID column. The calculator is correct - do not "correct" it to match the matrix.
- **The out-of-scope list in `.scaffold/project.md` is by decision, not omission.** Each item was considered and rejected. Adding any back is Adam's call after consulting `DECISIONS.md`, which is not in this repository.
