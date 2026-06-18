export type Severity = "Alta" | "Media" | "Baja";

export type PrdCriterion = {
  id: string;
  name: string;
  weight: number;
  required: string[];
  optional: string[];
  description: string;
  recommendation: string;
};

export type PrdFinding = {
  id: string;
  criterion: string;
  severity: Severity;
  score: number;
  status: "Completo" | "Parcial" | "Faltante";
  observation: string;
  correction: string;
};

export type PrdAnalysis = {
  score: number;
  grade: string;
  title: string;
  wordCount: number;
  findings: PrdFinding[];
  strengths: string[];
  correctedPrd: string;
  observationsDoc: string;
};

export const prdCriteria: PrdCriterion[] = [
  {
    id: "C01",
    name: "Resumen ejecutivo y vision",
    weight: 8,
    required: ["resumen", "vision", "objetivo", "contexto"],
    optional: ["oportunidad", "estrategia", "producto"],
    description: "Explica que se quiere construir, por que ahora y cual es el resultado esperado.",
    recommendation: "Abrir el PRD con una vision clara, problema, oportunidad, alcance y resultado de negocio.",
  },
  {
    id: "C02",
    name: "Problema y usuarios",
    weight: 10,
    required: ["problema", "usuario", "persona", "cliente"],
    optional: ["dolor", "necesidad", "segmento", "job to be done"],
    description: "Define a quien sirve el producto y que dolor concreto resuelve.",
    recommendation: "Incluir segmentos, personas, contexto de uso, frecuencia, dolor y alternativas actuales.",
  },
  {
    id: "C03",
    name: "Objetivos y metricas de exito",
    weight: 10,
    required: ["metrica", "kpi", "exito", "objetivo"],
    optional: ["conversion", "retencion", "activacion", "nps", "north star"],
    description: "Convierte la vision en metas medibles y criterios de impacto.",
    recommendation: "Definir 3 a 5 metricas con baseline, target, ventana de medicion y fuente de datos.",
  },
  {
    id: "C04",
    name: "Alcance, no alcance y restricciones",
    weight: 8,
    required: ["alcance", "fuera de alcance", "restriccion"],
    optional: ["mvp", "fase", "limite", "supuesto"],
    description: "Evita ambiguedad sobre que entra, que no entra y bajo que restricciones se entrega.",
    recommendation: "Separar alcance MVP, post-MVP, no alcance, restricciones tecnicas, legales y de negocio.",
  },
  {
    id: "C05",
    name: "Historias, journeys y casos de uso",
    weight: 10,
    required: ["historia", "journey", "caso de uso", "flujo"],
    optional: ["como usuario", "escenario", "happy path", "edge case"],
    description: "Describe como los usuarios interactuan con el producto de inicio a fin.",
    recommendation: "Documentar happy paths, edge cases, estados vacios, errores, permisos y recuperacion.",
  },
  {
    id: "C06",
    name: "Requisitos funcionales",
    weight: 12,
    required: ["requisito funcional", "debe", "funcionalidad", "feature"],
    optional: ["prioridad", "must", "should", "could", "moscow"],
    description: "Lista capacidades del sistema de forma verificable y priorizada.",
    recommendation: "Escribir requisitos atomicos con ID, prioridad, regla de negocio y dependencia.",
  },
  {
    id: "C07",
    name: "Criterios de aceptacion",
    weight: 10,
    required: ["criterio de aceptacion", "dado", "cuando", "entonces", "aceptacion"],
    optional: ["gherkin", "qa", "test", "validacion"],
    description: "Hace que producto, diseno, desarrollo y QA compartan una definicion de terminado.",
    recommendation: "Agregar Given/When/Then o checklist verificable por cada requisito funcional.",
  },
  {
    id: "C08",
    name: "Requisitos no funcionales",
    weight: 8,
    required: ["performance", "seguridad", "accesibilidad", "disponibilidad"],
    optional: ["latencia", "wcag", "sla", "privacidad", "escalabilidad"],
    description: "Cubre calidad del sistema: rendimiento, seguridad, accesibilidad, datos y confiabilidad.",
    recommendation: "Definir presupuestos: LCP/INP/CLS, WCAG AA, SLA, privacidad, logs y rate limits.",
  },
  {
    id: "C09",
    name: "UX, contenido y diseno",
    weight: 7,
    required: ["ux", "wireframe", "diseno", "contenido"],
    optional: ["copy", "estado vacio", "responsive", "mobile", "prototipo"],
    description: "Alinea experiencia, interaccion, contenido, responsive y estados del producto.",
    recommendation: "Anexar wireframes o links, mapa de estados, copy clave, responsive y criterios de accesibilidad.",
  },
  {
    id: "C10",
    name: "Datos, integraciones y analitica",
    weight: 7,
    required: ["dato", "api", "integracion", "evento", "analytics"],
    optional: ["modelo", "schema", "tracking", "webhook", "endpoint"],
    description: "Define entradas, salidas, modelo de datos, APIs, eventos y medicion.",
    recommendation: "Incluir entidades, contratos API, tracking plan, owners de integraciones y manejo de errores.",
  },
  {
    id: "C11",
    name: "Riesgos, dependencias y decisiones",
    weight: 5,
    required: ["riesgo", "dependencia", "decision", "bloqueador"],
    optional: ["mitigacion", "tradeoff", "supuesto", "adr"],
    description: "Anticipa lo que puede bloquear o degradar la entrega.",
    recommendation: "Crear tabla de riesgos con probabilidad, impacto, mitigacion, owner y fecha de revision.",
  },
  {
    id: "C12",
    name: "Plan de release y operacion",
    weight: 5,
    required: ["release", "lanzamiento", "rollout", "monitoreo"],
    optional: ["rollback", "soporte", "observabilidad", "post-launch"],
    description: "Aterriza como se va a lanzar, medir, operar y revertir si algo falla.",
    recommendation: "Definir estrategia de rollout, QA, go/no-go, rollback, soporte y monitoreo post-lanzamiento.",
  },
];

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function analyzePrd(rawText: string, fileName = "PRD cargado"): PrdAnalysis {
  const text = rawText.trim();
  const normalized = normalize(text);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const title = extractTitle(text, fileName);

  const findings = prdCriteria.map((criterion, index) => {
    const requiredHits = criterion.required.filter((k) => normalized.includes(normalize(k))).length;
    const optionalHits = criterion.optional.filter((k) => normalized.includes(normalize(k))).length;
    const structureBoost = hasSectionLike(text, criterion.name) ? 18 : 0;
    const lengthBoost = wordCount > 900 ? 8 : wordCount > 450 ? 4 : 0;
    const requiredScore = (requiredHits / criterion.required.length) * 58;
    const optionalScore = (optionalHits / Math.max(criterion.optional.length, 1)) * 16;
    const score = Math.min(100, Math.round(requiredScore + optionalScore + structureBoost + lengthBoost));
    const status = score >= 78 ? "Completo" : score >= 42 ? "Parcial" : "Faltante";
    const severity: Severity = score < 42 ? "Alta" : score < 78 ? "Media" : "Baja";

    return {
      id: `PRD-${String(index + 1).padStart(2, "0")}`,
      criterion: criterion.name,
      severity,
      score,
      status,
      observation:
        status === "Completo"
          ? `${criterion.description} La evidencia encontrada es suficiente, aunque puede reforzarse con datos cuantitativos.`
          : status === "Parcial"
            ? `${criterion.description} Hay senales parciales, pero falta precision para que desarrollo, QA y negocio lo ejecuten sin interpretaciones.`
            : `${criterion.description} No se encontro evidencia suficiente en el PRD cargado.`,
      correction: criterion.recommendation,
    } satisfies PrdFinding;
  });

  const weighted = findings.reduce((sum, finding, i) => sum + finding.score * prdCriteria[i].weight, 0);
  const totalWeight = prdCriteria.reduce((sum, c) => sum + c.weight, 0);
  const score = Math.round(weighted / totalWeight);
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const strengths = findings
    .filter((f) => f.score >= 78)
    .slice(0, 5)
    .map((f) => f.criterion);

  return {
    score,
    grade,
    title,
    wordCount,
    findings,
    strengths,
    correctedPrd: buildCorrectedPrd(title, text, findings),
    observationsDoc: buildObservationsDoc(title, score, grade, findings),
  };
}

function extractTitle(text: string, fileName: string) {
  const mdTitle = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (mdTitle) return mdTitle;
  const firstLine = text.split("\n").find((line) => line.trim().length > 8 && line.trim().length < 90);
  return firstLine?.trim() ?? fileName.replace(/\.(md|markdown|pdf|txt)$/i, "");
}

function hasSectionLike(text: string, section: string) {
  const normalizedText = normalize(text);
  const tokens = normalize(section).split(/\s+/).filter((token) => token.length > 4);
  return tokens.some((token) => new RegExp(`(^|\\n)#{0,6}\\s*[^\\n]*${token}`, "i").test(normalizedText));
}

function buildCorrectedPrd(title: string, original: string, findings: PrdFinding[]) {
  const missing = findings.filter((f) => f.status !== "Completo");
  const excerpt = original.slice(0, 900).replace(/\n{3,}/g, "\n\n");
  return `# PRD corregido - ${title}

> Documento generado automaticamente como version base corregida. Requiere validacion de Product, Design, Engineering, QA, Data y Security antes de considerarse fuente de verdad.

## 1. Resumen ejecutivo

### Vision
[Completar: describir en 2 a 4 lineas que producto se construye, para quien y que cambio medible debe producir.]

### Contexto
${excerpt || "[Completar con contexto del documento original.]"}

### Problema principal
[Completar: definir dolor, frecuencia, impacto economico/operativo y alternativa actual.]

### Resultado esperado
[Completar: explicar el resultado de negocio y experiencia que se espera lograr.]

## 2. Usuarios y personas

| Persona | Necesidad | Dolor | Frecuencia | Criterio de valor |
|---|---|---|---|---|
| Usuario primario | [Completar] | [Completar] | [Completar] | [Completar] |
| Usuario secundario | [Completar] | [Completar] | [Completar] | [Completar] |

## 3. Objetivos y metricas de exito

| Objetivo | Metrica | Baseline | Target | Fuente | Ventana |
|---|---:|---:|---:|---|---|
| Activacion | [KPI] | [Actual] | [Meta] | [Analytics] | [30 dias] |
| Calidad | [KPI] | [Actual] | [Meta] | [QA/Logs] | [Release] |
| Retencion/uso | [KPI] | [Actual] | [Meta] | [Analytics] | [60 dias] |

## 4. Alcance

### MVP
- [Completar requisito MVP 1]
- [Completar requisito MVP 2]
- [Completar requisito MVP 3]

### Fuera de alcance
- [Completar elementos explicitamente excluidos]

### Restricciones
- Tecnicas: [Completar]
- Legales/compliance: [Completar]
- Tiempo/presupuesto: [Completar]

## 5. Historias de usuario y journeys

### Journey principal
1. Usuario descubre o accede a la funcionalidad.
2. Usuario completa el flujo principal.
3. Sistema confirma resultado y registra eventos.
4. Usuario puede recuperar, corregir o cancelar si algo falla.

### Historias
- Como [persona], quiero [accion], para [beneficio].
- Como [persona], quiero [accion], para [beneficio].

## 6. Requisitos funcionales

| ID | Requisito | Prioridad | Regla de negocio | Dependencia |
|---|---|---|---|---|
| RF-001 | [Completar] | Must | [Completar] | [Completar] |
| RF-002 | [Completar] | Should | [Completar] | [Completar] |
| RF-003 | [Completar] | Could | [Completar] | [Completar] |

## 7. Criterios de aceptacion

### RF-001
- Dado [contexto], cuando [accion], entonces [resultado verificable].
- Dado [estado de error], cuando [accion], entonces [recuperacion o mensaje].

## 8. Requisitos no funcionales

| Dimension | Requisito | Target |
|---|---|---|
| Performance | LCP, INP y CLS dentro de Core Web Vitals | LCP < 2.5s, INP < 200ms, CLS < 0.1 |
| Accesibilidad | Cumplimiento WCAG | AA |
| Seguridad | Validacion, permisos y proteccion de datos | Definir modelo |
| Disponibilidad | Operacion estable | SLA por definir |

## 9. UX, contenido y diseno

- Wireframes/prototipo: [Link]
- Estados: loading, empty, error, success, disabled.
- Responsive: mobile, tablet, desktop.
- Copy critico: mensajes de error, confirmacion y ayuda.

## 10. Datos, integraciones y analitica

| Elemento | Descripcion | Owner |
|---|---|---|
| Modelo de datos | [Completar entidades y campos] | Engineering |
| API/Integracion | [Completar contrato] | Engineering |
| Eventos analytics | [Completar tracking plan] | Data/Product |

## 11. Riesgos y dependencias

| Riesgo | Probabilidad | Impacto | Mitigacion | Owner |
|---|---|---|---|---|
| [Completar] | Media | Alta | [Completar] | [Owner] |

## 12. Plan de release

- QA: [Plan]
- Rollout: [Feature flag, beta o gradual]
- Go/No-Go: [Criterios]
- Rollback: [Plan]
- Monitoreo post-release: [Dashboards y alertas]

## 13. Observaciones incorporadas
${missing.map((f) => `- ${f.id}: ${f.correction}`).join("\n") || "- El PRD ya cubria la mayoria de criterios de forma suficiente."}
`;
}

function buildObservationsDoc(title: string, score: number, grade: string, findings: PrdFinding[]) {
  const high = findings.filter((f) => f.severity === "Alta");
  const medium = findings.filter((f) => f.severity === "Media");
  return `# Observaciones y correcciones para llegar al 100% - ${title}

## Resultado ejecutivo

- Score actual: ${score}/100
- Nota: ${grade}
- Hallazgos de severidad Alta: ${high.length}
- Hallazgos de severidad Media: ${medium.length}

## Regla para llegar al 100%

El PRD debe permitir que Product, Design, Engineering, QA, Data y Security puedan ejecutar sin reuniones adicionales para aclarar alcance, prioridad, aceptacion, riesgos o medicion.

## Observaciones priorizadas

${findings
  .map(
    (f) => `### ${f.id} - ${f.criterion}

- Severidad: ${f.severity}
- Score: ${f.score}/100
- Estado: ${f.status}
- Observacion: ${f.observation}
- Correccion requerida: ${f.correction}
`
  )
  .join("\n")}

## Checklist final de 100%

- Cada requisito funcional tiene ID, prioridad, regla de negocio y dependencia.
- Cada requisito tiene criterios de aceptacion verificables.
- Existen metricas con baseline, target, fuente y ventana.
- El alcance y el fuera de alcance estan explicitamente separados.
- Hay user journeys con happy path, edge cases, errores y permisos.
- Los requisitos no funcionales cubren performance, seguridad, accesibilidad, privacidad y disponibilidad.
- El tracking plan define eventos, propiedades, owners y destino.
- Riesgos y dependencias tienen owner, impacto, probabilidad y mitigacion.
- El plan de release incluye QA, rollout, go/no-go, rollback y monitoreo.
- El documento tiene owners, fecha, version y aprobadores.
`;
}

export function downloadMarkdown(fileName: string, content: string) {
  const safeName = (fileName || "documento.md")
    .replace(/[^\w\-\.\u00C0-\u017F]+/g, "-")
    .replace(/^-+|-+$/g, "") || "documento.md";
  const blob = new Blob(["\uFEFF", content], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  a.rel = "noopener";
  a.style.position = "fixed";
  a.style.left = "-9999px";
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 250);
}

export function downloadPdf(fileName: string, content: string) {
  const safeName = (fileName || "documento.pdf")
    .replace(/\.md$/i, ".pdf")
    .replace(/[^\w\-\.\u00C0-\u017F]+/g, "-")
    .replace(/^-+|-+$/g, "") || "documento.pdf";
  const blob = new Blob([content], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  a.rel = "noopener";
  a.style.position = "fixed";
  a.style.left = "-9999px";
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 250);
}