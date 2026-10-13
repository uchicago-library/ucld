#!/usr/bin/env node
//
// Mechanical accessibility checks over the built site.
//
// This is deliberately dependency-free and regex-based. It covers only the
// criteria that are decidable from static markup, which is exactly the set
// that tends to regress unnoticed: a missing alt, a duplicate id, a skipped
// heading level. Anything requiring judgement -- whether alt text is
// meaningful, whether tab order is logical, whether a control reads sensibly
// to a screen reader -- is out of scope by design and stays a human review.
//
// Run after a build:  npm run a11y
// Exits non-zero when any error-level finding is present, so CI fails.

const fs = require("fs");
const path = require("path");

const SITE = "_site";

// Pages under demos/libapps/ are reproductions of Springshare's own LibGuides
// output, kept so the LibApps stylesheet can be validated against the markup
// it actually has to style. Their structure is not ours to change, so the
// document-level checks that would ask us to edit them are skipped.
// The trailing segment matters: demos/libapps/index.html is our own section
// landing page and is held to the full standard, while the reproductions each
// live in their own subdirectory below it.
const VENDOR_REPRODUCTION = /^demos[/\\]libapps[/\\][^/\\]+[/\\]/;

const findings = [];

function report(level, file, message) {
  // Findings in vendor reproductions are recorded but never fail the build:
  // the markup is Springshare's and cannot be corrected here. Letting them
  // fail would leave the guard permanently red, which is how guards get
  // ignored.
  if (VENDOR_REPRODUCTION.test(file)) level = "warn";
  findings.push({ level, file, message });
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

// Remove content that is displayed as example code rather than live markup,
// so a documented <img> in a demo block is not reported as a real one.
function stripCodeBlocks(html) {
  return html
    .replace(/<pre[\s\S]*?<\/pre>/gi, "")
    .replace(/<code[\s\S]*?<\/code>/gi, "")
    .replace(/<template[\s\S]*?<\/template>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  if (m) return m[2] !== undefined ? m[2] : m[3];
  // Valueless attribute, e.g. a bare `alt`.
  return new RegExp(`\\s${name}(\\s|>|/)`, "i").test(tag) ? "" : null;
}

function checkFile(file) {
  const rel = path.relative(SITE, file);
  const raw = fs.readFileSync(file, "utf8");
  const html = stripCodeBlocks(raw);
  const vendor = VENDOR_REPRODUCTION.test(rel);

  // 1. Document language.
  const htmlTag = raw.match(/<html\b[^>]*>/i);
  if (!htmlTag) {
    report("error", rel, "no <html> element");
  } else if (!attr(htmlTag[0], "lang")) {
    report("error", rel, "<html> has no lang attribute");
  }

  // 2. A single main landmark, which the skip link targets.
  const mains = html.match(/<main\b[^>]*>/gi) || [];
  if (mains.length === 0) {
    report("error", rel, "no <main> landmark");
  } else if (mains.length > 1) {
    report("error", rel, `${mains.length} <main> landmarks; there must be exactly one`);
  }

  // 3. Skip link, pointing at an id that exists.
  if (!vendor) {
    const links = html.match(/<a\b[^>]*href\s*=\s*"#[^"]+"[^>]*>/gi) || [];
    const skip = links.find((a) => /skip-link|visually-hidden-focusable/i.test(a));
    if (!skip) {
      report("error", rel, "no skip link");
    } else {
      const target = attr(skip, "href").slice(1);
      if (!new RegExp(`\\sid\\s*=\\s*"${target}"`, "i").test(html)) {
        report("error", rel, `skip link points at #${target}, which does not exist`);
      }
    }
  }

  // 4. Images need an alt attribute. alt="" is valid and means decorative.
  for (const img of html.match(/<img\b[^>]*>/gi) || []) {
    if (attr(img, "alt") === null) {
      report("error", rel, `<img> without alt: ${img.slice(0, 80)}`);
    }
  }

  // 5. Duplicate ids break every id-based association (labels, aria-*, skip links).
  const seen = new Map();
  for (const m of html.matchAll(/\sid\s*=\s*"([^"]+)"/gi)) {
    seen.set(m[1], (seen.get(m[1]) || 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) report("error", rel, `duplicate id "${id}" (${count} occurrences)`);
  }

  // 6. Heading levels must not skip on the way down (h2 -> h4).
  let previous = 0;
  for (const m of html.matchAll(/<h([1-6])\b[^>]*>/gi)) {
    const level = Number(m[1]);
    if (previous && level > previous + 1) {
      report("warn", rel, `heading jumps from h${previous} to h${level}`);
    }
    previous = level;
  }

  // 7. Form controls need an accessible name.
  if (!vendor) {
    const controls = html.match(/<(input|select|textarea)\b[^>]*>/gi) || [];
    for (const control of controls) {
      const type = (attr(control, "type") || "text").toLowerCase();
      if (["hidden", "submit", "button", "reset", "image"].includes(type)) continue;
      if (attr(control, "aria-label") || attr(control, "aria-labelledby") || attr(control, "title")) continue;
      const id = attr(control, "id");
      if (id && new RegExp(`<label\\b[^>]*\\sfor\\s*=\\s*"${id}"`, "i").test(html)) continue;
      report("error", rel, `form control with no accessible name: ${control.slice(0, 80)}`);
    }
  }

  // 8. Links need discernible text.
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const [, attrs, inner] = m;
    if (/\saria-label\s*=|\saria-labelledby\s*=|\stitle\s*=/i.test(attrs)) continue;
    const text = inner.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/gi, " ").trim();
    if (text) continue;
    // An icon-only or image-only link is named by its alt text.
    const img = inner.match(/<img\b[^>]*>/i);
    if (img && attr(img[0], "alt")) continue;
    report("error", rel, `link with no discernible text: <a${attrs.slice(0, 60)}>`);
  }
}

if (!fs.existsSync(SITE)) {
  console.error(`a11y: ${SITE}/ not found. Run "npm run build" first.`);
  process.exit(1);
}

const files = walk(SITE);
files.forEach(checkFile);

const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warn");

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

for (const [file, list] of [...byFile].sort()) {
  console.log(`\n${file}`);
  for (const f of list) {
    console.log(`  ${f.level === "error" ? "ERROR" : "warn "}  ${f.message}`);
  }
}

console.log(
  `\na11y: ${files.length} pages checked, ${errors.length} errors, ${warnings.length} warnings.`
);

if (errors.length) {
  console.error("\na11y: failing because of the errors above.");
  process.exit(1);
}
