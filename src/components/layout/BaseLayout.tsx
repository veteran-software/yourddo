import { Container } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import NavbarTop from '../navbar/NavbarTop.tsx'

const BaseLayout = () => {
  return (
    <Container fluid='lg' className='px-0 user-select-none'>
      <NavbarTop />

      <Outlet />

      {/* Footer here */}

      {/* Global modals here */}
    </Container>
  )
}

export default BaseLayout
