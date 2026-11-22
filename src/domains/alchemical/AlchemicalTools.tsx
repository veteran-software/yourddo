import { SegmentedControl, Stack, Text } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import IngredientStock from '../../shared/items/IngredientStock'
import AlchemicalItemArt from './AlchemicalItemArt'
import type { AlchemicalBase, AlchemicalEffect, AlchemicalStage, resolveAlchemicalPlan } from './data'
import styles from '../../shared/layout/craftingTools.module.css'

type Plan = ReturnType<typeof resolveAlchemicalPlan>
interface ToolProps {
  base: AlchemicalBase
  plan: Plan
}

function ItemSummary({ base, plan }: ToolProps) {
  return (
    <header className={styles.item}>
      <AlchemicalItemArt layers={base.iconLayerIds} />
      <div>
        <strong>{base.name}</strong>
        <small>
          ML {plan.minimumLevel} · {plan.selected.length} of 4 bindings
        </small>
      </div>
    </header>
  )
}

export function IngredientTool({
  base,
  plan,
  mode,
  onModeChange
}: ToolProps & { mode: string; onModeChange: (mode: string) => void }) {
  const costs = mode === 'materials' ? plan.materials : plan.costs
  return (
    <Stack p='md' gap='md'>
      <ItemSummary base={base} plan={plan} />
      <SegmentedControl
        fullWidth
        aria-label='Checklist breakdown'
        value={mode}
        onChange={onModeChange}
        data={[
          { value: 'materials', label: 'Raw materials' },
          { value: 'direct', label: 'Recipe inputs' }
        ]}
      />
      {!!base.costs.length && (
        <Text size='sm' c='dimmed'>
          Includes the rune trade for the base item.
        </Text>
      )}
      {costs.length ? (
        <ul className={styles.costs}>
          {costs.map((cost) => {
            const row = (
              <>
                <span>{cost.name}</span>
                <strong>×{cost.quantity.toLocaleString()}</strong>
              </>
            )
            return (
              <li key={cost.id}>
                {cost.sources.length ? (
                  <details className={styles.source}>
                    <summary aria-label={'Where to find ' + cost.name + ', quantity ' + cost.quantity.toLocaleString()}>
                      <IconChevronRight size={15} aria-hidden />
                      {row}
                    </summary>
                    <ul>
                      {cost.sources.map((source) => (
                        <li key={source}>{source}</li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <div className={styles.costRow}>{row}</div>
                )}
                <div className={styles.stock}>
                  <IngredientStock name={cost.name} required={cost.quantity} />
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <Text size='sm' c='dimmed'>
          Choose a binding to see the ingredients.
        </Text>
      )}
    </Stack>
  )
}

function Effect({ effect }: { effect: AlchemicalEffect }) {
  return (
    <div className={styles.effect}>
      <strong>{effect.name}</strong>
      {effect.stats.length ? (
        <dl>
          {effect.stats.map((stat, index) => (
            <div key={JSON.stringify([stat.stat, stat.bonusType, index])}>
              <dt>
                {stat.stat}
                {stat.bonusType && <small>{stat.bonusType}</small>}
              </dt>
              <dd>{stat.formattedValue}</dd>
            </div>
          ))}
        </dl>
      ) : (
        effect.description && (
          <Text size='sm' c='dimmed'>
            {effect.description}
          </Text>
        )
      )}
      {!!effect.augmentTypes.length && (
        <Text size='sm' c='dimmed'>
          Fits {effect.augmentTypes.join(', ')} augments
        </Text>
      )}
    </div>
  )
}

export function BindingEffectsTool({ base, plan, labels }: ToolProps & { labels: Record<AlchemicalStage, string> }) {
  const sources = new Map(
    plan.selected.flatMap((recipe) => recipe.effects.map((effect) => [effect.id, recipe.stage] as const))
  )
  return (
    <Stack p='md' gap='md'>
      <ItemSummary base={base} plan={plan} />
      {plan.effects.length ? (
        plan.selected.map((recipe) => {
          const effects = plan.effects.filter((effect) => sources.get(effect.id) === recipe.stage)
          return effects.length ? (
            <section key={recipe.stage} className={styles.stage}>
              <h3>{labels[recipe.stage]}</h3>
              {effects.map((effect) => (
                <Effect key={effect.id} effect={effect} />
              ))}
            </section>
          ) : null
        })
      ) : (
        <Text size='sm' c='dimmed'>
          Choose a binding to preview its effects.
        </Text>
      )}
    </Stack>
  )
}
