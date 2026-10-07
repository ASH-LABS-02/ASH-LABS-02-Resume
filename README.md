# Ashwin Raghavendran — Portfolio

A responsive, voxel-inspired portfolio built with React, TypeScript, Vite, Three.js and Anime.js.

## Run

```sh
npm install
npm run dev -- --host 127.0.0.1
```

## Production

```sh
npm run lint
npm run build
npm run preview -- --host 127.0.0.1
```

Deploy the generated `dist` directory to a static host. The site currently uses root-relative asset paths, so it is configured for a domain root rather than a subdirectory. Nothing has been published automatically.

## Personalize before publishing

Edit `src/data/portfolio.ts`:

- `PROFILE.email`: real contact email; enables the contact CTA.
- `PROFILE.linkedin`, `github`, `instagram`: complete verified profile URLs.
- `PROFILE.resume`: path to your résumé after placing it in `public` (for example `/resume.pdf`).
- `PROJECTS`: project titles, descriptions, preview images and demo paths.

Empty personal destinations are intentionally hidden, not replaced with fake links. The contact section currently offers a working return to projects and clearly states that direct contact links are being updated. No contact backend is configured.

The three showcased demos are existing local prototypes from `sih-drone/`, copied into `public/demos/`. They are labeled as prototypes/simulations, not production systems. Edit the originals and synchronize their public copies when updating. Preview images are browser captures of those actual interfaces. Source downloads are the standalone HTML demo files, not links to nonexistent repositories.

## Motion and rendering

- `src/components/VoxelScene/VoxelScene.tsx`: pointer-responsive camera and instanced cube particles; Anime.js animates the scene's rotation.
- `src/components/VoxelScene/PortalScene.tsx`: dimensional voxel frames with animated GLSL portal surfaces; rotation follows scroll.
- `src/components/Playground/`: a real instanced 3D sculpture with knot/sphere morphing, scatter/assemble, drag and arrow-key rotation, reset view and an image fallback.
- `src/components/FeaturedProjects/ProjectPreview.tsx`: native modal dialog with embedded local demos, fit/actual-size views, project guidance, previous/next navigation, loading/retry feedback, Escape/close behavior, focus restoration and body-scroll locking.
- `src/components/Hero/`: original portrait layers, interactive cyan energy, pointer tilt and scroll parallax. The portrait is a layered image, not a rotatable head model.
- `src/components/MagicCard/`: perspective tilt, depth and pointer-following light with Anime.js return transitions.
- `src/components/CTA/`: a blended night-scene transition, edge-perched llama, readable contact card and subtle voxel particles. Ambient motion pauses offscreen and follows the global motion preference.
- `src/motion/Reveal.tsx`: scoped, scroll-triggered reveals with cleanup.
- `src/motion/MotionProvider.tsx`: reduced-motion support and a persistent manual motion switch.

Three.js is lazy-loaded. Decorative WebGL render loops stop offscreen or when the document is hidden. Pixel ratio and mobile particle counts are capped. WebGL failures leave image fallbacks available. Disabling motion removes decorative canvases, stops continuous animation, and reveals all content immediately. The interactive sculpture remains as a static WebGL view with instant user-triggered changes. Its touch surface allows vertical page scrolling. Native scrolling, text selection and keyboard focus are preserved. Optional 3D module errors are isolated so the rest of the page remains usable.

Fonts are self-hosted; license files are under `public/fonts/`. Original PNG artwork is preserved alongside lossless WebP delivery assets.

The sculpture only updates its instance matrices during morph/scatter changes; idle rotation and floating operate on the parent group. Demo previews preserve the desktop interface in a scaled viewport, with actual-size scrolling for closer inspection.

## Verification performed

- TypeScript + Vite production build; Oxlint; npm audit.
- Headless Edge / Playwright at desktop 1536×1024 and widths 320, 390, 768 and 1024.
- Hero pointer tilt, energy toggle, navigation anchors, source download, demo popup and project expansion/collapse.
- Persistent motion preference, OS reduced-motion setting, keyboard skip link, image loading, horizontal overflow and browser-console health.
- No-WebGL fallback for the portrait and portals.
- Sculpture morphing/scattering, keyboard rotation, pointer drag, static-mode updates, project dialog focus/close, and direct section URLs.
- Touch-emulated vertical swiping over the sculpture canvas still scrolls the document.
- Demo fit/actual-size round trips, previous/next wraparound, and scaled pointer interaction at desktop, phone and landscape sizes.
- Slow preview loading and retry recovery; idle sculpture tile buffers stay unchanged while scatter updates them.

Real-device Safari and live personal contact destinations still need verification before public launch.

# ASH-LABS-02-Resume
