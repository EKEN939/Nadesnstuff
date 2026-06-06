"use client";
import { useState } from "react";
import { X, Star, CheckCircle2, FolderPlus, Folder, Trash2, ChevronLeft, Pencil, Link2, Check, ListOrdered, Play, ArrowUp, ArrowDown } from "lucide-react";
import LineupCard from "./LineupCard";

export default function LibraryPanel({
  view, setView, onClose, lineups, favs, learned, collections, maps,
  onOpenLineup, toggleFav, createCollection, renameCollection, deleteCollection,
  executes = [], createExecute, renameExecute, deleteExecute, addToExecute, moveInExecute,
  shared, onSaveShared,
}) {
  const [activeCol, setActiveCol] = useState(null);
  const [activeExec, setActiveExec] = useState(null);
  const [newName, setNewName] = useState("");
  const [newExecName, setNewExecName] = useState("");
  const [newExecMap, setNewExecMap] = useState("");
  const [shareCopied, setShareCopied] = useState("");
  const mapName = (id) => maps.find((m) => m.id === id)?.name || id;
  function shareCol(col) {
    try {
      const code = btoa(encodeURIComponent(JSON.stringify({ n: col.name, i: col.items })));
      const url = `${window.location.origin}${window.location.pathname}?c=${encodeURIComponent(code)}`;
      navigator.clipboard?.writeText(url).then(() => { setShareCopied(col.id); setTimeout(() => setShareCopied(""), 1800); }).catch(() => {});
    } catch {}
  }
  const sharedItems = shared ? lineups.filter((l) => shared.items.map(String).includes(String(l.id))) : [];

  const favLineups = lineups.filter((l) => favs.includes(l.id));
  const learnedLineups = lineups.filter((l) => learned.includes(l.id));

  const card = (ctx) => (l, i) => (
    <LineupCard key={l.id} lineup={l} index={i} mapName={mapName(l.map)}
      fav={favs.includes(l.id)} onToggleFav={() => toggleFav(l.id)} learned={learned.includes(l.id)}
      onClick={() => onOpenLineup(l, ctx)} />
  );

  const tabs = [
    { id: "favs", label: "Favourites", icon: Star, n: favLineups.length },
    { id: "learned", label: "Learned", icon: CheckCircle2, n: learnedLineups.length },
    { id: "collections", label: "Collections", icon: Folder, n: collections.length },
    { id: "executes", label: "Executes", icon: ListOrdered, n: executes.length },
  ];
  const mapsWithLineups = maps.filter((m) => lineups.some((l) => l.map === m.id));

  return (
    <div className="ub-overlay" onClick={onClose}>
      <div className="ub-modal ub-library" onClick={(e) => e.stopPropagation()}>
        <button className="ub-close" onClick={onClose}><X size={18} /></button>
        <div className="ub-lib-tabs">
          {tabs.map((t) => (
            <button key={t.id} className={view === t.id ? "on" : ""} onClick={() => { setView(t.id); setActiveCol(null); setActiveExec(null); }}>
              <t.icon size={15} /> {t.label} <span className="ub-lib-count">{t.n}</span>
            </button>
          ))}
        </div>

        <div className="ub-lib-body">
          {view === "shared" && shared && (
            <>
              <div className="ub-shared-head">
                <div>
                  <div className="ub-pm-sub">Shared collection</div>
                  <h3 className="ub-lib-colname">{shared.name}</h3>
                </div>
                <button className="ub-btn-primary" onClick={() => onSaveShared?.()}><FolderPlus size={15} /> Save to my collections</button>
              </div>
              {sharedItems.length ? <div className="ub-grid">{sharedItems.map(card({ name: shared.name, ids: sharedItems.map((l) => l.id) }))}</div>
                : <div className="ub-lib-empty"><Folder size={26} /><p>None of these lineups are available right now.</p></div>}
            </>
          )}
          {view === "favs" && (
            favLineups.length ? <div className="ub-grid">{favLineups.map(card({ name: "Favourites", ids: favLineups.map((l) => l.id) }))}</div>
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
              {learnedLineups.length ? <div className="ub-grid">{learnedLineups.map(card({ name: "Learned", ids: learnedLineups.map((l) => l.id) }))}</div>
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
            const ids = col.items.map(String);
            const items = lineups.filter((l) => ids.includes(String(l.id)));
            return (
              <>
                <div className="ub-colhead">
                  <button className="ub-back" onClick={() => setActiveCol(null)}><ChevronLeft size={15} /> All collections</button>
                  <button className="ub-btn-ghost" onClick={() => shareCol(col)}>
                    {shareCopied === col.id ? <><Check size={14} /> Link copied</> : <><Link2 size={14} /> Share</>}
                  </button>
                </div>
                <h3 className="ub-lib-colname">{col.name}</h3>
                {items.length ? <div className="ub-grid">{items.map(card({ name: col.name, ids: items.map((l) => l.id) }))}</div>
                  : <div className="ub-lib-empty"><Folder size={26} /><p>This collection is empty. Open a lineup and use “Save to collection”.</p></div>}
              </>
            );
          })()}
          {view === "executes" && !activeExec && (
            <>
              <div className="ub-newcol">
                <input placeholder="New execute name…" value={newExecName} onChange={(e) => setNewExecName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newExecName.trim()) { createExecute(newExecName.trim(), newExecMap || mapsWithLineups[0]?.id); setNewExecName(""); } }} />
                <select className="ub-select" value={newExecMap || mapsWithLineups[0]?.id || ""} onChange={(e) => setNewExecMap(e.target.value)}>
                  {mapsWithLineups.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button className="ub-btn-ghost" disabled={!newExecName.trim() || !mapsWithLineups.length} onClick={() => { createExecute(newExecName.trim(), newExecMap || mapsWithLineups[0]?.id); setNewExecName(""); }}>
                  <ListOrdered size={15} /> Create
                </button>
              </div>
              {executes.length ? (
                <div className="ub-collist">
                  {executes.map((ex) => (
                    <div key={ex.id} className="ub-colrow">
                      <button className="ub-colopen" onClick={() => setActiveExec(ex.id)}><ListOrdered size={16} /> {ex.name} <span className="ub-exec-map">{mapName(ex.map)}</span> <span className="ub-lib-count">{ex.items.length}</span></button>
                      <button className="ub-icobtn" title="Rename" onClick={() => { const n = window.prompt("Rename execute:", ex.name); if (n && n.trim()) renameExecute(ex.id, n.trim()); }}><Pencil size={14} /></button>
                      <button className="ub-icobtn danger" title="Delete" onClick={() => { if (window.confirm(`Delete "${ex.name}"?`)) deleteExecute(ex.id); }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              ) : <div className="ub-lib-empty"><ListOrdered size={26} /><p>No executes yet. Create one above, then add lineups in order from any lineup’s “Add to execute”.</p></div>}
            </>
          )}

          {view === "executes" && activeExec && (() => {
            const ex = executes.find((e) => e.id === activeExec);
            if (!ex) return null;
            const items = ex.items.map((id) => lineups.find((l) => String(l.id) === String(id))).filter(Boolean);
            return (
              <>
                <div className="ub-colhead">
                  <button className="ub-back" onClick={() => setActiveExec(null)}><ChevronLeft size={15} /> All executes</button>
                  {items.length > 0 && (
                    <button className="ub-btn-primary" onClick={() => onOpenLineup(items[0], { name: ex.name, ids: ex.items })}><Play size={14} /> Play execute</button>
                  )}
                </div>
                <h3 className="ub-lib-colname">{ex.name} <span className="ub-exec-map">{mapName(ex.map)}</span></h3>
                {items.length ? (
                  <div className="ub-execlist">
                    {items.map((l, i) => (
                      <div key={l.id} className="ub-execstep">
                        <span className="ub-execstep-n">{i + 1}</span>
                        <button className="ub-execstep-main" onClick={() => onOpenLineup(l, { name: ex.name, ids: ex.items })}>
                          <strong>{l.target}</strong><small>{l.from} · {l.throwType}</small>
                        </button>
                        <div className="ub-execstep-ord">
                          <button className="ub-icobtn" title="Move up" disabled={i === 0} onClick={() => moveInExecute(ex.id, i, -1)}><ArrowUp size={14} /></button>
                          <button className="ub-icobtn" title="Move down" disabled={i === items.length - 1} onClick={() => moveInExecute(ex.id, i, 1)}><ArrowDown size={14} /></button>
                          <button className="ub-icobtn danger" title="Remove" onClick={() => addToExecute(l.id, ex.id)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="ub-lib-empty"><ListOrdered size={26} /><p>This execute is empty. Open a lineup on {mapName(ex.map)} and use “Add to execute”.</p></div>}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
