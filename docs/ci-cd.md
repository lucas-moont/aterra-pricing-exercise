# CI / CD

## CD — already covered by Vercel

Vercel's Git integration handles continuous deployment with no config:

- Push to `main` → production deploy.
- Every PR → a preview deploy with its own URL.

No workflow file is needed for deployment. The only thing to configure is
importing the repo at vercel.com (free tier, no env vars).

## CI — GitHub Actions

Lives at `.github/workflows/ci.yml` (created in the build phase, because it
depends on the test scripts existing in `package.json`). Runs on every pull
request and every push to `main`.

### Tooling

- **Vitest** — unit + component test runner (fast, ESM-native, first-class TS).
- **React Testing Library** — component tests for the failure-state UI.
- **Playwright** — end-to-end for the edit → save → refresh flow.

### Jobs

**`quality`**
1. `actions/checkout`
2. `actions/setup-node` (Node 20, npm cache)
3. `npm ci`
4. `tsc --noEmit` — typecheck
5. `next lint` — lint
6. `vitest run --coverage` — unit + component tests
7. `next build` — the build must succeed

**`e2e`**
1. checkout + setup-node + `npm ci`
2. `npx playwright install --with-deps`
3. build + start the app, run Playwright against it
4. upload the Playwright HTML report as a build artifact

Kept as a separate job so a unit-test failure fails fast without waiting on the
browser run.

### Gate (optional, recommended)

Make production wait for green CI — GitHub required status checks on `main`,
or Vercel's "wait for CI" setting. A senior default: nothing reaches production
red.

## Package scripts the CI expects (added in build phase)

```
"typecheck": "tsc --noEmit"
"lint":      "next lint"
"test":      "vitest run"
"test:cov":  "vitest run --coverage"
"e2e":       "playwright test"
```
