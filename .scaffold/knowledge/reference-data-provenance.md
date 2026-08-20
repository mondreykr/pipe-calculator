---
type: knowledge
schema_version: 2
updated: 2026-08-20
---

# Reference data provenance

What in the three reference tables is confirmed, what is assumed, and where each value is allowed to come from.

## Allowable stress (`MATS`) - six carbon steels, all confirmed

### Confirmed against a licensed Table A-1C (2026-08-20)

Adam supplied page scans of **ASME B31.3 Table A-1C, Basic Allowable Stresses in Tension for Metals - U.S. Customary Units** from a licensed copy. The scans are stored in `asme-a1c-scans/`:

| File | Contents |
|---|---|
| `a1c-pipes-tubes-lines-32-34-identity.png` | Carbon Steel - Pipes and Tubes, identity columns, lines 32–34 |
| `a1c-pipes-tubes-lines-32-34-stress.png` | same lines, stress columns |
| `a1c-forgings-fittings-lines-118-144-identity.png` | Carbon Steel - Plates/Bars and Forgings/Fittings, identity columns, lines 118–144 |
| `a1c-forgings-fittings-lines-118-144-stress.png` | same lines, stress columns |

Six materials were transcribed from these scans:

| Material | A-1C line | Yield ksi | Tensile ksi | Min temp °F | Table max °F |
|---|---|---|---|---|---|
| A106 Gr B | 33 | 35 | 60 | B | 1,100 |
| A333 Gr 6 | 34 | 35 | 60 | −50 | 1,100 |
| A420 WPL6 | 128 | 35 | 60 | −50 | 1,000 |
| A234 WPB | 129 | 35 | 60 | B | 1,100 |
| A350 LF2 Cl 1 | 142 | 36 | 70 | −50 | 1,000 |
| A105 | 144 | 36 | 70 | −20 | 1,100 |

Lines 33, 34, 128 and 129 print an identical stress row; lines 142 and 144 print an identical stress row. That is what the table shows, not a transcription slip.

**Verification method - three independent reads.** The scans were transcribed three times by separate readers with no shared context (the session plus two independent agents, one on a different model), each asked for every column as printed with an explicit instruction to mark anything unreadable rather than infer it. All three transcriptions matched cell for cell across all six lines. No cell was reported ambiguous.

**A333 Gr 6 at 500 °F = 19,000 psi** is now confirmed twice over - the scan and line list 268782 agree.

**The old provisional values were wrong, not merely unverified.** The previous placeholder A333 Gr 6 row had 600 °F = 17,300 and 650 °F = 17,000; the table gives 17,900 and 17,300. The placeholder A106 Gr B row was wrong at every point above 650 °F. Any result screenshotted from the tool before this date should be recomputed.

### Temperature ceiling - 900 °F by decision, not by the table

Table A-1C tabulates these materials to 1,000 or 1,100 °F. Every entry in `MATS` is capped at **900 °F** because `calc.js` uses a fixed `Y = 0.4`, which B31.3 gives for ferritic materials at 900 °F and below. Above that the tool refuses. Raising any ceiling requires implementing the Y-versus-temperature table first; it is not a matter of pasting in the remaining stress columns.

### A312 TP316 - removed 2026-08-20

A312 TP316 was previously carried with entirely placeholder values. Adam removed it rather than source the stainless page. `MATS` now contains no unverified value. Adding stainless back requires a licensed Table A-1 page for it, and a check that `Y = 0.4` holds for austenitic material over the intended range.

### Temperature limits are warnings, by decision

Adam decided on 2026-08-20 that both temperature limits print a note and leave the schedule ladder rendered, rather than suppressing the answer the way the two stop conditions do. The reasoning: this is a screening tool and a note is sufficient. The consequence to understand is that above the ceiling the allowable stress is held flat at the top tabulated value, so the page keeps showing a highlighted schedule that does not change as the temperature rises. The note says so explicitly. An adversarial review raised this as a blocker; it was put to Adam and decided as above.

**Minimum temperatures are never invented.** Table A-1C prints a Note (6) letter code rather than a number for A106 Gr B and A234 WPB. Those are carried as the string `'B'`, `underTemperature()` returns false for them, and the page tells the user the floor is note-governed and unchecked whenever the design temperature drops below 100 °F. The four materials with a printed number (A105 at -20 °F, A333 Gr 6, A350 LF2 Cl 1 and A420 WPL6 at -50 °F) are checked properly.

### Sourcing rule (unchanged)

**Values may not be sourced from public web calculators, scraped tables, or memory.** Table A-1 is ASME copyright; those sites carry their own risk and it does not transfer to EnerCorp. A licensed copy Adam supplies is the only acceptable source.

## Material list - pipe versus components

**A420 WPL6, A234 WPB, A350 LF2 Cl 1 and A105 are fitting and forging materials, not pipe.** They were requested deliberately: a butt-weld fitting's wall is matched to the connecting pipe schedule, so running the same wall check on the fitting material is a real question. But the tool's output still reads as a pipe schedule, and it has no way to know the user selected a forging. Adam accepted this.

## Pipe dimensions (`PIPE`) - verified 2026-08-20

Verified against **two independent sources**, neither authored by this repo:

1. **An ANSI B36.10 nominal wall thickness chart** Adam supplied, saved at `pipe-chart/ansi-b36.10-nominal-wall-thickness.png`.
2. **The "Dimensions" sheet of the EnerCorp SW Routing Component Criteria workbook** (`4 Archives / 23Q1-pdm-process-improvement / SW Routing - Component Criteria.xlsx`, checked by Jon Healey 2024-01-19).

**Method.** The chart image was transcribed by three independent readers. The first pass disagreed: one reader slid values into the wrong schedule columns on the sparse small-bore rows and read the NPS 22 row as NPS 24. A targeted tie-breaker on the disputed cells settled every one in favour of the other two readers and diagnosed the error, so the transcription rests on three agreeing reads, not two out of three. The workbook was then extracted programmatically and diffed against both.

**Result.** All 16 outside diameters, all 68 wall thicknesses, and the permitted schedule set for every size matched both sources. Two exceptions:

| Value | Code | Chart | Workbook | Resolution |
|---|---|---|---|---|
| NPS 2 OD | 2.375 | 2.375 | 2.38 | Code and chart are right; the workbook error is documented below |
| NPS 1/2 Sch 160 | 0.187 | 0.187 | 0.188 | Changed from 0.188 to 0.187 |

The five walls previously confirmed against line list 268782 (8.625 Sch 80 = 0.500, 10.75 Sch 80 = 0.594, 4.5 Sch 160 = 0.531, 2.375 Sch 160 = 0.344, 1.315 XXS = 0.358) all held.

**The one open item: NPS 1/2 Sch 160.** The chart says 0.187 and the workbook says 0.188. `PIPE` carries **0.187**, because Adam designated the chart as the trusted source and because it is the conservative direction: a wall listed thicker than the pipe really is would let the tool pass a schedule that marginally fails. Worth one look at a controlled table to close it properly. The difference is 0.001" on the smallest size in scope.

**The permitted schedule set is now confirmed, not assumed.** The workbook lists exactly the same schedules per size that `PIPE` offers, including the exclusions (1-1/4, 2-1/2, 3-1/2, 5, 22) and the size-dependent designations (NPS 16 has no Sch 40 because it equals XS; NPS 14 and up have no XXS).

## Known error in the source matrix - the calculator is right, the matrix is wrong

The EnerCorp schedule matrix lists **NPS 2 OD as 2.38**. The correct value is **2.375**, which is what line list 268782 uses. The rounding propagated into the matrix's ID column, which reads 2.072 where it should read 2.067.

The calculator uses 2.375 and is correct. Do not "fix" the calculator to match the matrix. Whoever holds the source matrix should correct it there.
