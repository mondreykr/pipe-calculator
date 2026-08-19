/* Allowable stress by material — ASME B31.3 Table A-1.
 *
 * REFERENCE DATA — no logic in this file. Revise values here without reading code.
 *
 * ############################################################################
 * ##  PROVISIONAL. THIS TABLE IS THE RELEASE BLOCKER.                       ##
 * ##                                                                        ##
 * ##  Exactly ONE value below is confirmed. Every other value is a          ##
 * ##  PLACEHOLDER and must be verified against a licensed copy of ASME      ##
 * ##  B31.3 2024 Table A-1 before this tool is given to anyone.             ##
 * ##                                                                        ##
 * ##  Values may NOT be sourced from public web calculators, scraped        ##
 * ##  tables, or memory. Table A-1 is ASME copyright and that risk does     ##
 * ##  not transfer to EnerCorp.                                             ##
 * ############################################################################
 *
 * Format: s is a list of [temperature °F, allowable stress psi] points, ascending.
 * Between listed points the calculator interpolates linearly. Above `max` it refuses.
 *
 * Material list is also unconfirmed: line list 268782 shows only A333 Gr 6.
 * A106 Gr B and A312 TP316 are assumptions about what EnerCorp specifies.
 *
 * See .scaffold/knowledge/reference-data-provenance.md
 */
export const MATS = {
 // A333 Gr 6 — 500 °F / 19,000 psi CONFIRMED against line list 268782. Rest provisional.
 'A333 Gr 6':  {max:650, s:[[100,20000],[400,20000],[500,19000],[600,17300],[650,17000]]},

 // PROVISIONAL — every point. Material itself unconfirmed.
 'A106 Gr B':  {max:800, s:[[100,20000],[400,20000],[650,20000],[700,18900],[750,17300],[800,14200]]},

 // PROVISIONAL — every point. Material itself unconfirmed.
 'A312 TP316': {max:650, s:[[100,20000],[200,19300],[300,17900],[400,17000],[500,16300],[650,15500]]}
};
