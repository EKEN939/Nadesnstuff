"use client";
import { useState } from "react";
import { X, Plus, Check, Upload } from "lucide-react";
import { TYPE_META } from "@/lib/constants";
import TacticalMap from "./TacticalMap";

function Uploader({ accept, token, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(""); setPct(0);
    let tok = token;
    if (!tok) { try { tok = localStorage.getItem("nns_admin_token") || ""; } catch {} }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    if (tok) xhr.setRequestHeader("Authorization", "Bearer " + tok);
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setPct(Math.round((ev.loaded / ev.total) * 100)); };
    xhr.onload = () => {
      setBusy(false); setPct(0);
      let data = {}; try { data = JSON.parse(xhr.responseText || "{}"); } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && data.url) onUploaded(data.url);
      else setErr("Upload failed — " + (data.error || ("status " + xhr.status)));
    };
    xhr.onerror = () => { setBusy(false); setPct(0); setErr("Upload failed — network error"); };
    const fd = new FormData(); fd.append("file", file);
    xhr.send(fd);
    e.target.value = "";
  }
  return (
    <>
      <label className="ub-upload" title="Upload a file">
        <Upload size={13} /> {!busy ? "Upload" : pct > 0 ? `Uploading ${pct}%` : "Starting…"}
        <input type="file" accept={accept} onChange={onChange} hidden disabled={busy} />
      </label>
      {err && <span className="ub-uploaderr">{err}</span>}
    </>
  );
}

export default function AddLineupForm({ map, onClose, onSave, initial, token, existingSpots = [] }) {
  const editing = !!initial;
  const [f, setF] = useState(
    initial
      ? { target: initial.target, from: initial.from, spawn: initial.spawn || "", side: initial.side, type: initial.type,
          throwType: initial.throwType, difficulty: initial.difficulty, tip: initial.tip || "", video: initial.video || "",
          x: initial.x, y: initial.y, fromX: initial.fromX ?? null, fromY: initial.fromY ?? null, loc: initial.loc || "", preview: initial.preview || "" }
      : { target: "", from: "", spawn: "", side: "T", type: "smoke", throwType: "Jump-throw", difficulty: "Easy", tip: "", video: "",
          x: null, y: null, fromX: null, fromY: null, loc: "", preview: "" }
  );
  const [placing, setPlacing] = useState(initial && initial.x != null ? "throw" : "land");
  const [steps, setSteps] = useState(
    initial ? initial.steps.map((s) => ({ label: s.label, caption: s.caption, img: s.img || "" }))
            : [{ label: "Setup", caption: "", img: "" }]
  );

  const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const upStep = (i, k, v) => setSteps((p) => p.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const addStep = () => steps.length < 3 && setSteps((p) => [...p, { label: "Aim", caption: "", img: "" }]);
  const rmStep = (i) => setSteps((p) => p.filter((_, j) => j !== i));
  const valid = f.target && f.from && f.x != null && f.fromX != null;

  function onPlace({ x, y }) {
    if (placing === "land") {
      setF((p) => ({ ...p, x, y }));
      if (f.fromX == null) setPlacing("throw");
    } else {
      setF((p) => ({ ...p, fromX: x, fromY: y }));
    }
  }
  function pickSpot(target) {
    if (!target) { setF((p) => ({ ...p, target: "", x: null, y: null })); setPlacing("land"); return; }
    const s = existingSpots.find((e) => e.target === target);
    if (s) { setF((p) => ({ ...p, target: s.target, x: s.x, y: s.y })); setPlacing("throw"); }
  }

  function build() {
    return {
      map: map.id, side: f.side, type: f.type, target: f.target, from: f.from, spawn: f.spawn || null,
      throwType: f.throwType, difficulty: f.difficulty, x: f.x, y: f.y, fromX: f.fromX, fromY: f.fromY,
      tip: f.tip || null, video: f.video || null, loc: f.loc || null, preview: f.preview || null,
      steps: steps.map((s) => ({ label: s.label, img: s.img || null, caption: s.caption })),
    };
  }
  function submit() {
    if (!valid) return;
    const obj = build();
    if (editing) onSave(obj, initial.id);
    else onSave(obj);
    onClose();
  }

  const hint = placing === "land"
    ? "Step 1 — click where the nade LANDS."
    : "Step 2 — click where you THROW from.";

  return (
    <div className="ub-overlay" onClick={onClose}>
      <div className="ub-modal ub-form" onClick={(e) => e.stopPropagation()}>
        <button className="ub-close" onClick={onClose}><X size={18} /></button>
        <div className="ub-form-head">
          <div className="ub-hero-kicker">{editing ? "Edit" : "New lineup"} · {map.name}</div>
          <h2>{editing ? "Edit lineup" : "Add lineup"}</h2>
        </div>

        <div className="ub-form-grid">
            <div className="ub-form-map">
              <div className="ub-place-tabs">
                <button type="button" className={placing === "land" ? "on" : ""} onClick={() => setPlacing("land")}>
                  1 · Landing {f.x != null && <Check size={12} />}
                </button>
                <button type="button" className={placing === "throw" ? "on" : ""} onClick={() => setPlacing("throw")}>
                  2 · Throw {f.fromX != null && <Check size={12} />}
                </button>
              </div>
              <div className="ub-form-maphint">{hint} Use + / − to zoom.</div>
              <TacticalMap map={map} addMode zoomable
                draftLand={f.x != null ? { x: f.x, y: f.y } : null}
                draftThrow={f.fromX != null ? { x: f.fromX, y: f.fromY } : null}
                onMapClick={onPlace} />
            </div>
            <div className="ub-form-fields">
              {existingSpots.length > 0 && (
                <label className="ub-field"><span>Spot</span>
                  <select value={existingSpots.some((s) => s.target === f.target) ? f.target : ""} onChange={(e) => pickSpot(e.target.value)}>
                    <option value="">New spot…</option>
                    {existingSpots.map((s) => <option key={s.target} value={s.target}>{s.target}</option>)}
                  </select></label>
              )}
              <label className="ub-field"><span>Target / spot name (where it lands)</span>
                <input value={f.target} onChange={(e) => up("target", e.target.value)} placeholder="e.g. Window, CT, Jungle…" /></label>
              {(() => {
                const m = existingSpots.find((s) => s.target && s.target === f.target);
                if (!m) return null;
                return <div className="ub-spotnote">Adding to existing spot <strong>{m.target}</strong> — it already has {m.count} lineup{m.count !== 1 ? "s" : ""}. The pin count will go up by one.</div>;
              })()}
              <div className="ub-field-row">
                <label className="ub-field"><span>From (where you stand)</span>
                  <input value={f.from} onChange={(e) => up("from", e.target.value)} placeholder="e.g. T Ramp" /></label>
                <label className="ub-field"><span>Spawn (optional)</span>
                  <input value={f.spawn} onChange={(e) => up("spawn", e.target.value)} placeholder="e.g. T Spawn close" /></label>
              </div>
              <div className="ub-field-row">
                <label className="ub-field"><span>Side</span>
                  <select value={f.side} onChange={(e) => up("side", e.target.value)}><option>T</option><option>CT</option></select></label>
                <label className="ub-field"><span>Type</span>
                  <select value={f.type} onChange={(e) => up("type", e.target.value)}>
                    {Object.entries(TYPE_META).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}</select></label>
              </div>
              <div className="ub-field-row">
                <label className="ub-field"><span>Throw</span>
                  <select value={f.throwType} onChange={(e) => up("throwType", e.target.value)}>
                    <option>Left-click</option><option>Jump-throw</option><option>Run + jump-throw</option><option>Right-click</option></select></label>
                <label className="ub-field"><span>Difficulty</span>
                  <select value={f.difficulty} onChange={(e) => up("difficulty", e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
              </div>
              <label className="ub-field"><span>Video (mp4/YouTube URL — or upload)</span>
                <div className="ub-uploadrow">
                  <input value={f.video} onChange={(e) => up("video", e.target.value)} placeholder="https://…" />
                  <Uploader accept="video/*" token={token} onUploaded={(url) => up("video", url)} />
                </div></label>
              <label className="ub-field"><span>Preview image — smoke in place (optional)</span>
                <div className="ub-uploadrow">
                  <input value={f.preview} onChange={(e) => up("preview", e.target.value)} placeholder="https://… screenshot of the landed smoke" />
                  <Uploader accept="image/*" token={token} onUploaded={(url) => up("preview", url)} />
                </div>
                <small className="ub-field-hint">An in-game screenshot of the smoke landed/active — shows as the card thumbnail.</small></label>
              <label className="ub-field"><span>Instruction (optional)</span>
                <textarea rows={2} value={f.tip} onChange={(e) => up("tip", e.target.value)} placeholder="Short description of the throw…" /></label>
              <label className="ub-field"><span>Teleport (optional)</span>
                <input value={f.loc} onChange={(e) => up("loc", e.target.value)} placeholder="setpos 123 456 78;setang 1 2 3" />
                <small className="ub-field-hint">Stand on the throw spot in CS2, type <code>getpos</code> in console, and paste the printed line here. Then anyone can teleport exactly to this spot.</small></label>

              <div className="ub-steps-edit">
                <div className="ub-steps-head"><span>Still images ({steps.length}/3)</span>
                  {steps.length < 3 && <button type="button" onClick={addStep}><Plus size={13} /> step</button>}</div>
                {steps.map((s, i) => (
                  <div key={i} className="ub-step-edit">
                    <select value={s.label} onChange={(e) => upStep(i, "label", e.target.value)}><option>Setup</option><option>Aim</option><option>Result</option></select>
                    <input value={s.caption} onChange={(e) => upStep(i, "caption", e.target.value)} placeholder="Caption" />
                    <div className="ub-imgcell">
                      <input value={s.img} onChange={(e) => upStep(i, "img", e.target.value)} placeholder="Image URL" />
                      <Uploader accept="image/*" token={token} onUploaded={(url) => upStep(i, "img", url)} />
                    </div>
                    {steps.length > 1 && <button type="button" className="ub-step-rm" onClick={() => rmStep(i)}><X size={13} /></button>}
                  </div>
                ))}
              </div>

              <button className="ub-btn-primary ub-submit" onClick={submit} disabled={!valid}>
                {f.x == null ? "Click the landing spot" : f.fromX == null ? "Click the throw spot" : !f.target || !f.from ? "Fill in spot & from" : editing ? "Save changes" : "Save lineup"}
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
