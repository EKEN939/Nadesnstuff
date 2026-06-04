"use client";
import { MapPin, ArrowRight, Footprints, ChevronRight, Video, Star } from "lucide-react";
import { TYPE_META, DIFF_COLOR } from "@/lib/constants";
import NadeIcon from "./NadeIcon";

export default function LineupCard({ lineup, index = 0, onClick, fav, onToggleFav }) {
  const t = TYPE_META[lineup.type];
  const thumb = lineup.steps?.find((s) => s.img)?.img || null;
  return (
    <button className="ub-card" style={{ animationDelay: `${index * 45}ms` }} onClick={onClick}>
      {thumb && (
        <div className="ub-card-thumb"><img src={thumb} alt={lineup.target} /></div>
      )}
      <div className="ub-card-top">
        <div className="ub-typebadge" style={{ color: t.color }}><NadeIcon type={lineup.type} size={16} /><span>{t.label}</span></div>
        <div className="ub-card-flags">
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
