/* Pipe dimensions and the EnerCorp permitted schedule set, per NPS.
 *
 * REFERENCE DATA — no logic in this file. Revise values here without reading code.
 * Walls are ASME B36.10M nominal, taken from the EnerCorp schedule matrix.
 *
 * Confirmed against line list 268782 (5 points, marked below).
 * The rest are unverified and want a spot-check against a controlled pipe chart.
 *
 * NPS 2 OD is 2.375. The source matrix says 2.38 and is wrong — do not "correct" this
 * back. See .scaffold/knowledge/reference-data-provenance.md
 *
 * Sizes 1-1/4, 2-1/2, 3-1/2, 5 and 22 are excluded by the EnerCorp matrix.
 * Where STD and Sch 40 are identical (up to NPS 10) or XS and Sch 80 are identical
 * (up to NPS 8), only one designation is listed. NPS 14 and above have no XXS.
 * NPS 16 has no Sch 40, since it equals XS.
 *
 * Key order here is NOT display order — the ladder is sorted by wall thickness at
 * render time. See js/calc.js ladder().
 */
export const PIPE = {
 '1/2'  :{od:0.840, sch:{'40':0.109,'80':0.147,'160':0.188,'XXS':0.294}},
 '3/4'  :{od:1.050, sch:{'40':0.113,'80':0.154,'160':0.219,'XXS':0.308}},
 '1'    :{od:1.315, sch:{'40':0.133,'80':0.179,'160':0.250,'XXS':0.358}}, // XXS confirmed
 '1-1/2':{od:1.900, sch:{'40':0.145,'80':0.200,'160':0.281,'XXS':0.400}},
 '2'    :{od:2.375, sch:{'40':0.154,'80':0.218,'160':0.344,'XXS':0.436}}, // OD + 160 confirmed
 '3'    :{od:3.500, sch:{'40':0.216,'80':0.300,'160':0.438,'XXS':0.600}},
 '4'    :{od:4.500, sch:{'40':0.237,'80':0.337,'160':0.531,'XXS':0.674}}, // 160 confirmed
 '6'    :{od:6.625, sch:{'40':0.280,'80':0.432,'160':0.719,'XXS':0.864}},
 '8'    :{od:8.625, sch:{'40':0.322,'80':0.500,'XXS':0.875,'160':0.906}}, // 80 confirmed
 '10'   :{od:10.750,sch:{'40':0.365,'XS':0.500,'80':0.594,'XXS':1.000,'160':1.125}}, // 80 confirmed
 '12'   :{od:12.750,sch:{'STD':0.375,'40':0.406,'XS':0.500,'80':0.688,'XXS':1.000,'160':1.312}},
 '14'   :{od:14.000,sch:{'STD':0.375,'40':0.438,'XS':0.500,'80':0.750,'160':1.406}},
 '16'   :{od:16.000,sch:{'STD':0.375,'XS':0.500,'80':0.844,'160':1.594}},
 '18'   :{od:18.000,sch:{'STD':0.375,'XS':0.500,'40':0.562,'80':0.938,'160':1.781}},
 '20'   :{od:20.000,sch:{'STD':0.375,'XS':0.500,'40':0.594,'80':1.031,'160':1.969}},
 '24'   :{od:24.000,sch:{'STD':0.375,'XS':0.500,'40':0.688,'80':1.219,'160':2.344}}
};
