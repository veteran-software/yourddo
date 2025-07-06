import { Col, Row, Stack } from 'react-bootstrap'
import MinimumLevel from '../tabs/MinimumLevel.tsx'
import ShardSearch from '../tabs/ShardSearch.tsx'

const CoreLayout = (props: Props) => {
  const { page } = props

  return (
    <Stack direction='horizontal' gap={0} className='pt-1'>
      <Row className='m-0 p-0 w-100'>
        <Col md={12} lg={2} className='px-1'>
          <Stack direction='vertical' gap={2} className='justify-content-start'>
            <MinimumLevel />
            <ShardSearch />
          </Stack>
        </Col>

        <Col md={12} lg={10} className='px-1'>
          <Stack direction='vertical' gap={1} className='justify-content-start'>
            {page}
          </Stack>
        </Col>
      </Row>
    </Stack>
  )
}

interface Props {
  page: React.JSX.Element
}

export default CoreLayout
