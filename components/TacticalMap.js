"use client";
import { useRef, useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { animate, stagger } from "animejs";
import { TYPE_META } from "@/lib/constants";
import { MAP_ZONES } from "@/data/radars";

export default function TacticalMap({ map, lineups = [], onPin, addMode, onMapClick, draftPos, zoomable }) {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(1);
  const zones = MAP_ZONES[map.id] || [];

  useEffect(() => {
    if (addMode || !ref.current) return;
    const dots = ref.current.querySelectorAll(".ub-pin .ub-pin-dot");
    if (dots.length) animate(dots, { scale: [0, 1], opacity: [0, 1], duration: 340, delay: stagger(26), ease: "outBack" });
  }, [lineups, map.id, addMode, zoom]);

  function handleClick(e) {
    if (!addMode) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    onMapClick({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  return (
    <div className="ub-mapouter">
      {zoomable && (
        <div className="ub-zoom">
          <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1)))}><Plus size={15} /></button>
          <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))} disabled={zoom <= 1}><Minus size={15} /></button>
        </div>
      )}
      <div className={`ub-mapscroll ${zoom > 1 ? "zoomed" : ""}`}>
        <div
          ref={ref}
          className={`ub-map ${addMode ? "addmode" : ""} ${map.radar ? "has-img" : ""}`}
          style={{ width: `${zoom * 100}%` }}
          onClick={handleClick}
        >
          {map.radar ? (
            <img className="ub-map-img" src={map.radar} alt={`${map.name} radar`} draggable={false} />
          ) : (
            <div className="ub-map-schema">
              {zones.map((z, i) => (
                <div key={i} className={`ub-zone ${z.site ? "site" : ""}`}
                  style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` }}>
                  <span>{z.label}</span>
                </div>
              ))}
            </div>
          )}

          {!addMode && lineups.map((l) => (
            <button key={l.id} className="ub-pin" style={{ left: `${l.x}%`, top: `${l.y}%`, "--pin": TYPE_META[l.type].color }}
              onClick={(e) => { e.stopPropagation(); onPin(l); }} title={`${l.target} (${TYPE_META[l.type].label})`}>
              <span className="ub-pin-dot" />
            </button>
          ))}

          {addMode && draftPos && (
            <span className="ub-pin ub-pin-draft" style={{ left: `${draftPos.x}%`, top: `${draftPos.y}%` }}>
              <span className="ub-pin-dot" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
