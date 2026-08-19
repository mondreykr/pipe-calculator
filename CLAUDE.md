# Pipe Wall Calculator

## About this project
A single-page internal EnerCorp web tool that answers one question: for a given pipe size and design condition, what schedule do I specify? It computes minimum wall thickness per ASME B31.3 para. 304.1.2, then lists the EnerCorp permitted schedules for that size and highlights the lightest one that passes. Users are EnerCorp engineers doing one-off checks; the output is a screening answer, not the calculation of record — the line list remains that.

Durable project knowledge lives in `.scaffold/`. Orient with `/scaffold-status` each new session.

**CLAUDE.md prescribes.** A rule that changes what you type belongs in CLAUDE.md. **`.scaffold/architecture.md` describes.** The stack, the engine, the reference data, and the evidence behind each rule belongs in architecture.md and `.scaffold/knowledge/`.

## Build, Run, Deploy

- **Build**
  - None, deliberately. No build step, no package manager, no bundler, no `node_modules` — one self-contained HTML file with inline `<style>` and inline `<script>`. There is no typecheck and no lint, and adding either is a decision, not a tidy-up.
  - Only external dependency is the Inter webfont from Google Fonts.

- **Run**
  - `start plain-calculator-v9.html`
  - Opens in the default browser. Pure client-side, no server. Loads with defaults applied (NPS 8, 660 psig, 500 °F, A333 Gr 6, 1/4" CA, E = 1.00, 12.5% mill tolerance) and results already computed.

- **Deploy — check**
  - No deploy pipeline exists.

- **Deploy — publish**
  - Not built. The target is internal hosting with a distributed URL.
  - **Adam's call. Never unasked, and never automated.** Gated behind the release-readiness milestone. Downstream are engineers specifying pipe from screenshotted results — a wrong allowable stress value ships as a wrong wall thickness, and no one downstream is positioned to catch it.

## Tests

**There is no test suite yet.** Building it is phase 02 of the active milestone. Until it exists, the entries below describe what to build and the rules that will govern it.

- **The regression suite** — AUTOMATIC once it exists, before commit
  - Command: to be established in phase 02. Keep it dependency-free — a plain HTML/JS assert page or a single Node script. Do not introduce a test framework and a package manager into a zero-dependency repo without asking.
  - **An edit is not finished until the page loads clean and this passes.**
  - Green means the arithmetic and the selection logic still behave. Green does **not** mean the answers are right — a passing suite over provisional stress values still produces wrong walls.
  - Never make a red run green by editing the expected values. The fixture is verified against a real line list; the code is what moves.

- **The line list 268782 fixture** — the seed cases inside the above
  - Six hand-verified cases in `.scaffold/knowledge/line-list-268782-verification.md`, plus the required additions: both sort traps, both stop conditions, the temperature guard.
  - Every case sits at 660 psig / 500 °F, which lands on a tabulated stress point — so the fixture never exercises the stress interpolation. Do not read a green fixture as coverage of `MATS`.

- **The outside-truth check** — GATED, offer whenever `MATS` or `PIPE` is touched
  - Compare changed values against a licensed ASME B31.3 2024 Table A-1 (stress) or a controlled pipe chart / ASME B36.10M (walls) — evidence this repo did not author. This is the only kind of check that can catch a wrong number; the regression suite only confirms what the file already claims about itself. Every unexplained difference gets an explanation. "Close enough" is not an outcome.
  - Adam supplies the licensed source. Do not go find one.

## Reviews (always gated on Adam)
**Never run one unasked.** Name what you'd run and why. Offer at two junctures: **the change is risky**, or **Adam is about to commit.**

| Review | Reach for it when |
|--------|-------------------|
| `/code-review` (medium) | Correctness bugs. The default escalation |
| `/verify` | Behaviour matters more than the diff — open the page and drive the real inputs |
| `/simplify` | Works but messy. Applies changes — commit first |
| `/security-review` | Rarely applicable — no network calls, no credentials, no input beyond numbers |
| `/adversarial-review` | Any change to `PIPE`, `MATS`, `interp`, the ladder sort, or the stop conditions. These are the paths where a plausible-looking edit silently produces an unsafe wall thickness |

## Code Conventions
`.scaffold/architecture.md` carries the evidence; this list is the instruction.

- **Sort the schedule ladder by wall thickness, never by schedule name or object insertion order.** From NPS 8 up XXS is thinner than Sch 160; from NPS 18 up XS is thinner than Sch 40. A name-ordered list selects heavier pipe than required.
- **Refuse rather than degrade.** Both stop conditions and the over-temperature guard suppress the schedule selection entirely. Never emit a partial answer — partial answers get screenshotted into emails.
- **Show the ladder, not a single answer.** Every permitted schedule stays visible with the minimum highlighted. Do not collapse it to one recommendation.
- **Keep it selection, not verification.** This tool picks a schedule from a requirement; the line list does the reverse. Do not add a "does this wall pass?" mode.
- **Add no interpretation layer.** Prose verdicts, colour-coded margin, and pipe-capacity-versus-flange-rating comparison were built and rejected. Do not reintroduce them as a helpful touch.
- **Give every reference value its source in a comment.** Confirmed and provisional are different states and must be visibly different in the file.
- **Keep the file dependency-free.** No framework, no build step, no package manager — unless Adam asks for one.

## Hard Constraints

- **Never source allowable stress values from public web calculators, scraped tables, or memory.** ASME B31.3 Table A-1 is copyright; those sites carry their own risk and it does not transfer to EnerCorp. Values come from a licensed copy Adam provides, or they do not go in.
- **Never describe this tool as ready, verified, or fit for use.** `MATS` is provisional — one value is confirmed, roughly fifteen are placeholder.
- **A106 Gr B and A312 TP316 are assumptions**, not confirmed EnerCorp materials. Line list 268782 shows only A333 Gr 6.
- **`Y = 0.4` is valid only for ferritic materials below 900 °F.** The material temperature ceilings keep every current path inside that range, but nothing in the code enforces the coupling. Any new material or raised ceiling must be checked against it.
- **Thread and groove depth `Q` is fixed at zero** — correct for welded and flanged construction only. If threaded connections enter scope the input must come back; it is not a constant to be quietly deleted.
- **NPS 2 OD is 2.375, not 2.38.** The source EnerCorp schedule matrix has the rounding error, which propagated into its ID column. The calculator is correct — do not "correct" it to match the matrix.
- **The out-of-scope list in `.scaffold/project.md` is by decision, not omission.** Each item was considered and rejected. Adding any back is Adam's call after consulting `DECISIONS.md`, which is not in this repository.
