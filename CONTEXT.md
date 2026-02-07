# Project Context

## Purpose
- A lightweight 2D vector-style engine that simulates Newtonian physics so things move around with minimal fuss.

## Scope
- In-scope: core vector math, simple body/part modeling, update loop hooks, and Canvas-based rendering helpers.
- Out-of-scope: full game framework, editors/tools, and 3D features.

## Primary Users
- People prototyping simple physics-driven motion and visualizations in the browser.

## Key Features
- 2D physics-style motion with per-frame updates.
- Modular body/part hierarchy for composing shapes.
- Canvas rendering with camera, pan, and zoom.
- Simple game loop and object registry.
- Random and vector utility helpers.

## Non-Goals
- A complete game engine with scenes, audio, UI, or asset pipelines.
- Advanced physics (constraints, collision solver, broadphase) beyond basic motion.

## High-Level Flow
- User constructs `GameObject` instances with a `Body` and `BodyPart` tree, then registers them with `Game`.
- A loop (via `Main.run`) clears the view, draws bodies, and updates motion each tick.
- `Transform` can be used to compute world-space faces (`calculatedFaces`) for rendering.
- `View` owns the Canvas, camera state, and input-driven pan/zoom.

## External Dependencies
- None. Vanilla ES modules and the browser Canvas 2D API only.

## Runtime Expectations
- Browser runtime with DOM access and Canvas 2D context.

## Glossary
- Body: A top-level physical entity with position, velocity, and parts.
- BodyPart: A hierarchical sub-part with its own facing, mass, and faces.
- Face: A polygon (array of points) used for rendering.
- Calculated faces: World-space faces generated for drawing.
- Camera: View transform controlling pan and zoom.
