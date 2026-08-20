/* Page wiring. All arithmetic lives in calc.js; all reference values in data/. */
import { PIPE } from './data/pipe.js';
import { MATS } from './data/materials.js';
import {
  interpolateStress, overTemperature, underTemperature, noteGovernedMinimum,
  pressureThickness, minimumWall, ladder, selectSchedule, tooThick
} from './calc.js';

/* Input options. Not reference data - these are the choices the form offers. */
const CAS = [
 {v:0,      l:'0"'},
 {v:0.0625, l:'1/16" (1.6 mm)'},
 {v:0.1250, l:'1/8" (3.2 mm)'},
 {v:0.1875, l:'3/16" (4.8 mm)'},
 {v:0.2500, l:'1/4" (6.4 mm)'}
];
/* Matches the line-list rule that derives E from radiography coverage. */
const JOINTS = [
 {v:1.00, l:'1.00 (100% radiography)'},
 {v:0.90, l:'0.90 (spot radiography, >5%)'},
 {v:0.80, l:'0.80 (no radiography, ≤5%)'}
];
const TOLS = [
 {v:'0.125',  l:'Default (12.5%)'},
 {v:'0.100',  l:'API 5L (10%)'},
 {v:'custom', l:'Custom %'}
];

const $ = i => document.getElementById(i);

const millTol = () => $('tol').value === 'custom'
  ? Math.min(Math.max(+$('customTol').value || 0, 0), 30) / 100
  : +$('tol').value;

function run() {
  const nps = $('size').value, D = PIPE[nps].od;
  const P = +$('press').value || 0, T = +$('temp').value;
  const matN = $('mat').value, mat = MATS[matN];
  const ca = +$('ca').value, E = +$('joint').value, tol = millTol();

  $('customWrap').hidden = $('tol').value !== 'custom';

  /* Temperature notes. Both limits warn and leave the ladder rendered - see calc.js. */
  const over = overTemperature(mat, T), under = underTemperature(mat, T);
  const S = interpolateStress(mat.s, T);
  const notes = [];
  if (over) {
    notes.push(`${T}°F is above the ${mat.max}°F ceiling this tool applies to ${matN}.`);
  } else if (under) {
    notes.push(`${T}°F is below the ${mat.min}°F minimum temperature Table A-1C lists `
      + `for ${matN}. Do not use this result.`);
  } else {
    notes.push(`Allowable stress S = ${Math.round(S).toLocaleString()} psi at ${T}°F.`);
  }
  /* Below 100 °F is the bottom band of Table A-1C, where the material's own floor is
     what decides. For a note-governed floor the tool has no number to check it with. */
  if (noteGovernedMinimum(mat) && T < 100) {
    notes.push(`The minimum temperature for ${matN} is set by Table A-1C Note (6), `
      + `code ${mat.min}, which is not encoded here. Check it before cold service.`);
  }
  $('sHint').className = 'hint' + (over || under ? ' stop' : '');
  $('sHint').textContent = notes.join(' ');

  const t = pressureThickness({ P, D, S, E });
  const need = minimumWall({ t, ca, millTol: tol });
  const stopped = tooThick(t, D);

  const list = ladder(PIPE[nps].sch);
  const pick = stopped ? null : selectSchedule(PIPE[nps].sch, need);

  $('need').textContent = need.toFixed(3) + '"';
  $('need').className = 'v' + (stopped || !pick ? ' stop' : '');

  $('rows').innerHTML = list.map(([name, wall]) => {
    const cls = wall < need ? 'short' : (pick && name === pick.name ? 'win' : '');
    return `<tr class="${cls}"><td>Sch ${name}</td><td>${wall.toFixed(3)}"</td></tr>`;
  }).join('');

  const n = $('note');
  if (stopped) {
    n.className = 'note stop';
    n.textContent = 'Required wall reaches D/6, where this formula no longer applies.';
  } else if (!pick) {
    n.className = 'note stop';
    n.textContent = 'No permitted schedule is thick enough.';
  } else {
    n.className = 'note';
    n.textContent = 'Minimum wall includes the corrosion allowance and the mill tolerance. Highlighted row is the lightest permitted schedule that passes.';
  }
}

// ponytail: sort by OD - integer-like keys ('2','8') enumerate before '1/2' in JS, so insertion order is not display order
$('size').innerHTML = Object.keys(PIPE).sort((a, b) => PIPE[a].od - PIPE[b].od)
  .map(s => `<option value="${s}">${s}"</option>`).join('');
$('size').value = '8';
$('mat').innerHTML = Object.keys(MATS)
  .map(m => `<option value="${m}">${m} (${MATS[m].desc})</option>`).join('');
$('mat').value = 'A333 Gr 6';
$('ca').innerHTML = CAS.map(c => `<option value="${c.v}">${c.l}</option>`).join('');
$('ca').value = '0.25';
$('joint').innerHTML = JOINTS.map(j => `<option value="${j.v}">${j.l}</option>`).join('');
$('tol').innerHTML = TOLS.map(t => `<option value="${t.v}">${t.l}</option>`).join('');
['size','press','temp','mat','ca','joint','tol','customTol'].forEach(i => $(i).addEventListener('input', run));
run();
