import { Card } from 'react-bootstrap'

const HowTo = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title className='m-0'>
          <h4 className='text-center m-0'>How to Use this Planner</h4>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <p>
          To use this planner, simply select your <strong>Minimum Level</strong> on the left and select the gear slot
          tab you wish to craft for.
        </p>
        <p>
          Select the enchantments you wish to add onto the item. Enchantments{' '}
          <span className='text-warning'>highlighted in yellow</span> are unique enchantments to that item in that
          affix.
        </p>
        <p>Click on the collectible to display farming information about that particular collectible.</p>
        <p>If you find any bugs, please report them using the GitHub link above.</p>
      </Card.Body>
      <Card.Footer>
        <p>
          Collectible farming information is credited to <code>dancing_hawktopus</code> original forum post. You can
          find that post{' '}
          <a href='https://forums.ddo.com/index.php?threads/collectable-farming.679/' target='_blank' rel='noreferrer'>
            here on the new forums
          </a>
          .
        </p>
      </Card.Footer>
    </Card>
  )
}

export default HowTo
