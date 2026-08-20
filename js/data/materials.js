/* Allowable stress by material - ASME B31.3 Table A-1C, U.S. Customary Units.
 *
 * REFERENCE DATA - no logic in this file. Revise values here without reading code.
 *
 * SOURCE: page scans of Table A-1C supplied by Adam from a licensed copy, saved at
 * .scaffold/knowledge/asme-a1c-scans/. Each entry below cites its Table A-1C line
 * number. Transcribed three times independently and reconciled - see
 * .scaffold/knowledge/reference-data-provenance.md.
 *
 * Format: s is a list of [temperature °F, allowable stress psi] points, ascending.
 * Between listed points the calculator interpolates linearly.
 *
 * `min` is the minimum temperature Table A-1C lists for the material. Where the table
 * prints a letter code instead of a number (Note (6)), the code is carried as a string
 * and the tool cannot check the floor - it says so instead of inventing a number.
 * `max` is this tool's ceiling, not the table's. See TEMPERATURE CEILING below.
 *
 * Both temperature limits produce a WARNING, not a refusal. That is a decision Adam
 * took on 2026-08-20: the note is sufficient for a screening tool. The schedule ladder
 * still renders. Do not "fix" this into a suppression without asking.
 *
 * ORDER IS ASCENDING SPEC NUMBER, which is how an engineer scans a material list.
 * Key order here is the dropdown order. It interleaves pipe with fittings and
 * forgings deliberately: the spec number is what the user is looking for.
 * The output still reads as a pipe schedule and does not know a forging was selected.
 *
 * TEMPERATURE CEILING - why max is 900 and not the table's 1,000/1,100:
 * calc.js uses a fixed Y = 0.4, which B31.3 gives for ferritic materials at 900 °F
 * and below. The table lists stress above that; this tool refuses there rather than
 * apply a Y it cannot justify. Raising any ceiling requires the Y table first.
 *
 * Several of these materials share an identical stress row in Table A-1C. The rows
 * are written out per material rather than shared, so each one can be diffed against
 * its own printed line without following a reference.
 */
export const MATS = {

 // A105 - Table A-1C line 144. Carbon steel forgings for flanges, fittings and valves.
 // CONFIRMED against the licensed Table A-1C scan. Yield 36 ksi, tensile 70 ksi, min temp -20 °F.
 // Table runs to 1,100 °F; capped at 900 by the Y = 0.4 limit above.
 'A105': {
   desc: 'carbon steel forgings for flanges, fittings and valves',
   min: -20,
   max: 900,
   s: [[100,23300],[200,22000],[300,21200],[400,20500],[500,19600],[600,18400],
       [650,17800],[700,17200],[750,14800],[800,12000],[850,9300],[900,6700]]
 },

 // A106 Gr B - Table A-1C line 33. Seamless carbon steel pipe, high-temperature service.
 // CONFIRMED against the licensed Table A-1C scan. Yield 35 ksi, tensile 60 ksi.
 // Table runs to 1,100 °F; capped at 900 by the Y = 0.4 limit above.
 'A106 Gr B': {
   desc: 'seamless carbon steel pipe, high-temperature service',
   min: 'B',
   max: 900,
   s: [[100,20000],[200,20000],[300,20000],[400,19900],[500,19000],[600,17900],
       [650,17300],[700,16700],[750,13900],[800,11400],[850,8700],[900,5900]]
 },

 // A234 WPB - Table A-1C line 129. Wrought carbon steel butt-weld fittings, high-temperature service.
 // CONFIRMED against the licensed Table A-1C scan. Yield 35 ksi, tensile 60 ksi.
 // Table runs to 1,100 °F; capped at 900 by the Y = 0.4 limit above.
 'A234 WPB': {
   desc: 'wrought carbon steel butt-weld fittings, high-temperature service',
   min: 'B',
   max: 900,
   s: [[100,20000],[200,20000],[300,20000],[400,19900],[500,19000],[600,17900],
       [650,17300],[700,16700],[750,13900],[800,11400],[850,8700],[900,5900]]
 },

 // A333 Gr 6 - Table A-1C line 34. Seamless and welded carbon steel pipe, low-temperature service.
 // CONFIRMED against the licensed Table A-1C scan. Yield 35 ksi, tensile 60 ksi, min temp -50 °F.
 // 500 °F / 19,000 psi also matches line list 268782 independently.
 // Table runs to 1,100 °F; capped at 900 by the Y = 0.4 limit above.
 'A333 Gr 6': {
   desc: 'seamless/welded carbon steel pipe, low-temperature service',
   min: -50,
   max: 900,
   s: [[100,20000],[200,20000],[300,20000],[400,19900],[500,19000],[600,17900],
       [650,17300],[700,16700],[750,13900],[800,11400],[850,8700],[900,5900]]
 },

 // A350 LF2 Cl 1 - Table A-1C line 142. Carbon steel forgings, low-temperature service.
 // CONFIRMED against the licensed Table A-1C scan. Yield 36 ksi, tensile 70 ksi, min temp -50 °F.
 // Table runs to 1,000 °F; capped at 900 by the Y = 0.4 limit above.
 'A350 LF2 Cl 1': {
   desc: 'carbon steel forgings, low-temperature service, impact tested',
   min: -50,
   max: 900,
   s: [[100,23300],[200,22000],[300,21200],[400,20500],[500,19600],[600,18400],
       [650,17800],[700,17200],[750,14800],[800,12000],[850,9300],[900,6700]]
 },

 // A420 WPL6 - Table A-1C line 128. Wrought carbon steel butt-weld fittings, low-temperature service.
 // CONFIRMED against the licensed Table A-1C scan. Yield 35 ksi, tensile 60 ksi, min temp -50 °F.
 // Table runs to 1,000 °F; capped at 900 by the Y = 0.4 limit above.
 'A420 WPL6': {
   desc: 'wrought carbon steel butt-weld fittings, low-temperature service',
   min: -50,
   max: 900,
   s: [[100,20000],[200,20000],[300,20000],[400,19900],[500,19000],[600,17900],
       [650,17300],[700,16700],[750,13900],[800,11400],[850,8700],[900,5900]]
 }
};
