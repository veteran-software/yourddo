import { useCallback, useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import { altarOfSubjugation } from '../../../../data/altarOfSubjugation.ts'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import { resetSubjugationSpell, selectSubjugationSpell } from '../../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructHgsShard } from '../../../../utils/objectUtils.ts'

const SubjugationSpellDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()
  const {
    subjugationItems,
    selectedSubjugationSpell,
    selectedSubjugationItem,
    selectedDevastationFocused,
    selectedInvasionItem
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const [spells, setSpells] = useState<Record<string, CraftingIngredient[]>>({})
  const [label, setLabel] = useState<string>('Select a Bonus Spell...')

  const populateSpellList = useCallback((spellItems: CraftingIngredient[]) => {
    if (spellItems.length === 0) {
      setSpells({})
      setLabel('No spells available for the selected upgrade')
      return
    }

    const spellsMap: Record<string, CraftingIngredient[]> = {}
    spellItems.forEach((item: CraftingIngredient) => {
      if (item.spell) {
        const effectName: string = item.effectsAdded?.at(-1)?.name ?? 'Other'
        spellsMap[effectName] = spellsMap[effectName] ?? []

        if (spellsMap[effectName].length !== 0) return

        spellsMap[effectName].push(item)
      }
    })
    setSpells(spellsMap)
  }, [])

  useEffect(() => {
    if (selectedSubjugationSpell?.spell) {
      setLabel(`${selectedSubjugationSpell.spell.name} (CL: ${String(selectedSubjugationSpell.spell.casterLevel)})`)
    } else {
      setLabel('Select a Bonus Spell...')
    }
  }, [selectedSubjugationSpell?.spell])

  useEffect(() => {
    if (selectedDevastationFocused) {
      const { focus } = deconstructHgsShard(selectedDevastationFocused.requirements?.at(1)?.name ?? '')

      if (focus) {
        const spellList: CraftingIngredient[] = altarOfSubjugation
          .filter((spellItem: CraftingIngredient) =>
            spellItem.effectsAdded?.some((effect: Enhancement) => effect.name.includes(`Aspect of ${focus}`))
          )
          .filter((spellItem: CraftingIngredient) => spellItem.spell !== undefined)

        populateSpellList(spellList)
        if (spellList.length) {
          dispatch(selectSubjugationSpell(spellList[0]))
        }
        return
      }
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

  const renderSpellBody = (ingredient: CraftingIngredient) => {
    if (!ingredient.spell) return <></>

    return (
      <small>{`${ingredient.spell.name} (CL: ${String(ingredient.spell.casterLevel)}, Charges: ${String(
        ingredient.spell.charges
      )}, Recharge ${String(ingredient.spell.rechargePerDay)}/day)`}</small>
    )
  }

  return (
    <FilterableDropdown
      dropdownTriggerPrefix='T2-B:'
      title='Tier 2: Bonus Spell'
      items={spells}
      onSelect={(item: CraftingIngredient) => dispatch(selectSubjugationSpell(item))}
      onReset={() => dispatch(resetSubjugationSpell())}
      selectedItem={selectedSubjugationSpell}
      label={label}
      disabled={Object.keys(spells).length === 0}
      renderSectionBody={renderSpellBody}
    />
  )
}

export default SubjugationSpellDropdown
