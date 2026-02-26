import camelcase from 'camelcase'
import { memo, useMemo, useState } from 'react'
import { Badge, Button, Card, Col, Container, OverlayTrigger, Row, Stack, Tooltip } from 'react-bootstrap'
import { FaArrowUpRightFromSquare, FaCircleInfo, FaRotateLeft } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import CraftedIngredientDisplay from '../../components/common/CraftedIngredientDisplay'
import FallbackImage from '../../components/common/FallbackImage'
import FarmedIngredientDisplay from '../../components/common/FarmedIngredientDisplay'
import FilterableDropdown from '../../components/common/FilterableDropdown'
import ShoppingListDrawer, { type ShoppingListTotals } from '../../components/common/ShoppingListDrawer.tsx'
import recipes from '../../data/nearlyFinished/recipes.json'
import { useAppSelector } from '../../redux/hooks.ts'
import type { Enhancement } from '../../types/core'
import type { CraftingIngredient } from '../../types/crafting'
import type { Ingredient } from '../../types/ingredients'
import { ICON_BASE } from '../../utils/constants.ts'
import { formatIngredientName } from '../../utils/utils.ts'

// Types matching the JSON structure (narrowed for this page)
interface MeltingRecipe {
  name: string
  quantity?: number
  requirements: { name: string; quantity: number }[]
}

interface ReforgingEntry {
  item: string
  stage: string
  cost: { name: string; quantity: number }[]
  choices?: Enhancement[]
  effectsAdded?: Enhancement[]
  augments?: unknown[]
}

interface NearlyFinishedData {
  meltingStation: MeltingRecipe[]
  reforgingStation: ReforgingEntry[]
}

// Categorize items based on whether they cost Threads of Fate (Raid items) or not (Regular items)
const isRaidItem = (entry: ReforgingEntry): boolean => entry.cost.some((c) => c.name === 'Thread of Fate')

const buildMeltingMap = (melting: MeltingRecipe[]): Record<string, { name: string; quantity: number }[]> => {
  const map: Record<string, { name: string; quantity: number }[]> = {}
  for (const r of melting) {
    map[r.name] = r.requirements?.map((req) => ({ name: req.name, quantity: req.quantity })) ?? []
  }
  return map
}

// Expand a requirement recursively into raw/crafted buckets
const expandRequirement = (
  name: string,
  qty: number,
  meltingMap: Record<string, { name: string; quantity: number }[]>,
  rawTotals: Record<string, number>,
  craftedTotals: Record<string, number>
) => {
  const recipe = meltingMap[name]
  if (!recipe) {
    // No melting recipe: treat as raw/base material
    rawTotals[name] = (rawTotals[name] ?? 0) + qty
    return
  }

  // Has a crafting recipe: count as crafted and expand its children
  craftedTotals[name] = (craftedTotals[name] ?? 0) + qty
  for (const req of recipe) {
    expandRequirement(req.name, req.quantity * qty, meltingMap, rawTotals, craftedTotals)
  }
}

const groupAsSingleSection = (label: string, items: Ingredient[]): Record<string, Ingredient[]> => ({ [label]: items })

const renderIngredient = (ingredient: Ingredient) => {
  const formattedName: string = formatIngredientName(ingredient?.image ?? ingredient?.name ?? '')
  const imageSrc = `${ICON_BASE}${camelcase(formattedName)}.png`

  return (
    <Stack direction='horizontal' gap={2} className='align-items-center'>
      <FallbackImage alt={ingredient.name} src={imageSrc} width='24px' />
      <span>{ingredient.name}</span>
    </Stack>
  )
}

// Build a simple ingredient list display
const TotalsList = memo(
  ({
    title,
    totals,
    type,
    meltingMap
  }: {
    title: string
    totals: { name: string; qty: number }[]
    type: 'raw' | 'crafted'
    meltingMap: Record<string, { name: string; quantity: number }[]>
  }) => {
    return (
      <Card className='mb-3'>
        <Card.Header>
          <strong>{title}</strong> <Badge bg='secondary'>{totals.length}</Badge>
        </Card.Header>
        <Card.Body className='p-2'>
          {totals.length === 0 ? (
            <div className='text-muted ps-2'>No ingredients required yet</div>
          ) : (
            <Stack gap={2}>
              {totals.map(({ name, qty }) => {
                const requirements = meltingMap[name]?.map(
                  (req) => ({ name: req.name, quantity: req.quantity }) as CraftingIngredient
                )
                return (
                  <div key={name} className='p-1 border-bottom last-child-no-border'>
                    {type === 'raw' ? (
                      <FarmedIngredientDisplay
                        ingredient={{ name, requirements } as CraftingIngredient}
                        quantity={qty}
                        showLocation={false}
                        showQuantity={true}
                      />
                    ) : (
                      <CraftedIngredientDisplay
                        ingredient={{ name, requirements } as CraftingIngredient}
                        quantity={qty}
                        showLocation={false}
                        showPopover={true}
                      />
                    )}
                  </div>
                )
              })}
            </Stack>
          )}
        </Card.Body>
      </Card>
    )
  }
)

const NearlyFinished = () => {
  const data = recipes as NearlyFinishedData
  const meltingMap = useMemo(() => buildMeltingMap(data.meltingStation), [data.meltingStation])

  const nearlyFinishedEntries = useMemo(
    () => data.reforgingStation.filter((e) => e.stage === 'Nearly Finished'),
    [data.reforgingStation]
  )

  const heroicDropdownItems = useMemo(
    () =>
      groupAsSingleSection(
        'Heroic Items',
        nearlyFinishedEntries
          .filter((e) => !isRaidItem(e) && !e.item.startsWith('Legendary') && !e.item.startsWith('The Legendary'))
          .sort((a, b) => a.item.localeCompare(b.item))
          .map((e) => ({ name: e.item }) as Ingredient)
      ),
    [nearlyFinishedEntries]
  )

  const legendaryDropdownItems = useMemo(
    () =>
      groupAsSingleSection(
        'Legendary Items',
        nearlyFinishedEntries
          .filter((e) => (!isRaidItem(e) && e.item.startsWith('Legendary')) || e.item.startsWith('The Legendary'))
          .sort((a, b) => a.item.localeCompare(b.item))
          .map((e) => ({ name: e.item }) as Ingredient)
      ),
    [nearlyFinishedEntries]
  )

  const raidDropdownItems = useMemo(
    () =>
      groupAsSingleSection(
        'Raid Items',
        nearlyFinishedEntries
          .filter((e) => isRaidItem(e))
          .sort((a, b) => a.item.localeCompare(b.item))
          .map((e) => ({ name: e.item }) as Ingredient)
      ),
    [nearlyFinishedEntries]
  )

  const [selectedHeroic, setSelectedHeroic] = useState<ReforgingEntry | null>(null)
  const [selectedLegendary, setSelectedLegendary] = useState<ReforgingEntry | null>(null)
  const [selectedRaid, setSelectedRaid] = useState<ReforgingEntry | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<Enhancement | null>(null)

  const [showShoppingList, setShowShoppingList] = useState(false)
  const [shoppingListPlanBound, setShoppingListPlanBound] = useState(true)

  const { troveData } = useAppSelector((state) => state.app, shallowEqual)

  const clearSelection = () => {
    setSelectedHeroic(null)
    setSelectedLegendary(null)
    setSelectedRaid(null)
    setSelectedChoice(null)
  }

  const onSelectHeroic = (ing: Ingredient) => {
    clearSelection()
    const entry = nearlyFinishedEntries.find((e) => e.item === ing.name) ?? null
    setSelectedHeroic(entry)
  }

  const onSelectLegendary = (ing: Ingredient) => {
    clearSelection()
    const entry = nearlyFinishedEntries.find((e) => e.item === ing.name) ?? null
    setSelectedLegendary(entry)
  }

  const onSelectRaid = (ing: Ingredient) => {
    clearSelection()
    const entry = nearlyFinishedEntries.find((e) => e.item === ing.name) ?? null
    setSelectedRaid(entry)
  }

  const currentEntry = selectedHeroic ?? selectedLegendary ?? selectedRaid
  const currentChoices = currentEntry?.choices

  // Logic to calculate raw and crafted totals recursively
  const { rawTotals, craftedTotals } = useMemo(() => {
    const raw: Record<string, number> = {}
    const crafted: Record<string, number> = {}
    if (currentEntry) {
      for (const costItem of currentEntry.cost) {
        expandRequirement(costItem.name, costItem.quantity, meltingMap, raw, crafted)
      }
    }
    return { rawTotals: raw, craftedTotals: crafted }
  }, [currentEntry, meltingMap])

  // Topological sort for crafted ingredients to show dependencies in order
  const sortedCraftedTotals = useMemo(() => {
    const visited = new Set<string>()
    const sorted: { name: string; qty: number }[] = []

    const visit = (name: string) => {
      if (visited.has(name) || !craftedTotals[name]) return
      visited.add(name)
      const requirements = meltingMap[name]
      if (requirements) {
        for (const req of requirements) {
          visit(req.name)
        }
      }
      sorted.push({ name, qty: craftedTotals[name] })
    }

    Object.keys(craftedTotals).forEach(visit)
    return sorted
  }, [craftedTotals, meltingMap])

  // Choice dropdown (only when multiple choices exist)
  const renderChoiceDropdown = () => {
    if (!currentChoices || currentChoices.length <= 1) return null

    const items: Record<string, Ingredient[]> = groupAsSingleSection(
      'Available Options',
      currentChoices.map((c) => ({ name: c.name })) as Ingredient[]
    )

    return (
      <FilterableDropdown
        canFilter={false}
        items={items}
        label={selectedChoice?.name ?? 'Select one option'}
        onSelect={(ing: Ingredient) => {
          setSelectedChoice({ name: ing.name } as Enhancement)
        }}
        renderSectionBody={renderIngredient}
        selectedItem={selectedChoice ? ({ name: selectedChoice.name } as unknown as Ingredient) : undefined}
        title='Property Choice'
        dropdownTriggerPrefix='🎯'
      />
    )
  }

  const rawEntries = useMemo(
    () =>
      Object.entries(rawTotals)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, qty]) => ({ name, qty })),
    [rawTotals]
  )

  // Build a combined Shopping List totals payload (farmed + crafted)
  const shoppingTotals: ShoppingListTotals = useMemo(() => {
    const farmedRows = Object.entries(rawTotals)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const craftedRows = sortedCraftedTotals

    return {
      essence: 0,
      purified: 0,
      farmedRows,
      craftedRows
    }
  }, [rawTotals, sortedCraftedTotals])

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='py-3'>
          <div className='d-flex flex-column flex-md-row align-items-center justify-content-between gap-3'>
            <div className='text-center text-md-start'>
              <Stack
                direction='horizontal'
                gap={2}
                className='align-items-center justify-content-center justify-content-md-start'
              >
                <h4 className='mb-0'>Nearly Finished Crafting</h4>
                <OverlayTrigger
                  placement='right'
                  overlay={
                    <Tooltip id='page-info'>
                      Nearly Finished is a crafting system for items from Project Nemesis and Too Hot to Handle, as well
                      as certain Sharn items.
                    </Tooltip>
                  }
                >
                  <span className='text-primary' style={{ cursor: 'help' }}>
                    <FaCircleInfo />
                  </span>
                </OverlayTrigger>
              </Stack>
              <small>
                <a
                  href='https://github.com/veteran-software/yourddo/issues?q=state%3Aopen%20label%3A%22Nearly%20Finished%22'
                  target='_blank'
                  rel='noreferrer'
                  title='Nearly Finished Known Issues & Bug Reports'
                >
                  Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
                </a>
              </small>
            </div>
            <div className='d-flex align-items-center gap-2'>
              <Button variant='outline-light' size='sm' onClick={clearSelection}>
                <FaRotateLeft className='me-1' /> Reset All
              </Button>
              <Button
                variant='outline-light'
                size='sm'
                disabled={!currentEntry}
                onClick={() => {
                  setShowShoppingList(true)
                }}
                title={currentEntry ? 'Open Shopping List' : 'Select an item to open the Shopping List'}
              >
                Shopping List
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <Stack gap={3}>
            <Row xs={1} lg={3} className='g-3'>
              <Col>
                <FilterableDropdown
                  items={heroicDropdownItems}
                  label={selectedHeroic?.item ?? 'Select Heroic Item'}
                  onSelect={onSelectHeroic}
                  renderSectionBody={renderIngredient}
                  selectedItem={selectedHeroic ? ({ name: selectedHeroic.item } as unknown as Ingredient) : undefined}
                  title='Heroic Regular Items'
                  dropdownTriggerPrefix='🛡️'
                />
              </Col>
              <Col>
                <FilterableDropdown
                  items={legendaryDropdownItems}
                  label={selectedLegendary?.item ?? 'Select Legendary Item'}
                  onSelect={onSelectLegendary}
                  renderSectionBody={renderIngredient}
                  selectedItem={
                    selectedLegendary ? ({ name: selectedLegendary.item } as unknown as Ingredient) : undefined
                  }
                  title='Legendary Regular Items'
                  dropdownTriggerPrefix='✨'
                />
              </Col>
              <Col>
                <FilterableDropdown
                  items={raidDropdownItems}
                  label={selectedRaid?.item ?? 'Select Raid Item'}
                  onSelect={onSelectRaid}
                  renderSectionBody={renderIngredient}
                  selectedItem={selectedRaid ? ({ name: selectedRaid.item } as unknown as Ingredient) : undefined}
                  title='Raid Items'
                  dropdownTriggerPrefix='🗡️'
                />
              </Col>
            </Row>

            {/* Optional choice dropdown when applicable */}
            {currentChoices && currentChoices.length > 0 && (
              <Row>
                <Col>{renderChoiceDropdown()}</Col>
              </Row>
            )}

            {currentEntry && (
              <Row className='mt-4'>
                <Col md={5}>
                  <TotalsList title='1. Gather Raw Materials' totals={rawEntries} type='raw' meltingMap={meltingMap} />
                </Col>
                <Col md={7}>
                  <Card>
                    <Card.Header className='bg-success-subtle text-success-emphasis'>
                      <Stack direction='horizontal' gap={2}>
                        <strong>2. Crafting Sequence</strong>
                        <Badge bg='success'>{sortedCraftedTotals.length + 1}</Badge>
                      </Stack>
                    </Card.Header>
                    <Card.Body className='p-2'>
                      {sortedCraftedTotals.length === 0 ? (
                        <div className='p-2 border-bottom last-child-no-border'>
                          <Stack direction='horizontal' gap={3} className='align-items-center'>
                            <Badge pill bg='secondary'>
                              1
                            </Badge>
                            <div className='flex-grow-1'>
                              <CraftedIngredientDisplay
                                ingredient={
                                  {
                                    name: currentEntry.item,
                                    requirements: currentEntry.cost.map(
                                      (c) => ({ name: c.name, quantity: c.quantity }) as CraftingIngredient
                                    )
                                  } as CraftingIngredient
                                }
                                quantity={1}
                                showLocation={false}
                                showPopover={true}
                              />
                            </div>
                          </Stack>
                        </div>
                      ) : (
                        <Stack gap={2}>
                          {sortedCraftedTotals.map(({ name, qty }, index) => {
                            const requirements = meltingMap[name]?.map(
                              (req) => ({ name: req.name, quantity: req.quantity }) as CraftingIngredient
                            )
                            return (
                              <div key={name} className='p-2 border-bottom last-child-no-border'>
                                <Stack direction='horizontal' gap={3} className='align-items-center'>
                                  <Badge pill bg='secondary'>
                                    {index + 1}
                                  </Badge>
                                  <div className='flex-grow-1'>
                                    <CraftedIngredientDisplay
                                      ingredient={{ name, requirements } as CraftingIngredient}
                                      quantity={qty}
                                      showLocation={false}
                                      showPopover={true}
                                    />
                                  </div>
                                </Stack>
                              </div>
                            )
                          })}
                          <div className='p-2 bg-success-subtle rounded'>
                            <Stack direction='horizontal' gap={3} className='align-items-center'>
                              <Badge pill bg='success'>
                                {sortedCraftedTotals.length + 1}
                              </Badge>
                              <div className='fw-bold'>Final Item Upgrade:</div>
                              <div className='flex-grow-1'>
                                <CraftedIngredientDisplay
                                  ingredient={
                                    {
                                      name: currentEntry.item,
                                      requirements: currentEntry.cost.map(
                                        (c) => ({ name: c.name, quantity: c.quantity }) as CraftingIngredient
                                      )
                                    } as CraftingIngredient
                                  }
                                  quantity={1}
                                  showLocation={false}
                                  showPopover={true}
                                />
                              </div>
                            </Stack>
                          </div>
                        </Stack>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Stack>
        </Card.Body>
      </Card>

      {/* Offcanvas Shopping List Drawer */}
      <ShoppingListDrawer
        show={showShoppingList}
        onHide={() => {
          setShowShoppingList(false)
        }}
        title={currentEntry ? `Shopping List — ${currentEntry.item}` : 'Shopping List'}
        planBound={shoppingListPlanBound}
        onPlanChange={setShoppingListPlanBound}
        showBindingToggle={false}
        totals={shoppingTotals}
        troveData={troveData}
      />
    </Container>
  )
}

export default NearlyFinished
