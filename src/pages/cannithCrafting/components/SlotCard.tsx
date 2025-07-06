import { memo, type ReactNode } from 'react'
import { Card, Col } from 'react-bootstrap'

const SlotCard = memo((props: Props) => {
  const { title, children, centered = true, isMain = false } = props

  return (
    <Col
      lg={isMain ? 4 : undefined}
      className='p-1'
      style={{ minHeight: '100px' }}
      data-testid={`slot-${title}`}
      key={title}
    >
      <Card>
        <Card.Header className={centered ? 'text-center' : ''}>
          <Card.Title>{title}</Card.Title>
        </Card.Header>
        <Card.Body>{children}</Card.Body>
      </Card>
    </Col>
  )
})

interface Props {
  title: string
  children: ReactNode
  centered?: boolean
  isMain?: boolean
}

export default SlotCard
