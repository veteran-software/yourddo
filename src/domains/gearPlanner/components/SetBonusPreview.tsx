import { IconLayersLinked } from '@tabler/icons-react'
import { statFamily } from '../finding'
import classes from '../../../shared/layout/PlannerWorkspace.module.css'
import type { GearPlannerStandardSetDefinition } from '../standardSetDefinitions'

export default function SetBonusPreview({
  definition,
  compact
}: {
  definition?: GearPlannerStandardSetDefinition
  compact?: boolean
}) {
  if (!definition?.thresholds.length) return null
  const tiers = definition.thresholds.map(({ threshold, effects }) => {
    const sharedBonus =
      effects.length && effects.every((effect) => effect.bonus === effects[0].bonus) ? effects[0].bonus : undefined
    const rows = effects.map((effect, index) => {
      const family = effect.modifier != null ? statFamily.exec(effect.name) : null
      return { effect, family, key: family ? JSON.stringify([family[1], effect.modifier, effect.bonus]) : index }
    })
    return (
      <div key={threshold} className={classes.setTier}>
        <h4>
          <span>{threshold}-piece</span>
          {sharedBonus != null && sharedBonus !== '' && <small>{sharedBonus} bonus</small>}
        </h4>
        {effects.length ? (
          <ul>
            {[...Map.groupBy(rows, (row) => row.key)].map(([key, group]) => {
              const { effect, family } = group[0]
              const grouped = family && group.length > 1
              return (
                <li key={key}>
                  <span>
                    {grouped ? family[1] : effect.name}
                    {grouped && (
                      <span className={classes.statScope}>{group.map((row) => row.family?.[2]).join(', ')}</span>
                    )}
                    {sharedBonus == null && effect.bonus != null && effect.bonus !== '' && (
                      <small>{effect.bonus}</small>
                    )}
                  </span>
                  {effect.modifier != null && <strong>{effect.modifier}</strong>}
                </li>
              )
            })}
          </ul>
        ) : (
          <small>No effects listed.</small>
        )}
      </div>
    )
  })
  const heading = (
    <>
      <IconLayersLinked size='1.1em' aria-hidden />
      {definition.name}
    </>
  )
  return compact ? (
    <details className={classes.setPreview}>
      <summary>
        {heading}
        <small>{definition.thresholds.map((t) => String(t.threshold) + '-piece').join(' · ')}</small>
      </summary>
      {tiers}
    </details>
  ) : (
    <section className={classes.setPreview} aria-label={definition.name + ' set bonuses'}>
      <h3>{heading}</h3>
      {tiers}
    </section>
  )
}
