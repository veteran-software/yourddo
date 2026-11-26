import { useEffect, useState } from 'react'
import { loadManualPayload } from '../data/loadDataset'

function parseIngredients(value: unknown): { name: string; foundIn: string[] }[] {
  if (!Array.isArray(value)) throw new TypeError('Invalid ingredient data.')
  const names = new Set<string>()

  return value.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || !('name' in entry) || typeof entry.name !== 'string' || !entry.name) {
      throw new TypeError('Invalid ingredient data.')
    }
    const { name } = entry
    const foundIn = ('foundIn' in entry ? entry.foundIn : undefined) ?? []
    if (!Array.isArray(foundIn) || !foundIn.every((location) => typeof location === 'string')) {
      throw new TypeError(`Invalid acquisition data for ${name}.`)
    }
    if (names.has(name)) throw new TypeError(`Duplicate ingredient name: ${name}`)
    names.add(name)
    return { name, foundIn }
  })
}

let request: Promise<Map<string, string>> | undefined

export function useIngredientLocations() {
  const [locations, setLocations] = useState<Map<string, string>>()
  useEffect(() => {
    let active = true
    request ??= loadManualPayload<unknown>('ingredients')
      .then(parseIngredients)
      .then((rows) => new Map(rows.map(({ name, foundIn }) => [name.toLowerCase(), foundIn.join(', ')])))
      .catch((error: unknown) => {
        request = undefined
        throw error
      })
    void request.then(
      (value) => {
        if (active) setLocations(value)
      },
      () => undefined
    )
    return () => {
      active = false
    }
  }, [])
  return (name: string) => locations?.get(name.toLowerCase())
}
