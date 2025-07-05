import { useEffect, useMemo } from 'react'
import { Dropdown, Image, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import ringImage from '../../../assets/icons/ringOfIncrediblePotential.png'
import FilterOffCanvas from '../../../components/filters/FilterOffCanvas.tsx'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  setFilteredRingList,
  setFilterMode,
  setSelectedRingFilters
} from '../../../redux/slices/incrediblePotentialSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement, Ring } from '../../../types/core.ts'
import { baseItems } from '../data/baseItems.ts'
import DropdownItemTitle from './DropdownItemTitle.tsx'

const BaseItemDropdown = (props: Props) => {
  const { buttonLabel, onSelectItem } = props

  const dispatch: AppDispatch = useAppDispatch()

  const { filteredRingList, filterMode, ringFilters, selectedRingFilters } = useAppSelector(
    (state) => state.incrediblePotential,
    shallowEqual
  )

  const baseItemList: Ring[] = useMemo((): Ring[] => baseItems, [])

  // Updates the base item list when ring filters change
  useEffect(() => {
    if (selectedRingFilters.length === 0) {
      dispatch(setFilteredRingList(baseItemList))
    } else {
      dispatch(
        setFilteredRingList(
          baseItemList.filter((item: Ring) => {
            const itemEnhancements: string[] = item.enchantments
              .slice(0, 2)
              .map((enhancement: Enhancement) => enhancement.name)

            return filterMode === 'OR'
              ? selectedRingFilters.some((filter: string) => {
                  return itemEnhancements.includes(filter)
                })
              : selectedRingFilters.every((filter: string) => {
                  return itemEnhancements.includes(filter)
                })
          })
        )
      )
    }
  }, [baseItemList, dispatch, filterMode, selectedRingFilters])

  const renderItem = (item: Ring) => (
    <Stack direction='horizontal' gap={3}>
      <Image src={ringImage} alt={item.name} title={item.name} className='d-none d-md-block' />
      <Stack direction='vertical' gap={0}>
        <DropdownItemTitle title={item.name} />
        <small className='d-none d-lg-block'>
          {item.enchantments.map((enhancement: Enhancement) => enhancement.name).join(', ')}
        </small>
      </Stack>
    </Stack>
  )

  return (
    <Stack direction='horizontal' gap={2}>
      <Dropdown className='d-flex flex-grow-1'>
        <Dropdown.Toggle variant='outline-info w-100'>{buttonLabel}</Dropdown.Toggle>
        <Dropdown.Menu
          style={{
            maxHeight: '50vh',
            overflowY: 'auto'
          }}
        >
          {filteredRingList.map((item: Ring, idx: number) => (
            <Dropdown.Item
              key={`${item.name}-${String(idx)}`}
              onClick={() => {
                onSelectItem(item)
              }}
            >
              {renderItem(item)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <FilterOffCanvas
        filterMode={filterMode}
        filterOptions={ringFilters}
        items={filteredRingList}
        getItemFilters={(item: Ring): string[] => {
          return item.enchantments.slice(0, 2).map((enhancement) => enhancement.name)
        }}
        selectedFilters={selectedRingFilters}
        setSelectedFilters={(filters: string[]) => {
          dispatch(setSelectedRingFilters(filters))
        }}
        setFilterMode={(mode: 'OR' | 'AND') => dispatch(setFilterMode(mode))}
      />
    </Stack>
  )
}

interface Props {
  onSelectItem: (item: Ring) => void
  buttonLabel: string
}

export default BaseItemDropdown
