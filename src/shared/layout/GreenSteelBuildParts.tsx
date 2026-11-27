import IngredientLabel from '../items/IngredientLabel'
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
  children
}: Readonly<{
  name: string
  quantity: number
  children?: ReactNode
}>) {
  return (
    <li>
      <div className={styles.costRow}>
        <IngredientLabel name={name} />
        <strong>×{quantity.toLocaleString()}</strong>
      </div>
      {children && <div className={styles.stock}>{children}</div>}
      <div className={styles.stock}>
        <IngredientStock name={name} required={quantity} />
      </div>
    </li>
  )
}
