import { Card, Container, Nav, Tab } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import CannithItemWrapper from './components/CannithItemWrapper.tsx'
import CoreLayout from './layout/CoreLayout.tsx'
import { CANNITH_SLOTS } from './utils/cannithSlots.config.ts'

const CannithCrafting = () => {
  const tabs = CANNITH_SLOTS.map((slotConfig) => ({
    key: slotConfig.key,
    label: slotConfig.label,
    component: <CannithItemWrapper slotConfig={slotConfig} />
  }))

  return (
    <Container fluid className='m-0 p-0 h-100'>
      <Card className='h-100'>
        <Card.Header className='text-center'>
          <h4 className='mb-0'>Cannith Crafting</h4>
          <Card.Subtitle>
            <small>
              <a
                href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Cannith%20Crafting%22'
                target='_blank'
                rel='noreferrer'
                title='Cannith Crafting Known Issues & Bug Reports'
              >
                Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
              </a>
            </small>
          </Card.Subtitle>
        </Card.Header>

        <Card.Body className='p-0 h-100 position-relative overflow-y-auto z-0'>
          <Tab.Container defaultActiveKey='how-to'>
            <Container fluid className='m-0 p-0 sticky-top'>
              <Nav justify variant='tabs' className='w-auto bg-body'>
                {tabs.map(({ key, label }) => (
                  <Nav.Item key={key}>
                    <Nav.Link eventKey={key}>{label}</Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Container>

            <Container fluid className='m-0 p-0'>
              <Tab.Content>
                {tabs.map(({ key, component }) => (
                  <Tab.Pane key={key} eventKey={key}>
                    <CoreLayout page={component} />
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Container>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default CannithCrafting
