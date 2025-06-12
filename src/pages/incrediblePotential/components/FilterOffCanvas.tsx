import { useState } from 'react'
import { Button, Offcanvas } from 'react-bootstrap'
import { FaFilter } from 'react-icons/fa6'
import FilterSection from '../../../components/filters/FilterSection.tsx'
import { filtersText } from '../../../utils/strings.ts'

const FilterOffCanvas = <T,>(props: Props<T>) => {
  const {
    filterMode,
    filterOptions,
    getItemFilters,
    items,
    selectedFilters,
    setSelectedFilters
  } = props

  const [show, setShow] = useState(false)

  return (
    <>
      <Button
        className='d-flex align-items-center rounded-5 p-2'
        variant='info'
        onClick={() => {
          setShow(true)
        }}
      >
        <FaFilter />
      </Button>

      <Offcanvas
        placement='start'
        show={show}
        onHide={() => {
          setShow(false)
        }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{filtersText}</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <FilterSection
            filterMode={filterMode}
            filterOptions={filterOptions}
            items={items}
            getItemFilters={getItemFilters}
            maxFilterColumns={1}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

interface Props<T> {
  filterMode: 'AND' | 'OR'
  filterOptions: string[]
  items: T[]
  selectedFilters: string[]
  setSelectedFilters: (selectedFilters: string[]) => void
  getItemFilters: (item: T) => string[]
}

export default FilterOffCanvas
