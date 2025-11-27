import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Form, InputGroup, Modal, Stack } from 'react-bootstrap'

const PermalinkModal = (props: Props) => {
  const { show, onHide, buildUrl, title = 'Permalink' } = props

  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const url = useMemo(() => buildUrl(), [buildUrl])

  useEffect(() => {
    if (!show) {
      setCopied(false)
    }
  }, [show])

  const handleCopy = async () => {
    try {
      if (navigator && 'clipboard' in navigator) {
        await navigator.clipboard.writeText(url)
      } else if (inputRef.current) {
        inputRef.current.select()
        document.execCommand('copy')
      }
      setCopied(true)
      setTimeout(() => { setCopied(false); }, 1500)
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
          <Form.Label htmlFor='permalink-url' className='mb-0'>Shareable link</Form.Label>
          <InputGroup>
            <Form.Control id='permalink-url' ref={inputRef} value={url} readOnly />
            <Button variant={copied ? 'success' : 'primary'} onClick={handleCopy} title='Copy to clipboard'>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </InputGroup>
        </Stack>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>Close</Button>
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
