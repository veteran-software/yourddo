import { useCallback, useEffect, useState } from 'react'
import { Card, Col, Container, ListGroup, Stack } from 'react-bootstrap'
import CraftedIngredientDisplay from '../../components/CraftedIngredientDisplay.tsx'
import EnhancementDisplay from '../../components/EnhancementDisplay.tsx'
import FarmedIngredientDisplay from '../../components/FarmedIngredientDisplay.tsx'
import InstructionsPopover from '../../components/InstructionsPopover.tsx'
import { altarOfSubjugation } from '../../data/altarOfSubjugation.ts'
import { enhancements } from '../../data/enhancements.ts'
import { ingredients } from '../../data/ingredients.ts'
import type { Enhancement, Ring } from '../../types/core.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import BaseItemDropdown from './components/BaseItemDropdown.tsx'
import ItemUpgradeDropdown from './components/ItemUpgradeDropdown.tsx'
import RawMaterialList from './components/RawMaterialList.tsx'

const IncrediblePotential = () => {
  const [selectedItem, setSelectedItem] = useState<Ring | undefined>()
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingIngredient>()
  const [craftedIngredients, setCraftedIngredients] = useState<
    Record<string, number>
  >({})
  const [rawMaterials, setRawMaterials] = useState<Record<string, number>>({})

  const [itemButtonLabel, setItemButtonLabel] = useState(
    'Select a Base Item...'
  )
  const [recipeButtonLabel, setRecipeButtonLabel] = useState(
    'Choose an upgrade...'
  )

  const recipeBuilder = useCallback(
    (recipe: CraftingIngredient | undefined) => {
      if (recipe) {
        if (recipe.craftedIn) {
          recipe.requirements?.forEach(
            (requirement: CraftingIngredient | string) => {
              if (typeof requirement !== 'string') {
                const ingredient: CraftingIngredient | undefined =
                  altarOfSubjugation.find(
                    (recipe: CraftingIngredient) =>
                      recipe.name === requirement.name
                  )

                if (ingredient) {
                  // Crafted Ingredient
                  setCraftedIngredients((prev) => ({
                    ...prev,
                    [ingredient.name]:
                      (prev[ingredient.name] ?? 0) + ingredient.quantity
                  }))

                  recipeBuilder(ingredient)
                } else {
                  // Raw material you find in the wild
                  setRawMaterials((prev) => ({
                    ...prev,
                    [requirement.name]:
                      (prev[requirement.name] ?? 0) + requirement.quantity
                  }))
                }
              }
            }
          )
        }
      }
    },
    []
  )

  useEffect(() => {
    recipeBuilder(selectedRecipe)
  }, [recipeBuilder, selectedRecipe])

  return (
    <Container>
      <Card>
        <Card.Header>
          <BaseItemDropdown
            onSelectItem={(item: Ring) => {
              setSelectedItem(item)
              setItemButtonLabel(item.name)
            }}
            buttonLabel={itemButtonLabel}
          />
        </Card.Header>

        {selectedItem && (
          <Card.Body>
            <Col xs={12} md={10} lg={8} xl={6} className='mx-auto'>
              <Card>
                <Card.Header className='text-center'>
                  <Card.Title>
                    <h2>{selectedItem.name}</h2>
                  </Card.Title>
                  <Card.Subtitle>Ring</Card.Subtitle>
                </Card.Header>

                <Card.Body className='d-flex small'>
                  <Stack direction='vertical' gap={1}>
                    <Stack
                      direction='horizontal'
                      className='justify-content-end w-100'
                    >
                      Equips to: {selectedItem.slot.join(', ')}
                    </Stack>

                    <Container>
                      Ingredient Type: {selectedItem.ingredientType}
                    </Container>

                    <Container>
                      Minimum Level: {selectedItem.minimumLevel}
                    </Container>

                    {selectedItem.binding && (
                      <Container>
                        {selectedItem.binding.type === 'Bound' && (
                          <>
                            Bound to {selectedItem.binding.location} (from{' '}
                            {selectedItem.binding.when})
                          </>
                        )}
                      </Container>
                    )}

                    {selectedItem.exclusive && <Container>Exclusive</Container>}

                    {selectedItem.enchantments.map(
                      (enhancement: Enhancement) => {
                        if (enhancement.name === 'Incredible Potential') {
                          return (
                            <ItemUpgradeDropdown
                              buttonLabel={recipeButtonLabel}
                              clickHandler={(recipe: CraftingIngredient) => {
                                setSelectedRecipe(recipe)
                                setRecipeButtonLabel(
                                  `Incredible Potential : ${
                                    recipe.effectsAdded?.[0].name ??
                                    'No effects added'
                                  }`
                                )
                                setRawMaterials({})
                                setCraftedIngredients({})
                              }}
                            />
                          )
                        }

                        return <EnhancementDisplay enhancement={enhancement} />
                      }
                    )}

                    {selectedRecipe && (
                      <>
                        <EnhancementDisplay
                          enhancement={enhancements.find(
                            (enh: Enhancement) =>
                              enh.name.toLowerCase() ===
                              selectedRecipe.effectsAdded?.[0].name.toLowerCase()
                          )}
                        />

                        <RawMaterialList rawMaterials={rawMaterials} />

                        {Object.entries(craftedIngredients).length > 0 && (
                          <>
                            <hr />

                            <ListGroup>
                              <ListGroup.Item
                                variant={'secondary'}
                                className='d-flex flex-row justify-content-between'
                              >
                                <strong>Crafted Materials</strong>
                                <InstructionsPopover
                                  instructionsText={`Craft the Focus, Gem, and Essence. Combine them in the Altar of Subjugation to create the imbued Shard of Great Power. Finally, apply the imbued Shard onto your ${selectedItem.name}`}
                                />
                              </ListGroup.Item>
                              {Object.entries(craftedIngredients)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([ing, count]) => {
                                  const crafted = Object.values(
                                    altarOfSubjugation
                                  ).find(
                                    (ingredient: CraftingIngredient) =>
                                      ingredient.name === ing
                                  )

                                  if (crafted) {
                                    return (
                                      <CraftedIngredientDisplay
                                        ingredient={crafted}
                                        quantity={count}
                                      />
                                    )
                                  }

                                  const farmed = Object.values(
                                    ingredients
                                  ).find(
                                    (ingredient: Ingredient) =>
                                      ingredient.name === ing
                                  )

                                  if (farmed) {
                                    return (
                                      <FarmedIngredientDisplay
                                        ingredient={farmed}
                                        quantity={count}
                                      />
                                    )
                                  }
                                })}
                            </ListGroup>
                          </>
                        )}
                      </>
                    )}
                  </Stack>
                </Card.Body>
              </Card>
            </Col>
          </Card.Body>
        )}
      </Card>
    </Container>
  )
}

export default IncrediblePotential
