"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Users, Copy, Check, LogOut, Upload, Radio } from "lucide-react";
import { MAPS } from "@/data/maps";

const TEAM_COLOR = { T: "#e0b341", CT: "#5aa9e0" };
const fmt = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

export default function DemoHub({ room, isHost, configured, onCreateRoom, onLeaveRoom }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [copied, setCopied] = useState(false);
  const stateRef = useRef({ frame: 0, playing: false, speed: 1 });
  stateRef.current = { frame, playing, speed };

  const controllable = !room || isHost;
  const radar = MAPS.find((m) => m.id === "mirage")?.radar;

  useEffect(() => {
    fetch("/demos/sample.json").then((r) => r.json()).then(setData).catch(() => setErr("Could not load the sample demo."));
  }, []);

  // playback timer (only when we drive playback ourselves)
  useEffect(() => {
    if (!data || !playing || !controllable) return;
    const id = setInterval(() => {
      setFrame((f) => {
        if (f >= data.duration - 1) { setPlaying(false); return f; }
        return f + 1;
      });
    }, 1000 / (data.tickRate * speed));
    return () => clearInterval(id);
  }, [data, playing, speed, controllable]);

  // host: broadcast playback state
  useEffect(() => {
    if (!room || !isHost) return;
    const id = setInterval(() => {
      fetch("/api/room", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, state: stateRef.current }),
      }).catch(() => {});
    }, 500);
    return () => clearInterval(id);
  }, [room, isHost]);

  // viewer: follow host
  useEffect(() => {
    if (!room || isHost) return;
    const id = setInterval(() => {
      fetch("/api/room?room=" + encodeURIComponent(room))
        .then((r) => r.json())
        .then((d) => {
          if (d.state) {
            if (typeof d.state.frame === "number") setFrame(d.state.frame);
            setPlaying(!!d.state.playing);
            if (d.state.speed) setSpeed(d.state.speed);
          }
        })
        .catch(() => {});
    }, 700);
    return () => clearInterval(id);
  }, [room, isHost]);

  function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const j = JSON.parse(reader.result); if (Array.isArray(j.frames)) { setData(j); setFrame(0); setPlaying(false); } else setErr("That JSON isn't a parsed demo."); }
      catch { setErr("Could not read that file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  function copyInvite() {
    const url = window.location.origin + window.location.pathname + "?demo=1&room=" + room;
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  }

  const positions = data ? data.frames[Math.min(frame, data.duration - 1)] : [];
  const events = data ? data.events.filter((ev) => Math.abs(ev.frame - frame) < 6) : [];
  const t = data ? frame / data.tickRate : 0;
  const total = data ? data.duration / data.tickRate : 0;

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

      <div className="dh-stage">
        <div className="ub-map has-img dh-map">
          {radar && <img className="ub-map-img" src={radar} alt="Mirage radar" draggable={false} />}
          {positions.map((p, i) => (
            <span key={i} className="dh-dot" style={{ left: `${p[0]}%`, top: `${p[1]}%`, "--c": TEAM_COLOR[data.players[i].team] }} title={data.players[i].name}>
              <span className="dh-yaw" style={{ transform: `rotate(${p[2]}deg)` }} />
            </span>
          ))}
          {events.map((ev, i) => (
            <span key={"e" + i} className="dh-event" style={{ left: `${ev.x}%`, top: `${ev.y}%` }} />
          ))}
        </div>
      </div>

      <div className="dh-controls">
        <button className="dh-play" disabled={!controllable || !data} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className="dh-ctrl" disabled={!controllable || !data} onClick={() => { setFrame(0); setPlaying(false); }} title="Restart"><RotateCcw size={16} /></button>
        <span className="dh-time">{fmt(t)} / {fmt(total)}</span>
        <input className="dh-seek" type="range" min={0} max={data ? data.duration - 1 : 0} value={frame}
          disabled={!controllable || !data} onChange={(e) => { setFrame(+e.target.value); }} />
        <div className="dh-speed">
          {[0.5, 1, 2].map((s) => (
            <button key={s} className={speed === s ? "on" : ""} disabled={!controllable} onClick={() => setSpeed(s)}>{s}×</button>
          ))}
        </div>
      </div>

      <div className="dh-foot">
        <label className="ub-upload">
          <Upload size={13} /> Load parsed demo (.json)
          <input type="file" accept="application/json,.json" hidden onChange={onUpload} />
        </label>
        <span className="dh-note">Sample round shown. Real <code>.dem</code> upload + parsing is the next phase (needs the parser service). {!controllable && "Controls are driven by the host."}</span>
      </div>
    </div>
  );
}
