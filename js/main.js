/* Page wiring. All arithmetic lives in calc.js; all reference values in data/. */
import { PIPE } from './data/pipe.js';
import { MATS } from './data/materials.js';
import {
  interpolateStress, overTemperature, underTemperature, noteGovernedMinimum,
  pressureThickness, minimumWall, checkStrings, ladder, selectSchedule, tooThick, roundTo, Y
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

  /* Bars scale against the heavier of the thickest permitted schedule and the
     requirement, so the requirement line is always on scale. */
  const scale = Math.max(...list.map(([, wall]) => wall), need);
  const pos = need / scale * 100;

  /* The label is static markup - see .anch in styles.css for why it carries no number. */
  $('need').style.left = pos + '%';
  $('need').className = 'lab' + (pos < 18 ? ' l' : pos > 82 ? ' r' : '')
    + (stopped || !pick ? ' stop' : '');

  $('rows').innerHTML = list.map(([name, wall]) => {
    const cls = stopped || wall < need ? 'short'
      : (pick && name === pick.name ? 'win' : '');
    return `<div class="srow ${cls}" role="row"><span class="n" role="cell">Sch ${name}</span>`
      + `<span class="track" role="cell"><span class="fill" style="width:${wall / scale * 100}%"></span>`
      + `<span class="req" style="left:${pos}%"></span></span>`
      + `<span class="v" role="cell">${wall.toFixed(3)}"</span></div>`;
  }).join('');

  /* The check block restates the answer in least material condition. Which schedule it
     reports on:
       passing size    - the selected schedule.
       nothing passes  - the heaviest permitted, so the reader learns by how much the
                         size fails. Excess goes negative; the sign and the colour are
                         what say so, which is why no sentence is needed here.
       above D/6       - suppressed entirely. The formula has stopped applying, so t is
                         not a number worth printing at four decimal places. */
  const heaviest = list[list.length - 1];
  const subject = pick || (stopped ? null : { name: heaviest[0], wall: heaviest[1] });
  $('chk').hidden = !subject;
  $('det').hidden = !subject;
  if (subject) {
    /* Every number, and the rounding rules behind them, come from calc.js. */
    const c = checkStrings({ wall: subject.wall, ca, millTol: tol, t });
    $('chk').className = 'chk' + (pick ? '' : ' fail');
    $('chkSch').textContent = 'Sch ' + subject.name;
    $('chkAvail').textContent = c.available;
    $('chkReq').textContent = c.required;
    $('chkEx').textContent = c.excess;

    /* The working: each step with this page's numbers substituted, in the order you would
       do it by hand. Intermediate values are shown to 4 places but carried unrounded, so a
       hand check can differ from a printed step in the last digit. */
    const f4 = x => roundTo(x, 4).toFixed(4) + '"';
    const m = +tol.toFixed(4);
    const sub = (k, expr, v) => `<div class="step"><div class="row"><span class="k">${k}</span>`
      + `<span class="v">${v}</span></div><div class="calc">${expr}</div></div>`;
    $('detBody').innerHTML =
      sub('PRESSURE WALL (t)',
        `${P} &times; ${D} / (2 &times; (${Math.round(S)} &times; ${E} + ${Y} &times; ${P}))`, f4(t))
      + sub('WALL WITH ALLOWANCES (t<sub>m</sub>)', `t + CA = ${f4(t)} + ${ca}"`, f4(t + ca))
      + sub('MIN NOMINAL WALL (t<sub>NOM,min</sub>)',
        `t<sub>m</sub> / (1 &minus; MT) = ${f4(t + ca)} / (1 &minus; ${m})`, f4(need))
      + `<div class="sum">Sch ${subject.name}</div>`
      + sub('NOMINAL WALL (t<sub>NOM</sub>)', 'from the schedule table', subject.wall.toFixed(3) + '"')
      + sub('AVAILABLE WALL (t<sub>LMC</sub>)',
        `t<sub>NOM</sub> &times; (1 &minus; MT) &minus; CA = ${subject.wall.toFixed(3)} &times; (1 &minus; ${m}) &minus; ${ca}"`,
        c.available)
      + sub('EXCESS', `t<sub>LMC</sub> &minus; t = ${c.available} &minus; ${c.required}`, c.excess);
  }

  /* The note carries stop conditions ONLY. An empty one collapses - see .note:empty.
     The informational sentence that used to live here was removed: what it explained
     is now stated by the check block and the footer Basis. */
  const n = $('note');
  if (stopped) {
    n.className = 'note stop';
    n.textContent = 'Pressure wall (t) reaches D/6, where this formula no longer applies.';
  } else if (!pick) {
    n.className = 'note stop';
    n.textContent = 'No permitted schedule is thick enough.';
  } else {
    n.className = 'note';
    n.textContent = '';
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
