import { useMemo } from 'react'
import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { titleCase } from 'title-case'
import FilterableDropdown from '../../../components/common/FilterableDropdown.tsx'
import { filterIngredientsMap } from '../../../components/filters/helpers/filterUtils.ts'
import { augments } from '../../../data/augments.ts'
import { lootHeroicViktraniumItems } from '../../../data/viktraniumExperiment/hChillOfRavenloftLoot.ts'
import { craftedHeroicViktraniumWeapons } from '../../../data/viktraniumExperiment/hViktraniumExperimentCraftedItems.ts'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  resetSelectedCraftedItem,
  resetSelectedLootItem,
  setAugmentFilterMode,
  setAugmentFilters,
  setItemFilterMode,
  setItemFilters,
  setSelectedAugment,
  setSelectedCraftedItem,
  setSelectedLootItem
} from '../../../redux/slices/viktraniumSlice.ts'
import type { AugmentItem } from '../../../types/augmentItem.ts'
import type { Augment, CraftingIngredient } from '../../../types/crafting.ts'
import type { Ingredient } from '../../../types/ingredients.ts'
import { camelCaseToTitleCase } from '../../../utils/utils.ts'
import CumulativeIngredientsCard from '../../dinosaurBoneCrafting/components/CumulativeIngredientsCard.tsx'
import ItemDisplay from '../../dinosaurBoneCrafting/components/ItemDisplay.tsx'

const ViktraniumExperimentHeroic = () => {
  const dispatch = useAppDispatch()
  const {
    selectedLootItem,
    selectedCraftedItem,
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

  const filteredCraftedHeroicViktraniumItems: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, lootHeroicViktraniumItems),
    [itemFilters]
  )

  const availableAugmentSlots = useMemo<string[]>(() => {
    if (!selectedLootItem?.augments?.length) return []
    const aug: Augment = selectedLootItem.augments[0]
    return Object.entries(aug)
      .filter(([key, value]) => {
        return value === null || key.startsWith('lamordia')
      })
      .map(([k]) => k)
  }, [selectedLootItem])

  const augmentOptions = useMemo<Record<string, AugmentItem[]>>(() => {
    return availableAugmentSlots.reduce<Record<string, AugmentItem[]>>((acc, slot) => {
      const clean: string = slot.replace(/([A-Z])/g, ' $1').trim()
      const words: string[] = clean.split(' ')
      console.log('words:', words)
      // Basic Color Augments
      if (words.length === 1) {
        acc[slot] = [...augments].filter((ing: AugmentItem) => ing.augmentType === titleCase(words[0]))
        return acc
      }

      // Lamordia Augments
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
  const accumulateIngredients = (
    item: CraftingIngredient,
    accumulator: Record<string, number> = {}
  ): Record<string, number> => {
    if (!item.requirements || item.requirements.length === 0) {
      return accumulator
    }

    for (const req of item.requirements) {
      const name = req.name
      const qty = req.quantity ?? 1

      accumulator[name] = (accumulator[name] ?? 0) + qty

      if (req.requirements && req.requirements.length > 0) {
        accumulateIngredients(req, accumulator)
      }
    }

    return accumulator
  }

  const getCumulativeIngredients = (
    selectedItem: Ingredient | null | undefined,
    selectedAugments: Record<string, Ingredient | null>
  ): Record<string, number> => {
    const accumulator: Record<string, number> = {}

    if (selectedItem) {
      accumulateIngredients(selectedItem, accumulator)
    }

    for (const augment of Object.values(selectedAugments)) {
      if (augment) {
        accumulateIngredients(augment, accumulator)
      }
    }

    return accumulator
  }

  const resolveAugmentLabel = (slot: string, header: string): string =>
    selectedAugments[slot]?.name ?? `Select ${header}...`

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='text-center p-1'>
          <Card.Title>
            <h4 className='mb-0'>Heroic Viktranium Experiment Crafting</h4>
          </Card.Title>

          <Card.Subtitle>
            <small>
              <a
                href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Heroic%20Viktranium%20Experiment%22'
                target='_blank'
                rel='noreferrer'
                title='Heroic Viktranium Experiment Crafting : Known Issues & Bug Reports'
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
                  title={'Crafted Weapons'}
                  items={craftedHeroicViktraniumWeapons}
                  filteredItems={filteredCraftedHeroicViktraniumWeapons}
                  onSelect={(weapon: CraftingIngredient) => dispatch(setSelectedCraftedItem(weapon))}
                  onReset={() => dispatch(resetSelectedCraftedItem())}
                  selectedItem={selectedCraftedItem ?? undefined}
                  label={selectedCraftedItem ? selectedCraftedItem.name : 'Select a Crafted Weapon...'}
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={selectedLootItem !== undefined}
                />

                <FilterableDropdown
                  dropdownTriggerPrefix='B:'
                  title={'Quest Loot'}
                  items={lootHeroicViktraniumItems}
                  filteredItems={filteredCraftedHeroicViktraniumItems}
                  onSelect={(weapon: CraftingIngredient) => dispatch(setSelectedLootItem(weapon))}
                  onReset={() => dispatch(resetSelectedLootItem())}
                  selectedItem={selectedLootItem ?? undefined}
                  label={selectedLootItem ? selectedLootItem.name : 'Select an Item...'}
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={selectedCraftedItem !== undefined}
                />
              </Stack>
            </Col>
            <Col>
              {selectedLootItem && (
                <Card className='mt-3'>
                  <Card.Header>Augment Slots</Card.Header>
                  <Card.Body>
                    {availableAugmentSlots.length > 0 ? (
                      <Stack gap={3}>
                        {availableAugmentSlots.map((slot) => {
                          const clean: string = slot.replace(/([A-Z])/g, ' $1').trim()
                          const parts: string[] = clean.split(' ')
                          const primary: string = titleCase(parts[0] || '')
                          const colorSlots = new Set<string>([
                            'red',
                            'blue',
                            'yellow',
                            'purple',
                            'orange',
                            'green',
                            'colorless',
                            'sun',
                            'moon'
                          ])
                          const isColorSlot: boolean = colorSlots.has(clean.toLowerCase())
                          const header: string = isColorSlot
                            ? `${primary} Augment`
                            : `${titleCase(parts[0] || '')}: ${titleCase(parts.slice(1)[0])} Slot (${titleCase(
                                parts.slice(1)[1]
                              )})`
                          const itemsMap = { [header]: augmentOptions[slot] }
                          const filteredOptions = { [header]: filteredAugmentOptions[slot] }

                          return (
                            <FilterableDropdown
                              key={slot}
                              dropdownTriggerPrefix='Aug:'
                              title={header}
                              items={itemsMap}
                              filteredItems={filteredOptions}
                              onSelect={(aug: CraftingIngredient) => {
                                handleSelectAugment(slot, aug)
                              }}
                              onReset={() => {
                                handleResetAugment(slot)
                              }}
                              selectedItem={selectedAugments[slot] ?? undefined}
                              label={resolveAugmentLabel(slot, header)}
                              canFilter
                              displayEffectsAdded
                              onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setAugmentFilterMode(mode))}
                              onFiltersChange={(filters: string[]) => dispatch(setAugmentFilters(filters))}
                              filters={augmentFilters}
                              filterMode={augmentFilterMode}
                            />
                          )
                        })}
                      </Stack>
                    ) : (
                      <p>No augment slots available.</p>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>

          <Row className='mt-4'>
            <Col>
              {!selectedLootItem && !selectedCraftedItem ? (
                <Card>
                  <Card.Body>
                    <p>No item selected.</p>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  <Row className='g-2'>
                    <Col xs={12} md={6}>
                      <ItemDisplay selectedItem={selectedCraftedItem ?? selectedLootItem ?? ({} as Ingredient)} />
                    </Col>

                    <Col xs={12} md={6}>
                      <CumulativeIngredientsCard
                        ingredients={getCumulativeIngredients(
                          selectedCraftedItem ?? selectedLootItem,
                          selectedAugments
                        )}
                      />
                    </Col>
                  </Row>
                  {/*<Stack direction='horizontal' gap={3} className='align-items-start'>*/}
                  {/*  <ItemDisplay selectedItem={selectedItem} />*/}
                  {/*  <CumulativeIngredientsCard ingredients={getCumulativeIngredients(selectedItem, selectedAugments)} />*/}
                  {/*</Stack>*/}

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

export default ViktraniumExperimentHeroic
