# Fraction Bakery

Working game design for a one-page portfolio sample. Proposed defaults below remain open to iteration.

## Concept

Run a small bakery serving guests. Bring cakes from display case to workbench, divide each into equal pieces, and assemble requested portions. Play with mathematical objects while completing a concrete story task. Working session proposal: serve six guests, then show a simple Play again button; exact guest count remains to be confirmed.

Audience: children aged 7-12. Initial sample makes basic fractions approachable through exploration, without memorization, mastery tests, or a mathematical final exam. Harder modes can come later. Intended session: roughly 3-5 minutes, to be checked through playtesting.

Portfolio goal: demonstrate an engaging completion loop, mathematically faithful manipulation, readable feedback, and polished 3D interaction in one compact experience.

## Experience And Victory

- Role: baker serving one guest order at a time.
- Objective: finish a finite story task, provisionally serving six guests. Ten points is another possible ending; prefer visible guest satisfaction for this standalone sample.
- Visible progress: guest count tracks completed deliveries, not knowledge demonstrated.
- Completion: final delivery finishes short round; no celebration sequence, stamp, or elaborate reward screen needed for demo.
- Ending: simple Play again button resets orders, guest progress, tray, cake cuts, and simplification state; all cakes restart whole.
- Errors: recoverable indefinitely; no lives, countdown, public ranking, or penalty for taking time.
- Rewards: visible delivery, customer response, and completing round. Coins and cross-game upgrades remain outside initial scope.

Completion comes from helping guests. Matching portions gives actions meaning within bakery; it does not measure or certify knowledge. Keep demo ending minimal, with replay as its only action.

## Fraction Exploration

1. Denominator: number of equal parts making one whole cake.
2. Numerator: number of those parts selected for an order.
3. Relative size: more equal parts means smaller individual pieces of the same whole.
4. Exploration: repartition cake freely and see how number and size of pieces change. Proposed range is every integer denominator from 2 through 12, including fifths, sevenths, and elevenths.
5. Equivalent portions such as `1/2` and `2/4` remain valid. Optional simplification lets player explore how different groupings describe the same amount, without a lesson or quiz.

One third means one piece of a whole divided into three equal pieces; two thirds means two such pieces. More divisions are mathematically possible, but sample stops at twelfths to keep pieces usable. All cakes share the same whole size; flavor quantities remain separate.

No fraction addition, repeated same-flavor sums, or harder final challenge in proof of concept. Combining an order means placing portions of different cakes on one tray. Playtesting should focus on enjoyment, willingness to experiment, and whether visual relationships are clear.

### Optional Simplification

Simplification physically merges pieces of the same flavor when numerator and denominator share a factor greater than one: `3/12 -> 1/4` merges three twelfths into one quarter; `6/8 -> 3/4` merges six eighths into three quarters. Divide numerator and denominator by their greatest common divisor, grouping that many original slices per merged piece. Quantity and flavor stay unchanged; simplification never gates delivery or story progress.

Confirmed trigger: a Simplify button for each flavor's tray portion, available only when that nonempty portion is reducible. One tap animates physical merging and updates fraction label and visible piece count together; pieces may reshape without physical realism. Keep whole reference visible and retain original slice identities: returning a merged piece splits it back into source slices. Source cake keeps its existing partition.

## Screen And Art Direction

One full-screen bakery scene, immediately playable. Fixed camera presents counter and display case; selecting a cake brings it into a readable close-up without free camera navigation.

- Upper area: current customer and short order ticket, with stacked fraction notation and cake icons.
- Middle: focused cake, numeric piece-count field with minus/plus buttons, and cut action; whole-cake reference always visible. Count can be typed or adjusted with counter widget.
- Lower area: serving tray with a separate cake-shaped group for each flavor, each with its quantity label and Simplify button, plus serve control. Simplify is unavailable when portion is empty or already irreducible.
- Progress: compact guest count stays visible without obscuring workbench.
- Display case: three recognizable cake types, provisionally lemon, chocolate, and cheesecake, distinguished by decoration, name, and color.

Art: stylized tactile cakes, clear frosting layers, readable slice boundaries, and restrained bakery props. Flavor silhouettes and labels remain distinguishable without color. Use supplied CoffeeShopStarterPack cupboards, displays, plates, appliances, and decorative pastries; match procedural cakes to its low-poly style.

## Core Loop

1. Read or listen to customer's order.
2. Select a fresh, whole cake from display case; it moves to workbench intact, without predefined cuts.
3. Type desired piece count or use minus/plus counter, then activate cut. Proposed count range is every integer from 2 through 12; customer request never automatically cuts cake.
4. Cake divides into chosen number of equal pieces, then separates along a curved guide, exposing each piece and its fraction label.
5. Tap a piece to transfer it to serving tray. Its position smoothly interpolates from cake to tray; current quantity updates with transfer. Tapping a tray piece animates it back to cake.
6. Switch flavors as needed. Previous cake closes and returns to display case, preserving missing pieces.
7. Press serve. Correct tray becomes a delivery; incorrect tray stays editable with specific feedback.
8. Cake portions fly out to the right; satisfied guest follows. Delivery count advances and next guest enters from the left. Fresh cakes appear for next order; final guest leaves before Play again appears.

Tap-to-transfer is confirmed for demo; dragging is a future extension. Reserve slice and its destination when tapped, allowing only one transfer per slice at a time. Animate position independently of quantity validation; every transfer remains reversible once movement finishes. Reduced motion uses immediate placement.

Every fresh cake starts as one visibly intact whole. Editing count proposes a division; cut action commits it. Empty, noninteger, or out-of-range input must not cut cake. Previously used cakes retain missing pieces within current order; fresh wholes appear for next guest.

## Cake Unfurling

Treat unfurling as an exploded view of equal wedge slices. Present cake face toward camera so its circular whole and divisions are easy to inspect. Whole-cake outline remains beside or behind expanded pieces.

Slice positions follow a spline from assembled circle to spread arrangement. Each wedge stays rigid, with unchanged area, volume, and fraction value. Animate orientation only as needed for inspection. Do not stretch wedges into bars or let perspective imply unequal portions.

Use a fixed focus scale for every denominator. Changing from four to three pieces should visibly produce fewer, larger wedges belonging to the same whole. Labels show `1/4` or `1/3` on pieces; selected quantity can show `2/3` beside tray.

After transfer, empty positions remain visible in whole reference. Returning cake to shelf must retain gaps; replenishment happens only after successful delivery. This preserves conservation of cake within each order.

### Procedural Cake Construction

One reusable slice generator builds every cake. For denominator `n`, generate a wedge with angle `2*pi/n`, then create `n` instances rotated by `i*2*pi/n`. Radius, height, and frosting layers stay constant, keeping every assembled cake the same whole size. Changing denominator regenerates wedge geometry; scaling a fixed wedge would distort cake shape.

Share geometry and materials within each partition. Flavor comes from sponge, filling, frosting, and toppings rather than separately authored cake models. Each slice remains individually selectable and movable along spline. Its identity persists between cake, tray, and undo; decorative toppings must not change mathematical portion size.

## Partition And Undo Rules

- Each flavor has one whole cake available per order; sample requests never exceed one whole of any flavor.
- Before transfer, player can change count and cut again to explore divisions. Each cut partitions the same whole, preserving cake radius, height, and total quantity.
- After transfer, player can edit count and cut again. Cut first returns all tray pieces of that flavor, visibly reassembles whole, then applies new division. Other flavors stay on tray; editing input alone never returns pieces.
- Returning a piece restores its original wedge position and subtracts its exact quantity from tray. A merged piece returns all slices it represents, splitting back into source partition; recutting likewise restores original slices before creating new division.
- Clear-tray control returns every piece; switching cake never clears tray or loses progress.
- Serve compares total amount of each flavor against request, accepting mathematically equivalent partitions.
- Each ticket has at most one requested quantity per flavor. Multiple flavors share tray in separate cake-shaped groups with separate fraction labels; their values are never added together or merged across flavors.
- Unrequested flavors and excess quantities prevent delivery; feedback identifies the mismatch.

Example: guest requests `2/3` lemon, half chocolate, and `1/8` cheesecake. Player transfers each portion to same tray. Half chocolate can be one half or two quarters; no written calculation or explanation is required.

## Proposed Six-Guest Session

| Guest | Customer request | Interaction variety | Visible outcome |
| --- | --- | --- | --- |
| 1 | `1/2` chocolate | Pick cake, explore pieces, serve | First guest receives cake |
| 2 | `2/3` lemon | Select several equal pieces | Another happy guest |
| 3 | `1/8` cheesecake | Explore smaller slices | Third delivery completed |
| 4 | `1/4` chocolate and `1/2` lemon | Switch cakes while keeping tray | Two-flavor delivery |
| 5 | `3/5` lemon | Explore another partition | Fifth delivery completed |
| 6 | `2/3` lemon, `1/2` chocolate, `1/8` cheesecake | Assemble three-flavor order | Round ends; Play again appears |

These are proposed orders, not a curriculum or difficulty ladder. Final guest is another bakery order, not a knowledge test. All supported partitions remain available for exploration throughout session.

Initial session uses authored orders for reliable pacing. Replay repeats them with fresh state. More order sets belong after first sample works.

## Feedback And Help

Show target and current amount together for each requested flavor. Quantities should remain visible as cake portions as well as symbols. Serve stays available whenever tray contains cake, allowing informative feedback on incomplete orders.

- Too little: "Chocolate: you have 1/4. Order needs 1/2."
- Too much: "Lemon: you have 3/3. Order needs 2/3."
- Wrong flavor: "This order needs chocolate and lemon."
- Correct: brief customer response, tray delivery animation, next order.
- Help: repeat order, highlight relevant cake, or compare target with current portion using common partition markings.

Help must preserve enjoyable manipulation; automatic partition guidance remains a design option. First order introduces controls through restrained highlighting and customer request. Avoid long tutorial panels. Customer speech has matching visible text; audio has mute and replay controls.

## Accessibility And Input

Use HTML controls over Three.js scene for tickets, partition choices, quantities, and actions. Provide accessible cake and slice selection controls so gameplay is not restricted to canvas hit targets.

Support mouse, touch, and keyboard; visible focus; comfortable touch targets; fraction labels readable on small screens; reduced motion; optional sound. Click or tap selection must work without dragging. Reduced motion replaces camera travel and unfurling with immediate stable poses.

## Implementation Boundaries

Demo now implements Three.js bakery gameplay in `index.html` and `main.ts`, composed from independent fraction state, controls, procedural cake meshes, animation, and scene modules. The original `player.ts` square starter remains unused.

Keep exact fraction arithmetic and order validation independent of rendering. Store integer numerator/denominator values; compare by exact integer operations for small sample values. View animation never determines correctness. Separate session progression, cake partition state, input, and scene presentation through small composed modules.

Essential build: one procedural slice generator, three cake appearances, partitions from 2 through 12, a short set of guest orders, focus/unfurl/close animation, reversible transfer, exact validation, visible deliveries, accessible controls, and Play again reset. Reuse wedge geometry and cake materials where practical.

Optional polish: recorded customer voices, gentle sound effects, expressive guests, and richer spline choreography. Defer dragging, currencies, upgrades, free movement, timed service, accounts, online leaderboards, and procedural difficulty.

## Validation And Working Defaults

- Mathematical checks: partitions have equal pieces; simplification merges correct same-flavor groups without changing amount; merged-piece undo restores original slices; equivalent fractions accepted; recutting restores whole cake and preserves other flavors.
- Interaction checks: complete session with mouse, touch, and keyboard; replay resets everything; fast taps cannot duplicate slices or deliveries; resize preserves order state.
- Visual checks: inspect desktop and mobile views; wedges and labels remain readable; no overlapping controls; 3D canvas renders visible cakes; reduced motion remains playable.
- Playtest observations: does player experiment with divisions, enjoy moving portions, recover comfortably from mismatches, and notice changing piece sizes? No explanation or knowledge demonstration required to finish.
- Success signal: player enjoys making deliveries, understands story progress, and reaches a distinct ending. Completion measures guests served, not mastery, speed, or memorization.
- Consensus: playful fraction exploration, intact starting cakes, typed or counter-based cutting, reassembly before recutting, animated tap transfers, separate flavor groups, Simplify button with physical merging, and Play again ending. Enough direction exists to implement demo without further essential questions.
- Adjustable defaults: six guest orders, denominator cap 12, English text, mouse/touch/keyboard, and gentle mismatch feedback without penalties. Guest appearance remains a presentation choice. Harder modes, dragging, and cross-game progression are future possibilities.
