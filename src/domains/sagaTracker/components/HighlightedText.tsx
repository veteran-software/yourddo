import { Fragment } from 'react'
import { getHighlightParts } from '../logic.ts'

const HighlightedText = ({ text, query }: { text: string; query: string }) => (
  <>
    {getHighlightParts(text, query).map((part, index) =>
      part.match ? (
        <mark key={`${index.toString()}-${part.text}`}>{part.text}</mark>
      ) : (
        <Fragment key={`${index.toString()}-${part.text}`}>{part.text}</Fragment>
      )
    )}
  </>
)

export default HighlightedText
