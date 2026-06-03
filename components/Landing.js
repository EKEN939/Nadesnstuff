"use client";
import { Lock } from "lucide-react";
import Logo from "./Logo";
import { TYPE_META } from "@/lib/constants";

export default function Landing({ maps, lineups, onPick }) {
  const total = lineups.length;
  const live = maps.filter((m) => !m.comingSoon).length;

  return (
    <div className="nl-landing">
      <div className="nl-hero">
        <Logo variant="full" />
        <p className="nl-tag">Grenade lineups for Counter-Strike 2</p>
        <p className="nl-sub">Smokes, flashes, mollys and HE — pick a map to start.</p>
        <div className="nl-stat">{total} lineups · {live} map{live > 1 ? "s" : ""}</div>
      </div>

      <div className="nl-pick">Choose a map</div>
      <div className="nl-grid">
        {maps.map((m) => {
          const count = lineups.filter((l) => l.map === m.id).length;
          if (m.comingSoon) {
            return (
              <div key={m.id} className="nl-card soon" aria-disabled="true">
                <div className="nl-thumb locked"><Lock size={22} /></div>
                <div className="nl-cardbody">
                  <span className="nl-name">{m.name}</span>
                  <div className="nl-soon">Coming soon</div>
                </div>
              </div>
            );
          }
          return (
            <button key={m.id} className="nl-card" onClick={() => onPick(m.id)}>
              <div className="nl-thumb">
                {m.radar ? <img src={m.radar} alt={`${m.name} radar`} /> : <div className="nl-thumbgrid" />}
              </div>
              <div className="nl-cardbody">
                <div className="nl-cardtop">
                  <span className="nl-name">{m.name}</span>
                  <span className="nl-count">{count} lineups</span>
                </div>
                <div className="nl-dots">
                  {Object.values(TYPE_META).map((t, i) => <span key={i} className="nl-dot" style={{ background: t.color }} />)}
                  <span className="nl-dotslabel">all types</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
