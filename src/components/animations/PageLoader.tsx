import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

/* ─── tiny helpers ─────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

function MetricCard({
  delay,
  label,
  value,
  change,
  color,
  style,
}: {
  delay: number;
  label: string;
  value: string;
  change: string;
  color: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease }}
      style={style}
      className="absolute hidden flex-col gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 backdrop-blur-md sm:flex"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
        {label}
      </span>
      <span className="text-xl font-semibold tracking-tight text-white/90">{value}</span>
      <span className={`text-[11px] font-medium ${color}`}>{change}</span>
    </motion.div>
  );
}

function BarChart({ delay }: { delay: number }) {
  const bars = [0.55, 0.8, 0.45, 0.95, 0.7, 0.6, 0.85, 0.5, 0.72, 0.9];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease }}
      className="absolute flex items-end gap-[5px]"
    >
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: delay + i * 0.05, duration: 0.45, ease }}
          style={{ height: `${h * 52}px`, originY: 1 }}
          className="w-[7px] rounded-t-sm bg-gradient-to-t from-red-600/60 to-rose-400/80"
        />
      ))}
    </motion.div>
  );
}

function ActivityDot({
  delay,
  style,
}: {
  delay: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 18 }}
      style={style}
      className="absolute size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.55)]"
    />
  );
}

/* ─── pulsing orbit rings ──────────────────────────────── */
function OrbitRings() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {[160, 240, 330, 430].map((r, i) => (
        <motion.div
          key={r}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.22, 0.12], scale: 1 }}
          transition={{
            delay: 0.1 + i * 0.18,
            duration: 1.4,
            ease: "easeOut",
          }}
          style={{ width: r, height: r }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        />
      ))}
      {/* breathing pulse on outermost */}
      <motion.div
        animate={{ opacity: [0.06, 0.16, 0.06], scale: [1, 1.04, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 430, height: 430 }}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-400/20"
      />
    </div>
  );
}

function FuturisticCore() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 sm:size-[520px]"
      aria-hidden
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-rose-300/15"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[10%] rounded-full border border-dashed border-emerald-300/20"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[18%] rounded-full"
        style={{
          background:
            "conic-gradient(from 20deg, transparent 0 19%, rgba(244,63,94,.42) 20%, transparent 21% 49%, rgba(74,222,128,.35) 50%, transparent 51% 79%, rgba(239,68,68,.3) 80%, transparent 81%)",
          maskImage: "radial-gradient(transparent 68%, black 69% 72%, transparent 73%)",
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[28%] rounded-full border border-red-300/15"
      >
        <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-300 shadow-[0_0_16px_3px_rgba(253,164,175,.65)]" />
        <span className="absolute bottom-[7%] right-[14%] size-1 rounded-full bg-emerald-300 shadow-[0_0_12px_2px_rgba(110,231,183,.55)]" />
      </motion.div>
      <motion.div
        animate={{ opacity: [0.12, 0.28, 0.12], scale: [0.96, 1.03, 0.96] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[36%] rounded-full bg-rose-400/10 blur-2xl"
      />
      <span className="absolute left-1/2 top-[5%] h-[12%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-rose-200/20" />
      <span className="absolute bottom-[5%] left-1/2 h-[12%] w-px -translate-x-1/2 bg-gradient-to-t from-transparent to-emerald-200/20" />
      <span className="absolute left-[5%] top-1/2 h-px w-[12%] -translate-y-1/2 bg-gradient-to-r from-transparent to-rose-200/20" />
      <span className="absolute right-[5%] top-1/2 h-px w-[12%] -translate-y-1/2 bg-gradient-to-l from-transparent to-emerald-200/20" />
    </div>
  );
}

/* ─── animated grid lines ──────────────────────────────── */
function GridLines() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
        maskImage:
          "radial-gradient(ellipse at center, black 0%, transparent 72%)",
      }}
    />
  );
}

/* ─── floating connection line ─────────────────────────── */
function ConnectionLine({
  delay,
  style,
}: {
  delay: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ delay, duration: 0.6, ease }}
      style={{ originX: 0, ...style }}
      className="absolute hidden h-px bg-gradient-to-r from-red-400/40 to-transparent sm:block"
    />
  );
}

/* ─── canvas sparkle particles ─────────────────────────── */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const dots = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.3,
      alpha: Math.random() * 0.35 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.y -= d.speed;
        if (d.y < -4) d.y = canvas.height + 4;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${d.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/* ─── main splash ──────────────────────────────────────── */
export function PageLoader({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.55, ease }}
      className="fixed inset-0 z-[100] overflow-hidden bg-[#09090b]"
      aria-label="Pantiss ERP welcome"
    >
      {/* background layers */}
      <Particles />
      <GridLines />

      {/* ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(220,38,38,0.12) 0%, rgba(244,63,94,0.06) 40%, transparent 70%)",
        }}
      />

      {/* orbit rings */}
      <OrbitRings />
      <FuturisticCore />

      {/* ── floating dashboard elements ── */}

      {/* top-left metric */}
      <MetricCard
        delay={0.5}
        label="Total Programs"
        value="1,248"
        change="↑ 12.4% this quarter"
        color="text-emerald-400"
        style={{ top: "14%", left: "7%" }}
      />

      {/* top-right metric */}
      <MetricCard
        delay={0.65}
        label="Beneficiaries"
        value="84,309"
        change="↑ 8.1% vs last month"
        color="text-rose-400"
        style={{ top: "12%", right: "7%" }}
      />

      {/* bottom-left bar chart */}
      <div
        className="absolute hidden sm:block"
        style={{ bottom: "18%", left: "8%", opacity: 0.85 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-white/35"
        >
          Monthly Impact
        </motion.div>
        <div className="relative" style={{ height: 52 }}>
          <BarChart delay={0.85} />
        </div>
      </div>

      {/* bottom-right metric */}
      <MetricCard
        delay={0.75}
        label="Active Donors"
        value="3,720"
        change="↑ 5.6% this month"
        color="text-rose-400"
        style={{ bottom: "16%", right: "7%" }}
      />

      {/* connection lines */}
      <ConnectionLine
        delay={1.0}
        style={{ top: "32%", left: "22%", width: 80 }}
      />
      <ConnectionLine
        delay={1.1}
        style={{ top: "62%", right: "22%", width: 64 }}
      />

      {/* activity dots */}
      <ActivityDot delay={1.1} style={{ top: "38%", left: "19%" }} />
      <ActivityDot delay={1.2} style={{ bottom: "35%", right: "20%" }} />
      <ActivityDot delay={1.3} style={{ top: "22%", left: "42%" }} />

      {/* ── center content ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6">
        {/* logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.2, duration: 0.8, ease }}
          className="relative"
        >
          {/* glow ring behind logo */}
          <motion.div
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(239,68,68,0.35) 0%, rgba(244,63,94,0.15) 60%, transparent 100%)",
            }}
          />
          <img
            src="/pantiss-mark-transparent.png"
            alt="Pantiss"
            className="relative size-28 object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,.38)] sm:size-32"
            draggable={false}
          />
        </motion.div>

        {/* wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease }}
          className="flex max-w-md flex-col items-center gap-2 text-center"
        >
          <span className="text-2xl font-semibold tracking-tight text-white/90 sm:text-3xl">
            Pantiss ERP
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/35">
            Group of Non-Profits
          </span>
          <p className="mt-2 text-balance text-sm leading-6 text-white/50 sm:text-[15px]">
            One connected workspace for programs, people, finance and partnerships.
          </p>
        </motion.div>

        {/* entry action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5, ease }}
          className="mt-2 flex flex-col items-center gap-4"
        >
          <motion.button
            type="button"
            autoFocus
            onClick={onComplete}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="focus-ring group flex h-12 items-center gap-3 rounded-2xl border border-red-400/20 bg-red-600 px-5 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(0,0,0,.3)] transition-colors hover:bg-red-700 hover:shadow-[0_20px_55px_rgba(220,38,38,.2)]"
          >
            Enter workspace
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </motion.button>
          <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
            <ShieldCheck size={13} className="text-emerald-400/70" />
            Secure organizational access
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute inset-x-0 bottom-6 text-center text-[9px] uppercase tracking-[0.18em] text-white/20"
      >
        Programs · People · Partnerships
      </motion.div>
    </motion.div>
  );
}
