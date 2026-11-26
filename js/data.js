/* Content for the hero camera-wall simulation.
   Plain global data so the site works straight from index.html (no fetch, no build). */

window.AILYTICS_DATA = {
  CAMS: [
    { id: 1, name: 'CAM 1 ・ YARD' },
    { id: 2, name: 'CAM 2 ・ DOCK' },
    { id: 3, name: 'CAM 3 ・ TOWER A' },
    { id: 4, name: 'CAM 4 ・ GATE' },
    { id: 5, name: 'CAM 5 ・ PLANT 2' },
    { id: 6, name: 'CAM 6 ・ PLANT 2' },
  ],
  // Grid order (row by row): [1, 2] / [3, 4] / [5, 6]. Images are set per tile in styles.css.

  SCENES: [
    { category: 'safety',       cam: 1, tag: 'Reversing',       message: 'Person behind reversing truck' },
    { category: 'safety',       cam: 6, tag: 'No hard hat',     message: 'Missing hard hat in low light' },
    { category: 'security',     cam: 4, tag: 'Wrong way',       message: 'Wrong-way vehicle at gate' },
    { category: 'security',     cam: 5, tag: 'Restricted area', message: 'After-hours restricted-area entry' },
    { category: 'productivity', cam: 2, tag: '14 on shift',     message: '14 workers on shift at dock' },
    { category: 'productivity', cam: 3, tag: 'Idle 2h 10m',     message: 'Piling rig idle since 07:40' },
  ],

  CATEGORIES: ['safety', 'security', 'productivity'],

  TIMING: {
    scene: 4000,   // total length of each scene
    reveal: 300,   // tile colour / border / pill in (t = 0 → 300)
    scan: 2000,    // scan sweep left → right (t = 300 → 2300), hold until 4000
    textOut: 220,  // alert text fades out…
    textIn: 380,   // …then the new text fades in (keep in sync with --swap-out / --swap-in in styles.css)
  },
};
