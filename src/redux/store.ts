import { configureStore } from '@reduxjs/toolkit/react'
import { serverStatusApi } from '../api/serverStatusApi.ts'
import { serverStatusLamApi } from '../api/serverStatusLamApi.ts'

import appReducer from './slices/appSlice'
import cannithCraftingReducer from './slices/cannithCraftingSlice'
import greenSteelReducer from './slices/hgsSlice'
import incrediblePotentialReducer from './slices/incrediblePotentialSlice'
import legendaryGreenSteelReducer from './slices/lgsSlice'

const store = configureStore({
  reducer: {
    [serverStatusApi.reducerPath]: serverStatusApi.reducer,
    [serverStatusLamApi.reducerPath]: serverStatusLamApi.reducer,

    app: appReducer,
    cannithCrafting: cannithCraftingReducer,
    greenSteel: greenSteelReducer,
    incrediblePotential: incrediblePotentialReducer,
    legendaryGreenSteel: legendaryGreenSteelReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(serverStatusApi.middleware).concat(serverStatusLamApi.middleware)
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
