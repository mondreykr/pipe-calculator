---
type: knowledge
schema_version: 2
updated: 2026-08-18
---

# Verification against line list 268782

The only independent check the calculator has been through. It is also the seed fixture for the regression suite that does not yet exist.

## Conditions

All six lines were run through both the calculator and the line-list method under: A333 Gr 6, 660 psig, 500 °F, S = 19,000 psi, E = 1.0, Y = 0.4, CA = 0.250", mill tolerance 12.5%, thread depth 0.

Pressure design thickness `t` matched the line-list formula to five decimal places on every line, confirming the two methods are algebraically equivalent.

## Results

| Line | NPS | t (in) | Minimum wall (in) | Tool selects | Engineer specified |
|---|---|---|---|---|---|
| 8-CLS-P-001 | 8 | 0.147750 | 0.4546 | Sch 80 | Sch 80 |
| 10-CLS-G-001 | 10 | 0.184152 | 0.4962 | Sch XS | Sch 80 |
| 8-CLS-G-001 | 8 | 0.147750 | 0.4546 | Sch 80 | Sch 80 |
| (1" XXS) | 1 | 0.022526 | 0.3115 | Sch XXS | Sch XXS |
| 4-CSL-D-001 | 4 | 0.077087 | 0.3738 | Sch 160 | Sch 160 |
| 2-CSL-D-002 | 2 | 0.040685 | 0.3322 | Sch 160 | Sch 160 |

Five of six selections match exactly.

## The one difference, and why it is not a defect

Line 10-CLS-G-001: XS at 0.500" clears a 0.4962" requirement by 0.0038", and the engineer went up one schedule. That is a margin judgment the calculation does not contain and is not meant to contain. It is also the clearest argument for showing margin somewhere in the interface — see the open question in `state.md`.

## What this verification does not cover

Every case is 660 psig at 500 °F, which lands exactly on a tabulated stress point. **The stress interpolation is never exercised.** Interpolation is precisely where a transcription error in `MATS` would surface, so a second line list at a different pressure and temperature is worth more than more cases at these conditions.

## Cases the regression suite must add

- **Sort trap, NPS 18** — XS must place above Sch 40.
- **Sort trap, NPS 8** — XXS must place above Sch 160.
- **Stop condition** — `t ≥ D/6` suppresses the selection.
- **Stop condition** — no permitted schedule thick enough suppresses the selection.
- **Temperature guard** — above a material's maximum tabulated temperature, refuse rather than extrapolate.
