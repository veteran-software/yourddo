import { Button, Form, Modal } from 'react-bootstrap'
import { FaTriangleExclamation } from 'react-icons/fa6'

interface InfoModalProps {
  show: boolean
  dontShowAgain: boolean
  onDontShowAgainChange: (value: boolean) => void
  onClose: () => void
}

const InfoModal = ({ show, dontShowAgain, onDontShowAgainChange, onClose }: InfoModalProps) => (
  <Modal show={show} onHide={onClose} centered>
    <Modal.Header closeButton className='bg-primary text-white'>
      <Modal.Title>About the Gear Planner</Modal.Title>
    </Modal.Header>
    <Modal.Body className='bg-dark text-white'>
      <p>
        The Gear Planner is designed to be a comprehensive min/max tool for DDO gear optimization. Rather than
        displaying enchantments as simple labels, it breaks many named enchantments down into their core attributes so
        you can see exactly what stacks, what conflicts, and where you&apos;re leaving stats on the table.
      </p>
      <p>
        <strong>More systems coming.</strong> Crafting systems, upgrade paths, and additional gearing options will be
        added over time until the planner covers everything DDO has to offer.
      </p>
      <p>
        Use the <strong>Settings</strong> button in the toolbar to select your class(es) and character details. The
        arrow on the left edge shows a summary of your current settings. Configuring your character automatically
        filters out options that don&apos;t apply to your build and unlocks extras that do, including dedicated gear
        slots for your Artificer Iron Defender or Druid Wolf Companion.
      </p>
      <hr className='border-secondary' />
      <p className='mb-0 small text-warning-emphasis'>
        <FaTriangleExclamation className='me-1' />
        <strong>Back up your data.</strong> Your gear setups are saved in your browser&apos;s local storage. If your
        browser is configured to clear site data when you close a tab or window, your setups will be lost. Use the
        <strong>Export JSON</strong> option regularly to keep a safe backup.
      </p>
    </Modal.Body>
    <Modal.Footer className='bg-primary border-top-0 d-flex align-items-center'>
      <Form.Check
        type='checkbox'
        id='gear-planner-info-dont-show'
        label="Don't show again"
        checked={dontShowAgain}
        onChange={(e) => {
          onDontShowAgainChange(e.target.checked)
        }}
        className='text-white me-auto'
      />
      <Button variant='light' onClick={onClose}>
        Got it
      </Button>
    </Modal.Footer>
  </Modal>
)

export default InfoModal
