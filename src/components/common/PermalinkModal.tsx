import { useMemo, useRef, useState } from 'react'
import { Button, Form, InputGroup, Modal, Stack } from 'react-bootstrap'

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
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Stack gap={2}>
          <Form.Label htmlFor='permalink-url' className='mb-0'>
            Shareable link
          </Form.Label>
          <InputGroup>
            <Form.Control id='permalink-url' ref={inputRef} value={url} readOnly />
            <Button
              variant={buttonVariant}
              onClick={() => {
                void handleCopy()
              }}
              title='Copy to clipboard'
            >
              {buttonText}
            </Button>
          </InputGroup>
        </Stack>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
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
