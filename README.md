
# Aashan Javed — Static Portfolio

A clean, fast, accessible portfolio built with plain HTML, CSS, and a sprinkle of JS. No frameworks, no backend.

## Quick start
- Open `index.html` locally or drop the folder on any static host (GitHub Pages, Netlify, Vercel static).
- Edit `data.json` to update content. The UI maps over this file.

## Structure
```
.
├── index.html
├── data.json              # single source of truth for content
├── assets
│   ├── css/style.css
│   ├── js/main.js
│   ├── img/placeholder.svg
│   └── icons/*.svg
├── resume/Resume_updated.pdf     # primary resume (replace with your latest)
├── resume/Resume.pdf             # optional alternate
├── robots.txt
└── sitemap.xml
```

## Content model
- `data.json` includes name, email, links, research interests, projects, publications, experience, skills, achievements, and certifications.
- Add project screenshots to `assets/img/` and set the `image` path in `data.json`.

## Design system
- Typography: Inter via Google Fonts, with system fallbacks.
- Type scale: 36/28/22/18/16/14, line-height 1.6.
- Color: neutral base with one accent, light/dark via `prefers-color-scheme`.
- Components: Cards with 12–16 px radius, visible focus outlines.
- Motion: tiny hover lifts and animating link underlines, under 200 ms.

## Accessibility & performance
- Keyboard navigable, skip link, visible focus states.
- Lazy-loaded images, small JS, no heavy libraries.
- Preconnect to fonts. To maximize performance, consider self-hosting fonts:
  - Download Inter woff2, place in `assets/fonts/`, and replace the Google Fonts `<link>` with `@font-face` in CSS.

## SEO
- Update the `<link rel="canonical">` in `index.html` and the `Sitemap:` URL in `robots.txt`.
- JSON-LD for Person and publications is injected at runtime from `data.json`.

## Customize
- Change accent color in `data.json` under `meta.accent` (hex value).
- Tweak spacing and shadows in `assets/css/style.css`.

## Deploy
- **GitHub Pages**: push to a repo, enable Pages on `main` branch, `/` root.
- **Netlify** or **Vercel**: drag-and-drop deploy the folder or connect the repo.

## Optional analytics
- Add a tiny script just before `</body>` or use a lightweight service. Keep it privacy-friendly.
