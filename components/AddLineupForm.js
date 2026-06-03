"use client";
import { useState } from "react";
import { X, Plus, Copy, Check } from "lucide-react";
import { TYPE_META } from "@/lib/constants";
import TacticalMap from "./TacticalMap";

export default function AddLineupForm({ map, onClose, onSave, initial }) {
  const editing = !!initial;
  const [f, setF] = useState(
    initial
      ? { target: initial.target, from: initial.from, side: initial.side, type: initial.type,
          throwType: initial.throwType, difficulty: initial.difficulty, tip: initial.tip || "",
          video: initial.video || "", x: initial.x, y: initial.y }
      : { target: "", from: "", side: "T", type: "smoke", throwType: "Jump-throw", difficulty: "Easy", tip: "", video: "", x: null, y: null }
  );
  const [steps, setSteps] = useState(
    initial ? initial.steps.map((s) => ({ label: s.label, caption: s.caption, img: s.img || "" }))
            : [{ label: "Setup", caption: "", img: "" }]
  );
  const [snippet, setSnippet] = useState(null);
  const [copied, setCopied] = useState(false);

  const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const upStep = (i, k, v) => setSteps((p) => p.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const addStep = () => steps.length < 3 && setSteps((p) => [...p, { label: "Aim", caption: "", img: "" }]);
  const rmStep = (i) => setSteps((p) => p.filter((_, j) => j !== i));
  const valid = f.target && f.from && f.x != null;

  function build() {
    return {
      map: map.id, side: f.side, type: f.type, target: f.target, from: f.from,
      throwType: f.throwType, difficulty: f.difficulty, x: f.x, y: f.y, tip: f.tip || null,
      video: f.video || null,
      steps: steps.map((s) => ({ label: s.label, img: s.img || null, caption: s.caption })),
    };
  }
  function submit() {
    if (!valid) return;
    const obj = build();
    if (editing) { onSave(obj, initial.id); onClose(); }
    else { onSave(obj); setSnippet(buildSnippet(obj)); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }

  return (
    <div className="ub-overlay" onClick={onClose}>
      <div className="ub-modal ub-form" onClick={(e) => e.stopPropagation()}>
        <button className="ub-close" onClick={onClose}><X size={18} /></button>
        <div className="ub-form-head">
          <div className="ub-hero-kicker">{editing ? "Edit" : "New lineup"} · {map.name}</div>
          <h2>{editing ? "Edit lineup" : "Add lineup"}</h2>
        </div>

        {snippet ? (
          <div className="ub-snippet">
            <p className="ub-snippet-intro">Added. Paste this into <code>data/lineups.js</code> to keep it permanently:</p>
            <textarea readOnly value={snippet} onClick={(e) => e.target.select()} />
            <div className="ub-snippet-actions">
              <button className="ub-btn-primary" onClick={copy}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy code</>}</button>
              <button className="ub-btn-ghost" onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <div className="ub-form-grid">
            <div className="ub-form-map">
              <div className="ub-form-maphint">Click on the map to place the lineup. Use + / − to zoom.</div>
              <TacticalMap map={map} lineups={[]} addMode zoomable draftPos={f.x != null ? { x: f.x, y: f.y } : null}
                onMapClick={({ x, y }) => setF((p) => ({ ...p, x, y }))} onPin={() => {}} />
            </div>
            <div className="ub-form-fields">
              <label className="ub-field"><span>Target (where it lands)</span>
                <input value={f.target} onChange={(e) => up("target", e.target.value)} placeholder="e.g. CT, Window…" /></label>
              <label className="ub-field"><span>From (where you stand)</span>
                <input value={f.from} onChange={(e) => up("from", e.target.value)} placeholder="e.g. T Ramp" /></label>
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
              <label className="ub-field"><span>Video URL (optional — mp4 or YouTube)</span>
                <input value={f.video} onChange={(e) => up("video", e.target.value)} placeholder="https://…" /></label>
              <label className="ub-field"><span>Instruction (optional)</span>
                <textarea rows={2} value={f.tip} onChange={(e) => up("tip", e.target.value)} placeholder="Short description of the throw…" /></label>

              <div className="ub-steps-edit">
                <div className="ub-steps-head"><span>Still images ({steps.length}/3)</span>
                  {steps.length < 3 && <button type="button" onClick={addStep}><Plus size={13} /> step</button>}</div>
                {steps.map((s, i) => (
                  <div key={i} className="ub-step-edit">
                    <select value={s.label} onChange={(e) => upStep(i, "label", e.target.value)}><option>Setup</option><option>Aim</option><option>Result</option></select>
                    <input value={s.caption} onChange={(e) => upStep(i, "caption", e.target.value)} placeholder="Caption" />
                    <input value={s.img} onChange={(e) => upStep(i, "img", e.target.value)} placeholder="Image URL (optional)" />
                    {steps.length > 1 && <button type="button" className="ub-step-rm" onClick={() => rmStep(i)}><X size={13} /></button>}
                  </div>
                ))}
              </div>

              <button className="ub-btn-primary ub-submit" onClick={submit} disabled={!valid}>
                {!valid ? (f.x == null ? "Click the map first" : "Fill in target & from") : editing ? "Save changes" : "Save lineup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildSnippet(o) {
  const steps = o.steps.map(
    (s) => `    { label: ${JSON.stringify(s.label)}, img: ${s.img ? JSON.stringify(s.img) : "null"}, caption: ${JSON.stringify(s.caption)} },`
  ).join("\n");
  return `{
  id: /* set a unique number */,
  map: ${JSON.stringify(o.map)},
  side: ${JSON.stringify(o.side)},
  type: ${JSON.stringify(o.type)},
  target: ${JSON.stringify(o.target)},
  from: ${JSON.stringify(o.from)},
  throwType: ${JSON.stringify(o.throwType)},
  difficulty: ${JSON.stringify(o.difficulty)},
  x: ${o.x}, y: ${o.y},
  tip: ${o.tip ? JSON.stringify(o.tip) : "null"},
  video: ${o.video ? JSON.stringify(o.video) : "null"},
  steps: [
${steps}
  ],
},`;
}
