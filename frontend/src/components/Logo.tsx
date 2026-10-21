function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#0b5d3b" />
      <circle
        cx="24"
        cy="24"
        r="15"
        stroke="#1fd08f"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="76 18"
        transform="rotate(-20 24 24)"
      />
      <path
        d="M24 14c-3.6 4.4-6.5 7.8-6.5 11.6a6.5 6.5 0 0 0 13 0C30.5 21.8 27.6 18.4 24 14z"
        fill="#fff"
      />
    </svg>
  );
}

export function Logo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const lg = size === "lg";
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className={lg ? "size-11" : "size-8"} />
      <span
        className={`font-extrabold tracking-tight text-brand-dark ${
          lg ? "text-3xl" : "text-xl"
        }`}
      >
        BioLoop
      </span>
      <span
        className={`rounded-md bg-brand font-extrabold tracking-wide text-white ${
          lg ? "px-2 py-0.5 text-sm" : "px-1.5 py-0.5 text-[10px]"
        }`}
      >
        AX
      </span>
    </div>
  );
}