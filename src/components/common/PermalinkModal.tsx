import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Form, InputGroup, Modal, Stack } from 'react-bootstrap'

const PermalinkModal = (props: Props) => {
  const { show, onHide, buildUrl, title = 'Permalink' } = props

  type CopyStatus = 'idle' | 'copied' | 'selected'
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  const url = useMemo(() => buildUrl(), [buildUrl])

  useEffect(() => {
    if (!show) {
      setCopyStatus('idle')
    }
  }, [show])

  const handleCopy = async () => {
    try {
      if (navigator && 'clipboard' in navigator) {
        await navigator.clipboard.writeText(url)
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
    } catch {
      // best-effort: ignore copy failures
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
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
              variant={copyStatus === 'copied' ? 'success' : copyStatus === 'selected' ? 'warning' : 'primary'}
              onClick={handleCopy}
              title='Copy to clipboard'
            >
              {copyStatus === 'copied' ? 'Copied' : copyStatus === 'selected' ? 'Press Ctrl+C' : 'Copy'}
            </Button>
          </InputGroup>
        </Stack>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
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
