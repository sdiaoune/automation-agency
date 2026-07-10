# Woodland Welcome — Game Design Specification

## Product Summary

Woodland Welcome is a portrait-only, third-person Three.js exploration game based on the modeled charcoal cottage. The player spends five to ten minutes walking through a warmly furnished home, activating five comfort objects, and ending the visit by resting on the front porch at sunset.

The initial release is a polished single-player browser experience designed primarily for touch phones. Desktop keyboard and pointer input is supported for development, accessibility, and testing, but the composition remains portrait-first.

## Player Experience

The emotional target is quiet curiosity rather than challenge. There is no failure state, time pressure, combat, inventory, or dialogue tree. The player is rewarded with warmer lighting, richer ambient sound, and small environmental animations as the cottage becomes cozier.

The session flow is:

1. Begin on the front path with the porch and house in view.
2. Enter the cottage and explore at the player's pace.
3. Activate the fireplace, kettle, record player, reading lamp, and upstairs window in any order.
4. Return to the porch when the five comforts are active.
5. Use the rocking chair to trigger a brief sunset finale and completion state.

Progress is saved locally after every completed interaction. Reloading restores completed comforts and places the character at the front entrance. A reset control is available inside the pause menu.

## Interior Design

The unseen interior follows a compact one-and-a-half-story cottage floor plan consistent with the exterior proportions.

### Ground Floor

- The front door opens into an open living room.
- The left side contains a plaster fireplace, sofa, layered rug, coffee table, low bookshelves, and a reading nook with the interactive lamp.
- The rear-right contains a compact kitchen with shaker cabinets, butcher-block counters, a farmhouse sink, a stove, the interactive kettle, and a two-seat breakfast table.
- A small record console sits between living and dining areas.
- A short rear hall leads to a downstairs bedroom and bathroom represented as furnished, accessible rooms.
- A stair runs along the right interior wall to the loft.

### Upper Floor

- The upper level is a loft bedroom beneath the sloped roof.
- It contains a low bed, bedside tables, a dresser, storage baskets, and a writing desk.
- The paired dormer windows provide the interactive upstairs-window moment and a framed view of the woodland.

### Visual Language

- Warm oak floors, cream plaster walls, charcoal millwork, off-white trim, and muted green textiles connect the interior to the exterior.
- Furniture uses softened low-poly forms with coherent real-world scale.
- Lighting combines cool woodland daylight with warm practical lights. Each comfort interaction shifts the balance toward amber.
- Decorative density is moderate: plants, framed botanical prints, books, ceramics, folded throws, and rugs provide character without creating collision clutter.
- The porch includes a rocking chair, side table, planters, railing, and the finale interaction.

## Character and Camera

The player controls a visible stylized third-person character approximately 1.7 world units tall. The character has idle, walk, and interaction poses. The initial implementation may use a procedural low-poly character so the game does not depend on an external character license or download.

The camera is a spring-smoothed over-the-shoulder camera. It follows behind and above the character, supports constrained orbit input, avoids clipping through walls with a camera collision ray, and tightens its distance in small rooms. Interior walls between the camera and character fade or hide to preserve readability.

## Input and Portrait-Only Behavior

### Touch

- A floating joystick in the lower-left controls movement relative to the camera.
- Dragging the right half of the playfield orbits the camera.
- A large contextual action button in the lower-right appears near usable objects.
- A small pause button remains at the top-right within the device safe area.
- Controls support simultaneous joystick movement and camera drag through separate pointer IDs.

### Desktop and Testing

- WASD or arrow keys move.
- Pointer drag orbits the camera.
- E or Space activates the current interaction.
- Escape opens the pause menu.

### Orientation

Gameplay is composed for portrait aspect ratios from 9:16 through 3:4. When the viewport is wider than it is tall, simulation input pauses and a full-screen rotate-device message replaces the HUD. Resuming portrait orientation restores play without resetting state.

## Interaction Design

The five comfort objects are stateful and can be completed in any order:

1. Fireplace: unlit logs gain flames, ember light, and crackling audio.
2. Kettle: the kettle steams and produces a gentle whistle that stops automatically.
3. Record player: the turntable spins and starts a soft instrumental loop.
4. Reading lamp: the shade glows and the reading nook gains warm light.
5. Upstairs window: the sash opens, curtains move, and woodland ambience becomes clearer.

An interaction is available when the character is within range and generally facing the object. The nearest valid object wins when ranges overlap. The action button and a small object label appear only while a target is valid.

The objective chip reports a concise next state such as “Make the cottage cozy · 3/5.” Completed objects remain active. When all five are complete, the objective changes to “Rest on the porch.” Activating the rocking chair disables movement, moves the camera to a short scenic rail, transitions the lighting to sunset, displays the completion message, and then exposes replay and continue-exploring actions.

## Technical Architecture

The game is an isolated Vite + TypeScript project under `woodland-welcome/`. It uses Three.js directly rather than React Three Fiber so scene composition, camera behavior, animation, and the render loop remain explicit.

Modules are separated by responsibility:

- `simulation/`: serializable player position, comfort states, progression, and finale state.
- `render/`: renderer lifecycle, scene construction, cameras, materials, lighting, animation adapters, and resize/context recovery.
- `world/`: house shell, interior rooms, furniture builders, woodland, interaction anchors, and collision geometry.
- `input/`: action map, keyboard adapter, virtual joystick, pointer-look controller, and orientation gate.
- `physics/`: fixed-step character movement, capsule collision, stairs, doors, and camera obstruction checks.
- `ui/`: portrait HUD, contextual prompt, pause menu, rotate-device gate, loading screen, and completion overlay.
- `audio/`: gesture-unlocked ambient and interaction audio with mute support.
- `persistence/`: versioned local-storage serialization and reset handling.
- `diagnostics/`: development-only collision, performance, and interaction visualizers.

Simulation state is authoritative and contains no Three.js objects. Rendering reads snapshots and reflects them into meshes, lights, particles, and sound. The main loop clamps frame delta, advances movement at a fixed timestep, updates interactions, synchronizes rendering, and renders once per animation frame.

## Geometry and Asset Strategy

The first playable version uses procedural Three.js geometry and reusable material factories for the house, furniture, foliage, and character. This keeps the project self-contained and permits fast spatial iteration against the existing Blender reference.

The Blender scene remains a visual and dimensional reference rather than a runtime dependency. If authored assets are introduced later, they will ship as optimized GLB or glTF 2.0 files with stable manifest keys, compressed textures where useful, and explicit collision proxies. No `.blend` file is loaded by the browser.

## Performance and Browser Safety

- Target 60 frames per second on current mid-range phones and remain playable at 30 frames per second on weaker devices.
- Cap device pixel ratio at 1.5 by default and lower it dynamically if sustained frame time is poor.
- Reuse geometry and materials, instance repeated foliage, and minimize transparent surfaces and dynamic shadow casters.
- Use one primary shadowed directional light; most practical lights use inexpensive emissive materials or limited local lights.
- Pause the render loop when the page is hidden and pause player input during orientation gating or menus.
- Handle resize, safe-area insets, WebGL context loss, and audio unlock explicitly.
- Display an actionable fallback if WebGL initialization fails.

## Accessibility and Comfort

- Touch targets are at least 48 CSS pixels and avoid notches through safe-area insets.
- UI text maintains strong contrast and does not rely on color alone.
- Camera orbit sensitivity and audio volume are adjustable.
- Motion reduction disables camera bob and shortens the finale camera move.
- Audio is optional; every objective and interaction remains understandable visually.
- The game never requests landscape orientation.

## Error Handling

- A loading screen reports progress and offers retry if critical initialization fails.
- Optional audio failures do not block play.
- Invalid or incompatible save data is discarded safely and replaced with a fresh versioned state.
- Lost WebGL context pauses simulation and shows a recovery message until restoration succeeds or reload is required.

## Validation and Test Strategy

Automated tests cover progression rules, save migration and reset, interaction-target selection, orientation gating, and input action mapping. Browser tests cover startup, portrait controls, landscape blocking, all five objectives, persistence after reload, finale completion, resize behavior, and basic keyboard fallback.

Visual and playtest checks cover:

- Character and camera navigation through every doorway, stair, and furnishing gap.
- No camera views through exterior walls or roof.
- Joystick, look drag, and action button working simultaneously on touch input.
- HUD readability across representative portrait phone and tablet sizes.
- Stable performance with trees, furniture, shadows, and comfort effects enabled.
- A complete new-player run in five to ten minutes without instructions beyond the transient controls hint.

## Explicit Non-Goals

The initial release excludes combat, NPC dialogue, inventory, item crafting, free furniture placement, multiplayer, cloud saves, procedural room layouts, day-night simulation beyond the finale, and landscape gameplay. These can only be reconsidered after the core portrait exploration loop is complete and playtested.
