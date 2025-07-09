import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { setAugment, setExtra, setPrefix, setSuffix } from '../../../redux/slices/cannithCraftingSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { ICannithShard } from '../../../types/cannithCrafting.ts'
import CannithItem from '../tabs/CannithItem.tsx'
import HowTo from '../tabs/HowTo.tsx'
import type { CannithSlot } from '../utils/cannithSlots.config.ts'

interface Props {
  slotConfig: CannithSlot
}

const CannithItemWrapper = ({ slotConfig }: Props) => {
  const dispatch: AppDispatch = useAppDispatch()

  const slotState = useAppSelector((state) => state.cannithCrafting[slotConfig.reduxKey], shallowEqual)

  // Special cases
  if (slotConfig.key === 'how-to') {
    return <HowTo />
  }

  if (slotConfig.key === 'gear-set') {
    return <></>
  }

  const handlePrefix = (shard: ICannithShard) => {
    dispatch(
      setPrefix({
        slot: slotConfig.reduxKey,
        shard
      })
    )
  }

  const handleSuffix = (shard: ICannithShard) => {
    dispatch(
      setSuffix({
        slot: slotConfig.reduxKey,
        shard
      })
    )
  }

  const handleExtra = (shard: ICannithShard) => {
    dispatch(
      setExtra({
        slot: slotConfig.reduxKey,
        shard
      })
    )
  }

  const handleAugment = (shard: ICannithShard) => {
    dispatch(
      setAugment({
        slot: slotConfig.reduxKey,
        shard
      })
    )
  }

  return (
    <CannithItem
      slot={slotConfig.slotName}
      onPrefixSelect={handlePrefix}
      onSuffixSelect={handleSuffix}
      onExtraSelect={handleExtra}
      onAugmentSelect={handleAugment}
      selectedPrefix={slotState.prefix}
      selectedSuffix={slotState.suffix}
      selectedExtra={slotState.extra}
      selectedAugment={slotState.augment}
      reduxKey={slotConfig.reduxKey}
    />
  )
}

export default CannithItemWrapper
