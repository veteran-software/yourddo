import { Card, Select, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core'
import { useMemo, useState } from 'react'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import { getRecipeCategories, getRecipes, type RecipeTier } from './recipes.ts'

const NearlyCompletePage = () => {
  const [tier, setTier] = useState<RecipeTier>('Heroic')
  const [category, setCategory] = useState('Ability Score')
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const categories = useMemo(() => getRecipeCategories(tier), [tier])
  const recipes = useMemo(() => getRecipes(tier, category), [category, tier])
  const selectedRecipe = recipes.find((recipe) => recipe.name === selectedName)

  const changeTier = (value: string | null) => {
    if (value !== 'Heroic' && value !== 'Legendary') return

    const nextCategories = getRecipeCategories(value)
    setTier(value)
    setCategory(nextCategories[0] ?? '')
    setSelectedName(null)
  }

  return (
    <ToolLayout>
      <Stack gap='xs' ta='center'>
        <Title order={1}>Nearly Complete</Title>
        <Text c='dimmed'>Duergar Completion Forge recipes</Text>
      </Stack>

      <Card withBorder padding='lg'>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
          <Select
            label='Item Tier'
            data={['Heroic', 'Legendary']}
            value={tier}
            onChange={changeTier}
            allowDeselect={false}
          />

          <Select
            label='Nearly Complete Property'
            data={categories}
            value={category}
            onChange={(value) => {
              setCategory(value ?? '')
              setSelectedName(null)
            }}
            allowDeselect={false}
          />

          <Select
            label='Completed Property'
            placeholder='Select a property…'
            data={recipes.map((recipe) => recipe.name)}
            value={selectedName}
            onChange={setSelectedName}
            searchable
          />
        </SimpleGrid>

        {selectedRecipe && (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing='md' mt='lg'>
            <Card withBorder padding='md'>
              <Stack gap='sm'>
                <Text fw={700}>Resulting Effects</Text>
                <Table.ScrollContainer minWidth={360}>
                  <Table striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Effect</Table.Th>
                        <Table.Th>Value</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {selectedRecipe.effectsAdded.map((effect) => (
                        <Table.Tr key={`${effect.name}-${effect.modifier ?? ''}-${effect.bonus ?? ''}`}>
                          <Table.Td>{effect.name}</Table.Td>
                          <Table.Td>
                            {effect.modifier ? `+${effect.modifier}` : '—'}
                            {effect.bonus ? ` (${effect.bonus})` : ''}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Stack>
            </Card>

            <Card withBorder padding='md'>
              <Stack gap='sm'>
                <div>
                  <Text fw={700}>Recipe Requirements</Text>
                  <Text size='sm' c='dimmed'>
                    Crafted in: {selectedRecipe.craftedIn}
                  </Text>
                </div>
                <Table.ScrollContainer minWidth={360}>
                  <Table striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Item</Table.Th>
                        <Table.Th>Quantity</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {selectedRecipe.requirements.map((requirement) => (
                        <Table.Tr key={requirement.name}>
                          <Table.Td>{requirement.name}</Table.Td>
                          <Table.Td>{requirement.quantity}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Stack>
            </Card>
          </SimpleGrid>
        )}
      </Card>
    </ToolLayout>
  )
}

export default NearlyCompletePage
