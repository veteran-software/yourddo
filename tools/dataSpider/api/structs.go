package api

// --- API Structs ---

type APISuccessResponse struct {
	Continue map[string]string `json:"continue"`
	Query    struct {
		Pages []Page `json:"pages"`
	} `json:"query"`
}

type Page struct {
	Title     string     `json:"title"`
	PageID    int        `json:"pageid"`
	Revisions []Revision `json:"revisions"`
}

type DiceData struct {
	Multiplier          string `json:"multiplier,omitempty"`
	DieCount            string `json:"dieCount,omitempty"`
	DieSides            string `json:"dieSides,omitempty"`
	AddBeforeMultiplier string `json:"addBeforeMultiplier,omitempty"`
	AddAfterMultiplier  string `json:"addAfterMultiplier,omitempty"`
	Raw                 string `json:"raw,omitempty"`
}

type Revision struct {
	Slots *Slots `json:"slots"`
}

type VendorPurchaseTableData struct {
	VendorsRaw string `json:"vendorsRaw,omitempty"` // The raw list of vendor sub-templates
}

type Slots struct {
	Main *MainSlot `json:"main"`
}

type MainSlot struct {
	Content *string `json:"content"`
}

// --- FINAL JSON Output Structs ---

// PriceData for nested {{Price|...}} template.
type PriceData struct {
	Platinum string `json:"platinum,omitempty"`
	Gold     string `json:"gold,omitempty"`
	Silver   string `json:"silver,omitempty"`
	Copper   string `json:"copper,omitempty"`
}

type DropLocationData struct {
	Source     string `json:"source,omitempty"` // Corresponds to (Quest/Wilderness/Chain)
	Chest      string `json:"chest,omitempty"`  // Corresponds to (Which Chest/Person)
	Title      string `json:"title,omitempty"`  // Corresponds to (Title for Link) - optional
	Difficulty string `json:"difficulty,omitempty"`
	Exclude    string `json:"exclude,omitempty"` // Corresponds to (Exclude as Quest Loot)
}

type StorePurchaseData struct {
	Store       string `json:"store,omitempty"`       // Corresponds to (Which Store)
	Cost        string `json:"cost,omitempty"`        // Corresponds to (Cost)
	LimitedTime string `json:"limitedTime,omitempty"` // Corresponds to (Limited Time)
	Count       string `json:"count,omitempty"`       // Corresponds to (Count)
	Content     string `json:"content,omitempty"`     // Corresponds to (Content)
}

type DropSourceData struct {
	SourceType string `json:"sourceType"` // "Quest", "Store", or "AdventurePack"

	// Fields from Template:DropLocation
	QuestWildernessChain string `json:"questWildernessChain,omitempty"`
	WhichChestPerson     string `json:"whichChestPerson,omitempty"`
	TitleForLink         string `json:"titleForLink,omitempty"`
	Difficulty           string `json:"difficulty,omitempty"`
	ExcludeAsQuestLoot   string `json:"excludeAsQuestLoot,omitempty"`

	// Fields from Template:StorePurchase
	StoreName   string `json:"storeName,omitempty"`
	Cost        string `json:"cost,omitempty"`
	LimitedTime string `json:"limitedTime,omitempty"`
	Count       string `json:"count,omitempty"`
	Content     string `json:"content,omitempty"`

	// NEW FIELDS from Template:AdventurePackDrop
	AdventurePack string `json:"adventurePack,omitempty"` // Corresponds to (Adventure pack)
	StoryArc      string `json:"storyArc,omitempty"`
	// WhichChestPerson and Difficulty are reused here
	IncludeAsQuestLoot string `json:"includeAsQuestLoot,omitempty"` // Corresponds to (Include as Quest Loot)

	// NEW FIELDS from Template:ItemIconicReceived
	IconicRace string `json:"iconicRace,omitempty"` // Corresponds to (Iconic Race)
	Level      string `json:"level,omitempty"`      // Corresponds to (Level)
	ItemCount  string `json:"itemCount,omitempty"`  // Corresponds to (Count)

	// NEW FIELDS from Template:VIPLoyalty
	VIPMonths string `json:"vipMonths,omitempty"` // Corresponds to (month), holds comma-separated string
	VIPBonus  string `json:"vipBonus,omitempty"`  // To flag the special "First Time Sign-up Bonus" case

	// NEW FIELDS from Template:CrateAcquired
	CrateName string `json:"crateName,omitempty"` // Corresponds to (Location)
	Qty       string `json:"qty,omitempty"`       // Corresponds to (Number)

	EventName     string `json:"eventName,omitempty"`     // Corresponds to (name)
	EventLocation string `json:"eventLocation,omitempty"` // Corresponds to (location)

	VendorTable *VendorPurchaseTableData `json:"vendorTable,omitempty"`

	// NEW FIELDS from Template:ViktraniumPurchase
	ViktraniumTransformers string `json:"viktraniumTransformers,omitempty"`
	ViktraniumMementos     string `json:"viktraniumMementos,omitempty"`
	ViktraniumWires        string `json:"viktraniumWires,omitempty"`
	ViktraniumConductors   string `json:"viktraniumConductors,omitempty"`
	ViktraniumInsulators   string `json:"viktraniumInsulators,omitempty"`
	ViktraniumAlternators  string `json:"viktraniumAlternators,omitempty"`
	ViktraniumResistors    string `json:"viktraniumResistors,omitempty"`

	// NEW FIELDS from Template:DinosaurBonePurchase
	BoneRaptor        string `json:"boneRaptor,omitempty"`
	BoneTriceratops   string `json:"boneTriceratops,omitempty"`
	BonePteradon      string `json:"bonePteradon,omitempty"`
	BoneAnkylosaur    string `json:"boneAnkylosaur,omitempty"`
	BoneTyrannosaurus string `json:"boneTyrannosaurus,omitempty"`
	BlackPearls       string `json:"blackPearls,omitempty"`

	// NEW FIELDS from Template:RaidRunePurchase
	RaidRuneStore string `json:"raidRuneStore,omitempty"` // Corresponds to (Which Runes)
	RaidRuneCost  string `json:"raidRuneCost,omitempty"`  // Corresponds to (Cost)
	RaidRuneCount string `json:"raidRuneCount,omitempty"` // Corresponds to (Count)

	// NEW FIELDS from Template:SnowpeaksPurchase
	SnowpeaksGold   string `json:"snowpeaksGold,omitempty"`
	SnowpeaksSilver string `json:"snowpeaksSilver,omitempty"`
	SnowpeaksBronze string `json:"snowpeaksBronze,omitempty"`

	// NEW FIELDS from Template:RemnantPurchase
	RemnantCost        string `json:"remnantCost,omitempty"`
	RemnantUpgradeItem string `json:"remnantUpgradeItem,omitempty"`
	RemnantLimitedTime string `json:"remnantLimitedTime,omitempty"`

	// NEW FIELDS from Template:CraftedAugment
	CraftLocation string   `json:"craftLocation,omitempty"`
	RaidItems     []string `json:"raidItems,omitempty"` // Slice for up to 5 raid items

	// NEW FIELDS from Template:CreatedViaCrafting
	CraftingType     string `json:"craftingType,omitempty"`     // Corresponds to (Where)
	CraftingLocation string `json:"craftingLocation,omitempty"` // Corresponds to (Location)
	IngredientsRaw   string `json:"ingredientsRaw,omitempty"`   // Corresponds to (Ingredients) - Raw wikitext list

	// NEW FIELDS from Template:RandomDrop
	RandomHighestChance string `json:"randomHighestChance,omitempty"`
	RandomLevelRange    string `json:"randomLevelRange,omitempty"`
	RandomOnlyType      string `json:"randomOnlyType,omitempty"`
	RandomPageLink      string `json:"randomPageLink,omitempty"`

	// NEW FIELDS from Template:AnniversaryPurchase
	Anniversary      string `json:"anniversary,omitempty"`      // Which Anniversary (e.g., 16th)
	AnniversaryCount string `json:"anniversaryCount,omitempty"` // How many party favors are required

	// NEW FIELDS from Template:TimelineFragmentPurchase
	TimelineFragmentAnniversary string `json:"timelineFragmentAnniversary,omitempty"`
	TimelineFragmentCount       string `json:"timelineFragmentCount,omitempty"`

	// NEW FIELDS from Template:AnniversaryFreebie
	FreebieAnniversary string `json:"freebieAnniversary,omitempty"` // Which Anniversary (e.g., 15th)
	FreebieDate        string `json:"freebieDate,omitempty"`        // Last date to turn in
	FreebieType        string `json:"freebieType,omitempty"`        // Code, Token, etc.
	FreebieValue       string `json:"freebieValue,omitempty"`       // The code or token name
	FreebieAll         string `json:"freebieAll,omitempty"`         // True if all characters get it

	// NEW FIELDS from Template:VendorPurchase
	VendorName     string `json:"vendorName,omitempty"`     // Corresponds to (Which Vendor)
	VendorCost     string `json:"vendorCost,omitempty"`     // Corresponds to (Cost)
	VendorLocation string `json:"vendorLocation,omitempty"` // Corresponds to (Location)
	VendorAmount   string `json:"vendorAmount,omitempty"`   // Corresponds to (Amount)
	VendorArea     string `json:"vendorArea,omitempty"`     // Corresponds to (Area)

	// NEW FIELDS from Template:DraconicRunePurchase
	DraconicRuneCount      string `json:"draconicRuneCount,omitempty"`
	RequiresStealerOfSouls string `json:"requiresStealerOfSouls,omitempty"`

	// NEW FIELDS from Template:PatronReceived
	PatronName     string `json:"patronName,omitempty"`     // Corresponds to (Patron)
	PatronFavor    string `json:"patronFavor,omitempty"`    // Corresponds to (favor)
	PatronTitle    string `json:"patronTitle,omitempty"`    // Corresponds to (Title)
	PatronLocation string `json:"patronLocation,omitempty"` // Corresponds to (Location)

	// NEW FIELDS from Template:CommendationPurchase
	CommendationType  string `json:"commendationType,omitempty"`
	CommendationCount string `json:"commendationCount,omitempty"`

	// NEW FIELDS from Template:RelicPurchase
	RelicType     string `json:"relicType,omitempty"`
	RelicCost     string `json:"relicCost,omitempty"`
	RelicRestored string `json:"relicRestored,omitempty"`

	// NEW FIELDS from Template:DragonScalePurchase
	DragonScaleColor    string `json:"dragonScaleColor,omitempty"`
	DragonScaleFlawless string `json:"dragonScaleFlawless,omitempty"`

	// NEW FIELDS from Template:VeteranReceived
	VeteranStatus  string   `json:"veteranStatus,omitempty"`
	VeteranCount   string   `json:"veteranCount,omitempty"`
	VeteranClasses []string `json:"veteranClasses,omitempty"`

	// NEW FIELDS from Template:ThunderForgePurchase
	ThunderForgeArmor string `json:"thunderForgeArmor,omitempty"`

	// NEW FIELDS from Template:CraftOnlyItem
	IsCraftOnly bool `json:"isCraftOnly,omitempty"`

	// NEW FIELDS from Template:CommunityLootList
	IsCommunityLoot bool `json:"isCommunityLoot,omitempty"`

	// NEW FIELDS from Template:AdamantineOrePurchase
	AdamantineOreCount string `json:"adamantineOreCount,omitempty"`

	// NEW FIELDS from Template:OutsiderTokenPurchase
	OutsiderTokenCount string `json:"outsiderTokenCount,omitempty"`

	// NEW FIELDS from Template:MimicTokenPurchase
	MimicTokenCount string `json:"mimicTokenCount,omitempty"`

	// NEW FIELDS from Template:Ingredient
	IngredientName  string `json:"ingredientName,omitempty"`
	IngredientCount string `json:"ingredientCount,omitempty"`

	// NEW FIELDS from Template:SoraKatraCrafting
	SoraKatraItem1 string `json:"soraKatraItem1,omitempty"`
	SoraKatraItem2 string `json:"soraKatraItem2,omitempty"`
	SoraKatraMark1 string `json:"soraKatraMark1,omitempty"`
	SoraKatraMark2 string `json:"soraKatraMark2,omitempty"`

	// NEW FIELDS from Template:TapestryPurchase
	IsTapestryPurchase bool `json:"isTapestryPurchase,omitempty"`
}

type Enchantment struct {
	Name      string  `json:"name"`
	Amount    string  `json:"modifier,omitempty"` // TS expects "modifier"
	BonusType string  `json:"bonus,omitempty"`    // TS expects "bonus"
	Notes     *string `json:"notes,omitempty"`

	// Specialized fields are not part of TS Enhancement; suppress JSON output.
	Element string `json:"-"`

	// Rune Arm and similar specialized data (kept for internal parsing only)
	BlastType       string `json:"-"`
	BlastDamageType string `json:"-"` // Corresponds to (Type) in RuneArmBlast
	MaxChargeTier   string `json:"-"`

	ImbueDamageStyle    string `json:"-"`
	ImbueMagnitude      string `json:"-"`
	ImbueCreatureTarget string `json:"-"`

	// Internal carrier to signal a set bonus name to downstream processors.
	// Not serialized directly; downstream should translate it into a SetBonusOut.
	SetBonusName string `json:"-"`

	// Recharge data for items with charges (e.g., Spell Absorption)
	Charges      int `json:"charges,omitempty"`
	RechargeRate int `json:"rechargeRate,omitempty"`
}

// SaveData struct is no longer needed; its fields are mapped directly to Enchantment.

// EnchantmentData Updated to be generic, now containing the standard list
type EnchantmentData struct {
	Type string `json:"type"` // e.g., "Standard", "Damage", "SetBonus"

	// Standard enchantments (Save, Skill, Resistance, etc.) will go here
	Enchantments Enchantment `json:"enchantments,omitempty"`

	// Other specific enchantment structures (e.g., complex damage templates) will go here later
	RawValue string `json:"rawValue,omitempty"` // For initial parsing/debugging of unknown templates
}

// ItemData represents the final structured data for an item.
type ItemData struct {
	PageTitle string `json:"pageTitle"`
	// General Info
	Name        string `json:"name"`
	Type        string `json:"type"`
	Description string `json:"description"`
	// Requirements & Binding
	MinLevel         string      `json:"minLevel"`
	AbsoluteMinLevel string      `json:"absoluteMinLevel"`
	Binding          *BindingOut `json:"binding,omitempty"`
	Restriction      string      `json:"restriction"`
	// Stats & Values
	Material     string    `json:"material"`
	Hardness     string    `json:"hardness"`
	Durability   string    `json:"durability"`
	Weight       string    `json:"weight"`
	BaseValue    PriceData `json:"baseValue"` // Structured Data
	ArtifactType string    `json:"artifacttype"`
	// Source & History
	DropLocations   []DropSourceData `json:"dropLocations"`
	DropLocationRaw string           `json:"-"` // Keep a raw field for debugging/completeness
	Update          string           `json:"update"`
	Details         string           `json:"details"`
	Upgradeable     string           `json:"upgradeable"`
	UpgradedFrom    string           `json:"upgradedFrom"`
	Bug             string           `json:"bug"`
	Replaced        string           `json:"replaced"`
	// Visuals & Utility
	Icon       string `json:"icon"`
	Image      string `json:"image"`
	OptionsRaw string `json:"optionsRaw"`
	IsCrafted  bool   `json:"isCrafted,omitempty"`
	// Templates (Raw for subsequent parsing)
	CraftingRequirements []CraftingRequirement `json:"craftingRequirements,omitempty"`
	Enchantments         []Enchantment         `json:"enchantments"`
	EnchantmentsRaw      string                `json:"-"`
	Augments             []AugmentItem         `json:"augments,omitempty"`
	AugmentsRaw          string                `json:"-"`
	ItemSetsRaw          string                `json:"-"`
}

type CraftingRequirement struct {
	Name     string   `json:"name"`
	Quantity *int     `json:"quantity,omitempty"`
	Location []string `json:"location,omitempty"`
}
