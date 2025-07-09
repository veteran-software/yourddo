import { useMemo, useState } from 'react'
import { Accordion, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import UpgradeItemData from '../../components/common/UpgradeItemData.tsx'
import { cauldronOfCadence } from '../../data/cauldronOfCadence.ts'
import type { Enhancement } from '../../types/core.ts'
import type { CraftingIngredient, SetBonus } from '../../types/crafting.ts'
import { effects } from './utils/helpers.ts'

const CauldronOfCadence = () => {
  const data: CraftingIngredient[] = useMemo(() => cauldronOfCadence, [])

  const [items] = useState(data.map((item: CraftingIngredient) => item.requirements?.at(-1)?.name ?? 'Unknown Item'))

  const [activeItem, setActiveItem] = useState<CraftingIngredient>()

  const handleItemSwitchChange = (value: string) => {
    const itemToSelect: CraftingIngredient | undefined =
      data.find((item: CraftingIngredient) => item.requirements?.at(-1)?.name === value) ?? undefined
    setActiveItem(activeItem?.requirements?.at(-1)?.name === value ? undefined : itemToSelect)
  }

  const handleEffectSwitchChange = (setBonus: SetBonus) => {
    const itemToSelect: CraftingIngredient | undefined = data.find((item: CraftingIngredient) =>
      item.setBonus?.some((bonus: SetBonus) => bonus.name === setBonus.name)
    )
    setActiveItem(
      activeItem?.setBonus?.some((bonus: SetBonus) => bonus.name === setBonus.name) ? undefined : itemToSelect
    )
  }

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='text-center'>
          <Card.Title>
            <h4 className='mb-0'>Cauldron of Cadence</h4>
          </Card.Title>
          <Card.Subtitle>
            <small>
              <a
                href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Cauldron%20of%20Cadence%22'
                target='_blank'
                rel='noreferrer'
                title='Cauldron of Cadence Known Issues & Bug Reports'
              >
                Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
              </a>
            </small>
          </Card.Subtitle>
        </Card.Header>

        <Card.Body>
          <Row className='m-0 p-0'>
            <Col>
              <p className='m-0 p-0 text-center'>
                <small>
                  Select an item you already have (or want to farm for) OR select an effect to find which set bonus it
                  belongs to.
                </small>
              </p>
              <p className='m-0 p-0 text-center'>
                <small>
                  <strong>All augments are Minimum Level 30.</strong>
                </small>
              </p>
            </Col>
          </Row>
          <Row>
            <Container fluid className='p-3'>
              <Accordion className='w-100'>
                <Accordion.Item eventKey={'0'}>
                  <Accordion.Header className='w-100'>Item Selection</Accordion.Header>
                  <Accordion.Body>
                    <Row className='g-2 align-items-center'>
                      {items
                        .toSorted((a: string, b: string) => a.localeCompare(b))
                        .map((value: string, idx: number) => (
                          <Col key={`${value}-${String(idx)}`} xs={12} sm={6} md={4} lg={3} xl={2}>
                            <Form.Check
                              type='switch'
                              id={`switch-${value}-${String(idx)}`}
                              label={value}
                              disabled={activeItem !== undefined && activeItem.requirements?.at(-1)?.name !== value}
                              checked={activeItem?.requirements?.at(-1)?.name === value}
                              onChange={() => {
                                handleItemSwitchChange(value)
                              }}
                              className='d-flex align-items-center gap-2'
                            />
                          </Col>
                        ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey={'1'}>
                  <Accordion.Header className='w-100'>Effect Selection</Accordion.Header>
                  <Accordion.Body>
                    <Row className='g-2 align-items-center'>
                      {effects(data).map((setBonus: SetBonus, idx: number) => (
                        <Col key={`${setBonus.name}-${String(idx)}`} xs={12} sm={12} md={6} lg={4} xl={3}>
                          <Form.Check
                            type='switch'
                            id={`switch-${setBonus.name}-${String(idx)}`}
                            label={setBonus.enhancements
                              ?.flatMap(
                                (enhancement: Enhancement) =>
                                  `${enhancement.name} (+${String(enhancement.modifier)}${
                                    enhancement.bonus ? ` ${enhancement.bonus}` : ''
                                  })`
                              )
                              .join(', ')}
                            disabled={activeItem?.setBonus?.some((bonus: SetBonus) => bonus.name !== setBonus.name)}
                            checked={
                              activeItem?.setBonus?.some((bonus: SetBonus) => bonus.name === setBonus.name) ?? false
                            }
                            onChange={() => {
                              handleEffectSwitchChange(setBonus)
                            }}
                            className='d-flex align-items-center gap-2'
                          />
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Container>
          </Row>

          <UpgradeItemData ingredient={activeItem} />
        </Card.Body>
      </Card>
    </Container>
  )
}

export default CauldronOfCadence
