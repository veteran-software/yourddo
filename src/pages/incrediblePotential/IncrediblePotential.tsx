import { useCallback, useEffect, useState } from 'react'
import { Card, Col, Container, ListGroup, Row, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import CraftedIngredientDisplay from '../../components/CraftedIngredientDisplay.tsx'
import EnhancementDisplay from '../../components/EnhancementDisplay.tsx'
import FarmedIngredientDisplay from '../../components/FarmedIngredientDisplay.tsx'
import InstructionsPopover from '../../components/InstructionsPopover.tsx'
import { altarOfSubjugation } from '../../data/altarOfSubjugation.ts'
import { enhancements } from '../../data/enhancements.ts'
import { ingredients } from '../../data/ingredients.ts'
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts'
import {
  addCraftedIngredient,
  addRawMaterial,
  clearCraftedIngredients,
  clearRawMaterials,
  setSelectedRing,
  setSelectedRingFilters,
  setSelectedUpgradeFilters
} from '../../redux/slices/incrediblePotentialSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import type { Enhancement, Ring } from '../../types/core.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import BaseItemDropdown from './components/BaseItemDropdown.tsx'
import FilterOffCanvas from './components/FilterOffCanvas.tsx'
import ItemUpgradeDropdown from './components/ItemUpgradeDropdown.tsx'
import RawMaterialList from './components/RawMaterialList.tsx'

const IncrediblePotential = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const {
    craftedIngredients,
    filteredRingList,
    filterMode,
    rawMaterials,
    ringFilters,
    selectedRing,
    selectedUpgrade,
    selectedRingFilters,
    selectedUpgradeFilters,
    filteredUpgradeList,
    upgradeFilters
  } = useAppSelector((state) => state.incrediblePotential, shallowEqual)

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
                  dispatch(addCraftedIngredient(ingredient))

                  recipeBuilder(ingredient)
                } else {
                  // Raw material you find in the wild
                  dispatch(addRawMaterial(requirement))
                }
              }
            }
          )
        }
      }
    },
    [dispatch]
  )

  useEffect(() => {
    if (selectedUpgrade) {
      setRecipeButtonLabel(
        `Incredible Potential : ${selectedUpgrade.effectsAdded?.[0].name ?? ''}`
      )

      dispatch(clearRawMaterials())
      dispatch(clearCraftedIngredients())

      recipeBuilder(selectedUpgrade)
    }
  }, [dispatch, recipeBuilder, selectedUpgrade])

  return (
    <Container>
      <Card>
        <Card.Body>
          <Row md={1} lg={2}>
            <Col>
              <Stack direction='horizontal' gap={2}>
                <BaseItemDropdown
                  onSelectItem={(item: Ring) => {
                    dispatch(setSelectedRing(item))
                    setItemButtonLabel(item.name)
                  }}
                  buttonLabel={itemButtonLabel}
                />
                <FilterOffCanvas
                  filterMode={filterMode}
                  filterOptions={ringFilters}
                  items={filteredRingList}
                  getItemFilters={(item: Ring): string[] => {
                    return item.enchantments
                      .slice(0, 2)
                      .map((enhancement) => enhancement.name)
                  }}
                  selectedFilters={selectedRingFilters}
                  setSelectedFilters={(filters: string[]) => {
                    dispatch(setSelectedRingFilters(filters))
                  }}
                />
              </Stack>

              {selectedRing && (
                <>
                  <hr />
                  <Stack direction='horizontal' gap={2}>
                    <ItemUpgradeDropdown buttonLabel={recipeButtonLabel} />
                    <FilterOffCanvas
                      filterMode={filterMode}
                      filterOptions={upgradeFilters}
                      items={filteredUpgradeList}
                      getItemFilters={(item: CraftingIngredient): string[] => {
                        return (
                          item.enhancements?.map(
                            (enhancement) => enhancement.name
                          ) ?? []
                        )
                      }}
                      selectedFilters={selectedUpgradeFilters}
                      setSelectedFilters={(filters: string[]) => {
                        dispatch(setSelectedUpgradeFilters(filters))
                      }}
                    />
                  </Stack>
                </>
              )}
              {selectedRing && (
                <>
                  <hr />

                  <Card>
                    <Card.Header className='text-center'>
                      <Card.Title>
                        <h2>{selectedRing.name}</h2>
                      </Card.Title>
                      <Card.Subtitle>Ring</Card.Subtitle>
                    </Card.Header>

                    <Card.Body className='d-flex small'>
                      <Stack direction='vertical' gap={1}>
                        <Stack
                          direction='horizontal'
                          className='justify-content-end w-100'
                        >
                          Equips to: {selectedRing.slot.join(', ')}
                        </Stack>

                        <Container>
                          Ingredient Type: {selectedRing.ingredientType}
                        </Container>

                        <Container>
                          Minimum Level: {selectedRing.minimumLevel}
                        </Container>

                        {selectedRing.binding && (
                          <Container>
                            {selectedRing.binding.type === 'Bound' && (
                              <>
                                Bound to {selectedRing.binding.location} (from{' '}
                                {selectedRing.binding.when})
                              </>
                            )}
                          </Container>
                        )}

                        {selectedRing.exclusive && (
                          <Container>Exclusive</Container>
                        )}

                        {selectedRing.enchantments.map(
                          (enhancement: Enhancement, idx: number) => {
                            if (enhancement.name === 'Incredible Potential') {
                              if (selectedUpgrade) {
                                return (
                                  <EnhancementDisplay
                                    key={`${enhancement.name}-${String(idx)}`}
                                    enhancement={
                                      selectedUpgrade.enhancements?.[0]
                                    }
                                  />
                                )
                              }
                            }

                            return (
                              <EnhancementDisplay
                                key={`${enhancement.name}-${String(idx)}`}
                                enhancement={enhancement}
                              />
                            )
                          }
                        )}

                        {selectedUpgrade && (
                          <EnhancementDisplay
                            enhancement={enhancements.find(
                              (enh: Enhancement) =>
                                enh.name.toLowerCase() ===
                                selectedUpgrade.effectsAdded?.[0].name.toLowerCase()
                            )}
                          />
                        )}
                      </Stack>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Col>
            <Col>
              {selectedRing && selectedUpgrade && (
                <>
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
                            instructionsText={`Craft the Focus, Gem, and Essence. Combine them in the Altar of Subjugation to create the imbued Shard of Great Power. Finally, apply the imbued Shard onto your ${selectedRing.name}`}
                          />
                        </ListGroup.Item>
                        {Object.entries(craftedIngredients)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([ing, count], idx: number) => {
                            const crafted: CraftingIngredient | undefined =
                              Object.values(altarOfSubjugation).find(
                                (ingredient: CraftingIngredient) =>
                                  ingredient.name === ing
                              )

                            if (crafted) {
                              return (
                                <CraftedIngredientDisplay
                                  key={`${ing}-${String(count)}-${String(idx)}`}
                                  ingredient={crafted}
                                  quantity={count}
                                />
                              )
                            }

                            const farmed = Object.values(ingredients).find(
                              (ingredient: Ingredient) =>
                                ingredient.name === ing
                            )

                            if (farmed) {
                              return (
                                <FarmedIngredientDisplay
                                  key={`${ing}-${String(count)}-${String(idx)}`}
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
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default IncrediblePotential
