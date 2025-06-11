import { configureStore } from '@reduxjs/toolkit/react'

import appReducer from './slices/appSlice'
import incrediblePotentialReducer from './slices/incrediblePotentialSlice'

const store = configureStore({
  reducer: {
    app: appReducer,
    incrediblePotential: incrediblePotentialReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
