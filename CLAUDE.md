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
*How code in this repo gets written: language, structure, naming, comments. Nothing about what the tool does.*

- **Keep `js/data/` free of logic.** Those two files exist so an engineer can verify numbers without reading code. Exported constants and comments only - no functions, no conditionals.
- **Keep `js/calc.js` free of the DOM.** It is the tested surface; anything that touches `document` belongs in `js/main.js`.
- **No em-dashes anywhere in this project. Ever.** Not in the page, not in the code, not in comments, not in the docs, not in commit messages. Use a comma, a colon, parentheses, or a plain hyphen.

## Hard Constraints
*The prohibitions or facts about the world Claude will otherwise get wrong.*

- **Never source allowable stress values from public web calculators, scraped tables, or memory.** ASME B31.3 Table A-1 is copyright; those sites carry their own risk and it does not transfer to EnerCorp. Values come from a licensed copy Adam provides, or they do not go in. Same for a whole material: no entry joins `MATS` without a licensed Table A-1 page behind every number.
- **`Y = 0.4` is valid only for ferritic materials below 900 °F.** Every `MATS` entry is capped at 900 for this reason, below the 1,000/1,100 °F the table actually reaches. The cap warns rather than refuses: above 900 the page prints a red note and still renders the ladder. Nothing in the code enforces the coupling. Raising a ceiling means implementing the Y-versus-temperature table first, not pasting in the remaining stress columns.
- **Thread and groove depth `Q` is fixed at zero** - correct for welded and flanged construction only. If threaded connections enter scope the input must come back; it is not a constant to be quietly deleted. 
