import type { ReactElement } from 'react'
import { Card, Form, Offcanvas, Stack, Table } from 'react-bootstrap'
import type { Ingredient } from '../../types/ingredients.ts'
import { getOwnedIngredients } from '../../utils/jsxUtils.tsx'
import type { ItemRollup } from '../trove/types.ts'

export interface ShoppingListTotals {
  essence: number
  purified: number
  rows?: { name: string; qty: number }[]
  farmedRows?: { name: string; qty: number }[]
  craftedRows?: { name: string; qty: number }[]
}

interface Props {
  show: boolean
  onHide: () => void
  title?: string
  planBound: boolean
  onPlanChange: (bound: boolean) => void
  showBindingToggle?: boolean
  totals: ShoppingListTotals
  troveData: ItemRollup | null
}

const ShoppingListDrawer = (props: Props): ReactElement => {
  const {
    show,
    onHide,
    title = 'Shopping List',
    planBound,
    onPlanChange,
    showBindingToggle = true,
    totals,
    troveData
  } = props

  return (
    <Offcanvas show={show} onHide={onHide} placement='end' style={{ minWidth: '25%' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{title}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Stack gap={3}>
          {showBindingToggle && (
            <Form.Group controlId='shopping-list-plan'>
              <Form.Label>Crafting Plan</Form.Label>
              <Form.Select
                value={planBound ? 'bound' : 'unbound'}
                onChange={(event) => {
                  onPlanChange(event.target.value === 'bound')
                }}
              >
                <option value='bound'>Bound</option>
                <option value='unbound'>Unbound</option>
              </Form.Select>
            </Form.Group>
          )}

          {(!totals.rows || totals.rows.length === 0) &&
          (!totals.farmedRows || totals.farmedRows.length === 0) &&
          (!totals.craftedRows || totals.craftedRows.length === 0) ? (
            <div className='text-muted'>No materials to show. Add items and select affixes.</div>
          ) : (
            <>
              {(totals.essence > 0 || totals.purified > 0) && (
                <Card className='rounded-0'>
                  <Card.Header>
                    <strong>Summary</strong>
                  </Card.Header>
                  <Card.Body className='p-0'>
                    <Table size='sm' striped className='mb-0'>
                      <tbody>
                        {totals.essence > 0 && (
                          <tr>
                            <td className='ps-2'>Cannith Essence</td>
                            <td className='text-end'>{totals.essence}</td>
                          </tr>
                        )}
                        {totals.purified > 0 && (
                          <tr>
                            <td className='ps-2'>Purified Eberron Dragonshard Fragment</td>
                            <td className='text-end'>{totals.purified}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {totals.rows && totals.rows.length > 0 && (
                <Card className='rounded-0'>
                  <Card.Header>
                    <strong>All Materials</strong>
                  </Card.Header>
                  <Card.Body className='p-0'>
                    <Table size='sm' responsive striped className='mb-0 align-middle'>
                      <colgroup>
                        <col className='col-8' />
                        <col className='col-4' style={{ whiteSpace: 'nowrap' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className='ps-2'>Ingredient</th>
                          <th className='text-end'>Have / Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {totals.rows.map(({ name, qty }) => (
                          <tr key={`${name}-${String(qty)}`}>
                            <td className='text-truncate' title={name}>
                              {name}
                            </td>
                            <td className='text-end'>
                              {getOwnedIngredients({ name } as unknown as Ingredient, qty, troveData)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {totals.farmedRows && totals.farmedRows.length > 0 && (
                <Card className='rounded-0'>
                  <Card.Header>
                    <strong>Farmed Materials</strong>
                  </Card.Header>
                  <Card.Body className='p-0'>
                    <Table size='sm' responsive striped className='mb-0 align-middle'>
                      <colgroup>
                        <col className='col-8' />
                        <col className='col-4' style={{ whiteSpace: 'nowrap' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className='ps-2'>Ingredient</th>
                          <th className='text-end'>Have / Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {totals.farmedRows.map(({ name, qty }) => (
                          <tr key={`${name}-${String(qty)}`}>
                            <td className='text-truncate' title={name}>
                              {name}
                            </td>
                            <td className='text-end'>
                              {getOwnedIngredients({ name } as unknown as Ingredient, qty, troveData)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {totals.craftedRows && totals.craftedRows.length > 0 && (
                <Card className='rounded-0'>
                  <Card.Header>
                    <strong>Crafted Materials</strong>
                  </Card.Header>
                  <Card.Body className='p-0'>
                    <Table size='sm' responsive striped className='mb-0 align-middle'>
                      <colgroup>
                        <col className='col-8' />
                        <col className='col-4' style={{ whiteSpace: 'nowrap' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className='ps-2'>Ingredient</th>
                          <th className='text-end'>Have / Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {totals.craftedRows.map(({ name, qty }) => (
                          <tr key={`${name}-${String(qty)}`}>
                            <td className='text-truncate' title={name}>
                              {name}
                            </td>
                            <td className='text-end'>
                              {getOwnedIngredients({ name } as unknown as Ingredient, qty, troveData)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Stack>
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default ShoppingListDrawer
