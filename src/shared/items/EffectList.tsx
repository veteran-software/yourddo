import { List, Text } from '@mantine/core'

const EffectList = ({ effects, empty = 'None published.' }: { effects: readonly string[]; empty?: string }) =>
  effects.length > 0 ? (
    <List spacing='xs' size='sm'>
      {effects.map((effect, index) => (
        <List.Item key={`${effect}-${String(index)}`} style={{ overflowWrap: 'anywhere' }}>
          {effect}
        </List.Item>
      ))}
    </List>
  ) : (
    <Text c='dimmed' size='sm'>
      {empty}
    </Text>
  )

export default EffectList
