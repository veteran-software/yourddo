import { Input, TextInput } from '@mantine/core'
import { useRef } from 'react'

interface CatalogSearchProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export default function CatalogSearch({ label, placeholder, value, onChange }: Readonly<CatalogSearchProps>) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <TextInput
      ref={input}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => {
        onChange(event.currentTarget.value)
      }}
      rightSection={
        value && (
          <Input.ClearButton
            aria-label='Clear search'
            onClick={() => {
              onChange('')
              input.current?.focus()
            }}
          />
        )
      }
    />
  )
}
