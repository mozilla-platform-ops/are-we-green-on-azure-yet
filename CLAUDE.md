# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A React SPA that monitors Windows test results on Mozilla's Azure CI worker pools. It fetches recent autoland pushes from Treeherder, filters to Windows platform jobs, and displays pass rates, failure hotspots, and per-suite/platform result history.

Deployed to GitHub Pages at `mozilla-platform-ops.github.io/are-we-green-on-azure-yet/`.

## Commands

```bash
npm run dev       # Start Vite dev server (port 5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

There are no tests, linters, or type checkers configured.

## Architecture

Single-component app — all logic lives in `src/App.jsx`. No routing, no state management library, no sub-components.

**Data flow:**
1. `useEffect` fetches the last N pushes from `treeherder.mozilla.org/api/project/autoland/push/`
2. For each push, paginates through completed jobs via the jobs API (`state=completed`, 2000 per page)
3. Filters to `j.platform.startsWith('windows')` and enriches with push metadata (revision, author, timestamp)
4. Organizes jobs by tier → suite → platform for rendering

**Rendered sections per tier:**
- **tl;dr** — pass rate percentage and result counts
- **what's failing** — failures grouped by suite+platform, sorted by frequency
- **detail tables** — last 5 results per suite/platform as colored status dots linking to Treeherder

**State:** Four `useState` hooks (`isLoading`, `statusMsg`, `jobs`, `pushCount`). An `AbortController` cancels in-flight fetches when `pushCount` changes.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml` — builds with Node 22 and deploys to GitHub Pages. The Vite `base` is set to `/are-we-green-on-azure-yet/` for correct asset paths.
