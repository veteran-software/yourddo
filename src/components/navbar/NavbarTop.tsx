import { useLayoutEffect, useMemo, useRef } from 'react'
import { Container, Image, Nav, Navbar } from 'react-bootstrap'
import logo from '../../assets/logo.png'
import { useAppDispatch } from '../../redux/hooks'
import { setHeaderHeight } from '../../redux/slices/appSlice'
import type { AppDispatch } from '../../redux/store'
import { epicMenu } from './epicMenu.ts'
import { heroicMenu } from './heroicMenu'
import { legendaryMenu } from './legendaryMenu.ts'
import MenuDropdown from './MenuDropdown.tsx'
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
    () => [heroicMenu, epicMenu, legendaryMenu].filter((menu) => menu.items.some((item) => item.active)),
    []
  )

  return (
    <Navbar expand='lg' className='bg-primary mb-sm-1 mb-lg-2 z-1' sticky='top' ref={navRef}>
      <Container>
        <Navbar.Brand href='/' className='p-0'>
          <Image src={logo} height={45} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav className='me-auto w-100 justify-content-end'>
            {activeMenus.map((menu: NavMenuDropdown) => (
              <MenuDropdown key={menu.title} menu={menu} />
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavbarTop
