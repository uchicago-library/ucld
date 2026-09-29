---
title: "Conventions"
description: "Naming, class structure, SCSS rules, and the checks a change should pass before it is considered done."
layout: base.njk
---

Where [System Architecture]({{ '/methodology/architecture/' | url }}) describes what exists, this page prescribes what to write.

## Naming

- **SCSS partials:** `_component-name.scss` — underscore prefix, kebab-case.
- **Pages:** `component-name.html` or `page-name.md` — kebab-case and descriptive.
- **Folders:** kebab-case, or underscored where an existing group already uses it.
- **IDs:** kebab-case, and durable. Avoid renaming a shared ID without a coordinated change.

## CSS Classes: BEM

Use `block__element--modifier` for bespoke components.

- **Block** — the component itself: `.card`
- **Element** — a part of it, after `__`: `.card__header`
- **Modifier** — a variation, after `--`: `.card--featured`

Avoid over-nesting (`.card__content__inner__text`), and do not reach for BEM where a Bootstrap utility already says it.

| Situation | What to do |
| --- | --- |
| Layout and structure (columns, grids, spacing) | Don't BEM these. Use Bootstrap utilities. |
| Bespoke components (search box, quick-links panel) | BEM. |
| One-off adjustments | Use a utility, not a new class. |

## IDs versus Classes

Use IDs for things that are unique on the page; use classes for anything that repeats.

- **Unique landmarks:** `header`, `footer`, `main-content`.
- **One-to-one relationships:** `aria-labelledby`, `aria-controls`, and `<label for>`.
- **Stable JS hooks**, but only where the element is genuinely unique. Prefer a data attribute for repeated instances.
- **Never on a repeatable component.** IDs must be unique per rendered page, and a duplicate breaks every association that depends on it.

## Writing Pages

- **Choose the format deliberately.** Markdown for prose; HTML when the rendered markup is itself the documentation.
- **Do not restate the title or lead** in the body — `base.njk` renders them from the `title` and `description` front matter.
- **Do not put heading display classes on headings** (`<h2 class="h4">`) in documentation pages.
- **Write a real `description`.** It is published in `/llms.txt` and in the Markdown copy of the page.
- **Use semantic elements:** `<header>`, `<main>`, `<article>`, `<nav>`.
- **No inline styles.** Page-specific demo styling goes in a `<style>` block at the top of the file, and moves to a dedicated SCSS file once it settles.
- **Code examples depend on the format.** A reference `.html` page carries none — it demonstrates itself, and its generated Markdown twin already holds the real markup. A prose `.md` page has no twin, so a short snippet is how it supplies markup. Reach for one where the reader would otherwise have to work out which part of a page is structural and which is the documentation around it.

Markdown pages are processed by Nunjucks before Markdown, so any literal template syntax you want to display has to be wrapped in a raw block. Internal links go through the `url` filter so the path prefix is applied. Use fenced code blocks; indented ones are disabled.

## Writing SCSS

- **Never hardcode a value** that exists as a token.
- **Prefer the highest-level class available** — a Bootstrap component class over utilities, utilities over bespoke CSS.
- **Avoid `!important`.**
- **One file per component**, at `src/styles/components/_name.scss`, imported in `main.scss`.
- **Documentation-only styles** go in `src/styles/meta/` and are imported in `meta.scss`, never in `main.scss`.
- **Rules in `meta/_documentation.scss` use direct-child selectors** (`.documentation > h2`). Markdown output is flat, so this reaches everything Markdown emits while leaving nested demo markup alone.
- **Transitions go through Bootstrap's mixin**, not a bare `transition:` property. The mixin is what honours `prefers-reduced-motion`.

## Writing JavaScript

Keep it minimal. JavaScript is justified for initialising Bootstrap behaviour through data attributes, for build-time work, and where no markup-only alternative exists. Most Bootstrap components need no custom script at all.

## Where Things Go

| Content | Location |
| --- | --- |
| Component documentation | `src/design_system/implementation/` |
| Live demo of a pattern | `src/pages/<group>/`, beside an `index.html` for the group |
| Usage guidance | `src/design_system/guidelines/` |
| Principles and research | `src/design_system/foundation/` |
| Process documentation | `src/methodology/` |
| Experimental mockup | `src/design_mockups/<topic>/` |
| Component SCSS | `src/styles/components/_name.scss`, imported in `main.scss` |
| Documentation-only SCSS | `src/styles/meta/_name.scss`, imported in `meta.scss` |
| Global element styles | `src/styles/base/_global.scss` |
| Layout styles | `src/styles/base/_layout.scss` |
| Shared partials | `src/_includes/` |
| Images | `src/assets/images/` |

## Definition of Done

Run `npm test`. It builds the site and runs the accessibility checks, and it fails on landmarks, skip links, missing alt attributes, duplicate IDs, skipped heading levels, and unnamed form controls.

What the build cannot decide still needs you:

- **Alt text is meaningful**, not merely present. A decorative image takes `alt=""`.
- **The keyboard path works** — every interactive element reachable by Tab, in a logical order, with a visible focus indicator, and Escape closes what it should.
- **The layout holds at each breakpoint.** These are Bootstrap's defaults, unmodified: 576, 768, 992, 1200 and 1400 pixels.
- **It reads correctly.** A control's accessible name should make sense read aloud on its own, without the surrounding page.
- **No console errors**, in current Chrome, Firefox and Safari.

Pages under `src/pages/libapps/` reproduce Springshare's own markup so the LibApps stylesheet can be tested against it. The accessibility check reports findings there as warnings, and they should not be resolved by editing the reproduction.
