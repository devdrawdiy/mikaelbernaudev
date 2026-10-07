# Little Slice

One-page Three.js fraction bakery. Open `/sampleminigame/` on the parent Portfolio project's Vite server.

## Demo

Serve six randomly ordered guests. Cake flavours and quantities change each round. Denominators favor smaller pieces, while fractional numerators are uniformly random from 1 through denominator minus 1. Every requested amount includes a fraction, optionally with up to three whole cakes. Mixed-flavour orders always fit seven tray plates.

Cut whole cakes into 2-12 equal pieces or transfer a complete cake directly. Emptying a cake automatically replenishes it. Cake controls select existing batches; returning a portion brings its original cake into focus. Recutting restores only the focused cake, preserving other cakes of the same flavour. Equivalent fractions work; Simplify merges pieces without changing quantity. Served cakes fly right, followed by the guest; the next guest enters from the left and waves with their left arm. Play again resets the session and draws new orders.

Mouse, touch, and keyboard controls are available. Audio starts muted. Reduced-motion preferences replace travel with immediate placement. Mobile uses a vertically scrolling layout.

Reducible portions pulse gently. Simplify opens an optional translucent equation overlay: choose a plate and divisor, preview the equivalent fraction, then join pieces. Partial reductions can be repeated. Each valid merge earns one star; stars persist between guests, appear at the ending, and reset on replay. Cancelling changes nothing; reduced motion disables pulsing.

## Structure

- `catalog.ts`, `orders.ts`: cake appearances and weighted, capacity-bounded random orders.
- `domain.ts`, `inventory.ts`, `fractions.ts`: multi-cake inventory, plate reservations, exact fraction totals, portion identities, order checks, session progression.
- `controller.ts` and `ui.ts`: input, accessible HTML controls, delivery lifecycle.
- `simplification.ts`, `simplification.css`: optional divisor mini-game, equation preview, plate selection, reward presentation.
- `scene.ts`: Three.js composition and raycasting.
- `cake-mesh.ts`, `positions.ts`, `motion.ts`: shared wedge geometry, invisible spline layout, interpolation.
- `room.ts`, `props.ts`, `guest.ts`, `guest-greeting.ts`: kitchen, supplied CoffeeShopStarterPack props, procedural guest and arrival greeting.

Cake geometry is procedural; no Unity runtime is required. Starter-pack artwork remains subject to its asset license. Keep the Unity source pack out of any public asset download distribution.

## Checks

Run from the parent Portfolio directory:

```powershell
node --experimental-strip-types --test sampleminigame/*.test.ts
npx --yes --package typescript@5.9.3 tsc --project sampleminigame/tsconfig.json
node node_modules/vite/bin/vite.js build
```

Browser checks in `checks/gameplay.mjs`, `checks/simplification.mjs`, and `checks/transitions.mjs` require Playwright, Sharp, Microsoft Edge, and the running server on port 5173. Resolve these from installed packages, or set `CODEX_NODE_MODULES` to an existing dependency directory. Generated screenshots go into ignored `.checks/`.

Design intent and deferred features: `gamedesign.md`.
