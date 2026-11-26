import { IconFlask } from '@tabler/icons-react'
import LayeredItemArt from '../../shared/items/LayeredItemArt'

export default function AlchemicalItemArt({ layers }: Readonly<{ layers?: readonly number[] }>) {
  return <LayeredItemArt domain='alchemical' layers={layers} fallback={<IconFlask size={24} />} />
}
