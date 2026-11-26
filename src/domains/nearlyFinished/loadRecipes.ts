import { hasDatasetFile, loadManualPayload } from '../../shared/data/loadDataset'
import { loadNativeNearlyFinished } from '../gearPlanner/nativeUpgradeData'
import { nearlyFinishedPayloadName, parseNearlyFinishedDataset } from './nearlyFinished.logic'

export async function loadNearlyFinishedRecipes() {
  if (await hasDatasetFile('nearly-finished/enchantment-names.json')) return loadNativeNearlyFinished()
  return parseNearlyFinishedDataset(await loadManualPayload<unknown>(nearlyFinishedPayloadName))
}
