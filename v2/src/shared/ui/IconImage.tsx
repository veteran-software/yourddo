import { Image } from '@mantine/core'

const iconBaseUrl = 'https://yourddo.s3.us-east-2.amazonaws.com/icons/'
const unknownIconUrl = `${iconBaseUrl}unknown.png`

const toIconName = (value: string): string =>
  value
    .replace(/\.png$/i, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_match, character: string) => character.toUpperCase())
    .replace(/^./, (character) => character.toLowerCase())

interface IconImageProps {
  alt: string
  name: string
  source?: string
  size?: number
}

const IconImage = ({ alt, name, source, size = 56 }: IconImageProps) => {
  const iconName = toIconName(source ?? name)

  return (
    <Image
      src={`${iconBaseUrl}${iconName}.png`}
      fallbackSrc={unknownIconUrl}
      alt={alt}
      w={size}
      h={size}
      fit='contain'
    />
  )
}

export default IconImage
