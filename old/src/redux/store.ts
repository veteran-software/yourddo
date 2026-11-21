import { configureStore } from '@reduxjs/toolkit'
import { serverStatusApi } from '../api/serverStatusApi.ts'
import { serverStatusLamApi } from '../api/serverStatusLamApi.ts'

import appReducer from './slices/appSlice'
import dinosaurBoneReducer from './slices/dinosaurBoneSlice'
import gearPlannerReducer, { GEAR_PLANNER_STORAGE_KEY } from './slices/gearPlannerSlice'
import greenSteelReducer from './slices/hgsSlice'
import incrediblePotentialReducer from './slices/incrediblePotentialSlice'
import legendaryGreenSteelReducer from './slices/lgsSlice'
import viktraniumExperimentReducer from './slices/viktraniumSlice'

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
    viktraniumExperiment: viktraniumExperimentReducer,
    gearPlanner: gearPlannerReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(serverStatusApi.middleware).concat(serverStatusLamApi.middleware)
})

store.subscribe(() => {
  if (typeof localStorage === 'undefined') {
    return
  }

  const state = store.getState()

  const persistSlices = [{ key: GEAR_PLANNER_STORAGE_KEY, data: state.gearPlanner }]

  persistSlices.forEach(({ key, data }) => {
    try {
      const serializedState = JSON.stringify(data)
      localStorage.setItem(key, serializedState)
    } catch (err) {
      console.error(`Could not save state for ${key}`, err)
    }
  })
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
