# Little Slice

One-page Three.js fraction bakery. Open `/sampleminigame/` on the parent Portfolio project's Vite server.

## Demo

Serve six guests by cutting whole cakes into 2-12 equal pieces and tapping portions onto a tray. Equivalent fractions work; Simplify merges pieces without changing quantity. Returning merged portions restores their original slices. Recutting restores only that flavor, preserving other tray portions. Served cakes fly right, followed by the guest; the next guest enters from the left. Play again resets the session.

Mouse, touch, and keyboard controls are available. Audio starts muted. Reduced-motion preferences replace travel with immediate placement. Mobile uses a vertically scrolling layout.

## Structure

- `domain.ts`: exact fraction state, portion identities, order checks, session progression.
- `controller.ts` and `ui.ts`: input, accessible HTML controls, delivery lifecycle.
- `scene.ts`: Three.js composition and raycasting.
- `cake-mesh.ts`, `cake-reference.ts`, `positions.ts`, `motion.ts`: shared wedge geometry, whole reference, spline layout, interpolation.
- `room.ts`, `props.ts`, `guest.ts`: kitchen, supplied CoffeeShopStarterPack props, procedural guest.

Cake geometry is procedural; no Unity runtime is required. Starter-pack artwork remains subject to its asset license. Keep the Unity source pack out of any public asset download distribution.

## Checks

Run from the parent Portfolio directory:

```powershell
node --experimental-strip-types --test sampleminigame/domain.test.ts
npx --yes --package typescript@5.9.3 tsc --project sampleminigame/tsconfig.json
node node_modules/vite/bin/vite.js build
```

Browser checks in `checks/gameplay.mjs` and `checks/transitions.mjs` require Playwright, Sharp, Microsoft Edge, and the running server on port 5173. Resolve these from installed packages, or set `CODEX_NODE_MODULES` to an existing dependency directory. Generated screenshots go into ignored `.checks/`.

Design intent and deferred features: `gamedesign.md`.
