import { useMemo, useRef, useState } from 'react'
import { Button, Form, InputGroup, Modal } from 'react-bootstrap'
import { FaCheck, FaCopy, FaLink } from 'react-icons/fa6'

const PermalinkModal = (props: Props) => {
  const { show, onHide, buildUrl, title = 'Permalink' } = props

  type CopyStatus = 'idle' | 'copied' | 'selected'
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  const url = useMemo(() => buildUrl(), [buildUrl])

  const handleCopy = async () => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url).catch(console.error)

      setCopyStatus('copied')
    } else if (inputRef.current) {
      // Fallback: select the text and prompt the user to copy manually.
      inputRef.current.focus()
      inputRef.current.select()

      setCopyStatus('selected')
    }
    setTimeout(() => {
      setCopyStatus('idle')
    }, 1500)
  }

  const handleClose = () => {
    setCopyStatus('idle')
    onHide()
  }

  let buttonVariant: 'success' | 'warning' | 'primary' = 'primary'
  let buttonText = 'Copy'

  if (copyStatus === 'copied') {
    buttonVariant = 'success'
    buttonText = 'Copied'
  } else if (copyStatus === 'selected') {
    buttonVariant = 'warning'
    buttonText = 'Press Ctrl+C'
  }

  return (
    <Modal show={show} onHide={handleClose} centered size='lg'>
      <Modal.Header closeButton className='border-0 pb-0'>
        <Modal.Title className='w-100 text-center ps-4'>
          <FaLink className='me-2 text-primary' />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='text-center p-4'>
        <p className='text-secondary mb-4'>Anyone with this link can view your gear setup.</p>
        <InputGroup size='lg' className='mb-3'>
          <Form.Control
            id='permalink-url'
            ref={inputRef}
            value={url}
            readOnly
            className='text-center bg-white border-primary-subtle text-dark'
            style={{ fontFamily: 'monospace', color: '#000' }}
            onClick={() => inputRef.current?.select()}
          />
        </InputGroup>
        <Button
          variant={buttonVariant}
          size='lg'
          className='px-5'
          onClick={() => {
            void handleCopy()
          }}
        >
          {copyStatus === 'copied' ? <FaCheck className='me-2' /> : <FaCopy className='me-2' />}
          {buttonText}
        </Button>
      </Modal.Body>
      <Modal.Footer className='border-0 pt-0 justify-content-center'>
        <Button variant='link' className='text-muted' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

interface Props {
  show: boolean
  onHide: () => void
  buildUrl: () => string
  title?: string
}

export default PermalinkModal
