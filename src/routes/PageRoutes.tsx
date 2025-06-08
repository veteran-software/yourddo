import { Route, Routes } from 'react-router-dom'
import BaseLayout from '../components/layout/BaseLayout.tsx'
import Home from '../pages/Home.tsx'
import IncrediblePotential from '../pages/incrediblePotential/IncrediblePotential.tsx'

const PageRoutes = () => {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path='/' element={<Home />} />
        <Route path='/incredible-potential' element={<IncrediblePotential />} />
      </Route>
    </Routes>
  )
}

export default PageRoutes
