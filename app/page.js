"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Filter, Plus, Map as MapIcon, List, Download, Save, ArrowLeft, Video } from "lucide-react";
import { MAPS } from "@/data/maps";
import { LINEUPS } from "@/data/lineups";
import { TYPE_META } from "@/lib/constants";
import Logo from "@/components/Logo";
import NadeIcon from "@/components/NadeIcon";
import Landing from "@/components/Landing";
import TacticalMap from "@/components/TacticalMap";
import LineupCard from "@/components/LineupCard";
import LineupModal from "@/components/LineupModal";
import AddLineupForm from "@/components/AddLineupForm";
import ExportModal from "@/components/ExportModal";

const ADMIN_KEY = "admin";
const ACTIVE_MAPS = MAPS.filter((m) => !m.comingSoon);

export default function Page() {
  const [lineups, setLineups] = useState(LINEUPS);
  const [screen, setScreen] = useState("landing"); // "landing" | "map"
  const [transitioning, setTransitioning] = useState(false);
  const [activeMap, setActiveMap] = useState(ACTIVE_MAPS[0].id);
  const [view, setView] = useState("map");
  const [side, setSide] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [activeSpot, setActiveSpot] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [liveConfigured, setLiveConfigured] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const stageRef = useRef(null);
  const deepRef = useRef(undefined);
  if (deepRef.current === undefined) {
    deepRef.current = null;
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const m = p.get("map");
      const l = parseInt(p.get("lineup"), 10);
      if (m && ACTIVE_MAPS.some((x) => x.id === m)) deepRef.current = { map: m, lineup: Number.isNaN(l) ? null : l };
    }
  }

  const filtered = useMemo(
    () =>
      lineups.filter((l) => {
        if (l.map !== activeMap) return false;
        if (side !== "ALL" && l.side !== side) return false;
        if (type !== "ALL" && l.type !== type) return false;
        return true;
      }),
    [lineups, activeMap, side, type]
  );

  // group lineups by landing spot (target); the pin sits on the landing point
  const spots = useMemo(() => {
    const m = new Map();
    filtered.forEach((l) => {
      if (!m.has(l.target)) m.set(l.target, { target: l.target, x: l.x, y: l.y, lineups: [] });
      m.get(l.target).lineups.push(l);
    });
    return [...m.values()];
  }, [filtered]);

  useEffect(() => { setActiveSpot(null); }, [activeMap, side, type, screen]);

  const formMapId = editing ? editing.map : activeMap;
  const formSpots = useMemo(() => {
    const m = new Map();
    lineups.filter((l) => l.map === formMapId).forEach((l) => { if (!m.has(l.target)) m.set(l.target, { target: l.target, x: l.x, y: l.y }); });
    return [...m.values()];
  }, [lineups, formMapId]);

  // animate the content stage whenever the screen changes (zoom in/out)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    animate(stage, {
      opacity: [0, 1],
      scale: [screen === "map" ? 1.06 : 0.98, 1],
      duration: 380,
      ease: "out(3)",
      onComplete: () => setTransitioning(false),
    });
  }, [screen]);

  function transitionTo(next, id, selectLineup) {
    if (transitioning) return;
    const stage = stageRef.current;
    const finish = () => { if (id) setActiveMap(id); window.scrollTo(0, 0); setScreen(next); if (selectLineup) setSelected(selectLineup); };
    if (!stage) { finish(); return; }
    setTransitioning(true);
    animate(stage, {
      opacity: [1, 0],
      scale: [1, next === "map" ? 1.08 : 0.96],
      duration: 260,
      ease: "in(2)",
      onComplete: finish,
    });
  }
  const openMap = (id) => transitionTo("map", id);
  const goLanding = () => { setSelected(null); transitionTo("landing"); };
  const openLineup = (l) => transitionTo("map", l.map, l);

  useEffect(() => {
    if (view !== "list" || screen !== "map") return;
    const cards = document.querySelectorAll(".ub-card");
    if (cards.length) animate(cards, { opacity: [0, 1], translateY: [10, 0], duration: 420, delay: stagger(45), ease: "outQuad" });
  }, [view, activeMap, side, type, screen]);

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

  // Esc: close modals, otherwise go back to the landing
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key !== "Escape") return;
      if (selected) return setSelected(null);
      if (adding || editing) { setAdding(false); setEditing(null); return; }
      if (showExport) return setShowExport(false);
      if (screen !== "landing") goLanding();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [selected, adding, editing, showExport, screen, transitioning]);

  useEffect(() => {
    try { const t = localStorage.getItem("nns_admin_token"); if (t) setAdminToken(t); } catch {}
    fetch("/api/lineups")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.lineups) ? d.lineups : LINEUPS;
        setLineups(list); setLiveConfigured(!!d.configured);
        const dp = deepRef.current;
        if (dp && dp.map) {
          setActiveMap(dp.map); setScreen("map");
          if (dp.lineup != null) {
            const l = list.find((x) => x.id === dp.lineup && x.map === dp.map);
            if (l) setSelected(l);
          }
        }
      })
      .catch(() => {});
  }, []);

  // keep the URL in sync so links are shareable
  useEffect(() => {
    if (typeof window === "undefined") return;
    let url = window.location.pathname;
    if (screen === "map") url += "?map=" + activeMap + (selected ? "&lineup=" + selected.id : "");
    window.history.replaceState(null, "", url);
  }, [screen, activeMap, selected]);

  const mapMeta = ACTIVE_MAPS.find((m) => m.id === activeMap) || ACTIVE_MAPS[0];

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
      if (res.status === 401) { setSaveMsg("Wrong token"); setAdminToken(""); try { localStorage.removeItem("nns_admin_token"); } catch {} }
      else if (!res.ok) { setSaveMsg("Could not save"); }
      else { setSaveMsg("Saved ✓"); }
    } catch { setSaveMsg("Network error"); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000); }
  }

  return (
    <div className="ub-wrap">
      <header className="ub-header">
        <button className="ub-logobtn" onClick={() => screen !== "landing" && goLanding()} aria-label="Home">
          <Logo variant="compact" />
        </button>
        <div className="ub-headbtns">
          {admin && <span className="ub-adminflag">admin</span>}
          {admin && saveMsg && <span className="ub-savemsg">{saveMsg}</span>}
          {admin && liveConfigured && (
            <button className="ub-toolbtn" onClick={saveLive} disabled={saving}>
              <Save size={15} /> {saving ? "Saving…" : "Save live"}
            </button>
          )}
          {admin && screen === "map" && (
            <button className="ub-toolbtn" onClick={() => setShowExport(true)} title="Export all lineups to data/lineups.js">
              <Download size={15} /> Export
            </button>
          )}
          {admin && screen === "map" && (
            <button className="ub-addbtn" onClick={() => setAdding(true)}><Plus size={15} /> Add lineup</button>
          )}
        </div>
      </header>

      <div className="nns-stage" ref={stageRef}>
        {screen === "landing" ? (
          <Landing maps={MAPS} lineups={lineups} onPick={openMap} onOpenLineup={openLineup} />
        ) : (
          <>
            <button className="ub-back" onClick={goLanding}><ArrowLeft size={15} /> All maps</button>

            <div className="ub-hero">
              <div className="ub-hero-left">
                <div className="ub-hero-kicker">Active map</div>
                <h1 className="ub-hero-title">{mapMeta.name}</h1>
              </div>
              <div className="ub-hero-count">
                <span className="ub-count-num">{filtered.length}</span>
                <span className="ub-count-label">lineups</span>
              </div>
            </div>

            {ACTIVE_MAPS.length > 1 && (
              <div className="ub-maprail">
                {ACTIVE_MAPS.map((m) => {
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
            </div>

            {view === "map" ? (
              <div className="ub-mapview">
                <TacticalMap map={mapMeta} spots={spots} activeSpot={activeSpot}
                  onSelectSpot={setActiveSpot} onPin={setSelected} zoomable />
                <div className="ub-maplegend">
                  {activeSpot ? (
                    <div className="ub-spotpanel">
                      <button className="ub-spotback" onClick={() => setActiveSpot(null)}><ArrowLeft size={14} /> All spots</button>
                      <div className="ub-spot-h">{activeSpot}</div>
                      <div className="ub-spot-sub">{(spots.find((s) => s.target === activeSpot)?.lineups.length) || 0} lineups · pick where you throw from</div>
                      <div className="ub-spot-list">
                        {(spots.find((s) => s.target === activeSpot)?.lineups || []).map((l) => (
                          <button key={l.id} className="ub-spot-variant" onClick={() => setSelected(l)}>
                            <span className="ub-spot-vicon" style={{ color: TYPE_META[l.type].color }}><NadeIcon type={l.type} size={15} /></span>
                            <span className="ub-spot-vtext"><strong>{l.spawn || l.from}</strong><small>{l.throwType} · {l.difficulty}</small></span>
                            {l.video && <Video size={13} className="ub-spot-vvid" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="ub-legend-title">{spots.length} spots · {filtered.length} lineups</div>
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
                      <div className="ub-legend-hint">Spots with a number hold several lineups — click to see all throws.</div>
                      {admin && <div className="ub-legend-admin">Admin on · click a pin to edit or delete.</div>}
                    </>
                  )}
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
          </>
        )}
      </div>

      {selected && <LineupModal lineup={selected} onClose={() => setSelected(null)} admin={admin} onEdit={startEdit} onDelete={removeLineup} />}
      {(adding || editing) && (
        <AddLineupForm
          map={editing ? (ACTIVE_MAPS.find((m) => m.id === editing.map) || mapMeta) : mapMeta}
          initial={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSave={saveLineup}
          token={adminToken}
          existingSpots={formSpots}
        />
      )}
      {showExport && <ExportModal lineups={lineups} onClose={() => setShowExport(false)} />}
    </div>
  );
}
