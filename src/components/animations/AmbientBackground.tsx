export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="mesh-gradient absolute inset-0" />
      <div className="ambient-beam absolute inset-0" />
      <div className="ambient-rings absolute inset-0" />
      <div className="ambient-glow ambient-glow--left" />
      <div className="ambient-glow ambient-glow--right" />
      <div className="grid-pattern absolute inset-0 opacity-[var(--grid-opacity)] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_72%)]" />
      <div className="ambient-vignette absolute inset-0" />
    </div>
  );
}
