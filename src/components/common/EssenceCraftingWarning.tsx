import { FaTriangleExclamation } from 'react-icons/fa6'

const ESSENCE_CRAFTING_WARNING_RELEASE = new Date('2026-07-22T00:00:00-04:00').getTime()

const shouldShowEssenceCraftingWarning = () => {
  return Date.now() >= ESSENCE_CRAFTING_WARNING_RELEASE
}

const EssenceCraftingWarning = (props: Props) => {
  const { className = '' } = props

  if (!shouldShowEssenceCraftingWarning()) {
    return null
  }

  return (
    <div
      role='alert'
      className={`d-flex align-items-start gap-2 rounded border border-warning-subtle bg-warning-subtle text-warning-emphasis px-2 py-1 small ${className}`}
    >
      <FaTriangleExclamation className='mt-1 flex-shrink-0' size={12} />
      <span className='text-center'>
        Essence Crafting is changing with Update 81. Treat the current planner data as legacy after U81 releases. This
        banner will be removed when everything is updated.
      </span>
    </div>
  )
}

interface Props {
  className?: string
}

export default EssenceCraftingWarning
