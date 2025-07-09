import { Card, Dropdown } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { setMinimumLevel } from '../../../redux/slices/cannithCraftingSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'

const MinimumLevel = () => {
  const dispatch: AppDispatch = useAppDispatch()
  const { minimumLevel } = useAppSelector((state) => state.cannithCrafting, shallowEqual)

  const renderLevelGroup = (title: string, start: number, end: number) => (
    <>
      <Dropdown.Header>{title}</Dropdown.Header>
      {Array.from({ length: end - start + 1 }, (_: unknown, index: number) => start + index).map((level: number) => (
        <Dropdown.Item
          key={level}
          eventKey={level.toString()}
          active={minimumLevel === level}
          onClick={() => {
            dispatch(setMinimumLevel(level))
          }}
        >
          {level}
        </Dropdown.Item>
      ))}
      <Dropdown.Divider />
    </>
  )

  return (
    <Card>
      <Card.Header>
        <Card.Title className='m-0'>
          <h6 className='p-0 m-0'>Minimum Level</h6>
        </Card.Title>
      </Card.Header>

      <Card.Body>
        <Dropdown className='w-100'>
          <Dropdown.Toggle
            variant='outline-secondary'
            className='w-100'
            id='minimum-level-dropdown'
            title='Select Level'
          >
            {minimumLevel ? `Level ${String(minimumLevel)}` : 'Select Level'}
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{
              maxHeight: '50vh',
              overflowY: 'auto'
            }}
            className='w-100 py-0'
          >
            {renderLevelGroup('Heroic Levels', 1, 19)}
            {renderLevelGroup('Epic Levels', 20, 29)}
            {renderLevelGroup('Legendary Levels', 30, 32)}
          </Dropdown.Menu>
        </Dropdown>
      </Card.Body>
    </Card>
  )
}

export default MinimumLevel
