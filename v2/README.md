YourDDO v2 uses React 19, Vite, TypeScript, and Mantine.

Code must be minimalist, direct, and readable.

Mantine-first priority:

1. Mantine component props
2. Mantine layout components
3. Mantine responsive and style props
4. Mantine theme customization
5. CSS Modules only when Mantine cannot reasonably handle the requirement
6. Global CSS only for true application-wide styling

Do not create CSS classes for spacing, flexbox, grid, alignment, sizing, colors, borders, radius, or typography when
Mantine already provides those capabilities.

Use Mantine components directly.

Do not wrap Mantine components unless the wrapper represents a real YourDDO concept or removes substantial repeated
behavior.

Do not create speculative abstractions.

Do not add context, reducers, services, factories, adapters, registries, or custom hooks unless the current requirement
clearly needs them.

Prefer local state.

Prefer plain arrays and objects.

Prefer direct JSX.

Build only what the current task requires.

All UI must support light, dark, and system color schemes.

Never use hardcoded colors that fail in either light or dark mode.

Preserve existing public URLs when real tools are migrated.
