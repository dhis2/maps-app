---
name: dhis2-web-api-research
description: Use when writing or modifying code that calls the DHIS2 Web API (analytics, geoFeatures, tracker, metadata endpoints) and the exact request/response shape is unclear. Prevents guessing/hallucinating API fields.
---

# DHIS2 Web API research

Don't guess field names or response shapes from memory — DHIS2's API surface is large and versioned. Work through these tiers, cheapest first, stopping as soon as you have enough certainty.

| Scenario                                                              | Do this                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Need the shape of a specific endpoint/resource                        | Tier 1: fetch the scoped OpenAPI spec                                                                                                                                                                                                                                                                                                             |
| Need to see real data (pagination, actual field values, edge cases)   | Tier 2: probe a live instance                                                                                                                                                                                                                                                                                                                     |
| OpenAPI spec is ambiguous or you need to understand server-side logic | Tier 3: read the DHIS2 backend source                                                                                                                                                                                                                                                                                                             |
| Just need to know which endpoints this app already calls              | See `d2.config.js`'s `omitPatterns` list at repo root — it's a ready-made inventory: `geoFeatures`, `analytics`, `tracker/trackedEntities`, `organisationUnitGroupSets`, `dataElements`, `trackedEntityAttributes`, `optionSets`, `legendSets`, `programs`, `programStages`, `trackedEntityTypes`, `relationshipTypes`, `organisationUnitLevels`. |

## Tier 1 — OpenAPI spec (cheapest)

Fetch the spec scoped to the resource you care about via `curl`, not the whole multi-MB spec. Read only the relevant schema/paths.

## Tier 2 — Probe a live instance

GET-only, against a dev/test instance only (never write). Paginate — don't pull whole collections. Good for confirming actual field values and edge cases the spec doesn't show.

## Tier 3 — Read the backend source

When the spec is ambiguous or you need server-side validation/business logic:

```
npx opensrc dhis2/dhis2-core --modify
```

This clones the DHIS2 backend Java source into a gitignored `./opensrc/` directory. The codebase is large — use an Explore subagent to search it rather than reading broadly yourself.

## Troubleshooting

-   **`opensrc` clone already exists and looks stale** — re-run with `--modify` to refresh, or check the pinned DHIS2 version this app targets (`minDHIS2Version` in `d2.config.js`) against what you cloned.
-   **Live probe returns 401/403** — you're likely pointed at a non-dev instance or missing `cypress.env.json` credentials; don't escalate to write attempts to work around this.
