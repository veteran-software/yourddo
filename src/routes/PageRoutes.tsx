import { Route, Routes } from 'react-router-dom'
import BaseLayout from '../components/layout/BaseLayout.tsx'
import HeroicGreenSteel from '../pages/heroicGreenSteel/HeroicGreenSteel.tsx'
import Home from '../pages/Home.tsx'
import IncrediblePotential from '../pages/incrediblePotential/IncrediblePotential.tsx'
import LegendaryGreenSteel from '../pages/legendaryGreenSteel/LegendaryGreenSteel.tsx'

const PageRoutes = () => {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path='/' element={<Home />} />
        <Route path='/green-steel' element={<HeroicGreenSteel />} />
        <Route path='/incredible-potential' element={<IncrediblePotential />} />
        <Route path='/legendary-green-steel' element={<LegendaryGreenSteel />} />
      </Route>
    </Routes>
  )
}

export default PageRoutes
