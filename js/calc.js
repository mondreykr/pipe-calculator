/* The engine. Pure functions, no DOM - this file is what test/run-tests.js exercises.
 *
 *   t       = P·D / (2·(S·E + Y·P))        pressure design thickness, B31.3 304.1.2
 *   minimum = (t + c + q) / (1 − mill_tol) minimum nominal wall to purchase
 *   pick    = lightest permitted schedule whose wall ≥ minimum
 *
 * Algebraically identical to the line-list method, which computes available wall as
 * (nominal × 0.875) − CA − thread and requires it to exceed t. Equivalence confirmed
 * over six lines - see .scaffold/knowledge/line-list-268782-verification.md
 */

/* Valid for ferritic materials below 900 °F. The material temperature ceilings in
   data/materials.js keep every current path inside that range, but nothing here
   enforces the coupling - check it before adding a material. */
export const Y = 0.4;

/* Thread or groove depth. Zero is correct for welded and flanged construction.
   If threaded connections ever enter scope this becomes an input again. */
export const Q = 0;

/* Linear interpolation over [temp, stress] points.
   Above the last point: clamps. The caller must refuse above mat.max before ever
   getting here - see overTemperature().
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

/* Temperature limit checks. Both WARN, they do not suppress the schedule selection -
   Adam's decision 2026-08-20, on the grounds that a note is sufficient for a screening
   tool. Above `max` interpolateStress clamps, so the answer stops changing with
   temperature; that is what the warning exists to tell the user. */
export function overTemperature(material, tempF) {
  return tempF > material.max;
}

/* Below the minimum temperature Table A-1C lists for the material. Returns false when
   the table prints a letter code rather than a number, because there is no number to
   compare against - use noteGovernedMinimum() to detect that case instead. */
export function underTemperature(material, tempF) {
  return typeof material.min === 'number' && tempF < material.min;
}

/* True when the material's minimum temperature is a Table A-1C Note (6) letter code.
   The tool cannot check the floor for these and must say so rather than imply a pass. */
export function noteGovernedMinimum(material) {
  return typeof material.min === 'string';
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

/* Rounds half away from zero, the way a printed table does.
   Number.prototype.toFixed rounds the DOUBLE, and a value like 0.52725 sits a hair
   BELOW its decimal form in binary, so toFixed(4) returned 0.5272 where line list
   1J176732-34 prints 0.5273 for the same wall. The tool has to agree with the sheet
   digit for digit or the comparison it exists to support is worthless.
   The 1e-9 nudge is applied AFTER scaling by 10^places, so at 4 places it is 1e-13 in
   inches - three to four orders above the worst accumulated double error at these
   magnitudes, and nine orders below the 0.0001" displayed. It can move a
   representation error and nothing else. */
export function roundTo(x, places) {
  const p = 10 ** places;
  const r = Math.round((Math.abs(x) * p) + 1e-9) / p;
  return x < 0 ? -r : r;
}

/* Least material condition: the thinnest metal the pipe can lawfully have in service.
   Nominal wall reduced by the mill's permitted under-run, less the corrosion allowance
   and thread depth. This is the line list's own quantity - what it prints as "Avail.
   Wall Th." - and (available - t) is what it prints as "Avail. minus Req'd WT".

   Exactly equivalent to the minimumWall test above, so the two can never disagree:
     wall >= (t + c) / (1 - m)  <=>  wall(1 - m) - c >= t
   The comparison is the same one either side of the identity; only the units differ. */
export function availableWall({ wall, ca, millTol, q = Q }) {
  return (wall * (1 - millTol)) - ca - q;
}

/* The three numbers the check block prints, as strings, ready for display.

   This lives on the tested surface rather than in the page wiring for a reason: a code
   review found two defects here, and BOTH were invisible to the suite while the logic
   sat in main.js, which the suite never touches.

     1. The excess was rounded from the unrounded difference while available and
        required were each rounded on their own, so the three printed numbers could
        contradict each other (0.1164 - 0.0039 printed as +0.1124).
     2. A real margin thinner than 0.0001" printed as 0.0000 WITH A SIGN, so a size
        that fails by a hair read as one that passes.

   Strings, not numbers, because the rounding is the behaviour under test. */
export function checkStrings({ wall, ca, millTol, t, q = Q }) {
  const avail = availableWall({ wall, ca, millTol, q });
  const rAvail = roundTo(avail, 4);
  const rReq = roundTo(t, 4);
  /* From the ROUNDED pair, so the printed subtraction always reconciles. */
  const rExcess = roundTo(rAvail - rReq, 4);
  const raw = avail - t;

  let excess;
  if (rExcess !== 0) {
    excess = (rExcess < 0 ? '−' : '') + Math.abs(rExcess).toFixed(4) + '"';
  } else if (Math.abs(raw) < 1e-9) {
    /* An exact tie. Its raw sign is floating-point noise, and a tie passes. */
    excess = '0.0000"';
  } else {
    /* Real, non-zero, below the displayed resolution. Print the bound, never 0.0000.
       Only a shortfall carries a sign: a minus means the schedule fails. */
    excess = (raw < 0 ? '−' : '') + '<0.0001"';
  }
  return { available: rAvail.toFixed(4) + '"', required: rReq.toFixed(4) + '"', excess };
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
 * test/run-tests.js - the two sort-trap cases exist to catch exactly this.
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
