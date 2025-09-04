import { configureStore } from '@reduxjs/toolkit/react'
import { serverStatusApi } from '../api/serverStatusApi.ts'
import { serverStatusLamApi } from '../api/serverStatusLamApi.ts'

import appReducer from './slices/appSlice'
import dinosaurBoneReducer from './slices/dinosaurBoneSlice'
import greenSteelReducer from './slices/hgsSlice.ts'
import incrediblePotentialReducer from './slices/incrediblePotentialSlice'
import legendaryGreenSteelReducer from './slices/lgsSlice.ts'
import viktraniumExperimentReducer from './slices/viktraniumSlice.ts'

const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: {
    [serverStatusApi.reducerPath]: serverStatusApi.reducer,
    [serverStatusLamApi.reducerPath]: serverStatusLamApi.reducer,

    app: appReducer,
    dinosaurBone: dinosaurBoneReducer,
    greenSteel: greenSteelReducer,
    incrediblePotential: incrediblePotentialReducer,
    legendaryGreenSteel: legendaryGreenSteelReducer,
    viktraniumExperiment: viktraniumExperimentReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(serverStatusApi.middleware).concat(serverStatusLamApi.middleware)
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
