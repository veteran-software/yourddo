import { List, Text } from '@mantine/core'

const EffectList = ({
  effects,
  size = 'sm',
  empty = 'None published.'
}: {
  effects: readonly string[]
  size?: 'xs' | 'sm'
  empty?: string
}) =>
  effects.length > 0 ? (
    <List spacing='xs' size={size}>
      {effects.map((effect, index) => (
        <List.Item key={`${effect}-${String(index)}`} style={{ overflowWrap: 'anywhere' }}>
          {effect}
        </List.Item>
      ))}
    </List>
  ) : (
    <Text c='dimmed' size={size}>
      {empty}
    </Text>
  )

export default EffectList
