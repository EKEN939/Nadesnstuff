// Stylized Counter-Strike utility icons. Stroke inherits currentColor.
export default function NadeIcon({ type, size = 16, ...props }) {
  const c = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round",
    ...props,
  };
  if (type === "smoke") {
    // smoke grenade: canister + rising wisps
    return (
      <svg {...c}>
        <rect x="8" y="10" width="8" height="11" rx="3.5" />
        <path d="M10 10V8.2A2 2 0 0 1 14 8.2V10" />
        <path d="M9.5 5.6c1-.7 1-1.8 0-2.5" />
        <path d="M14.5 5.6c-1-.7-1-1.8 0-2.5" />
      </svg>
    );
  }
  if (type === "flash") {
    // flashbang: canister + burst rays
    return (
      <svg {...c}>
        <rect x="9" y="11" width="6" height="9" rx="3" />
        <path d="M10.5 11V9.2h3V11" />
        <path d="M12 6V3.5" />
        <path d="M8 7 6.4 5.4" />
        <path d="M16 7l1.6-1.6" />
      </svg>
    );
  }
  if (type === "molly") {
    // molotov: bottle + flame
    return (
      <svg {...c}>
        <path d="M10 10V7h4v3l1.2 2v8a1 1 0 0 1-1 1h-4.4a1 1 0 0 1-1-1v-8z" />
        <path d="M12 7c1.2-1 .8-2.4-.2-3 .4 1.1-1 1.5-.5 2.6" />
      </svg>
    );
  }
  // he grenade: round body + cap + lever
  return (
    <svg {...c}>
      <circle cx="11.5" cy="14.5" r="6" />
      <path d="M9.5 8.5h4.2V6.8H9.5z" />
      <path d="M13.7 7.4 16.4 6l1 1.7" />
    </svg>
  );
}
