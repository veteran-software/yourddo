import { SegmentedControl, Text } from '@mantine/core'
import type { EssenceBinding } from './essenceCrafting.types.ts'

interface BindingSelectorProps {
  binding: EssenceBinding
  onChange: (binding: EssenceBinding) => void
}

const BindingSelector = ({ binding, onChange }: BindingSelectorProps) => (
  <>
    <SegmentedControl
      aria-label='Recipe binding'
      data={[
        { label: 'Bound', value: 'bound' },
        { label: 'Unbound', value: 'unbound' }
      ]}
      value={binding}
      onChange={(value) => {
        onChange(value)
      }}
      fullWidth
    />
    <Text c='dimmed' size='sm'>
      Use one recipe variant for the whole crafting plan.
    </Text>
  </>
)

export default BindingSelector
