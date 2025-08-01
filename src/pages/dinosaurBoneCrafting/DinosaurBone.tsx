import { useMemo } from 'react'
import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import AugmentSlotFilterableDropdown from '../../components/common/AugmentSlotFilterableDropdown.tsx'
import FilterableDropdown from '../../components/common/FilterableDropdown.tsx'
import { filterIngredientsMap } from '../../components/filters/helpers/filterUtils.ts'
import { augments } from '../../data/augments.ts'
import { dinosaurBoneCrafting } from '../../data/dinosaurBoneCrafting/dinosaurBoneCrafting.ts'
import { dinosaurBoneAccessoryItems } from '../../data/dinosaurBoneCrafting/factories/accessoryItemFactory.ts'
import { dinosaurBoneArmorItems } from '../../data/dinosaurBoneCrafting/factories/armorItemFactory.ts'
import { attunedBoneWeapons } from '../../data/dinosaurBoneCrafting/factories/attunedBoneWeaponFactory.ts'
import { namedItemFactory } from '../../data/dinosaurBoneCrafting/factories/namedItemFactory.ts'
import { dinosaurBoneShieldItems } from '../../data/dinosaurBoneCrafting/factories/shieldItemFactory.ts'
import { craftedDinosaurBoneWeapons } from '../../data/dinosaurBoneCrafting/factories/weaponBlankFactory.ts'
import { dinosaurRunearm } from '../../data/dinosaurBoneCrafting/factories/weaponFactory.ts'
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts'
import {
  resetSelectedItem,
  setAugmentFilterMode,
  setAugmentFilters,
  setItemFilterMode,
  setItemFilters,
  setSelectedAugment,
  setSelectedItem
} from '../../redux/slices/dinosaurBoneSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import { camelCaseToTitleCase, getCumulativeIngredients } from '../../utils/utils.ts'
import CumulativeIngredientsCard from './components/CumulativeIngredientsCard.tsx'
import ItemDisplay from './components/ItemDisplay.tsx'

const DinosaurBone = () => {
  const dispatch: AppDispatch = useAppDispatch()
  const { selectedItem, itemFilters, itemFilterMode, augmentFilters, selectedAugments, augmentFilterMode } =
    useAppSelector((state) => state.dinosaurBone, shallowEqual)

  const filteredCraftedDinosaurBoneWeapons: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, craftedDinosaurBoneWeapons),
    [itemFilters]
  )

  const filteredAttunedBoneWeapons: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, attunedBoneWeapons),
    [itemFilters]
  )

  const filteredNamedItems: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, namedItemFactory()),
    [itemFilters]
  )

  const dinosaurArmorAndAccessories = useMemo(
    () => ({
      ...dinosaurBoneArmorItems,
      ...dinosaurBoneShieldItems,
      ...dinosaurBoneAccessoryItems,
      ...{ Runearm: [dinosaurRunearm] }
    }),
    []
  )

  const filteredDinosaurArmorAndAccessories: Record<string, CraftingIngredient[]> = useMemo(
    () => filterIngredientsMap(itemFilters, dinosaurArmorAndAccessories),
    [dinosaurArmorAndAccessories, itemFilters]
  )

  const handleSelectAugment = (slot: string, augment: CraftingIngredient) => {
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

  const isAttunedItem = (item: CraftingIngredient | undefined): boolean => {
    if (!item) return false

    const prefixMatch: boolean = item.name.startsWith('Attuned')
    const isAttuned: boolean = Object.entries(attunedBoneWeapons).some(([, items]) =>
      items.some((i) => i.name === item.name)
    )

    return prefixMatch && isAttuned
  }

  const isDinosaurBoneArmorOrAccessory = (item: CraftingIngredient | undefined): boolean => {
    if (!item) return false

    const prefixMatch: boolean = item.name.startsWith('Dinosaur Bone')
    const isArmorOrAccessory: boolean = Object.entries(dinosaurArmorAndAccessories).some(([, items]) =>
      items.some((i) => i.name === item.name)
    )

    return prefixMatch && isArmorOrAccessory
  }

  const isNamedItem = (item: CraftingIngredient | undefined): boolean => {
    if (!item) return false

    const prefixMatch: boolean = item.name.startsWith('Legendary') || item.name.startsWith('The Legendary')
    const isNamed: boolean = Object.entries(namedItemFactory()).some(([, items]) =>
      items.some((i) => i.name === item.name)
    )

    return prefixMatch && isNamed
  }

  const isDinosaurBoneWeapon = (item: CraftingIngredient | undefined): boolean => {
    if (!item) return false

    const prefixMatch: boolean = item.name.startsWith('Dinosaur Bone')
    const isWeapon: boolean = Object.entries(craftedDinosaurBoneWeapons).some(([, items]) =>
      items.some((i) => i.name === item.name)
    )

    return prefixMatch && isWeapon
  }

  const availableAugmentSlots = useMemo<string[]>(() => {
    if (!selectedItem?.augments?.length) return []
    const aug = selectedItem.augments[0]
    return Object.entries(aug)
      .filter(([key, value]) => {
        // Include both null augment slots and set bonus slots
        return value === null || key === 'isleOfDreadSetBonus'
      })
      .map(([k]) => k)
  }, [selectedItem])

  const augmentOptions = useMemo<Record<string, CraftingIngredient[]>>(() => {
    return availableAugmentSlots.reduce<Record<string, CraftingIngredient[]>>((acc, slot) => {
      let options: CraftingIngredient[]

      if (slot === 'isleOfDreadSetBonus') {
        options = dinosaurBoneCrafting.filter((ing) => ing.setBonus)
      } else {
        const clean: string = slot
          .replace(/^isleOfDread/, '')
          .replace(/([A-Z])/g, ' $1')
          .trim()
        const words: string[] = clean.split(' ')
        options = [...dinosaurBoneCrafting, ...augments].filter(
          (ing: CraftingIngredient | AugmentItem) =>
            ing.augmentType?.toLowerCase().includes(words[0].toLowerCase()) &&
            ing.augmentType.toLowerCase().includes(words[1]?.toLowerCase() ?? '')
        )
      }

      acc[slot] = options
      return acc
    }, {})
  }, [availableAugmentSlots])

  const filteredAugmentOptions: Record<string, CraftingIngredient[]> = useMemo(() => {
    if (augmentFilters.length === 0) {
      return augmentOptions
    }
    // Apply filterIngredientsMap to reduce options by augmentFilters
    return Object.fromEntries(
      Object.entries(augmentOptions).map(([slot, options]) => {
        const filteredForSlot = filterIngredientsMap(augmentFilters, { '': options })['']
        return [slot, filteredForSlot]
      })
    )
  }, [augmentOptions, augmentFilters])

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='text-center p-1'>
          <Card.Title>
            <h4 className='mb-0'>Dinosaur Bone Crafting</h4>
          </Card.Title>
          <Card.Subtitle>
            <small>
              <a
                href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Dinosaur%20Bone%22'
                target='_blank'
                rel='noreferrer'
                title='Dinosaur Bone Crafting Known Issues & Bug Reports'
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
                  title={'Crafted Weapons (Sharpened Bone [Village of Tanaroa])'}
                  items={craftedDinosaurBoneWeapons}
                  filteredItems={filteredCraftedDinosaurBoneWeapons}
                  onSelect={(weapon: CraftingIngredient) => dispatch(setSelectedItem(weapon))}
                  onReset={() => dispatch(resetSelectedItem())}
                  selectedItem={isDinosaurBoneWeapon(selectedItem) ? selectedItem : undefined}
                  label={
                    isDinosaurBoneWeapon(selectedItem)
                      ? (selectedItem?.name ?? 'Select a Crafted Dinosaur Bone Weapon...')
                      : 'Select a Crafted Dinosaur Bone Weapon...'
                  }
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={selectedItem && !isDinosaurBoneWeapon(selectedItem)}
                />

                <FilterableDropdown
                  dropdownTriggerPrefix='B:'
                  title={'Attuned Bone Weapons (Skeletons in the Closet [Raid])'}
                  items={attunedBoneWeapons}
                  filteredItems={filteredAttunedBoneWeapons}
                  onSelect={(weapon: CraftingIngredient) => dispatch(setSelectedItem(weapon))}
                  onReset={() => dispatch(resetSelectedItem())}
                  selectedItem={isAttunedItem(selectedItem) ? selectedItem : undefined}
                  label={
                    isAttunedItem(selectedItem)
                      ? (selectedItem?.name ?? 'Select an Attuned Bone Weapon...')
                      : 'Select an Attuned Bone Weapon...'
                  }
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={selectedItem && !isAttunedItem(selectedItem)}
                />

                <FilterableDropdown
                  dropdownTriggerPrefix='B:'
                  title={'Dinosaur Bone Armor & Accessories (Skeletons in the Closet [Raid])'}
                  items={dinosaurArmorAndAccessories}
                  filteredItems={filteredDinosaurArmorAndAccessories}
                  onSelect={(accessory: CraftingIngredient) => dispatch(setSelectedItem(accessory))}
                  onReset={() => dispatch(resetSelectedItem())}
                  selectedItem={isDinosaurBoneArmorOrAccessory(selectedItem) ? selectedItem : undefined}
                  label={
                    isDinosaurBoneArmorOrAccessory(selectedItem)
                      ? (selectedItem?.name ?? 'Select a Dinosaur Bone Armor or Accessory Item...')
                      : 'Select a Dinosaur Bone Armor or Accessory Item...'
                  }
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={selectedItem && !isDinosaurBoneArmorOrAccessory(selectedItem)}
                />

                <FilterableDropdown
                  dropdownTriggerPrefix='B:'
                  title={'Named Items (Quests & Raid)'}
                  items={namedItemFactory()}
                  filteredItems={filteredNamedItems}
                  onSelect={(accessory: CraftingIngredient) => dispatch(setSelectedItem(accessory))}
                  onReset={() => dispatch(resetSelectedItem())}
                  selectedItem={isNamedItem(selectedItem) ? selectedItem : undefined}
                  label={
                    isNamedItem(selectedItem)
                      ? (selectedItem?.name ?? 'Select a Named Legendary Item...')
                      : 'Select a Named Legendary Item...'
                  }
                  canFilter
                  filterMode={itemFilterMode}
                  filters={itemFilters}
                  onFilterModeChange={(mode: 'OR' | 'AND') => dispatch(setItemFilterMode(mode))}
                  onFiltersChange={(filters: string[]) => dispatch(setItemFilters(filters))}
                  disabled={selectedItem && !isNamedItem(selectedItem)}
                />
              </Stack>
            </Col>
            <Col>
              {selectedItem && (
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
              {!selectedItem ? (
                <Card>
                  <Card.Body>
                    <p>No item selected.</p>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  <Row className='g-2'>
                    <Col xs={12} md={6}>
                      <ItemDisplay selectedItem={selectedItem} />
                    </Col>

                    <Col xs={12} md={6}>
                      <CumulativeIngredientsCard
                        ingredients={getCumulativeIngredients(selectedItem, selectedAugments)}
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
                                } as CraftingIngredient)
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

export default DinosaurBone
