export const createViktraniumTestPayload = () => ({
  schemaVersion: 1,
  items: [
    {
      id: 'item-heroic-crafted',
      name: 'Cruel Baton',
      pageTitle: 'Cruel Baton',
      type: 'Club',
      minimumLevel: '8',
      enchantments: [{ name: 'Vampirism', modifier: '1d2' }],
      slots: [
        { id: 'slot-red', augmentType: 'Red', label: 'Red', order: 1 },
        { id: 'slot-sun', augmentType: 'Sun', label: 'Sun', order: 0 }
      ],
      recipes: [
        {
          id: 'recipe-heroic',
          deviceId: '1',
          device: 'Heroic Viktranium Experiment Crafting',
          requirements: [
            {
              ingredientId: 'ingredient-a',
              name: 'Bleak A',
              quantity: 2,
              requirements: [{ ingredientId: 'ingredient-b', name: 'Bleak B', quantity: 3 }]
            }
          ]
        }
      ]
    },
    {
      id: 'item-heroic-quest',
      name: 'Quest Boots',
      pageTitle: 'Quest Boots',
      type: 'Boots',
      minimumLevel: '8',
      enchantments: [{ name: 'Speed' }],
      slots: [{ id: 'slot-blue', augmentType: 'Blue', label: 'Blue', order: 0 }]
    },
    {
      id: 'item-legendary-crafted',
      name: "Legendary Warden's Hand Turret",
      pageTitle: "Legendary Warden's Hand Turret",
      type: 'Great Crossbow',
      minimumLevel: '34',
      slots: [{ id: 'slot-orange', augmentType: 'Orange', label: 'Orange', order: 0 }],
      recipes: [
        { id: 'recipe-legendary', deviceId: '2', device: 'Legendary Viktranium Experiment Crafting', requirements: [] }
      ]
    },
    {
      id: 'item-legendary-quest',
      name: 'Legendary Quest Ring',
      pageTitle: 'Legendary Quest Ring',
      type: 'Ring',
      minimumLevel: '34',
      slots: [{ id: 'slot-moon', augmentType: 'Moon', label: 'Moon', order: 0 }]
    },
    {
      id: 'item-wicked',
      name: 'Legendary Cataclysmic Club',
      pageTitle: 'Legendary Cataclysmic Club',
      type: 'Club',
      minimumLevel: '34',
      slots: [{ id: 'slot-lamordia', augmentType: 'Lamordia: Dolorous (Weapon)', label: 'Dolorous Weapon', order: 0 }],
      recipes: [
        { id: 'recipe-wicked', deviceId: '3', device: 'Wicked Viktranium Experiment Crafting', requirements: [] }
      ]
    }
  ],
  augments: [
    {
      id: 'augment-red',
      name: 'Duplicate Name',
      augmentType: 'Red',
      minimumLevel: 12,
      effects: [{ name: 'Fire Damage' }]
    },
    {
      id: 'augment-colorless',
      name: 'Duplicate Name',
      augmentType: 'Colorless',
      minimumLevel: 4,
      effects: [{ name: 'Accuracy' }]
    },
    {
      id: 'augment-sun',
      name: 'Solar Test',
      augmentType: 'Sun',
      minimumLevel: 30,
      effects: [{ name: 'Solar Effect' }]
    },
    { id: 'augment-blue', name: 'Blue Test', augmentType: 'Blue', minimumLevel: 8, effects: [] },
    { id: 'augment-orange', name: 'Orange Test', augmentType: 'Orange', minimumLevel: 30, effects: [] },
    { id: 'augment-moon', name: 'Moon Test', augmentType: 'Moon', minimumLevel: 30, effects: [] },
    {
      id: 'augment-lamordia',
      name: 'Dolorous Test',
      augmentType: 'Lamordia: Dolorous (Weapon)',
      minimumLevel: 34,
      effects: []
    }
  ],
  ingredients: [
    { id: 'ingredient-a', name: 'Bleak A', foundIn: ['Quest A'], image: 'bleakA' },
    { id: 'ingredient-b', name: 'Bleak B', foundIn: ['Quest B'] }
  ]
})
