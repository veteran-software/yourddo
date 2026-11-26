import type { ItemArt } from './itemArt'
import LayeredItemArt from './LayeredItemArt'
import IconImage from '../ui/IconImage.tsx'

export interface ItemIconSource {
  name: string
  art?: ItemArt
  icon?: string
  image?: string
}

const ItemIcon = ({ item, size, alt = '' }: { item: ItemIconSource; size: number; alt?: string }) => {
  const fallback = <IconImage alt={alt} name={item.name} source={item.icon ?? item.image} size={size} />
  return item.art ? (
    <LayeredItemArt key={item.art.domain} {...item.art} alt={alt} size={size} fallback={fallback} />
  ) : (
    fallback
  )
}

export default ItemIcon
