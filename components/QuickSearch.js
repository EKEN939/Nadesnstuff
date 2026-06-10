"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft, MapPin } from "lucide-react";
import NadeIcon from "@/components/NadeIcon";
import { TYPE_META } from "@/lib/constants";

export default function QuickSearch({ open, onClose, lineups, maps, onPick }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const mapName = (id) => maps.find((m) => m.id === id)?.name || id;

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return lineups
      .filter((l) => {
        const hay = `${l.target} ${l.from || ""} ${l.spawn || ""} ${mapName(l.map)} ${TYPE_META[l.type]?.label || ""} ${l.throwType || ""} ${l.side || ""}`.toLowerCase();
        return s.split(/\s+/).every((w) => hay.includes(w));
      })
      .slice(0, 12);
  }, [q, lineups, maps]);

  useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);
  useEffect(() => { setIdx(0); }, [q]);
  useEffect(() => {
    listRef.current?.children?.[idx]?.scrollIntoView({ block: "nearest" });
  }, [idx]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopImmediatePropagation(); onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === "Enter" && results[idx]) { e.preventDefault(); onPick(results[idx]); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, results, idx, onPick, onClose]);

  if (!open) return null;
  return (
    <div className="ub-qs-overlay" onClick={onClose}>
      <div className="ub-qs" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Quick search">
        <div className="ub-qs-inputrow">
          <Search size={16} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search lineups — spot, position, map, type…" aria-label="Search lineups" />
          <kbd>esc</kbd>
        </div>
        {q.trim() && (
          results.length > 0 ? (
            <div className="ub-qs-list" ref={listRef}>
              {results.map((l, i) => (
                <button key={l.id} className={`ub-qs-item ${i === idx ? "act" : ""}`}
                  onMouseEnter={() => setIdx(i)} onClick={() => onPick(l)}>
                  <span className="ub-qs-ico" style={{ color: TYPE_META[l.type]?.color }}><NadeIcon type={l.type} size={15} /></span>
                  <span className="ub-qs-main">
                    <span className="ub-qs-target">{l.target}</span>
                    {l.from && <span className="ub-qs-from">from {l.from}</span>}
                  </span>
                  <span className="ub-qs-meta">
                    <span className={`ub-qs-side ${l.side === "T" ? "t" : "ct"}`}>{l.side}</span>
                    <span className="ub-qs-map"><MapPin size={11} /> {mapName(l.map)}</span>
                  </span>
                  {i === idx && <CornerDownLeft size={13} className="ub-qs-enter" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="ub-qs-none">No lineups match &ldquo;{q}&rdquo;.</div>
          )
        )}
        {!q.trim() && (
          <div className="ub-qs-hint">Type to search every map — <kbd>↑</kbd><kbd>↓</kbd> to navigate, <kbd>↵</kbd> to open.</div>
        )}
      </div>
    </div>
  );
}
