# YourDDO v2 Migration Conventions

YourDDO v2 uses React 19, Vite, TypeScript, React Router, and Mantine.

## Implementation style

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

## Crafting-domain conventions

The Nearly Finished migration established these conventions for crafting domains:

- Load crafting data through the shared manifest and dataset loader. The domain supplies the manifest key and receives
  the resolved CDN payload; it does not construct CDN URLs or duplicate manifest resolution.
- Do not statically import migrated recipe JSON. CDN-hosted data is the source used by the v2 page.
- Validate the required payload structure before rendering and reject unsupported manifest or dataset schema versions
  with a useful user-facing error.
- Keep substantial calculations in one domain-specific pure module when that separates recipe logic from React
  rendering. Keep the functions specific to the current crafting domain rather than creating a generic crafting or
  recipe engine.
- Do not mutate the loaded payload. Copy requirements when returning a crafting plan and use new maps, arrays, and
  objects for calculated totals.

### Recursive recipe expansion

Recipe expansion must:

- multiply quantities at every dependency level;
- aggregate duplicate raw and crafted requirements;
- treat explicitly recognized base ingredients as raw materials;
- report an unexpected missing crafted-ingredient recipe with the selected item and ingredient;
- track the current dependency path and throw a useful error when a cycle is found; and
- produce a deterministic dependency order in which crafted prerequisites precede their dependents.

The resulting plan separates sorted raw-material totals from ordered crafting operations. The UI presents the raw
gathering list first, then the crafted dependency steps in semantic order, followed by the final item-reforging step.

### Dataset-wide verification

In addition to focused unit tests, verify every selectable entry in the published payload. The Nearly Finished audit
checked that each entry has one intended category, expansion terminates, quantities remain positive and finite,
dependencies are ordered correctly, shopping totals agree with the plan, the final step uses the entry's direct cost,
and calculations do not mutate the payload. Use an independent calculation or legacy parity comparison where
practical; do not validate a function only by calling the same function twice.

### Selection and results

For a domain with mutually exclusive item groups, prefer one category control followed by one searchable item control.
Keep the controls together, clear incompatible item and property selections when either selection changes, and show an
explicit state when a category has no items. Preserve the domain's existing zero-choice, single-choice, and
multiple-choice behavior.

Use a single-column control flow on phones. Present raw materials and the ordered crafting sequence side by side when
space permits and stack them at smaller breakpoints. Use text and semantic ordering as well as badges or color to
distinguish raw gathering, crafted steps, and final crafting.

### Shopping list and Trove

The Nearly Finished shopping list uses a Mantine `Drawer` with an independently scrolling `ScrollArea`. It is disabled
until an item has a valid plan and shows the plan's raw and crafted required totals, including explicit messages for
empty sections.

Trove inventory reconciliation has not been migrated to v2. Nearly Finished therefore labels its shopping list as
required quantities only. Do not display "Have / Required", invent inventory data, import the legacy Redux store, or
claim that totals are inventory-aware. The legacy Nearly Finished plan-bound control was hidden and did not change its
calculated totals, so v2 does not expose that inert control.

### Mantine and themes

Use Mantine components, layout primitives, responsive props, and theme-aware values before adding CSS. The Nearly
Finished page requires no domain CSS. Crafting pages must remain usable with light, dark, and system color schemes,
including live operating-system theme changes handled by the application theme support.

### Gear Planner boundaries

Do not generalize crafting calculations for Gear Planner during a crafting-page migration. Similar stage matching,
property-choice interpretation, or item associations are not enough reason to extract shared code. Keep Gear Planner UI
and upgrade application separate, and wait until its migration provides a real second consumer before considering an
extraction.

## Next crafting-domain checklist

- Confirm the public route, known-issues link, manifest key, schema version, payload path, and dataset counts.
- Load recipes through the shared CDN loader; add no static JSON import or domain-level CDN URL.
- Define the smallest accurate payload types and validate the required structure.
- Keep domain-specific recursive calculations pure, cycle-safe, deterministic, and non-mutating.
- Verify every selectable entry independently, including totals, choices, effects, ordering, and final cost.
- Implement category-plus-search selection when item groups are mutually exclusive.
- Present raw gathering, ordered crafted dependencies, and the final crafting step distinctly.
- Keep shopping totals correct and label Trove reconciliation as unavailable until v2 actually provides it.
- Build the page with Mantine and verify keyboard use, loading and error announcements, responsive layouts, and light,
  dark, and system themes.
- Run Prettier, OxLint, TypeScript, the full test suite, and the production build.
