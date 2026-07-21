# Per-Component TEST-PLAN Approach (Skeleton)

> **Status:** Skeleton / process note.  
> **Follow-up:** Each component fills `docs/components/C-XX-*/TEST-PLAN.md` as design deep-dives land.  
> **Global strategy:** [AUTOMATED-TEST-STRATEGY.md](AUTOMATED-TEST-STRATEGY.md)  
> **Cross-cutting:** [INTEGRATION-TEST-PLAN.md](INTEGRATION-TEST-PLAN.md), [SYSTEM-TEST-PLAN.md](SYSTEM-TEST-PLAN.md), [HUMAN-PLAYTEST-PLAN.md](HUMAN-PLAYTEST-PLAN.md)

---

## 1. Why per-component plans

[COMPONENTS.md](../COMPONENTS.md) splits work across SE-1..SE-8. Global test docs define **layers and cross-component scenarios**. Per-component `TEST-PLAN.md` files own:

- Unit-level cases for that boundary  
- Mocks/fakes needed to develop in isolation  
- Definition of done for the component’s test debt  
- Links to interfaces the component must honor  

At architecture time, `docs/components/` had **no design folders yet**. Stubs are created so follow-up agents/engineers have a home without inventing structure ad hoc.

---

## 2. Folder convention

Component deep-dives live under **name-based** folders (aligned with DESIGN/TASKS from SE tracks):

```text
docs/components/
  client-shell/       # C-01
    DESIGN.md
    TASKS.md
    TEST-PLAN.md      ← stub; expand with unit cases
  presentation/       # C-02
  input-mapper/       # C-03
  netcode-client/     # C-04
  lobby-session/      # C-05
  simulation/         # C-06
  rules-engine/       # C-07
  ai-controller/      # C-08
  level-loader/       # C-09
  fork-vote/          # C-10
  end-screen/         # C-11
  high-scores/        # C-12
  audio-director/     # C-13
  telemetry/          # C-14
```

IDs (C-01…) remain the catalog keys in [COMPONENTS.md](../COMPONENTS.md); folder names are stable for paths.

---

## 3. Template (every TEST-PLAN.md should grow into)

```markdown
# C-XX — <Name> — Test Plan

## Scope
Responsibilities under test / out of scope (mirror COMPONENTS.md).

## Interfaces consumed & produced
Links to docs/interfaces/* .

## Unit tests
Table: case id | setup | expect | priority

## Integration hooks
Which INT-* / SYS-* scenarios this component must not break.

## Fixtures & fakes
Snapshots, input tapes, PNG maps, tokens, etc.

## Determinism / flaky notes
Seeds, time, network.

## Coverage pragmatism
What % or which critical paths; what is manual-only.

## Exit criteria
Checklist before component “done” for current phase (P0–P5).

## Open risks
```

---

## 4. Ownership

| Component | Test-plan owner cluster |
|---|---|
| C-01, C-11 | SE-1 |
| C-02 | SE-2 |
| C-03, C-04 | SE-3 |
| C-05, C-12 | SE-4 |
| C-06, C-10 | SE-5 |
| C-07 | SE-6 |
| C-09 | SE-7 |
| C-08, C-13, C-14 | SE-8 |

Global test architect (or SE-5/SE-6) reviews stubs for consistency with freezes: private codes, desktop, 960×540, no accounts, no global pause, `levelsAfterHoard=2`, soft-unique chars.

---

## 5. Fill order (recommended)

1. **C-07 Rules** — pure unit matrix (unblocks G2)  
2. **C-09 Levels** — parser fixtures  
3. **C-06 Sim** — headless tapes  
4. **C-05 / C-04** — lobby + net client  
5. **C-10 Fork**, **C-08 AI**  
6. **C-12 Scores**  
7. **C-01 / C-11 / C-02** — shell & presentation (Playwright + manual)  
8. **C-03, C-13, C-14** — thinner plans  

---

## 6. Stub status

Initial stubs under `docs/components/*/TEST-PLAN.md` contain:

- Component id/name and owner cluster  
- Pointer to global testing docs  
- Priority case tables (to expand)  
- Exit criteria sketches  

They are **not** complete test specifications until the owning SE expands them against DESIGN.md.
