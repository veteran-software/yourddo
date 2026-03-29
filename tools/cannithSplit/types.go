package main

type RawEnchantment struct {
	Name  string `json:"name"`
	Bonus string `json:"bonus,omitempty"`
}

type RawCollectible struct {
	Name string `json:"name"`
	Qty  int    `json:"qty"`
}

type RawRecipeCost struct {
	Level       int              `json:"level,omitempty"`
	Essence     int              `json:"essence,omitempty"`
	Purified    *int             `json:"purified,omitempty"`
	Collectible []RawCollectible `json:"collectible,omitempty"`
}

type RawEnhancement struct {
	Name             string           `json:"name"`
	Enchantments     []RawEnchantment `json:"enchantments,omitempty"`
	Bound            *RawRecipeCost   `json:"bound,omitempty"`
	Unbound          *RawRecipeCost   `json:"unbound,omitempty"`
	PrefixTitle      string           `json:"prefixTitle,omitempty"`
	SuffixTitle      string           `json:"suffixTitle,omitempty"`
	Prefix           []string         `json:"prefix,omitempty"`
	Suffix           []string         `json:"suffix,omitempty"`
	Extra            []string         `json:"extra,omitempty"`
	Group            string           `json:"group,omitempty"`
	MinLevelIncrease any              `json:"minLevelIncrease,omitempty"`
	Stat             any              `json:"stat,omitempty"`
}

type EffectDefinition struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Group string `json:"group,omitempty"`
}

type EffectEnchantment struct {
	EffectID string `json:"effectId"`
	Name     string `json:"name"`
	Bonus    string `json:"bonus,omitempty"`
}

type EffectPlacement struct {
	EffectID    string   `json:"effectId"`
	PrefixSlots []string `json:"prefixSlots,omitempty"`
	SuffixSlots []string `json:"suffixSlots,omitempty"`
	ExtraSlots  []string `json:"extraSlots,omitempty"`
}

type EffectTier struct {
	Tier             int    `json:"tier"`
	Value            string `json:"value,omitempty"`
	MinLevelIncrease int    `json:"minLevelIncrease,omitempty"`
}

type EffectTiers struct {
	EffectID string       `json:"effectId"`
	Tiers    []EffectTier `json:"tiers"`
}

type EffectRecipe struct {
	EffectID string         `json:"effectId"`
	Bound    *RawRecipeCost `json:"bound,omitempty"`
	Unbound  *RawRecipeCost `json:"unbound,omitempty"`
}

type EffectDisplay struct {
	EffectID    string `json:"effectId"`
	PrefixTitle string `json:"prefixTitle,omitempty"`
	SuffixTitle string `json:"suffixTitle,omitempty"`
}

type PlannerEntry struct {
	ID              string `json:"id"`
	SourceType      string `json:"sourceType"`
	EffectID        string `json:"effectId"`
	EnchantmentName string `json:"enchantmentName"`
	BonusType       string `json:"bonusType,omitempty"`
	SlotID          string `json:"slotId"`
	AffixType       string `json:"affixType"`
	Group           string `json:"group,omitempty"`
}
