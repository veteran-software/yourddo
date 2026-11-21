import { useEffect, useState } from 'react'
import { parseIngredients } from '../../domains/incrediblePotential/data'
import { loadManualPayload } from '../data/loadDataset'

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
