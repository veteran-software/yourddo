import { useEffect, useState } from 'react'
import { normalizeString } from '../conflictResolver'
import {
  type EssenceEnchantment,
  loadCurses,
  loadEssenceEnchantments,
  loadFiligreeSets,
  loadGearData,
  loadSetBonusIndex
} from '../dataLoader'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  GearSlot,
  type SetBonusIndex,
  type SetBonusIndexEntry
} from '../types'

export const useGearPlannerData = () => {
  const [allItems, setAllItems] = useState<GearItem[]>([])
  const [allAugments, setAllAugments] = useState<GearAugment[]>([])
  const [allCurses, setAllCurses] = useState<Curse[]>([])
  const [allFiligrees, setAllFiligrees] = useState<GearItem[]>([])
  const [allFiligreeSetNames, setAllFiligreeSetNames] = useState<string[]>([])
  const [essenceEnchantments, setEssenceEnchantments] = useState<EssenceEnchantment[]>([])
  const [itemSetBonusIndex, setItemSetBonusIndex] = useState<SetBonusIndex>({})
  const [filigreeSetBonusIndex, setFiligreeSetBonusIndex] = useState<SetBonusIndex>({})
  const [loading, setLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)

  const [allItemsBySlot, setAllItemsBySlot] = useState<Map<GearSlot, GearItem[]>>(() => new Map())
  const [itemToSetsMap, setItemToSetsMap] = useState<Map<string, string[]>>(() => new Map())

  useEffect(() => {
    const run = async () => {
      try {
        const { items, augments, filigrees } = await loadGearData()
        setAllItems(items)
        setAllAugments(augments)
        setAllFiligrees(filigrees)

        const sbi: SetBonusIndex = await loadSetBonusIndex()
        setItemSetBonusIndex(sbi)

        const curses: Curse[] = await loadCurses()
        setAllCurses(curses)

        const filigreeSetsData: { name: string }[] = await loadFiligreeSets()
        const filigreeSetNames: string[] = filigreeSetsData
          .map((set: { name: string }) => set.name)
          .sort((a: string, b: string) => a.localeCompare(b))
        setAllFiligreeSetNames(filigreeSetNames)

        const essenceEnchants: EssenceEnchantment[] = await loadEssenceEnchantments()
        setEssenceEnchantments(essenceEnchants)

        const filigreeSetBonusIndexLocal: SetBonusIndex = {}

        const isFiligreeAlreadyPresent: (setName: string, filigreeName: string) => boolean = (
          setName: string,
          filigreeName: string
        ) => {
          const setEntries: SetBonusIndexEntry[] | undefined = filigreeSetBonusIndexLocal[setName]
          if (!setEntries) {
            return false
          }

          for (const entry of setEntries) {
            if (entry.name === filigreeName) {
              return true
            }
          }

          return false
        }

        const updateFiligreeSetBonusIndexInternal: (filigree: GearItem, setName: string) => void = (
          filigree: GearItem,
          setName: string
        ) => {
          filigreeSetBonusIndexLocal[setName] ??= []

          if (!isFiligreeAlreadyPresent(setName, filigree.name)) {
            filigreeSetBonusIndexLocal[setName].push({
              name: filigree.name,
              minLevel: Number.parseInt(String(filigree.minLevel)) || 1
            })
          }
        }

        filigrees.forEach((filigree: GearItem) => {
          const allSets = new Set<string>()

          if (filigree.setBonus) {
            for (const sb of filigree.setBonus) {
              allSets.add(sb.name)
            }
          }

          if (allSets.size > 0) {
            for (const setName of allSets) {
              updateFiligreeSetBonusIndexInternal(filigree, setName)
            }
          }
        })

        setFiligreeSetBonusIndex(filigreeSetBonusIndexLocal)
      } catch (err) {
        console.error('Error loading gear data:', err)
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  useEffect(() => {
    if (loading) {
      return
    }

    let timeoutId_1: ReturnType<typeof setTimeout> | null = null
    let timeoutId_2: ReturnType<typeof setTimeout> | null = null

    const indexItemsBySlot = async (
      allItems: GearItem[],
      allFiligrees: GearItem[],
      chunkSize: number
    ): Promise<Map<GearSlot, GearItem[]>> => {
      const slotMap = new Map<GearSlot, GearItem[]>()
      const allItemsToProcess: GearItem[] = [...allItems, ...allFiligrees]

      for (let i = 0; i < allItemsToProcess.length; i += chunkSize) {
        const chunk: GearItem[] = allItemsToProcess.slice(i, i + chunkSize)

        for (const item of chunk) {
          item.normalizedName = normalizeString(item.name)
          item.normalizedEnchantments = [
            ...(item.enchantments?.map((e) => normalizeString(e.name)) ?? []),
            ...(item.effectsAdded?.map((e) => normalizeString(e.name)) ?? [])
          ]

          const list: GearItem[] | undefined = slotMap.get(item.slot)

          if (list) {
            list.push(item)
          } else {
            slotMap.set(item.slot, [item])
          }
        }

        await new Promise((resolve: (value: unknown) => void) => {
          timeoutId_1 = setTimeout(resolve, 0)
        })
      }

      return slotMap
    }

    const indexSetsByItem = async (index: SetBonusIndex, chunkSize: number): Promise<Map<string, string[]>> => {
      const setsMap = new Map<string, string[]>()
      const setEntries: [string, SetBonusIndexEntry[] | undefined][] = Object.entries(index)

      for (let i = 0; i < setEntries.length; i += chunkSize) {
        const chunk: [string, SetBonusIndexEntry[] | undefined][] = setEntries.slice(i, i + chunkSize)

        for (const [setName, items] of chunk) {
          if (!items) {
            continue
          }

          for (const item of items) {
            const key = `${item.name}|${String(item.minLevel)}`
            const list: string[] | undefined = setsMap.get(key)

            if (list) {
              list.push(setName)
            } else {
              setsMap.set(key, [setName])
            }
          }
        }

        await new Promise((resolve: (value: unknown) => void) => {
          timeoutId_2 = setTimeout(resolve, 0)
        })
      }

      return setsMap
    }

    const processData = async () => {
      const slotMap: Map<GearSlot, GearItem[]> = await indexItemsBySlot(allItems, allFiligrees, 1000)
      setAllItemsBySlot(slotMap)

      const combinedIndex = { ...itemSetBonusIndex, ...filigreeSetBonusIndex }
      const setsMap: Map<string, string[]> = await indexSetsByItem(combinedIndex, 100)
      setItemToSetsMap(setsMap)

      setDataReady(true)
    }

    void processData()

    return () => {
      if (timeoutId_1 !== null) {
        clearTimeout(timeoutId_1)
      }

      if (timeoutId_2 !== null) {
        clearTimeout(timeoutId_2)
      }
    }
  }, [allItems, allFiligrees, itemSetBonusIndex, filigreeSetBonusIndex, loading])

  return {
    allItems,
    allAugments,
    allCurses,
    allFiligrees,
    allFiligreeSetNames,
    essenceEnchantments,
    itemSetBonusIndex,
    filigreeSetBonusIndex,
    loading,
    dataReady,
    allItemsBySlot,
    itemToSetsMap
  }
}
