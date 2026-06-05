"use client";
import { MapPin, ArrowRight, Footprints, ChevronRight, Video, Star, CheckCircle2 } from "lucide-react";
import { TYPE_META, DIFF_COLOR } from "@/lib/constants";
import NadeIcon from "./NadeIcon";

export default function LineupCard({ lineup, index = 0, onClick, fav, onToggleFav, learned, mapName }) {
  const t = TYPE_META[lineup.type];
  const thumb = lineup.preview || lineup.steps?.find((s) => s.img)?.img || null;
  return (
    <button className={`ub-card ${learned ? "learned" : ""}`} style={{ animationDelay: `${index * 45}ms` }} onClick={onClick}>
      {thumb ? (
        <div className="ub-card-thumb"><img src={thumb} alt={lineup.target} /></div>
      ) : (
        <div className="ub-card-thumb ub-card-minimap">
          <img src={`/radars/${lineup.map}.png`} alt="" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="ub-mini-svg" aria-hidden="true">
            {lineup.fromX != null && lineup.x != null && (
              <line x1={lineup.fromX} y1={lineup.fromY} x2={lineup.x} y2={lineup.y} className="ub-mini-line" style={{ stroke: t.color }} />
            )}
            {lineup.fromX != null && <circle cx={lineup.fromX} cy={lineup.fromY} r="1.7" className="ub-mini-from" />}
            {lineup.x != null && <circle cx={lineup.x} cy={lineup.y} r="2.7" className="ub-mini-land" style={{ fill: t.color }} />}
          </svg>
          <span className="ub-mini-tag">lands here</span>
        </div>
      )}
      <div className="ub-card-top">
        <div className="ub-typebadge" style={{ color: t.color }}><NadeIcon type={lineup.type} size={16} /><span>{t.label}</span></div>
        <div className="ub-card-flags">
          {mapName && <span className="ub-card-map">{mapName}</span>}
          {learned && <span className="ub-learnflag" title="Learned"><CheckCircle2 size={13} /></span>}
          <span className={`ub-fav ${fav ? "on" : ""}`} role="button" tabIndex={0} title="Favorite"
            onClick={(e) => { e.stopPropagation(); onToggleFav?.(); }}><Star size={14} fill={fav ? "currentColor" : "none"} /></span>
          {lineup.video && <span className="ub-videoflag"><Video size={12} /></span>}
          <span className={`ub-sidetag side-${lineup.side}`}>{lineup.side}</span>
        </div>
      </div>
      <div className="ub-card-target"><MapPin size={15} className="ub-accent-icon" />{lineup.target}</div>
      <div className="ub-card-route"><span>{lineup.from}</span><ArrowRight size={13} /><span>{lineup.target}</span></div>
      <div className="ub-card-meta">
        <span className="ub-meta-chip"><Footprints size={12} /> {lineup.throwType}</span>
        <span className="ub-meta-chip" style={{ color: DIFF_COLOR[lineup.difficulty] }}>{lineup.difficulty}</span>
      </div>
      <div className="ub-card-cta">View lineup <ChevronRight size={14} /></div>
    </button>
  );
}
