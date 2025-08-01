import { useMemo } from 'react'
import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { titleCase } from 'title-case'
import AugmentSlotFilterableDropdown from '../../components/common/AugmentSlotFilterableDropdown.tsx'
import FilterableDropdown from '../../components/common/FilterableDropdown.tsx'
import { filterIngredientsMap } from '../../components/filters/helpers/filterUtils.ts'
import { augments } from '../../data/augments.ts'
import { lootHeroicViktraniumItems } from '../../data/viktraniumExperiment/hChillOfRavenloftLoot.ts'
import { craftedHeroicViktraniumWeapons } from '../../data/viktraniumExperiment/hViktraniumExperimentCraftedItems.ts'
import { lootLegendaryViktraniumItems } from '../../data/viktraniumExperiment/lChillOfRavenloftLoot.ts'
import { craftedLegendaryViktraniumWeapons } from '../../data/viktraniumExperiment/lViktraniumExperimentCraftedItems.ts'
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts'
import {
  resetSelectedHeroicLootItem,
  resetSelectedLegendaryCraftedItem,
  resetSelectedLegendaryLootItem,
  setAugmentFilterMode,
  setAugmentFilters,
  setItemFilterMode,
  setItemFilters,
  setSelectedAugment,
  setSelectedHeroicLootItem,
  setSelectedLegendaryCraftedItem,
  setSelectedLegendaryLootItem
} from '../../redux/slices/viktraniumSlice.ts'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { Augment, CraftingIngredient } from '../../types/crafting.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { camelCaseToTitleCase, getCumulativeIngredients } from '../../utils/utils.ts'
import CumulativeIngredientsCard from '../dinosaurBoneCrafting/components/CumulativeIngredientsCard.tsx'
import ItemDisplay from '../dinosaurBoneCrafting/components/ItemDisplay.tsx'

const ViktraniumExperiment = () => {
  const dispatch = useAppDispatch()
  const {
    selectedHeroicLootItem,
    selectedHeroicCraftedItem,
    selectedLegendaryLootItem,
    selectedLegendaryCraftedItem,
    itemFilters,
    itemFilterMode,
    augmentFilters,
    selectedAugments,
    augmentFilterMode
  } = useAppSelector((state) => state.viktraniumExperiment, shallowEqual)

  const filteredCraftedHeroicViktraniumWeapons: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, craftedHeroicViktraniumWeapons),
    [itemFilters]
  )

  const filteredHeroicViktraniumLoot: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, lootHeroicViktraniumItems),
    [itemFilters]
  )

  const filteredCraftedLegendaryViktraniumWeapons: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, craftedLegendaryViktraniumWeapons),
    [itemFilters]
  )

  const filteredLegendaryViktraniumLoot: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, lootLegendaryViktraniumItems),
    [itemFilters]
  )

  const availableAugmentSlots = useMemo<string[]>(() => {
    if (
      !selectedHeroicLootItem?.augments?.length &&
      !selectedHeroicCraftedItem?.augments?.length &&
      selectedLegendaryLootItem?.augments?.length &&
      selectedLegendaryCraftedItem?.augments?.length
    )
      return []

    const selectedItem =
      selectedHeroicLootItem ?? selectedHeroicCraftedItem ?? selectedLegendaryLootItem ?? selectedLegendaryCraftedItem
    if (selectedItem?.augments === undefined) return []

    const aug: Augment = selectedItem.augments[0]
    return Object.entries(aug)
      .filter(([key, value]) => {
        return value === null || key.startsWith('lamordia')
      })
      .map(([k]) => k)
  }, [selectedHeroicLootItem, selectedHeroicCraftedItem, selectedLegendaryLootItem, selectedLegendaryCraftedItem])

  const augmentOptions = useMemo<Record<string, AugmentItem[]>>(() => {
    return availableAugmentSlots.reduce<Record<string, AugmentItem[]>>((acc, slot) => {
      const clean: string = slot.replace(/([A-Z])/g, ' $1').trim()
      const words: string[] = clean.split(' ')
      // Basic Color Augments
      if (words.length === 1) {
        acc[slot] = [...augments].filter((ing: AugmentItem) => ing.augmentType === titleCase(words[0]))
        return acc
      }

      acc[slot] = [...augments].filter(
        (ing: AugmentItem) =>
          ing.augmentType === `${titleCase(words[0])}: ${titleCase(words[1])} (${titleCase(words[2])})`
      )
      return acc
    }, {})
  }, [availableAugmentSlots])

  const filteredAugmentOptions: Record<string, AugmentItem[]> = useMemo(() => {
    if (augmentFilters.length === 0) {
      return augmentOptions
    }
    // Apply filterIngredientsMap to reduce options by augmentFilters
    return Object.fromEntries(
      Object.entries(augmentOptions).map(([slot, options]) => {
        const filteredForSlot = filterIngredientsMap(augmentFilters, { '': options })['']
        return [slot, filteredForSlot as AugmentItem[]]
      })
    )
  }, [augmentOptions, augmentFilters])

  const handleSelectAugment = (slot: string, augment: Ingredient) => {
    dispatch(
      setSelectedAugment({
        slot,
        augment
      })
    )
  }

  const handleResetAugment = (slot: string) => {
    dispatch(
      setSelectedAugment({
        slot,
        augment: null
      })
    )
  }

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='text-center p-1'>
          <Card.Title>
            <h4 className='mb-0'>Viktranium Experiment Crafting</h4>
          </Card.Title>

          <Card.Subtitle>
            <small>
              <a
                href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Viktranium%20Experiment%22'
                target='_blank'
                rel='noreferrer'
                title='Viktranium Experiment Crafting : Known Issues & Bug Reports'
              >
                Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
              </a>
            </small>
          </Card.Subtitle>
        </Card.Header>

        <Card.Body>
          <Row md={1} lg={2}>
            <Col>
              <Stack direction='vertical' gap={3}>
                <FilterableDropdown
                  dropdownTriggerPrefix='B:'
                  title={'Heroic Crafted Weapons'}
                  items={craftedHeroicViktraniumWeapons}
                  filteredItems={filteredCraftedHeroicViktraniumWeapons}
                  onSelect={(weapon: CraftingIngredient) => dispatch(setSelectedHeroicLootItem(weapon))}
                  onReset={() => dispatch(resetSelectedHeroicLootItem())}
                  selectedItem={selectedHeroicCraftedItem ?? undefined}
                  label={
                    selectedHeroicCraftedItem ? selectedHeroicCraftedItem.name : 'Select a Heroic Crafted Weapon...'
                  }
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={
                    selectedLegendaryLootItem !== undefined ||
                    selectedHeroicLootItem !== undefined ||
                    selectedLegendaryCraftedItem !== undefined
                  }
                />

                <FilterableDropdown
                  dropdownTriggerPrefix='B:'
                  title={'Heroic Quest Loot'}
                  items={lootHeroicViktraniumItems}
                  filteredItems={filteredHeroicViktraniumLoot}
                  onSelect={(weapon: CraftingIngredient) => dispatch(setSelectedHeroicLootItem(weapon))}
                  onReset={() => dispatch(resetSelectedHeroicLootItem())}
                  selectedItem={selectedHeroicLootItem ?? undefined}
                  label={selectedHeroicLootItem ? selectedHeroicLootItem.name : 'Select a Heroic Loot Item...'}
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={
                    selectedLegendaryLootItem !== undefined ||
                    selectedHeroicCraftedItem !== undefined ||
                    selectedLegendaryCraftedItem !== undefined
                  }
                />

                <FilterableDropdown
                  dropdownTriggerPrefix='B:'
                  title={'Legendary Crafted Weapons'}
                  items={craftedLegendaryViktraniumWeapons}
                  filteredItems={filteredCraftedLegendaryViktraniumWeapons}
                  onSelect={(weapon: CraftingIngredient) => dispatch(setSelectedLegendaryCraftedItem(weapon))}
                  onReset={() => dispatch(resetSelectedLegendaryCraftedItem())}
                  selectedItem={selectedLegendaryCraftedItem ?? undefined}
                  label={
                    selectedLegendaryCraftedItem
                      ? selectedLegendaryCraftedItem.name
                      : 'Select a Legendary Crafted Weapon...'
                  }
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={
                    selectedLegendaryLootItem !== undefined ||
                    selectedHeroicCraftedItem !== undefined ||
                    selectedHeroicLootItem !== undefined
                  }
                />

                <FilterableDropdown
                  dropdownTriggerPrefix='B:'
                  title={'Legendary Quest Loot'}
                  items={lootLegendaryViktraniumItems}
                  filteredItems={filteredLegendaryViktraniumLoot}
                  onSelect={(weapon: CraftingIngredient) => dispatch(setSelectedLegendaryLootItem(weapon))}
                  onReset={() => dispatch(resetSelectedLegendaryLootItem())}
                  selectedItem={selectedLegendaryLootItem ?? undefined}
                  label={selectedLegendaryLootItem ? selectedLegendaryLootItem.name : 'Select a Legendary Loot Item...'}
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={
                    selectedLegendaryCraftedItem !== undefined ||
                    selectedHeroicCraftedItem !== undefined ||
                    selectedHeroicLootItem !== undefined
                  }
                />
              </Stack>
            </Col>
            <Col>
              {(selectedHeroicLootItem ??
                selectedHeroicCraftedItem ??
                selectedLegendaryLootItem ??
                selectedLegendaryCraftedItem) && (
                <Card className='mt-3'>
                  <Card.Header>Augment Slots</Card.Header>
                  <Card.Body>
                    <AugmentSlotFilterableDropdown
                      availableAugmentSlots={availableAugmentSlots}
                      augmentOptions={augmentOptions}
                      filteredAugmentOptions={filteredAugmentOptions}
                      selectedAugments={selectedAugments}
                      augmentFilters={augmentFilters}
                      augmentFilterMode={augmentFilterMode}
                      handleSelectAugment={handleSelectAugment}
                      handleResetAugment={handleResetAugment}
                      handleFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setAugmentFilterMode(mode))}
                      handleFiltersChange={(filters: string[]) => dispatch(setAugmentFilters(filters))}
                    />
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>

          <Row className='mt-4'>
            <Col>
              {!selectedHeroicLootItem &&
              !selectedHeroicCraftedItem &&
              !selectedLegendaryLootItem &&
              !selectedLegendaryCraftedItem ? (
                <Card>
                  <Card.Body>
                    <p>No item selected.</p>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  <Row className='g-2'>
                    <Col xs={12} md={6}>
                      <ItemDisplay
                        selectedItem={
                          selectedHeroicLootItem ??
                          selectedHeroicCraftedItem ??
                          selectedLegendaryLootItem ??
                          selectedLegendaryCraftedItem ??
                          ({} as Ingredient)
                        }
                      />
                    </Col>

                    <Col xs={12} md={6}>
                      <CumulativeIngredientsCard
                        ingredients={getCumulativeIngredients(
                          selectedHeroicLootItem ??
                            selectedHeroicCraftedItem ??
                            selectedLegendaryLootItem ??
                            selectedLegendaryCraftedItem,
                          selectedAugments
                        )}
                      />
                    </Col>
                  </Row>

                  <Card className='mt-3'>
                    <Card.Header>
                      <Card.Title className='m-0' as='h6'>
                        Available Augments
                      </Card.Title>
                    </Card.Header>

                    <Card.Body className='p-2'>
                      <Row className='g-2'>
                        {availableAugmentSlots.map((slot) => (
                          <Col key={slot} xs={12} md={6}>
                            <ItemDisplay
                              selectedItem={
                                selectedAugments[slot] ??
                                ({
                                  name: camelCaseToTitleCase(slot)
                                } as Ingredient)
                              }
                            />
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ViktraniumExperiment
