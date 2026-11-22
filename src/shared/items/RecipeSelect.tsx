import { Select, Tooltip, type SelectProps } from '@mantine/core'
import { IconListDetails } from '@tabler/icons-react'
import { useId, useState } from 'react'
import styles from './RecipeSelect.module.css'

interface Ingredient {
  id: number
  name: string
  quantity: number
}

export default function RecipeSelect({
  label,
  ingredients,
  ...props
}: Readonly<SelectProps & { label: string; ingredients?: readonly Ingredient[] }>) {
  const panelId = useId()
  const [opened, setOpened] = useState(false)
  const hasIngredients = Boolean(ingredients?.length)
  const action = (opened ? 'Hide' : 'Show') + ' recipe ingredients for ' + label
  return (
    <div>
      <div className={styles.row}>
        <Select
          {...props}
          label={label}
          flex={1}
          miw={0}
          classNames={hasIngredients ? { input: styles.joinedInput } : undefined}
        />
        {hasIngredients && (
          <Tooltip label={action} withArrow>
            <button
              className={styles.toggle}
              type='button'
              aria-label={action}
              aria-expanded={opened}
              aria-controls={opened ? panelId : undefined}
              onClick={() => {
                setOpened((value) => !value)
              }}
            >
              <IconListDetails size='1.1rem' aria-hidden />
            </button>
          </Tooltip>
        )}
      </div>
      {opened && hasIngredients && (
        <ul id={panelId} className={styles.ingredients} aria-label={'Recipe ingredients for ' + label}>
          {ingredients?.map(({ id, name, quantity }) => (
            <li key={id}>
              <span>{name}</span>
              <strong>×{quantity.toLocaleString()}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
