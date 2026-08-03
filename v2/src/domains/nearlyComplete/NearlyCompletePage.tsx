import {
  Alert,
  Badge,
  Center,
  Divider,
  Group,
  List,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import { getNearlyCompleteItems, loadNearlyCompleteItems, type NearlyCompleteDataset } from './data.ts'
import { getRecipeCategories, getRecipes, type RecipeTier } from './recipes.ts'

const NearlyCompletePage = () => {
  const [tier, setTier] = useState<RecipeTier>('Heroic')
  const [category, setCategory] = useState('Ability Score')
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [items, setItems] = useState<NearlyCompleteDataset | null>(null)
  const [itemsError, setItemsError] = useState<string | null>(null)

  const categories = useMemo(() => getRecipeCategories(tier), [tier])
  const recipes = useMemo(() => getRecipes(tier, category), [category, tier])
  const eligibleItems = useMemo(
    () => (items ? getNearlyCompleteItems(items, tier, category) : []),
    [category, items, tier]
  )
  const selectedRecipe = recipes.find((recipe) => recipe.name === selectedName)

  useEffect(() => {
    let active = true

    loadNearlyCompleteItems()
      .then((loadedItems) => {
        if (active) setItems(loadedItems)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setItemsError(cause instanceof Error ? cause.message : 'Unable to load eligible items')
      })

    return () => {
      active = false
    }
  }, [])

  const changeTier = (value: string | null) => {
    if (value !== 'Heroic' && value !== 'Legendary') return

    const nextCategories = getRecipeCategories(value)
    setTier(value)
    setCategory(nextCategories[0] ?? '')
    setSelectedName(null)
  }

  return (
    <ToolLayout>
      <Stack gap='xs'>
        <Title order={1}>Nearly Complete</Title>
        <Text c='dimmed'>
          Choose a Nearly Complete property and completed effect to view its Duergar Completion Forge recipe.
        </Text>
      </Stack>

      <Stack gap='md'>
        <Title order={2} size='h3'>
          Select a Recipe
        </Title>

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
            clearable
          />
        </SimpleGrid>
      </Stack>

      <Paper withBorder p={{ base: 'md', sm: 'xl' }} shadow='sm'>
        {selectedRecipe ? (
          <Stack gap='lg'>
            <Group justify='space-between' align='flex-start'>
              <Stack gap={4}>
                <Title order={2}>{selectedRecipe.name}</Title>
                <Text c='dimmed' size='sm'>
                  Crafted in: {selectedRecipe.craftedIn}
                </Text>
              </Stack>

              <Group gap='xs'>
                <Badge variant='light'>{tier}</Badge>
                <Badge variant='outline'>{category}</Badge>
              </Group>
            </Group>

            <Divider />

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'lg', md: 'xl' }}>
              <Stack gap='sm'>
                <Title order={3} size='h4'>
                  Recipe Requirements
                </Title>
                <List spacing='sm'>
                  {selectedRecipe.requirements.map((requirement) => (
                    <List.Item key={requirement.name}>
                      <Text component='span' size='sm'>
                        {requirement.name}
                      </Text>{' '}
                      <Badge variant='light' color='gray' size='sm'>
                        ×{requirement.quantity ?? 1}
                      </Badge>
                    </List.Item>
                  ))}
                </List>
              </Stack>

              <Stack gap='sm'>
                <Title order={3} size='h4'>
                  Resulting Effects
                </Title>
                <List spacing='sm'>
                  {selectedRecipe.effectsAdded.map((effect) => (
                    <List.Item key={`${effect.name}-${effect.modifier ?? ''}-${effect.bonus ?? ''}`}>
                      <Text component='span' size='sm'>
                        {effect.name}
                      </Text>{' '}
                      <Badge variant='light' size='sm'>
                        {effect.modifier != null ? `+${effect.modifier}` : '—'}
                      </Badge>{' '}
                      {effect.bonus && (
                        <Badge variant='outline' color='gray' size='sm'>
                          {effect.bonus}
                        </Badge>
                      )}
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </SimpleGrid>
          </Stack>
        ) : (
          <Stack gap='xs'>
            <Title order={2} size='h3'>
              Select a completed property
            </Title>
            <Text c='dimmed'>The recipe requirements and resulting effects will appear here.</Text>
          </Stack>
        )}
      </Paper>

      <Divider />

      <Stack gap='sm'>
        <Title order={2} size='h3'>
          Eligible Items
        </Title>
        <Text c='dimmed' size='sm'>
          Items matching the selected tier and Nearly Complete property.
        </Text>

        {itemsError ? (
          <Alert color='red' title='Unable to load eligible items'>
            {itemsError}
          </Alert>
        ) : items === null ? (
          <Center py='md'>
            <Loader size='sm' />
          </Center>
        ) : eligibleItems.length === 0 ? (
          <Text c='dimmed' size='sm'>
            No matching items found.
          </Text>
        ) : (
          <List spacing='xs' size='sm'>
            {eligibleItems.map((item) => (
              <List.Item key={`${item.pageTitle}-${item.minLevel}`}>
                {item.name} — {item.type}, minimum level {item.minLevel}
              </List.Item>
            ))}
          </List>
        )}
      </Stack>
    </ToolLayout>
  )
}

export default NearlyCompletePage
