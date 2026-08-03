import { ArrowLeft, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]">
          <SearchX size={26} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--text)]">
          Workspace not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          This workspace may have moved, or you might not have access yet.
        </p>
        <Link
          to="/"
          className="focus-ring mx-auto mt-7 flex w-fit items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
      </motion.div>
    </main>
  );
}
