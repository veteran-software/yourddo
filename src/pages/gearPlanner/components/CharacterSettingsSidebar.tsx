import { Offcanvas, Stack } from 'react-bootstrap'
import type { GearSetup } from '../types'
import GenericBadge from './GenericBadge.tsx'

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

          {activeSetup.classes.some((c) => c !== null) ? (
            <Stack gap={1} className='mb-3'>
              {activeSetup.classes.map(
                (cls, idx) =>
                  cls && (
                    <GenericBadge
                      key={`${cls}-${String(idx)}`}
                      badgeText={cls}
                    />
                  )
              )}
            </Stack>
          ) : (
            <div className='small italic text-secondary mb-3'>
              No classes selected
            </div>
          )}
        </div>

        <div className='mb-3'>
          <div className='fw-bold text-info small mb-1'>Weapon Filters</div>

          {activeSetup.weaponFilters.length > 0 ? (
            <div className='d-flex flex-wrap gap-1 mb-3'>
              {activeSetup.weaponFilters.map((weapon) => (
                <GenericBadge
                  key={weapon}
                  badgeText={weapon}
                  fontSize='0.7rem'
                />
              ))}
            </div>
          ) : (
            <div className='small italic text-secondary mb-3'>
              No weapon filters
            </div>
          )}
        </div>

        <div className='mb-3'>
          <div className='fw-bold text-info small mb-1'>Armor Filters</div>
          {activeSetup.armorFilters.length > 0 ? (
            <div className='d-flex flex-wrap gap-1 mb-3'>
              {activeSetup.armorFilters.map((armor) => (
                <GenericBadge key={armor} badgeText={armor} fontSize='0.7rem' />
              ))}
            </div>
          ) : (
            <div className='small italic text-secondary mb-3'>
              No armor filters
            </div>
          )}
        </div>

        <div className='mb-3'>
          <div className='fw-bold text-info small mb-1'>
            Shield/Off-hand Filters
          </div>
          {activeSetup.shieldFilters.length > 0 ? (
            <div className='d-flex flex-wrap gap-1'>
              {activeSetup.shieldFilters.map((shield) => (
                <GenericBadge
                  key={shield}
                  badgeText={shield}
                  fontSize='0.7rem'
                />
              ))}
            </div>
          ) : (
            <div className='small italic text-secondary'>No shield filters</div>
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
