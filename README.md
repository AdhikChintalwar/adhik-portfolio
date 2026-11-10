# Adhik Chintalwar — Real GT3 RS Cinematic Portfolio (V7)

This package **includes the actual Porsche GLB supplied by the user** at `public/models/porsche-911-gt3-rs.glb` (16.4 MB). No Blender export or external Sketchfab embed is needed.

## Start

```bash
npm install
npm run build
npm run dev -- --strictPort
```

Open http://localhost:5175. Stop any previous Vite instance on 5175 first. BABY on 5173 is unaffected.

## 3D implementation

- GLB geometry inspected: 408 nodes, 291 meshes, 0 built-in animation clips.
- The model's +Z points toward the front, and it is normalized from centimeter-like coordinates to 5.25 Three.js units in length.
- Scroll controls an eight-transition camera route around the real car, with a final rear-view drive-away sequence.
- Four named wheel assemblies and the named steering-wheel assembly are animated at runtime.
- Scene uses a continuously rendered WebGL canvas, directional and colored lighting, fog, and a ground plane.
- Camera targets and shot distances are intentionally conservative to avoid clipping through the roof.

## Limitations

This model has no authored animation clips. Steering and wheel animation are implemented through named transforms, but the exact axis and physical fidelity should be checked visually on your hardware. Camera positions are calculated from the GLB's geometry orientation, not a browser screenshot; they may require creative tuning for final cinematography. If performance is poor on mobile, reduce canvas DPR in `src/Scene.tsx`.

## Edit content

Edit `src/App.tsx` for portfolio chapters, professional history and links; `src/styles.css` for colors and typography. Replace `public/Adhik_Chintalwar_Resume.pdf` after updating your resume.

## Model rights

Ensure the uploaded model's license permits redistribution and public website hosting; include any required attribution before deployment.
