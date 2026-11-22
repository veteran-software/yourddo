import { IconFlask } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { loadDatasetFile } from '../../shared/data/loadDataset'
import styles from './AlchemicalItemArt.module.css'

type Icons = ReadonlyMap<number, string>
let pending: Promise<Icons> | undefined

function loadIcons() {
  pending ??= loadDatasetFile<{ id: number; pngBase64: string }[]>('alchemical/icons.json')
    .then((icons) => new Map(icons.map(({ id, pngBase64 }) => [id, 'data:image/png;base64,' + pngBase64])))
    .catch((error: unknown) => {
      pending = undefined
      throw error
    })
  return pending
}

export default function AlchemicalItemArt({ layers }: Readonly<{ layers?: readonly number[] }>) {
  const [icons, setIcons] = useState<Icons>()
  const hasLayers = Boolean(layers?.length)
  useEffect(() => {
    if (!hasLayers) return
    let active = true
    void loadIcons().then(
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
  }, [hasLayers])
  const images = layers?.map((id) => icons?.get(id))
  return (
    <span className={styles.art} aria-hidden>
      {images?.length && images.every((src): src is string => Boolean(src)) ? (
        images.map((src, index) => <img alt='' key={layers?.[index]} src={src} />)
      ) : (
        <IconFlask size={24} />
      )}
    </span>
  )
}
