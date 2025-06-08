import { NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { titleCase } from 'title-case'
import { formatAsKebabCase, sortObjectArray } from '../../utils/objectUtils.ts'
import type { NavMenuDropdown } from './types.ts'

const MenuDropdown = (props: Props) => {
  const { menu } = props

  return (
    <NavDropdown title={menu.title} id={`${menu.id}-nav-dropdown`}>
      {sortObjectArray(menu.items, 'label').map((item) =>
        item.active ? (
          <NavDropdown.Item
            as={Link}
            key={formatAsKebabCase(item.label)}
            to={`/${formatAsKebabCase(item.label)}`}
          >
            {titleCase(item.label.toLowerCase())}
          </NavDropdown.Item>
        ) : null
      )}
    </NavDropdown>
  )
}

interface Props {
  menu: NavMenuDropdown
}

export default MenuDropdown
