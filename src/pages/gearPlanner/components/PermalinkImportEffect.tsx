import { useEffect } from 'react'
import type { Location, NavigateFunction } from 'react-router-dom'
import { readGpFromUrl, removeGpFromUrl, tryDecodeGearPermalink } from '../permalink'
import type { Curse, GearAugment, GearItem, GearSetup } from '../types'

interface PermalinkImportEffectProps {
  loading: boolean
  location: Location
  navigate: NavigateFunction
  allItems: GearItem[]
  allAugments: GearAugment[]
  allCurses: Curse[]
  onImportSetup: (setup: GearSetup) => void
}

const PermalinkImportEffect = ({
  loading,
  location,
  navigate,
  allItems,
  allAugments,
  allCurses,
  onImportSetup
}: PermalinkImportEffectProps) => {
  useEffect(() => {
    if (loading) return

    const { gp, source } = readGpFromUrl(location)
    if (!gp) return

    const result = tryDecodeGearPermalink(gp, allItems, allAugments, allCurses)
    if (result.ok) {
      onImportSetup({
        ...result.data,
        name: `${result.data.name} (Imported)`
      })
    }

    void removeGpFromUrl(navigate, location, source)
  }, [allAugments, allCurses, allItems, loading, location, navigate, onImportSetup])

  return null
}

export default PermalinkImportEffect
