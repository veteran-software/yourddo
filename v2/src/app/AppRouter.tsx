import { Navigate, Route, Routes } from 'react-router-dom'
import CauldronOfCadencePage from '../domains/cauldronOfCadence/CauldronOfCadencePage.tsx'
import DinosaurBonePage from '../domains/dinosaurBone/DinosaurBonePage.tsx'
import EssenceCraftingPage from '../domains/essenceCrafting/EssenceCraftingPage.tsx'
import HomePage from '../domains/home/HomePage.tsx'
import IncrediblePotentialPage from '../domains/incrediblePotential/IncrediblePotentialPage.tsx'
import MastermindPage from '../domains/mastermind/MastermindPage.tsx'
import MonasteryOfTheScorpionPage from '../domains/monasteryOfTheScorpion/MonasteryOfTheScorpionPage.tsx'
import NearlyCompletePage from '../domains/nearlyComplete/NearlyCompletePage.tsx'
import NearlyFinishedPage from '../domains/nearlyFinished/NearlyFinishedPage.tsx'
import SagaTrackerPage from '../domains/sagaTracker/SagaTrackerPage.tsx'
import TotalChaosPage from '../domains/totalChaos/TotalChaosPage.tsx'
import ViktraniumPage from '../domains/viktranium/ViktraniumPage.tsx'
import NotFoundPage from '../shared/ui/NotFoundPage.tsx'
import AppLayout from './AppLayout'

const AppRouter = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path='/' element={<HomePage />} />
      <Route path='/cauldron-of-cadence' element={<CauldronOfCadencePage />} />
      <Route path='/dinosaur-bone' element={<DinosaurBonePage />} />
      <Route path='/essence-crafting' element={<EssenceCraftingPage />} />
      <Route path='/incredible-potential' element={<IncrediblePotentialPage />} />
      <Route path='/nearly-complete' element={<NearlyCompletePage />} />
      <Route path='/nearly-finished' element={<NearlyFinishedPage />} />
      <Route path='/reavers-fate' element={<MastermindPage />} />
      <Route path='/saga-tracker' element={<SagaTrackerPage />} />
      <Route path='/monastery-of-the-scorpion' element={<MonasteryOfTheScorpionPage />} />
      <Route path='/total-chaos' element={<TotalChaosPage />} />
      <Route path='/viktranium-experiment' element={<ViktraniumPage />} />
      <Route path='/the-key-to-the-mythal' element={<Navigate to='/reavers-fate' replace />} />
      <Route path='/toxic-treatment' element={<Navigate to='/monastery-of-the-scorpion' replace />} />
      <Route path='*' element={<NotFoundPage />} />
    </Route>
  </Routes>
)

export default AppRouter
