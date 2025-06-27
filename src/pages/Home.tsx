import { Container } from 'react-bootstrap'

const Home = () => {
  return (
    <Container>
      <h1 className='text-center'>YourDDO</h1>
      <h6 className='text-center'>I'm back!</h6>

      <hr />

      <p>
        Welcome to YourDDO, the dedicated online resource for Dungeons and Dragons Online players who want fast,
        reliable, and easy to use tools focused on crafting and character optimization. YourDDO was built from the
        ground up with one primary goal in mind: to make DDO crafting easier and more accessible for everyone, from new
        players just starting their first character to veterans fine tuning their end game gear.
      </p>
      <p>
        At the heart of YourDDO is a growing collection of crafting planners that cover every major crafting system in
        Dungeons and Dragons Online. Whether you are working on Cannith Crafting, Sentient Weapon leveling, Augment Slot
        planning, or any other system, YourDDO provides clear, intuitive tools that help you plan your projects and make
        the most of your in game resources. Our crafting planners are updated regularly to reflect the latest game
        patches and balance changes so you can trust that the information you are using is current and accurate.
      </p>
      <p>
        In addition to crafting tools, YourDDO includes real time server status displays on every page. This allows you
        to check the status of your favorite worlds at a glance without needing to leave the site or search for external
        links. Server availability is an important part of planning your game time, and we want that information to
        always be right at your fingertips.
      </p>
      <p>
        While crafting is our primary focus, YourDDO will continue to grow and expand to meet the needs of the DDO
        community. One of the major future additions will be a Monster Manual reference tool, giving players quick
        access to enemy stats, and locations to help with both questing and favor farming.
      </p>
      <p>
        YourDDO is proud to be an open source project. We welcome community involvement and encourage players and
        developers alike to report bugs, suggest improvements, and contribute code. Whether you want to help fix a typo,
        discuss crafting systems, or build entirely new features, you are invited to participate. You can find the
        project repository on{' '}
        <a href='https://github.com/veteran-software/yourddo' target='_blank' rel='noreferrer'>
          GitHub
        </a>
      </p>
      <p>
        Our goal is to eventually cover all crafting systems available in the game, including older or niche systems
        that other sites may overlook. We know that DDO crafting is complex and often confusing, and we are committed to
        providing tools that reduce frustration and help you get back to playing.
      </p>
      <p>
        YourDDO runs on a modern, fast, and mobile friendly web platform designed for quick load times and simple
        navigation whether you are at your computer or checking something from your phone during a game session.
      </p>
      <p>Explore our tools today and see how YourDDO can improve your DDO experience.</p>
    </Container>
  )
}

export default Home
