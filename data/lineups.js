/* =============================================================
   DIN INNEHALLSFIL - lagg till nya lineups har.
   Formularet pa sajten (knappen "Lagg till lineup") genererar
   fardiga objekt som du klistrar in i listan nedan.

   Falt:
     id, map, side, type, target, from, throwType, difficulty,
     x, y (position i procent 0-100), tip, steps[{label,img,caption}]
   ============================================================= */
export const LINEUPS = [
  {
    id: 1, map: "mirage", side: "T", type: "smoke", target: "CT", from: "T Ramp",
    throwType: "Jump-throw", difficulty: "Easy", x: 56, y: 41,
    tip: "Sikta i hornet av skylten, hoppkasta. Blockar CT-rotation till A.",
    steps: [
      { label: "Setup", img: null, caption: "Sta i hornet vid T-ramp." },
      { label: "Aim", img: null, caption: "Sikta uppe till hoger pa skylten." },
      { label: "Result", img: null, caption: "Roken landar pa CT-passet." },
    ],
  },
  {
    id: 2, map: "mirage", side: "T", type: "smoke", target: "Connector", from: "T Spawn",
    throwType: "Run + jump-throw", difficulty: "Medium", x: 62, y: 47,
    tip: "Spring fram, slapp framat och hoppkasta direkt.",
    steps: [
      { label: "Setup", img: null, caption: "Linjera mot lyktstolpen." },
      { label: "Result", img: null, caption: "Roken stanger connector." },
    ],
  },
  {
    id: 3, map: "inferno", side: "T", type: "smoke", target: "CT", from: "Banana",
    throwType: "Left-click", difficulty: "Easy", x: 72, y: 45,
    tip: "Standard CT-smoke fran banana, vansterklick.",
    steps: [
      { label: "Setup", img: null, caption: "Sta vid logs." },
      { label: "Result", img: null, caption: "Roken landar pa CT." },
    ],
  },
];
