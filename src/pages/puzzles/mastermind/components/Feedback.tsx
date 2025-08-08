const Feedback = (props: Props) => {
  const { black, white } = props

  const total = 4
  const grey: number = total - black - white
  const dots: ('black' | 'white' | 'grey')[] = [
    ...(Array(black).fill('black') as 'black'[]),
    ...(Array(white).fill('white') as 'white'[]),
    ...(Array(grey).fill('grey') as 'grey'[])
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 14px)',
        gridTemplateRows: 'repeat(2, 14px)',
        gap: 4,
        marginLeft: 8
      }}
    >
      {dots.map((col: 'black' | 'white' | 'grey', idx: number) => (
        <div
          key={idx}
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: col,
            border: '1px solid #333'
          }}
        />
      ))}
    </div>
  )
}

interface Props {
  black: number
  white: number
}

export default Feedback
