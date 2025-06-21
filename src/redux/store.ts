import { configureStore } from '@reduxjs/toolkit/react'
import { serverStatusApi } from '../api/serverStatusApi.ts'

import appReducer from './slices/appSlice'
import greenSteelReducer from './slices/hgsSlice.ts'
import incrediblePotentialReducer from './slices/incrediblePotentialSlice'

const store = configureStore({
  reducer: {
    [serverStatusApi.reducerPath]: serverStatusApi.reducer,

    app: appReducer,
    greenSteel: greenSteelReducer,
    incrediblePotential: incrediblePotentialReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(serverStatusApi.middleware)
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
