import { Route, Routes } from 'react-router-dom'
import HomePage from '../domains/home/HomePage.tsx'
import NearlyCompletePage from '../domains/nearlyComplete/NearlyCompletePage.tsx'
import NotFoundPage from '../shared/ui/NotFoundPage.tsx'
import AppLayout from './AppLayout'

const AppRouter = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path='/' element={<HomePage />} />
      <Route path='/nearly-complete' element={<NearlyCompletePage />} />
      <Route path='*' element={<NotFoundPage />} />
    </Route>
  </Routes>
)

export default AppRouter
