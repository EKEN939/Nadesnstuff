"use client";
import { useRef, useEffect } from "react";
import { animate, stagger } from "animejs";
import { TYPE_META } from "@/lib/constants";
import { MAP_ZONES } from "@/data/radars";

export default function TacticalMap({ map, lineups = [], onPin, addMode, onMapClick, draftPos }) {
  const ref = useRef(null);
  const zones = MAP_ZONES[map.id] || [];

  useEffect(() => {
    if (addMode || !ref.current) return;
    const dots = ref.current.querySelectorAll(".ub-pin .ub-pin-dot");
    if (dots.length) {
      animate(dots, { scale: [0, 1], opacity: [0, 1], duration: 360, delay: stagger(28), ease: "outBack" });
    }
  }, [lineups, map.id, addMode]);

  function handleClick(e) {
    if (!addMode) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    onMapClick({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  return (
    <div ref={ref} className={`ub-map ${addMode ? "addmode" : ""} ${map.radar ? "has-img" : ""}`} onClick={handleClick}>
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
          <span className="ub-schema-hint">stiliserad skiss · byt mot egen radar i <code>data/maps.js</code></span>
        </div>
      )}

      {!addMode &&
        lineups.map((l) => (
          <button
            key={l.id}
            className="ub-pin"
            style={{ left: `${l.x}%`, top: `${l.y}%`, "--pin": TYPE_META[l.type].color }}
            onClick={(e) => { e.stopPropagation(); onPin(l); }}
            title={`${l.target} (${TYPE_META[l.type].label})`}
          >
            <span className="ub-pin-dot" />
          </button>
        ))}

      {addMode && draftPos && (
        <span className="ub-pin ub-pin-draft" style={{ left: `${draftPos.x}%`, top: `${draftPos.y}%` }}>
          <span className="ub-pin-dot" />
        </span>
      )}
      {addMode && !draftPos && <div className="ub-map-prompt">Klicka pa kartan for att placera lineupen</div>}
    </div>
  );
}
