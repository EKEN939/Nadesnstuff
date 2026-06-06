"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Filter, Plus, Map as MapIcon, List, Save, ArrowLeft, Video, Star, LogIn, LogOut, ChevronDown, Folder, CheckCircle2, Tag, Trophy } from "lucide-react";
import { confetti } from "@/lib/confetti";
import { useSession, signIn, signOut } from "next-auth/react";
import { MAPS } from "@/data/maps";
import { LINEUPS } from "@/data/lineups";
import { TYPE_META } from "@/lib/constants";
import Logo from "@/components/Logo";
import NadeIcon from "@/components/NadeIcon";
import Landing from "@/components/Landing";
import TacticalMap from "@/components/TacticalMap";
import LineupCard from "@/components/LineupCard";
import LineupModal from "@/components/LineupModal";
import LineupDetail from "@/components/LineupDetail";
import LibraryPanel from "@/components/LibraryPanel";
import AddLineupForm from "@/components/AddLineupForm";

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
  const [queue, setQueue] = useState(null);
  const [queueName, setQueueName] = useState(null);
  const [favs, setFavs] = useState([]);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [learned, setLearned] = useState([]);
  const [throwFilter, setThrowFilter] = useState("ALL");
  const [videoOnly, setVideoOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [showLabels, setShowLabels] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [toast, setToast] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [libraryView, setLibraryView] = useState(null);
  const [sharedCol, setSharedCol] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [liveConfigured, setLiveConfigured] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const { data: session } = useSession();
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

  const filtered = useMemo(() => {
    let list = lineups.filter((l) => {
      if (l.map !== activeMap) return false;
      if (side !== "ALL" && l.side !== side) return false;
      if (type !== "ALL" && l.type !== type) return false;
      if (onlyFavs && !favs.includes(l.id)) return false;
      if (throwFilter !== "ALL" && l.throwType !== throwFilter) return false;
      if (videoOnly && !l.video) return false;
      return true;
    });
    if (sortBy === "difficulty") {
      const order = { Easy: 0, Medium: 1, Hard: 2 };
      list = [...list].sort((a, b) => (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9));
    }
    return list;
  }, [lineups, activeMap, side, type, onlyFavs, favs, throwFilter, videoOnly, sortBy]);

  // group lineups by landing spot (target); the pin sits on the landing point
  const spots = useMemo(() => {
    const m = new Map();
    filtered.forEach((l) => {
      if (!m.has(l.target)) m.set(l.target, { target: l.target, x: l.x, y: l.y, lineups: [] });
      m.get(l.target).lineups.push(l);
    });
    return [...m.values()];
  }, [filtered]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) { setFavs(d.favs || []); setLearned(d.learned || []); setCollections(d.collections || []); } }).catch(() => {});
    } else {
      try {
        setFavs(JSON.parse(localStorage.getItem("nns_favs") || "[]"));
        setLearned(JSON.parse(localStorage.getItem("nns_learned") || "[]"));
        setCollections(JSON.parse(localStorage.getItem("nns_collections") || "[]"));
      } catch {}
    }
  }, [session?.user?.id]);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("c");
      if (c) {
        const data = JSON.parse(decodeURIComponent(atob(c)));
        if (data && Array.isArray(data.i)) { setSharedCol({ name: data.n || "Shared collection", items: data.i }); setLibraryView("shared"); }
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch {}
  }, []);
  function saveUser(f, l, c) {
    if (session?.user) {
      fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favs: f, learned: l, collections: c }) }).catch(() => {});
    } else {
      try {
        localStorage.setItem("nns_favs", JSON.stringify(f));
        localStorage.setItem("nns_learned", JSON.stringify(l));
        localStorage.setItem("nns_collections", JSON.stringify(c));
      } catch {}
    }
  }
  function showToast(msg) { setToast(msg); clearTimeout(showToast._t); showToast._t = setTimeout(() => setToast(null), 2800); }
  const toggleFav = (id) => { const nf = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]; setFavs(nf); saveUser(nf, learned, collections); };
  const toggleLearned = (id) => {
    const wasLearned = learned.includes(id);
    const nl = wasLearned ? learned.filter((x) => x !== id) : [...learned, id];
    setLearned(nl); saveUser(favs, nl, collections);
    if (!wasLearned) {
      confetti({ y: 0.42, count: 70 });
      const l = lineups.find((x) => x.id === id);
      if (l) {
        const mapLs = lineups.filter((x) => x.map === l.map);
        if (mapLs.length > 1 && mapLs.every((x) => nl.includes(x.id))) {
          const nm = MAPS.find((m) => m.id === l.map)?.name || l.map;
          setTimeout(() => confetti({ y: 0.35, count: 170, power: 1.35 }), 160);
          showToast(`${nm} mastered — every lineup learned!`);
        }
      }
    }
  };
  function createCollection(name, initialItem) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const nc = [...collections, { id, name: name || "Untitled", items: initialItem ? [initialItem] : [] }];
    setCollections(nc); saveUser(favs, learned, nc); return id;
  }
  const renameCollection = (id, name) => { const nc = collections.map((c) => (c.id === id ? { ...c, name } : c)); setCollections(nc); saveUser(favs, learned, nc); };
  const deleteCollection = (id) => { const nc = collections.filter((c) => c.id !== id); setCollections(nc); saveUser(favs, learned, nc); };
  const toggleInCollection = (lineupId, colId) => {
    const sid = String(lineupId);
    const nc = collections.map((c) => (c.id === colId ? { ...c, items: c.items.map(String).includes(sid) ? c.items.filter((x) => String(x) !== sid) : [...c.items, lineupId] } : c));
    setCollections(nc); saveUser(favs, learned, nc);
  };
  const moveInCollection = (colId, lineupId, dir) => {
    const sid = String(lineupId);
    const nc = collections.map((c) => {
      if (c.id !== colId) return c;
      const items = [...c.items]; const i = items.findIndex((x) => String(x) === sid); const ni = i + dir;
      if (i === -1 || ni < 0 || ni >= items.length) return c;
      [items[i], items[ni]] = [items[ni], items[i]];
      return { ...c, items };
    });
    setCollections(nc); saveUser(favs, learned, nc);
  };
  function addCollectionFull(name, items) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const nc = [...collections, { id, name: name || "Untitled", items: Array.isArray(items) ? items : [] }];
    setCollections(nc); saveUser(favs, learned, nc); return id;
  }
  function saveShared() {
    if (!sharedCol) return;
    addCollectionFull(sharedCol.name, sharedCol.items);
    setSharedCol(null); setLibraryView("collections");
  }
  useEffect(() => {
    if (!profileOpen) return;
    const onDoc = (e) => { if (!e.target.closest("[data-profile]")) setProfileOpen(false); };
    const onEsc = (e) => { if (e.key === "Escape") setProfileOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [profileOpen]);

  useEffect(() => { setActiveSpot(null); }, [activeMap, side, type, screen, throwFilter, videoOnly, onlyFavs, sortBy]);

  const formMapId = editing ? editing.map : activeMap;
  const formSpots = useMemo(() => {
    const m = new Map();
    lineups.filter((l) => l.map === formMapId).forEach((l) => {
      if (!m.has(l.target)) m.set(l.target, { target: l.target, x: l.x, y: l.y, count: 0 });
      m.get(l.target).count++;
    });
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

  function transitionTo(next, id, selectLineup) {    if (transitioning) return;
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
  const goLanding = () => { setSelected(null); setQueue(null); setQueueName(null); transitionTo("landing"); };
  const openLineup = (l) => { setQueue(null); setQueueName(null); transitionTo("map", l.map, l); };

  // pick a lineup with no sequence context (single pin, card, search result)
  function pickLineup(l) { setQueue(null); setQueueName(null); setSelected(l); }
  // open a lineup as part of a sequence (collection, spot, favourites…) so prev/next works
  function openWithQueue(l, ids, name) {
    const list = (ids || []).map(String);
    setQueue(list.length > 1 ? list : null);
    setQueueName(list.length > 1 ? (name || null) : null);
    setSelected(l);
  }
  function playQueue(dir) {
    if (!queue || !selected) return;
    const i = queue.findIndex((id) => String(id) === String(selected.id));
    const ni = i + dir;
    if (i === -1 || ni < 0 || ni >= queue.length) return;
    const l = lineups.find((x) => String(x.id) === String(queue[ni]));
    if (!l) return;
    if (l.map !== activeMap) setActiveMap(l.map);
    setActiveSpot(null);
    setSelected(l);
  }
  const queueIndex = queue && selected ? queue.findIndex((id) => String(id) === String(selected.id)) : -1;

  // on mobile, bring the detail panel into view when a lineup is opened
  useEffect(() => {
    if (!selected || typeof window === "undefined" || window.innerWidth > 640) return;
    const t = setTimeout(() => document.querySelector(".ub-maplegend.detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => clearTimeout(t);
  }, [selected]);

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
      if (screen !== "landing") goLanding();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [selected, adding, editing, screen, transitioning]);

  // R = random lineup, arrows = cycle through the current list while a lineup is open
  useEffect(() => {
    const onNav = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (screen !== "map" || adding || editing) return;
      if ((e.key === "r" || e.key === "R") && filtered.length) {
        pickLineup(filtered[Math.floor(Math.random() * filtered.length)]);
      } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && selected) {
        if (queue && queueIndex !== -1) { playQueue(e.key === "ArrowRight" ? 1 : -1); return; }
        const idx = filtered.findIndex((l) => l.id === selected.id);
        if (idx === -1) return;
        const ni = e.key === "ArrowRight" ? (idx + 1) % filtered.length : (idx - 1 + filtered.length) % filtered.length;
        setSelected(filtered[ni]);
      }
    };
    window.addEventListener("keydown", onNav);
    return () => window.removeEventListener("keydown", onNav);
  }, [screen, adding, editing, filtered, selected, queue, queueIndex, lineups, activeMap]);

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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // keep the URL in sync so links are shareable
  useEffect(() => {
    if (typeof window === "undefined") return;
    let url = window.location.pathname;
    if (screen === "map") url += "?map=" + activeMap + (selected ? "&lineup=" + selected.id : "");
    window.history.replaceState(null, "", url);
  }, [screen, activeMap, selected]);

  const mapMeta = ACTIVE_MAPS.find((m) => m.id === activeMap) || ACTIVE_MAPS[0];
  const throwTypes = useMemo(() => [...new Set(lineups.filter((l) => l.map === activeMap).map((l) => l.throwType))], [lineups, activeMap]);
  const mapAll = lineups.filter((l) => l.map === activeMap);
  const mapLearned = mapAll.filter((l) => learned.includes(l.id)).length;

  async function persist(list) {
    if (!liveConfigured) { setSaveMsg("Local only — storage not set up"); setTimeout(() => setSaveMsg(""), 3000); return; }
    const loggedIn = !!session?.user;
    let token = adminToken;
    if (!loggedIn && !token) {
      token = (typeof window !== "undefined" && window.prompt("Admin token (same as ADMIN_TOKEN in Vercel):")) || "";
      if (!token) { setSaveMsg("Not saved — token needed"); setTimeout(() => setSaveMsg(""), 3000); return; }
      setAdminToken(token);
      try { localStorage.setItem("nns_admin_token", token); } catch {}
    }
    setSaving(true); setSaveMsg("");
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = "Bearer " + token;
      const res = await fetch("/api/lineups", { method: "PUT", headers, body: JSON.stringify({ lineups: list }) });
      if (res.status === 401) {
        if (loggedIn) setSaveMsg("Not an admin account");
        else { setSaveMsg("Wrong token"); setAdminToken(""); try { localStorage.removeItem("nns_admin_token"); } catch {} }
      }
      else if (!res.ok) { setSaveMsg("Could not save"); }
      else { setSaveMsg("Saved ✓"); }
    } catch { setSaveMsg("Network error"); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000); }
  }
  const saveLive = () => persist(lineups);

  function saveLineup(data, id) {
    let next;
    if (id != null) { next = lineups.map((l) => (l.id === id ? { ...data, id, map: l.map } : l)); setEditing(null); }
    else { const newId = Math.max(0, ...lineups.map((l) => l.id)) + 1; next = [...lineups, { ...data, id: newId, map: activeMap }]; }
    setLineups(next);
    persist(next);
  }
  function removeLineup(id) { const next = lineups.filter((l) => l.id !== id); setLineups(next); setSelected(null); persist(next); }
  function startEdit(lineup) { setSelected(null); setEditing(lineup); }

  return (
    <div className="ub-wrap">
      {loading && <div className="ub-loadbar" aria-hidden="true" />}
      {toast && <div className="ub-toast"><Trophy size={16} /> {toast}</div>}
      <header className="ub-header">
        <button className="ub-logobtn" onClick={() => screen !== "landing" && goLanding()} aria-label="Home">
          <Logo variant="compact" />
        </button>
        <div className="ub-headbtns">
          {session?.user ? (
            <div className="ub-profilewrap" data-profile>
              <button className="ub-toolbtn ub-profilebtn" onClick={() => setProfileOpen((o) => !o)}>
                {session.user.image && <img src={session.user.image} alt="" className="ub-avatar" />}
                {(session.user.name || "Account").split("#")[0]}
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className="ub-profilemenu">
                  <div className="ub-pm-head">
                    {session.user.image && <img src={session.user.image} alt="" className="ub-avatar lg" />}
                    <div>
                      <div className="ub-pm-name">{(session.user.name || "Account").split("#")[0]}</div>
                      <div className="ub-pm-sub">{favs.length} favs · {learned.length} learned</div>
                    </div>
                  </div>
                  <button className="ub-pm-item" onClick={() => { setLibraryView("favs"); setProfileOpen(false); }}><Star size={15} /> Favourites</button>
                  <button className="ub-pm-item" onClick={() => { setLibraryView("learned"); setProfileOpen(false); }}><CheckCircle2 size={15} /> Learned</button>
                  <button className="ub-pm-item" onClick={() => { setLibraryView("collections"); setProfileOpen(false); }}><Folder size={15} /> Collections</button>
                  {admin && <div className="ub-pm-div" />}
                  {admin && <button className="ub-pm-item" onClick={() => { setAdding(true); setProfileOpen(false); }}><Plus size={15} /> Add lineup</button>}
                  <div className="ub-pm-div" />
                  <button className="ub-pm-item" onClick={() => signOut()}><LogOut size={15} /> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="ub-loginwrap">
              <button className="ub-toolbtn ub-discord" onClick={() => signIn("discord")}>
                <LogIn size={15} /> Login with Discord
              </button>
              <span className="ub-logininfo" role="tooltip">
                <strong>Sign-in is only for saving your stuff.</strong>
                Your favourites and learned lineups get saved to your profile and synced across devices. We only see your Discord name and avatar — we never post anything, and can't read your servers, messages or friends.
              </span>
            </div>
          )}
          {admin && <span className="ub-adminflag">admin</span>}
          {admin && saveMsg && <span className="ub-savemsg">{saveMsg}</span>}
          {admin && liveConfigured && (
            <button className="ub-toolbtn" onClick={saveLive} disabled={saving}>
              <Save size={15} /> {saving ? "Saving…" : "Save live"}
            </button>
          )}
          {admin && screen === "map" && (
            <button className="ub-addbtn" onClick={() => setAdding(true)}><Plus size={15} /> Add lineup</button>
          )}
        </div>
      </header>

      <div className="nns-stage" ref={stageRef}>
        {screen === "landing" ? (
          <Landing maps={MAPS} lineups={lineups} learned={learned} onPick={openMap} onOpenLineup={openLineup} />
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
              <div className="ub-filtergroup">
                <button className={`ub-pill ${onlyFavs ? "active" : ""}`} onClick={() => setOnlyFavs((v) => !v)}><Star size={13} /> Favorites</button>
              </div>
              <div className="ub-viewtoggle">
                <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><MapIcon size={14} /> Map</button>
                <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><List size={14} /> List</button>
              </div>
            </div>
            {throwTypes.length > 0 && (
              <div className="ub-controls ub-controls2">
                <select className="ub-select" value={throwFilter} onChange={(e) => setThrowFilter(e.target.value)}>
                  <option value="ALL">Any throw</option>
                  {throwTypes.map((tt) => <option key={tt} value={tt}>{tt}</option>)}
                </select>
                <button className={`ub-pill ${videoOnly ? "active" : ""}`} onClick={() => setVideoOnly((v) => !v)}><Video size={13} /> Video only</button>
                {view === "map" && <button className={`ub-pill ${showLabels ? "active" : ""}`} onClick={() => setShowLabels((v) => !v)}><Tag size={13} /> Labels</button>}
                <select className="ub-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Newest</option>
                  <option value="difficulty">By difficulty</option>
                </select>
              </div>
            )}

            {view === "map" ? (
              <div className="ub-mapview">
                <TacticalMap map={mapMeta} spots={spots} activeSpot={activeSpot}
                  onSelectSpot={setActiveSpot} onPin={pickLineup} selected={selected} showLabels={showLabels} zoomable />
                <div className={`ub-maplegend ${selected ? "detail" : ""}`}>
                  {selected ? (
                    <div className="ub-detailpanel" key={selected.id}>
                      <button className="ub-spotback" onClick={() => { setSelected(null); setQueue(null); setQueueName(null); }}><ArrowLeft size={14} /> {activeSpot ? "Back to spot" : "Back to map"}</button>
                      <LineupDetail lineup={selected} admin={admin} onEdit={startEdit} onDelete={removeLineup}
                        fav={favs.includes(selected.id)} onToggleFav={() => toggleFav(selected.id)}
                        learned={learned.includes(selected.id)} onToggleLearned={() => toggleLearned(selected.id)}
                        collections={collections} toggleInCollection={toggleInCollection} createCollection={createCollection}
                        queueName={queueName} queueIndex={queueIndex} queueTotal={queue ? queue.length : 0}
                        onQueuePrev={() => playQueue(-1)} onQueueNext={() => playQueue(1)} />
                    </div>
                  ) : activeSpot ? (
                    <div className="ub-spotpanel">
                      <button className="ub-spotback" onClick={() => setActiveSpot(null)}><ArrowLeft size={14} /> All spots</button>
                      <div className="ub-spot-h">{activeSpot}</div>
                      <div className="ub-spot-sub">{(spots.find((s) => s.target === activeSpot)?.lineups.length) || 0} lineups · pick where you throw from</div>
                      <div className="ub-spot-list">
                        {(() => {
                          const sl = spots.find((s) => s.target === activeSpot)?.lineups || [];
                          return sl.map((l) => (
                            <button key={l.id} className="ub-spot-variant" onClick={() => openWithQueue(l, sl.map((x) => x.id), activeSpot)}>
                              <span className="ub-spot-vicon" style={{ color: TYPE_META[l.type].color }}><NadeIcon type={l.type} size={15} /></span>
                              <span className="ub-spot-vtext"><strong>{l.spawn || l.from}</strong><small>{l.throwType} · {l.difficulty}</small></span>
                              {l.video && <Video size={13} className="ub-spot-vvid" />}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="ub-legend-empty">
                      <MapIcon size={26} />
                      <p>No lineups on {mapMeta.name} yet.</p>
                      {admin ? <span>Tap “Add lineup” to place the first one.</span> : <span>Check back soon, or try another map.</span>}
                    </div>
                  ) : (
                    <>
                      <div className="ub-legend-title">{spots.length} spots · {filtered.length} lineups</div>
                      {mapAll.length > 0 && <div className="ub-legend-prog"><span style={{ width: `${Math.round((mapLearned / mapAll.length) * 100)}%` }} /></div>}
                      {mapAll.length > 0 && <div className="ub-legend-progtext">{mapLearned}/{mapAll.length} learned</div>}
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
              <div className="ub-grid" key={`${side}-${type}-${throwFilter}-${videoOnly}-${sortBy}-${onlyFavs}`}>
                {filtered.map((l, i) => <LineupCard key={l.id} lineup={l} index={i} onClick={() => pickLineup(l)} fav={favs.includes(l.id)} onToggleFav={() => toggleFav(l.id)} learned={learned.includes(l.id)} onToggleLearned={() => toggleLearned(l.id)} />)}
              </div>
            )}
          </>
        )}
      </div>

      {selected && view === "list" && <LineupModal lineup={selected} onClose={() => setSelected(null)} admin={admin} onEdit={startEdit} onDelete={removeLineup} fav={favs.includes(selected.id)} onToggleFav={() => toggleFav(selected.id)} learned={learned.includes(selected.id)} onToggleLearned={() => toggleLearned(selected.id)} collections={collections} toggleInCollection={toggleInCollection} createCollection={createCollection} />}
      {libraryView && (
        <LibraryPanel
          view={libraryView} setView={setLibraryView} onClose={() => setLibraryView(null)}
          lineups={lineups} favs={favs} learned={learned} collections={collections} maps={MAPS}
          onOpenLineup={(l, ctx) => { setActiveMap(l.map); setScreen("map"); setView("map"); setActiveSpot(null); openWithQueue(l, ctx?.ids || [], ctx?.name); setLibraryView(null); }}
          toggleFav={toggleFav} createCollection={createCollection}
          renameCollection={renameCollection} deleteCollection={deleteCollection}
          toggleInCollection={toggleInCollection} moveInCollection={moveInCollection}
          shared={sharedCol} onSaveShared={saveShared}
        />
      )}
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
    </div>
  );
}
