"use client";
import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

function buildDataFile(lineups) {
  const header = "// Genererad av admin-laget. Ersatt innehallet i data/lineups.js med detta.\n";
  return header + "export const LINEUPS = " + JSON.stringify(lineups, null, 2) + ";\n";
}

export default function ExportModal({ lineups, onClose }) {
  const [copied, setCopied] = useState(false);
  const text = buildDataFile(lineups);
  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }
  return (
    <div className="ub-overlay" onClick={onClose}>
      <div className="ub-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ub-close" onClick={onClose}><X size={18} /></button>
        <div className="ub-form-head">
          <div className="ub-hero-kicker">Admin · export</div>
          <h2>Spara alla lineups</h2>
        </div>
        <div className="ub-snippet">
          <p className="ub-snippet-intro">Ersatt hela innehallet i <code>data/lineups.js</code> med detta sa sparas dina andringar och borttagningar permanent:</p>
          <textarea readOnly value={text} onClick={(e) => e.target.select()} />
          <div className="ub-snippet-actions">
            <button className="ub-btn-primary" onClick={copy}>{copied ? <><Check size={15} /> Kopierat</> : <><Copy size={15} /> Kopiera allt</>}</button>
            <button className="ub-btn-ghost" onClick={onClose}>Klar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
