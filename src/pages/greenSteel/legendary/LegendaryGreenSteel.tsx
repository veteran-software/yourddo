import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import ActiveAugment from './components/ActiveAugment.tsx'
import BonusEffectDropdown from './components/BonusEffectDropdown.tsx'
import DevastationDropdown from './components/DevastationDropdown.tsx'
import FecundityDropdown from './components/FecundityDropdown.tsx'
import InvasionDropdown from './components/InvasionDropdown.tsx'
import LegendaryIngredientList from './components/LegendaryIngredientList.tsx'
import SubjugationDropdown from './components/SubjugationDropdown.tsx'

const LegendaryGreenSteel = () => {
  const { selectedFecundityItem } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='text-center p-1'>
          <h4 className='mb-0'>Legendary Green Steel Crafting</h4>
          <small>
            <a
              href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Legendary%20Green%20Steel%22'
              target='_blank'
              rel='noreferrer'
              title='Legendary Green Steel Known Issues & Bug Reports'
            >
              Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
            </a>
          </small>
        </Card.Header>

        <Card.Body>
          <Row md={1} lg={2}>
            <Stack direction='vertical' gap={3} className='w-auto'>
              <FecundityDropdown />

              {selectedFecundityItem && (
                <>
                  <InvasionDropdown />
                  <SubjugationDropdown />
                  <DevastationDropdown />
                  <BonusEffectDropdown />
                  <ActiveAugment />
                </>
              )}
            </Stack>
            <Col>
              <LegendaryIngredientList />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default LegendaryGreenSteel
