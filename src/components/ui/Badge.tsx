import { cn } from "../../utils/cn";

export function Badge({
  children,
  muted = false,
}: {
  children: string;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide",
        muted
          ? "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-subtle)]"
          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
      )}
    >
      {children}
    </span>
  );
}
