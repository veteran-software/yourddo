import { useEffect } from 'react'
import './App.scss'
import PageRoutes from './routes/PageRoutes.tsx'
import { getStoredTroveData } from './utils/troveUtils.ts'

const App = () => {
  const troveData = getStoredTroveData()

  useEffect(() => {
    if (troveData) {
      console.log('Trove Data:', troveData)
    }
  }, [troveData])

  return <PageRoutes />
}

export default App
