import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const initialState: AppState = {
  footerHeight: 0,
  headerHeight: 0
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
    }
  }
})

interface AppState {
  footerHeight: number
  headerHeight: number
}

export const { setFooterHeight, setHeaderHeight } = actions
export default reducer
