"use client";
import { useState } from "react";
import { X, Star, CheckCircle2, FolderPlus, Folder, Trash2, ChevronLeft, Pencil, Link2, Check, ArrowUp, ArrowDown } from "lucide-react";
import LineupCard from "./LineupCard";

export default function LibraryPanel({
  view, setView, onClose, lineups, favs, learned, collections, maps, loggedIn,
  onOpenLineup, toggleFav, createCollection, renameCollection, deleteCollection,
  toggleInCollection, moveInCollection,
  shared, onSaveShared,
}) {
  const [activeCol, setActiveCol] = useState(null);
  const [newName, setNewName] = useState("");
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
      fav={favs.includes(l.id)} onToggleFav={() => toggleFav(l.id)} learned={learned.includes(l.id)} loggedIn={loggedIn}
      onClick={() => onOpenLineup(l, ctx)} />
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
          {view === "shared" && shared && (
            <>
              <div className="ub-shared-head">
                <div>
                  <div className="ub-pm-sub">Shared collection</div>
                  <h3 className="ub-lib-colname">{shared.name}</h3>
                </div>
                {loggedIn
                  ? <button className="ub-btn-primary" onClick={() => onSaveShared?.()}><FolderPlus size={15} /> Save to my collections</button>
                  : <span className="ub-shared-loginhint">Log in with Discord to save this to your collections.</span>}
              </div>
              {sharedItems.length ? <div className="ub-grid">{sharedItems.map(card({ name: shared.name, ids: sharedItems.map((l) => l.id) }))}</div>
                : <div className="ub-lib-empty"><Folder size={26} /><p>None of these lineups are available right now.</p></div>}
            </>
          )}
          {view === "favs" && (
            <>
              <div className="ub-lib-intro"><Star size={14} /> <span><strong>Quick saves.</strong> One tap on a lineup’s star drops it here — no naming, no sorting. For organising into named, shareable sets, use Collections.</span></div>
              {favLineups.length ? <div className="ub-grid">{favLineups.map(card({ name: "Favourites", ids: favLineups.map((l) => l.id) }))}</div>
                : <div className="ub-lib-empty"><Star size={26} /><p>No favourites yet. Tap the star on any lineup to save it here.</p></div>}
            </>
          )}

          {view === "learned" && (
            <>
              <div className="ub-lib-intro"><CheckCircle2 size={14} /> <span><strong>Your progress.</strong> Mark lineups you’ve nailed — this fills the mastery rings on the home page. It’s not a save list; use Favourites or Collections for that.</span></div>
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
              <div className="ub-lib-intro"><Folder size={14} /> <span><strong>Organised sets.</strong> Build named groups (e.g. “Mirage A Smokes”), set the order, and share them with a link. For a quick one-off save, just star it in Favourites.</span></div>
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
            const items = col.items.map((id) => lineups.find((l) => String(l.id) === String(id))).filter(Boolean);
            return (
              <>
                <div className="ub-colhead">
                  <button className="ub-back" onClick={() => setActiveCol(null)}><ChevronLeft size={15} /> All collections</button>
                  <button className="ub-btn-ghost" onClick={() => shareCol(col)}>
                    {shareCopied === col.id ? <><Check size={14} /> Link copied</> : <><Link2 size={14} /> Share</>}
                  </button>
                </div>
                <h3 className="ub-lib-colname">{col.name}</h3>
                {items.length > 1 && <div className="ub-colhint">Use the arrows to set the order — that’s how they play with ‹ / › and arrow keys.</div>}
                {items.length ? (
                  <div className="ub-grid">
                    {items.map((l, i) => (
                      <div key={l.id} className="ub-colitem">
                        <LineupCard lineup={l} index={i} mapName={mapName(l.map)} fav={favs.includes(l.id)} onToggleFav={() => toggleFav(l.id)} learned={learned.includes(l.id)} loggedIn={loggedIn} onClick={() => onOpenLineup(l, { name: col.name, ids: col.items })} />
                        <div className="ub-colitem-ctl">
                          <button className="ub-icobtn" title="Move up" disabled={i === 0} onClick={(e) => { e.stopPropagation(); moveInCollection(col.id, l.id, -1); }}><ArrowUp size={13} /></button>
                          <button className="ub-icobtn" title="Move down" disabled={i === items.length - 1} onClick={(e) => { e.stopPropagation(); moveInCollection(col.id, l.id, 1); }}><ArrowDown size={13} /></button>
                          <button className="ub-icobtn danger" title="Remove from collection" onClick={(e) => { e.stopPropagation(); toggleInCollection(l.id, col.id); }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="ub-lib-empty"><Folder size={26} /><p>This collection is empty. Open a lineup and use “Save to collection”.</p></div>}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
