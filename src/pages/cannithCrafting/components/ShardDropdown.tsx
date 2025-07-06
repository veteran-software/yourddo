import { memo, useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import type { ICannithShard } from '../../../types/cannithCrafting.ts'
import { groupedShards } from '../utils/helpers.ts'

const ShardDropdown = memo((props: Props) => {
  const { shards, onSelect, selectedUpgrade, title, variant = 'outline-info' } = props

  const orderedShards = useMemo(() => groupedShards(shards), [shards])

  if (shards.length === 0) return null

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant={variant}
        id={`${title.toLowerCase()}-dropdown`}
        className='w-100'
        title={`Select ${title}`}
      >
        {selectedUpgrade ? selectedUpgrade.name : `Select ${title}`}
      </Dropdown.Toggle>

      <Dropdown.Menu
        className='w-100 py-0'
        style={{
          maxHeight: '40vh',
          overflowY: 'auto'
        }}
      >
        {orderedShards.sortedGroups.map((group) => (
          <div key={group}>
            <Dropdown.Header className='bg-light-subtle text-white fw-bold'>{group}</Dropdown.Header>
            {orderedShards.groupedShards[group].map((shard: ICannithShard) => {
              const isUnique: boolean =
                (shard[title.toLowerCase() as keyof ICannithShard] as string).split(', ').length === 1

              return (
                <Dropdown.Item
                  key={shard.name}
                  eventKey={shard.name}
                  onClick={() => {
                    onSelect(shard)
                  }}
                  title={`${shard.name}${!isUnique ? '' : ' (Unique)'}`}
                  className={isUnique ? 'bg-warning text-dark' : ''}
                >
                  <small>{shard.name}</small>
                </Dropdown.Item>
              )
            })}
          </div>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
})

interface Props {
  shards: ICannithShard[]
  onSelect: (shard: ICannithShard) => void
  title: string
  variant?: string
  selectedUpgrade: ICannithShard | undefined
}

export default ShardDropdown
