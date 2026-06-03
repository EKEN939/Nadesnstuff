"use client";
import { useState, useMemo, useEffect } from "react";
import { animate, stagger } from "animejs";
import { Filter, Search, Plus, Map as MapIcon, List, Download, Save } from "lucide-react";
import { MAPS } from "@/data/maps";
import { LINEUPS } from "@/data/lineups";
import { TYPE_META } from "@/lib/constants";
import Logo from "@/components/Logo";
import NadeIcon from "@/components/NadeIcon";
import TacticalMap from "@/components/TacticalMap";
import LineupCard from "@/components/LineupCard";
import LineupModal from "@/components/LineupModal";
import AddLineupForm from "@/components/AddLineupForm";
import ExportModal from "@/components/ExportModal";

// Secret keyboard shortcut: type this word (when not in a field) to unlock editing.
const ADMIN_KEY = "admin";

export default function Page() {
  const [lineups, setLineups] = useState(LINEUPS);
  const [activeMap, setActiveMap] = useState(MAPS[0].id);
  const [view, setView] = useState("map");
  const [side, setSide] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [liveConfigured, setLiveConfigured] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const filtered = useMemo(
    () =>
      lineups.filter((l) => {
        if (l.map !== activeMap) return false;
        if (side !== "ALL" && l.side !== side) return false;
        if (type !== "ALL" && l.type !== type) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          if (!l.target.toLowerCase().includes(q) && !l.from.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [lineups, activeMap, side, type, query]
  );

  useEffect(() => {
    if (view !== "list") return;
    const cards = document.querySelectorAll(".ub-card");
    if (cards.length) animate(cards, { opacity: [0, 1], translateY: [10, 0], duration: 420, delay: stagger(45), ease: "outQuad" });
  }, [view, activeMap, side, type, query]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#" + ADMIN_KEY) setAdmin(true);
    let buf = "";
    let timer;
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-ADMIN_KEY.length);
      clearTimeout(timer);
      timer = setTimeout(() => { buf = ""; }, 1200);
      if (buf === ADMIN_KEY) { setAdmin((a) => !a); buf = ""; }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    try { const t = localStorage.getItem("nns_admin_token"); if (t) setAdminToken(t); } catch {}
    fetch("/api/lineups")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.lineups)) setLineups(d.lineups); setLiveConfigured(!!d.configured); })
      .catch(() => {});
  }, []);

  const mapMeta = MAPS.find((m) => m.id === activeMap);

  function saveLineup(data, id) {
    if (id != null) {
      setLineups((prev) => prev.map((l) => (l.id === id ? { ...data, id, map: l.map } : l)));
      setEditing(null);
    } else {
      const newId = Math.max(0, ...lineups.map((l) => l.id)) + 1;
      setLineups((prev) => [...prev, { ...data, id: newId, map: activeMap }]);
    }
  }
  function removeLineup(id) { setLineups((prev) => prev.filter((l) => l.id !== id)); setSelected(null); }
  function startEdit(lineup) { setSelected(null); setEditing(lineup); }

  async function saveLive() {
    let token = adminToken;
    if (!token) {
      token = (typeof window !== "undefined" && window.prompt("Admin token (same as ADMIN_TOKEN in Vercel):")) || "";
      if (!token) return;
      setAdminToken(token);
      try { localStorage.setItem("nns_admin_token", token); } catch {}
    }
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch("/api/lineups", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ lineups }),
      });
      if (res.status === 401) {
        setSaveMsg("Wrong token"); setAdminToken("");
        try { localStorage.removeItem("nns_admin_token"); } catch {}
      } else if (!res.ok) { setSaveMsg("Could not save"); }
      else { setSaveMsg("Saved ✓"); }
    } catch { setSaveMsg("Network error"); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000); }
  }

  return (
    <div className="ub-wrap">
      <header className="ub-header">
        <Logo variant="compact" />
        <div className="ub-headbtns">
          {admin && <span className="ub-adminflag">admin</span>}
          {admin && saveMsg && <span className="ub-savemsg">{saveMsg}</span>}
          {admin && liveConfigured && (
            <button className="ub-toolbtn" onClick={saveLive} disabled={saving}>
              <Save size={15} /> {saving ? "Saving…" : "Save live"}
            </button>
          )}
          {admin && (
            <button className="ub-toolbtn" onClick={() => setShowExport(true)} title="Export all lineups to data/lineups.js">
              <Download size={15} /> Export
            </button>
          )}
          {admin && (
            <button className="ub-addbtn" onClick={() => setAdding(true)}><Plus size={15} /> Add lineup</button>
          )}
        </div>
      </header>

      <div className="ub-hero">
        <div className="ub-hero-left">
          <div className="ub-hero-kicker">Active map</div>
          <h1 className="ub-hero-title">{mapMeta.name}</h1>
          <p className="ub-hero-tag">Grenade lineups for Counter-Strike 2</p>
        </div>
        <div className="ub-hero-count">
          <span className="ub-count-num">{filtered.length}</span>
          <span className="ub-count-label">lineups</span>
        </div>
      </div>

      {MAPS.length > 1 && (
        <div className="ub-maprail">
          {MAPS.map((m) => {
            const count = lineups.filter((l) => l.map === m.id).length;
            return (
              <button key={m.id} className={`ub-mapcard ${activeMap === m.id ? "active" : ""}`} onClick={() => setActiveMap(m.id)}>
                <span className="ub-mapcard-name">{m.name}</span>
                <span className="ub-mapcard-count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="ub-controls">
        <div className="ub-filtergroup">
          <Filter size={14} className="ub-filter-icon" />
          {["ALL", "T", "CT"].map((s) => (
            <button key={s} className={`ub-pill ${side === s ? "active" : ""}`} onClick={() => setSide(s)}>{s === "ALL" ? "All sides" : s}</button>
          ))}
        </div>
        <div className="ub-filtergroup">
          <button className={`ub-pill ${type === "ALL" ? "active" : ""}`} onClick={() => setType("ALL")}>All types</button>
          {Object.entries(TYPE_META).map(([key, t]) => (
            <button key={key} className={`ub-pill ub-pill-type ${type === key ? "active" : ""}`} onClick={() => setType(key)} style={type === key ? { borderColor: t.color, color: t.color } : undefined}>
              <NadeIcon type={key} size={14} />{t.label}
            </button>
          ))}
        </div>
        <div className="ub-viewtoggle">
          <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><MapIcon size={14} /> Map</button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><List size={14} /> List</button>
        </div>
        <div className="ub-search">
          <Search size={14} />
          <input placeholder="Search position…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {view === "map" ? (
        <div className="ub-mapview">
          <TacticalMap map={mapMeta} lineups={filtered} onPin={setSelected} zoomable />
          <div className="ub-maplegend">
            <div className="ub-legend-title">{filtered.length} pins · click for lineup</div>
            {Object.entries(TYPE_META).map(([key, t]) => {
              const n = filtered.filter((l) => l.type === key).length;
              return (
                <div key={key} className="ub-legend-row" style={{ opacity: n ? 1 : 0.35 }}>
                  <span className="ub-legend-dot" style={{ background: t.color }} />
                  <NadeIcon type={key} size={14} /> {t.label}
                  <span className="ub-legend-n">{n}</span>
                </div>
              );
            })}
            {admin && <div className="ub-legend-admin">Admin on · click a pin to edit or delete.</div>}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ub-empty">
          <MapIcon size={28} />
          <p>No lineups here yet.</p>
          {admin && <span>Click "Add lineup" to create one on {mapMeta.name}.</span>}
        </div>
      ) : (
        <div className="ub-grid">
          {filtered.map((l, i) => <LineupCard key={l.id} lineup={l} index={i} onClick={() => setSelected(l)} />)}
        </div>
      )}

      {selected && <LineupModal lineup={selected} onClose={() => setSelected(null)} admin={admin} onEdit={startEdit} onDelete={removeLineup} />}
      {(adding || editing) && (
        <AddLineupForm
          map={editing ? MAPS.find((m) => m.id === editing.map) : mapMeta}
          initial={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSave={saveLineup}
        />
      )}
      {showExport && <ExportModal lineups={lineups} onClose={() => setShowExport(false)} />}
    </div>
  );
}
