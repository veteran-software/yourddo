export interface NavDropdownType {
  label: string
  image?: string
  active: boolean
}

export interface NavMenuDropdown {
  id: string
  title: string
  items: NavDropdownType[]
}
