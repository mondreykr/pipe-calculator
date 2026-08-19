---
type: knowledge
schema_version: 2
updated: 2026-08-18
---

# Reference data provenance

What in the three reference tables is confirmed, what is assumed, and where each value is allowed to come from.

## Allowable stress (`MATS`) — provisional, and the release blocker

**One value is confirmed:** A333 Gr 6 at 500 °F = 19,000 psi, matching line list 268782.

Everything else — roughly fifteen values across three materials — is placeholder and must be verified against ASME B31.3 2024 Table A-1 from a licensed copy.

**Values may not be sourced from public web calculators, scraped tables, or memory.** Table A-1 is ASME copyright; those sites carry their own risk and it does not transfer to EnerCorp. A licensed copy is the only acceptable source.

The tool must not be described as ready, verified, or fit for use while this table is provisional.

## Material list — partly assumed

Line list 268782 shows only **A333 Gr 6**. **A106 Gr B** and **A312 TP316** are assumptions about what EnerCorp actually specifies, not confirmed selections. Confirming the list is a separate action from confirming the stress values.

## Pipe dimensions (`PIPE`) — mostly unverified, five points confirmed

Values are ASME B36.10M nominal, taken from the EnerCorp schedule matrix. Five are independently confirmed against line list 268782:

- 8.625 / Sch 80 = 0.500
- 10.75 / Sch 80 = 0.594
- 4.5 / Sch 160 = 0.531
- 2.375 / Sch 160 = 0.344
- 1.315 / XXS = 0.358

The rest should be spot-checked against a controlled pipe chart.

## Known error in the source matrix — the calculator is right, the matrix is wrong

The EnerCorp schedule matrix lists **NPS 2 OD as 2.38**. The correct value is **2.375**, which is what line list 268782 uses. The rounding propagated into the matrix's ID column, which reads 2.072 where it should read 2.067.

The calculator uses 2.375 and is correct. Do not "fix" the calculator to match the matrix. Whoever holds the source matrix should correct it there.
