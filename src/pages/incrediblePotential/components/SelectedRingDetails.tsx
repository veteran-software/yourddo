import { Card, Container, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import EnhancementDisplay from '../../../components/EnhancementDisplay.tsx'
import { enhancements } from '../../../data/enhancements.ts'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { Enhancement } from '../../../types/core.ts'
import {
  bindingText,
  equipsTo,
  ingredientType,
  minimumLevel,
  ringText
} from '../../../utils/strings.ts'

const SelectedRingDetails = () => {
  const { selectedRing, selectedUpgrade } = useAppSelector(
    (state) => state.incrediblePotential,
    shallowEqual
  )

  if (selectedRing) {
    return (
      <>
        <hr />

        <Card>
          <Card.Header className='text-center'>
            <Card.Title>
              <h2>{selectedRing.name}</h2>
            </Card.Title>
            <Card.Subtitle>{ringText}</Card.Subtitle>
          </Card.Header>

          <Card.Body className='d-flex small'>
            <Stack direction='vertical' gap={1}>
              <Stack
                direction='horizontal'
                className='justify-content-end w-100'
              >
                {equipsTo}
                {selectedRing.slot.join(', ')}
              </Stack>

              <Container>
                {ingredientType}
                {selectedRing.ingredientType}
              </Container>

              <Container>
                {minimumLevel}
                {selectedRing.minimumLevel}
              </Container>

              {selectedRing.binding && (
                <Container>
                  {selectedRing.binding.type === 'Bound' &&
                    bindingText(selectedRing.binding)}
                </Container>
              )}

              {selectedRing.exclusive && <Container>Exclusive</Container>}

              {selectedRing.enchantments.map(
                (enhancement: Enhancement, idx: number) => {
                  if (enhancement.name === 'Incredible Potential') {
                    if (selectedUpgrade) {
                      return (
                        <EnhancementDisplay
                          key={`${enhancement.name}-${String(idx)}`}
                          enhancement={selectedUpgrade.enhancements?.[0]}
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
    )
  }

  return <></>
}

export default SelectedRingDetails
