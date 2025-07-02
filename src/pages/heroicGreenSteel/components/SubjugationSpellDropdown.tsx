import { useCallback, useEffect, useState } from 'react'
import { Button, Col, Container, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { altarOfSubjugation } from '../../../data/altarOfSubjugation.ts'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { resetSubjugationSpell, selectSubjugationSpell } from '../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { deconstructHgsShard } from '../../../utils/objectUtils.ts'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

const SubjugationSpellDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()
  const {
    subjugationItems,
    selectedSubjugationSpell,
    selectedSubjugationItem,
    selectedDevastationFocused,
    selectedInvasionItem
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const [active, setActive] = useState<string>('')
  const [spells, setSpells] = useState<Record<string, CraftingIngredient>>({} as Record<string, CraftingIngredient>)
  const [label, setLabel] = useState<string>()

  const populateSpellList = useCallback((spells: CraftingIngredient[]) => {
    if (spells.length === 0) {
      setSpells({} as Record<string, CraftingIngredient>)
      setLabel('No spells available for the selected upgrade')
      setActive('')
      return
    }

    let spellsLocal: Record<string, CraftingIngredient> = {}
    spells.forEach((item: CraftingIngredient) => {
      if (item.spell) {
        spellsLocal = {
          ...spellsLocal,
          [item.effectsAdded?.at(-1)?.name ?? '']: item
        }
      }

      setSpells({ ...spellsLocal })
    })
  }, [])

  useEffect(() => {
    populateSpellList(subjugationItems)
  }, [populateSpellList, subjugationItems])

  useEffect(() => {
    if (selectedSubjugationSpell?.spell) {
      setLabel(`${selectedSubjugationSpell.spell.name} (CL: ${String(selectedSubjugationSpell.spell.casterLevel)})`)
      setActive(selectedSubjugationSpell.spell.name)
    } else {
      setLabel('Select a Bonus Spell...')
      setActive('')
    }
  }, [selectedSubjugationSpell?.spell])

  useEffect(() => {
    if (selectedDevastationFocused) {
      const { focus } = deconstructHgsShard(selectedDevastationFocused.requirements?.at(1)?.name ?? '')

      if (focus) {
        const spellList: CraftingIngredient[] = altarOfSubjugation
          .filter((spellItem: CraftingIngredient) =>
            spellItem.effectsAdded?.some((effect: Enhancement) => {
              return effect.name.includes(`Aspect of ${focus}`)
            })
          )
          .filter((spellItem: CraftingIngredient) => spellItem.spell !== undefined)

        if (spellList.length) {
          populateSpellList(spellList)
        } else {
          populateSpellList([])
        }

        dispatch(selectSubjugationSpell(spellList[0]))
      }

      return
    }

    if (selectedSubjugationItem && !selectedInvasionItem) {
      dispatch(selectSubjugationSpell(selectedSubjugationItem))

      populateSpellList([selectedSubjugationItem])

      return
    }

    if (!selectedSubjugationItem && selectedInvasionItem) {
      const t1Focus: string = deconstructHgsShard(selectedInvasionItem.name).focus
      const spellList: CraftingIngredient[] = altarOfSubjugation
        .filter((spellItem: CraftingIngredient) => spellItem.requirements?.[0].name.includes(t1Focus))
        .filter((spellItem: CraftingIngredient) => spellItem.spell !== undefined)

      populateSpellList(spellList)

      return
    }

    populateSpellList(subjugationItems)
  }, [
    dispatch,
    populateSpellList,
    selectedDevastationFocused,
    subjugationItems,
    selectedSubjugationItem,
    selectedInvasionItem
  ])

  return (
    <Stack direction='horizontal' gap={2} className='mt-2'>
      <Dropdown className='d-flex flex-grow-1'>
        <IngredientDropdownToggle
          disabled={Object.keys(spells).length === 0}
          label={
            <>
              <Col sm={1} title='Tier 2: Bonus Spell'>
                T2-B:
              </Col>
              <Col sm={11} className='d-flex justify-content-start'>
                <strong>
                  <small>{label}</small>
                </strong>
              </Col>
            </>
          }
        />

        <Dropdown.Menu
          className='py-0 w-100'
          style={{
            maxHeight: '50vh',
            overflowY: 'auto'
          }}
        >
          {Object.entries(spells).map(([name, item]: [string, CraftingIngredient], idx: number) => {
            if (!item.spell) return <></>
            const key: string = item.spell.name

            return (
              <Container key={`${item.spell.name}-${String(idx)}`} className='m-0 p-0 w-auto'>
                <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
                  <h6 className='m-0 text-center'>{name}</h6>
                </Dropdown.Header>

                <Dropdown.Item
                  active={active === key}
                  key={key}
                  onClick={() => {
                    dispatch(selectSubjugationSpell(item))
                    setActive(key)
                  }}
                >
                  <small>{`${item.spell.name} (CL: ${String(item.spell.casterLevel)}, Charges: ${String(
                    item.spell.charges
                  )}, Recharge ${String(item.spell.rechargePerDay)}/day)`}</small>
                </Dropdown.Item>
              </Container>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>

      {selectedSubjugationSpell && (
        <Button
          variant='outline-info'
          onClick={() => {
            dispatch(resetSubjugationSpell())
          }}
        >
          Reset
        </Button>
      )}
    </Stack>
  )
}

export default SubjugationSpellDropdown
