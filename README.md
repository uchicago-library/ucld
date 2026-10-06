# UChicago Library Design System

A static site documenting and demonstrating the University of Chicago Library design system, built with **Eleventy**, **Bootstrap 5 (SCSS)** and **Font Awesome**, and deployed to GitHub Pages.

**Published at https://uchicago-library.github.io/ucld/** — start there to use the system rather than change it.

## What's here

- **Design tokens** — colours, typography and spacing, documented on a Token Tables page that is generated from the stylesheets rather than maintained by hand.
- **Components** — reusable UI built on Bootstrap 5 with UChicago brand overrides.
- **Guidelines** — how to use the system, and the research and principles behind it.
- **Mockups** — full-page layouts used to explore and validate directions.
- **A machine-readable surface** — `/llms.txt` plus a Markdown copy of every design system page, for AI agents building other projects against this system.

## Quick start

```bash
npm install
npm run dev
```

Then open **http://localhost:8080/ucld/** — the site is served under the `/ucld/` path prefix, so the bare port will not resolve.

```bash
npm run build   # production build into _site/
npm test        # build, then run the accessibility checks
```

For prerequisites, troubleshooting and the full script list, see [Setup & Installation](src/methodology/setup.md).

## Documentation

| Topic | Where |
| --- | --- |
| How the project is built and organised | [System Architecture](src/methodology/architecture.md) |
| Naming, BEM, SCSS rules, definition of done | [Conventions](src/methodology/conventions.md) |
| Usability and accessibility standards | [Design Standards](src/design_system/foundation/design-standards.md) |
| How the documentation itself is structured | [Project Methodology](src/methodology/index.md) |
| Instructions for AI agents working on this repo | [CLAUDE.md](CLAUDE.md) |

## Accessibility

Components and pages are held to WCAG 2.1 Level AA. The mechanical criteria — landmarks, skip links, alt attributes, duplicate IDs, heading order, form-control names — are checked by `npm run a11y`, which runs in CI and fails the build. The rest is covered by the review step in [Conventions](src/methodology/conventions.md).

## Stylesheets

Three entry points in `src/styles/`, each compiling to `_site/styles/`:

| Entry point | Purpose |
| --- | --- |
| `main.scss` | The product stylesheet |
| `main-libapps.scss` | Overrides for Springshare LibApps pages, which load their own Bootstrap |
| `meta.scss` | Styles for this documentation site only; never shipped |

Additional narrower builds (for platforms needing only tokens and utilities) can be added by creating another entry point in `src/styles/` — Sass compiles the whole directory, so no build script change is required.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which builds the site, runs the accessibility checks, and deploys `_site/` to GitHub Pages.

## Dependencies

All are development dependencies; nothing here ships to the browser. Components need only Bootstrap and Font Awesome at runtime. Bootstrap's CSS is compiled into `main.css` and its JavaScript is published beside it, so the two always match; Font Awesome loads from a CDN.

| Dependency | Purpose |
| --- | --- |
| Eleventy | Static site generator |
| Bootstrap | CSS framework (SCSS sources) |
| Sass | SCSS compilation |
| markdown-it, markdown-it-anchor | Markdown rendering and heading anchors |
| npm-run-all | Running build steps together |

Exact versions are in [package.json](package.json).
