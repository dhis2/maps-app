# UI/UX & information-architecture fidelity

De-risking: _will this layout/workflow/navigation make sense to users?_
Reference precedent: PR #3655, "mockup: sources catalogue" (branch `mockup/DHIS2-21453`).

## What to fake

-   **All data.** Write a hand-authored `mock<Thing>.js` module (precedent: `src/components/layerSources/mockCatalogueSources.js`, 753 lines of realistic-looking static data) that the component imports directly.
-   **All state that would normally be Redux.** Use local `useState` inside the component (precedent: `ManageLayerSourcesModal.jsx` holds catalogue/search/filter state locally) — do not add reducers, action types, or thunks. There is no real data plumbing in this strategy, by design.
-   Persistence, favorites, "saved" state, etc. — a second mock module playing the role of a store is fine (precedent: `mockFavoritesStore.js`, 27 lines).

## What stays real

-   `@dhis2/ui` components and this repo's real `core/` field-wrapper components for every widget — a UI/UX mockup is specifically about how _these_ components compose, so faking them defeats the purpose.
-   Colocated `ComponentName.module.css` per component, same as production code.
-   `i18n.t()` for every string — stakeholders and translators alike should see the real strings.
-   Correct file placement under `src/components/<feature>/`.

## Expect, and don't chase

-   A high SonarQube issue count (precedent: 88 issues incl. 13 "bugs" on #3655) — consistent with fast, disposable code, and fine here.
-   No Jest coverage of the mock data path is expected or needed.

## Commit shape

Can legitimately be a single squashed commit (precedent: #3655 shipped as one commit, `mockup: add layer, layer sources, add layer source`) — this strategy doesn't need the granular history the algorithmic strategy does, since there's no real logic under test to bisect later.

## PR body notes

Screenshots are the natural fit for this strategy (there's a UI to show), but are not mandatory — #3655 shipped with none, leaning entirely on the live Netlify preview link instead. Either is fine.
