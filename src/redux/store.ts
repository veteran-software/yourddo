import { configureStore } from '@reduxjs/toolkit/react'
import { serverStatusApi } from '../api/serverStatusApi.ts'
import { serverStatusLamApi } from '../api/serverStatusLamApi.ts'

import appReducer from './slices/appSlice'
import greenSteelReducer from './slices/hgsSlice.ts'
import incrediblePotentialReducer from './slices/incrediblePotentialSlice'

const store = configureStore({
  reducer: {
    [serverStatusApi.reducerPath]: serverStatusApi.reducer,
    [serverStatusLamApi.reducerPath]: serverStatusLamApi.reducer,

    app: appReducer,
    greenSteel: greenSteelReducer,
    incrediblePotential: incrediblePotentialReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(serverStatusApi.middleware).concat(serverStatusLamApi.middleware)
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
