package api

// AugmentItem is a lightweight output struct intended to match tsInterfaces/augmentItem.ts
// Fields are named and cased to match the expected JSON consumed by TS.
type AugmentItem struct {
	// Fields from Ingredient (tsInterfaces/ingredients.ts)
	Name              string                  `json:"name,omitempty"`
	AugmentType       string                  `json:"augmentType"`
	BagMaxStack       *int                    `json:"bagMaxStack,omitempty"`
	BaseValue         *PriceData              `json:"baseValue,omitempty"`
	Binding           *BindingOut             `json:"binding,omitempty"`
	Description       string                  `json:"description,omitempty"`
	Enhancements      []PartialEnhancementOut `json:"enhancements,omitempty"`
	FoundIn           []string                `json:"foundIn,omitempty"`
	Image             string                  `json:"image,omitempty"`
	InventoryMaxStack *int                    `json:"inventoryMaxStack,omitempty"`
	MinimumLevel      *int                    `json:"minimumLevel,omitempty"`
	AbsoluteMinLevel  *int                    `json:"absoluteMinLevel,omitempty"`
	Notes             string                  `json:"notes,omitempty"`
	Type              string                  `json:"type,omitempty"`
	SubType           string                  `json:"subType,omitempty"`
	Weight            *float64                `json:"weight,omitempty"`
	Update            *int                    `json:"update,omitempty"`
	Material          string                  `json:"material,omitempty"`
	Hardness          *int                    `json:"hardness,omitempty"`
	Durability        *int                    `json:"durability,omitempty"`
	ArtifactType      string                  `json:"artifactType,omitempty"`

	// Fields from CraftingIngredient (tsInterfaces/crafting.ts)
	AccessoryEffectsAdded   []PartialEnhancementOut `json:"accessoryEffectsAdded,omitempty"`
	AccessoryEffectsRemoved []PartialEnhancementOut `json:"accessoryEffectsRemoved,omitempty"`
	Augments                *AugmentSlotsOut        `json:"augments,omitempty"`
	CraftedIn               string                  `json:"craftedIn,omitempty"`
	EffectsAdded            []PartialEnhancementOut `json:"effectsAdded,omitempty"`
	EffectsRemoved          []PartialEnhancementOut `json:"effectsRemoved,omitempty"`
	IngredientType          string                  `json:"ingredientType,omitempty"`
	MinLevelIncrease        *MinLevelIncreaseOut    `json:"minLevelIncrease,omitempty"`
	MinorArtifact           *bool                   `json:"minorArtifact,omitempty"`
	Quantity                *int                    `json:"quantity,omitempty"`
	Requirements            []AugmentItem           `json:"requirements,omitempty"`
	RuneArmBlast            *SpellOut               `json:"runeArmBlast,omitempty"`
	SetBonus                []SetBonusOut           `json:"setBonus,omitempty"`
	Spell                   *SpellOut               `json:"spell,omitempty"`
	Title                   string                  `json:"title,omitempty"`
	WeaponEffectsAdded      []PartialEnhancementOut `json:"weaponEffectsAdded,omitempty"`
	WeaponEffectsRemoved    []PartialEnhancementOut `json:"weaponEffectsRemoved,omitempty"`
}

// BindingOut approximates the Binding interface in tsInterfaces/core.ts
type BindingOut struct {
	Type string `json:"type"`           // Bound | Unbound
	To   string `json:"to,omitempty"`   // Character | Account
	From string `json:"from,omitempty"` // Acquisition | Equip
}

// PartialEnhancementOut is a minimal representation aligned with Partial<Enhancement>
type PartialEnhancementOut struct {
	Name              string               `json:"name,omitempty"`
	Modifier          interface{}          `json:"modifier,omitempty"` // number or string
	Bonus             string               `json:"bonus,omitempty"`
	Description       string               `json:"description,omitempty"`
	Notes             string               `json:"notes,omitempty"`
	Ability           string               `json:"ability,omitempty"`
	BasePriceModifier *PriceModifierOut    `json:"basePriceModifier,omitempty"`
	Damage            []string             `json:"damage,omitempty"`
	MinLevelIncrease  *MinLevelIncreaseOut `json:"minLevelIncrease,omitempty"`
	Type              string               `json:"type,omitempty"`
	Charges           *int                 `json:"charges,omitempty"`
	RechargePerDay    *int                 `json:"rechargePerDay,omitempty"`
}

type PriceModifierOut struct {
	RandomLoot      *int `json:"randomLoot,omitempty"`
	EssenceCraftingSlots *int `json:"essenceCrafting,omitempty"`
}

type MinLevelIncreaseOut struct {
	NoMinimumLevel *int `json:"noMinimumLevel,omitempty"`
	MinimumLevel   *int `json:"minimumLevel,omitempty"`
}

type SpellOut struct {
	Name           string   `json:"name"`
	Description    string   `json:"description,omitempty"`
	CasterLevel    *int     `json:"casterLevel,omitempty"`
	Charges        *int     `json:"charges,omitempty"`
	RechargePerDay *int     `json:"rechargePerDay,omitempty"`
	Target         []string `json:"target,omitempty"`
	Duration       string   `json:"duration,omitempty"`
	School         string   `json:"school,omitempty"`
}

type AugmentSlotsOut struct {
	Blue                         *string `json:"blue"`
	Colorless                    *string `json:"colorless"`
	Green                        *string `json:"green"`
	IsleOfDreadClawAccessory     *string `json:"isleOfDreadClawAccessory"`
	IsleOfDreadClawWeapon        *string `json:"isleOfDreadClawWeapon"`
	IsleOfDreadFangAccessory     *string `json:"isleOfDreadFangAccessory"`
	IsleOfDreadFangArmor         *string `json:"isleOfDreadFangArmor"`
	IsleOfDreadFangWeapon        *string `json:"isleOfDreadFangWeapon"`
	IsleOfDreadHornAccessory     *string `json:"isleOfDreadHornAccessory"`
	IsleOfDreadHornWeapon        *string `json:"isleOfDreadHornWeapon"`
	IsleOfDreadScaleAccessory    *string `json:"isleOfDreadScaleAccessory"`
	IsleOfDreadScaleArmor        *string `json:"isleOfDreadScaleArmor"`
	IsleOfDreadScaleWeapon       *string `json:"isleOfDreadScaleWeapon"`
	IsleOfDreadSetBonus          *string `json:"isleOfDreadSetBonus"`
	LamordiaMelancholicWeapon    *string `json:"lamordiaMelancholicWeapon"`
	LamordiaDolorousWeapon       *string `json:"lamordiaDolorousWeapon"`
	LamordiaMiserableWeapon      *string `json:"lamordiaMiserableWeapon"`
	LamordiaWoefulWeapon         *string `json:"lamordiaWoefulWeapon"`
	LamordiaMelancholicAccessory *string `json:"lamordiaMelancholicAccessory"`
	LamordiaDolorousAccessory    *string `json:"lamordiaDolorousAccessory"`
	LamordiaMiserableAccessory   *string `json:"lamordiaMiserableAccessory"`
	LamordiaWoefulAccessory      *string `json:"lamordiaWoefulAccessory"`
	LamordiaMelancholicArmor     *string `json:"lamordiaMelancholicArmor"`
	LamordiaDolorousArmor        *string `json:"lamordiaDolorousArmor"`
	Moon                         *string `json:"moon"`
	Orange                       *string `json:"orange"`
	Purple                       *string `json:"purple"`
	Red                          *string `json:"red"`
	Sun                          *string `json:"sun"`
	Yellow                       *string `json:"yellow"`
}

// SetBonusOut and CraftingIngredientOut are placeholders to satisfy the interface shape.
// They are intentionally very small until we add deeper parsing for them.
type SetBonusOut struct {
	Name         string                  `json:"name"`
	Enhancements []PartialEnhancementOut `json:"enhancements,omitempty"`
	NumPieces    *int                    `json:"numPiecesEquipped,omitempty"`
}

// CraftingIngredientOut is now replaced by AugmentItem for deeper nesting
// but we keep this for backward compatibility if needed, or just remove it.
type CraftingIngredientOut struct {
	Title          string `json:"title,omitempty"`
	Quantity       *int   `json:"quantity,omitempty"`
	IngredientType string `json:"ingredientType,omitempty"`
}
