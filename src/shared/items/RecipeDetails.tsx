import { keyedEntries } from '../ui/keyedEntries'
import { useState } from 'react'

interface Part<Key> {
  name: string
  quantity: number
  recipeKey?: Key
}

export default function RecipeDetails<Key extends string | number>({
  recipeKey,
  count,
  lookup,
  name
}: Readonly<{
  recipeKey: Key
  name: string
  count: number
  lookup: (key: Key) => readonly Part<Key>[] | undefined
}>) {
  const [opened, setOpened] = useState(false)
  const parts = lookup(recipeKey)
  if (!parts?.length) return null
  return (
    <details
      onToggle={(event) => {
        setOpened(event.currentTarget.open)
      }}
    >
      <summary aria-label={'Recipe for ' + name}>Recipe</summary>
      {opened && (
        <ul>
          {keyedEntries(parts, (part) => JSON.stringify([part.recipeKey, part.name])).map(({ value: part, key }) => {
            const quantity = count * part.quantity
            return (
              <li key={key}>
                {part.name} ×{quantity}
                {part.recipeKey !== undefined && (
                  <RecipeDetails recipeKey={part.recipeKey} name={part.name} count={quantity} lookup={lookup} />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </details>
  )
}
