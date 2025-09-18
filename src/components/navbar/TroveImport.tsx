import { useRef } from 'react'
import { Button, Form, Nav } from 'react-bootstrap'
import { FaCloudArrowUp } from 'react-icons/fa6'

const TroveImport = () => {
  const troveInputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    troveInputRef.current?.click()
  }

  const onTroveFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result
        if (typeof content === 'string') {
          const lines = content.split('\n')
          const trove = lines.map((line) => line.trim()).filter((line) => line.length > 0)
          const troveString = trove.join('\n')
        }
      }
    }
  }

  return (
    <>
      <Form.Control ref={troveInputRef} type='file' className='d-none' accept='.csv' onChange={onTroveFileSelected} />
      <Nav.Link
        as={Button}
        onClick={() => {
          openPicker()
        }}
        title='Discord'
      >
        <FaCloudArrowUp size={25} />
        &nbsp;DH Trove
      </Nav.Link>
    </>
  )
}

export default TroveImport
