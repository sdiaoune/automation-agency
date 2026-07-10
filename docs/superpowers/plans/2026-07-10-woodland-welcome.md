# Woodland Welcome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portrait-only, mobile-compatible third-person Three.js cottage exploration game with five cozy interactions and a porch sunset finale.

**Architecture:** Create an isolated Vite/TypeScript application under `woodland-welcome/`. Serializable simulation state remains independent of Three.js; procedural world builders adapt state into the scene, while dedicated input, UI, persistence, audio, and diagnostics modules surround one fixed-step application loop.

**Tech Stack:** TypeScript 5, Vite 7, Three.js, Vitest, Playwright, CSS, Web Audio API, localStorage.

## Global Constraints

- Compose gameplay for portrait aspect ratios from 9:16 through 3:4.
- When width exceeds height, pause simulation input and show a rotate-device screen; never provide landscape gameplay.
- Use a visible third-person character with idle, walk, and interaction poses.
- Touch input requires a floating left joystick, right-side camera drag, contextual action button, and safe-area-aware pause button.
- The five interactions are fireplace, kettle, record player, reading lamp, and upstairs window; they may be completed in any order.
- Completing all five unlocks the porch rocking-chair sunset finale.
- Save serializable progress locally after each interaction; restore at the entrance and provide reset in the pause menu.
- Keep combat, dialogue, inventory, crafting, furniture placement, multiplayer, cloud saves, and landscape mode out of scope.
- Target 60 FPS on current mid-range phones, retain 30 FPS playability, and cap device pixel ratio at 1.5.

## File Map

- `woodland-welcome/package.json`: commands and dependencies.
- `woodland-welcome/index.html`: canvas host and DOM UI mount points.
- `woodland-welcome/src/main.ts`: application composition only.
- `woodland-welcome/src/styles.css`: portrait HUD, controls, menus, loading, and orientation gate.
- `woodland-welcome/src/simulation/state.ts`: serializable state and progression transitions.
- `woodland-welcome/src/simulation/interactions.ts`: interaction targeting and comfort definitions.
- `woodland-welcome/src/persistence/save.ts`: versioned localStorage adapter.
- `woodland-welcome/src/input/actions.ts`: action state shared by all adapters.
- `woodland-welcome/src/input/keyboard.ts`: desktop fallback.
- `woodland-welcome/src/input/touch.ts`: joystick, look drag, and action pointer ownership.
- `woodland-welcome/src/input/orientation.ts`: portrait gate.
- `woodland-welcome/src/world/materials.ts`: reusable material palette.
- `woodland-welcome/src/world/house.ts`: exterior shell, rooms, floors, roof, doors, stairs, and collision bounds.
- `woodland-welcome/src/world/furniture.ts`: furniture and decorative props.
- `woodland-welcome/src/world/woodland.ts`: instanced trees, lawn, and path.
- `woodland-welcome/src/world/comforts.ts`: stateful comfort meshes and animation adapters.
- `woodland-welcome/src/player/controller.ts`: fixed-step character movement and collision.
- `woodland-welcome/src/player/avatar.ts`: procedural character and poses.
- `woodland-welcome/src/render/camera.ts`: spring follow, orbit, obstruction avoidance, and wall hiding.
- `woodland-welcome/src/render/app.ts`: renderer, lighting, resize, lifecycle, and loop.
- `woodland-welcome/src/ui/hud.ts`: objective, prompt, pause, completion, and orientation UI.
- `woodland-welcome/src/audio/audio.ts`: gesture-unlocked ambience and generated comfort sounds.
- `woodland-welcome/src/diagnostics/debug.ts`: development-only overlays and stats.
- `woodland-welcome/tests/*.test.ts`: simulation, persistence, input, and targeting unit tests.
- `woodland-welcome/e2e/game.spec.ts`: portrait browser journey and orientation coverage.

---

### Task 1: Scaffold the Isolated Game and Portrait Shell

**Files:**
- Create: `woodland-welcome/package.json`
- Create: `woodland-welcome/tsconfig.json`
- Create: `woodland-welcome/vite.config.ts`
- Create: `woodland-welcome/index.html`
- Create: `woodland-welcome/src/main.ts`
- Create: `woodland-welcome/src/styles.css`
- Create: `woodland-welcome/tests/shell.test.ts`

**Interfaces:**
- Produces: DOM IDs `game`, `hud`, `joystick`, `action-button`, `pause-button`, `rotate-gate`; scripts `dev`, `build`, `test`, `test:e2e`.

- [ ] **Step 1: Write the failing shell test**

```ts
// tests/shell.test.ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
describe('portrait shell', () => {
  it('contains every required control mount', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    for (const id of ['game','hud','joystick','action-button','pause-button','rotate-gate']) expect(html).toContain(`id="${id}"`);
  });
});
```

- [ ] **Step 2: Run the test and verify the missing scaffold failure**

Run: `cd woodland-welcome && npm test -- --run tests/shell.test.ts`
Expected: FAIL because `package.json` or `index.html` does not exist.

- [ ] **Step 3: Create the Vite project files and portrait DOM**

```json
{
  "name":"woodland-welcome","private":true,"type":"module",
  "scripts":{"dev":"vite --host 0.0.0.0","build":"tsc -b && vite build","test":"vitest","test:e2e":"playwright test"},
  "dependencies":{"three":"^0.180.0"},
  "devDependencies":{"@playwright/test":"^1.55.0","@types/three":"^0.180.0","typescript":"^5.9.0","vite":"^7.0.0","vitest":"^3.2.0"}
}
```

Create `index.html` with a full-screen `<canvas id="game">`, HUD mounts named above, viewport-fit metadata, and `<script type="module" src="/src/main.ts">`. Create `styles.css` with `touch-action:none`, safe-area padding, circular floating controls, and `#rotate-gate[hidden]{display:none}`. Create strict bundler TypeScript config and jsdom-free Vitest config.

- [ ] **Step 4: Install and verify**

Run: `cd woodland-welcome && npm install && npm test -- --run && npm run build`
Expected: shell test PASS and Vite build exits 0.

- [ ] **Step 5: Commit**

```bash
git add woodland-welcome
git commit -m "feat: scaffold Woodland Welcome portrait game"
```

### Task 2: Implement Serializable Progression and Persistence

**Files:**
- Create: `woodland-welcome/src/simulation/state.ts`
- Create: `woodland-welcome/src/persistence/save.ts`
- Create: `woodland-welcome/tests/state.test.ts`
- Create: `woodland-welcome/tests/save.test.ts`

**Interfaces:**
- Produces: `ComfortId`, `GameState`, `createInitialState()`, `activateComfort(state,id)`, `completeFinale(state)`, `objectiveText(state)`, `loadSave(storage)`, `saveGame(storage,state)`, `resetSave(storage)`.

- [ ] **Step 1: Write failing progression tests**

```ts
import { activateComfort, createInitialState, objectiveText } from '../src/simulation/state';
it('unlocks the porch after five unique comforts', () => {
  let s=createInitialState();
  for (const id of ['fireplace','kettle','recordPlayer','readingLamp','upstairsWindow'] as const) s=activateComfort(s,id);
  expect(s.porchUnlocked).toBe(true);
  expect(objectiveText(s)).toBe('Rest on the porch');
});
it('does not count a comfort twice', () => {
  const once=activateComfort(createInitialState(),'fireplace');
  expect(activateComfort(once,'fireplace')).toEqual(once);
});
```

- [ ] **Step 2: Run tests and verify missing-module failures**

Run: `npm test -- --run tests/state.test.ts tests/save.test.ts`
Expected: FAIL with unresolved `simulation/state` and `persistence/save`.

- [ ] **Step 3: Implement immutable state transitions and versioned saves**

```ts
export type ComfortId='fireplace'|'kettle'|'recordPlayer'|'readingLamp'|'upstairsWindow';
export interface GameState { version:1; comforts:Record<ComfortId,boolean>; porchUnlocked:boolean; finaleComplete:boolean }
export const COMFORT_IDS:ComfortId[]=['fireplace','kettle','recordPlayer','readingLamp','upstairsWindow'];
export function activateComfort(s:GameState,id:ComfortId):GameState {
  if(s.comforts[id]) return s;
  const comforts={...s.comforts,[id]:true};
  return {...s,comforts,porchUnlocked:COMFORT_IDS.every(k=>comforts[k])};
}
```

`loadSave` must parse key `woodland-welcome:v1`, validate `version===1` and boolean comfort fields, and return `createInitialState()` on missing, invalid, or incompatible data. `saveGame` serializes state. `resetSave` removes the key.

- [ ] **Step 4: Verify state and persistence**

Run: `npm test -- --run tests/state.test.ts tests/save.test.ts`
Expected: all progression, invalid-save, round-trip, and reset tests PASS.

- [ ] **Step 5: Commit**

```bash
git add woodland-welcome/src/simulation woodland-welcome/src/persistence woodland-welcome/tests
git commit -m "feat: add cozy progression and local saves"
```

### Task 3: Add Unified Keyboard, Touch, and Orientation Input

**Files:**
- Create: `woodland-welcome/src/input/actions.ts`
- Create: `woodland-welcome/src/input/keyboard.ts`
- Create: `woodland-welcome/src/input/touch.ts`
- Create: `woodland-welcome/src/input/orientation.ts`
- Create: `woodland-welcome/tests/input.test.ts`
- Create: `woodland-welcome/tests/orientation.test.ts`

**Interfaces:**
- Produces: `ActionState {moveX,moveY,lookX,lookY,interact,pause}`, `createActionState()`, `bindKeyboard(target,state)`, `bindTouch(root,state)`, `isPortrait(width,height)`, `bindOrientation(win,onChange)`.

- [ ] **Step 1: Write failing tests for action normalization and portrait gating**

```ts
it('normalizes diagonal movement',()=>{
  const s=createActionState(); s.setMove(1,1);
  expect(Math.hypot(s.moveX,s.moveY)).toBeCloseTo(1);
});
it('rejects a landscape viewport',()=>expect(isPortrait(844,390)).toBe(false));
it('accepts portrait and square viewports',()=>{ expect(isPortrait(390,844)).toBe(true); expect(isPortrait(600,600)).toBe(true); });
```

- [ ] **Step 2: Run tests and verify failures**

Run: `npm test -- --run tests/input.test.ts tests/orientation.test.ts`
Expected: FAIL because input modules are absent.

- [ ] **Step 3: Implement adapters with separate touch pointer ownership**

`ActionState` exposes `setMove(x,y)`, `addLook(dx,dy)`, `consumeLook()`, and `consumeInteract()`. `bindTouch` assigns one pointer ID to the joystick and a distinct pointer ID to the look region, uses pointer capture, limits the joystick knob to 56 CSS pixels, and resets only the released pointer's action. `bindOrientation` invokes `onChange(isPortrait(innerWidth,innerHeight))` on startup, resize, and orientation change.

- [ ] **Step 4: Verify and build**

Run: `npm test -- --run tests/input.test.ts tests/orientation.test.ts && npm run build`
Expected: tests PASS and TypeScript reports no event-listener type errors.

- [ ] **Step 5: Commit**

```bash
git add woodland-welcome/src/input woodland-welcome/tests
git commit -m "feat: add portrait touch and keyboard input"
```

### Task 4: Build the Cottage, Interior, Furniture, and Woodland

**Files:**
- Create: `woodland-welcome/src/world/materials.ts`
- Create: `woodland-welcome/src/world/house.ts`
- Create: `woodland-welcome/src/world/furniture.ts`
- Create: `woodland-welcome/src/world/woodland.ts`
- Create: `woodland-welcome/tests/world.test.ts`

**Interfaces:**
- Produces: `WorldBuild {root:THREE.Group, colliders:Box3[], cameraOccluders:Object3D[], spawn:Vector3}`, `buildHouse(palette)`, `buildFurniture(palette)`, `buildWoodland(palette)`, `createPalette()`.

- [ ] **Step 1: Write failing world-contract tests**

```ts
it('builds named rooms and a safe entrance spawn',()=>{
  const world=buildHouse(createPalette());
  for(const n of ['living-room','kitchen','ground-bedroom','bathroom','loft','porch']) expect(world.root.getObjectByName(n)).toBeTruthy();
  expect(world.spawn.y).toBeGreaterThanOrEqual(0);
  expect(world.colliders.length).toBeGreaterThan(12);
});
```

- [ ] **Step 2: Run and verify missing world implementation**

Run: `npm test -- --run tests/world.test.ts`
Expected: FAIL with unresolved world modules.

- [ ] **Step 3: Implement procedural environment builders**

Use meters as world units. Build a 10×7 meter cottage with 2.7 meter ground-floor walls, sloped roof, front dormer, open living/kitchen circulation, rear rooms, 0.9-meter doors, and traversable stairs. Furniture builders create the approved room contents using beveled primitives and shared geometries. Woodland uses `InstancedMesh` for at least 28 trunks and canopy clusters; only the directional sun casts shadows.

- [ ] **Step 4: Verify geometry contracts and draw-call discipline**

Run: `npm test -- --run tests/world.test.ts && npm run build`
Expected: tests PASS; build exits 0; repeated trees use `InstancedMesh`.

- [ ] **Step 5: Commit**

```bash
git add woodland-welcome/src/world woodland-welcome/tests/world.test.ts
git commit -m "feat: build furnished cottage and woodland"
```

### Task 5: Implement Character Movement, Collisions, and Third-Person Camera

**Files:**
- Create: `woodland-welcome/src/player/avatar.ts`
- Create: `woodland-welcome/src/player/controller.ts`
- Create: `woodland-welcome/src/render/camera.ts`
- Create: `woodland-welcome/tests/controller.test.ts`
- Create: `woodland-welcome/tests/camera.test.ts`

**Interfaces:**
- Produces: `Avatar {root,updatePose(speed,interacting,dt)}`, `CharacterController.step(dt,actions,cameraYaw,colliders)`, `FollowCamera.update(dt,target,lookDelta,occluders)`.

- [ ] **Step 1: Write failing deterministic movement and camera-clamp tests**

```ts
it('moves relative to camera at fixed speed',()=>{
  const c=new CharacterController(new Vector3());
  c.step(1,{moveX:0,moveY:1},Math.PI/2,[]);
  expect(c.position.x).toBeCloseTo(2.4); expect(c.position.z).toBeCloseTo(0);
});
it('clamps vertical orbit',()=>{
  const c=new FollowCamera(new PerspectiveCamera()); c.orbit(0,100);
  expect(c.pitch).toBeLessThanOrEqual(0.85);
});
```

- [ ] **Step 2: Run and verify missing player modules**

Run: `npm test -- --run tests/controller.test.ts tests/camera.test.ts`
Expected: FAIL because controller and camera are absent.

- [ ] **Step 3: Implement capsule-like movement and spring camera**

Move at 2.4 m/s with fixed 1/60-second steps, resolve the character's horizontal circle against expanded `Box3` colliders, and allow bounded stair height changes. Rotate avatar toward velocity and drive limb swing from speed. Follow camera uses exponential smoothing `1-Math.exp(-10*dt)`, yaw orbit, pitch range `[-0.15,0.85]`, desired distance 4.2 meters, and ray-shortening against camera occluders to a minimum 1.1 meters.

- [ ] **Step 4: Verify movement and camera tests**

Run: `npm test -- --run tests/controller.test.ts tests/camera.test.ts && npm run build`
Expected: tests PASS and build exits 0.

- [ ] **Step 5: Commit**

```bash
git add woodland-welcome/src/player woodland-welcome/src/render/camera.ts woodland-welcome/tests
git commit -m "feat: add third-person movement and camera"
```

### Task 6: Add Comfort Objects, Targeting, Audio, and HUD

**Files:**
- Create: `woodland-welcome/src/simulation/interactions.ts`
- Create: `woodland-welcome/src/world/comforts.ts`
- Create: `woodland-welcome/src/audio/audio.ts`
- Create: `woodland-welcome/src/ui/hud.ts`
- Create: `woodland-welcome/tests/interactions.test.ts`
- Create: `woodland-welcome/tests/hud.test.ts`

**Interfaces:**
- Produces: `InteractionAnchor {id,label,position,radius,facingDot}`, `selectInteraction(player,forward,anchors,state)`, `ComfortViews.apply(state,dt)`, `AudioSystem.unlock()`, `Hud.render(state,target,portrait)`.

- [ ] **Step 1: Write failing nearest-facing-target tests**

```ts
it('selects the nearest incomplete object in range and view',()=>{
  const target=selectInteraction(new Vector3(),new Vector3(0,0,-1),anchors,createInitialState());
  expect(target?.id).toBe('fireplace');
});
it('hides completed comfort targets',()=>{
  const state=activateComfort(createInitialState(),'fireplace');
  expect(selectInteraction(new Vector3(),new Vector3(0,0,-1),anchors,state)?.id).not.toBe('fireplace');
});
```

- [ ] **Step 2: Run and verify failures**

Run: `npm test -- --run tests/interactions.test.ts tests/hud.test.ts`
Expected: FAIL with missing interaction and HUD modules.

- [ ] **Step 3: Implement the five stateful comfort views and DOM HUD**

Add flame sprites and amber point light, kettle steam particles with a timed oscillator whistle, rotating record with a quiet generated music bed, emissive reading lamp, and opening window sash plus curtain sway. `AudioSystem.unlock()` creates/resumes `AudioContext` only after a pointer or keyboard gesture. HUD text is exactly `Make the cottage cozy · N/5`, then `Rest on the porch`; contextual action label uses the anchor label.

- [ ] **Step 4: Verify interaction rules and UI copy**

Run: `npm test -- --run tests/interactions.test.ts tests/hud.test.ts && npm run build`
Expected: tests PASS and build exits 0.

- [ ] **Step 5: Commit**

```bash
git add woodland-welcome/src/simulation woodland-welcome/src/world/comforts.ts woodland-welcome/src/audio woodland-welcome/src/ui woodland-welcome/tests
git commit -m "feat: add cozy interactions and HUD"
```

### Task 7: Compose the Runtime, Finale, Lifecycle, and Accessibility Settings

**Files:**
- Create: `woodland-welcome/src/render/app.ts`
- Create: `woodland-welcome/src/diagnostics/debug.ts`
- Modify: `woodland-welcome/src/main.ts`
- Modify: `woodland-welcome/src/styles.css`
- Create: `woodland-welcome/tests/app.test.ts`

**Interfaces:**
- Produces: `GameApp.start()`, `GameApp.pause(reason)`, `GameApp.resume(reason)`, `GameApp.dispose()`, `GameApp.triggerFinale()`.

- [ ] **Step 1: Write failing pause-reason and finale tests**

```ts
it('remains paused until every active reason clears',()=>{
  const app=createHeadlessApp(); app.pause('landscape'); app.pause('menu'); app.resume('menu');
  expect(app.isPaused).toBe(true); app.resume('landscape'); expect(app.isPaused).toBe(false);
});
it('finale requires the porch unlock',()=>expect(createHeadlessApp().triggerFinale()).toBe(false));
```

- [ ] **Step 2: Run and verify missing app failures**

Run: `npm test -- --run tests/app.test.ts`
Expected: FAIL because `GameApp` is absent.

- [ ] **Step 3: Implement the composed runtime**

Create WebGL renderer with DPR `Math.min(devicePixelRatio,1.5)`, SRGB output, ACES tone mapping, one shadowed directional sun, cool hemisphere fill, and warm practical lights. Advance movement at a clamped fixed step, pause on document hidden, orientation gate, menu, context loss, or finale rail. The finale interpolates camera and sun color for six seconds, then shows `The cottage feels like home.` with Continue Exploring and Replay buttons. Settings expose mute, camera sensitivity, and reduced motion; persist them separately from progression.

- [ ] **Step 4: Verify unit suite and production build**

Run: `npm test -- --run && npm run build`
Expected: all unit tests PASS and production build exits 0.

- [ ] **Step 5: Commit**

```bash
git add woodland-welcome/src woodland-welcome/tests
git commit -m "feat: compose game runtime and sunset finale"
```

### Task 8: Add Portrait End-to-End Tests and Final Playtest Fixes

**Files:**
- Create: `woodland-welcome/playwright.config.ts`
- Create: `woodland-welcome/e2e/game.spec.ts`
- Modify: files identified by failing tests only.

**Interfaces:**
- Consumes: public DOM IDs, `window.__WOODLAND_DEBUG__` development hook exposing `activateComfort(id)`, `state()`, and `playerPosition()`.
- Produces: repeatable Chromium portrait journey and landscape-blocking coverage.

- [ ] **Step 1: Write the failing browser journey**

```ts
test.use({viewport:{width:390,height:844},hasTouch:true});
test('completes and persists the cozy visit',async({page})=>{
  await page.goto('/'); await expect(page.locator('#rotate-gate')).toBeHidden();
  for(const id of ['fireplace','kettle','recordPlayer','readingLamp','upstairsWindow']) await page.evaluate(id=>window.__WOODLAND_DEBUG__.activateComfort(id),id);
  await expect(page.locator('#objective')).toHaveText('Rest on the porch');
  await page.reload(); await expect(page.locator('#objective')).toHaveText('Rest on the porch');
});
test('blocks landscape gameplay',async({page})=>{
  await page.setViewportSize({width:844,height:390}); await page.goto('/');
  await expect(page.locator('#rotate-gate')).toBeVisible();
});
```

- [ ] **Step 2: Run and verify the browser tests fail before debug integration**

Run: `npm run test:e2e`
Expected: FAIL because Playwright config or debug hook is missing.

- [ ] **Step 3: Add test-safe debug hooks and fix browser findings**

Expose the debug hook only when `import.meta.env.DEV` is true. Use it to verify state without bypassing production controls. Fix only observed startup, collision, UI, touch, or orientation defects; add a regression unit test for each logic defect before the correction.

- [ ] **Step 4: Run full verification**

Run: `npm test -- --run && npm run build && npm run test:e2e`
Expected: unit tests PASS, production build PASS, and portrait/landscape Chromium tests PASS.

- [ ] **Step 5: Perform manual portrait playtest**

Run: `npm run dev -- --host 0.0.0.0`
Verify at 390×844 and 430×932: simultaneous joystick/look input, every doorway and stair, all comfort effects, pause/reset, reload persistence, rotate gate, finale, reduced motion, mute, and no camera penetration. Record any defect as a failing automated test before changing code.

- [ ] **Step 6: Commit**

```bash
git add woodland-welcome
git commit -m "test: verify portrait cozy exploration journey"
```

## Completion Gate

Run from `woodland-welcome/`:

```bash
npm test -- --run
npm run build
npm run test:e2e
```

All commands must exit 0. The final handoff must include the local run command, production output path, automated test totals, known device limitations, and links to the design and plan documents.
