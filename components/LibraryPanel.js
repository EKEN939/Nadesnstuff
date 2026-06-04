"use client";
import { useState } from "react";
import { X, Star, CheckCircle2, FolderPlus, Folder, Trash2, ChevronLeft, Pencil } from "lucide-react";
import LineupCard from "./LineupCard";

export default function LibraryPanel({
  view, setView, onClose, lineups, favs, learned, collections, maps,
  onOpenLineup, toggleFav, createCollection, renameCollection, deleteCollection,
}) {
  const [activeCol, setActiveCol] = useState(null);
  const [newName, setNewName] = useState("");
  const mapName = (id) => maps.find((m) => m.id === id)?.name || id;

  const favLineups = lineups.filter((l) => favs.includes(l.id));
  const learnedLineups = lineups.filter((l) => learned.includes(l.id));

  const card = (l, i) => (
    <LineupCard key={l.id} lineup={l} index={i} mapName={mapName(l.map)}
      fav={favs.includes(l.id)} onToggleFav={() => toggleFav(l.id)} learned={learned.includes(l.id)}
      onClick={() => onOpenLineup(l)} />
  );

  const tabs = [
    { id: "favs", label: "Favourites", icon: Star, n: favLineups.length },
    { id: "learned", label: "Learned", icon: CheckCircle2, n: learnedLineups.length },
    { id: "collections", label: "Collections", icon: Folder, n: collections.length },
  ];

  return (
    <div className="ub-overlay" onClick={onClose}>
      <div className="ub-modal ub-library" onClick={(e) => e.stopPropagation()}>
        <button className="ub-close" onClick={onClose}><X size={18} /></button>
        <div className="ub-lib-tabs">
          {tabs.map((t) => (
            <button key={t.id} className={view === t.id ? "on" : ""} onClick={() => { setView(t.id); setActiveCol(null); }}>
              <t.icon size={15} /> {t.label} <span className="ub-lib-count">{t.n}</span>
            </button>
          ))}
        </div>

        <div className="ub-lib-body">
          {view === "favs" && (
            favLineups.length ? <div className="ub-grid">{favLineups.map(card)}</div>
              : <div className="ub-lib-empty"><Star size={26} /><p>No favourites yet. Tap the star on any lineup to save it here.</p></div>
          )}

          {view === "learned" && (
            <>
              <div className="ub-lib-progress">
                {maps.filter((m) => lineups.some((l) => l.map === m.id)).map((m) => {
                  const tot = lineups.filter((l) => l.map === m.id).length;
                  const done = lineups.filter((l) => l.map === m.id && learned.includes(l.id)).length;
                  return (
                    <div key={m.id} className="ub-lib-prow">
                      <span className="ub-lib-pname">{m.name}</span>
                      <span className="ub-legend-prog"><span style={{ width: `${Math.round((done / tot) * 100)}%` }} /></span>
                      <span className="ub-lib-pnum">{done}/{tot}</span>
                    </div>
                  );
                })}
              </div>
              {learnedLineups.length ? <div className="ub-grid">{learnedLineups.map(card)}</div>
                : <div className="ub-lib-empty"><CheckCircle2 size={26} /><p>Nothing marked as learned yet.</p></div>}
            </>
          )}

          {view === "collections" && !activeCol && (
            <>
              <div className="ub-newcol">
                <input placeholder="New collection name…" value={newName} onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { createCollection(newName.trim()); setNewName(""); } }} />
                <button className="ub-btn-ghost" disabled={!newName.trim()} onClick={() => { createCollection(newName.trim()); setNewName(""); }}>
                  <FolderPlus size={15} /> Create
                </button>
              </div>
              {collections.length ? (
                <div className="ub-collist">
                  {collections.map((c) => (
                    <div key={c.id} className="ub-colrow">
                      <button className="ub-colopen" onClick={() => setActiveCol(c.id)}><Folder size={16} /> {c.name} <span className="ub-lib-count">{c.items.length}</span></button>
                      <button className="ub-icobtn" title="Rename" onClick={() => { const n = window.prompt("Rename collection:", c.name); if (n && n.trim()) renameCollection(c.id, n.trim()); }}><Pencil size={14} /></button>
                      <button className="ub-icobtn danger" title="Delete" onClick={() => { if (window.confirm(`Delete "${c.name}"?`)) deleteCollection(c.id); }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              ) : <div className="ub-lib-empty"><Folder size={26} /><p>No collections yet. Create one above, then add lineups to it from any lineup.</p></div>}
            </>
          )}

          {view === "collections" && activeCol && (() => {
            const col = collections.find((c) => c.id === activeCol);
            if (!col) return null;
            const items = lineups.filter((l) => col.items.includes(l.id));
            return (
              <>
                <button className="ub-back" onClick={() => setActiveCol(null)}><ChevronLeft size={15} /> All collections</button>
                <h3 className="ub-lib-colname">{col.name}</h3>
                {items.length ? <div className="ub-grid">{items.map(card)}</div>
                  : <div className="ub-lib-empty"><Folder size={26} /><p>This collection is empty. Open a lineup and use “Save to collection”.</p></div>}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
