import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, AppState } from './store.ts'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<AppState>()
