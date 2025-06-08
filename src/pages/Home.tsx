import { Container } from 'react-bootstrap'

const Home = () => {
  return (
    <Container>
      <h1 className='text-center'>YourDDO</h1>
      <h6 className='text-center'>I'm coming back!</h6>

      <hr />

      <p>
        Ague has been getting back into DDO over the past several months. Since
        his knowledge of web development has increased expoentially, he's
        decided to re-create YourDDO using modern web technologies.
      </p>
      <p>
        He's recreating all the previous tools one by one, and will be adding
        newer crafting systems as well as many of the older ones that previously
        we not in the old YourDDO.
      </p>
      <p>
        The first crafting systems that he will be adding are the Shroud focused
        ones (e.g. Incredible Potential, Heroic & Legendary Green Steel).
        Cannith Crafting will be added following those systems.
      </p>
      <p>
        Outside of the crafting systems mentioned, if there are any crafting
        systems that you want to see added earlier than others, ding him in the
        Community Discord server.
      </p>
    </Container>
  )
}

export default Home
