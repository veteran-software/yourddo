import { loadNativeNearlyFinished } from '../gearPlanner/nativeUpgradeData'
import { validateNearlyFinishedDataset } from './nearlyFinished.logic'

export async function loadNearlyFinishedRecipes() {
  return validateNearlyFinishedDataset(await loadNativeNearlyFinished())
}
