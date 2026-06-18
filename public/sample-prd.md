# Plataforma de Evaluacion de PRD

## Problema
Equipos de producto pierden 2 a 4 sprints por iterar sobre especificaciones ambigüas.

## Usuarios
- Product Manager: necesita alinear vision, metricas y requisitos.
- Ingeniero de software: requiere criterios de aceptacion verificables.
- Diseñador: busca wireframes y estados explícitos.

## Objetivo
Crear una herramienta web que reciba un PRD en Markdown o PDF, lo audite automaticamente y genere:
- Score ejecutivo
- Observaciones y correcciones
- PRD corregido reutilizable

## Metricas de exito
- Score >= 90 en PRDs auditados.
- Reducción de 40% en preguntas post-sprint planning.
- 100% de requisitos con criterios de aceptacion.

## Alcance
- MVP: upload, parseo, scoring, descarga.
- No incluye: edición online ni colaboración en tiempo real.

## Historias
Como PM, quiero subir mi PRD y recibir feedback inmediato.

## Requisitos funcionales
- RF-001: Upload de archivos .md y .pdf.
- RF-002: Scoring 0-100 con matriz de 12 criterios.

## Criterios de aceptacion
Dado un PRD con al menos 120 palabras, cuando lo subo, entonces veo score y observaciones.

## Requisitos no funcionales
- Performance: LCP < 2.5s.
- Accesibilidad: WCAG AA.