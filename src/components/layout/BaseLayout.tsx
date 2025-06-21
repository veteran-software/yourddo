import { useEffect, useState } from 'react'
import { Alert, Container, Stack } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import Footer from '../footer/Footer.tsx'
import NavbarTop from '../navbar/NavbarTop.tsx'

const BaseLayout = () => {
  const [subdomain, setSubdomain] = useState('')

  useEffect(() => {
    const fullHostname = window.location.hostname
    const hostnameParts = fullHostname.split('.')

    if (hostnameParts.length > 2) {
      setSubdomain(hostnameParts[0])
    } else if (hostnameParts.length === 2 && hostnameParts[0] !== 'www') {
      setSubdomain(hostnameParts[0])
    } else {
      setSubdomain('No subdomain')
    }
  }, [])

  return (
    <Stack
      direction='vertical'
      gap={1}
      className='px-0 user-select-none h-100 w-100 justify-content-between overflow-hidden'
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--bs-primary) transparent' }}
    >
      <NavbarTop />

      {subdomain !== 'No subdomain' && subdomain === 'develop' && (
        <Alert key='develop-alert' variant='warning' className='text-center mb-2'>
          You are visiting the development version of YourDDO. The stability and accuracy of the tools available here
          are not guaranteed. This site version is intended for development testing and early previews for user
          feedback.
          <br />
          <strong className='text-uppercase'>Use site version for actual crafting reference at your own risk!</strong>
        </Alert>
      )}

      <Container className='w-100 h-100 overflow-y-auto d-flex flex-column justify-content-start'>
        <Outlet />
      </Container>

      <Footer />

      {/* Global modals here */}
    </Stack>
  )
}

export default BaseLayout
