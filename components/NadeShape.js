// Pin SILHOUETTE per nade type (shape = type, fill = side). Per pin-language spec.
// smoke=circle, flash=triangle, molotov=rounded square, HE=diamond. viewBox 0 0 24 24.
const SHAPES = {
  smoke: <circle cx="12" cy="12" r="9.4" />,
  flash: <polygon points="12,3.2 20.6,19.2 3.4,19.2" />,
  molly: <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.4" />,
  he: <polygon points="12,2.6 21.4,12 12,21.4 2.6,12" />,
};

export default function NadeShape({ type, size = 28, fill = "#e0b341", stroke = "#16181b", strokeWidth = 1.7, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
      strokeWidth={strokeWidth} strokeLinejoin="round" {...props}>
      {SHAPES[type] || SHAPES.smoke}
    </svg>
  );
}
