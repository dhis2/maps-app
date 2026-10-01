# Algorithmic/statistical feasibility fidelity

De-risking: _does the actual calculation work, and hold up on real data?_
Reference precedent: PR #3684, "mockup: spatial hotspot analysis for thematic layers" (branch `feat/spatial-analysis`).

## What's real

-   The algorithm itself, in full — not a stub. Precedent: 675-line `src/util/spatialStats.js` implementing real Getis-Ord Gi\*/Local Moran's I statistics, with a 456-line Jest spec actually exercising the math.
-   Wiring into the **real production pipeline** — precedent: `getGiStar`/`getLisa` called directly from `src/loaders/thematicLoader.js`, not from a side path.
-   New UI reuses real `core/` field-wrapper components, real Redux actions/reducers, and the existing dialog's CSS module — this strategy isn't about faking UI plumbing, only about proving the calculation.
-   A genuinely new runtime dependency if the algorithm needs one — precedent: `@turf/distance` added to `package.json`/`yarn.lock` for real, not vendored or copy-pasted.

## What makes it safe to merge-adjacent-but-not-merge

-   **Gate the entire feature behind a new config flag** so existing saved maps/configs are provably unaffected — precedent: `config.spatialAnalysis?.method` checked in `thematicLoader.js` before any of the new code path runs. Pick a flag name scoped to the feature, not a generic `experimental` toggle.

## Commit shape

Granular, iterative, real conventional commits as the algorithm gets built and debugged — precedent: `feat(spatialStats): implement ... with tests`, `fix(lint): resolve eslint errors across spatial analysis files`, `fix(spatialStats): fix undefined color palette crash`, `refactor(ui): align Analysis tab with the rest of the layer edit dialog`. Don't squash this history — the granularity is itself evidence the algorithm was iterated on and debugged for real, which is the whole point of this fidelity strategy.

## PR body notes

Explicitly frame the PR as a proof-of-concept for a first slice of a larger piece of work, and **name the follow-ups that are deliberately out of scope** (precedent: heatmap/DBSCAN clustering, multidimensional thematic maps named as future work, not built here). This is what lets reviewers calibrate how much rigor to expect from _this_ PR specifically.
