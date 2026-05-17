# Module Boundaries

This app is a modular monolith. Each business capability should own its schema-facing services, validation, server actions, and UI fragments inside `src/modules/<module>`.

Keep cross-module coordination in explicit application services instead of importing data access helpers across domains. That keeps the hackathon code fast to ship while leaving a credible path to split modules later if needed.
