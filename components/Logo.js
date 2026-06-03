// Themed wordmark for the dark UI. variant: "compact" (header) or "full" (hero).
export default function Logo({ variant = "compact" }) {
  if (variant === "full") {
    return (
      <div className="nns-logo nns-logo-full">
        <div className="nns-wordmark">NADES<span className="nns-q">'</span><span className="nns-n">N</span><span className="nns-q">'</span>STUFF</div>
        <div className="nns-rule">
          <span className="nns-line" />
          <Crosshair />
          <span className="nns-line" />
        </div>
      </div>
    );
  }
  return (
    <div className="nns-logo nns-logo-compact">
      <Crosshair small />
      <div className="nns-wordmark">NADES<span className="nns-q">'</span><span className="nns-n">N</span><span className="nns-q">'</span>STUFF</div>
    </div>
  );
}

function Crosshair({ small }) {
  const s = small ? 18 : 26;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" className="nns-cross">
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <path d="M12 1.5V6M12 18v4.5M1.5 12H6M18 12h4.5" />
    </svg>
  );
}
