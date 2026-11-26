import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
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

function IconLayers({
  images,
  layers,
  alt,
  fallback
}: Readonly<{ images: readonly string[]; layers: readonly number[]; alt: string; fallback: ReactNode }>) {
  const stack = useRef<HTMLSpanElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  useEffect(() => {
    let active = true
    const elements = Array.from(stack.current?.querySelectorAll('img') ?? [])
    void Promise.all(elements.map((layer) => layer.decode())).then(
      () => {
        if (active) setStatus('ready')
      },
      () => {
        if (active) setStatus('failed')
      }
    )
    return () => {
      active = false
    }
  }, [])

  if (status === 'failed') return fallback
  return (
    <span ref={stack} className={styles.layers} style={{ visibility: status === 'ready' ? 'visible' : 'hidden' }}>
      {images.map((src, index) => (
        <img alt={index === 0 ? alt : ''} key={String(index) + '-' + String(layers[index])} src={src} />
      ))}
    </span>
  )
}

export default function LayeredItemArt({
  domain,
  layers,
  fallback,
  alt = '',
  size = 40
}: Readonly<{ domain: string; layers?: readonly number[]; fallback: ReactNode; alt?: string; size?: number }>) {
  const [catalog, setCatalog] = useState<{ domain: string; icons: Icons | null }>()
  const hasLayers = Boolean(layers?.length)
  useEffect(() => {
    if (!hasLayers) return
    let active = true
    void loadIcons(domain).then(
      (result) => {
        if (active) setCatalog({ domain, icons: result })
      },
      () => {
        if (active) setCatalog({ domain, icons: null })
      }
    )
    return () => {
      active = false
    }
  }, [hasLayers, domain])
  const icons = catalog?.domain === domain ? catalog?.icons : undefined
  const images = layers?.map((id) => icons?.get(id))
  const loading = hasLayers && icons === undefined
  return (
    <span className={styles.art} style={{ width: size, height: size }} aria-hidden={!alt}>
      {layers && images?.length && images.every((src): src is string => Boolean(src)) ? (
        <IconLayers
          key={domain + ':' + layers.join(',')}
          layers={layers}
          images={images}
          alt={alt}
          fallback={fallback}
        />
      ) : (
        !loading && fallback
      )}
    </span>
  )
}
