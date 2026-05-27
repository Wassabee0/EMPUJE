# Reusable Project Docs System Template

Status: generic template extracted from the LECT docs workflow.

Use this when a project needs durable documentation that can guide humans,
agents, implementation, audits, and owner acceptance without becoming a flat
pile of numbered notes.

This template works whether the project has source mines, prototypes, old apps,
design files, research notes, or none of those.

## Core Idea

Separate docs by job:

- **Meta** explains how the docs system works.
- **Foundation** explains what the project is and why.
- **Contracts** bind implementation decisions.
- **Delivery** decides active order, completed work, and manual acceptance.
- **Audits** compare reality to the desired state.
- **Archive** stores useful history that is no longer current authority.

Do not organize primarily by chronology. Chronology is useful for traceability;
it is not a navigation system.

## Folder Skeleton

```txt
docs/
  README.md
  AGENTS.md                         optional, if agents or contributors need binding rules

  00-meta/
    00-docs-inventory.md
    reusable-docs-system-template.md

  01-foundation/
    product-brief.md
    architecture-overview.md
    open-decisions.md
    source-inventory.md             optional, if prototypes/source mines exist

  02-contracts/
    storage-contract.md             optional
    navigation-contract.md          optional
    module-contract.md              optional
    privacy-security-contract.md    optional
    domain-name-contract.md

  03-delivery/
    README.md
    00-current/
      active-roadmap.md
      active-scope.md               optional
    10-completed-slices/
      completed-slice-name.md
    20-owner-checklists/
      README.md
      TEMPLATE.md
      module-or-screen-name.md
    90-history/
      superseded-plan-name.md

  04-audits/
    implementation-audit.md
    visual-or-product-audit.md
    source-mine-audit.md            optional

  99-archive/
    transcript-or-analysis.md
```

Minimal version for a smaller project:

```txt
docs/
  README.md
  00-meta/00-docs-inventory.md
  01-foundation/product-brief.md
  02-contracts/
  03-delivery/README.md
  03-delivery/00-current/active-roadmap.md
  03-delivery/20-owner-checklists/TEMPLATE.md
  04-audits/
  99-archive/
```

## Root README Template

```md
# <Project> Docs

This folder is the living source of truth for <project>.

## Start Here

1. `00-meta/00-docs-inventory.md`
2. `01-foundation/product-brief.md`
3. `01-foundation/architecture-overview.md`
4. `03-delivery/README.md`
5. `03-delivery/00-current/active-roadmap.md`

## Folder Map

| Folder | Purpose |
| --- | --- |
| `00-meta/` | Doc inventory, taxonomy, process, templates. |
| `01-foundation/` | Product, architecture, decisions, source inventory. |
| `02-contracts/` | Binding implementation contracts. |
| `03-delivery/` | Active roadmap drivers, completed slices, owner checklists, history. |
| `04-audits/` | Audits, triage, comparison reports. |
| `99-archive/` | Historical notes no longer treated as current authority. |

## Source Hierarchy

When sources disagree:

1. `docs/` contracts and closed decisions win.
2. Current prototypes/designs/product references win for product shape.
3. Source mines or old apps are read-only context.
4. Current implementation follows the docs.

For projects without source mines, remove item 3.

## Documentation Rules

- Do not add random root-level docs.
- New contracts go in `02-contracts/`.
- Active roadmap/scope drivers go in `03-delivery/00-current/`.
- Owner/manual acceptance checklists go in `03-delivery/20-owner-checklists/`.
- Completed implementation slices go in `03-delivery/10-completed-slices/`.
- Superseded planning notes go in `03-delivery/90-history/`.
- Audits and comparisons go in `04-audits/`.
- Long transcripts and generated analysis go in `99-archive/`.
- Update `00-meta/00-docs-inventory.md` whenever docs move or new docs appear.
```

## Inventory Template

```md
# Docs Inventory And Audit

Status: first docs-system audit, <date>.

## Folder Taxonomy

| Folder | Owns | Add new docs here when |
| --- | --- | --- |
| `00-meta/` | Inventory, process, templates. | The docs system changes. |
| `01-foundation/` | Product and architecture truth. | The global story or decision set changes. |
| `02-contracts/` | Binding implementation contracts. | Code needs a stable contract. |
| `03-delivery/` | Work order, slices, owner acceptance. | Active scope or delivery state changes. |
| `04-audits/` | Audits and comparisons. | Reality must be inspected before deciding. |
| `99-archive/` | Historical artifacts. | Useful history is no longer current authority. |

## Current Root Files

| Path | Role |
| --- | --- |
| `README.md` | Entry point and folder map. |
| `AGENTS.md` | Optional binding agent/contributor guide. |

## Meta

| Path | Role |
| --- | --- |
| `00-meta/00-docs-inventory.md` | Complete doc map and maintenance checklist. |
| `00-meta/reusable-docs-system-template.md` | Template for reusing this docs system elsewhere. |

## Foundation

| Path | Role |
| --- | --- |
| `01-foundation/product-brief.md` | Product summary. |
| `01-foundation/architecture-overview.md` | Architecture and boundaries. |
| `01-foundation/open-decisions.md` | Open and closed decisions. |
| `01-foundation/source-inventory.md` | Optional source/prototype/source-mine inventory. |

## Contracts

| Path | Role |
| --- | --- |
| `02-contracts/<domain>-contract.md` | Binding domain rules. |

## Delivery

### Current Drivers

| Path | Role |
| --- | --- |
| `03-delivery/README.md` | Delivery folder map and rules. |
| `03-delivery/00-current/active-roadmap.md` | Current delivery order. |

### Owner Checklists

| Path | Role |
| --- | --- |
| `03-delivery/20-owner-checklists/README.md` | Manual acceptance rules. |
| `03-delivery/20-owner-checklists/TEMPLATE.md` | Checklist template. |

### Completed Slices

| Path | Role |
| --- | --- |
| `03-delivery/10-completed-slices/<slice>.md` | Closed implementation slice. |

### Delivery History

| Path | Role |
| --- | --- |
| `03-delivery/90-history/<plan>.md` | Superseded planning note. |

## Audits

| Path | Role |
| --- | --- |
| `04-audits/<audit>.md` | Audit or comparison report. |

## Archive

| Path | Role |
| --- | --- |
| `99-archive/<artifact>.md` | Historical transcript or analysis. |

## Maintenance Checklist

- [ ] New docs are added to the right folder, not root.
- [ ] New docs are listed in this inventory.
- [ ] Active delivery docs live in `03-delivery/00-current/`.
- [ ] Owner acceptance checklists live in `03-delivery/20-owner-checklists/`.
- [ ] Completed slices move to `03-delivery/10-completed-slices/`.
- [ ] Superseded planning notes move to `03-delivery/90-history/`.
- [ ] References are updated when docs move.
- [ ] Agent/contributor rules are updated when behavior changes.
```

## Delivery README Template

```md
# Delivery Docs

This folder owns work order: what is active, what shipped, what needs manual
acceptance, and what is only historical.

## Current Drivers

| Path | Role |
| --- | --- |
| `00-current/active-roadmap.md` | Product-level route for current work. |
| `00-current/active-scope.md` | Optional active scope or recode plan. |

## Owner Checklists

| Path | Role |
| --- | --- |
| `20-owner-checklists/README.md` | Manual acceptance rules. |
| `20-owner-checklists/TEMPLATE.md` | Template for new module/screen checklists. |

## Completed Slices

| Path | Role |
| --- | --- |
| `10-completed-slices/<slice>.md` | Closed implementation slice. |

## History

| Path | Role |
| --- | --- |
| `90-history/<plan>.md` | Superseded planning note. |

## Rules

- Active roadmap drivers live in `00-current/`.
- Owner/manual acceptance checklists live in `20-owner-checklists/`.
- Completed implementation slices move to `10-completed-slices/`.
- Superseded planning notes move to `90-history/`.
- New files use semantic names, not the next available number.
```

## Owner Checklist Template

```md
# <Module Or Screen> Owner Checklist

Status: owner-controlled checklist. Do not treat this surface as finished until
the owner explicitly marks the finish gate as done.

Scope:

- <Included module/screen/states.>
- <Explicit exclusions or defers.>

Source references:

- Prototype/design: `<path or none>`
- Contract: `<path>`
- Audit/roadmap: `<path>`
- Completed slices: `<path>`

## Finish Gate

- [ ] Owner says this surface is finished.
- [ ] Every state has a source, audit note, or explicit defer decision.
- [ ] Visual comparison is done where relevant.
- [ ] Copy, tone, IA, route labels, empty states, and navigation are accepted.
- [ ] Live-looking behavior is real or clearly marked visual/deferred.
- [ ] Data ownership and storage match the relevant contract.
- [ ] Privacy, analytics, sync, AI, billing, notifications, or other sensitive
  behaviors are unchanged unless explicitly in scope.
- [ ] Remaining work is moved to a new checklist, completed slice, or defer
  decision.

## Implemented First Passes

- [ ] <Exists in code, needs owner acceptance.>

## Open Owner Decisions

- [ ] <Question the owner must answer.>

## Screen/State Checks

### <Screen Or State>

- [ ] Source checked.
- [ ] Main path accepted.
- [ ] Empty/error/deferred state accepted.
- [ ] Copy accepted.
- [ ] Navigation in/out accepted.

## Add New Findings Here

- [ ]
```

## Optional Source Mine Pattern

Use this only when the project has old code, prototypes, design exports,
research notes, or another app used for inspiration.

Recommended folder:

```txt
source-mine/
  README.md
  source-mine-index.md
  prototypes/
  old-app/
  reference-app/
```

Rules:

- Source mines are read-only.
- Current docs decide what is binding.
- Prototypes/designs decide product shape only when marked current.
- Old code can clarify behavior but should not decide architecture by itself.
- If a mined idea changes scope, data ownership, or product promise, update a
  contract or delivery doc before implementation.

For projects without source mines, replace the source hierarchy with:

```md
When sources disagree:

1. `docs/` contracts and closed decisions win.
2. Current implementation follows the docs.
3. New decisions are written down before code depends on them.
```

## Adoption Steps

1. Create the folder skeleton.
2. Write `README.md` and `00-meta/00-docs-inventory.md` first.
3. Add only the foundation docs needed to explain the project.
4. Add contracts only when implementation needs a stable rule.
5. Add delivery docs for active work, not for every idea.
6. Add owner checklists when manual acceptance matters.
7. Move completed and superseded docs out of active folders quickly.
8. Keep the inventory honest; stale navigation is the first sign of docs rot.
