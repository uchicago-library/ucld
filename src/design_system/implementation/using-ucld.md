---
title: "Using the Design System in a Project"
description: "How to load the design system in another project, and where the rules for styling on top of it live."
layout: base.njk
---

## Loading it

Load the favicon, the stylesheet and the icon set in the `<head>`, and Bootstrap's JavaScript before `</body>`.

```html
<link rel="icon" type="image/x-icon" href="https://www.lib.uchicago.edu/web-resources/img/favicon-black.ico">
<link rel="stylesheet" href="https://uchicago-library.github.io/ucld/styles/main.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

<script src="https://uchicago-library.github.io/ucld/styles/bootstrap.bundle.min.js"></script>
```

- **`main.css`** is Bootstrap compiled with the design system's tokens, plus its components and the UChicago Sans Serif typeface. It replaces Bootstrap's own CSS; load one or the other, not both.
- **`bootstrap.bundle.min.js`** is Bootstrap's JavaScript, with Popper, built from the same Bootstrap version as `main.css`. Load it rather than a CDN copy, so the two cannot drift apart.
- **Font Awesome 6.5.2** is the icon set the components are written against.
- **The favicon** is an ICO; the Library publishes no SVG version. Reference it from `lib.uchicago.edu` rather than copying it, so a change to the mark reaches every site at once. Three variants sit at that path: `favicon.ico` full colour, `favicon-black.ico` monochrome for light browser chrome, and `favicon-m.ico` for mobile. Serve a copy at `/favicon.ico` as well, since browsers request that path on their own, without reading the tag.

The two files from this site always serve its current build. There are no versions to pin.

LibGuides and other Springshare pages load a different stylesheet: see [Styling Springshare Pages]({{ '/design_system/implementation/springshare/' | url }}).

## Styling on top of it

Take values from the [Token Tables]({{ '/design_system/implementation/token-tables/' | url }}) rather than writing them out. The rules for your own CSS are the ones this project follows, in [Conventions]({{ '/methodology/conventions/' | url }}): [BEM]({{ '/methodology/conventions/' | url }}#css-classes-bem), [IDs versus classes]({{ '/methodology/conventions/' | url }}#ids-versus-classes) and [Writing CSS]({{ '/methodology/conventions/' | url }}#writing-css).
