import { Button, Menu, useMantineColorScheme } from '@mantine/core'

const ThemeMenu = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  const label = colorScheme === 'auto' ? 'System' : colorScheme === 'dark' ? 'Dark' : 'Light'

  return (
    <Menu position='bottom-end'>
      <Menu.Target>
        <Button variant='subtle' size='compact-sm'>
          Theme: {label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            setColorScheme('light')
          }}
        >
          Light
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            setColorScheme('dark')
          }}
        >
          Dark
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            setColorScheme('auto')
          }}
        >
          System
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default ThemeMenu
