import * as React from 'react'
import { Dropdown } from 'react-bootstrap'

const IngredientDropdownToggle = (props: Props) => {
  const { disabled = false, label } = props

  return (
    <Dropdown.Toggle
      disabled={disabled}
      className='w-100 d-flex flex-row align-items-center justify-content-center border-light'
      title={
        disabled
          ? 'You can only select a Basic upgrade or a Focused upgrade'
          : undefined
      }
    >
      {label}
    </Dropdown.Toggle>
  )
}

interface Props {
  disabled?: boolean
  label: React.JSX.Element | string
}

export default IngredientDropdownToggle
