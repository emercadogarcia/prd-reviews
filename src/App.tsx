import { useState } from "react";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { Badge, CodeBlock, ProgressBar, ScoreRing, Section } from "./components/UI";
import { analyzePrd, downloadMarkdown, downloadPdf, prdCriteria, type PrdAnalysis, type PrdFinding } from "./lib/prd";
import { cn } from "./utils/cn";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type UploadState = "idle" | "reading" | "ready" | "error";
type Tab = "upload" | "paste" | "results";

export default function App() {
  const [tab, setTab] = useState<Tab>("upload");
  const [status, setStatus] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [analysis, setAnalysis] = useState<PrdAnalysis | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [completedChecks, setCompletedChecks] = useState<Set<string>>(new Set());

  async function handleFile(file?: File) {
    if (!file) return;
    setStatus("reading");
    setError("");
    setAnalysis(null);
    setFileName(file.name);
    setTab("results");

    try {
      const text = await readPrdFile(file);
      if (text.trim().length < 120) {
        throw new Error("El documento tiene muy poco contenido para una evaluacion profesional.");
      }
      const result = analyzePrd(text, file.name);
      setSourceText(text);
      setAnalysis(result);
      setOpenId(result.findings.find((f) => f.severity === "Alta")?.id ?? result.findings[0]?.id ?? null);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo leer el archivo.");
    }
  }

  function analyzePastedText() {
    if (sourceText.trim().length < 120) {
      setStatus("error");
      setError("Pega al menos 120 caracteres del PRD o carga un archivo markdown/pdf.");
      return;
    }
    const result = analyzePrd(sourceText, fileName || "PRD pegado");
    setFileName(fileName || "PRD pegado");
    setAnalysis(result);
    setTab("results");
    setOpenId(result.findings.find((f) => f.severity === "Alta")?.id ?? result.findings[0]?.id ?? null);
    setStatus("ready");
    setError("");
  }

  function toggleCheck(id: string) {
    setCompletedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.2),_transparent_45%),radial-gradient(ellipse_at_top_right,_rgba(124,58,237,0.18),_transparent_45%),linear-gradient(180deg,_#020617,_#0f172a_55%,_#020617)]"
      />

      <header className="border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">PRD Review Studio v2.0</p>
            <p className="text-xs text-slate-400">Auditoria senior de producto, usabilidad, arquitectura y readiness de delivery</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Badge tone="indigo">Markdown</Badge>
            <Badge tone="violet">PDF</Badge>
            <Badge tone="emerald">Dual view</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Herramienta profesional</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Carga tu PRD y recibe una revision ejecutable para llevarlo al 100%.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              La herramienta solicita un documento PRD en Markdown o PDF, lo evalúa con una matriz ponderada de 12 criterios, genera observaciones accionables y crea un PRD corregido en formato descargable.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setTab("upload")}
                className={cn(
                  "rounded-xl px-5 py-3 text-sm font-semibold transition",
                  tab === "upload" ? "bg-cyan-400 text-slate-950" : "border border-white/15 text-white hover:bg-white/10"
                )}
              >
                Subir archivo
              </button>
              <button
                onClick={() => setTab("paste")}
                className={cn(
                  "rounded-xl px-5 py-3 text-sm font-semibold transition",
                  tab === "paste" ? "bg-cyan-400 text-slate-950" : "border border-white/15 text-white hover:bg-white/10"
                )}
              >
                Pegar contenido
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Score PRD</p>
                <p className="mt-1 text-3xl font-semibold text-white">
                  {analysis ? `${analysis.score}/100` : "Pendiente"}
                </p>
              </div>
              <ScoreRing value={analysis?.score ?? 0} size={112} stroke={10} />
            </div>
            <div className="mt-6 space-y-3">
              {analysis ? (
                prdCriteria.map((criterion, index) => (
                  <ProgressBar key={criterion.id} label={criterion.name} value={analysis.findings[index]?.score ?? 0} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm leading-6 text-slate-400">
                  Aun no hay PRD cargado. Sube un .md, .markdown o .pdf para generar el diagnostico, el documento corregido y la lista de correcciones para llegar al 100%.
                </div>
              )}
            </div>
          </div>
        </section>

        {tab !== "results" && (
          <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className={cn("rounded-3xl border p-6", tab === "upload" ? "border-cyan-300/30 bg-slate-900/60" : "border-white/10 bg-slate-900/40")}>
              <p className="text-lg font-semibold text-white">1. Subir el documento PRD</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Formatos soportados: Markdown (.md, .markdown), texto plano y PDF con texto seleccionable. El analisis se ejecuta en el navegador; no se envia tu archivo a ningun servidor.
              </p>

              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-500/5 px-5 py-10 text-center transition hover:border-cyan-300/60 hover:bg-cyan-500/10">
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-cyan-300" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M12 16V4" />
                  <path d="M7 9l5-5 5 5" />
                  <path d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" />
                </svg>
                <span className="mt-3 text-sm font-semibold text-white">Seleccionar PRD</span>
                <span className="mt-1 text-xs text-slate-500">PDF o Markdown</span>
                <input
                  className="sr-only"
                  type="file"
                  accept=".md,.markdown,.txt,.pdf,application/pdf,text/markdown,text/plain"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={status === "ready" ? "emerald" : status === "error" ? "red" : "slate"}>
                  Estado: {statusLabel(status)}
                </Badge>
                {fileName && <Badge tone="indigo">{fileName}</Badge>}
              </div>
              {error && (
                <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>
              )}
            </div>

            <div className={cn("rounded-3xl border p-6", tab === "paste" ? "border-cyan-300/30 bg-slate-900/60" : "border-white/10 bg-slate-900/40")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">2. O pega el contenido</p>
                  <p className="mt-1 text-sm text-slate-400">Fallback util si el PDF no permite extracción limpia de texto.</p>
                </div>
                <button
                  onClick={analyzePastedText}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  Analizar texto
                </button>
              </div>
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder="# PRD - Nombre del producto\n\nPega aqui el documento completo..."
                className="mt-4 h-64 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-sm leading-6 text-slate-200 placeholder:text-slate-600 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              />
            </div>
          </section>
        )}

        {tab === "results" && analysis && (
          <>
            <Section
              title="3. Checklist de criterios (12/12)"
              subtitle="Marca los items completados; el score refleja lo que falta por cerrar"
              action={
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadMarkdown("observaciones-prd.md", analysis.observationsDoc)}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 3v12" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                    Descargar .md
                  </button>
                  <button
                    onClick={() => downloadPdf("prd-corregido.pdf", analysis.correctedPrd)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    Exportar PDF
                  </button>
                </div>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {analysis.findings.map((finding) => (
                  <button
                    key={finding.id}
                    onClick={() => toggleCheck(finding.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                      completedChecks.has(finding.id)
                        ? "border-emerald-400/40 bg-emerald-500/10"
                        : "border-white/10 bg-slate-900/50 hover:border-white/20"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded",
                        completedChecks.has(finding.id)
                          ? "bg-emerald-400 text-slate-950"
                          : "border border-white/30 bg-slate-950/60"
                      )}
                    >
                      {completedChecks.has(finding.id) && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M5 12l5 5 9-11" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{finding.criterion}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge tone={finding.severity === "Alta" ? "red" : finding.severity === "Media" ? "amber" : "emerald"}>
                          {finding.severity}
                        </Badge>
                        <span className="font-mono text-[10px] text-slate-400">{finding.score}/100</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            <Section
              title="4. Comparador: Original vs Corregido"
              subtitle="Identifica que secciones del PRD original estan ausentes o debiles"
              action={
                <Badge tone="slate">
                  {analysis.findings.filter((f) => f.status === "Faltante").length} faltantes
                </Badge>
              }
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">PRD original</p>
                  <div className="max-h-96 overflow-auto rounded-2xl border border-white/10 bg-slate-950/80">
                    <pre className="p-4 text-xs leading-relaxed text-slate-200">{sourceText}</pre>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">PRD corregido</p>
                  <div className="max-h-96 overflow-auto rounded-2xl border border-white/10 bg-slate-950/80">
                    <CodeBlock code={analysis.correctedPrd} lang="markdown" />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="5. Observaciones detalladas" subtitle="Cada criterio con su severidad, observacion y correccion requerida">
              <ul className="space-y-3">
                {analysis.findings.map((finding) => (
                  <FindingRow
                    key={finding.id}
                    finding={finding}
                    open={openId === finding.id}
                    onToggle={() => setOpenId(openId === finding.id ? null : finding.id)}
                  />
                ))}
              </ul>
            </Section>
          </>
        )}

        {!analysis && tab !== "results" && (
          <Section title="Matriz de evaluacion (12 criterios)" subtitle="Estos son los criterios que se aplicaran al PRD cuando lo cargues">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {prdCriteria.map((criterion) => (
                <div key={criterion.id} className="rounded-2xl border border-white/10 bg-slate-900/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{criterion.name}</p>
                    <Badge tone="slate">{criterion.weight}%</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{criterion.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </main>
    </div>
  );
}

async function readPrdFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || file.type === "application/pdf") {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
      pages.push(text);
    }
    return pages.join("\n\n");
  }
  return file.text();
}

function statusLabel(status: UploadState) {
  const labels: Record<UploadState, string> = {
    idle: "Esperando archivo",
    reading: "Leyendo documento",
    ready: "Analisis listo",
    error: "Requiere revision",
  };
  return labels[status];
}

function FindingRow({
  finding,
  open,
  onToggle,
}: {
  finding: PrdFinding;
  open: boolean;
  onToggle: () => void;
}) {
  const tone =
    finding.severity === "Alta" ? "red" : finding.severity === "Media" ? "amber" : "emerald";
  return (
    <li className={cn("overflow-hidden rounded-2xl border bg-slate-900/50", open ? "border-cyan-300/30" : "border-white/10")}>
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/[0.03]">
        <Badge tone={tone}>{finding.severity}</Badge>
        <span className="font-mono text-xs text-slate-500">{finding.id}</span>
        <span className="flex-1 text-sm font-semibold text-white">{finding.criterion}</span>
        <span className="hidden text-xs text-slate-400 sm:inline">{finding.status}</span>
        <span className="font-mono text-sm text-cyan-200">{finding.score}/100</span>
      </button>
      {open && (
        <div className="grid gap-5 border-t border-white/10 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Observacion</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{finding.observation}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Correccion requerida</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{finding.correction}</p>
          </div>
        </div>
      )}
    </li>
  );
}