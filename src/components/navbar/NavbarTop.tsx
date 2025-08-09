import { useLayoutEffect, useMemo, useRef } from 'react'
import { Button, Container, Image, Nav, Navbar } from 'react-bootstrap'
import { FaGithub } from 'react-icons/fa6'
import logo from '../../assets/logo.png'
import { useAppDispatch } from '../../redux/hooks'
import { setHeaderHeight } from '../../redux/slices/appSlice'
import type { AppDispatch } from '../../redux/store'
import { epicMenu } from './epicMenu.ts'
import { heroicMenu } from './heroicMenu'
import { legendaryMenu } from './legendaryMenu.ts'
import MenuDropdown from './MenuDropdown.tsx'
import { puzzleMenu } from './puzzleMenu.ts'
import type { NavMenuDropdown } from './types'

const NavbarTop = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const navRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const box = navRef.current?.getBoundingClientRect()
    if (box?.height) {
      dispatch(setHeaderHeight(box.height))
    }
  }, [dispatch])

  const activeMenus = useMemo(
    () => [puzzleMenu, heroicMenu, epicMenu, legendaryMenu].filter((menu) => menu.items.some((item) => item.active)),
    []
  )

  return (
    <Navbar expand='lg' className='bg-primary mb-sm-1 mb-lg-2 z-1' sticky='top' ref={navRef}>
      <Container fluid>
        <Navbar.Brand href='/' className='p-0'>
          <Image src={logo} height={45} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav className='me-auto w-100 justify-content-end gap-3'>
            {activeMenus.map((menu: NavMenuDropdown) => (
              <MenuDropdown key={menu.title} menu={menu} />
            ))}
            <Nav.Link
              as={Button}
              href='https://github.com/veteran-software/yourddo'
              target='_blank'
              rel='noreferrer'
              title='YourDDO on GitHub'
            >
              <FaGithub size={25} />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavbarTop
