import { Card, Col, ListGroup, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { titleCase } from 'title-case'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CannithCraftingState } from '../../../redux/slices/cannithCraftingSlice.ts'
import EnchantmentBonus from './EnhancementBonus.tsx'
import MinimumLevelDetail from './MinimumLevelDetail.tsx'
import WeaponMultiplier from './WeaponMultiplier.tsx'

const ItemMetadata = (props: Props) => {
  const { reduxKey } = props

  const slotState = useAppSelector((state) => state.cannithCrafting[reduxKey], shallowEqual)
  const { minimumLevel } = useAppSelector((state) => state.cannithCrafting, shallowEqual)

  if (!minimumLevel) return <></>

  return (
    <Col lg={4} className='p-1' style={{ minHeight: '100px' }} key={minimumLevel}>
      <Card>
        <Card.Header>
          <Card.Title>
            <Stack direction='horizontal' gap={2}>
              <EnchantmentBonus level={minimumLevel} slot={reduxKey} noPlus={true} />
              {titleCase(reduxKey.replace(/\d/g, ''))}
            </Stack>
          </Card.Title>
        </Card.Header>

        <Card.Body className='m-0 p-0'>
          <ListGroup variant='flush'>
            {/* MinimumLevelDetail has ListGroup.Item /> built in because it returns 2 of them */}
            <MinimumLevelDetail level={minimumLevel} type='bound' />
            <MinimumLevelDetail level={minimumLevel} type='unbound' />

            <ListGroup.Item>
              <EnchantmentBonus level={minimumLevel} slot={reduxKey} showFullDisplay />
            </ListGroup.Item>

            <ListGroup.Item>
              <WeaponMultiplier slot={reduxKey} level={minimumLevel} />
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    </Col>
  )
}

interface Props {
  reduxKey: keyof Omit<CannithCraftingState, 'minimumLevel'>
}

export default ItemMetadata
