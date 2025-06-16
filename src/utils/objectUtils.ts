import kebabCase from 'kebab-case'
import * as React from 'react'
import { type ReactNode } from 'react'
import type { ElementalList } from '../pages/heroicGreenSteel/hooks/useDevastationBasic.ts'
import type { Enhancement } from '../types/core.ts'
import type { CraftingIngredient } from '../types/crafting.ts'
import { ESSENCES, FOCI, GEMS } from './constants.ts'

export const sortObjectArray = <T extends object>(array: T[], key: keyof T) => {
  return [...array].sort((a: T, b: T) =>
    String(a[key]).localeCompare(String(b[key]))
  )
}

export const removeWhitespace = (input: string): string => {
  return input.replace(/\s+/g, '')
}

export const formatAsKebabCase = (label: string): string =>
  kebabCase(removeWhitespace(label), false)

export const filterSublistByElement = (
  ingList: CraftingIngredient[],
  element: string
): CraftingIngredient[] => {
  return ingList.filter((ingredient: CraftingIngredient) => {
    return (ingredient.requirements?.[0] as Enhancement).name.includes(element)
  })
}

export const filterForDevastationSublist = (
  baseList: CraftingIngredient[],
  search: ElementalList
): CraftingIngredient[] => {
  return baseList.filter((item: CraftingIngredient) => {
    const reqs: CraftingIngredient[] = item.requirements as CraftingIngredient[]

    const elementOneCheck = reqs[0].name.includes(search.elements[0])
    const elementTwoCheck =
      reqs[1].description?.includes(search.elements[1]) ??
      reqs[1].name.includes(search.elements[1])

    return elementOneCheck && elementTwoCheck
  })
}

export const filterForSublist = (
  baseList: CraftingIngredient[],
  searchString: string,
  searchField: keyof CraftingIngredient
): CraftingIngredient[] => {
  return baseList
    .filter((item: CraftingIngredient) => {
      if (typeof item[searchField] === 'string') {
        return item[searchField].includes(searchString)
      }

      if (Array.isArray(item[searchField])) {
        const foundItem = (item[searchField] as Enhancement[]).find(
          (enhancement: Enhancement) => enhancement.name.includes(searchString)
        )
        if (!foundItem) return false

        return item[searchField].find((enhancement: Enhancement) =>
          enhancement.name.includes(searchString)
        )
      }
    })
    .toSorted(
      (a: CraftingIngredient, b: CraftingIngredient) =>
        a.effectsAdded?.[0].name.localeCompare(
          b.effectsAdded?.[0].name ?? ''
        ) ?? 0
    )
}

export const containsText = (node: ReactNode, searchText: string): boolean => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node).includes(searchText)
  }

  if (Array.isArray(node)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return node.some((child) => containsText(child, searchText))
  }

  if (React.isValidElement(node)) {
    // @ts-expect-error I hate this!
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return containsText(node.props.children, searchText)
  }

  return false
}

export const deconstructShard = (shard: string) => {
  const focusRegex = new RegExp(`\\b(${FOCI.join('|')})\\b`, 'i')
  const essenceRegex = new RegExp(`\\b(${ESSENCES.join('|')})\\b`, 'i')
  const gemRegex = new RegExp(`\\b(${GEMS.join('|')})\\b`, 'i')

  const focusMatch = RegExp(focusRegex).exec(shard)
  const essenceMatch = RegExp(essenceRegex).exec(shard)
  const gemMatch = RegExp(gemRegex).exec(shard)

  return {
    focus: focusMatch ? focusMatch[0] : 'No focus found',
    essence: essenceMatch ? essenceMatch[0] : 'No essence found',
    gem: gemMatch ? gemMatch[0] : 'No gem found'
  }
}
