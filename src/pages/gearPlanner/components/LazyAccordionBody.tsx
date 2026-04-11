import { type ReactElement, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import type { GearItem } from '../types.ts'

const LazyAccordionBody = (props: Props): ReactElement | null => {
  const { items, renderItems } = props

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // Small delay to show spinner and avoid UI jank

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (isLoading) {
    return (
      <div className='text-center py-3 bg-dark'>
        <Spinner animation='border' variant='primary' size='sm' role='status'>
          <span className='visually-hidden'>Loading items...</span>
        </Spinner>
      </div>
    )
  }

  return renderItems(items, false)
}

interface Props {
  items: GearItem[]
  renderItems: (items: GearItem[], showCount: boolean) => ReactElement | null
}

export default LazyAccordionBody
