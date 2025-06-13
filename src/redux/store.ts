import { configureStore } from '@reduxjs/toolkit/react'

import appReducer from './slices/appSlice'
import greenSteelReducer from './slices/hgsSlice.ts'
import incrediblePotentialReducer from './slices/incrediblePotentialSlice'

const store = configureStore({
  reducer: {
    app: appReducer,
    greenSteel: greenSteelReducer,
    incrediblePotential: incrediblePotentialReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
