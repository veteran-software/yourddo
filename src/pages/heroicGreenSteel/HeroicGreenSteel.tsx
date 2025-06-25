import { Card, Col, Container, Row } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../redux/hooks.ts'
import DevastationBasicDropdown from './components/DevastationBasicDropdown.tsx'
import DevastationFocusedDropdown from './components/DevastationFocusedDropdown.tsx'
import FecundityDropdown from './components/FecundityDropdown.tsx'
import InvasionDropdown from './components/InvasionDropdown.tsx'
import IngredientList from './components/lists/IngredientList.tsx'
import SubjugationBasicDropdown from './components/SubjugationBasicDropdown.tsx'
import SubjugationSpellDropdown from './components/SubjugationSpellDropdown.tsx'

const HeroicGreenSteel = () => {
  const { selectedFecundityItem } = useAppSelector((state) => state.greenSteel, shallowEqual)

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='text-center p-1'>
          <h4 className='mb-0'>Heroic Green Steel Crafting</h4>
          <small>
            <a
              href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Green%20Steel%22'
              target='_blank'
              rel='noreferrer'
              title='Green Steel Known Issues & Bug Reports'
            >
              Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
            </a>
          </small>
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
            <Col>
              <IngredientList />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default HeroicGreenSteel
