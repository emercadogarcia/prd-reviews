import { cn } from "../utils/cn";

export type Severity = "Alta" | "Media" | "Baja";

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: "slate" | "indigo" | "emerald" | "amber" | "red" | "violet";
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: "border-white/10 bg-white/5 text-slate-200",
    indigo: "border-indigo-400/30 bg-indigo-500/15 text-indigo-200",
    emerald: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
    amber: "border-amber-400/30 bg-amber-500/15 text-amber-200",
    red: "border-red-400/30 bg-red-500/15 text-red-200",
    violet: "border-violet-400/30 bg-violet-500/15 text-violet-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ScoreRing({
  value,
  size = 96,
  stroke = 10,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color =
    value >= 80
      ? "#34d399"
      : value >= 65
      ? "#a3e635"
      : value >= 50
      ? "#fbbf24"
      : "#f87171";

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-lg font-semibold text-white">{value}</span>
      </div>
    </div>
  );
}

export function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 80
      ? "from-emerald-400 to-emerald-500"
      : value >= 65
      ? "from-lime-400 to-emerald-400"
      : value >= 50
      ? "from-amber-400 to-orange-400"
      : "from-red-400 to-rose-500";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-slate-400">{value}/100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", color)}
          style={{ width: `${value}%`, transition: "width 700ms ease" }}
        />
      </div>
    </div>
  );
}

export function KPICard({
  label,
  value,
  hint,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "slate" | "red" | "amber" | "indigo";
}) {
  const tones: Record<string, string> = {
    slate: "from-white/5 to-white/0",
    red: "from-red-500/15 to-red-500/0",
    amber: "from-amber-500/15 to-amber-500/0",
    indigo: "from-indigo-500/15 to-indigo-500/0",
  };
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-gradient-to-br p-4",
        tones[tone]
      )}
    >
      <p className="text-[11px] uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export function CodeBlock({
  code,
  lang,
}: {
  code: string;
  lang?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/80">
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500">
        <span>{lang ?? "code"}</span>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400/60" />
          <span className="h-2 w-2 rounded-full bg-amber-400/60" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
        </div>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
