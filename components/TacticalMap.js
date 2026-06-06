"use client";
import { useRef, useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { animate, stagger } from "animejs";
import { TYPE_META } from "@/lib/constants";
import { MAP_ZONES } from "@/data/radars";
import NadeIcon from "./NadeIcon";

export default function TacticalMap({
  map, spots = [], activeSpot, onSelectSpot, onPin, selected,
  addMode, draftLand, draftThrow, onMapClick, zoomable,
}) {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [imgOk, setImgOk] = useState(true);
  const zones = MAP_ZONES[map.id] || [];
  const radarSrc = map.radar || "/radars/" + map.id + ".png";
  const active = spots.find((s) => s.target === activeSpot) || null;
  useEffect(() => { setImgOk(true); }, [map.id]);

  const scrollRef = useRef(null);
  const drag = useRef(null);
  const movedRef = useRef(false);
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [zoom]);
  function onPointerDown(e) { if (zoom <= 1) return; const el = scrollRef.current; drag.current = { x: e.clientX, y: e.clientY, l: el.scrollLeft, t: el.scrollTop }; movedRef.current = false; }
  function onPointerMove(e) { if (!drag.current) return; const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y; if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true; const el = scrollRef.current; el.scrollLeft = drag.current.l - dx; el.scrollTop = drag.current.t - dy; }
  function endDrag() { drag.current = null; }
  function onClickCapture(e) { if (movedRef.current) { e.stopPropagation(); e.preventDefault(); movedRef.current = false; } }

  useEffect(() => {
    if (addMode || !ref.current) return;
    const dots = ref.current.querySelectorAll(".ub-pin .ub-pin-marker, .ub-pin .ub-pin-dot");
    if (dots.length) animate(dots, { scale: [0, 1], opacity: [0, 1], duration: 340, delay: stagger(26), ease: "outBack" });
  }, [spots, map.id, addMode, zoom]);

  function linePath(x1, y1, x2, y2) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  useEffect(() => {
    if (addMode || !ref.current) return;
    ref.current.querySelectorAll(".ub-arc:not(.draft):not(.ghost)").forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      animate(p, { strokeDashoffset: [len, 0], duration: 600, ease: "out(2)" });
    });
    ref.current.querySelectorAll(".ub-proj").forEach((c) => {
      const d = c.dataset;
      animate(c, { cx: [+d.x1, +d.x2], cy: [+d.y1, +d.y2], duration: 2600, delay: 500, ease: "inOut(2)", loop: true });
    });
  }, [activeSpot, selected?.id]);

  function handleClick(e) {
    if (!addMode) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    onMapClick({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  const arcs = [];
  if (!addMode) {
    if (selected && selected.fromX != null) {
      const sibs = (spots.find((s) => s.target === selected.target)?.lineups || [])
        .filter((l) => l.id !== selected.id && l.fromX != null);
      sibs.forEach((l) => arcs.push({ l, x1: l.fromX, y1: l.fromY, x2: l.x, y2: l.y, ghost: true }));
      arcs.push({ l: selected, x1: selected.fromX, y1: selected.fromY, x2: selected.x, y2: selected.y, sel: true });
    } else if (active) {
      active.lineups.forEach((l) => { if (l.fromX != null) arcs.push({ l, x1: l.fromX, y1: l.fromY, x2: active.x, y2: active.y }); });
    }
  }
  const showDraftLine = addMode && draftLand && draftThrow;

  return (
    <div className="ub-mapouter">
      {zoomable && (
        <div className="ub-zoom">
          <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1)))}><Plus size={15} /></button>
          <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))} disabled={zoom <= 1}><Minus size={15} /></button>
        </div>
      )}
      <div ref={scrollRef} className={`ub-mapscroll ${zoom > 1 ? "zoomed" : ""}`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerLeave={endDrag} onClickCapture={onClickCapture}>
        <div ref={ref} className={`ub-map ${addMode ? "addmode" : ""} ${imgOk ? "has-img" : ""}`} style={{ width: `${zoom * 100}%` }} onClick={handleClick}>
          {imgOk ? (
            <img className="ub-map-img" src={radarSrc} alt={`${map.name} radar`} draggable={false} onError={() => setImgOk(false)} />
          ) : (
            <div className="ub-map-schema">
              {zones.map((z, i) => (
                <div key={i} className={`ub-zone ${z.site ? "site" : ""}`} style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` }}>
                  <span>{z.label}</span>
                </div>
              ))}
            </div>
          )}

          {(arcs.length > 0 || showDraftLine) && (
            <svg className="ub-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {arcs.map(({ l, x1, y1, x2, y2, sel, ghost }) => (
                <path key={l.id} d={linePath(x1, y1, x2, y2)}
                  className={`ub-arc ${sel ? "sel" : ""} ${ghost ? "ghost" : ""}`}
                  style={{ "--ac": TYPE_META[l.type].color }} />
              ))}
              {arcs.filter((a) => !a.ghost).map(({ l, x1, y1, x2, y2, sel }) => (
                <circle key={"p" + l.id} className={`ub-proj ${sel ? "sel" : ""}`} r={sel ? "1.3" : "1.0"} cx={x1} cy={y1} style={{ "--c": TYPE_META[l.type].color }} data-x1={x1} data-y1={y1} data-x2={x2} data-y2={y2} />
              ))}
              {showDraftLine && (
                <path d={linePath(draftThrow.x, draftThrow.y, draftLand.x, draftLand.y)} className="ub-arc draft" />
              )}
            </svg>
          )}

          {/* browse: grouped landing pins */}
          {!addMode && spots.map((s) => {
            const types = [...new Set(s.lineups.map((l) => l.type))];
            const iconType = types.length === 1 ? types[0] : null;
            const color = iconType ? TYPE_META[iconType].color : "#ececec";
            const focus = selected ? selected.target : activeSpot;
            const dim = focus && s.target !== focus;
            return (
              <button key={s.target} className={`ub-pin ub-spinpin ${dim ? "dim" : ""} ${focus && s.target === focus ? "act" : ""}`} style={{ left: `${s.x}%`, top: `${s.y}%`, "--pin": color }}
                onClick={(e) => { e.stopPropagation(); s.lineups.length > 1 ? onSelectSpot(s.target) : onPin(s.lineups[0]); }}
                title={`${s.target} (${s.lineups.length})`}>
                {iconType ? <span className="ub-pin-marker"><NadeIcon type={iconType} size={14} /></span> : <span className="ub-pin-dot" />}
                {s.lineups.length > 1 && <span className="ub-pin-count">{s.lineups.length}</span>}
                <span className="ub-pin-pop">
                  <strong>{s.target}</strong>
                  <em>{s.lineups.length} lineup{s.lineups.length !== 1 ? "s" : ""}</em>
                  <span className="ub-pin-poptypes">{types.map((tp) => <NadeIcon key={tp} type={tp} size={12} />)}</span>
                </span>
              </button>
            );
          })}

          {/* browse: throw spots for the active landing spot */}
          {!addMode && active && active.lineups.map((l) => l.fromX != null && (
            <button key={"t" + l.id} className="ub-throwdot" style={{ left: `${l.fromX}%`, top: `${l.fromY}%`, "--pin": TYPE_META[l.type].color }}
              onClick={(e) => { e.stopPropagation(); onPin(l); }} title={l.spawn || l.from} />
          ))}

          {/* browse: throw spot for a single selected lineup */}
          {!addMode && selected && !active && selected.fromX != null && (
            <span className="ub-throwdot sel" style={{ left: `${selected.fromX}%`, top: `${selected.fromY}%`, "--pin": TYPE_META[selected.type].color }} title={selected.spawn || selected.from} />
          )}

          {/* add mode: landing + throw drafts */}
          {addMode && draftLand && (
            <span className="ub-pin ub-draft-land" style={{ left: `${draftLand.x}%`, top: `${draftLand.y}%` }}><span className="ub-pin-dot" /></span>
          )}
          {addMode && draftThrow && (
            <span className="ub-pin ub-draft-throw" style={{ left: `${draftThrow.x}%`, top: `${draftThrow.y}%` }}><span className="ub-pin-dot" /></span>
          )}
        </div>
      </div>
      {!addMode && (
        <div className="ub-hud" aria-hidden="true">
          <i /><i /><i /><i />
          <span className="ub-hud-label">{map.name} · {spots.length} spot{spots.length !== 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}
