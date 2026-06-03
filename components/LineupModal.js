"use client";
import { useRef, useEffect } from "react";
import { animate } from "animejs";
import { X, ArrowRight, ImageOff, Pencil, Trash2 } from "lucide-react";
import { TYPE_META, DIFF_COLOR } from "@/lib/constants";
import { TYPE_ICON } from "@/lib/icons";

export default function LineupModal({ lineup, onClose, admin, onEdit, onDelete }) {
  const t = TYPE_META[lineup.type];
  const Icon = TYPE_ICON[lineup.type];
  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) animate(boxRef.current, { opacity: [0, 1], scale: [0.96, 1], duration: 240, ease: "outQuad" });
  }, []);

  return (
    <div className="ub-overlay" onClick={onClose}>
      <div className="ub-modal" ref={boxRef} onClick={(e) => e.stopPropagation()}>
        <button className="ub-close" onClick={onClose}><X size={18} /></button>
        <div className="ub-modal-head">
          <div className="ub-typebadge" style={{ color: t.color }}><Icon size={16} /><span>{t.label}</span></div>
          <h2>{lineup.target}</h2>
          <div className="ub-modal-route">
            <span className={`ub-sidetag side-${lineup.side}`}>{lineup.side}</span>
            <span>{lineup.from}</span><ArrowRight size={13} /><span>{lineup.target}</span>
            <span className="ub-dot">·</span><span className="ub-throw">{lineup.throwType}</span>
            <span className="ub-throw" style={{ color: DIFF_COLOR[lineup.difficulty] }}>{lineup.difficulty}</span>
          </div>
        </div>
        {lineup.tip && <div className="ub-tip"><span className="ub-tip-label">Instruktion</span>{lineup.tip}</div>}
        <div className="ub-steps">
          {lineup.steps.map((s, i) => (
            <div className="ub-step" key={i}>
              <div className="ub-step-imgwrap">
                {s.img ? (
                  <img src={s.img} alt={s.label} />
                ) : (
                  <div className="ub-placeholder"><ImageOff size={24} /><span>{s.label}</span><small>byt mot egen bild / gif</small></div>
                )}
                <span className="ub-step-num">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="ub-step-cap"><strong>{s.label}</strong>{s.caption}</div>
            </div>
          ))}
        </div>
        {admin && (
          <div className="ub-modal-actions">
            <button className="ub-btn-ghost" onClick={() => onEdit(lineup)}><Pencil size={14} /> Redigera</button>
            <button className="ub-btn-danger" onClick={() => onDelete(lineup.id)}><Trash2 size={14} /> Ta bort</button>
          </div>
        )}
      </div>
    </div>
  );
}
