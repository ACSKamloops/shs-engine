# CI Setup Notes (Frontend)

To enable full frontend CI (including visual regression uploads via Chromatic):

1) Ensure the GitHub Actions workflow `.github/workflows/frontend-ui.yml` is present (it runs npm ci, Playwright E2E, app build, Storybook build, and optional Chromatic upload).
2) Add a repo secret `CHROMATIC_PROJECT_TOKEN` with your Chromatic project token.
3) Optionally add `PLAYWRIGHT_BASE_URL` if running against a remote preview; defaults to local preview.
4) Artifacts: Playwright test artifacts and preview logs are uploaded automatically for debugging.
5) In GitHub, consider enabling branch protection on your main branch (e.g., `main`/`master`) and require either the Chromatic status check or the `Frontend UI` workflow to pass before merging PRs. This turns visual regressions into blocking checks instead of best-effort signals.
