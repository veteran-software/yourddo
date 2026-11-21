import { Button, ButtonGroup, Card, Col, Dropdown, Row } from 'react-bootstrap'
import {
  FaCircleInfo,
  FaFileExport,
  FaFileImport,
  FaGear,
  FaLayerGroup,
  FaLink,
  FaMagnifyingGlass,
  FaTriangleExclamation
} from 'react-icons/fa6'

interface PlannerToolbarProps {
  onOpenInfo: () => void
  onBrowseSetBonuses: () => void
  onSearchEnchantments: () => void
  onSaveToFile: () => void
  onForumExport: () => void
  onDiscordExport: () => void
  onImport: () => void
  onPermalink: () => void
  onSettings: () => void
  onAddSetup: () => void
  onClearTab: () => void
}

const PlannerToolbar = ({
  onOpenInfo,
  onBrowseSetBonuses,
  onSearchEnchantments,
  onSaveToFile,
  onForumExport,
  onDiscordExport,
  onImport,
  onPermalink,
  onSettings,
  onAddSetup,
  onClearTab
}: PlannerToolbarProps) => (
  <Card.Header className='bg-primary text-white py-3'>
    <Row className='align-items-center g-3'>
      <Col xs={12} md='auto'>
        <div className='d-flex align-items-center gap-2'>
          <h1 className='mb-0 h2'>Gear Planner</h1>
          <button
            type='button'
            className='btn btn-link p-0 border-0 text-white opacity-75 shadow-none'
            onClick={onOpenInfo}
            title='About the Gear Planner'
            aria-label='About the Gear Planner'
          >
            <FaCircleInfo size={18} />
          </button>
        </div>
      </Col>

      <Col xs={12} md className='ms-md-auto'>
        <div className='d-flex justify-content-md-end gap-2'>
          <Button variant='light' size='sm' className='d-flex align-items-center gap-2' onClick={onBrowseSetBonuses}>
            <FaLayerGroup /> Browse Set Bonuses
          </Button>

          <Button variant='light' size='sm' className='d-flex align-items-center gap-2' onClick={onSearchEnchantments}>
            <FaMagnifyingGlass /> Search Enchantments/Sets
          </Button>
        </div>
      </Col>

      <Col xs={12} md='auto' className='d-flex gap-2 justify-content-md-end'>
        <ButtonGroup className='w-100 w-md-auto mt-2 mt-md-0 flex-wrap flex-md-nowrap justify-content-center justify-content-md-end'>
          <Dropdown as={ButtonGroup} className='flex-grow-1 flex-md-grow-0'>
            <Dropdown.Toggle
              variant='outline-light'
              size='sm'
              className='d-flex align-items-center justify-content-center gap-2 h-100'
              id='export-dropdown'
            >
              <FaFileExport /> Export
            </Dropdown.Toggle>

            <Dropdown.Menu variant='dark'>
              <Dropdown.Item onClick={onSaveToFile}>Save to File (JSON)</Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item onClick={onForumExport}>Forum Export</Dropdown.Item>

              <Dropdown.Item onClick={onDiscordExport}>Discord Export</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Button
            variant='outline-light'
            size='sm'
            className='d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0'
            onClick={onImport}
          >
            <FaFileImport /> Import
          </Button>

          <Button
            variant='outline-light'
            size='sm'
            className='d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0'
            onClick={onPermalink}
          >
            <FaLink /> Permalink
          </Button>

          <Button
            variant='outline-light'
            size='sm'
            className='d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0'
            onClick={onSettings}
          >
            <FaGear /> Settings
          </Button>

          <Button variant='outline-light' size='sm' className='flex-grow-1 flex-md-grow-0' onClick={onAddSetup}>
            Add Setup
          </Button>

          <Button variant='outline-danger' size='sm' className='flex-grow-1 flex-md-grow-0' onClick={onClearTab}>
            <FaTriangleExclamation /> Clear Tab <FaTriangleExclamation />
          </Button>
        </ButtonGroup>
      </Col>
    </Row>
  </Card.Header>
)

export default PlannerToolbar
