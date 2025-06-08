import { Container } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import NavbarTop from '../navbar/NavbarTop.tsx'

const BaseLayout = () => {
  return (
    <Container fluid className='px-0'>
      <NavbarTop />

      <Outlet />

      {/* Footer here */}

      {/* Global modals here */}
    </Container>
  )
}

export default BaseLayout
