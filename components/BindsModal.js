"use client";
import { useEffect, useState } from "react";
import { X, Copy, Check, Keyboard } from "lucide-react";
import { BIND_GROUPS } from "@/data/binds";

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    }).catch(() => {});
  }
  return (
    <button className={`ub-copybtn ${done ? "done" : ""}`} onClick={copy}>
      {done ? <Check size={13} /> : <Copy size={13} />} {done ? "Copied" : "Copy"}
    </button>
  );
}

export default function BindsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="ub-overlay" onClick={onClose}>
      <div className="ub-modal ub-binds" onClick={(e) => e.stopPropagation()}>
        <button className="ub-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="ub-binds-head">
          <span className="ub-binds-eyebrow"><Keyboard size={14} /> Stuff</span>
          <h2>Binds &amp; Configs</h2>
          <p>Copy-paste the ones you want. Paste a line straight into the in-game console to try it, or add it to your <code>autoexec.cfg</code> to keep it permanently. Swap the key in quotes for whatever you like.</p>
        </div>

        {BIND_GROUPS.map((g) => (
          <div key={g.name} className="ub-binds-group">
            <div className="ub-binds-gtitle">{g.name}</div>
            {g.blurb && <div className="ub-binds-blurb">{g.blurb}</div>}
            <div className="ub-binds-list">
              {g.items.map((it) => (
                <div key={it.title} className="ub-bindcard">
                  <div className="ub-bindcard-top">
                    <span className="ub-bindcard-title">{it.title}</span>
                    <CopyBtn text={it.code} />
                  </div>
                  {it.desc && <p className="ub-bindcard-desc">{it.desc}</p>}
                  <pre className="ub-bindcode"><code>{it.code}</code></pre>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
