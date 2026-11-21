import type { createCandidateComparison } from '../finding'
import { matchesGearEffect, statFamily } from '../finding'
import type { GearPlannerItem } from '../gearPlanner.types'
import classes from '../../../shared/layout/PlannerWorkspace.module.css'

interface Props {
  item: GearPlannerItem
  comparison: ReturnType<typeof createCandidateComparison>
  exact: boolean
  query: string
  bonusType: string | null
}

export default function CandidateEnchantments({ item, comparison, query, bonusType, exact }: Props) {
  const effects = item.source.enchantments
  if (!effects?.length) return null
  const groups = Map.groupBy(effects, (effect) => String(effect.bonus ?? '').trim())
  return (
    <div className={classes.statSheet} role='group' aria-label={`${item.source.name} enchantments`}>
      {[...groups].map(([bonus, group]) => {
        const stats = group.map((effect, index) => {
          const result = comparison.compareEffect(item, effect)
          const status = result?.isUpgrade
            ? 'Upgrade from'
            : result?.isOverpowered
              ? 'Below equipped'
              : 'Matches equipped'
          const note = result?.isConflict
            ? [status, result.currentModifier].filter((part) => part != null).join(' ')
            : ''
          const family = effect.modifier != null ? statFamily.exec(effect.name) : null
          return {
            effect,
            familyName: family?.[1],
            scope: family?.[2],
            key: family ? JSON.stringify([family[1], effect.modifier, note]) : index,
            note,
            upgrade: result?.isUpgrade,
            matched: Boolean(query || bonusType) && matchesGearEffect(effect, query, bonusType, exact)
          }
        })
        return (
          <div key={bonus} className={classes.bonusBand}>
            <div className={classes.bandLabel}>{bonus || 'Effects'}</div>
            <dl className={classes.statRows} aria-label={bonus || 'Effects'}>
              {[...Map.groupBy(stats, (stat) => stat.key)].map(([key, entries]) => {
                const first = entries[0]
                const grouped = entries.length > 1
                const name = grouped && first.familyName ? first.familyName : first.effect.name
                const nameMatches = first.matched && (!grouped || name.toLowerCase().includes(query))
                return (
                  <div className={classes.statRow} key={key}>
                    <dt>
                      {nameMatches ? <mark>{name}</mark> : name}
                      {grouped && (
                        <span className={classes.statScope}>
                          {entries.map(({ scope, matched }, index) => (
                            <span key={index}>
                              {index > 0 && ', '}
                              {matched && !nameMatches ? <mark>{scope}</mark> : scope}
                            </span>
                          ))}
                        </span>
                      )}
                    </dt>
                    <dd>
                      {first.effect.modifier}
                      {first.note && <small data-upgrade={first.upgrade}>{first.note}</small>}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
