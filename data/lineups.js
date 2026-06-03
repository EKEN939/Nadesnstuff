/* =============================================================
   YOUR CONTENT FILE - add new lineups here.
   The "Add lineup" form on the site generates ready-to-paste
   objects for this list.

   Fields:
     id, map, side, type, target, from, throwType, difficulty,
     x, y (map position in percent 0-100),
     tip (short instruction or null),
     video (URL to a clip - mp4 or YouTube - or null),
     steps[{ label, img, caption }]  // still images, img = URL or null
   ============================================================= */
export const LINEUPS = [
  {
    id: 1, map: "mirage", side: "T", type: "smoke", target: "CT", from: "T Ramp",
    throwType: "Jump-throw", difficulty: "Easy", x: 56, y: 41,
    tip: "Aim at the corner of the sign and jump-throw. Blocks the CT rotate to A.",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    steps: [
      { label: "Setup", img: null, caption: "Stand in the corner at T ramp." },
      { label: "Aim", img: null, caption: "Aim at the top-right of the sign." },
      { label: "Result", img: null, caption: "The smoke lands on CT." },
    ],
  },
  {
    id: 2, map: "mirage", side: "T", type: "smoke", target: "Connector", from: "T Spawn",
    throwType: "Run + jump-throw", difficulty: "Medium", x: 62, y: 47,
    tip: "Run forward, release and jump-throw immediately.",
    video: null,
    steps: [
      { label: "Setup", img: null, caption: "Line up with the lamppost." },
      { label: "Result", img: null, caption: "The smoke closes connector." },
    ],
  },
  {
    id: 3, map: "mirage", side: "T", type: "molly", target: "Market window", from: "Mid",
    throwType: "Left-click", difficulty: "Easy", x: 66, y: 38,
    tip: "Burns a common lurker spot in market.",
    video: null,
    steps: [
      { label: "Result", img: null, caption: "Fire covers the window." },
    ],
  },
];
