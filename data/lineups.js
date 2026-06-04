/* =============================================================
   Lineups. Each one now has TWO points on the map:
     x, y         -> where the nade LANDS (the target/spot)
     fromX, fromY -> where you THROW from (your position)
   Lineups that share the same `target` are grouped into one pin
   (with a count). Clicking the pin draws lines to each throw spot.
   ============================================================= */
export const LINEUPS = [
  // --- Window: several ways to smoke the same spot, by spawn/position ---
  {
    id: 1, map: "mirage", side: "T", type: "smoke", target: "Window", from: "T Spawn",
    spawn: "T Spawn", throwType: "Run + jump-throw", difficulty: "Easy",
    x: 50, y: 40, fromX: 38, fromY: 86,
    tip: "Run forward from spawn and jump-throw. Instant window smoke.",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    steps: [
      { label: "Setup", img: null, caption: "Stand at T spawn, face the lamppost." },
      { label: "Result", img: null, caption: "Smoke lands in window." },
    ],
  },
  {
    id: 2, map: "mirage", side: "T", type: "smoke", target: "Window", from: "T Ramp",
    spawn: "T Ramp", throwType: "Jump-throw", difficulty: "Easy",
    x: 50, y: 40, fromX: 30, fromY: 54,
    tip: "From ramp, aim at the antenna and jump-throw.",
    video: null,
    steps: [{ label: "Aim", img: null, caption: "Aim at the antenna tip." }],
  },
  {
    id: 3, map: "mirage", side: "T", type: "smoke", target: "Window", from: "Mid",
    spawn: "Mid", throwType: "Left-click", difficulty: "Medium",
    x: 50, y: 40, fromX: 48, fromY: 60,
    tip: "Standing mid smoke, no jump needed.",
    video: null,
    steps: [{ label: "Result", img: null, caption: "Covers window from mid." }],
  },
  {
    id: 4, map: "mirage", side: "T", type: "smoke", target: "Window", from: "Top Mid",
    spawn: "Top Mid", throwType: "Right-click", difficulty: "Hard",
    x: 50, y: 40, fromX: 55, fromY: 55,
    tip: "Late window smoke from top mid.",
    video: null,
    steps: [{ label: "Aim", img: null, caption: "Right-click toward the ceiling corner." }],
  },

  // --- other spots ---
  {
    id: 5, map: "mirage", side: "T", type: "smoke", target: "CT", from: "T Ramp",
    spawn: "T Ramp", throwType: "Jump-throw", difficulty: "Easy",
    x: 56, y: 22, fromX: 30, fromY: 50,
    tip: "Blocks the CT rotate to A.",
    video: null,
    steps: [{ label: "Result", img: null, caption: "Smoke lands on CT." }],
  },
  {
    id: 6, map: "mirage", side: "T", type: "molly", target: "Market window", from: "Mid",
    spawn: "Mid", throwType: "Left-click", difficulty: "Easy",
    x: 66, y: 36, fromX: 50, fromY: 58,
    tip: "Burns a common lurker spot in market.",
    video: null,
    steps: [{ label: "Result", img: null, caption: "Fire covers the window." }],
  },
];
