## Visual regression approach (Storybook)

- Storybook build already exists via `npm run build-storybook` (output `storybook-static/`).
- For Chromatic (recommended):
  - CLI already listed in `devDependencies`; set `CHROMATIC_PROJECT_TOKEN` in CI/secrets.
  - Run `npm run build-storybook` then `npm run chromatic` to upload `storybook-static` and enable baselines (see `.github/workflows/frontend-ui.yml`).
  - Treat the following stories as core baselines for the console UI:
    - `Pipeline/MapControls` (map layers, AOI filter, KMZ controls, suggestions list).
    - `Pipeline/ArtifactPanels` (summary/preview/metadata/insights layout).
    - `Pipeline/Stages` (pipeline checklist and status badges).
    - `Pipeline/JobsList` (jobs + tasks table and pipeline entry points).
    - `Pipeline/UploadSearch` (upload/search controls and project intent surface).
- For Percy (alternate):
  - Install `@percy/cli @percy/playwright`.
  - Add script: `"percy:story": "percy exec -- npx playwright test --config=percy.config.ts"` or run percy against the built Storybook (`percy snapshot storybook-static`).
-- Keep the `Pipeline/MapControls` story as the primary regression target (layer toggles, AOI filter, KMZ controls, suggestions list).
