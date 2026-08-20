---
type: state
schema_version: 2
updated: 2026-08-20
---

# Active focus
Both reference tables are now verified against outside evidence, which was the thing standing between this tool and being usable. The allowable stress table was rebuilt from page scans of a licensed ASME B31.3 Table A-1C and now carries six carbon steels: A105, A106 Gr B, A234 WPB, A333 Gr 6, A350 LF2 Cl 1 and A420 WPL6. The stainless material was deleted rather than left on invented numbers. The pipe dimension table was checked against an ANSI B36.10 chart and the EnerCorp component criteria workbook and matched both. Every number in both tables was read three separate times by readers working independently, which mattered: one reader misread the pipe chart in a way a single pass would have written straight into the file. The old placeholder stress values turned out to be actively wrong rather than merely unconfirmed, so any wall thickness this tool produced before 2026-08-20 should be recomputed. The tool also now warns when the design temperature sits above its 900 °F ceiling or below a material's listed minimum, and both of those warn rather than refuse, by decision. What is left is not numbers: a person has to sign their name to this, and the repository has to move to the `enercorp` org.

# Next
Milestone `01-release-readiness`, phase `03-second-line-list`. No phase plan is written yet - run `/scaffold-plan` to scope it. The work is to run a second real line list at a different pressure and temperature, because every case in the existing fixture sits at 660 psig / 500 °F, which lands exactly on a tabulated stress point and therefore never exercises the interpolation. Phase `04-release-hardening` (self-host the Inter webfont, settle the display questions) is unblocked and can run in either order.

Run the page with `python -m http.server 8000` and open `http://localhost:8000/`. Opening `index.html` from disk renders a styled form with empty dropdowns and no error - the modules are blocked over `file://`. A stale browser cache produces the identical symptom, so force-refresh before diagnosing anything.

# Blockers
None.

# Open Questions
- **When does this move to the `enercorp` org?** Settled that it will; not settled when. It sits at `mondreykr/pipe-calculator` (public) as Adam's own preview, deployed at https://mondreykr.github.io/pipe-calculator/. Moving it to `enercorp` alongside `bom-tool` is what gives other people access, changes the URL, and makes the tool outlive any one account.
- **NPS 1/2 Sch 160 is 0.187 or 0.188.** The ANSI B36.10 chart says 0.187 and the EnerCorp component criteria workbook says 0.188. `PIPE` carries 0.187, being the source Adam designated as trusted and the conservative direction. One look at a controlled table closes it.
- **Table A-1C Note (6) letter codes are not encoded.** A106 Gr B and A234 WPB print a code rather than a minimum temperature, so the tool cannot check their cold limit and says so instead. Supplying Note (6) would turn both into real checks.
- **Should the result show margin?** It was deliberately removed as visual noise, but line 10-CLS-G-001 passed by 0.0038" and the engineer went up a schedule anyway - exactly the case where a number would have helped. Possibly a plain figure rather than a colour treatment.
- **Should the required wall render to four decimals?** The comparison runs at full precision, but a requirement of 0.5004" displays as "0.500" beside a 0.500" wall that fails it.
- **Below the lowest tabulated temperature the interpolation still clamps.** The tool now warns below a material's listed minimum, but `interpolateStress` itself continues to clamp rather than refuse, and the clamping is pinned by a test. Whether that should become a refusal is still open.
