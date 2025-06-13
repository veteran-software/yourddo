import kebabCase from 'kebab-case'
import * as React from 'react'
import { type ReactNode } from 'react'
import type { Enhancement } from '../types/core.ts'
import type { CraftingIngredient } from '../types/crafting.ts'

export const sortObjectArray = <T extends object>(array: T[], key: keyof T) => {
  return array.sort((a: T, b: T) =>
    String(a[key]).localeCompare(String(b[key]))
  )
}

export const removeWhitespace = (input: string): string => {
  return input.replace(/\s+/g, '')
}

export const formatAsKebabCase = (label: string): string =>
  kebabCase(removeWhitespace(label), false)

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
        return item[searchField].find((enhancement: Enhancement) =>
          enhancement.name.includes(searchString)
        )
      }
    })
    .toSorted((a, b) => a.name.localeCompare(b.name))
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
