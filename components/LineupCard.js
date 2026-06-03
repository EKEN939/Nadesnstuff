"use client";
import { MapPin, ArrowRight, Footprints, ChevronRight } from "lucide-react";
import { TYPE_META, DIFF_COLOR } from "@/lib/constants";
import { TYPE_ICON } from "@/lib/icons";

export default function LineupCard({ lineup, index = 0, onClick }) {
  const t = TYPE_META[lineup.type];
  const Icon = TYPE_ICON[lineup.type];
  return (
    <button className="ub-card" style={{ animationDelay: `${index * 45}ms` }} onClick={onClick}>
      <div className="ub-card-top">
        <div className="ub-typebadge" style={{ color: t.color }}><Icon size={15} /><span>{t.label}</span></div>
        <span className={`ub-sidetag side-${lineup.side}`}>{lineup.side}</span>
      </div>
      <div className="ub-card-target"><MapPin size={14} className="ub-accent-icon" />{lineup.target}</div>
      <div className="ub-card-route"><span>{lineup.from}</span><ArrowRight size={13} /><span>{lineup.target}</span></div>
      <div className="ub-card-meta">
        <span className="ub-meta-chip"><Footprints size={12} /> {lineup.throwType}</span>
        <span className="ub-meta-chip" style={{ color: DIFF_COLOR[lineup.difficulty] }}>{lineup.difficulty}</span>
      </div>
      <div className="ub-card-cta">Visa lineup <ChevronRight size={14} /></div>
    </button>
  );
}
