export const createEssenceCraftingTestPayload = () => ({
  schemaVersion: 1,
  itemCategories: [
    { id: 'weapon', displayName: 'Weapon' },
    { id: 'ring', displayName: 'Ring' },
    { id: 'helmet', displayName: 'Helmet' },
    { id: 'trinket', displayName: 'Trinket' },
    { id: 'armor', displayName: 'Armor' }
  ],
  augmentTypes: [
    { id: 'red', displayName: 'Red' },
    { id: 'colorless', displayName: 'Colorless' }
  ],
  bonusTypes: [{ id: 'bonus-enhancement', displayName: 'Enhancement' }],
  enhancements: [
    {
      id: 'enhancement-split-prefix',
      displayName: 'Split Prefix Test',
      minimumItemLevel: 1,
      placements: [
        { position: 'prefix', itemCategoryIds: ['weapon'] },
        { position: 'suffix', itemCategoryIds: ['ring'] }
      ],
      effects: [
        {
          id: 'effect-light',
          displayName: 'Light Spell Power',
          bonusTypeId: 'bonus-enhancement',
          modifier: {
            kind: 'by-item-level',
            unit: 'number',
            bands: [
              { minimumItemLevel: 1, maximumItemLevel: 1, value: 1 },
              { minimumItemLevel: 2, maximumItemLevel: 2, value: 2 }
            ]
          }
        },
        {
          id: 'effect-implement',
          displayName: 'Spellcasting Implement',
          modifier: { kind: 'fixed', unit: 'percent', value: 5 }
        }
      ],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-alpha-prefix',
      displayName: 'Alpha Prefix',
      minimumItemLevel: 1,
      placements: [{ position: 'prefix', itemCategoryIds: ['weapon'] }],
      effects: [{ id: 'effect-alpha-prefix', displayName: 'Alpha Prefix Effect' }],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-zebra-prefix',
      displayName: 'Zebra Prefix',
      minimumItemLevel: 1,
      placements: [{ position: 'prefix', itemCategoryIds: ['weapon'] }],
      effects: [{ id: 'effect-zebra-prefix', displayName: 'Zebra Prefix Effect' }],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-level-two-suffix',
      displayName: 'Level Two Suffix',
      minimumItemLevel: 2,
      placements: [{ position: 'suffix', itemCategoryIds: ['weapon'] }],
      effects: [{ id: 'effect-level-two-suffix', displayName: 'Level Two Suffix Effect' }],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-ring-extra',
      displayName: 'Ring Extra',
      minimumItemLevel: 1,
      placements: [{ position: 'extra', itemCategoryIds: ['ring'] }],
      effects: [{ id: 'effect-ring-extra', displayName: 'Ring Extra Effect' }],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-headgear-extra',
      displayName: 'Headgear Extra',
      minimumItemLevel: 1,
      placements: [{ position: 'extra', itemCategoryIds: ['helmet'] }],
      effects: [{ id: 'effect-headgear-extra', displayName: 'Headgear Extra Effect' }],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-trinket-extra',
      displayName: 'Trinket Extra',
      minimumItemLevel: 1,
      placements: [{ position: 'extra', itemCategoryIds: ['trinket'] }],
      effects: [{ id: 'effect-trinket-extra', displayName: 'Trinket Extra Effect' }],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-display-fixed',
      displayName: 'Display Fixed',
      minimumItemLevel: 1,
      placements: [{ position: 'suffix', itemCategoryIds: ['armor'] }],
      effects: [
        {
          id: 'effect-display-fixed',
          displayName: 'Fixed Effect',
          bonusTypeId: 'bonus-enhancement',
          modifier: { kind: 'fixed', unit: 'number', value: 3 }
        }
      ],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-display-scaled',
      displayName: 'Display Scaled',
      minimumItemLevel: 1,
      placements: [{ position: 'suffix', itemCategoryIds: ['armor'] }],
      effects: [
        {
          id: 'effect-display-scaled',
          displayName: 'Scaled Effect',
          modifier: {
            kind: 'by-item-level',
            unit: 'number',
            bands: [
              { minimumItemLevel: 1, maximumItemLevel: 1, value: 1 },
              { minimumItemLevel: 2, maximumItemLevel: 2, value: 2 }
            ]
          }
        }
      ],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    },
    {
      id: 'enhancement-display-mixed',
      displayName: 'Display Mixed',
      minimumItemLevel: 1,
      placements: [{ position: 'suffix', itemCategoryIds: ['armor'] }],
      effects: [
        {
          id: 'effect-display-negative',
          displayName: 'Negative Effect',
          modifier: { kind: 'fixed', unit: 'number', value: -2 }
        },
        {
          id: 'effect-display-fractional',
          displayName: 'Fractional Effect',
          modifier: { kind: 'fixed', unit: 'number', value: 0.125 }
        },
        {
          id: 'effect-display-dice',
          displayName: 'Dice Effect',
          modifier: { kind: 'fixed', unit: 'dice', value: 3, die: 'd6' }
        },
        {
          id: 'effect-display-missing-level',
          displayName: 'Missing Level Effect',
          modifier: {
            kind: 'by-item-level',
            unit: 'number',
            bands: [{ minimumItemLevel: 1, maximumItemLevel: 1, value: 9 }]
          }
        }
      ],
      recipes: { boundRecipeId: 'recipe-enhancement-bound', unboundRecipeId: 'recipe-enhancement-unbound' }
    }
  ],
  ingredients: [
    { id: 'ingredient-essence', displayName: 'Magic Item Essence' },
    { id: 'ingredient-mark', displayName: 'Mark of House Cannith' }
  ],
  recipes: [
    {
      id: 'recipe-enhancement-bound',
      kind: 'enhancement-shard',
      sourceRecipeId: '2030227000',
      binding: 'bound',
      craftingLevel: 100,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence', quantity: 10 }]
    },
    {
      id: 'recipe-enhancement-unbound',
      kind: 'enhancement-shard',
      sourceRecipeId: '2030227001',
      binding: 'unbound',
      craftingLevel: 120,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence', quantity: 20 }]
    },
    {
      id: 'recipe-minimum-level-bound-01',
      kind: 'minimum-level-shard',
      itemLevel: 1,
      binding: 'bound',
      craftingLevel: 1,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence', quantity: 10 }]
    },
    {
      id: 'recipe-minimum-level-unbound-01',
      kind: 'minimum-level-shard',
      itemLevel: 1,
      binding: 'unbound',
      craftingLevel: 50,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence', quantity: 100 }]
    },
    {
      id: 'recipe-minimum-level-bound-02',
      kind: 'minimum-level-shard',
      itemLevel: 2,
      binding: 'bound',
      craftingLevel: 20,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence', quantity: 20 }]
    },
    {
      id: 'recipe-minimum-level-unbound-02',
      kind: 'minimum-level-shard',
      itemLevel: 2,
      binding: 'unbound',
      craftingLevel: 70,
      requirements: [{ kind: 'ingredient', ingredientId: 'ingredient-essence', quantity: 140 }]
    }
  ],
  minimumLevelShards: [
    {
      itemLevel: 1,
      recipes: { boundRecipeId: 'recipe-minimum-level-bound-01', unboundRecipeId: 'recipe-minimum-level-unbound-01' }
    },
    {
      itemLevel: 2,
      recipes: { boundRecipeId: 'recipe-minimum-level-bound-02', unboundRecipeId: 'recipe-minimum-level-unbound-02' }
    }
  ],
  augments: [
    {
      id: 'augment-red-charisma',
      displayName: 'Ruby of Charisma +1',
      augmentTypeId: 'red',
      minimumItemLevel: 2,
      effects: [
        {
          id: 'effect-charisma',
          displayName: 'Charisma',
          bonusTypeId: 'bonus-enhancement',
          modifier: { kind: 'fixed', unit: 'number', value: 1 }
        }
      ]
    }
  ],
  rules: {
    supportedItemLevels: { minimum: 1, maximum: 2 },
    maximumCraftingLevel: 500,
    extraAffix: {
      position: 'extra',
      markRequirement: { kind: 'ingredient', ingredientId: 'ingredient-mark', quantity: 1 },
      consumedWhen: 'extra-enhancement-applied'
    },
    augmentSlotTypes: [
      {
        id: 'red',
        displayName: 'Red',
        acceptsAugmentTypeIds: ['red', 'colorless']
      }
    ],
    augmentSlotPlacements: [{ itemCategoryId: 'weapon', augmentSlotTypeIds: ['red'] }]
  }
})
