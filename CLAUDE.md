# CLAUDE.md

Guidance for Claude Code working in this repository.

A static site for the UChicago Library Design System — component documentation and mockups built with **Eleventy**, **Bootstrap 5 (SCSS)** and **Font Awesome 6**, deployed to GitHub Pages under the `/ucld/` path prefix.

**This file holds only what is specific to working as an agent here**: traps that fail silently, constraints where the obvious action is wrong, and the rules for keeping the documentation current. Everything else — how the project is structured, how to set it up, why the conventions are what they are — lives in `src/methodology/` and is written for people.

## Where to look

| When you need | Read |
| --- | --- |
| Project structure, the build pipeline, what is generated and enforced | `src/methodology/architecture.md` |
| Naming, BEM, IDs, SCSS rules, the definition of done | `src/methodology/conventions.md` |
| Commands, prerequisites, troubleshooting | `src/methodology/setup.md` |
| Usability heuristics and the WCAG requirements | `src/design_system/foundation/design-standards.md` |
| The annotation overlay used on demo pages | `src/methodology/annotations.md` |
| How to author or annotate a design token | the header block of `src/styles/_variables.scss` |
| How the documentation itself is organised | `src/methodology/index.md` |

Consult those before adding a file to an unfamiliar directory, adding a component or token, or making a claim about accessibility.

**Precedence.** `src/methodology/` is canonical for how the project works. This file is canonical for agent workflow. If the two disagree about a fact, one of them is stale — check the code, then fix whichever is wrong as part of your change.

## Keeping the documentation current

Most documentation here regenerates itself. The parts that do not are listed below, and they are the parts that go stale.

- **Adding a token or a component class** — annotate it in the SCSS with `///` (a note for the declaration below) or `//!` (guidance for the section). The Token Tables page and `/design_system/tokens.json` pick it up. Nothing else to update.
- **Adding a page** — navigation, section listings and `/llms.txt` are all generated from the folder structure. Write a real `description` in the front matter, because it is published. Do not hand-edit navigation.
- **Adding a new *top-level* section** — this is the one manual step: add its path to the `whitelist` in `src/index.html`.
- **Changing structure, the build, or what it enforces** — update `src/methodology/architecture.md`.
- **Changing a rule contributors follow** — update `src/methodology/conventions.md`.
- **Finding a trap that fails silently** — add it to this file.

If you notice a documented claim that has become false, correct it in the same change. That is how the six-month drift this structure was built to fix accumulated.

## Traps

These fail quietly. None of them produces an error you would notice.

### Headers

There are two, and the wrong one still builds and still looks plausible.

- `meta/docs-header.html` is this documentation site's header. Every page that documents the system uses it, including the section index pages inside `design_mockups/` and `pages/` — those are navigation, not specimens. `base.njk` includes it, so pages using the layout are already correct.
- `header.html` is the production Library website header. Only the mockups and exported pages themselves use it.

The split is what the page *is*, not which folder it sits in. Only a page that hand-rolls its include chain has to choose, and copying a nearby page is how the wrong one spreads.

### Markdown pages

- Nunjucks runs **before** Markdown. Wrap any template syntax you want to *display* in `{% raw %}`.
- Internal links must go through the `url` filter, or they break under the path prefix: `[Tokens]({{ '/design_system/implementation/design-tokens/' | url }})`.
- Indented (4-space) code blocks are disabled. Use fenced blocks.
- Leave a blank line before a `---` horizontal rule, or it turns the line above into an `<h2>`.
- **Do not put block-level HTML in a `.md` file.** Markdown output is flat and `meta/_documentation.scss` depends on that. If a Markdown page needs a live demo, move the markup to a partial and pull it in with one `{% include %}`. Inline HTML inside a table cell is fine.
- Pipe tables, heading IDs and `target="_blank"` on external links are all added automatically.

### SCSS

- In `main.scss`, `bootstrap/scss/functions` **must** be imported before `_variables.scss`. An unresolved Sass function does not error — it degrades to a literal string — so this ordering is load-bearing.
- `src/styles/meta/` is imported from `meta.scss` and **never** from `main.scss`. Styling that exists only to document the system belongs there, not in `components/`.
- Rules in `meta/_documentation.scss` use **direct-child selectors only** (`.documentation > h2`). Descendant selectors would clobber the specimens on the Typography page and inflate spacing inside demo cards.
- Write transitions as `@include transition(...)`, never a bare `transition:` property. The mixin is what honours `prefers-reduced-motion`.
- The codebase uses `@import`, not `@use`, apart from one deliberate `@use` in `base/_global.scss`.

### Design tokens

`src/design_system/token-tables.html` is generated at build time by `src/_data/tokens.js` from the SCSS itself. Values, CSS variable names, utility classes and notes are never transcribed by hand.

- Annotation prose renders as **inline** Markdown only. Backticks and links work; lists and headings do not. Wrap a class name containing an asterisk in backticks, or a bare `.btn-*` pairs its asterisks into emphasis.
- **Do not add `!default` to a `$ucl-*` token, and do not reassign one downstream.** Either makes the published `--ucl-*` custom property silently disagree with the compiled Sass. See the Auto-Exposure Constraint note in `_variables.scss`.
- Two build guards fail the build rather than publish wrong data: an unresolved Sass function, and disagreement between the `--ucl-*` properties and the compiled values.

### Machine-readable endpoints

`/llms.txt`, a Markdown copy of every `design_system/` page, and `/design_system/tokens.json` are all generated on build. No manual step when pages are added or changed. Two authoring constraints follow:

- The `description` front matter **is published**. Write a real one-line summary.
- Reference pages are split on **top-level `<section>` elements**. Keep demo content inside sections; a page with none degrades to a stub.

### Environment

- The path prefix `/ucld/` is set in `.eleventy.js`. The dev server therefore serves at **http://localhost:8080/ucld/**, not the bare port.
- There are **no unit tests**. `npm test` runs the build and the accessibility checks.

---

## Authoring Rules

### File boundaries

- **Never modify `_site/`.** It is generated. All work happens in `src/`.
- **Do not add code examples** to documentation pages. The generated Markdown copies already carry the real markup.
- Each bespoke element or component should have a demo page under `src/design_system/implementation/`.

### HTML

- Documentation pages are documental. Prefer Markdown; focus on clean, semantic markup and basic Bootstrap styling.
  - Do not apply heading display classes (`h1`, `h2`) to heading elements.
  - Do not apply `mb-*` classes to `<p>` tags.
  - Do not restate the page title or lead in the body — `base.njk` renders them from front matter.
- Mockup pages and page-specific demo styles go in a `<style>` block at the top of the file — no inline styles. Move to a dedicated SCSS file once finalised.
- Use semantic elements: `<header>`, `<main>`, `<article>`, `<nav>`.
- Always include `alt` text on images.

### CSS / SCSS

- Use the highest-level class available. Prefer a Bootstrap component class over utilities, and utilities over bespoke CSS.
- Never hardcode a value that exists as a token.
- Avoid `!important`.
- Follow BEM for custom components (`block__element--modifier`). Do not BEM layout or one-off spacing — use Bootstrap utilities.
- Use IDs for unique landmarks (`header`, `footer`, `main-content`), ARIA references, and one-to-one JS hooks. Never use IDs on repeatable components.

### Accessibility

`npm run a11y` checks the built site and **fails CI**. It covers only what is decidable from static markup — meaningful alt text, tab order and screen-reader phrasing still need a human.

- Every page needs **exactly one** `<main id="main-content" tabindex="-1">`. `meta/document-start.html` emits the skip link that targets it, so a page opening its own `<body>` must supply its own skip link too.
- Every form control needs an accessible name: `<label for>`, `aria-label`, or `aria-labelledby`. A nearby heading is not a label.
- Every `<img>` needs `alt`. Use `alt=""` for decorative images — omitting the attribute is the error.
- Do not skip heading levels. Bootstrap's card examples use `<h5 class="card-title">`, which skips if the card sits under an `h2`.
- IDs must be unique per rendered page. Watch partials included more than once.
- Pages under `src/pages/libapps/` reproduce Springshare's own markup so the LibApps stylesheet can be validated against it. Findings there are warnings and must not be "fixed" by editing the reproduction.

### Bootstrap pitfalls

- Before relying on a native HTML feature, check that Bootstrap's classes do not suppress it (`appearance: none` disabling `<datalist>` ticks, `width: 100%` overriding flex shrink).
- When adding sizing constraints, verify behaviour at all breakpoints — Bootstrap's defaults, unmodified: 576, 768, 992, 1200, 1400.
- When nesting interactive elements inside other interactive elements, account for event propagation upfront.

### Judgment calls

- If any instruction is unclear, conflicting, or looks like a bad idea, ask before proceeding.
