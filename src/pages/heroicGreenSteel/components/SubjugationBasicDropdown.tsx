import { Fragment } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { resetSubjugationItem, selectSubjugationItem } from '../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { type ElementalList, subjugationElementalList } from '../helpers/elementalData.ts'
import useSubjugationBasic from '../hooks/useSubjugationBasic.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

const SubjugationBasicDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedSubjugationItem } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const { ingredientsMap } = useSubjugationBasic()

  const label = (
    <>
      <Col sm={1}>T2:</Col>
      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>
            {selectedSubjugationItem
              ? selectedSubjugationItem.effectsAdded
                  ?.slice(0, -1)
                  .map((effect) => effect.name)
                  .join(',')
              : 'Select an Upgrade...'}
          </small>
        </strong>
      </Col>
    </>
  )

  const isAspect = (name: string) => {
    return !name.includes('Balance') && !name.includes('Stalemate') && !name.includes('Tempered')
  }

  const renderSection = (name: string, ingredients: CraftingIngredient[]) => {
    return (
      <IngredientDropdownSection
        clickHandler={selectSubjugationItem}
        header={
          <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
            {isAspect(name) ? `Aspect of ${name}` : name}
          </Stack>
        }
        ingredientList={ingredients}
      />
    )
  }

  return (
    <>
      <hr />

      <small>Altar of Subjugation</small>

      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <IngredientDropdownToggle label={label} />

          <Dropdown.Menu
            className='py-0 w-100'
            style={{
              maxHeight: '50vh',
              overflowY: 'auto'
            }}
          >
            {Object.entries(ingredientsMap).map(([name, ingredients]) => {
              if (ingredients.length > 6) {
                const foci: ElementalList[] = subjugationElementalList.filter((element: ElementalList) =>
                  element.name.includes(name)
                )

                if (foci.length > 1) {
                  return (
                    <Fragment key={foci.map((focus) => focus.name).join('|')}>
                      {renderSection(
                        `${name} (T1: ${foci[0]?.elements[1]})`,
                        ingredients.filter((ing: CraftingIngredient) =>
                          ing.requirements.at(0)?.name.includes(foci[0]?.elements[1])
                        )
                      )}
                      {renderSection(
                        `${name} (T1: ${foci[0]?.elements[0]})`,
                        ingredients.filter((ing: CraftingIngredient) =>
                          ing.requirements.at(0)?.name.includes(foci[0]?.elements[0])
                        )
                      )}
                    </Fragment>
                  )
                }
              }

              return renderSection(name, ingredients)
            })}
          </Dropdown.Menu>
        </Dropdown>

        {selectedSubjugationItem && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetSubjugationItem())
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </>
  )
}

export default SubjugationBasicDropdown
