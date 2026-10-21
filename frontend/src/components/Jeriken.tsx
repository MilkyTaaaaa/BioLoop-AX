type JerikenProps = {
  tone?: "light" | "dark";
  /** 0 sampai 1 */
  level?: number;
  className?: string;
};

export function Jeriken({
  tone = "light",
  level = 0.4,
  className = "",
}: JerikenProps) {
  const dark = tone === "dark";
  const pct = `${Math.round(Math.min(Math.max(level, 0), 1) * 100)}%`;

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {/* badan */}
      <div
        className={`absolute inset-0 flex items-end rounded-xl border-[3px] p-[7%] ${
          dark ? "border-slate-600 bg-night" : "border-[#b9ecd2] bg-white"
        }`}
      >
        {dark && (
          <span className="absolute left-[14%] top-[10%] h-1 w-[28%] rounded-full bg-slate-500" />
        )}
        <div
          className={`w-full rounded-md ${dark ? "bg-[#7a4420]" : "bg-amber"}`}
          style={{ height: pct }}
        />
      </div>

      {/* tutup */}
      <div
        className={`absolute -top-[9%] right-[16%] h-[12%] w-[26%] rounded-t-md ${
          dark ? "bg-slate-600" : "bg-[#c6f1dc]"
        }`}
      />
    </div>
  );
}