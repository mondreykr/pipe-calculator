/* The engine. Pure functions, no DOM — this file is what test/run-tests.js exercises.
 *
 *   t       = P·D / (2·(S·E + Y·P))        pressure design thickness, B31.3 304.1.2
 *   minimum = (t + c + q) / (1 − mill_tol) minimum nominal wall to purchase
 *   pick    = lightest permitted schedule whose wall ≥ minimum
 *
 * Algebraically identical to the line-list method, which computes available wall as
 * (nominal × 0.875) − CA − thread and requires it to exceed t. Equivalence confirmed
 * over six lines — see .scaffold/knowledge/line-list-268782-verification.md
 */

/* Valid for ferritic materials below 900 °F. The material temperature ceilings in
   data/materials.js keep every current path inside that range, but nothing here
   enforces the coupling — check it before adding a material. */
export const Y = 0.4;

/* Thread or groove depth. Zero is correct for welded and flanged construction.
   If threaded connections ever enter scope this becomes an input again. */
export const Q = 0;

/* Linear interpolation over [temp, stress] points.
   Above the last point: clamps. The caller must refuse above mat.max before ever
   getting here — see overTemperature().
   Below the first point: clamps. Conservative for carbon steel, but it is an open
   decision given the −50 °F MDMT on this equipment. */
export function interpolateStress(points, tempF) {
  if (tempF <= points[0][0]) return points[0][1];
  if (tempF >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 1; i < points.length; i++) {
    if (tempF <= points[i][0]) {
      const [a, av] = points[i - 1], [b, bv] = points[i];
      return av + (bv - av) * (tempF - a) / (b - a);
    }
  }
}

/* Above a material's highest tabulated temperature the tool refuses rather than
   extrapolating. A refusal is a result; a guessed number is not. */
export function overTemperature(material, tempF) {
  return tempF > material.max;
}

/* Pressure design thickness. P psig, D inches OD, S psi, E joint efficiency. */
export function pressureThickness({ P, D, S, E }) {
  return (D * P) / (2 * ((S * E) + (Y * P)));
}

/* Minimum nominal wall to purchase: pressure thickness plus corrosion allowance and
   thread depth, grossed up for the mill's permitted under-run. millTol is a fraction
   (0.125), not a percentage. */
export function minimumWall({ t, ca, millTol, q = Q }) {
  return (t + ca + q) / (1 - millTol);
}

/* The thin-wall formula stops applying at t ≥ D/6. Suppress the selection entirely. */
export function tooThick(t, D) {
  return t >= D / 6;
}

/* Permitted schedules as [name, wall] pairs SORTED BY WALL THICKNESS.
 *
 * Not cosmetic, and not safe to replace with name order or object insertion order:
 * from NPS 8 up XXS is thinner than Sch 160, and from NPS 18 up XS is thinner than
 * Sch 40. A name-ordered list selects heavier pipe than required. Covered by
 * test/run-tests.js — the two sort-trap cases exist to catch exactly this.
 */
export function ladder(schedules) {
  return Object.entries(schedules).sort((a, b) => a[1] - b[1]);
}

/* Lightest permitted schedule that meets the requirement, or null if none does.
   Null is a refusal, not a fallback to the heaviest. */
export function selectSchedule(schedules, need) {
  for (const [name, wall] of ladder(schedules)) {
    if (wall >= need) return { name, wall };
  }
  return null;
}
