# Rules & Conventions

## Coding Style
- Class-based style with ES module imports/exports.
- Semicolons required.
- Prefer static utility classes for math/helpers (e.g., `Vec`, `Rnd`).
- No external dependencies.

## File Organization
- One primary class per file at repo root.
- Keep modules small and focused on a single responsibility.

## Naming
- Classes: PascalCase (`GameObject`, `BodyPart`).
- Methods/functions: camelCase (`addGameObject`, `gameObjectToWorld`).
- Files: lowercase to match exported class (`bodypart.js`, `gameobject.js`).

## Error Handling
- Throw `Error`/`TypeError` for invalid inputs.
- Use `console.warn` for non-fatal issues.

## Comments & Docs
- Keep comments concise and only for non-obvious logic.

## Testing
- No test harness is set up yet.

## Performance Constraints
- Use in-place vector ops (`addInPlace`, `rotateInPlace`) in hot paths.

## Security & Safety
- Browser-only; avoid `eval` and assume trusted inputs.

## Compatibility
- Browser runtime with DOM and Canvas 2D support.
