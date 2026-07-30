import { useState, type MouseEvent, type PropsWithChildren } from "react";
import { motion } from "framer-motion";

interface RippleState {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function Ripple({ children }: PropsWithChildren) {
  const [ripples, setRipples] = useState<RippleState[]>([]);

  const createRipple = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const size = Math.max(bounds.width, bounds.height) * 1.3;
    const ripple = {
      id: Date.now(),
      x: event.clientX - bounds.left - size / 2,
      y: event.clientY - bounds.top - size / 2,
      size,
    };
    setRipples((items) => [...items.slice(-2), ripple]);
    window.setTimeout(
      () => setRipples((items) => items.filter((item) => item.id !== ripple.id)),
      650,
    );
  };

  return (
    <div className="relative size-full overflow-hidden" onMouseDown={createRipple}>
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          aria-hidden
          initial={{ scale: 0, opacity: 0.18 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </div>
  );
}
