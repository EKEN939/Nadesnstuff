"use client";
import { useState, useEffect, useMemo } from "react";
import { Lock, ArrowRight, Search, X } from "lucide-react";
import Logo from "./Logo";
import NadeIcon from "./NadeIcon";
import { TYPE_META } from "@/lib/constants";

function CountUp({ n }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start; const dur = 650;
    const step = (t) => { if (!start) start = t; const p = Math.min(1, (t - start) / dur); setV(Math.round(p * n)); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [n]);
  return <>{v}</>;
}

function MapThumb({ m }) {
  const [ok, setOk] = useState(true);
  const src = m.radar || "/radars/" + m.id + ".png";
  return ok ? <img src={src} alt={`${m.name} radar`} loading="lazy" decoding="async" onError={() => setOk(false)} /> : <div className="nl-thumbgrid" />;
}

export default function Landing({ maps, lineups, onPick, onOpenLineup }) {
  const [query, setQuery] = useState("");
  const total = lineups.length;
  const live = maps.filter((m) => !m.comingSoon).length;
  const recent = [...lineups].sort((a, b) => b.id - a.id).slice(0, 6);
  const mapName = (id) => maps.find((m) => m.id === id)?.name || id;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return lineups
      .filter((l) => [l.target, l.from, l.spawn, l.throwType, l.type, TYPE_META[l.type]?.label, mapName(l.map)]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q)))
      .slice(0, 14);
  }, [query, lineups]);

  return (
    <div className="nl-landing">
      <div className="nl-hero">
        <Logo variant="full" />
        <div className="nl-tally">
          {Object.entries(TYPE_META).map(([key, t]) => (
            <span key={key} className="nl-tallyitem" style={{ color: t.color }}>
              <NadeIcon type={key} size={15} />
              <CountUp n={lineups.filter((l) => l.type === key).length} />
            </span>
          ))}
          <span className="nl-tallydiv" />
          <span className="nl-tallytotal"><CountUp n={total} /> lineups · {live} map{live > 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="nl-pickbar">
        <div className="nl-pick">Choose a map</div>
        <div className="nl-search">
          <Search size={15} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lineups — spot, position, type…" aria-label="Search lineups" />
          {query && <button className="nl-searchclear" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
        </div>
      </div>

      {query.trim() ? (
        <div className="nl-recent">
          <div className="nl-pick">{results.length} result{results.length !== 1 ? "s" : ""}</div>
          {results.length > 0 ? (
            <div className="nl-recentgrid">
              {results.map((l) => (
                <button key={l.id} className="nl-recentchip" onClick={() => onOpenLineup(l)}>
                  <span className="nl-recenticon" style={{ color: TYPE_META[l.type].color }}><NadeIcon type={l.type} size={15} /></span>
                  <span className="nl-recenttext">
                    <strong>{l.target}</strong>
                    <small>{mapName(l.map)} · {l.from} · {l.throwType}</small>
                  </span>
                  <ArrowRight size={14} className="nl-recentarrow" />
                </button>
              ))}
            </div>
          ) : (
            <div className="nl-noresults">No lineups match “{query}”. Try a spot or position name.</div>
          )}
        </div>
      ) : (
        <>
          <div className="nl-grid">
            {maps.map((m) => {
              const mapLineups = lineups.filter((l) => l.map === m.id);
              const count = mapLineups.length;
              const spots = new Set(mapLineups.map((l) => l.target)).size;
              const typesPresent = [...new Set(mapLineups.map((l) => l.type))];
              if (m.comingSoon) {
                return (
                  <div key={m.id} className="nl-card soon" aria-disabled="true">
                    <div className="nl-thumb locked"><Lock size={22} /></div>
                    <div className="nl-cardbody"><span className="nl-name">{m.name}</span><div className="nl-soon">Coming soon</div></div>
                  </div>
                );
              }
              return (
                <button key={m.id} className="nl-card" onClick={() => onPick(m.id)}>
                  <div className="nl-thumb"><MapThumb m={m} /></div>
                  <div className="nl-cardbody">
                    <div className="nl-cardtop"><span className="nl-name">{m.name}</span><span className="nl-count">{count} lineup{count !== 1 ? "s" : ""}</span></div>
                    <div className="nl-dots">
                      {typesPresent.length > 0
                        ? typesPresent.map((tp) => <span key={tp} className="nl-dot" style={{ background: TYPE_META[tp].color }} title={TYPE_META[tp].label} />)
                        : <span className="nl-dot" style={{ background: "var(--border)" }} />}
                      <span className="nl-dotslabel">{count > 0 ? `${spots} spot${spots !== 1 ? "s" : ""}` : "No lineups yet"}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {recent.length > 0 && (
            <div className="nl-recent">
              <div className="nl-pick">Recently added</div>
              <div className="nl-recentgrid">
                {recent.map((l) => (
                  <button key={l.id} className="nl-recentchip" onClick={() => onOpenLineup(l)}>
                    <span className="nl-recenticon" style={{ color: TYPE_META[l.type].color }}><NadeIcon type={l.type} size={15} /></span>
                    <span className="nl-recenttext">
                      <strong>{l.target}</strong>
                      <small>{mapName(l.map)} · {l.from}</small>
                    </span>
                    <ArrowRight size={14} className="nl-recentarrow" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <footer className="nl-footer">
        <span>nades&apos;n&apos;stuff — community CS2 grenade lineups.</span>
        <span>Map radars by SimpleRadar.</span>
      </footer>
    </div>
  );
}
