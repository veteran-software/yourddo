import type { Enhancement } from '../../types/core.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'

export const doIt = async () => {
  await import('./db.json')
    .then((data) => data.default)
    .then((data) => {
      const d: OldData[] = data as OldData[]
      const newFormatData: CraftingIngredient[] = []

      const shards: CraftingIngredient[] = []
      const weapons: CraftingIngredient[] = []
      const accessories: CraftingIngredient[] = []

      const pattern = /\b(Shard of Power)\b/gi

      d.forEach((item: OldData) => {
        if (item.name === 'Nothing') return

        const efg = item.name.replace(pattern, '').replace(/\s+/g, ' ').trim()
        const focus = efg
          .replace(
            /\b(Ethereal|Material|Dominion|Escalation|Opposition)\b/gi,
            ''
          )
          .replace(/\s+/g, ' ')
          .trim()

        // Shard
        const newIng: CraftingIngredient = {
          name: item.name,
          requirements: [item.raw1, item.raw2, item.raw3, item.raw4, item.raw5],
          quantity: 1,
          craftedIn: 'Altar of Invasion'
        }

        if (
          item.name.includes('Gem') ||
          item.name.includes('Essence') ||
          item.name.includes('Focus')
        ) {
          newIng.binding = {
            type: 'Unbound'
          }
          newIng.ingredientType =
            'This item may be usable in an eldritch device.'
        }

        if (item.name.includes('Shard of Power')) {
          newIng.title = 'Item'
          newIng.binding = {
            type: 'Bound',
            to: 'Character',
            from: 'Acquisition'
          }
          newIng.effectsAdded = [
            {
              name: efg,
              description: `This shard has been imbued with the energy of ${efg}.`
            }
          ]
        }

        // Weapon
        if (item.weapon && item.weaponDesc) {
          item.weapon.split(';').forEach((enhancementName, idx) => {
            const newWeapon: CraftingIngredient = {
              name: `${efg} Weapon Upgrade`,
              quantity: 1,
              binding: {
                type: 'Bound',
                to: 'Character',
                from: 'Acquisition'
              },
              effectsAdded: []
            }

            newWeapon.effectsAdded?.push({
              name: enhancementName.trim(),
              description: item.weaponDesc.split(';')[idx].trim()
            })

            const affinity: Enhancement = {
              name: `${focus} Affinity`,
              description: `This item has an affinity with ${focus}.`
            }

            newWeapon.effectsAdded?.push(affinity)
            newWeapon.description = newWeapon.effectsAdded
              ?.map((effect) => effect.name)
              .join(', ')
            newWeapon.requirements = [
              {
                name: 'Green Steen Weapon',
                quantity: 1
              },
              {
                name: `${efg} Shard of Power`,
                quantity: 1
              },
              {
                name: 'Shavarath Low Energy Cell',
                quantity: 1
              }
            ]

            weapons.push(newWeapon)
          })
        }

        if (item.equipment && item.equipmentDesc) {
          item.equipment.split(';').forEach((enhancementName, idx) => {
            const newAccessory: CraftingIngredient = {
              name: `${efg} Accessory Upgrade`,
              quantity: 1,
              binding: {
                type: 'Bound',
                to: 'Character',
                from: 'Acquisition'
              },
              effectsAdded: []
            }

            newAccessory.effectsAdded?.push({
              name: enhancementName.trim(),
              description: item.equipmentDesc.split(';')[idx].trim()
            })

            const focus = efg
              .replace(
                /\b(Ethereal|Material|Dominion|Escalation|Opposition)\b/gi,
                ''
              )
              .replace(/\s+/g, ' ')
              .trim()
            const affinity: Enhancement = {
              name: `${focus} Affinity`,
              description: `This item has an affinity with ${focus}.`
            }

            newAccessory.effectsAdded?.push(affinity)
            newAccessory.description = newAccessory.effectsAdded
              ?.map((effect) => effect.name)
              .join(', ')
            newAccessory.requirements = [
              {
                name: 'Green Steen Accessory',
                quantity: 1
              },
              {
                name: `${efg} Shard of Power`,
                quantity: 1
              },
              {
                name: 'Shavarath Low Energy Cell',
                quantity: 1
              }
            ]

            accessories.push(newAccessory)
          })
        }

        shards.push(newIng)
      })

      newFormatData.push(...shards, ...weapons, ...accessories)

      // console.log(JSON.stringify(accessories))
    })
}

export interface OldData {
  id: number
  name: string
  raw1: string
  raw2: Raw2
  raw3: Raw3
  raw4: Raw4
  raw5: Raw5
  weapon: null | string
  weaponDesc: string
  equipment: null | string
  equipmentDesc: string
  focus: null | string
  gem: Gem | null
  essence: Essence | null
}

export type Essence = 'Ethereal' | 'Material'

export type Gem = 'Opposition' | 'Escalation' | 'Dominion'

export type Raw2 =
  | 'Small Gnawed Bone'
  | 'Small Length of Infernal Chain'
  | 'Small Devil Scales'
  | 'Cloudy Gem of Opposition'
  | 'Cloudy Gem of Escalation'
  | 'Cloudy Gem of Dominion'

export type Raw3 =
  | 'Small Twisted Shrapnel'
  | 'Small Devil Scales'
  | 'Small Length of Infernal Chain'
  | 'Diluted Ethereal Essence'
  | 'Diluted Material Essence'

export type Raw4 =
  | 'Small Sulfurous Stone'
  | 'Small Twisted Shrapnel'
  | 'Small Devil Scales'
  | 'Shard of Power'

export type Raw5 = 'Shavarath Low Energy Cell'
