/* Regression suite. Run: node test/run-tests.js
 *
 * No framework, no dependencies, no fixtures directory - node and assert only.
 *
 * WHAT GREEN MEANS: the arithmetic and the selection logic still behave.
 * WHAT GREEN DOES NOT MEAN: that the answers are right. The pipe dimension table is
 * still mostly unverified, so a passing run can still yield a wrong wall.
 * The line list cases pass S in directly rather than reading it from
 * data/materials.js, so a bad stress value can never make them look like verification.
 * Only the explicit Table A-1C spot checks below read MATS on purpose.
 *
 * Never make a red run green by editing an expected value. The line list cases below
 * were verified by hand against a real line list; the code is what moves.
 */
import assert from 'node:assert/strict';
import { PIPE } from '../js/data/pipe.js';
import { MATS } from '../js/data/materials.js';
import {
  interpolateStress, overTemperature, underTemperature, noteGovernedMinimum, pressureThickness,
  minimumWall, availableWall, roundTo, checkStrings, ladder, selectSchedule, tooThick
} from '../js/calc.js';

let passed = 0, failed = 0;
const check = (name, fn) => {
  try { fn(); passed++; console.log(`  pass  ${name}`); }
  catch (e) { failed++; console.log(`  FAIL  ${name}\n        ${e.message.split('\n')[0]}`); }
};
const section = s => console.log(`\n${s}`);

/* ------------------------------------------------------------------ *
 * 1. Line list 268782 - the only independent verification this tool has.
 *    A333 Gr 6, 660 psig, 500 °F, S = 19,000, E = 1.0, CA = 0.250", 12.5% mill tol.
 *    Source: .scaffold/knowledge/line-list-268782-verification.md
 * ------------------------------------------------------------------ */
section('Line list 268782 (6 cases)');

const LINE_LIST = [
  { line: '8-CLS-P-001',  nps: '8',  t: 0.147750, need: 0.4546, pick: '80'  },
  { line: '10-CLS-G-001', nps: '10', t: 0.184152, need: 0.4962, pick: 'XS'  },
  { line: '8-CLS-G-001',  nps: '8',  t: 0.147750, need: 0.4546, pick: '80'  },
  { line: '1" XXS',       nps: '1',  t: 0.022526, need: 0.3115, pick: 'XXS' },
  { line: '4-CSL-D-001',  nps: '4',  t: 0.077087, need: 0.3738, pick: '160' },
  { line: '2-CSL-D-002',  nps: '2',  t: 0.040685, need: 0.3322, pick: '160' }
];

for (const c of LINE_LIST) {
  check(`${c.line} (NPS ${c.nps})`, () => {
    const D = PIPE[c.nps].od;
    const t = pressureThickness({ P: 660, D, S: 19000, E: 1.0 });
    const need = minimumWall({ t, ca: 0.250, millTol: 0.125 });
    assert.equal(t.toFixed(6), c.t.toFixed(6), 'pressure design thickness');
    assert.equal(need.toFixed(4), c.need.toFixed(4), 'minimum wall');
    assert.equal(selectSchedule(PIPE[c.nps].sch, need).name, c.pick, 'selected schedule');
  });
}

/* Note: every case above sits at 660 psig / 500 °F, which lands exactly on a tabulated
   stress point. This block never exercises the interpolation. A second line list at
   different conditions is scheduled work - see milestone 01, phase 03. */

/* ------------------------------------------------------------------ *
 * 1b. Two Dynacorp line lists, audited 2026-08-26. Outside truth for the LEAST
 *     MATERIAL CONDITION form: these sheets print Required, Available and
 *     "Avail. minus Req'd WT" as their own columns, so every expected value below
 *     was read off a document this repo did not author.
 *
 *     Jobs 1J176732-34 (B31.3 2014ed, SA-333-6) and 1J187553-554 (B31.3 2016ed,
 *     SA-420-WPL6). S is passed in directly, as above, so a placeholder stress in
 *     MATS can never make this block look like verification.
 *
 *     Rows deliberately EXCLUDED: 7520-01 carries pipe ODs of 1.5, 3.375 and
 *     2.2375, none of which is a real pipe OD. Their sheet computed t from them.
 *     Encoding those would enshrine someone else's typo as an expectation.
 *
 *     Expected `avail` and `excess` are quoted at the decimal places the sheets
 *     themselves print, not rounded to a house style.
 * ------------------------------------------------------------------ */
section('Dynacorp line lists, least material condition (7 cases)');

const LMC = [
  // job 1J176732-34: SA-333-6, CA 1/16", 12.5% mill tol
  { line: '1J16706-02 inlet spool', nps: '3',     P: 5000, S: 19900, ca: 0.0625, sch: 'XXS', t: 0.3995, avail: 0.4625, excess: 0.063 },
  { line: '1J16706-03 gas out',     nps: '4',     P: 5000, S: 19900, ca: 0.0625, sch: 'XXS', t: 0.5137, avail: 0.5273, excess: 0.014 },
  { line: '1J16706-04 sand out',    nps: '2',     P: 5000, S: 19900, ca: 0.0625, sch: 'XXS', t: 0.2711, avail: 0.3190, excess: 0.048 },
  { line: '1J16706-04 drain leg',   nps: '2',     P:  260, S: 20000, ca: 0.0625, sch: '40',  t: 0.0154, avail: 0.0723, excess: 0.057 },
  { line: '7310-28 blowdown drain', nps: '4',     P:  260, S: 20000, ca: 0.0625, sch: '40',  t: 0.0291, avail: 0.1449, excess: 0.116 },
  // job 1J187553-554: SA-420-WPL6, CA 1/8", 12.5% mill tol
  { line: '1J187553-6101 inlet',    nps: '3',     P: 5000, S: 20000, ca: 0.1250, sch: 'XXS', t: 0.3977, avail: 0.4000, excess: 0.002 },
  { line: '1J187553-6401 PSV',      nps: '1-1/2', P: 5000, S: 20000, ca: 0.1250, sch: 'XXS', t: 0.2159, avail: 0.2250, excess: 0.009 }
];

for (const c of LMC) {
  check(`${c.line} (NPS ${c.nps})`, () => {
    const D = PIPE[c.nps].od;
    const wall = PIPE[c.nps].sch[c.sch];
    const t = pressureThickness({ P: c.P, D, S: c.S, E: 1.0 });
    const avail = availableWall({ wall, ca: c.ca, millTol: 0.125 });
    /* Through roundTo, because the claim under test is that the tool PRINTS what the
       sheet prints. Bare toFixed fails 1J16706-03 on a binary representation error. */
    assert.equal(roundTo(t, 4).toFixed(4), c.t.toFixed(4), 'required wall t');
    assert.equal(roundTo(avail, 4).toFixed(4), c.avail.toFixed(4), 'available wall, LMC');
    assert.equal(roundTo(avail - t, 3).toFixed(3), c.excess.toFixed(3), 'excess over required');

    /* The schedule the sheet specified is the one the ladder picks. Confirms the two
       forms of the test agree on the ANSWER, not just on the arithmetic. */
    const need = minimumWall({ t, ca: c.ca, millTol: 0.125 });
    assert.equal(selectSchedule(PIPE[c.nps].sch, need).name, c.sch, 'selected schedule');
  });
}

/* The identity the display depends on: the nominal-space test the ladder draws and the
   LMC test the check block prints are the same comparison. If these ever diverge the
   page can highlight a passing row while printing a negative excess beside it.

   Asserted outside a 1e-9 band around the tie, and NOT at the tie itself. At an exact
   tie the two forms genuinely disagree by one unit in the last place of a double
   (NPS 3 Sch 80 at ca 0.250, 0% mill tolerance, t = 0.050 is one such point: the
   nominal form passes, the LMC form fails, and the gap is -1.4e-17). That is binary
   floating point, not a modelling error, and it is 13 orders of magnitude below the
   0.0001" the page displays. main.js snaps the excess sign inside the same band so the
   printed sign always agrees with the highlighted row. Do not widen this band to
   silence a failure: outside 1e-9 a disagreement is a real defect. */
check('nominal and LMC tests agree wherever the margin is meaningful', () => {
  let checked = 0, ties = 0;
  for (const nps of Object.keys(PIPE)) {
    for (const [name, wall] of ladder(PIPE[nps].sch)) {
      for (const ca of [0, 0.0625, 0.125, 0.25]) {
        for (const millTol of [0, 0.10, 0.125]) {
          for (const t of [0.001, 0.05, 0.2, 0.4, 0.9]) {
            const avail = availableWall({ wall, ca, millTol });
            if (Math.abs(avail - t) < 1e-9) { ties++; continue; }
            assert.equal(wall >= minimumWall({ t, ca, millTol }), avail >= t,
              `NPS ${nps} Sch ${name}, ca ${ca}, tol ${millTol}, t ${t}`);
            checked++;
          }
        }
      }
    }
  }
  assert.ok(checked > 3000, `only ${checked} combinations compared`);
  assert.ok(ties > 0, 'no tie was skipped, so the band is not being exercised');
});

/* ------------------------------------------------------------------ *
 * 1c. What the check block PRINTS. Both cases below are regressions: a code review
 *     found them in shipped display code, and neither was visible to this suite while
 *     the formatting lived in main.js. That is why checkStrings is in calc.js.
 * ------------------------------------------------------------------ */
section('Check block display');

check('the three printed numbers always reconcile', () => {
  /* The case that failed: available rounded up, required rounded down, and the excess
     was rounded from the unrounded difference, so 0.1164 - 0.0039 printed as +0.1124. */
  const t = pressureThickness({ P: 140, D: PIPE['1'].od, S: 23300, E: 1.0 });
  const c = checkStrings({ wall: 0.133, ca: 0, millTol: 0.125, t });
  assert.equal(c.available, '0.1164"');
  assert.equal(c.required, '0.0039"');
  assert.equal(c.excess, '0.1125"', 'must equal the visible subtraction, not 0.1124');

  /* And as a property, everywhere the form can reach. */
  let compared = 0;
  const num = str => parseFloat(str.replace('−', '-').replace(/[+"<]/g, ''));
  for (const nps of Object.keys(PIPE)) {
    for (const [, wall] of ladder(PIPE[nps].sch)) {
      for (const ca of [0, 0.0625, 0.125, 0.1875, 0.25]) {
        for (const millTol of [0.10, 0.125]) {
          for (const P of [10, 140, 660, 2500, 5000, 9000]) {
            for (const S of [11400, 19000, 20000, 23300]) {
              const t = pressureThickness({ P, D: PIPE[nps].od, S, E: 1.0 });
              const c = checkStrings({ wall, ca, millTol, t });
              if (c.excess.includes('<')) continue;   // bound, not a value
              const gap = +(num(c.available) - num(c.required)).toFixed(4);
              assert.equal(num(c.excess), gap,
                `NPS ${nps} wall ${wall} ca ${ca} tol ${millTol} P ${P} S ${S}: ` +
                `${c.available} - ${c.required} != ${c.excess}`);
              compared++;
            }
          }
        }
      }
    }
  }
  assert.ok(compared > 5000, `only ${compared} combinations compared`);
});

check('a margin below the displayed resolution never prints as zero', () => {
  /* The case that failed: short by 2.7e-6", no schedule passes, printed "-0.0000".
     A sign on a magnitude that has been rounded away reads as a pass. */
  const t = pressureThickness({ P: 7534, D: PIPE['1'].od, S: 23300, E: 1.0 });
  const c = checkStrings({ wall: 0.358, ca: 0.125, millTol: 0.125, t });
  assert.ok(availableWall({ wall: 0.358, ca: 0.125, millTol: 0.125 }) < t, 'this case really fails');
  assert.equal(c.excess, '−<0.0001"', 'must show the bound and the sign, not -0.0000');

  /* The matched pair, both sides of zero. Sited well inside a rounding bucket (0.1875
     exactly) so the test exercises the sub-resolution branch and not a boundary. */
  const w = { wall: 0.500, ca: 0.250, millTol: 0.125 };
  const avail = availableWall(w);                        // 0.1875 exactly
  assert.equal(checkStrings({ ...w, t: avail - 2e-6 }).excess, '<0.0001"', 'a hair spare');
  assert.equal(checkStrings({ ...w, t: avail + 2e-6 }).excess, '−<0.0001"', 'a hair short');

  /* An exact tie passes with a genuine zero, and never carries a minus. */
  assert.equal(checkStrings({ ...w, t: avail }).excess, '0.0000"');

  /* Both sides still print the same available and required, which is the point: the
     numbers alone cannot distinguish these three, so the excess field has to. */
  assert.equal(checkStrings({ ...w, t: avail + 2e-6 }).available, '0.1875"');
  assert.equal(checkStrings({ ...w, t: avail + 2e-6 }).required, '0.1875"');
});

/* roundTo exists because toFixed disagreed with a licensed sheet. These are the cases
   that motivated it, plus the sign and zero behaviour the excess display depends on. */
check('roundTo prints what a printed table prints', () => {
  assert.equal(roundTo(0.674 * 0.875 - 0.0625, 4).toFixed(4), '0.5273', '1J16706-03 available');
  assert.equal((0.674 * 0.875 - 0.0625).toFixed(4), '0.5272', 'bare toFixed still disagrees');
  assert.equal(roundTo(0.0625, 3).toFixed(3), '0.063', 'half rounds away from zero');
  assert.equal(roundTo(-0.0054, 4).toFixed(4), '-0.0054', 'negatives keep magnitude');
  assert.equal(roundTo(0, 4).toFixed(4), '0.0000', 'zero does not gain a sign');
  assert.equal(roundTo(1e-17, 4).toFixed(4), '0.0000', 'representation error does not round up');
});

/* ------------------------------------------------------------------ *
 * 2. Sort traps - the ladder must be ordered by wall, never by name.
 * ------------------------------------------------------------------ */
section('Ladder ordering');

check('NPS 18 places XS above Sch 40 (XS 0.500 < Sch 40 0.562)', () => {
  const names = ladder(PIPE['18'].sch).map(([n]) => n);
  assert.ok(names.indexOf('XS') < names.indexOf('40'), `got ${names.join(' < ')}`);
});

check('NPS 8 places XXS above Sch 160 (XXS 0.875 < Sch 160 0.906)', () => {
  const names = ladder(PIPE['8'].sch).map(([n]) => n);
  assert.ok(names.indexOf('XXS') < names.indexOf('160'), `got ${names.join(' < ')}`);
});

check('every size ladders in non-decreasing wall order', () => {
  for (const [nps, { sch }] of Object.entries(PIPE)) {
    const walls = ladder(sch).map(([, w]) => w);
    for (let i = 1; i < walls.length; i++) {
      assert.ok(walls[i] >= walls[i - 1], `NPS ${nps}: ${walls[i - 1]} then ${walls[i]}`);
    }
  }
});

/* ------------------------------------------------------------------ *
 * 3. Stop conditions - both must suppress the selection, never degrade it.
 * ------------------------------------------------------------------ */
section('Stop conditions');

check('t >= D/6 trips the thin-wall limit', () => {
  const D = PIPE['1'].od;
  const t = pressureThickness({ P: 8000, D, S: 19000, E: 1.0 });
  assert.equal(tooThick(t, D), true, 'should stop at 8000 psig');
});

check('normal conditions do not trip the thin-wall limit', () => {
  const D = PIPE['1'].od;
  const t = pressureThickness({ P: 660, D, S: 19000, E: 1.0 });
  assert.equal(tooThick(t, D), false, 'should not stop at 660 psig');
});

check('no permitted schedule thick enough returns null, not the heaviest', () => {
  const D = PIPE['1'].od;
  const t = pressureThickness({ P: 3000, D, S: 19000, E: 1.0 });
  const need = minimumWall({ t, ca: 0.250, millTol: 0.125 });
  assert.ok(need > 0.358, 'requirement should exceed 1" XXS');
  assert.equal(selectSchedule(PIPE['1'].sch, need), null);
});

/* ------------------------------------------------------------------ *
 * 4. Temperature guard and stress interpolation.
 * ------------------------------------------------------------------ */
section('Temperature guard and interpolation');

check('refuses above a material maximum tabulated temperature', () => {
  // 900 F is the Y = 0.4 ceiling every carbon steel entry is capped at, not the
  // end of Table A-1C. Was 650 while the table was provisional.
  assert.equal(overTemperature(MATS['A333 Gr 6'], 950), true);
});

check('accepts at the maximum tabulated temperature', () => {
  assert.equal(overTemperature(MATS['A333 Gr 6'], 900), false);
});

check('A333 Gr 6 at 500 F returns the confirmed 19,000 psi', () => {
  assert.equal(interpolateStress(MATS['A333 Gr 6'].s, 500), 19000);
});

check('interpolates linearly between tabulated points', () => {
  // 500 F -> 19,000 and 600 F -> 17,900 per Table A-1C line 34, so 550 F -> 18,450.
  // Expected 18,150 while 600 F held the provisional 17,300.
  assert.equal(interpolateStress(MATS['A333 Gr 6'].s, 550), 18450);
});

check('Table A-1C spot values transcribed correctly', () => {
  // One point per stress row shape, against the licensed scan.
  assert.equal(interpolateStress(MATS['A234 WPB'].s, 750), 13900);   // line 129
  assert.equal(interpolateStress(MATS['A420 WPL6'].s, 900), 5900);   // line 128
  assert.equal(interpolateStress(MATS['A105'].s, 500), 19600);       // line 144
  assert.equal(interpolateStress(MATS['A350 LF2 Cl 1'].s, 300), 21200); // line 142
});

check('warns below a numeric minimum temperature, not above it', () => {
  // A105 min temp is -20 F per Table A-1C line 144.
  assert.equal(underTemperature(MATS['A105'], -30), true);
  assert.equal(underTemperature(MATS['A105'], -20), false);
  assert.equal(underTemperature(MATS['A105'], 500), false);
});

check('note-governed minimums are flagged, never guessed', () => {
  // A106 Gr B and A234 WPB print a letter code, not a number, in Table A-1C.
  assert.equal(noteGovernedMinimum(MATS['A106 Gr B']), true);
  assert.equal(underTemperature(MATS['A106 Gr B'], -400), false);
  assert.equal(noteGovernedMinimum(MATS['A333 Gr 6']), false);
});

check('every material carries a minimum temperature, number or code', () => {
  for (const [name, m] of Object.entries(MATS)) {
    const ok = typeof m.min === 'number' || typeof m.min === 'string';
    assert.ok(ok, `${name} has no min`);
  }
});

check('the default material key exists, so the dropdown default cannot slip', () => {
  // main.js sets $('mat').value = 'A333 Gr 6'. If that key is renamed the assignment
  // silently fails and the first option wins, which is a stronger material.
  assert.ok(MATS['A333 Gr 6'], 'A333 Gr 6 missing from MATS');
});

check('every material carries a description for the dropdown', () => {
  for (const [name, m] of Object.entries(MATS)) {
    assert.ok(m.desc && m.desc.length > 5, `${name} has no desc`);
  }
});

check('clamps below the lowest tabulated temperature (documented open question)', () => {
  // Conservative for carbon steel, but an open decision given the -50 F MDMT.
  // If that decision changes to "refuse", this test changes with it.
  assert.equal(interpolateStress(MATS['A333 Gr 6'].s, -50), 20000);
});

/* ------------------------------------------------------------------ */
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
