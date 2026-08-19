/* Regression suite. Run: node test/run-tests.js
 *
 * No framework, no dependencies, no fixtures directory — node and assert only.
 *
 * WHAT GREEN MEANS: the arithmetic and the selection logic still behave.
 * WHAT GREEN DOES NOT MEAN: that the answers are right. The allowable stress table
 * is provisional, so a passing run over wrong stress values still yields wrong walls.
 * These tests pass S in directly rather than reading it from data/materials.js,
 * precisely so a placeholder value can never make this suite look like verification.
 *
 * Never make a red run green by editing an expected value. The line list cases below
 * were verified by hand against a real line list; the code is what moves.
 */
import assert from 'node:assert/strict';
import { PIPE } from '../js/data/pipe.js';
import { MATS } from '../js/data/materials.js';
import {
  interpolateStress, overTemperature, pressureThickness,
  minimumWall, ladder, selectSchedule, tooThick
} from '../js/calc.js';

let passed = 0, failed = 0;
const check = (name, fn) => {
  try { fn(); passed++; console.log(`  pass  ${name}`); }
  catch (e) { failed++; console.log(`  FAIL  ${name}\n        ${e.message.split('\n')[0]}`); }
};
const section = s => console.log(`\n${s}`);

/* ------------------------------------------------------------------ *
 * 1. Line list 268782 — the only independent verification this tool has.
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
   different conditions is scheduled work — see milestone 01, phase 03. */

/* ------------------------------------------------------------------ *
 * 2. Sort traps — the ladder must be ordered by wall, never by name.
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
 * 3. Stop conditions — both must suppress the selection, never degrade it.
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
  assert.equal(overTemperature(MATS['A333 Gr 6'], 700), true);
});

check('accepts at the maximum tabulated temperature', () => {
  assert.equal(overTemperature(MATS['A333 Gr 6'], 650), false);
});

check('A333 Gr 6 at 500 F returns the confirmed 19,000 psi', () => {
  assert.equal(interpolateStress(MATS['A333 Gr 6'].s, 500), 19000);
});

check('interpolates linearly between tabulated points', () => {
  // 500 F -> 19,000 and 600 F -> 17,300, so 550 F -> 18,150
  assert.equal(interpolateStress(MATS['A333 Gr 6'].s, 550), 18150);
});

check('clamps below the lowest tabulated temperature (documented open question)', () => {
  // Conservative for carbon steel, but an open decision given the -50 F MDMT.
  // If that decision changes to "refuse", this test changes with it.
  assert.equal(interpolateStress(MATS['A333 Gr 6'].s, -50), 20000);
});

/* ------------------------------------------------------------------ */
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
