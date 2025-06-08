import kebabCase from 'kebab-case'
import { useLayoutEffect, useRef } from 'react'
import { Container, Image, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { titleCase } from 'title-case'
import { useAppDispatch } from '../../redux/hooks'
import { setHeaderHeight } from '../../redux/slices/appSlice'
import type { AppDispatch } from '../../redux/store'
import { removeWhitespace, sortObjectArray } from '../../utils/objectUtils.ts'
import { epicMenu } from './epicMenu.ts'
import { heroicMenu } from './heroicMenu'
import { legendaryMenu } from './legendaryMenu.ts'
import type { NavDropdownType, NavMenuDropdown } from './types'
import logo from '../../assets/logo.png'

const NavbarTop = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const navRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const box = navRef.current?.getBoundingClientRect()
    if (box?.height) {
      dispatch(setHeaderHeight(box.height))
    }
  }, [dispatch])

  return (
    <Navbar
      expand='lg'
      className='bg-primary mb-sm-1 mb-lg-2'
      sticky='top'
      ref={navRef}
    >
      <Container>
        <Navbar.Brand href='/' className='p-0'>
          <Image src={logo} height={45} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav className='me-auto w-100 justify-content-end'>
            {Array.of(heroicMenu, epicMenu, legendaryMenu).map(
              (menu: NavMenuDropdown, idx: number) => (
                <NavDropdown
                  title={menu.title}
                  id={`${menu.id}-nav-dropdown`}
                  key={`${menu.id}-${String(idx)}`}
                >
                  {sortObjectArray(menu.items, 'label').map(
                    (item: NavDropdownType) => {
                      if (item.active) {
                        return (
                          <NavDropdown.Item
                            as={Link}
                            key={`${menu.id}-menu-item-${kebabCase(
                              removeWhitespace(item.label),
                              false
                            )}`}
                            to={`/${kebabCase(
                              removeWhitespace(item.label),
                              false
                            )}`}
                          >
                            {titleCase(item.label.toLowerCase())}
                          </NavDropdown.Item>
                        )
                      }

                      return <></>
                    }
                  )}
                </NavDropdown>
              )
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavbarTop
