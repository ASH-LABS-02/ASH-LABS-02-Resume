# ASH-LABS-02-Resume

Ashwin Raghavendran's voxel-inspired portfolio — AI & IoT developer and Computer Science (IoT) undergraduate.

Built with React, TypeScript, Vite, Three.js, and Anime.js.

## Featured projects

- **VacX** — an autonomous smart vacuum and mopping robot; Atomquest’25 national semifinalist.
- **RealTime-Finance** — real-time market-data pipelines, sentiment analysis, and GPT-powered insights.
- **DepthWizard** — calibrated 3D surface reconstruction from optical satellite imagery, with a link to the deployed application.

Project descriptions, evaluation results, profile information, education, and skills live in `src/data/portfolio.ts`. Evaluation figures are supplied by the portfolio owner, not independently reproduced by this website.

## Run locally

Use Node.js 22.12+ or a supported newer version (Node.js 24 recommended).

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

## Production build

```sh
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The production output is `dist/`. It is generated during deployment and intentionally excluded from Git.

## Hosting

This is a frontend-only static website. No API keys or application server are required to host the portfolio. DepthWizard and RealTime-Finance are separate projects; their backends are not part of this repository.

Standard static-host settings:

- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `24`

Navigation uses section anchors such as `#work`, `#about`, `#play`, and `#connect`; server-side route rewrites are not needed.

### GitHub Pages

Public site: [ash-labs-02.github.io/ASH-LABS-02-Resume](https://ash-labs-02.github.io/ASH-LABS-02-Resume/).

The `.github/workflows/deploy.yml` workflow installs dependencies, lints, builds, and deploys on every push to `main`. Repository Settings → Pages must use **GitHub Actions** as its source. No custom deployment secrets are required.

The workflow builds with `--base=/ASH-LABS-02-Resume/`. Runtime public assets use `src/assetUrl.ts`, including wallpaper exports; Vite rewrites CSS and HTML asset paths. Normal local development still uses `/`.

To preview the Pages build locally:

```sh
npm run build -- --base=/ASH-LABS-02-Resume/
npm run preview -- --host 127.0.0.1 --port 4174 --base=/ASH-LABS-02-Resume/
```

Open `http://127.0.0.1:4174/ASH-LABS-02-Resume/`. If the repository is renamed or moved to a custom domain, update the workflow's base path.

## Features

- Layered voxel avatar, pointer tilt, and optional cyan energy effects.
- Scroll reveals, assembling project previews, and native accessible project dialogs.
- Interactive Three.js sculpture with shape changes, scatter/reassembly, and keyboard controls.
- A final constellation side quest with palette selection, shuffle, and desktop/phone PNG wallpaper export.
- Global motion controls, reduced-motion support, and WebGL fallbacks.
- Responsive education, skills, and project sections without contact forms.

Heavy 3D modules are lazy-loaded. Animated scenes pause when offscreen or the document is hidden, with pixel ratios and particle counts capped for performance.

## Repository layout

- `src/` — application components, motion controls, and portfolio data.
- `public/` — served images, project previews, fonts, and retained demo assets.
- `assets-src/` — original source artwork.
- `sih-drone/` — retained earlier drone-interface prototypes, not the current featured projects.

Fonts are self-hosted; their license files are in `public/fonts/`. Original PNG artwork is retained alongside WebP delivery assets. The DepthWizard thumbnail is a capture of its live Glover Park scene; VacX and RealTime-Finance previews are labeled system illustrations.

## Verification

`npm run build` runs TypeScript checks and creates the production bundle. `npm run lint` runs Oxlint.

The current portfolio has also been checked in headless Edge with Playwright at desktop and mobile widths for project dialogs, navigation, image loading, external links, motion controls, and wallpaper downloads. The browser QA scripts and captures are workspace artifacts, not production dependencies.

Real-device Safari and Firefox testing remain advisable. Vite currently reports a size warning for the shared Three.js chunk.
