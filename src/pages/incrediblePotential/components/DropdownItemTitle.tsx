import { Container } from 'react-bootstrap'

const DropdownItemTitle = (props: Props) => {
  const { subtitle, title } = props

  if (!title) {
    return <h5>Unknown Item</h5>
  }

  return (
    <h6 className='d-flex flex-row justify-content-between'>
      <strong>{title}</strong>
      {subtitle && (
        <Container
          className='m-0 p-0 w-auto d-none d-md-block'
          style={{ fontSize: '0.7rem' }}
        >
          ({subtitle})
        </Container>
      )}
    </h6>
  )
}

interface Props {
  subtitle?: string
  title: string | undefined
}

export default DropdownItemTitle
