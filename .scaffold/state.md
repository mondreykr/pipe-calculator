---
type: state
schema_version: 2
updated: 2026-08-18
---

# Active focus
The calculator works and the math is right. Six lines from a real line list were run through both the tool and the hand method, and they matched. What is not right is the data the math runs on: the allowable stress numbers are mostly placeholders, and one wrong number there quietly produces a wrong pipe wall. So the job now is not building — it is checking. Verify the stress table against a licensed copy of the code book, confirm the material list, build a test suite so the check does not have to be redone by hand every time, get an engineer to sign off, and put it on internal hosting. Nothing should be added to the tool until that is done.

# Next
Milestone `01-release-readiness`, phase 01-verify-reference-data. Blocked on a licensed copy of ASME B31.3 2024 Table A-1 — roughly fifteen allowable stress values need checking against it, and they may not come from anywhere else. Phase 02 (extract the reference tables, build the regression suite) can start in parallel and does not need the code book.

# Blockers
- **Licensed ASME B31.3 2024 Table A-1 is not available in this repository or session.** Phase 01 cannot proceed without it, and the values may not be sourced from public web calculators or memory — Table A-1 is ASME copyright and that risk does not transfer to EnerCorp. Adam needs to supply it.

# Open Questions
- **Should the result show margin?** It was deliberately removed as visual noise, but line 10-CLS-G-001 passed by 0.0038" and the engineer went up a schedule anyway — exactly the case where a number would have helped. Possibly a plain figure rather than a colour treatment.
- **Should the required wall render to four decimals?** The comparison runs at full precision, but a requirement of 0.5004" displays as "0.500" beside a 0.500" wall that fails it.
- **Should results carry a job reference and a build version stamp?** They will be screenshotted into emails, and without one there is no way to tell which build produced a given result or what it was for.
- **Below the lowest tabulated temperature the interpolation clamps rather than refusing.** Conservative for carbon steel, but it should be a deliberate decision given the −50 °F MDMT on this equipment.
- **Where are the specification documents?** `SPEC.md`, `DECISIONS.md`, `DELIVERABLES.md` and the earlier `STATE.md` are referenced as living in `docs/20260818-pipe-wall-screening-spec/`, which is not in this repository. `DECISIONS.md` holds twelve numbered decisions with the rejected alternative for each and should be consulted before reversing anything — it needs to be brought in or located.
