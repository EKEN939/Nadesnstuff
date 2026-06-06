"use client";
import { useEffect, useState } from "react";
import { ArrowRight, ImageOff, Pencil, Trash2, Link2, Check, Star, ChevronLeft, ChevronRight, Crosshair, Terminal, CheckCircle2, Folder, Plus, MapPin, ListOrdered } from "lucide-react";
import { TYPE_META, DIFF_COLOR } from "@/lib/constants";
import NadeIcon from "./NadeIcon";

export const PRACTICE_CMDS = "sv_cheats 1;sv_infinite_ammo 1;ammo_grenade_limit_total 5;mp_warmup_end;mp_freezetime 0;mp_roundtime 60;mp_roundtime_defuse 60;sv_grenade_trajectory 1;sv_grenade_trajectory_time 10;cl_grenadepreview 1;bot_kick;mp_limitteams 0;mp_autoteambalance 0;sv_showimpacts 1";

function VideoPlayer({ url }) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) {
    return (
      <div className="ub-video">
        <iframe src={`https://www.youtube.com/embed/${yt[1]}`} title="Lineup video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    );
  }
  return (
    <div className="ub-video">
      <video src={url} controls playsInline preload="metadata" />
    </div>
  );
}

export default function LineupDetail({ lineup, admin, onEdit, onDelete, fav, onToggleFav, learned, onToggleLearned, collections = [], toggleInCollection, createCollection, executes = [], addToExecute, createExecute, queueName, queueIndex = -1, queueTotal = 0, onQueuePrev, onQueueNext }) {
  const t = TYPE_META[lineup.type];
  const mapExecutes = executes.filter((e) => e.map === lineup.map);
  const mapLabel = lineup.map ? lineup.map.charAt(0).toUpperCase() + lineup.map.slice(1) : "";
  const [linkCopied, setLinkCopied] = useState(false);
  const [copied, setCopied] = useState("");
  const [colOpen, setColOpen] = useState(false);
  const [newCol, setNewCol] = useState("");
  const [execOpen, setExecOpen] = useState(false);
  const [newExec, setNewExec] = useState("");
  const steps = lineup.steps || [];
  const [step, setStep] = useState(0);
  useEffect(() => { setStep(0); setColOpen(false); setExecOpen(false); }, [lineup.id]);

  function copyLink() {
    if (typeof window === "undefined") return;
    const url = window.location.origin + window.location.pathname + "?map=" + lineup.map + "&lineup=" + lineup.id;
    navigator.clipboard?.writeText(url).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1500); }).catch(() => {});
  }
  function copy(text, key) {
    navigator.clipboard?.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(""), 1600); }).catch(() => {});
  }
  const cur = steps[step];

  return (
    <>
      {queueTotal > 1 && queueIndex >= 0 && (
        <div className="ub-queue">
          <button className="ub-queue-nav" onClick={onQueuePrev} disabled={queueIndex === 0} aria-label="Previous in collection"><ChevronLeft size={16} /></button>
          <span className="ub-queue-label"><Folder size={13} /> {queueName} · {queueIndex + 1}/{queueTotal}</span>
          <button className="ub-queue-nav" onClick={onQueueNext} disabled={queueIndex === queueTotal - 1} aria-label="Next in collection"><ChevronRight size={16} /></button>
        </div>
      )}
      <div className="ub-modal-head">
        <div className="ub-typebadge" style={{ color: t.color }}><NadeIcon type={lineup.type} size={17} /><span>{t.label}</span></div>
        <h2>{lineup.target}</h2>
        <div className="ub-modal-route">
          <span className={`ub-sidetag side-${lineup.side}`}>{lineup.side}</span>
          <span>{lineup.from}</span><ArrowRight size={13} /><span>{lineup.target}</span>
          <span className="ub-dot">·</span><span className="ub-throw">{lineup.throwType}</span>
          <span className="ub-throw" style={{ color: DIFF_COLOR[lineup.difficulty] }}>{lineup.difficulty}</span>
        </div>
        <div className="ub-modal-headbtns">
          <button className="ub-actbtn" onClick={copyLink}>
            {linkCopied ? <><Check size={14} /> Link copied</> : <><Link2 size={14} /> Copy link</>}
          </button>
          <button className={`ub-actbtn ${learned ? "on" : ""}`} onClick={onToggleLearned}>
            <CheckCircle2 size={14} /> {learned ? "Learned" : "Mark learned"}
          </button>
          {toggleInCollection && (
            <div className="ub-savecol" data-savecol>
              <button className={`ub-actbtn ${colOpen ? "on" : ""}`} onClick={() => setColOpen((o) => !o)}><Folder size={14} /> Save to collection</button>
              {colOpen && (
                <div className="ub-savecol-pop">
                  {collections.length === 0 && <div className="ub-savecol-empty">No collections yet — make one below.</div>}
                  {collections.map((c) => {
                    const inIt = c.items.map(String).includes(String(lineup.id));
                    return (
                      <button key={c.id} className={`ub-savecol-item ${inIt ? "on" : ""}`} onClick={() => toggleInCollection(lineup.id, c.id)}>
                        <span className="ub-savecol-check">{inIt && <Check size={13} />}</span> {c.name}
                      </button>
                    );
                  })}
                  <div className="ub-savecol-new">
                    <input placeholder="New collection…" value={newCol} onChange={(e) => setNewCol(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && newCol.trim()) { createCollection(newCol.trim(), lineup.id); setNewCol(""); } }} />
                    <button className="ub-icobtn" disabled={!newCol.trim()} onClick={() => { createCollection(newCol.trim(), lineup.id); setNewCol(""); }}><Plus size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          )}
          {addToExecute && (
            <div className="ub-savecol" data-savecol>
              <button className={`ub-actbtn ${execOpen ? "on" : ""}`} onClick={() => setExecOpen((o) => !o)}><ListOrdered size={14} /> Add to execute</button>
              {execOpen && (
                <div className="ub-savecol-pop">
                  <div className="ub-savecol-poptitle">{mapLabel} executes</div>
                  {mapExecutes.length === 0 && <div className="ub-savecol-empty">No executes for this map yet — make one below.</div>}
                  {mapExecutes.map((ex) => {
                    const inIt = ex.items.map(String).includes(String(lineup.id));
                    const pos = ex.items.map(String).indexOf(String(lineup.id));
                    return (
                      <button key={ex.id} className={`ub-savecol-item ${inIt ? "on" : ""}`} onClick={() => addToExecute(lineup.id, ex.id)}>
                        <span className="ub-savecol-check">{inIt && <Check size={13} />}</span> {ex.name}
                        {inIt && <span className="ub-exec-pos">#{pos + 1}</span>}
                      </button>
                    );
                  })}
                  <div className="ub-savecol-new">
                    <input placeholder="New execute…" value={newExec} onChange={(e) => setNewExec(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && newExec.trim()) { createExecute(newExec.trim(), lineup.map, lineup.id); setNewExec(""); } }} />
                    <button className="ub-icobtn" disabled={!newExec.trim()} onClick={() => { createExecute(newExec.trim(), lineup.map, lineup.id); setNewExec(""); }}><Plus size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button className={`ub-actbtn ${fav ? "fav-on" : ""}`} onClick={onToggleFav} aria-label="Favorite" title="Favorite">
            <Star size={14} fill={fav ? "currentColor" : "none"} /> {fav ? "Favourited" : "Favourite"}
          </button>
        </div>
      </div>

      {lineup.video && <VideoPlayer url={lineup.video} />}
      {lineup.tip && <div className="ub-tip"><span className="ub-tip-label">Instruction</span>{lineup.tip}</div>}

      {steps.length > 0 && (
        <div className="ub-guide">
          <div className="ub-guide-head">
            <span className="ub-guide-step" style={{ color: t.color }}>{cur.label}</span>
            <span className="ub-guide-count">{step + 1} / {steps.length}</span>
          </div>
          <div className="ub-guide-imgwrap">
            {cur.img ? <img src={cur.img} alt={cur.label} /> : <div className="ub-placeholder"><ImageOff size={26} /><span>{cur.label}</span><small>add an image when editing</small></div>}
            {steps.length > 1 && (
              <>
                <button className="ub-guide-nav left" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} aria-label="Previous"><ChevronLeft size={20} /></button>
                <button className="ub-guide-nav right" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1} aria-label="Next"><ChevronRight size={20} /></button>
              </>
            )}
          </div>
          {cur.caption && <div className="ub-guide-cap">{cur.caption}</div>}
          {steps.length > 1 && (
            <div className="ub-guide-dots">
              {steps.map((_, i) => <button key={i} className={`ub-guide-dot ${i === step ? "on" : ""}`} onClick={() => setStep(i)} aria-label={`Step ${i + 1}`} />)}
            </div>
          )}
        </div>
      )}

      <div className="ub-practice">
        <div className="ub-practice-h"><Crosshair size={14} /> Practice this lineup</div>
        <p className="ub-practice-sub">Start a private server, paste in console, then rehearse the throw.</p>
        <div className="ub-practice-btns">
          <button className="ub-btn-ghost" onClick={() => copy(PRACTICE_CMDS, "cfg")}>
            {copied === "cfg" ? <><Check size={14} /> Copied</> : <><Terminal size={14} /> Copy practice config</>}
          </button>
          {lineup.loc && (
            <button className="ub-btn-ghost" onClick={() => copy("sv_cheats 1;" + lineup.loc, "getpos")}>
              {copied === "getpos" ? <><Check size={14} /> Copied</> : <><MapPin size={14} /> Copy getpos</>}
            </button>
          )}
        </div>
      </div>

      {admin && (
        <div className="ub-modal-actions">
          <button className="ub-btn-ghost" onClick={() => onEdit(lineup)}><Pencil size={14} /> Edit</button>
          <button className="ub-btn-danger" onClick={() => onDelete(lineup.id)}><Trash2 size={14} /> Delete</button>
        </div>
      )}
    </>
  );
}
