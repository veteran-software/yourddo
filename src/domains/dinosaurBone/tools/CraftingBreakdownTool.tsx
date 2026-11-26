import { Alert, Stack, Text } from '@mantine/core'
import type { FinishedDinosaurBoneItem } from '../dinosaurBone.types'
import { BuildHeader, RequirementList } from './RecipeParts'
import styles from '../../../shared/layout/craftingTools.module.css'

const CraftingBreakdownTool = ({ finished }: { finished: FinishedDinosaurBoneItem }) => {
  if (!finished.item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review individual crafting requirements.
      </Alert>
    )
  }

  const recipes = [
    {
      id: 'base-item',
      name: finished.item.name,
      label: 'Base item',
      requirements: finished.item.requirements,
      craftedIn: finished.item.craftedIn
    },
    ...finished.slots.flatMap(({ slot, augment }) =>
      augment && (augment.requirements.length > 0 || augment.craftedIn)
        ? [
            {
              id: slot.id,
              name: augment.name,
              label: slot.label,
              requirements: augment.requirements,
              craftedIn: augment.craftedIn
            }
          ]
        : []
    )
  ]

  return (
    <Stack gap='md' p='md'>
      <BuildHeader finished={finished} />
      {recipes.map((recipe) => (
        <section className={styles.stage} aria-label={`${recipe.name} requirements`} key={recipe.id}>
          <Stack gap='xs'>
            <h3>{recipe.label}</h3>
            <Text fw={600} size='sm'>
              {recipe.name}
            </Text>
            {recipe.craftedIn ? (
              <Text c='dimmed' size='xs'>
                Crafted at {recipe.craftedIn}
              </Text>
            ) : null}
            <RequirementList requirements={recipe.requirements} />
          </Stack>
        </section>
      ))}
    </Stack>
  )
}

export default CraftingBreakdownTool
