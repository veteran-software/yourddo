import { NavLink, Stack } from '@mantine/core'
import { useEffect, useReducer } from 'react'
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom'
import { homeNavigationItem, navigation, type NavigationGroup } from './navigation'

interface SidebarNavigationProps {
  onNavigate: () => void
}

const groupContainsPath = (group: NavigationGroup, pathname: string) =>
  group.items.some((item) => item.path === pathname)

const sortItemsByLabel = (group: NavigationGroup) =>
  [...group.items].sort((first, second) => first.label.localeCompare(second.label))

type ExpandedGroupsAction =
  { type: 'set'; groupLabel: string; opened: boolean } | { type: 'expand'; groupLabel: string }

const expandedGroupsReducer = (groups: Record<string, boolean>, action: ExpandedGroupsAction) => {
  if (action.type === 'set') {
    return { ...groups, [action.groupLabel]: action.opened }
  }

  return groups[action.groupLabel] ? groups : { ...groups, [action.groupLabel]: true }
}

const SidebarNavigation = ({ onNavigate }: SidebarNavigationProps) => {
  const { pathname } = useLocation()
  const [expandedGroups, dispatchExpandedGroups] = useReducer(expandedGroupsReducer, pathname, (initialPathname) =>
    Object.fromEntries(navigation.map((group) => [group.label, groupContainsPath(group, initialPathname)]))
  )

  useEffect(() => {
    const activeGroup = navigation.find((group) => groupContainsPath(group, pathname))

    if (activeGroup) {
      dispatchExpandedGroups({ type: 'expand', groupLabel: activeGroup.label })
    }
  }, [pathname])

  return (
    <Stack gap='md'>
      <NavLink
        component={RouterNavLink}
        to={homeNavigationItem.path}
        label={homeNavigationItem.label}
        leftSection={<homeNavigationItem.icon size={20} stroke={1.75} />}
        active={pathname === homeNavigationItem.path}
        onClick={onNavigate}
      />

      {navigation.map((group) => {
        const GroupIcon = group.icon

        return (
          <Stack key={group.label} gap={4}>
            <NavLink
              component='button'
              type='button'
              label={group.label}
              leftSection={<GroupIcon size={20} stroke={1.75} />}
              opened={expandedGroups[group.label]}
              onChange={(opened) => {
                dispatchExpandedGroups({ type: 'set', groupLabel: group.label, opened })
              }}
              aria-expanded={expandedGroups[group.label]}
            >
              {sortItemsByLabel(group).map((item) => (
                <NavLink
                  key={item.path}
                  component={RouterNavLink}
                  to={item.path}
                  label={item.label}
                  active={pathname === item.path}
                  onClick={onNavigate}
                />
              ))}
            </NavLink>
          </Stack>
        )
      })}
    </Stack>
  )
}

export default SidebarNavigation
