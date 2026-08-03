import { Navigate, Route, Routes } from 'react-router-dom'
import CauldronOfCadencePage from '../domains/cauldronOfCadence/CauldronOfCadencePage.tsx'
import HomePage from '../domains/home/HomePage.tsx'
import MastermindPage from '../domains/mastermind/MastermindPage.tsx'
import NearlyCompletePage from '../domains/nearlyComplete/NearlyCompletePage.tsx'
import NotFoundPage from '../shared/ui/NotFoundPage.tsx'
import AppLayout from './AppLayout'

const AppRouter = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path='/' element={<HomePage />} />
      <Route path='/cauldron-of-cadence' element={<CauldronOfCadencePage />} />
      <Route path='/nearly-complete' element={<NearlyCompletePage />} />
      <Route path='/reavers-fate' element={<MastermindPage />} />
      <Route path='/the-key-to-the-mythal' element={<Navigate to='/reavers-fate' replace />} />
      <Route path='*' element={<NotFoundPage />} />
    </Route>
  </Routes>
)

export default AppRouter
