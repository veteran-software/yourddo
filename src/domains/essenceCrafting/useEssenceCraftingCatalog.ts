import { createCraftingCatalog } from '../../shared/layout/craftingSession'
import { loadEssenceCraftingData } from './data'

export const useEssenceCraftingCatalog = createCraftingCatalog(loadEssenceCraftingData)
