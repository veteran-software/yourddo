import activeTileImage from './tile_active.png'
import emptyTileImage from './tile_empty.png'
import inactiveTileImage from './tile_inactive.png'

const pressAppearance = {
  completed: {
    border: '2px solid var(--mantine-color-yellow-6)',
    recommendation: 'recommended solution press completed'
  },
  recommended: {
    border: '4px solid var(--mantine-color-green-6)',
    recommendation: 'recommended solution press not completed'
  },
  ordinary: {
    border: '1px solid var(--mantine-color-default-border)',
    recommendation: 'not a recommended solution press'
  }
} as const

function getPressAppearance(recommended: boolean, completed: boolean) {
  if (!recommended) return pressAppearance.ordinary
  return completed ? pressAppearance.completed : pressAppearance.recommended
}

export function getTileAppearance(masked: boolean, on: boolean, recommended: boolean, completed: boolean) {
  const { border, recommendation } = getPressAppearance(recommended, completed)
  const visibleImage = on ? activeTileImage : inactiveTileImage
  const image = masked ? emptyTileImage : visibleImage
  return {
    recommendation,
    tileStyle: {
      aspectRatio: '1 / 1',
      backgroundImage: `url(${image})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      border,
      position: 'relative' as const
    }
  }
}
