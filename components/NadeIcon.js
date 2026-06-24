// Nade type GLYPH (inner cue + filter/legend icon). Per pin-language spec.
// smoke=puff, flash=star, molotov=flame (filled); HE=frag grenade (stroked). viewBox 0 0 24 24.
export default function NadeIcon({ type, size = 16, ...props }) {
  const base = { width: size, height: size, viewBox: "0 0 24 24", ...props };
  if (type === "smoke") {
    return (
      <svg {...base} fill="currentColor">
        <circle cx="8" cy="13.5" r="3" /><circle cx="12" cy="11" r="3.6" /><circle cx="16" cy="13.5" r="3" />
        <rect x="6" y="13" width="12" height="3.3" rx="1.6" />
      </svg>
    );
  }
  if (type === "flash") {
    return (
      <svg {...base} fill="currentColor">
        <polygon points="12,3.5 14.1,9.1 20.1,9.4 15.4,13.1 17,18.9 12,15.6 7,18.9 8.6,13.1 3.9,9.4 9.9,9.1" />
      </svg>
    );
  }
  if (type === "molly") {
    return (
      <svg {...base} fill="currentColor">
        <path d="M12 3c.5 3 2.4 4.3 3.5 6.1A5.5 5.5 0 1 1 6.6 9C7.8 7.8 8.6 6.8 8.6 5.2c1.2.9 1.7 2 1.7 3C11.2 6.6 11.7 4.7 12 3Z" />
      </svg>
    );
  }
  // he: frag grenade (stroked)
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="14" r="5.1" /><path d="M10.2 8.9h3.6V7.3h-3.6z" /><path d="M13.8 7.7 16.1 6.4l.9 1.5" />
    </svg>
  );
}
