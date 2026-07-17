---
name: docs-update
description: Use when a code change is user-facing and maps-app's published documentation (docs/src/*.md -> docs/maps.md) may need updating — maps the feature area to the right docs/src file and dispatches the docs-writer subagent to draft the prose and rebuild.
---

# Docs update

Keeps `docs/src/*.md` → `docs/maps.md` in sync with a user-facing code change. Advisory, not a gate — no CI enforces this, and not every change needs it (historically only ~24% of `feat`/`fix` commits touch `docs/` at all). Use judgment about whether a given change is even docs-relevant.

## Feature-area → file mapping

| Feature area                       | `docs/src/` file                      |
| ---------------------------------- | ------------------------------------- |
| Thematic layers                    | `04-thematic-layer.md`                |
| Event layers                       | `05-event-layer.md`                   |
| Tracked entity layers              | `06-tracked-entity-layer.md`          |
| Facility layers                    | `07-facility-layer.md`                |
| Org unit layers                    | `08-org-unit-layer.md`                |
| Earth Engine layers                | `09-earth-engine-layer.md`            |
| External map layers                | `10-external-map-layers.md`           |
| Org unit profile                   | `11-org-unit-profile.md`              |
| File menu                          | `12-file-menu.md`                     |
| Interpretations                    | `13-interpretations.md`               |
| Image export                       | `14-image-export.md`                  |
| Search                             | `15-search.md`                        |
| Measure distance                   | `16-measure-distance.md`              |
| Admin-only features                | `18-administrator.md`                 |
| General create-map flow / basemaps | `02-create-map.md` / `03-basemaps.md` |

## Flow

1. Identify the affected file(s) from the table above.
2. Dispatch the **`docs-writer`** subagent with the feature description and affected file(s) — its job is drafting the prose (matching the existing `> **Note**` callout and heading-ID conventions) and running `yarn docs:build` to regenerate `docs/maps.md`.
3. Review the diff (both the `docs/src/*.md` edit and the regenerated `docs/maps.md`) before it's committed — still gated by `CLAUDE.md`'s "don't stage or commit unless explicitly asked."
4. Commit the source edit and the regenerated `docs/maps.md` together, in the same commit/PR as the feature — this is the dominant real historical pattern, not a separate docs follow-up.

## Screenshots

If the change alters something shown in an existing screenshot, flag it ("this may need recapturing") rather than fabricating a new image — real docs screenshots are actual app captures, never synthesized.

## Related

-   `commit-and-pr-messages` — the "Docs added" Quality-checklist item this skill helps make honestly checkable.
