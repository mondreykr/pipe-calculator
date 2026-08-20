---
type: milestone
schema_version: 2
updated: 2026-08-20
---

# Milestone 01 - release-readiness

## Objectives
Turn a working prototype with correct math and unverified numbers into a tool an EnerCorp engineer can be handed. The math is done; what remains is proving the reference data is right, making that provable repeatedly, and getting a person to sign their name to it.

## Phases
- [x] 01-verify-reference-data - done 2026-08-20. Six carbon steels off a licensed Table A-1C; every pipe OD, wall and permitted schedule matched against an ANSI B36.10 chart and the EnerCorp component criteria workbook. A312 TP316 removed rather than kept on placeholder values. Open: NPS 1/2 Sch 160, where the two pipe sources disagree by 0.001 inch
- [x] 02-regression-harness - split the reference tables out of the calculation logic, then build the dependency-free regression suite from the line list 268782 fixture plus the sort traps, stop conditions and temperature guard - 2026-08-18
- [ ] 03-second-line-list - run a second line list at a different pressure and temperature, to exercise the stress interpolation the first verification never touched
- [ ] 04-release-hardening - self-host the Inter webfont or set a clean fallback stack, and settle the display and stamping open questions
- [ ] 05-signoff-and-handover - record engineering sign-off with a name and a date, transfer the repository to the `enercorp` org, and distribute the resulting URL

## Done-contract
- Every value in `MATS` traces to a licensed Table A-1 citation, and the material list is confirmed against what EnerCorp actually specifies.
- The regression suite runs from a single command, covers the six line list 268782 cases plus both sort traps, both stop conditions and the temperature guard, and passes.
- A second line list at different conditions matches, exercising the stress interpolation.
- The tool renders correctly with Google Fonts unreachable.
- Engineering sign-off is recorded in the repository with a name and a date.
- The repository has moved to the `enercorp` org and the tool is reachable at a URL that engineers have been given.
