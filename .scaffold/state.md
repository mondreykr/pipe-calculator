---
type: state
schema_version: 2
updated: 2026-08-18
---

# Active focus
The calculator works and the math is right. It has now been split from one file into a small set of plain files, with the two reference tables sitting on their own so an engineer can check the numbers without reading any code, and a test suite that proves the math still matches a real line list. All seventeen checks pass. None of that makes the tool correct, because the allowable stress numbers it runs on are still mostly placeholders, and one wrong number there quietly produces a wrong pipe wall. So the job is still checking, not building: verify the stress table against a licensed copy of the code book, confirm the material list, get an engineer to sign off, and settle how this gets published before it goes anywhere.

# Next
Milestone `01-release-readiness`, phase 01-verify-reference-data. Blocked on a licensed copy of ASME B31.3 2024 Table A-1 — roughly fifteen values in `js/data/materials.js` need checking against it, and they may not come from anywhere else. Phase 02 is done. Phase 04's webfont work is unblocked and can proceed meanwhile.

Run the page with `python -m http.server 8000`; opening `index.html` from disk gives a blank page.

# Blockers
- **Licensed ASME B31.3 2024 Table A-1 is not available in this repository or session.** Phase 01 cannot proceed without it, and the values may not be sourced from public web calculators or memory — Table A-1 is ASME copyright and that risk does not transfer to EnerCorp. Adam needs to supply it.

# Open Questions
- **When does this move to the `enercorp` org?** Settled that it will; not settled when. It sits at `mondreykr/pipe-calculator` (public) as Adam's own preview, deployed at https://mondreykr.github.io/pipe-calculator/. Moving it to `enercorp` alongside `bom-tool` is what gives other people access, changes the URL, and makes the tool outlive any one account.
- **Should the result show margin?** It was deliberately removed as visual noise, but line 10-CLS-G-001 passed by 0.0038" and the engineer went up a schedule anyway — exactly the case where a number would have helped. Possibly a plain figure rather than a colour treatment.
- **Should the required wall render to four decimals?** The comparison runs at full precision, but a requirement of 0.5004" displays as "0.500" beside a 0.500" wall that fails it.
- **Below the lowest tabulated temperature the interpolation clamps rather than refusing.** Conservative for carbon steel, but it should be a deliberate decision given the −50 °F MDMT on this equipment. The current clamping behaviour is pinned by a test, so changing the decision means changing that test with it.
