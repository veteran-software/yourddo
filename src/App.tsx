import { useEffect } from 'react'
import './App.scss'
import PageRoutes from './routes/PageRoutes.tsx'
import { getStoredTroveData } from './utils/troveUtils.ts'

const App = () => {
  const troveData = getStoredTroveData()

  useEffect(() => {
    // Perform any initialization logic here
  }, [troveData])

  return <PageRoutes />
}

export default App
