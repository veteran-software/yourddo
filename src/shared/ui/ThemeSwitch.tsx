import { VisuallyHidden, useMantineColorScheme } from '@mantine/core'
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'
import { Fragment, useId } from 'react'
import classes from './ThemeSwitch.module.css'

const themes = [
  { value: 'light', label: 'Light', Icon: IconSun },
  { value: 'dark', label: 'Dark', Icon: IconMoon },
  { value: 'auto', label: 'System', Icon: IconDeviceDesktop }
] as const

export default function ThemeSwitch() {
  const { colorScheme, setColorScheme } = useMantineColorScheme({ keepTransitions: true })
  const groupId = useId()
  const selectedIndex = themes.findIndex(({ value }) => value === colorScheme)

  return (
    <div role='radiogroup' aria-label='Theme' className={classes.root}>
      <span
        aria-hidden
        className={classes.indicator}
        style={{ transform: `translateX(${String(selectedIndex * 100)}%)` }}
      />
      {themes.map(({ value, label, Icon }) => (
        <Fragment key={value}>
          <input
            className={VisuallyHidden.classes.root}
            type='radio'
            id={`${groupId}-${value}`}
            name={groupId}
            value={value}
            checked={colorScheme === value}
            onChange={() => {
              setColorScheme(value)
            }}
          />
          <label htmlFor={`${groupId}-${value}`} className={classes.label}>
            <Icon size={18} stroke={1.75} aria-hidden />
            <VisuallyHidden>{label}</VisuallyHidden>
          </label>
        </Fragment>
      ))}
    </div>
  )
}
