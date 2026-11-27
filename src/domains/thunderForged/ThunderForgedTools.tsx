import { Badge, Group, SegmentedControl, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import IngredientStock from '../../shared/items/IngredientStock'
import styles from '../../shared/layout/craftingTools.module.css'
import type { GearPlannerEffect } from '../gearPlanner/gearPlanner.types'
import { thunderStageLabels, type resolveThunderPlan, type ThunderBase } from './data'

type Plan = ReturnType<typeof resolveThunderPlan>
type Props = Readonly<{ base: ThunderBase; plan: Plan }>

function ToolItem({ base, plan }: Props) {
  return (
    <header className={styles.item}>
      <div>
        <strong>{base.source.name}</strong>
        <small>Minimum level {plan.minimumLevel}</small>
      </div>
    </header>
  )
}

function CostList({ costs }: Readonly<{ costs: ThunderBase['costs'] }>) {
  return (
    <ul className={styles.costs}>
      {costs.map(({ id, name, quantity }) => (
        <li key={id}>
          <div className={styles.costRow}>
            <span>{name}</span>
            <strong>×{quantity.toLocaleString()}</strong>
          </div>
          <div className={styles.stock}>
            <IngredientStock name={name} required={quantity} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ThunderIngredients({ base, plan }: Props) {
  const [mode, setMode] = useState('total')
  return (
    <Stack p='md' gap='md'>
      <ToolItem base={base} plan={plan} />
      <SegmentedControl
        fullWidth
        aria-label='Ingredient breakdown'
        value={mode}
        onChange={setMode}
        data={[
          { value: 'total', label: 'Totals' },
          { value: 'stages', label: 'By stage' }
        ]}
      />
      {mode === 'total' ? (
        <>
          <Text size='sm' c='dimmed'>
            Includes forging the base item.
          </Text>
          <CostList costs={plan.costs} />
        </>
      ) : (
        <>
          <section className={styles.stage}>
            <h3>Base item</h3>
            <CostList costs={base.costs} />
          </section>
          {plan.selected.map((recipe) => (
            <section key={recipe.id} className={styles.stage}>
              <h3>{thunderStageLabels[recipe.stage]}</h3>
              <Text size='sm' mt='xs'>
                {recipe.name}
              </Text>
              <CostList costs={recipe.costs} />
            </section>
          ))}
        </>
      )}
    </Stack>
  )
}

function Effects({ effects }: Readonly<{ effects: readonly GearPlannerEffect[] }>) {
  const descriptions = [...new Set(effects.flatMap(({ notes }) => (notes ? [notes] : [])))]
  return (
    <div className={styles.effect}>
      <dl>
        {effects.map(({ name, modifier, bonus }, index) => (
          <div key={String(index) + name}>
            <dt>
              {name}
              {bonus && <small>{bonus}</small>}
            </dt>
            {modifier !== undefined && <dd>{modifier}</dd>}
          </div>
        ))}
      </dl>
      {descriptions.length > 0 && (
        <Stack gap='xs' mt='xs'>
          {descriptions.map((description) => (
            <Text key={description} size='xs' c='dimmed'>
              {description}
            </Text>
          ))}
        </Stack>
      )}
    </div>
  )
}

export function ThunderEffects({ base, plan }: Props) {
  return (
    <Stack p='md' gap='md'>
      <ToolItem base={base} plan={plan} />
      <Group gap='xs'>
        {plan.sockets.map((socket) => (
          <Badge key={socket.augmentType} variant='outline'>
            {socket.name}
          </Badge>
        ))}
      </Group>
      {!!plan.baseEffects.length && (
        <section className={styles.stage}>
          <h3>Base effects</h3>
          <Effects effects={plan.baseEffects} />
        </section>
      )}
      {plan.upgrades.map(({ recipe, effects }) => (
        <section key={recipe.id} className={styles.stage}>
          <h3>
            {thunderStageLabels[recipe.stage]} · {recipe.name}
          </h3>
          {effects.length > 0 && <Effects effects={effects} />}
          {!effects.length && (
            <Text size='xs' c='dimmed' mt='xs'>
              This choice changes the item’s upgrade progression or sockets.
            </Text>
          )}
          {recipe.notes.map((note) => (
            <Text key={note} size='xs' mt='xs'>
              {note}
            </Text>
          ))}
        </section>
      ))}
    </Stack>
  )
}
