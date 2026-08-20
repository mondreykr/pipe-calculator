---
type: state
schema_version: 2
updated: 2026-08-20
---

# Active focus
The result side of the page was redesigned this session and is now in the app. Each permitted schedule draws a bar sized to its wall thickness, and the minimum wall required labels the line those bars are measured against, so the number and the line read as one thing rather than two facts to compare. That settles the long-open question of whether to show margin: the answer is yes, as a proportional bar rather than a colour treatment, which reverses an earlier rejection. Alongside it, `CLAUDE.md` was cut back to instructions that change what gets typed, and the rules memorialising rejected experiments were removed, on the principle that the code is the source of truth and the scaffold supports it where needed. Sign-off and the move to the `enercorp` org are no longer release requirements. The `wip/` scratch folder is no longer tracked, though the spreadsheet it held stays recoverable from git history. Verification of both reference tables is untouched and still holds. What stands between this and release is a second line list at different conditions, to exercise the stress interpolation no existing test reaches.

# Next
Milestone `01-release-readiness`, phase `03-second-line-list`. No phase plan is written yet - run `/scaffold-plan` to scope it. The work is to run a second real line list at a different pressure and temperature, because every case in the existing fixture sits at 660 psig / 500 °F, which lands exactly on a tabulated stress point and therefore never exercises the interpolation. Phase `04-release-hardening` is unblocked and can run in either order; its display question is now settled, so what remains there is the Inter webfont and the stamping question.

# Blockers
None.

# Open Questions
- **NPS 1/2 Sch 160 is 0.187 or 0.188.** The ANSI B36.10 chart says 0.187 and the EnerCorp component criteria workbook says 0.188. `PIPE` carries 0.187, being the source Adam designated as trusted and the conservative direction. One look at a controlled table closes it.
- **Table A-1C Note (6) letter codes are not encoded.** A106 Gr B and A234 WPB print a code rather than a minimum temperature, so the tool cannot check their cold limit and says so instead. Supplying Note (6) would turn both into real checks.
- **Should the required wall render to four decimals?** The comparison runs at full precision, but a requirement of 0.5004" displays as "0.500" beside a 0.500" wall that fails it.
- **Below the lowest tabulated temperature the interpolation still clamps.** The tool now warns below a material's listed minimum, but `interpolateStress` itself continues to clamp rather than refuse, and the clamping is pinned by a test. Whether that should become a refusal is still open.
