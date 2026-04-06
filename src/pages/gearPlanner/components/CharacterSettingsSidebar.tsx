import { Badge, Offcanvas, Stack } from 'react-bootstrap'
import type { GearSetup } from '../types'

const CharacterSettingsSidebar = (props: Props) => {
  const { activeSetup, setShowSidebar, showSidebar } = props

  return (
    <Offcanvas
      show={showSidebar}
      onHide={() => {
        setShowSidebar(false)
      }}
      scroll
      className='gear-planner-sidebar gear-planner-offcanvas'
    >
      <Offcanvas.Header closeButton className='bg-primary text-white py-2'>
        <Offcanvas.Title className='fs-6'>Character Settings</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className='p-3 bg-dark text-white'>
        <div className='mb-3 border-bottom pb-2'>
          <div className='fw-bold text-info small'>Current Setup</div>
          <div className='fs-5 text-truncate'>{activeSetup.name}</div>
        </div>

        <div className='mb-3 border-bottom pb-2'>
          <div className='fw-bold text-info small'>Level Range</div>
          <div className='fs-6'>
            ML {activeSetup.minLevel} - {activeSetup.maxLevel}
          </div>
        </div>

        <div className='mb-3'>
          <div className='fw-bold text-info small mb-1'>Classes</div>
          {activeSetup.classes.filter((c) => c !== null).length > 0 ? (
            <Stack gap={1} className='mb-3'>
              {activeSetup.classes.map(
                (cls, idx) =>
                  cls && (
                    <Badge key={idx} bg='secondary' className='w-fit text-start py-1 px-2'>
                      {cls}
                    </Badge>
                  )
              )}
            </Stack>
          ) : (
            <div className='small italic text-secondary mb-3'>No classes selected</div>
          )}
        </div>

        <div className='mb-3'>
          <div className='fw-bold text-info small mb-1'>Weapon Filters</div>
          {activeSetup.weaponFilters.length > 0 ? (
            <div className='d-flex flex-wrap gap-1 mb-3'>
              {activeSetup.weaponFilters.map((w) => (
                <Badge key={w} bg='dark' className='border border-secondary small'>
                  {w}
                </Badge>
              ))}
            </div>
          ) : (
            <div className='small italic text-secondary mb-3'>No weapon filters</div>
          )}
        </div>

        <div className='mb-3'>
          <div className='fw-bold text-info small mb-1'>Armor Filters</div>
          {activeSetup.armorFilters.length > 0 ? (
            <div className='d-flex flex-wrap gap-1'>
              {activeSetup.armorFilters.map((a) => (
                <Badge key={a} bg='dark' className='border border-secondary small'>
                  {a}
                </Badge>
              ))}
            </div>
          ) : (
            <div className='small italic text-secondary'>No armor filters</div>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  )
}

interface Props {
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  activeSetup: GearSetup
}

export default CharacterSettingsSidebar
