type Props = {
  className?: string;
  colorClass?: string;
};

export function ViewfinderCorners({
  className = "",
  colorClass = "border-brand",
}: Props) {
  const base = `absolute size-9 ${colorClass}`;
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className={`${base} left-0 top-0 rounded-tl-2xl border-l-4 border-t-4`} />
      <span className={`${base} right-0 top-0 rounded-tr-2xl border-r-4 border-t-4`} />
      <span className={`${base} bottom-0 left-0 rounded-bl-2xl border-b-4 border-l-4`} />
      <span className={`${base} bottom-0 right-0 rounded-br-2xl border-b-4 border-r-4`} />
    </div>
  );
}