import { configureStore } from '@reduxjs/toolkit/react'

import appReducer from './slices/appSlice'

const store = configureStore({
  reducer: {
    app: appReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
