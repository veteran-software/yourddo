import { lazy, type ComponentType } from 'react'
import { matchPath } from 'react-router-dom'

const files = import.meta.glob<{ default: ComponentType }>('../domains/*/*Page.tsx')
const routes = [
  ['/', 'home/HomePage'],
  ['/cauldron-of-cadence', 'cauldronOfCadence/CauldronOfCadencePage'],
  ['/dinosaur-bone', 'dinosaurBone/DinosaurBonePage'],
  ['/essence-crafting', 'essenceCrafting/EssenceCraftingPage'],
  ['/gear-planner', 'gearPlanner/GearPlannerPage'],
  ['/green-steel', 'heroicGreenSteel/HeroicGreenSteelPage'],
  ['/legendary-green-steel', 'legendaryGreenSteel/LegendaryGreenSteelPage'],
  ['/alchemical', 'alchemical/AlchemicalPage'],
  ['/slave-lords', 'slaveLords/SlaveLordsPage'],
  ['/thunder-forged', 'thunderForged/ThunderForgedPage'],
  ['/incredible-potential', 'incrediblePotential/IncrediblePotentialPage'],
  ['/nearly-complete', 'nearlyComplete/NearlyCompletePage'],
  ['/nearly-finished', 'nearlyFinished/NearlyFinishedPage'],
  ['/reavers-fate', 'mastermind/MastermindPage'],
  ['/saga-tracker', 'sagaTracker/SagaTrackerPage'],
  ['/monastery-of-the-scorpion', 'monasteryOfTheScorpion/MonasteryOfTheScorpionPage'],
  ['/the-shadow-crypt', 'shadowCrypt/ShadowCryptPage'],
  ['/the-shroud', 'shroud/ShroudPage'],
  ['/total-chaos', 'totalChaos/TotalChaosPage'],
  ['/viktranium-experiment', 'viktranium/ViktraniumPage']
]

export const pageRoutes = routes.map(([path, file]) => {
  const entry = 'domains/' + file + '.tsx'
  const load = files['../' + entry]
  if (!load) throw new Error('Missing route module ' + entry)
  return { path, entry: 'src/' + entry, Page: lazy(load), load }
})

export async function prepareRoutePage(pathname: string) {
  const route = pageRoutes.find(({ path }) => matchPath(path, pathname))
  if (!route) return undefined
  return { path: route.path, entry: route.entry, Page: (await route.load()).default }
}

export type PreparedRoutePage = NonNullable<Awaited<ReturnType<typeof prepareRoutePage>>>
