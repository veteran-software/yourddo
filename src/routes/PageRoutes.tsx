import { Route, Routes } from 'react-router-dom'
import BaseLayout from '../components/layout/BaseLayout.tsx'
// import CannithCrafting from '../pages/cannithCrafting/CannithCrafting.tsx'
import CauldronOfCadence from '../pages/cauldronOfCadence/CauldronOfCadence.tsx'
import DinosaurBone from '../pages/dinosaurBoneCrafting/DinosaurBone.tsx'
import HeroicGreenSteel from '../pages/greenSteel/heroic/HeroicGreenSteel.tsx'
import LegendaryGreenSteel from '../pages/greenSteel/legendary/LegendaryGreenSteel.tsx'
import Home from '../pages/Home.tsx'
import IncrediblePotential from '../pages/incrediblePotential/IncrediblePotential.tsx'
import ViktraniumExperimentHeroic from '../pages/viktraniumExperiment/heroic/ViktraniumExperimentHeroic.tsx'

const PageRoutes = () => {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path='/' element={<Home />} />

        {/*<Route path='/cannith-crafting' element={<CannithCrafting />} />*/}
        <Route path='/cauldron-of-cadence' element={<CauldronOfCadence />} />
        <Route path='/dinosaur-bone' element={<DinosaurBone />} />
        <Route path='/green-steel' element={<HeroicGreenSteel />} />
        <Route path='/heroic-viktranium-experiment' element={<ViktraniumExperimentHeroic />} />
        <Route path='/incredible-potential' element={<IncrediblePotential />} />
        <Route path='/legendary-green-steel' element={<LegendaryGreenSteel />} />
      </Route>
    </Routes>
  )
}

export default PageRoutes
