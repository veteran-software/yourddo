import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, Dropdown, Form, ListGroup } from 'react-bootstrap'
import cannithCrafting from '../../../data/cannithCrafting.json'
import type { Enchantment, ICannithShard } from '../../../types/cannithCrafting.ts'
import ShardSearchList from '../components/ShardSearchList.tsx'
import { groupedShards } from '../utils/helpers.ts'

const ShardSearch = () => {
  const [selectedShard, setSelectedShard] = useState<ICannithShard>()
  const [searchQuery, setSearchQuery] = useState('')
  const [orderedShards, setOrderedShards] = useState<{
    groupedShards: Record<string, ICannithShard[]>
    sortedGroups: string[]
  }>()

  const data = cannithCrafting as unknown as ICannithShard[]

  const handleShardSelect = useCallback((shard: ICannithShard) => {
    setSelectedShard(shard)
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((shard) => {
      const searchStr = searchQuery.toLowerCase()
      if (!searchStr) return true

      if (shard.name.toLowerCase().includes(searchStr)) return true

      if (
        shard.enchantments?.some(
          (enchant: Enchantment) =>
            enchant.name.toLowerCase().includes(searchStr) ||
            (typeof enchant.statModified === 'string' && enchant.statModified.toLowerCase().includes(searchStr))
        )
      )
        return true

      return shard.group.toLowerCase().includes(searchStr)
    })
  }, [data, searchQuery])

  useEffect(() => {
    setOrderedShards(groupedShards(filteredData))
  }, [filteredData])

  return (
    <Card>
      <Card.Header>
        <Card.Title className='m-0'>
          <h6 className='p-0 m-0'>Shard Search</h6>
        </Card.Title>
      </Card.Header>

      <Card.Body>
        <Form.Control
          type='text'
          placeholder='Search by effect, name, or group...'
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
          }}
          className='mb-3'
        />

        <hr />

        <Dropdown className='w-100'>
          <Dropdown.Toggle
            variant='outline-secondary'
            className='w-100'
            id='minimum-level-dropdown'
            title='Select Level'
          >
            {selectedShard ? selectedShard.name : 'Shard Search'}
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{
              maxHeight: '40vh',
              overflowY: 'auto'
            }}
            className='w-100 py-0'
          >
            {orderedShards?.sortedGroups.map((group: string) => (
              <div key={group}>
                <Dropdown.Header className='bg-light-subtle text-white fw-bold'>{group}</Dropdown.Header>
                {orderedShards.groupedShards[group].map((shard: ICannithShard) => (
                  <Dropdown.Item
                    key={shard.name}
                    onClick={() => {
                      handleShardSelect(shard)
                    }}
                  >
                    {shard.name}
                  </Dropdown.Item>
                ))}
              </div>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {selectedShard && (
          <>
            <hr />
            <ListGroup>
              {selectedShard.prefix && <ShardSearchList title='Prefix' affixes={selectedShard.prefix} />}
              {selectedShard.suffix && <ShardSearchList title='Suffix' affixes={selectedShard.suffix} />}
              {selectedShard.extra && <ShardSearchList title='Extra' affixes={selectedShard.extra} />}
            </ListGroup>
          </>
        )}
      </Card.Body>
    </Card>
  )
}

export default ShardSearch
