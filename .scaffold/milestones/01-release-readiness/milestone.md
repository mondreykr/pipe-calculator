---
type: milestone
schema_version: 2
updated: 2026-08-18
---

# Milestone 01 — release-readiness

## Objectives
Turn a working prototype with correct math and unverified numbers into a tool an EnerCorp engineer can be handed. The math is done; what remains is proving the reference data is right, making that provable repeatedly, and getting a person to sign their name to it.

## Phases
- [ ] 01-verify-reference-data — check every allowable stress value against a licensed B31.3 2024 Table A-1, confirm the material list, spot-check the pipe wall table against a controlled chart
- [ ] 02-regression-harness — split the reference tables out of the calculation logic, then build the dependency-free regression suite from the line list 268782 fixture plus the sort traps, stop conditions and temperature guard
- [ ] 03-second-line-list — run a second line list at a different pressure and temperature, to exercise the stress interpolation the first verification never touched
- [ ] 04-release-hardening — self-host the Inter webfont or set a clean fallback stack, and settle the display and stamping open questions
- [ ] 05-signoff-and-deploy — record engineering sign-off with a name and a date, then deploy to internal hosting and distribute the URL

## Done-contract
- Every value in `MATS` traces to a licensed Table A-1 citation, and the material list is confirmed against what EnerCorp actually specifies.
- The regression suite runs from a single command, covers the six line list 268782 cases plus both sort traps, both stop conditions and the temperature guard, and passes.
- A second line list at different conditions matches, exercising the stress interpolation.
- The tool renders correctly with Google Fonts unreachable.
- Engineering sign-off is recorded in the repository with a name and a date.
- The tool is reachable at an internal URL that engineers have been given.
