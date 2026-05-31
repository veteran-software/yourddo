import { useEffect, useRef, useState } from 'react'
import { Button, Form, Modal, Nav, Stack } from 'react-bootstrap'
import { FaCheck, FaCloudArrowUp, FaCopy } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts'
import { setTroveData } from '../../redux/slices/appSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import { formatNumber } from '../../utils/objectUtils.ts'
import { buildItemRollupFromCsvFile, getStoredTroveData, storeTroveData } from '../../utils/troveUtils.ts'

const TROVE_SERVER_PATHS: { server: string; path: string }[] = [
  { server: 'Shadowdale', path: '%APPDATA%\\Dungeon Helper\\plugins\\Trove\\Shadowdale' },
  { server: 'Thrane', path: '%APPDATA%\\Dungeon Helper\\plugins\\Trove\\Thrane' },
  { server: 'Cormyr', path: '%APPDATA%\\Dungeon Helper\\plugins\\Trove\\Cormyr' },
  { server: 'Moonsea', path: '%APPDATA%\\Dungeon Helper\\plugins\\Trove\\Moonsea' }
]

const TroveImport = (props: Props) => {
  const { closeNav } = props
  const dispatch: AppDispatch = useAppDispatch()

  const { troveData } = useAppSelector((state) => state.app, shallowEqual)

  const troveInputRef = useRef<HTMLInputElement>(null)

  const [warnings, setWarnings] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [copiedServer, setCopiedServer] = useState<string | null>(null)

  // Only persist Trove data when the user uploads a file. Avoid background overwrites.
  useEffect(() => {
    // Keep this effect for potential future side effects; do not persist here to avoid accidental overwrites.
    getStoredTroveData()
  }, [])

  useEffect(() => {
    console.log('Trove Import Warnings:', warnings.length ? warnings : 'None')
  }, [warnings])

  useEffect(() => {
    console.log('Trove Import Errors:', errors.length ? errors : 'None')
  }, [errors])

  const onTroveFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0]

    if (!file) return

    try {
      const { data, warnings, errors } = await buildItemRollupFromCsvFile(file)
      // Persist uploaded Trove data immediately; this is the only place we write troveData to localStorage
      storeTroveData(data)
      dispatch(setTroveData(data))

      setWarnings(warnings)
      setErrors(errors.map((e) => `${e.message} (row ${String(e.row)})`))
    } catch (err) {
      console.error('CSV parsing failed:', err)
    } finally {
      if (troveInputRef.current) {
        troveInputRef.current.value = ''
      }
    }
  }

  const handleCopyPath = (server: string, path: string) => {
    navigator.clipboard.writeText(path).catch(console.error)
    setCopiedServer(server)
    setTimeout(() => {
      setCopiedServer(null)
    }, 2000)
  }

  const handleUpload = () => {
    setShowModal(false)
    troveInputRef.current?.click()
  }

  return (
    <>
      <Form.Control
        ref={troveInputRef}
        type='file'
        className='d-none'
        accept='.csv'
        onChange={(e) => {
          onTroveFileSelected(e as React.ChangeEvent<HTMLInputElement>).catch(console.error)
        }}
      />

      <Nav.Link
        as={Button}
        onClick={() => {
          closeNav()
          setShowModal(true)
        }}
        title={troveData ? `${formatNumber(Object.keys(troveData).length)} Items Loaded` : 'Import from DH Trove'}
      >
        <Stack direction='horizontal' gap={1} className='align-items-center'>
          <FaCloudArrowUp size={25} color={Object.keys(troveData ?? {}).length === 0 ? 'gray' : 'green'} />
          &nbsp;DH Trove
        </Stack>
      </Nav.Link>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false)
        }}
        centered
        size='lg'
      >
        <Modal.Header closeButton className='bg-primary text-white'>
          <Modal.Title>DH Trove Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Import your Dungeon Helper Trove CSV to easily see what items you have or don&apos;t have across your
            characters and storage. The path is server-specific, so copy the one that matches your server and paste it
            into the File Explorer address bar in Windows after clicking <strong>Upload DH Trove CSV</strong> below. The
            file you are looking for is <code>TroveExport.Inventory.csv</code>. If you only see{' '}
            <code>TroveExport.csv</code>, you are on an older version of Dungeon Helper Trove and should update to the
            latest version.
          </p>
          <hr />
          <p className='mb-1'>
            <strong>Find your DH Trove CSV at:</strong>
          </p>
          <Stack gap={2}>
            {TROVE_SERVER_PATHS.map(({ server, path }) => (
              <div key={server} className='border border-1 border-light-subtle rounded p-2'>
                <strong className='text-muted fw-semibold'>{server}</strong>
                <Stack direction='horizontal' gap={2} className='align-items-stretch mt-1'>
                  <code className='flex-grow-1 bg-dark text-light p-2 rounded' style={{ wordBreak: 'break-all' }}>
                    {path}
                  </code>
                  <Button
                    variant='outline-secondary'
                    size='sm'
                    onClick={() => {
                      handleCopyPath(server, path)
                    }}
                    title={`Copy ${server} path`}
                  >
                    {copiedServer === server ? <FaCheck color='green' /> : <FaCopy />} Copy
                  </Button>
                </Stack>
              </div>
            ))}
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleUpload}>
            <FaCloudArrowUp className='me-2' />
            Upload DH Trove CSV
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

interface Props {
  closeNav: () => void
}

export default TroveImport
