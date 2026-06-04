// Minimal CS2 .dem -> nades'n'stuff player JSON service.
// Deploy this on Fly.io / Railway / Render (Linux). It is the piece that lets the
// Demo Hub accept real .dem files. UNTESTED against every demo — field names in
// demoparser2 can vary by version; adjust PROPS/team mapping if needed.
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { parseTicks, parseEvent } = require("@laihoe/demoparser2");

const app = express();
app.use(cors()); // lock this down to your site's origin in production
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 600 * 1024 * 1024 } });

const FPS = 8;        // output frames per second
const CS_TICK = 64;   // CS2 demos are 64-tick
const STEP = Math.round(CS_TICK / FPS);

// Map world coords -> radar percent. Per-map calibration (origin + scale) from the
// map's radar .txt. Mirage values below are approximate — tune per map.
const CAL = { de_mirage: { x: -3217, y: 1718, scale: 5.0 } };
function toPct(map, X, Y) {
  const c = CAL[map] || CAL.de_mirage;
  const px = (X - c.x) / (c.scale * 1024) * 100;
  const py = (c.y - Y) / (c.scale * 1024) * 100;
  return [Math.max(0, Math.min(100, +px.toFixed(1))), Math.max(0, Math.min(100, +py.toFixed(1)))];
}

app.post("/parse", upload.single("demo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "no file" });
  const file = req.file.path;
  try {
    const ticks = parseTicks(file, ["X", "Y", "yaw", "team_num"]);
    const mapName = "de_mirage"; // parseHeader(file).map_name if you want it exact
    // unique players in order of appearance
    const order = [];
    const meta = {};
    for (const t of ticks) {
      if (t.steamid != null && !(t.steamid in meta)) {
        meta[t.steamid] = { name: t.name || ("Player " + (order.length + 1)), team: t.team_num === 2 ? "T" : "CT" };
        order.push(t.steamid);
      }
    }
    const players = order.slice(0, 10).map((sid) => meta[sid]);
    const idx = Object.fromEntries(order.slice(0, 10).map((sid, i) => [sid, i]));

    // group by tick
    const byTick = new Map();
    for (const t of ticks) {
      if (!(t.steamid in idx)) continue;
      if (!byTick.has(t.tick)) byTick.set(t.tick, {});
      byTick.get(t.tick)[idx[t.steamid]] = [...toPct(mapName, t.X, t.Y), Math.round(t.yaw || 0)];
    }
    const tickNums = [...byTick.keys()].sort((a, b) => a - b);
    const frames = [];
    for (let i = 0; i < tickNums.length; i += STEP) {
      const slot = byTick.get(tickNums[i]);
      frames.push(players.map((_, p) => slot[p] || [50, 50, 0]));
    }

    let events = [];
    try {
      const kills = parseEvent(file, "player_death", ["X", "Y"], []);
      events = kills.slice(0, 200).map((k) => ({
        frame: Math.floor((k.tick - tickNums[0]) / STEP),
        type: "kill",
        ...((k.user_X != null) ? { x: toPct(mapName, k.user_X, k.user_Y)[0], y: toPct(mapName, k.user_X, k.user_Y)[1] } : { x: 50, y: 50 }),
      }));
    } catch {}

    res.json({ map: "mirage", tickRate: FPS, duration: frames.length, round: 1, players, frames, events });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  } finally {
    fs.unlink(file, () => {});
  }
});

app.get("/", (_, res) => res.send("nades'n'stuff demo parser ok"));
const port = process.env.PORT || 8080;
app.listen(port, () => console.log("demo parser on " + port));
