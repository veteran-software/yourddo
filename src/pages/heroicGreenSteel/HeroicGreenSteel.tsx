import { Card, Col, Container, Row } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../redux/hooks.ts'
import FecundityDropdown from './components/FecundityDropdown.tsx'
import InvasionDropdown from './components/InvasionDropdown.tsx'
import SubjugationDropdown from './components/SubjugationDropdown.tsx'

const HeroicGreenSteel = () => {
  const { selectedFecundityItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )
  return (
    <Container>
      <Card>
        <Card.Body>
          <Row md={1} lg={2}>
            <Col>
              <FecundityDropdown />

              {selectedFecundityItem && (
                <>
                  <InvasionDropdown />
                  <SubjugationDropdown />
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
