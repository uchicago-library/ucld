# Contributing

A checklist for a change to this repository. Each item links to the page that holds the rule; this file states none of its own.

The methodology pages are written for the published site, so read them there: **https://uchicago-library.github.io/ucld/methodology/**

## Before you start

- Set up and run the site locally: [Setup](https://uchicago-library.github.io/ucld/methodology/setup/). It serves at http://localhost:8080/ucld/, not the bare port.
- Work in a branch, and only in `src/`. `_site/` is generated.
- Find where your change belongs in [Where Things Go](https://uchicago-library.github.io/ucld/methodology/conventions/#where-things-go). Documentation goes in `design_system/`, live demos in `demos/`, experiments in `playground/`.

## While you work

- Annotate new tokens and component classes in the SCSS with `///`. The Token Tables page and `tokens.json` pick them up. See the header of `src/styles/_variables.scss`.
- Give every new page a real `description` in its front matter. It is published. Navigation and section indexes are generated, so do not edit them by hand.
- Follow [Conventions](https://uchicago-library.github.io/ucld/methodology/conventions/) for naming, BEM, IDs, CSS and SCSS.
- Do not remove or rename a class, token or custom property that a consumer may use. Projects load the published stylesheet with no version to pin.

## Before you open a pull request

- `npm test` passes. It builds the site and runs the accessibility checks.
- The human checks in the [Definition of Done](https://uchicago-library.github.io/ucld/methodology/conventions/#definition-of-done) are done: alt text, the keyboard path, every breakpoint, accessible names, the console.
- If you changed the structure or the build, [Architecture](https://uchicago-library.github.io/ucld/methodology/architecture/) says so. If you changed a rule contributors follow, [Conventions](https://uchicago-library.github.io/ucld/methodology/conventions/) says so.
