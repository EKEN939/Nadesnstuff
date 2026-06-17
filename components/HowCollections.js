"use client";
import { Crosshair, FolderPlus, GripVertical, Share2 } from "lucide-react";

/* ---- per-step on-brand SVG illustrations ---- */

function ArtFind() {
  return (
    <svg viewBox="0 0 340 210" className="nl-art" role="img" aria-label="A lineup pin and trajectory on the map">
      <rect x="8" y="8" width="324" height="194" rx="16" fill="var(--surface2)" stroke="var(--border)" />
      <g stroke="var(--border)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".85">
        <path d="M42 66 H120 V44 H188" />
        <path d="M58 156 H132 V118" />
        <rect x="206" y="78" width="74" height="52" rx="5" />
        <path d="M150 96 H180" />
      </g>
      <line x1="74" y1="158" x2="250" y2="62" stroke="var(--sc)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8" />
      <circle cx="74" cy="158" r="7" fill="var(--surface)" stroke="var(--sc)" strokeWidth="3" />
      <circle cx="250" cy="62" r="22" fill="none" stroke="var(--sc)" strokeWidth="2" opacity=".4" />
      <circle cx="250" cy="62" r="12" fill="var(--sc)" />
    </svg>
  );
}

function ArtSave() {
  return (
    <svg viewBox="0 0 340 210" className="nl-art" role="img" aria-label="Saving a lineup card to a collection">
      <rect x="64" y="26" width="180" height="118" rx="14" fill="var(--surface2)" stroke="var(--border)" />
      <rect x="76" y="38" width="156" height="52" rx="8" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="154" cy="64" r="13" fill="none" stroke="var(--sc)" strokeWidth="3" />
      <rect x="76" y="100" width="104" height="9" rx="4" fill="var(--border)" />
      <rect x="76" y="116" width="68" height="8" rx="4" fill="var(--border)" />
      <rect x="88" y="158" width="164" height="30" rx="9" fill="var(--sc)" fillOpacity=".16" stroke="var(--sc)" />
      <g transform="translate(104 166)" stroke="var(--sc)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 2.5 H6.5 L8.5 0 H15 V13 H0 Z" />
      </g>
      <rect x="126" y="169" width="90" height="9" rx="4" fill="var(--sc)" opacity=".7" />
      <circle cx="236" cy="40" r="15" fill="var(--sc)" />
      <path d="M229 40 l5 5 l9 -10" stroke="#15161a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArtOrder() {
  const Row = ({ y, w, drag }) => (
    <g transform={`translate(${drag ? 70 : 56} ${y})`}>
      {drag && <rect x="-6" y="-6" width={w + 12} height="38" rx="12" fill="none" stroke="var(--sc)" strokeWidth="2" strokeDasharray="5 5" />}
      <rect x="0" y="0" width={w} height="26" rx="9" fill="var(--surface2)" stroke={drag ? "var(--sc)" : "var(--border)"} />
      <g fill="var(--muted)">
        <circle cx="14" cy="9" r="1.7" /><circle cx="22" cy="9" r="1.7" />
        <circle cx="14" cy="17" r="1.7" /><circle cx="22" cy="17" r="1.7" />
      </g>
      <circle cx="40" cy="13" r="5" fill="var(--sc)" opacity={drag ? 1 : .5} />
      <rect x="54" y="9" width={w - 76} height="8" rx="4" fill="var(--border)" />
    </g>
  );
  return (
    <svg viewBox="0 0 340 210" className="nl-art" role="img" aria-label="Dragging collection cards into order">
      <Row y="34" w="208" />
      <Row y="118" w="208" />
      <Row y="76" w="208" drag />
      <g stroke="var(--sc)" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".9">
        <path d="M300 70 v18 M294 76 l6 -6 l6 6" />
        <path d="M300 140 v-18 M294 134 l6 6 l6 -6" />
      </g>
    </svg>
  );
}

function ArtShare() {
  return (
    <svg viewBox="0 0 340 210" className="nl-art" role="img" aria-label="Stepping through and sharing a collection">
      <rect x="54" y="48" width="232" height="40" rx="13" fill="var(--surface2)" stroke="var(--border)" />
      <path d="M82 58 l-9 10 l9 10" stroke="var(--sc)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M258 58 l9 10 l-9 10" stroke="var(--sc)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="104" y="60" width="84" height="9" rx="4" fill="var(--text)" opacity=".8" />
      <text x="206" y="74" fontFamily="Archivo, sans-serif" fontSize="15" fontWeight="800" fill="var(--sc)">2/4</text>
      <g>
        <circle cx="128" cy="120" r="4" fill="var(--sc)" /><circle cx="150" cy="120" r="4" fill="var(--sc)" />
        <circle cx="172" cy="120" r="4" fill="var(--border)" /><circle cx="194" cy="120" r="4" fill="var(--border)" />
      </g>
      <rect x="74" y="150" width="192" height="36" rx="11" fill="var(--sc)" fillOpacity=".14" stroke="var(--sc)" />
      <g transform="translate(92 162)" stroke="var(--sc)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7 a5 5 0 0 1 5 -5 h3 M11 5 a5 5 0 0 1 5 5 h-2" />
        <path d="M5 9 h8" />
      </g>
      <rect x="118" y="161" width="120" height="8" rx="4" fill="var(--sc)" opacity=".6" />
    </svg>
  );
}

const STEPS = [
  { color: "#5d8ad8", Icon: Crosshair, Art: ArtFind, title: "Find a lineup", desc: "Open any map and click a smoke, flash or molly you want in your arsenal." },
  { color: "#ff5b00", Icon: FolderPlus, Art: ArtSave, title: "Save to a collection", desc: "Hit “Save to collection” and drop it into a new or existing set — by strat, map or bombsite." },
  { color: "#e0b341", Icon: GripVertical, Art: ArtOrder, title: "Order them your way", desc: "Drag the cards into the exact sequence you throw them in a round." },
  { color: "#cf4a3c", Icon: Share2, Art: ArtShare, title: "Run it & share", desc: "Step through the set with ‹ / › on the map, or send the whole thing to your team as a link." },
];

export default function HowCollections({ loggedIn }) {
  return (
    <section className="nl-how" data-reveal>
      <div className="nl-how-head">
        <span className="nl-how-eyebrow">Collections</span>
        <h2 className="nl-how-title">Build your own throw routines</h2>
        <p className="nl-how-sub">Group the lineups you actually run into ordered sets — a full smoke execute, a pistol-round setup, everything for one bombsite — then step through them on the map or share them with your team.</p>
      </div>

      <div className="nl-how-rows">
        {STEPS.map((s, i) => (
          <div className="nl-howrow" key={i} style={{ "--sc": s.color }}>
            <div className="nl-howrow-art"><s.Art /></div>
            <div className="nl-howrow-text">
              <span className="nl-howrow-step">Step {i + 1}</span>
              <h3 className="nl-howrow-title"><span className="nl-howrow-ico"><s.Icon size={16} /></span>{s.title}</h3>
              <p className="nl-howrow-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {!loggedIn && <div className="nl-how-foot">Sign in with Discord to start your first collection.</div>}
    </section>
  );
}
