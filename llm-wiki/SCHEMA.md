# Wiki Schema

Per-project conventions. LLM proposes changes; user approves. Co-evolves
with the wiki.

## Domain

The Knowledge Base for **Dungeon Haul**, a multiplayer sidescroller. It captures architectural decisions, gameplay rules, interface contracts, and implementation plans. The goal is to provide a single source of truth for AI agents and developers to ensure consistency between simulation (server) and presentation (client).

## Source buckets

- `design/` — Design documents and product freezes
- `architecture/` — Technical architecture and tech stack
- `interfaces/` — API contracts, protocol messages, data formats
- `components/` — Component-specific designs and task lists
- `art/` — Asset specs and aesthetic briefs
- `testing/` — Strategy and test plans
- `decisions/` — ADRs and frozen decisions


## Topic taxonomy

By subject, not by kind. New topics need user approval.

- `<topic>/` — <description>

## Page types

- `concept`, `decision`, `bug`, `open-question`, `source`, `reference`, `synthesis`, `stub` — see SKILL.md.
- Concept variants (taxonomy, implementation walkthrough) — see `quality.md`. Not new types; just shapes a `concept` may take.

## Lint rules

- Stale-claim threshold: 30 days.
- Required tags: list canonical set if used.
- Relative path verification: every `](*.md)` link must resolve from the file's directory.
- Bidirectional links: if page A links to page B, page B must link back.
- Tag presence: warn if `tags:` is missing on pages >100 lines.

## Notes

<!-- Domain quirks, term glossary, in-flight reorganizations. -->
