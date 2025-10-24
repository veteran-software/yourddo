import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ItemRollup } from '../../components/trove/types.ts'
import { getStoredTroveData } from '../../utils/troveUtils.ts'

const initialState: AppState = {
  footerHeight: 0,
  headerHeight: 0,
  troveData: getStoredTroveData()
}

const { actions, reducer } = createSlice({
  initialState,
  name: 'app',
  reducers: {
    setFooterHeight: (state, action: PayloadAction<number>) => {
      state.footerHeight = action.payload
    },
    setHeaderHeight: (state, action: PayloadAction<number>) => {
      state.headerHeight = action.payload
    },
    setTroveData: (state, action: PayloadAction<ItemRollup | null>) => {
      state.troveData = action.payload
    }
  }
})

interface AppState {
  footerHeight: number
  headerHeight: number
  troveData: ItemRollup | null
}

export const { setFooterHeight, setHeaderHeight, setTroveData } = actions
export default reducer
