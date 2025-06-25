import camelcase from 'camelcase'
import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../redux/hooks.ts'
import { formatIngredientName } from '../utils/utils.ts'

const useIngredientImage = (ingredientName: string) => {
  const { selectedFecundityItem } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const [imageSrc, setImageSrc] = useState<string>()

  useEffect(() => {
    void (async () => {
      if (ingredientName === '') {
        console.log(ingredientName, '|', selectedFecundityItem)
      }

      const formattedName: string = formatIngredientName(ingredientName, selectedFecundityItem)

      const image = (await import(`../assets/icons/${camelcase(formattedName)}.png`)) as {
        default: string
      }

      setImageSrc(image.default)
    })()
  }, [ingredientName, selectedFecundityItem])

  return { imageSrc }
}

export default useIngredientImage
