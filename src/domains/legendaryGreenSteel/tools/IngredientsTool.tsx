import type { ReactNode } from 'react'
import styles from '../../../shared/layout/craftingTools.module.css'
import RecipeDetails from '../../../shared/items/RecipeDetails'
import { legendaryRecipeParts } from '../logic'
import { MaterialRow } from '../../../shared/layout/GreenSteelBuildParts'
import { Alert, Stack, Text } from '@mantine/core'
import type { LgsIngredientPlan, LgsRecipe, LgsRequirement } from '../legendaryGreenSteel.types.ts'

const IngredientList = ({
  values,
  components
}: {
  values: readonly LgsRequirement[]
  components?: readonly LgsRecipe[]
}) => {
  return values.length ? (
    <ul className={styles.costs}>
      {values.map(({ id, name, quantity }) => (
        <MaterialRow key={id} name={name} quantity={quantity}>
          {components && (
            <RecipeDetails name={name} count={quantity} recipeKey={id} lookup={legendaryRecipeParts(components)} />
          )}
        </MaterialRow>
      ))}
    </ul>
  ) : (
    <Text c='dimmed' size='sm'>
      No materials yet.
    </Text>
  )
}

const IngredientsTool = ({
  header,
  plan,
  components
}: {
  header: ReactNode
  plan: LgsIngredientPlan
  components: readonly LgsRecipe[]
}) => {
  if (!plan.rawMaterials.length && !plan.craftedMaterials.length) {
    return (
      <Alert color='blue' title='No crafting stages selected' m='md'>
        Select a base item or crafting stage to calculate ingredients.
      </Alert>
    )
  }
  return (
    <Stack gap='lg' p='md'>
      {header}
      <Stack component='section' className={styles.stage} gap='xs'>
        <h3>Raw Materials</h3>
        <IngredientList values={plan.rawMaterials} />
      </Stack>
      <Stack component='section' className={styles.stage} gap='xs'>
        <h3>Crafted Materials</h3>
        <IngredientList values={plan.craftedMaterials} components={components} />
      </Stack>
    </Stack>
  )
}

export default IngredientsTool
