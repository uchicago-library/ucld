---
title: "System Architecture"
description: "How the design system is built: the layers it is made of, where every file lives, what the build generates, and what it enforces."
layout: base.njk
---

## Core Concepts

- **Brand tokens** live in `src/styles/_variables.scss` and override Bootstrap's own variables. That file is imported before Bootstrap, so our values win.
- **Elements** (buttons, forms, inputs) are styled with Bootstrap classes first. Add a custom class only when Bootstrap genuinely cannot express the need.
- **Global components** (header, footer, breadcrumb) are HTML partials in `src/_includes/`.
- **Design system pages** (`src/design_system/`) document the system: tokens, components, and usage guidance.
- **Mockup pages** (`src/design_mockups/`) are for brainstorming layouts. Page-specific styling goes in a `<style>` block at the top of the file.
- **Application pages** (`src/pages/`) hold markup exported from real applications, kept so the stylesheets can be validated against the HTML they actually have to style.

## The Three Layers of Styling

The system is a Bootstrap 5 build with three separate outputs, each compiled from its own entry point in `src/styles/`:

| Entry point | Output | Purpose |
| --- | --- | --- |
| `main.scss` | `main.css` | The product stylesheet. Everything the design system ships. |
| `main-libapps.scss` | `main-libapps.css` | Overrides for Springshare LibApps pages, which load their own Bootstrap at runtime. |
| `meta.scss` | `meta.css` | Styles for this documentation site only. Never shipped with the product. |

Sass compiles the whole `src/styles` directory, so any `.scss` file at its top level becomes a stylesheet. Files prefixed with an underscore are partials and produce no output of their own.

The distinction that matters most: **`src/styles/meta/` is imported from `meta.scss` and never from `main.scss`.** Styling that exists only to document the system belongs there, not in `components/`.

## Design Tokens

Tokens are SCSS and CSS variables organised into three levels of abstraction, so the whole system can be adjusted from a small number of places.

| Level | Scope | Where it lives |
| --- | --- | --- |
| **1: Core** | Raw brand values | `_variables.scss` |
| **2: Semantic** | Generic roles built from core values | `_variables.scss` |
| **3: Component** | Role-specific values for one component | `components/`, or `_variables.scss` where Bootstrap reads them first |

### Where token documentation lives

The [Token Tables]({{ '/design_system/token-tables/' | url }}) page is generated from the stylesheets at build time by `src/_data/tokens.js`, so no token value, CSS variable name or utility class is ever transcribed by hand. The same generator publishes `/design_system/tokens.json` for tooling that wants the set directly.

The authoring conventions that drive it — the comment markers, the naming rule, and the guidance on when to use an SCSS variable versus a CSS variable — are documented in the header of `src/styles/_variables.scss`, because that is the file you are looking at when you need them.

Tokens are listed exhaustively and appear with empty cells if undocumented. Component classes are opt-in and appear only if annotated, since a stylesheet is mostly internal structure.

## Directory Structure

```text
src/
├── _data/                     # Global data, available to every template
│   ├── globalNav.json         # Header navigation model
│   ├── headerCurrentNav.json  # Production header links
│   ├── guides.json            # Data for the guides mockups
│   ├── site.js                # Site name, summary, absolute origin
│   └── tokens.js              # Generates the Token Tables page from the SCSS
├── _includes/                 # Reusable partials
│   ├── base.njk               # Layout for documentation pages
│   ├── header.html            # Production Library website header
│   ├── footer.html            # Site footer
│   ├── breadcrumb.html        # Breadcrumb trail
│   ├── child-pages-list.html  # Generated list of a section's pages
│   ├── token-table.njk        # Token Tables markup
│   ├── libapps/               # Partials reproducing Springshare's chrome
│   ├── meta/                  # Documentation-site chrome and tooling
│   └── mockups/               # Partials used by mockup pages
├── assets/                    # Images and scripts, copied verbatim
├── design_system/             # The documented system
│   ├── foundation/            # Why the system is the way it is
│   ├── guidelines/            # How to use it
│   ├── implementation/        # Components, tokens, typography, layouts
│   ├── token-tables.html      # Generated token reference
│   └── tokens.json.njk        # Machine-readable token endpoint
├── design_mockups/            # Full-page mockups, grouped by topic
├── methodology/               # How to work on this project (this folder)
├── pages/                     # Markup exported from real applications
├── styles/
│   ├── _variables.scss        # Level 1 and 2 tokens, Bootstrap overrides
│   ├── main.scss              # Product entry point
│   ├── main-libapps.scss      # LibApps entry point
│   ├── meta.scss              # Documentation entry point
│   ├── base/                  # Global element styles
│   │   ├── _global.scss
│   │   ├── _layout.scss
│   │   └── _typography.scss
│   ├── components/            # One file per component
│   └── meta/                  # Documentation-only styles, never shipped
├── index.html                 # Homepage
├── llms.njk                   # Generates /llms.txt
└── reference-md.njk           # Generates the Markdown twin of each reference page
```

## Page Structure

Documentation pages set `layout: base.njk` and provide only front matter and content. The layout supplies the document head, header, breadcrumb, prose column, page title and footer.

```text
---
title: "Page Title"
description: "Renders as the lead paragraph and the meta description."
layout: base.njk
---
```

Markdown and HTML render identically through this layout. Use `.md` for prose; use `.html` when the rendered markup *is* the documentation — live demos, type specimens, or anything needing a `<style>` or `<script>` block.

A few pages still hand-roll the include chain instead of using the layout, because their demos need to escape the constrained prose column. `implementation/layouts.html` and `token-tables.html` are the examples.

### Two headers

The site uses one of two headers, and which one a page gets is a deliberate choice rather than a default. The dividing line is not the folder but what the page *is*.

- `meta/docs-header.html` is this documentation site's own header. Every page that documents the system uses it: `design_system/`, `methodology/`, the home page, and the index pages that introduce a section — including the ones inside `design_mockups/` and `pages/`, which are navigation rather than specimens. `base.njk` supplies it, so a page using the layout is already correct.
- `header.html` is the production Library website header. Only the mockups and exported pages themselves use it, because they show a real Library interface and need its real chrome to be worth looking at.

`docs-header.html` lives in `_includes/meta/` and is styled from `styles/meta/_docs-header.scss`, following the rule that anything existing only to document the system stays out of the product. It mirrors the production header visually so the two read as one site.

A page that hand-rolls its include chain has to pick. Including the wrong one produces a page that still builds and still looks plausible, so check it against the rule above rather than copying whichever nearby page came to hand.

## What the Build Generates

None of this needs a manual step. Adding a page is enough.

- **Navigation.** Section landing pages and the homepage's documentation navigation are built from the folder structure. Placing a page inside a section folder is all that is required. Only a brand-new *top-level* section needs its path added to the whitelist in `src/index.html`.
- **Token Tables** and `/design_system/tokens.json`, from the SCSS sources.
- **`/llms.txt`**, a discovery index for agents building other projects against this design system.
- **A Markdown copy of every `design_system/` page**, served at `/design_system/<page>.md`. Prose pages are copied verbatim; reference pages get a generated twin carrying each section's real markup, built from the rendered output so it cannot drift.

Because the Markdown copies and `/llms.txt` publish the `description` front matter, every page needs a real one-line summary rather than a placeholder.

## What the Build Enforces

Three checks fail the build rather than publish something wrong:

1. **Unresolved Sass functions** in `_variables.scss`. An unknown function does not error in Sass — it degrades to a literal string — so the token generator asserts that every value resolved.
2. **Token exposure disagreement.** Every `$ucl-*` colour is published as a `--ucl-*` custom property. If the published variable and the compiled Sass value disagree, the build stops. See the Auto-Exposure Constraint note in `_variables.scss`.
3. **Accessibility.** `npm run a11y` checks the built site for the mechanical criteria — landmarks, skip links, alt text, duplicate ids, heading order, form-control names. `npm test` runs the build and the check together.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which runs the build, runs the accessibility checks, and deploys `_site/` to GitHub Pages. The site is served under the `/ucld/` path prefix, which is set in `.eleventy.js` and applied in both development and production.

## Next Steps

- **[Coding conventions and the definition of done]({{ '/methodology/conventions/' | url }})**
- **[Setup and installation]({{ '/methodology/setup/' | url }})**
