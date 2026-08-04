import IconImage from '../../../shared/ui/IconImage.tsx'
import type { ClassifiedDinosaurBoneItem } from '../dinosaurBone.types.ts'

const ItemIcon = ({ item, size, alt = '' }: { item: ClassifiedDinosaurBoneItem; size: number; alt?: string }) => (
  <IconImage alt={alt} name={item.name} source={item.icon ?? item.image} size={size} />
)

export default ItemIcon
