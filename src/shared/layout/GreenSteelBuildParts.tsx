import { IconChevronRight } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import ItemIcon, { type ItemIconSource } from '../items/ItemIcon'
import IngredientStock from '../items/IngredientStock'
import styles from './craftingTools.module.css'

export function BuildHeader({
  item,
  tiers,
  equipmentLabel = 'Equipment'
}: Readonly<{
  item: ItemIconSource & { type: 'weapon' | 'equipment' }
  tiers: number
  equipmentLabel?: string
}>) {
  return (
    <header className={styles.item}>
      <ItemIcon item={item} size={40} />
      <div>
        <strong>{item.name}</strong>
        <small>
          {item.type === 'weapon' ? 'Weapon' : equipmentLabel} · {tiers} of 3 tiers selected
        </small>
      </div>
    </header>
  )
}

export function MaterialRow({
  name,
  quantity,
  location,
  children
}: Readonly<{
  name: string
  quantity: number
  location?: string
  children?: ReactNode
}>) {
  const row = (
    <>
      <span>{name}</span>
      <strong>×{quantity.toLocaleString()}</strong>
    </>
  )
  return (
    <li>
      {location ? (
        <details className={styles.source}>
          <summary aria-label={'Where to find ' + name + ', quantity ' + quantity.toLocaleString()}>
            <IconChevronRight size={15} aria-hidden />
            {row}
          </summary>
          <ul>
            <li>Found in: {location}</li>
          </ul>
        </details>
      ) : (
        <div className={styles.costRow}>{row}</div>
      )}
      {children && <div className={styles.stock}>{children}</div>}
      <div className={styles.stock}>
        <IngredientStock name={name} required={quantity} />
      </div>
    </li>
  )
}
