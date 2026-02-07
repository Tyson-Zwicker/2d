# Architecture

## Entry Points
- `Main.run(fps)` starts the update loop.
- `View.initialize(backColor)` sets up the Canvas and input handlers.

## Core Modules
- `Main`: update loop orchestration and draw/move order.
- `Game`: registry of `GameObject` instances.
- `GameObject`: simple container for `name` + `body`.
- `Body`/`BodyPart`: physical hierarchy with faces and motion state.
- `Transform`: converts local faces to world-space `calculatedFaces`.
- `View`: Canvas setup, camera, pan/zoom, and bounds.
- `Vec`: vector math utilities.
- `Rnd`: random helpers (ints, floats, colors, points).

## Data Flow
- User code creates bodies and parts, then registers `GameObject` in `Game`.
- `Transform` builds world-space faces from local part geometry.
- `Body.draw` consumes `calculatedFaces` for rendering through `View.context`.

## Game Loop / Update Cycle
- `Main.doWork` clears the view, draws all bodies, then moves them.
- Time step is based on `Main.delta` computed in `Main.loop`.

## Rendering
- Canvas 2D rendering with `Path2D` polygons per face.
- Camera transforms are applied via `View` bounds and zoom logic.

## Physics / Simulation
- Basic Newtonian motion: position integrates velocity each tick.
- Forces, collisions, and constraints are not implemented by default.

## State Management
- Global state lives in static classes (`Main`, `View`, `Game`).
- Per-object state lives in `Body`/`BodyPart` instances.

## Extensibility
- Create new `BodyPart` faces or compose deeper part hierarchies.
- Add per-tick behaviors by extending the loop or adding custom update calls.
