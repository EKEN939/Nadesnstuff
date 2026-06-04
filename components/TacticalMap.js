"use client";
import { useRef, useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { animate, stagger } from "animejs";
import { TYPE_META } from "@/lib/constants";
import { MAP_ZONES } from "@/data/radars";

export default function TacticalMap({
  map, spots = [], activeSpot, onSelectSpot, onPin,
  addMode, draftLand, draftThrow, onMapClick, zoomable,
}) {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [imgOk, setImgOk] = useState(true);
  const zones = MAP_ZONES[map.id] || [];
  const radarSrc = map.radar || "/radars/" + map.id + ".png";
  const active = spots.find((s) => s.target === activeSpot) || null;
  useEffect(() => { setImgOk(true); }, [map.id]);

  useEffect(() => {
    if (addMode || !ref.current) return;
    const dots = ref.current.querySelectorAll(".ub-pin .ub-pin-dot");
    if (dots.length) animate(dots, { scale: [0, 1], opacity: [0, 1], duration: 340, delay: stagger(26), ease: "outBack" });
  }, [spots, map.id, addMode, zoom]);

  function handleClick(e) {
    if (!addMode) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    onMapClick({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  const lineEnds = [];
  if (!addMode && active) {
    active.lineups.forEach((l) => { if (l.fromX != null) lineEnds.push({ l, x1: l.fromX, y1: l.fromY, x2: active.x, y2: active.y }); });
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
      <div className="ub-mapscroll">
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

          {(lineEnds.length > 0 || showDraftLine) && (
            <svg className="ub-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {lineEnds.map(({ l, x1, y1, x2, y2 }) => (
                <line key={l.id} x1={x1} y1={y1} x2={x2} y2={y2} className="ub-line" vectorEffect="non-scaling-stroke" />
              ))}
              {showDraftLine && (
                <line x1={draftThrow.x} y1={draftThrow.y} x2={draftLand.x} y2={draftLand.y} className="ub-line draft" vectorEffect="non-scaling-stroke" />
              )}
            </svg>
          )}

          {/* browse: grouped landing pins */}
          {!addMode && spots.map((s) => {
            const types = [...new Set(s.lineups.map((l) => l.type))];
            const color = types.length === 1 ? TYPE_META[types[0]].color : "#ececec";
            const dim = activeSpot && s.target !== activeSpot;
            return (
              <button key={s.target} className={`ub-pin ub-spinpin ${dim ? "dim" : ""}`} style={{ left: `${s.x}%`, top: `${s.y}%`, "--pin": color }}
                onClick={(e) => { e.stopPropagation(); s.lineups.length > 1 ? onSelectSpot(s.target) : onPin(s.lineups[0]); }}
                title={`${s.target} (${s.lineups.length})`}>
                <span className="ub-pin-dot" />
                {s.lineups.length > 1 && <span className="ub-pin-count">{s.lineups.length}</span>}
              </button>
            );
          })}

          {/* browse: throw spots for the active landing spot */}
          {!addMode && active && active.lineups.map((l) => l.fromX != null && (
            <button key={"t" + l.id} className="ub-throwdot" style={{ left: `${l.fromX}%`, top: `${l.fromY}%`, "--pin": TYPE_META[l.type].color }}
              onClick={(e) => { e.stopPropagation(); onPin(l); }} title={l.spawn || l.from} />
          ))}

          {/* add mode: landing + throw drafts */}
          {addMode && draftLand && (
            <span className="ub-pin ub-draft-land" style={{ left: `${draftLand.x}%`, top: `${draftLand.y}%` }}><span className="ub-pin-dot" /></span>
          )}
          {addMode && draftThrow && (
            <span className="ub-pin ub-draft-throw" style={{ left: `${draftThrow.x}%`, top: `${draftThrow.y}%` }}><span className="ub-pin-dot" /></span>
          )}
        </div>
      </div>
    </div>
  );
}
