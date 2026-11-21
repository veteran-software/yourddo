import { useMemo, useState } from 'react'
import { Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap'
import { type NearlyCompleteRecipe, nearlyCompleteRecipes } from '../gearPlanner/nearlyComplete'

type RecipeTier = 'Heroic' | 'Legendary'

const getCategory = (recipe: NearlyCompleteRecipe): string =>
  recipe.effectsRemoved[0].name.replace('Nearly Complete: ', '')

const getTier = (recipe: NearlyCompleteRecipe): RecipeTier =>
  recipe.requirements?.[0]?.name.startsWith('Legendary ') ? 'Legendary' : 'Heroic'

const NearlyComplete = () => {
  const [tier, setTier] = useState<RecipeTier>('Heroic')
  const [category, setCategory] = useState('Ability Score')
  const [selectedName, setSelectedName] = useState('')

  const categories = useMemo(
    () =>
      [...new Set(nearlyCompleteRecipes.filter((recipe) => getTier(recipe) === tier).map(getCategory))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [tier]
  )

  const recipes = useMemo(
    () =>
      nearlyCompleteRecipes
        .filter((recipe) => getTier(recipe) === tier && getCategory(recipe) === category)
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    [category, tier]
  )

  const selectedRecipe = recipes.find((recipe) => recipe.name === selectedName)

  const changeTier = (nextTier: RecipeTier) => {
    const nextCategories = [
      ...new Set(nearlyCompleteRecipes.filter((recipe) => getTier(recipe) === nextTier).map(getCategory))
    ].sort((a, b) => a.localeCompare(b))
    setTier(nextTier)
    setCategory(nextCategories[0] ?? '')
    setSelectedName('')
  }

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='text-center'>
          <Card.Title>
            <h1 className='mb-0 h4'>Nearly Complete</h1>
          </Card.Title>
          <Card.Subtitle className='text-muted'>Duergar Completion Forge recipes</Card.Subtitle>
        </Card.Header>

        <Card.Body>
          <Row className='g-3 mb-3'>
            <Col xs={12} md={4}>
              <Form.Label>Item Tier</Form.Label>
              <Form.Select
                value={tier}
                onChange={(event) => {
                  changeTier(event.target.value as RecipeTier)
                }}
              >
                <option value='Heroic'>Heroic</option>
                <option value='Legendary'>Legendary</option>
              </Form.Select>
            </Col>

            <Col xs={12} md={4}>
              <Form.Label>Nearly Complete Property</Form.Label>
              <Form.Select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value)
                  setSelectedName('')
                }}
              >
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} md={4}>
              <Form.Label>Completed Property</Form.Label>
              <Form.Select
                value={selectedName}
                onChange={(event) => {
                  setSelectedName(event.target.value)
                }}
              >
                <option value=''>Select a property…</option>
                {recipes.map((recipe) => (
                  <option key={recipe.name} value={recipe.name}>
                    {recipe.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {selectedRecipe && (
            <Row className='g-3'>
              <Col xs={12} lg={6}>
                <ListGroup>
                  <ListGroup.Item className='bg-secondary-subtle fw-bold'>Resulting Effects</ListGroup.Item>
                  {selectedRecipe.effectsAdded.map((effect) => (
                    <ListGroup.Item key={`${effect.name}-${String(effect.modifier)}`}>
                      {effect.name}
                      {effect.modifier != null ? ` +${String(effect.modifier)}` : ''}
                      {effect.bonus ? ` (${String(effect.bonus)})` : ''}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>

              <Col xs={12} lg={6}>
                <ListGroup>
                  <ListGroup.Item className='bg-secondary-subtle fw-bold'>Recipe Requirements</ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Crafted in:</strong> {selectedRecipe.craftedIn}
                  </ListGroup.Item>
                  {selectedRecipe.requirements?.map((requirement) => (
                    <ListGroup.Item key={requirement.name} className='d-flex justify-content-between gap-3'>
                      <span>{requirement.name}</span>
                      <span>× {String(requirement.quantity ?? 1)}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default NearlyComplete
