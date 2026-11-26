import type { ReactNode } from 'react'
import styles from '../../../shared/layout/craftingTools.module.css'
import { Alert, Stack, Text } from '@mantine/core'
import type { FinishedViktraniumSlot, ViktraniumItem, ViktraniumRecipe } from '../viktranium.types.ts'

import { RequirementList } from '../../../shared/layout/SlottedCraftingParts'
const Recipe = ({ recipe }: { recipe: ViktraniumRecipe }) => (
  <Stack gap='xs'>
    <Text c='dimmed' size='xs'>
      Crafted at {recipe.device}
    </Text>
    {recipe.notes?.map((note) => (
      <Text key={note} size='sm'>
        {note}
      </Text>
    ))}
    {recipe.status !== 'complete' ? <Alert color='yellow'>Recipe is {recipe.status}.</Alert> : null}
    {recipe.requirements.length ? (
      <RequirementList requirements={recipe.requirements} />
    ) : (
      <Text c='dimmed' size='xs'>
        No published requirements.
      </Text>
    )}
  </Stack>
)

const CraftingBreakdownTool = ({
  header,
  item,
  slots
}: {
  header: ReactNode
  item?: ViktraniumItem
  slots: readonly FinishedViktraniumSlot[]
}) => {
  if (!item)
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review individual recipes.
      </Alert>
    )
  const components = [
    { id: item.id, name: item.name, label: 'Base item', recipes: item.recipes },
    ...slots.flatMap(({ slot, augment }) =>
      augment ? [{ id: slot.id, name: augment.name, label: slot.label, recipes: augment.recipes }] : []
    )
  ]
  return (
    <Stack gap='md' p='md'>
      {header}
      {components.map((component) => (
        <section className={styles.stage} aria-label={`${component.name} requirements`} key={component.id}>
          <Stack gap='xs'>
            <h3>{component.label}</h3>
            <Text size='sm' fw={600}>
              {component.name}
            </Text>
            {component.recipes.length ? (
              component.recipes.map((recipe) => <Recipe recipe={recipe} key={recipe.id} />)
            ) : (
              <Text c='dimmed' size='xs'>
                No crafting recipe is required or published for this component.
              </Text>
            )}
          </Stack>
        </section>
      ))}
    </Stack>
  )
}

export default CraftingBreakdownTool
