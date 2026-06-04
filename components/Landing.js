"use client";
import { Lock, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import NadeIcon from "./NadeIcon";
import { TYPE_META } from "@/lib/constants";

export default function Landing({ maps, lineups, onPick, onOpenLineup }) {
  const total = lineups.length;
  const live = maps.filter((m) => !m.comingSoon).length;
  const shown = maps;
  const recent = [...lineups].sort((a, b) => b.id - a.id).slice(0, 6);
  const mapName = (id) => maps.find((m) => m.id === id)?.name || id;

  return (
    <div className="nl-landing">
      <div className="nl-hero">
        <Logo variant="full" />
        <div className="nl-tally">
          {Object.entries(TYPE_META).map(([key, t]) => (
            <span key={key} className="nl-tallyitem" style={{ color: t.color }}>
              <NadeIcon type={key} size={15} />
              {lineups.filter((l) => l.type === key).length}
            </span>
          ))}
          <span className="nl-tallydiv" />
          <span className="nl-tallytotal">{total} lineups · {live} map{live > 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="nl-pickbar">
        <div className="nl-pick">Choose a map</div>
      </div>

      <div className="nl-grid">
        {shown.map((m) => {
          const count = lineups.filter((l) => l.map === m.id).length;
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
              <div className="nl-thumb">{m.radar ? <img src={m.radar} alt={`${m.name} radar`} /> : <div className="nl-thumbgrid" />}</div>
              <div className="nl-cardbody">
                <div className="nl-cardtop"><span className="nl-name">{m.name}</span><span className="nl-count">{count} lineups</span></div>
                <div className="nl-dots">
                  {Object.values(TYPE_META).map((t, i) => <span key={i} className="nl-dot" style={{ background: t.color }} />)}
                  <span className="nl-dotslabel">all types</span>
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
    </div>
  );
}
