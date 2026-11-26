import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { loadDatasetFile } from '../data/loadDataset'
import styles from './LayeredItemArt.module.css'

type Icons = ReadonlyMap<number, string>
const catalogs = new Map<string, Promise<Icons>>()

function loadIcons(domain: string) {
  const cached = catalogs.get(domain)
  if (cached) return cached
  const pending = loadDatasetFile<{ id: number; pngBase64: string }[]>(domain + '/icons.json')
    .then((icons) => new Map(icons.map(({ id, pngBase64 }) => [id, 'data:image/png;base64,' + pngBase64])))
    .catch((error: unknown) => {
      catalogs.delete(domain)
      throw error
    })
  catalogs.set(domain, pending)
  return pending
}

export default function LayeredItemArt({
  domain,
  layers,
  fallback,
  alt = '',
  size = 40
}: Readonly<{ domain: string; layers?: readonly number[]; fallback: ReactNode; alt?: string; size?: number }>) {
  const [icons, setIcons] = useState<Icons>()
  const hasLayers = Boolean(layers?.length)
  useEffect(() => {
    if (!hasLayers) return
    let active = true
    void loadIcons(domain).then(
      (result) => {
        if (active) setIcons(result)
      },
      () => {
        if (active) setIcons(undefined)
      }
    )
    return () => {
      active = false
    }
  }, [hasLayers, domain])
  const images = layers?.map((id) => icons?.get(id))
  return (
    <span
      className={styles.art}
      style={{ width: size, height: size }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={!alt}
    >
      {images?.length && images.every((src): src is string => Boolean(src))
        ? images.map((src, index) => <img alt='' key={String(index) + '-' + String(layers?.[index])} src={src} />)
        : fallback}
    </span>
  )
}
