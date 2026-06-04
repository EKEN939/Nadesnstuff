"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Users, Copy, Check, LogOut, Upload, Radio, Eye, Map as MapIcon, Box } from "lucide-react";
import { MAPS } from "@/data/maps";
import DemoScene from "./DemoScene";

const TEAM_COLOR = { T: "#e0b341", CT: "#5aa9e0" };
const fmt = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

export default function DemoHub({ room, isHost, configured, onCreateRoom, onLeaveRoom }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [viewMode, setViewMode] = useState("2d"); // "2d" | "3d"
  const [pov, setPov] = useState(null);           // selected player index | null
  const [copied, setCopied] = useState(false);
  const stateRef = useRef({});
  stateRef.current = { frame, playing, speed, viewMode, pov };

  const controllable = !room || isHost;
  const radar = MAPS.find((m) => m.id === "mirage")?.radar;

  useEffect(() => {
    fetch("/demos/sample.json").then((r) => r.json()).then(setData).catch(() => setErr("Could not load the sample demo."));
  }, []);

  useEffect(() => {
    if (!data || !playing || !controllable) return;
    const id = setInterval(() => {
      setFrame((f) => (f >= data.duration - 1 ? (setPlaying(false), f) : f + 1));
    }, 1000 / (data.tickRate * speed));
    return () => clearInterval(id);
  }, [data, playing, speed, controllable]);

  useEffect(() => {
    if (!room || !isHost) return;
    const id = setInterval(() => {
      fetch("/api/room", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, state: stateRef.current }) }).catch(() => {});
    }, 500);
    return () => clearInterval(id);
  }, [room, isHost]);

  useEffect(() => {
    if (!room || isHost) return;
    const id = setInterval(() => {
      fetch("/api/room?room=" + encodeURIComponent(room)).then((r) => r.json()).then((d) => {
        const s = d.state; if (!s) return;
        if (typeof s.frame === "number") setFrame(s.frame);
        setPlaying(!!s.playing);
        if (s.speed) setSpeed(s.speed);
        if (s.viewMode) setViewMode(s.viewMode);
        setPov(s.pov ?? null);
      }).catch(() => {});
    }, 700);
    return () => clearInterval(id);
  }, [room, isHost]);

  function onUpload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const j = JSON.parse(reader.result); if (Array.isArray(j.frames)) { setData(j); setFrame(0); setPlaying(false); setPov(null); } else setErr("That JSON isn't a parsed demo."); }
      catch { setErr("Could not read that file."); }
    };
    reader.readAsText(file); e.target.value = "";
  }
  const parseUrl = process.env.NEXT_PUBLIC_PARSER_URL;
  async function onDem(e) {
    const file = e.target.files?.[0]; if (!file || !parseUrl) return;
    setErr("Parsing demo… this can take a moment.");
    try {
      const fd = new FormData(); fd.append("demo", file);
      const res = await fetch(parseUrl.replace(/\/$/, "") + "/parse", { method: "POST", body: fd });
      const j = await res.json();
      if (Array.isArray(j.frames)) { setData(j); setFrame(0); setPlaying(false); setPov(null); setErr(""); }
      else setErr(j.error || "Parser returned unexpected data.");
    } catch { setErr("Could not reach the parser service."); }
    finally { e.target.value = ""; }
  }

  function copyInvite() {
    const url = window.location.origin + window.location.pathname + "?demo=1&room=" + room;
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  }
  const pickPlayer = (i) => { if (!controllable) return; setPov(i); if (viewMode === "2d") setViewMode("3d"); };

  const positions = data ? data.frames[Math.min(frame, data.duration - 1)] : [];
  const events = data ? data.events.filter((ev) => Math.abs(ev.frame - frame) < 6) : [];
  const t = data ? frame / data.tickRate : 0;
  const total = data ? data.duration / data.tickRate : 0;
  const teams = data ? ["T", "CT"].map((tm) => ({ tm, players: data.players.map((p, i) => ({ ...p, i })).filter((p) => p.team === tm) })) : [];

  return (
    <div className="dh">
      <div className="dh-head">
        <div>
          <div className="ub-hero-kicker">Demo Hub</div>
          <h1 className="ub-hero-title">Watch a demo</h1>
        </div>
        <div className="dh-roombar">
          {room ? (
            <>
              <span className={`dh-roomtag ${isHost ? "host" : ""}`}><Radio size={13} /> Room {room} · {isHost ? "you host" : "following"}</span>
              <button className="ub-toolbtn" onClick={copyInvite}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Invite link</>}</button>
              <button className="ub-toolbtn" onClick={onLeaveRoom}><LogOut size={15} /> Leave</button>
            </>
          ) : configured ? (
            <button className="ub-addbtn" onClick={onCreateRoom}><Users size={15} /> Create room</button>
          ) : (
            <span className="dh-hint">Connect Upstash in Vercel to enable rooms.</span>
          )}
        </div>
      </div>

      {err && <div className="dh-err">{err}</div>}

      <div className="dh-main">
        <div className="dh-left">
          <div className="dh-viewtoggle">
            <button className={viewMode === "2d" ? "on" : ""} disabled={!controllable} onClick={() => setViewMode("2d")}><MapIcon size={14} /> 2D map</button>
            <button className={viewMode === "3d" ? "on" : ""} disabled={!controllable} onClick={() => setViewMode("3d")}><Box size={14} /> 3D</button>
            {viewMode === "3d" && <button className={pov == null ? "on" : ""} disabled={!controllable} onClick={() => setPov(null)}><Eye size={14} /> Top</button>}
            {viewMode === "3d" && pov != null && data && <span className="dh-povlabel">POV · {data.players[pov].name}</span>}
          </div>

          <div className="dh-stage">
            {viewMode === "3d" ? (
              <DemoScene data={data} frame={frame} mode={pov == null ? "top" : "pov"} povIndex={pov ?? 0} />
            ) : (
              <div className="ub-map has-img dh-map">
                {radar && <img className="ub-map-img" src={radar} alt="Mirage radar" draggable={false} />}
                {positions.map((p, i) => (
                  <span key={i} className={`dh-dot ${pov === i ? "sel" : ""}`} style={{ left: `${p[0]}%`, top: `${p[1]}%`, "--c": TEAM_COLOR[data.players[i].team] }} title={data.players[i].name}>
                    <span className="dh-yaw" style={{ transform: `rotate(${p[2]}deg)` }} />
                  </span>
                ))}
                {events.map((ev, i) => <span key={"e" + i} className="dh-event" style={{ left: `${ev.x}%`, top: `${ev.y}%` }} />)}
              </div>
            )}
          </div>

          <div className="dh-controls">
            <button className="dh-play" disabled={!controllable || !data} onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
            <button className="dh-ctrl" disabled={!controllable || !data} onClick={() => { setFrame(0); setPlaying(false); }} title="Restart"><RotateCcw size={16} /></button>
            <span className="dh-time">{fmt(t)} / {fmt(total)}</span>
            <input className="dh-seek" type="range" min={0} max={data ? data.duration - 1 : 0} value={frame} disabled={!controllable || !data} onChange={(e) => setFrame(+e.target.value)} />
            <div className="dh-speed">{[0.5, 1, 2].map((s) => <button key={s} className={speed === s ? "on" : ""} disabled={!controllable} onClick={() => setSpeed(s)}>{s}×</button>)}</div>
          </div>
        </div>

        <div className="dh-roster">
          <div className="dh-rosterhead">Players · click for POV</div>
          {teams.map(({ tm, players }) => (
            <div key={tm} className="dh-team">
              <div className="dh-teamname" style={{ color: TEAM_COLOR[tm] }}>{tm}</div>
              {players.map((p) => (
                <button key={p.i} className={`dh-player ${pov === p.i ? "sel" : ""}`} disabled={!controllable} onClick={() => pickPlayer(p.i)}>
                  <span className="dh-pdot" style={{ background: TEAM_COLOR[tm] }} />
                  {p.name}
                  {pov === p.i && <Eye size={13} className="dh-peye" />}
                </button>
              ))}
            </div>
          ))}
          {!controllable && <div className="dh-hint">Following the host's view.</div>}
        </div>
      </div>

      <div className="dh-foot">
        {parseUrl && (
          <label className="ub-upload">
            <Upload size={13} /> Upload .dem
            <input type="file" accept=".dem" hidden onChange={onDem} />
          </label>
        )}
        <label className="ub-upload">
          <Upload size={13} /> Load parsed demo (.json)
          <input type="file" accept="application/json,.json" hidden onChange={onUpload} />
        </label>
        <span className="dh-note">Sample round shown. 3D uses the radar as the ground (no walls). Real <code>.dem</code> upload + parsing needs the parser service. {!controllable && "Controls follow the host."}</span>
      </div>
    </div>
  );
}
