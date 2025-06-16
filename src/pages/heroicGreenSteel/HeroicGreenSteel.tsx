import { Card, Col, Container, Row } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../redux/hooks.ts'
import DevastationBasicDropdown from './components/DevastationBasicDropdown.tsx'
import DevastationFocusedDropdown from './components/DevastationFocusedDropdown.tsx'
import FecundityDropdown from './components/FecundityDropdown.tsx'
import InvasionDropdown from './components/InvasionDropdown.tsx'
import SubjugationBasicDropdown from './components/SubjugationBasicDropdown.tsx'
import SubjugationSpellDropdown from './components/SubjugationSpellDropdown.tsx'

const HeroicGreenSteel = () => {
  const { selectedFecundityItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  return (
    <Container fluid className='px-0'>
      <Card>
        <Card.Header className='text-center'>
          <h4 className='mb-0'>Heroic Green Steel Crafting</h4>
        </Card.Header>

        <Card.Body>
          <Row md={1} lg={2}>
            <Col>
              <FecundityDropdown />

              {selectedFecundityItem && (
                <>
                  <InvasionDropdown />
                  <SubjugationBasicDropdown />
                  <SubjugationSpellDropdown />
                  <DevastationBasicDropdown />
                  <DevastationFocusedDropdown />
                </>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default HeroicGreenSteel
