import { useEffect, useMemo, useState } from 'react'
import { Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import cannithCrafting from '../../../data/cannithCrafting.json'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CannithCraftingState } from '../../../redux/slices/cannithCraftingSlice.ts'
import type { ICannithShard } from '../../../types/cannithCrafting.ts'
import ItemMetadata from '../components/ItemMetadata.tsx'
import ShardDropdown from '../components/ShardDropdown.tsx'
import SlotCard from '../components/SlotCard.tsx'

const CannithItem = (props: Props) => {
  const {
    onAugmentSelect,
    onExtraSelect,
    onPrefixSelect,
    onSuffixSelect,
    selectedAugment,
    selectedExtra,
    selectedPrefix,
    selectedSuffix,
    slot,
    reduxKey
  } = props

  const { minimumLevel } = useAppSelector((state) => state.cannithCrafting, shallowEqual)
  const data = useMemo(() => cannithCrafting as unknown as ICannithShard[], [])

  const [prefixes, setPrefixes] = useState<ICannithShard[]>([])
  const [suffixes, setSuffixes] = useState<ICannithShard[]>([])
  const [extras, setExtras] = useState<ICannithShard[]>([])

  useEffect(() => {
    const filterShards = (type: 'prefix' | 'suffix' | 'extra') =>
      data
        .filter((shard: ICannithShard) => shard[type] !== null)
        .filter((shard: ICannithShard) => shard[type]?.toLowerCase().includes(slot.toLowerCase()) ?? false)

    setPrefixes(filterShards('prefix'))
    setSuffixes(filterShards('suffix'))
    setExtras(filterShards('extra'))
  }, [data, slot])

  if (!minimumLevel) return null

  return (
    <Stack direction='horizontal' gap={1} className='align-items-start m-0 p-0'>
      {minimumLevel ? (
        <ItemMetadata reduxKey={reduxKey} />
      ) : (
        <SlotCard isMain title={slot} centered={false}>
          <p>Select a minimum level to begin.</p>
        </SlotCard>
      )}

      <SlotCard title='Prefixes'>
        <ShardDropdown shards={prefixes} onSelect={onPrefixSelect} title='Prefix' selectedUpgrade={selectedPrefix} />
      </SlotCard>

      <SlotCard title='Suffixes'>
        <ShardDropdown shards={suffixes} onSelect={onSuffixSelect} title='Suffix' selectedUpgrade={selectedSuffix} />
      </SlotCard>

      <SlotCard title='Extra Slot'>
        {minimumLevel >= 10 ? (
          <ShardDropdown shards={extras} onSelect={onExtraSelect} title='Extra' selectedUpgrade={selectedExtra} />
        ) : (
          <p className='text-center m-0 p-0'>
            <strong>Requires ML 10 Item</strong>
          </p>
        )}
      </SlotCard>

      <SlotCard title='Augment Slot'>
        <p className='text-center m-0 p-0'>
          <small>
            <strong>Augments Coming Soon</strong>
          </small>
        </p>
        <p className='text-center m-0 p-0'>
          <small>
            <em>I have to go through the last 8 years of updates and update my list</em>
          </small>
        </p>
      </SlotCard>
    </Stack>
  )
}

interface Props {
  slot: string
  onPrefixSelect: (shard: ICannithShard) => void
  onSuffixSelect: (shard: ICannithShard) => void
  onExtraSelect: (shard: ICannithShard) => void
  onAugmentSelect: (shard: ICannithShard) => void
  selectedPrefix?: ICannithShard
  selectedSuffix?: ICannithShard
  selectedExtra?: ICannithShard
  selectedAugment?: ICannithShard
  reduxKey: keyof Omit<CannithCraftingState, 'minimumLevel'>
}

export default CannithItem
