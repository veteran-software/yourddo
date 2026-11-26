export interface ItemArt {
  domain: string
  layers: number[]
}

export function baseItemArt(domain: string, item: Record<string, unknown>): ItemArt | undefined {
  const layers = Array.isArray(item.iconLayers)
    ? item.iconLayers
        .filter(
          (layer: unknown): layer is { order: number; iconId: number } =>
            !!layer &&
            typeof layer === 'object' &&
            'order' in layer &&
            'iconId' in layer &&
            Number.isSafeInteger(layer.order) &&
            Number.isSafeInteger(layer.iconId)
        )
        .sort((a, b) => a.order - b.order)
        .map((layer) => layer.iconId)
    : []
  if (!layers.length && typeof item.iconId === 'number') layers.push(item.iconId)
  return layers.length ? { domain, layers } : undefined
}
