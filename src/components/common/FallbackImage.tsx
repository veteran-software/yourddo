import { useState } from 'react'
import { Image } from 'react-bootstrap'
import { ICON_BASE } from '../../utils/constants.ts'

const FallbackImage = (props: Props) => {
  const { alt, src } = props

  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      title={alt}
      src={imgSrc}
      onError={() => {
        setImgSrc(`${ICON_BASE}unknown.png`)
      }}
      alt={alt}
    />
  )
}

interface Props {
  src: string
  alt: string
}

export default FallbackImage
