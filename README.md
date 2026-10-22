# FoundationKit

A small React + TypeScript front-end platform library: reusable Button, TextField,
and Notice components, shared CSS tokens, and an access-request form demonstrating
composition. Built as a portfolio project, not a 1Password product or integration.

## Run

Node 22+, then `npm ci`, `npm test`, and `npm run build`.
Import components from `src/index.tsx` and styles from `src/styles.css` in a consuming
bundler. The TypeScript build emits ESM and declarations; stylesheet remains a
separate source asset. No network calls, credential storage or analytics.

## Usage guidelines and design specification

- Button: primary for the main action, secondary for alternatives. Default type is
  button to avoid accidental form submission. Explicitly use submit within forms.
  Loading preserves the action label, marks busy state and disables activation.
- TextField: always provide a visible label. Help text describes format before
  entry; errors explain recovery and are associated through aria-describedby.
  Required fields use native required semantics. Callers own validation, focus on
  error, and server-side validation. Never rely on color alone to convey an error.
- Notice: info uses polite status semantics; error uses alert. Do not repeatedly
  mount alerts on every keystroke. Use concise actionable text.
- Tokens: 8px base spacing, 6px radius, 44px button minimum height, visible 3px
  keyboard-focus outline. Text #172033, primary #1746a2, error #a31529. CSS variable
  overrides allow shared design changes; recheck contrast after overrides.
- These are written design specifications, not Figma-derived designs. For a real
  design handoff, validate states and tokens against approved Figma specifications
  with a designer before implementation.

## Verification and limitations

Vitest + Testing Library cover native keyboard behavior, disabled/loading states,
refs, unique IDs, labels, error descriptions, and composed form submission.
axe-core checks semantic accessibility in normal and error states. jsdom cannot
validate rendered contrast or visual focus; color-contrast is disabled in automated
checks. Screen-reader behavior, zoom/reflow, browser/device testing and manual
visual review remain necessary. Passing tests is not a WCAG conformance claim.

## Contributor workflow

Keep components small, typed and native-semantic. Add tests for changed behavior;
run build and tests before requesting review. Document new props and interaction
states here. Review AI-generated changes for correctness and accessibility rather
than accepting them unchecked. `ci/github-actions.yml` is an inactive GitHub Actions
template running the same commands on Node 22. To enable CI, a repository owner can
copy it into `.github/workflows/ci.yml` using an account with workflow permissions.
