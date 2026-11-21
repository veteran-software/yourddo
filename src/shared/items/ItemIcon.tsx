import IconImage from '../ui/IconImage.tsx'

export interface ItemIconSource {
  name: string
  icon?: string
  image?: string
}

const ItemIcon = ({ item, size, alt = '' }: { item: ItemIconSource; size: number; alt?: string }) => (
  <IconImage alt={alt} name={item.name} source={item.icon ?? item.image} size={size} />
)

export default ItemIcon
