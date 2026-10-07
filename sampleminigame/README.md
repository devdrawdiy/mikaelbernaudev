# Kafé Tårtbiten

One-page Three.js fraction bakery. Open `/sampleminigame/` on the parent Portfolio project's Vite server.

Swedish is the default language, with English available only in the top bar. Switching language preserves the current order, cake cuts, tray, appearance, and stars. Replay retains the chosen language; reloading returns to Swedish. The cakes are chokladtårta, citrontårta, and hallontårta (chocolate, lemon, and raspberry cake).

## Demo

Serve six randomly ordered guests. Cake flavours and quantities change each round. Denominators favor smaller pieces, while fractional numerators are uniformly random from 1 through denominator minus 1. Every requested amount includes a fraction, optionally with up to three whole cakes. Mixed-flavour orders always fit seven tray plates.

Each session draws six distinct names from a pool of 40: 20 female and 20 male names, including Ukrainian, English, Syrian, and other international names. Name selection is independent of customer skin tone.

Cut whole cakes into 2-12 equal pieces or transfer a complete cake directly. Emptying a cake automatically replenishes it. Cake controls select existing batches; returning a portion brings its original cake into focus. Recutting restores only the focused cake, preserving other cakes of the same flavour. Equivalent fractions work; Simplify merges pieces without changing quantity. Served cakes fly right, followed by the guest; the next guest enters from the left and waves with their left arm. Play again resets the session and draws new orders.

Mouse, touch, and keyboard controls are available. Audio starts muted. Reduced-motion preferences replace travel with immediate placement. Mobile uses a vertically scrolling layout.

Each arriving customer independently gets one of three skin tones with equal probability. Face and hands match; hair stays unchanged. The chosen tone remains stable while preparing their order; replay rolls a new first customer.

Reducible portions pulse gently. Simplify opens an optional translucent equation overlay starting with `divide by ?`: choose a plate and one of up to four shuffled divisor options, preview the equivalent fraction, then join pieces. No answer is preselected. Partial reductions can be repeated. Each valid merge earns one star; stars persist between guests, appear at the ending, and reset on replay. Cancelling changes nothing; reduced motion disables pulsing.

## Structure

- `catalog.ts`, `orders.ts`: cake appearances and weighted, capacity-bounded random orders.
- `domain.ts`, `inventory.ts`, `fractions.ts`: multi-cake inventory, plate reservations, exact fraction totals, portion identities, order checks, session progression.
- `controller.ts` and `ui.ts`: input, accessible HTML controls, delivery lifecycle.
- `i18n.ts`, `locales/`, `locale-ui.ts`: i18next translations, Swedish defaults, language selection, and accessible labels.
- `guest-names.ts`: shared 40-name customer pool.
- `simplification.ts`, `simplification.css`, `divisor-choices.ts`: optional multiple-choice mini-game, equation preview, plate selection, reward presentation.
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

Browser checks in `checks/gameplay.mjs`, `checks/simplification.mjs`, `checks/guest-skin.mjs`, `checks/transitions.mjs`, and `checks/localization.mjs` require Playwright, Sharp, Microsoft Edge, and the running server on port 5173. Resolve these from installed packages, or set `CODEX_NODE_MODULES` to an existing dependency directory. Generated screenshots go into ignored `.checks/`.

Design intent and deferred features: `gamedesign.md`.
