# YourDDO v2 UX Philosophy

This document records the migration pattern proven by the completed Nearly Complete domain. It applies to simple tools with the same interaction shape.

## Ownership and structure

### Keep domains together

A tool owns its page, domain-specific types, data interpretation, plain domain logic, source data, and tests under `v2/src/domains/<domain>`.

Move code into shared folders only when it serves multiple domains. Shared code should provide narrow application concerns, such as the common tool layout or dataset transport, while each domain retains its own rules and presentation.

### Keep the implementation direct

Prefer local state, plain functions, plain objects, and direct JSX. Do not add custom hooks, contexts, reducers, providers, services, repositories, adapters, factories, registries, or wrapper components unless the current tool has a concrete need for them.

Do not create a component used only once unless it isolates a large, coherent section of the page. Do not recreate Mantine APIs behind project-specific wrappers.

## Layout and styling

### Use Mantine first

Use Mantine components directly. Apply styling in this order:

1. Mantine component props and variants.
2. Mantine layout components and responsive props.
3. Existing theme values.
4. A CSS Module only when Mantine cannot reasonably express the requirement.

Global CSS is reserved for styling that is genuinely application-wide. Do not bring Bootstrap markup, Bootstrap class names, or legacy SCSS into v2.

### Use `ToolLayout` for simple tools

Place a simple tool's page content inside `ToolLayout`. It provides the shared maximum width, page padding, and vertical rhythm. Build the page sections from Mantine layout components such as `Stack`, `Group`, `SimpleGrid`, `Container`, and `Paper` rather than adding page-level layout CSS.

### Lead with a title and description

Start the tool with one semantic level-one `Title`. Follow it with a short `Text` description using the dimmed theme color. The description should state what the user can choose or accomplish, not repeat the title.

### Group related controls

Place related controls in one section beneath a descriptive section heading. Give every control a visible label and keep dependent controls together in interaction order.

Use a Mantine `SimpleGrid` for control rows. The proven responsive pattern is one column at the base breakpoint and multiple columns at a suitable larger breakpoint, such as `cols={{ base: 1, md: 3 }}`. Use Mantine spacing values for gaps.

## Results and states

### Present results with clear hierarchy

Use a bordered `Paper` to separate the primary result from the controls. Within it:

- Use headings to identify the selected result and its major sections.
- Use dimmed text for supporting metadata.
- Use badges for compact categorical values and quantities.
- Use dividers between distinct result regions.
- Use a responsive `SimpleGrid` when parallel result sections should stack on small screens and sit side by side on larger screens.
- Use semantic lists for requirements, effects, or items.

Before the required selection is complete, keep the result container in place and explain the next action. Do not show a blank panel.

### Limit loading to the data boundary

Keep the page title, description, controls, and any independently available content visible while remote data loads. Show loading feedback only in the region that depends on that data.

Use a centered Mantine `Loader` with short descriptive text. Give the loading region status semantics and polite live-region behavior so assistive technology receives the update without interrupting the user.

### Make errors recoverable

Show dataset failures in a Mantine error `Alert` with:

- A plain-language title and explanation.
- A local retry button.
- Technical error details only during development.

Retry only the failed load and preserve unrelated user selections. Do not expose stack traces or replace the entire tool with the error state.

### Distinguish empty states

Treat these as separate states:

- **Incomplete input:** explain which selection the user must make to see a result.
- **No matching data:** explain that loading succeeded but the current filters returned no matches, then suggest changing the relevant controls.

A successful empty result is not an error and should not offer a retry action.

## Data loading

Keep dataset transport behind the shared `loadDataset` boundary. The shared loader owns manifest lookup, URL resolution, fetching, response validation, and transport errors.

The domain owns its dataset types and a small domain-specific loading function, plus interpretation, filtering, and sorting. Components consume that domain API rather than reading the manifest or constructing dataset URLs themselves.

## Application compatibility

### Support Light, Dark, and System themes

Use Mantine theme colors, variants, borders, and surfaces so the page works in Light, Dark, and System modes. Do not hard-code colors that bypass Mantine's active color scheme. System mode must continue to follow operating-system changes through the application-level Mantine configuration.

### Preserve public URLs

Keep each migrated tool at its existing public path and preserve navigation to that path. For Nearly Complete, the public URL remains `/nearly-complete`. A migration may replace the implementation, but it must not silently rename or relocate the route or change domain behavior.

## Checklist for the next simple tool

- [ ] Confirm the existing public URL and current domain behavior before migrating.
- [ ] Put the page, domain types, logic, data, and tests under `v2/src/domains/<domain>`.
- [ ] Reuse `ToolLayout` and build the page directly with Mantine components and props.
- [ ] Add one page title, a dimmed task description, and visibly labeled controls grouped under a section heading.
- [ ] Make control and result grids responsive with Mantine responsive props.
- [ ] Provide the incomplete-input, loading, error with retry, no-results, and populated-result states that the tool needs.
- [ ] Load remote data through `loadDataset`; keep interpretation, filtering, and sorting in the domain.
- [ ] Preserve useful user state when retrying an unrelated load failure.
- [ ] Verify the tool in Light, Dark, and System modes.
- [ ] Preserve the public route and navigation behavior.
- [ ] Confirm that no Bootstrap markup, legacy SCSS, speculative abstraction, or unrelated legacy change was introduced.
- [ ] Add focused tests for domain logic, data loading, page states, interactions, and route preservation.
- [ ] Run formatting, linting, TypeScript checks, tests, and the production build.
