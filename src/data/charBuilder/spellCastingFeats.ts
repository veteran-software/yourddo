const spellCastingFeats: object[] = [
  { name: 'Augment Summoning', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
  { name: 'Combat Casting', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
  { name: 'Mental Toughness', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
  {
    name: 'Spell Focus Feats',
    selectable: [],
    children: [
      { name: 'Spell Focus: Abjuration', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
      { name: 'Spell Focus: Conjuration', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
      { name: 'Spell Focus: Enchantment', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
      { name: 'Spell Focus: Evocation', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
      { name: 'Spell Focus: Illusion', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
      { name: 'Spell Focus: Necromancy', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true },
      { name: 'Spell Focus: Transmutation', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true }
    ],
    characterCreation: true
  },
  { name: 'Spell Penedtration', selectable: [{ 'Dark Bargainer': [1] }], characterCreation: true }
]
