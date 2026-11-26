import type { ReactNode } from 'react'
import styles from '../../../shared/layout/craftingTools.module.css'
import RecipeDetails from '../../../shared/items/RecipeDetails'
import { legendaryRecipeParts } from '../logic'
import { MaterialRow } from '../../../shared/layout/GreenSteelBuildParts'
import { Alert, Stack, Text } from '@mantine/core'
import type { LgsRecipe, LgsRequirement } from '../legendaryGreenSteel.types.ts'

interface LgsCraftingStage {
  label: string
  recipe?: { name: string; craftedIn: string; requirements: readonly LgsRequirement[] }
  displayName?: string
}

const CraftingBreakdownTool = ({
  header,
  stages,
  components
}: {
  header: ReactNode
  stages: readonly LgsCraftingStage[]
  components: readonly LgsRecipe[]
}) => {
  const componentById = new Map(components.map((component) => [component.id, component]))
  const selectedStages = stages.filter(
    (stage): stage is LgsCraftingStage & { recipe: NonNullable<LgsCraftingStage['recipe']> } => Boolean(stage.recipe)
  )

  if (!selectedStages.length) {
    return (
      <Alert color='blue' title='No crafting stages selected' m='md'>
        Select a base item or crafting stage to review the crafting progression.
      </Alert>
    )
  }

  return (
    <Stack gap='md' p='md'>
      {header}
      {selectedStages.map(({ label, recipe, displayName }) => (
        <section className={styles.stage} key={label}>
          <Stack gap='xs'>
            <h3>{label}</h3>
            <Text fw={600} size='sm'>
              {displayName ?? recipe.name}
            </Text>
            <Text c='dimmed' size='xs'>
              {recipe.craftedIn}
            </Text>
            <ul className={styles.costs}>
              {recipe.requirements.map(({ id, name, quantity }) => {
                const component = componentById.get(id)
                return (
                  <MaterialRow key={id} name={name} quantity={quantity}>
                    {component && (
                      <RecipeDetails
                        name={name}
                        count={quantity}
                        recipeKey={id}
                        lookup={legendaryRecipeParts(components)}
                      />
                    )}
                  </MaterialRow>
                )
              })}
            </ul>
          </Stack>
        </section>
      ))}
    </Stack>
  )
}

export default CraftingBreakdownTool
