import type { GreenSteelState } from '../slices/hgsSlice.ts'

export const resetPlanner = (state: GreenSteelState) => {
  state.selectedFecundityItem = undefined

  state.selectedInvasionItem = undefined

  state.selectedSubjugationItem = undefined
  state.selectedSubjugationSpell = undefined

  state.selectedDevastationBasic = undefined
  state.selectedDevastationFocused = undefined
}
