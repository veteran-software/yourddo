import { useEffect, useState } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts'
import { setSelectedRing } from '../../redux/slices/incrediblePotentialSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import type { Ring } from '../../types/core.ts'
import {
  chooseUpgrade,
  incrediblePotential,
  selectBaseItem
} from '../../utils/strings.ts'
import BaseItemDropdown from './components/BaseItemDropdown.tsx'
import CraftedMaterialList from './components/CraftedMaterialList.tsx'
import ItemUpgradeDropdown from './components/ItemUpgradeDropdown.tsx'
import RawMaterialList from './components/RawMaterialList.tsx'
import SelectedRingDetails from './components/SelectedRingDetails.tsx'
import useRecipeBuilder from './hooks/useRecipeBuilder.ts'

const IncrediblePotential = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { craftedIngredients, rawMaterials, selectedRing, selectedUpgrade } =
    useAppSelector((state) => state.incrediblePotential, shallowEqual)

  const { recipeBuilder, resetRecipe } = useRecipeBuilder()

  const [itemButtonLabel, setItemButtonLabel] = useState(selectBaseItem)
  const [recipeButtonLabel, setRecipeButtonLabel] = useState(chooseUpgrade)

  useEffect(() => {
    if (selectedUpgrade) {
      setRecipeButtonLabel(
        `${incrediblePotential} : ${
          selectedUpgrade.effectsAdded?.[0].name ?? ''
        }`
      )

      resetRecipe()
      recipeBuilder(selectedUpgrade)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, recipeBuilder, selectedUpgrade])

  return (
    <Container>
      <Card>
        <Card.Body>
          <Row md={1} lg={2}>
            <Col>
              <BaseItemDropdown
                onSelectItem={(item: Ring) => {
                  dispatch(setSelectedRing(item))
                  setItemButtonLabel(item.name)
                }}
                buttonLabel={itemButtonLabel}
              />

              {selectedRing && (
                <ItemUpgradeDropdown buttonLabel={recipeButtonLabel} />
              )}
              {selectedRing && <SelectedRingDetails />}
            </Col>
            <Col>
              {selectedRing && selectedUpgrade && (
                <>
                  <RawMaterialList rawMaterials={rawMaterials} />

                  <CraftedMaterialList
                    craftedIngredients={craftedIngredients}
                    selectedRing={selectedRing}
                  />
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
