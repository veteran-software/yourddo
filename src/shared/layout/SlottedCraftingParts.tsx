import { Text } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import ItemIcon from '../items/ItemIcon'
import IngredientStock from '../items/IngredientStock'
import styles from './craftingTools.module.css'

interface Requirement {
  name: string
  quantity: number
  foundIn?: readonly string[]
  requirements?: readonly Requirement[]
  image?: string
}

export function BuildHeader({
  item,
  level,
  filled,
  total
}: Readonly<{
  item: { name: string; type: string; icon?: string; image?: string }
  level?: string | number
  filled: number
  total: number
}>) {
  return (
    <header className={styles.item}>
      <ItemIcon item={item} size={40} />
      <div>
        <strong>{item.name}</strong>
        <small>
          {[item.type, level !== undefined && 'Minimum level ' + String(level)].filter(Boolean).join(' · ')}
        </small>
        {!!total && (
          <small>
            {filled} of {total} slots filled
          </small>
        )}
      </div>
    </header>
  )
}

export function RequirementList({
  requirements,
  icons = false
}: Readonly<{
  requirements: readonly Requirement[]
  icons?: boolean
}>) {
  if (!requirements.length)
    return (
      <Text size='sm' c='dimmed'>
        No published crafting requirements.
      </Text>
    )
  return (
    <ul className={styles.costs}>
      {requirements.map((part, index) => {
        const row = (
          <>
            <span className={icons ? styles.materialName : undefined}>
              {icons && <ItemIcon item={part} size={24} />}
              {part.name}
            </span>
            <strong>×{part.quantity.toLocaleString()}</strong>
          </>
        )
        return (
          <li key={JSON.stringify([part.name, index])}>
            {part.foundIn?.length ? (
              <details className={styles.source}>
                <summary aria-label={'Where to find ' + part.name + ', quantity ' + part.quantity.toLocaleString()}>
                  <IconChevronRight aria-hidden size={15} />
                  {row}
                </summary>
                <ul>
                  {part.foundIn.map((location) => (
                    <li key={location}>{location}</li>
                  ))}
                </ul>
              </details>
            ) : (
              <div className={styles.costRow}>{row}</div>
            )}
            <div className={styles.stock}>
              <IngredientStock name={part.name} required={part.quantity} />
            </div>
            {!!part.requirements?.length && (
              <details className={styles.component}>
                <summary>Component requirements</summary>
                <RequirementList requirements={part.requirements} />
              </details>
            )}
          </li>
        )
      })}
    </ul>
  )
}
