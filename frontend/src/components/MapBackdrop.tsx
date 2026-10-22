// Latar peta SVG statis, dipakai di halaman Home & Pilih Kafe
export function MapBackdrop() {
  return (
    <svg
      viewBox="0 0 296 373"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <rect width="296" height="373" fill="#e9eeed" />
      <rect x="183" y="23" width="80" height="77" rx="8" fill="#d3ebd9" />
      <rect x="18" y="263" width="40" height="50" rx="8" fill="#d3ebd9" />
      {[
        [10, 10, 28, 28],
        [60, 15, 38, 38],
        [10, 175, 34, 30],
        [155, 105, 36, 34],
        [210, 250, 50, 40],
        [90, 215, 40, 36],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#f1f4f3" />
      ))}
      <path d="M213 0 C222 80 190 130 206 200 S196 320 203 373" stroke="#cfe6f2" strokeWidth="12" fill="none" />
      <g stroke="#fff" fill="none" strokeLinecap="round">
        <path d="M0 110 H296" strokeWidth="7" />
        <path d="M0 158 H296" strokeWidth="10" />
        <path d="M0 216 H296" strokeWidth="6" />
        <path d="M0 290 H296" strokeWidth="5" />
        <path d="M143 0 V373" strokeWidth="6" />
        <path d="M262 0 V373" strokeWidth="4" />
        <path d="M23 -5 L165 378" strokeWidth="16" />
      </g>
      <text x="210" y="133" fontSize="9" fill="#8a97a3" textAnchor="middle">
        Ring Road Utara
      </text>
    </svg>
  );
}