# Architecture/integration feasibility fidelity

De-risking: _can a new subsystem integrate with the app's real state/actions, and is the design provider-swappable/extensible the way we're claiming?_
Reference precedent: PR #3673, "mockup: add AI map assistant" (branch `feat/ai-agent-poc`).

## The real/fake split — the core technique

This strategy is a deliberate split between:

-   **The "hands" — 100% real.** Whatever dispatches into the existing app must dispatch the _actual_ actions/reducers a normal user interaction would trigger. Precedent: `src/ai/tools/*.js` (e.g. `addThematicLayer.js`, `updateLayer.js`, `removeLayer.js`) call real Redux action creators — an AI-built layer is an ordinary layer the user can then edit or delete by hand, not a parallel shadow object.
-   **The "brain" — explicitly faked, and say so in a comment.** Whatever part is expensive, slow, non-deterministic, or otherwise unsuitable for a live demo gets a deterministic stand-in with a code comment stating exactly what it's replacing and why. Precedent, verbatim from `src/ai/connectors/demo.js`:

    > Deterministic demo connector — implements LLMConnector without calling any model. Matches user input against DEMO_SCRIPTS and returns scripted tool calls one at a time. The real resolver tools and executor run against the live DHIS2 instance; only the "LLM reasoning" step is replaced by this fixed plan.

    Don't skip the comment — it's what makes the fake honest to the next person reading the code, and it's what lets a stakeholder demo run without depending on API keys, cost, or model non-determinism.

-   If the point being proven is "this design is swappable across providers/backends," build **more than one real implementation** of the swappable part to prove it, alongside the one demo-safe fake. Precedent: `src/ai/connectors/anthropic.js` and `openaiCompatible.js` are both real, working API-call implementations sitting next to `demo.js`.

## Feature-flag the entry point

New UI lives behind an `isEnabled()`-style check, not a config-file flag — precedent: `src/ai/ui/AssistantPanel.jsx` exports `isEnabled = () => window.__DHIS2_AI_ASSISTANT__ === true || localStorage.getItem(FEATURE_FLAG) === 'true' || process.env.NODE_ENV === 'development'`. This keeps the mockup invisible in production builds while still trivially reachable for a stakeholder demo (dev mode, or a `localStorage` toggle to flip on in a deployed preview).

## Design principles before "what"

If the mockup is validating an architectural stance (e.g. data minimization, vendor-swappability, security boundary), lead the PR body with that architecture prose _before_ the feature description — precedent: #3673's body states its two governing principles (customer controls what leaves their server; no vendor lock-in) before describing what was actually built. Stakeholders reviewing an architecture mockup are evaluating the stance, not just the demo.

## Commit shape

Can be coarse — precedent: #3673 has only two commits, both plain `feat: ...`, no special mockup prefix. The granularity signal that matters for the algorithmic strategy doesn't apply here; what matters is the real/fake split being clean and well-commented.

## No ticket required

This strategy is a legitimate way to validate a **not-yet-ticketed** direction — precedent: #3673 references no Jira ticket anywhere. Don't insist on one.
