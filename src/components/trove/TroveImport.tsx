import { useEffect, useRef, useState } from 'react'
import { Button, Form, Nav, Stack } from 'react-bootstrap'
import { FaCloudArrowUp } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts'
import { setTroveData } from '../../redux/slices/appSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import { formatNumber } from '../../utils/objectUtils.ts'
import { buildItemRollupFromCsvFile, storeTroveData } from '../../utils/troveUtils.ts'
import type { ItemRollup } from './types.ts'

const TroveImport = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { troveData } = useAppSelector((state) => state.app, shallowEqual)

  const troveInputRef = useRef<HTMLInputElement>(null)

  const [rollup, setRollup] = useState<ItemRollup>({})
  const [warnings, setWarnings] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const storedData = window.localStorage.getItem('troveData')
    if (!storedData && Object.keys(rollup).length > 0) {
      storeTroveData(rollup)
    }
  }, [dispatch, rollup])

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
      dispatch(setTroveData(data))

      setRollup(data)
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
        onClick={() => troveInputRef.current?.click()}
        title={troveData ? `${formatNumber(Object.keys(troveData).length)} Items Loaded` : 'Import from DH Trove'}
      >
        <Stack direction='horizontal' gap={1} className='align-items-center'>
          <FaCloudArrowUp size={25} color={Object.keys(troveData ?? {}).length === 0 ? 'gray' : 'green'} />
          &nbsp;DH Trove
        </Stack>
      </Nav.Link>
    </>
  )
}

export default TroveImport
