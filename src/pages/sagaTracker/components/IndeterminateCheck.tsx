import { useEffect, useRef } from 'react'
import { Form } from 'react-bootstrap'

export interface IndeterminateCheckProps {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
  label?: React.ReactNode
  ariaLabel?: string
}

const IndeterminateCheck = ({ checked, indeterminate, onChange, label, ariaLabel }: IndeterminateCheckProps) => {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked
  }, [indeterminate, checked])

  return (
    <Form.Check type='checkbox'>
      <Form.Check.Input
        ref={ref}
        type='checkbox'
        checked={checked}
        onChange={onChange}
        aria-checked={indeterminate && !checked ? 'mixed' : checked}
        aria-label={ariaLabel}
      />
      {label ? <Form.Check.Label>{label}</Form.Check.Label> : null}
    </Form.Check>
  )
}

export default IndeterminateCheck
