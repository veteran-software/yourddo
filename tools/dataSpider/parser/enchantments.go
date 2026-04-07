package parser

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/sirupsen/logrus"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	"compendium-crawler-go/api"
)

var spellSchools = []string{
	"Abjuration", "Breath Weapon", "Conjuration", "Divination", "Enchantment",
	"Evocation", "Illusion", "Necromancy", "Transmutation",
}

var skills = []string{
	"Balance", "Bluff", "Concentration", "Diplomacy", "Disable Device", "Haggle", "Heal", "Hide", "Intimidate", "Jump",
	"Listen", "Move Silently", "Open Lock", "Perform", "Repair", "Search", "Spellcraft", "Spot", "Swim", "Tumble",
	"Use Magic Device",
}

var saves = []string{
	"Fortitude",
	"Reflex",
	"Will",
}

var elements = []string{
	"Acid",
	"Cold",
	"Electric",
	"Fire",
	"Sonic",
}

var elementsMap = map[string][]string{
	"Combustion":            {"Fire"},
	"Corrosion":             {"Acid"},
	"Devotion":              {"Positive Energy"},
	"Glaciation":            {"Cold"},
	"Impulse":               {"Force", "Piercing", "Slashing", "Bludgeoning"},
	"Magnetism":             {"Electric"},
	"Nullification":         {"Negative Energy", "Poison"},
	"Radiance":              {"Light", "Chaos", "Evil", "Good", "Lawful"},
	"Reconstruction":        {"Repair", "Rust"},
	"Resonance":             {"Sonic"},
	"Kinetic":               {"Force", "Piercing", "Slashing", "Bludgeoning"},
	"Ice":                   {"Cold"},
	"Void":                  {"Negative Energy", "Poison"},
	"Repair":                {"Repair", "Rust"},
	"Lightning":             {"Electric"},
	"Healing":               {"Positive Energy"},
	"Fire":                  {"Fire"},
	"Acid":                  {"Acid"},
	"Cold":                  {"Cold"},
	"Electric":              {"Electric"},
	"Force":                 {"Force", "Piercing", "Slashing", "Bludgeoning"},
	"Light":                 {"Light", "Chaos", "Evil", "Good", "Lawful"},
	"Negative":              {"Negative Energy"},
	"Poison":                {"Poison"},
	"Positive":              {"Positive Energy"},
	"Blighted":              {"Acid", "Negative Energy", "Poison", "Evil"},
	"Creeping Dust":         {"Cold", "Acid"},
	"Dark Restoration":      {"Negative Energy", "Poison", "Positive Energy"},
	"Firestorm":             {"Fire", "Electric"},
	"Flames of Darkness":    {"Fire", "Negative Energy", "Poison"},
	"Frozen Depths":         {"Negative", "Cold", "Poison"},
	"Frozen Storm":          {"Cold", "Electric"},
	"Moonlit Haunt":         {"Negative Energy", "Force", "Poison"},
	"Purifying Flame":       {"Fire", "Light"},
	"Sacred Ground":         {"Acid", "Light", "Chaos", "Evil", "Good", "Lawful"},
	"Silver Flame":          {"Positive Energy", "Light", "Chaos", "Evil", "Good", "Lawful"},
	"Summer's Impertenence": {},
	"Thunderstorm":          {"Sonic", "Electric"},
	"Winter's Impertenence": {},
	"Universal":             {""},
	"Potency":               {"Acid", "Cold", "Electric", "Fire", "Force", "Piercing", "Slashing", "Bludgeoning", "Light", "Chaos", "Evil", "Good", "Lawful", "Negative Energy", "Poison", "Positive Energy", "Sonic", "Repair", "Rust"},
}

var abilityToSkillsMap = map[string][]string{
	"Strength":     {"Jump", "Swim"},
	"Dexterity":    {"Balance", "Escape Artist", "Hide", "Move Silently", "Open Lock", "Tumble"},
	"Constitution": {"Concentration"},
	"Intelligence": {"Disable Device", "Heal", "Repair", "Search", "Spellcraft"},
	"Wisdom":       {"Listen", "Spot"},
	"Charisma":     {"Bluff", "Diplomacy", "Haggle", "Intimidate", "Perform", "Use Magic Device"},
}

var skillGroupsMap = map[string][]string{
	"Nimble":     {"Balance", "Hide", "Move Silently", "Open Lock", "Tumble"},
	"Alluring":   {"Bluff", "Diplomacy", "Haggle", "Intimidate", "Perform"},
	"Aluring":    {"Bluff", "Diplomacy", "Haggle", "Intimidate", "Perform"},
	"Persuasion": {"Bluff", "Diplomacy", "Haggle", "Intimidate", "Perform"},
	"Prudent":    {"Heal", "Listen", "Spot"},
	"Astute":     {"Disable Device", "Repair", "Search"},
	"Mighty":     {"Jump", "Swim"},
}

var combatManeuvers = []string{
	"Trip",
	"Improved Trip",
	"Sunder",
	"Improved Sunder",
	"Stunning",
}

var ghostlySkills = []string{
	"Hide",
	"Move Silently",
}

var murderousTypeToDamage = map[string]string{
	"Point": "Piercing",
	"Edge":  "Slashing",
	"Swing": "Bludgeoning",
	"Spike": "Piercing", // Assuming Spike is Piercing damage
}

var diversionStyles = map[string]struct {
	Melee  bool
	Ranged bool
	Spell  bool
}{
	"Melee":      {Melee: true},
	"Ranged":     {Ranged: true},
	"Spell":      {Spell: true},
	"MeleeRange": {Melee: true, Ranged: true},
	"MeleeSpell": {Melee: true, Spell: true},
	"RangeSpell": {Ranged: true, Spell: true},
	"All":        {Melee: true, Ranged: true, Spell: true},
}

var marksmanshipLookup = map[string]struct {
	NamePrefix   string
	AttackAmount string
	DamageAmount string
	BonusType    string
}{
	// Default (Blank) Example: +2 Attack, +1 Damage, (Implied Enhancement Bonus)
	"Default": {"", "2", "1", "Enhancement"},

	// Greater Example: +3 Competence Attack, +2 Competence Damage
	"Greater": {"Greater", "3", "2", "Competence"},

	// New Normal: Assuming it follows the Greater pattern but with standard +2/+1 amounts (or identical to Default, needs confirmation).
	// Based on DDO norms, we'll assume it's like Default, but perhaps without the Roman numeral style.
	"New Normal": {"New Normal", "2", "1", "Enhancement"},
}

var shockwaveTypeMap = map[string]struct {
	NamePrefix    string
	DamageElement string
}{
	"basic":              {"", "Bludgeoning"},                   // Default/Blank: Bludgeoning damage
	"whelmling":          {"Whelming", "Bludgeoning"},           // Whelming: Bludgeoning damage
	"legendary whelming": {"Legendary Whelming", "Bludgeoning"}, // Legendary Whelming: Bludgeoning damage
	"overwhelming":       {"Overwhelming", "Sonic"},             // Overwhelming: Sonic damage
}

var damageEffectToElementMap = map[string]string{
	"Force":       "Force",
	"Sonic":       "Sonic",
	"Bludgeon":    "Bludgeoning",
	"Slashing":    "Slashing",
	"Piercing":    "Piercing",
	"Acid":        "Acid",
	"Cold":        "Cold",
	"Electricity": "Electric",
	"Fire":        "Fire",
	"Light":       "Light",
	"Negative":    "Negative",
	"Poison":      "Poison",
	"Holy":        "Positive",
	"Unholy":      "Negative",
	"Anarchic":    "Chaos",
	"Axomatic":    "Lawful",
	"Entropic":    "Untyped",
}

var revelInBloodTypeToDamage = map[string]string{
	"Slashing":    "Slashing",
	"Piercing":    "Piercing",
	"Bludgeoning": "Bludgeoning",
	"Magic":       "Force",       // Magic usually corresponds to Force damage in this context
	"Shield":      "Bludgeoning", // Assuming Shield bash damage is Bludgeoning
}

var elementalAoeNames = map[string]string{
	"Acid":        "Acid Torrent",
	"Cold":        "Freezing Gale",
	"Electricity": "Electric Storm",
	"Fire":        "Fiery Detonation",
}

var elementalDefaultDice = map[string]string{
	"Fire": "1d6", // Default fire damage dice from standard enchants
	// Other elements may follow a pattern, but we use the general default 1d6 for simplicity if not specified.
}

var allSpellCritDamageGroups = []string{
	// Base groups that may appear as the first parameter for {{SpellCritDamage|...}}
	// This list is used when the group is "Universal" to expand into all supported groups.
	"Combustion", "Fire", "Corrosion", "Acid", "Devotion", "Glaciation", "Ice",
	"Impulse", "Force", "Magnetism", "Lightning", "Nullification", "Negative",
	"Radiance", "Light", "Reconstruction", "Repair", "Kinetic", "Resonance",
	"Sonic", "Healing", "Void",
}

var spellPowerToElementMap = map[string]string{
	"Combustion":     "Fire",
	"Corrosion":      "Acid",
	"Devotion":       "Positive Energy",
	"Glaciation":     "Cold",
	"Impulse":        "Force",
	"Magnetism":      "Electric",
	"Nullification":  "Negative Energy",
	"Radiance":       "Light",
	"Reconstruction": "Repair",
	"Resonance":      "Sonic",
	"Healing":        "Healing", // Healing stands on its own for Crit Damage naming
}

var compoundSpellPowers = map[string][]string{
	"Frozen Storm":        {"Cold", "Lightning"},
	"Creeping Dust":       {"Cold", "Acid"},
	"Firestorm":           {"Fire", "Lightning"},
	"Elemental Resonance": {"Acid", "Fire", "Electric", "Cold"},
	"Thunderstorm":        {"Sonic", "Electric"},
	"Force":               {"Force", "Untyped", "Bludgeoning", "Slashing", "Piercing"},
	"Negative":            {"Negative Energy", "Poison"},
	// Including other common compound names for comprehensive splitting (even if they don't map to elements easily)
	"Universal": {"Combustion", "Corrosion", "Devotion", "Glaciation", "Impulse", "Magnetism", "Nullification", "Radiance", "Reconstruction", "Resonance"},
}

// expandSpellCritGroup takes a high-level group/type name and expands it into one or more
// concrete categories for Spell Critical Damage naming, per requirements.
// Returned strings are already in their final display form (e.g., "Negative Energy",
// "Alignment (Chaotic)", "Physical (Bludgeoning)").
func expandSpellCritGroup(group string) []string {
	g := strings.TrimSpace(group)
	if g == "" {
		return nil
	}
	// Normalize common variants/aliases
	c := cases.Title(language.English)
	g = c.String(strings.ToLower(g))

	switch g {
	// Direct elements/types
	case "Fire":
		return []string{"Fire"}
	case "Acid":
		return []string{"Acid"}
	case "Cold":
		return []string{"Cold"}
	case "Force":
		return []string{"Force"}
	case "Electric", "Electricity", "Lightning", "Lighting", "Magnetism":
		return []string{"Electric"}
	case "Sonic", "Resonance":
		return []string{"Sonic"}
	case "Light", "Radiance":
		return []string{"Light", "Chaos", "Lawful", "Good", "Evil"}
	case "Positive", "Positive Energy", "Devotion":
		return []string{"Positive Energy"}
	case "Negative", "Negative Energy", "Void":
		return []string{"Negative Energy"}
	case "Nullification":
		return []string{"Negative Energy", "Poison"}
	case "Reconstruction":
		return []string{"Repair"}
	case "Repair":
		return []string{"Repair", "Rust"}
	case "Impulse":
		return []string{"Force", "Untyped", "Bludgeoning", "Slashing", "Piercing"}
	case "Kinetic":
		return []string{"Force"}
	case "Healing":
		return []string{"Healing"}
	case "Ice", "Glaciation":
		return []string{"Cold"}
	case "Combustion":
		return []string{"Fire"}
	case "Corrosion":
		return []string{"Acid"}
	default:
		// If it's already in a displayable form or an element we don't map specially, pass through.
		return []string{g}
	}
}

var stunningManeuvers = []string{
	"Stunning Blow",
	"Stunning Fist",
}

var vertigoManeuvers = []string{
	"Trip",
	"Improved Trip",
}

var weaponPowerTypes = []string{
	"Melee",
	"Ranged",
}

// Map of Spell School Save types to their display name for the parenthesis.
// This is easily extensible by adding new key/value pairs here.
var saveSchoolMap = map[string]string{
	"Spell":         "Magic", // Custom mapping for general "Spell" save
	"Abjuration":    "Abjuration",
	"Conjuration":   "Conjuration",
	"Divination":    "Divination",
	"Enchantment":   "Enchantment",
	"Evocation":     "Evocation",
	"Illusion":      "Illusion",
	"Necromancy":    "Necromancy",
	"Transmutation": "Transmutation",
}

// Helper function to strip brackets (copied from converter)
func stripBrackets(s string) string {
	s = strings.ReplaceAll(s, "[", "")
	s = strings.ReplaceAll(s, "]", "")
	return strings.TrimSpace(s)
}

// --- Specific Template Parsers that map to the standard format ---

// mapSaveTypeToName standardizes the save type name (e.g., "Reflex" -> "Reflex Save").
func mapSaveTypeToName(saveType string) string {
	// This is where you would implement your custom formatting/switch statement later.
	// For now, we'll keep it simple.
	switch strings.ToLower(saveType) {
	case "reflex", "will", "fortitude":
		return saveType + " Saving Throws"
	default:
		return saveType
	}
}

// parseTemplateSave extracts values for {{Save|...}} and maps them to api.Enchantment.
func parseTemplateSave(rawSaveValue string) *api.Enchantment {
	const prefix = "{{Save|"
	const suffix = "}}"

	if !strings.HasPrefix(rawSaveValue, prefix) || !strings.HasSuffix(rawSaveValue, suffix) {
		return nil
	}

	paramList := rawSaveValue[len(prefix) : len(rawSaveValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Save Type)|(Enhancement Amount)|(Bonus Type)|(Title)

	// Ensure minimum required fields are present
	if len(parts) < 2 {
		return nil // Not enough data for Amount and Type
	}

	amount := stripBrackets(parts[1])
	if amount == "" {
		return nil // Amount is required
	}

	saveType := stripBrackets(parts[0])

	var bonusType string
	// 3. Bonus Type (Optional, Index 2 - defaults to Resistance if empty)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = "Resistance"
		} else {
			bonusType = value
		}
	} else {
		bonusType = "Resistance" // Default value
	}

	// 4. Title (Optional, Index 3) - overrides the standard Name if present
	var name string
	if len(parts) >= 4 && stripBrackets(parts[3]) != "" {
		name = stripBrackets(parts[3]) // Use custom title
	} else {
		name = mapSaveTypeToName(saveType) // Use standardized name
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateRuneArmBlast(rawBlastValue string) *api.Enchantment {
	const prefix = "{{RuneArmBlast|"
	const suffix = "}}"

	if !strings.HasPrefix(rawBlastValue, prefix) || !strings.HasSuffix(rawBlastValue, suffix) {
		return nil
	}

	paramList := rawBlastValue[len(prefix) : len(rawBlastValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Blast Type)|(Type)|(Maximum Charge Tier)|(Additional Text)

	blast := &api.Enchantment{}

	if len(parts) >= 1 {
		blast.Name = stripBrackets(parts[0])
		blast.BlastType = stripBrackets(parts[0])
	}
	if len(parts) >= 2 {
		blast.BlastDamageType = stripBrackets(parts[1])
		if strings.ToLower(blast.BlastDamageType) == "aoe" {
			blast.BlastDamageType = "Area of Effect"
		}
	}
	if len(parts) >= 3 {
		blast.MaxChargeTier = strings.ToUpper(stripBrackets(parts[2]))
	}

	return blast
}

func parseTemplateJetPropulsion(rawJetValue string) *api.Enchantment {
	const prefix = "{{JetPropulsion"
	const suffix = "}}"
	const baseName = " Jet Propulsion" // Suffix to the Type parameter

	if !strings.HasPrefix(rawJetValue, prefix) || !strings.HasSuffix(rawJetValue, suffix) {
		return nil
	}

	paramList := rawJetValue[len(prefix) : len(rawJetValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	var enchName string
	if len(parts) >= 1 && stripBrackets(parts[0]) != "" {
		// Concatenate Type and Base Name (e.g., "Enhanced" + " Jet Propulsion")
		enchName = stripBrackets(parts[0]) + baseName
	} else {
		// If Type is missing, use the default name
		enchName = "Jet Propulsion"
	}

	// Since this is a static effect, Amount and Bonus remain empty.
	return &api.Enchantment{
		Name: enchName,
	}
}

func parseTemplateElementalAbsorb(rawAbsorbValue string) *api.Enchantment {
	const prefix = "{{ElementalAbsorb|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawAbsorbValue, prefix) || !strings.HasSuffix(rawAbsorbValue, suffix) {
		return nil
	}

	paramList := rawAbsorbValue[len(prefix) : len(rawAbsorbValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Element)|(Enhancement Amount)|(Title)|(Bonus Type)

	// Ensure minimum required field (Element) is present
	if len(parts) < 1 {
		return nil
	}

	element := stripBrackets(parts[0])
	if element == "" {
		return nil
	}

	if element == "Electricity" || element == "Electrical" {
		element = "Electric"
	}

	var amount string
	var name string
	var bonusType string

	// 2. Enhancement Amount (Required for percentage, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1]) + "%"
	}

	// 3. Title (Optional, Index 2)
	if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
		name = stripBrackets(parts[2]) // Use custom title
	} else {
		// Default name format: "[Element] Absorption"
		name = element + " Absorption"
	}

	// 4. Bonus Type (Optional, Index 3 - defaults to Enhancement)
	if len(parts) >= 4 {
		value := stripBrackets(parts[3])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		Element:   element,
	}
}

func parseTemplateSkill(rawSkillValue string) *api.Enchantment {
	const prefix = "{{Skill|"
	const suffix = "}}"
	const defaultBonusType = "Competence"

	if !strings.HasPrefix(rawSkillValue, prefix) || !strings.HasSuffix(rawSkillValue, suffix) {
		return nil
	}

	paramList := rawSkillValue[len(prefix) : len(rawSkillValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// 1. Skill (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	skillName := stripBrackets(parts[0])
	if skillName == "" {
		return nil
	}

	var amount string
	var bonusType string

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Competence)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      "Skill: " + skillName,
		Amount:    amount,
		BonusType: bonusType,
		// SkillName field is now omitted
	}
}

func parseTemplateElementalResistance(rawResistanceValue string) *api.Enchantment {
	const prefix = "{{ElementalResistance|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawResistanceValue, prefix) || !strings.HasSuffix(rawResistanceValue, suffix) {
		return nil
	}

	paramList := rawResistanceValue[len(prefix) : len(rawResistanceValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Element)|(Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Element (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	element := stripBrackets(parts[0])
	if element == "" {
		return nil
	}

	var amount string
	var name string
	var bonusType string

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		// If amount is missing, treat as invalid or skip (depends on expected data quality)
		return nil
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Enhancement)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 4. Title (Optional, Index 3) - overrides the standard Name if present
	if len(parts) >= 4 && stripBrackets(parts[3]) != "" {
		name = stripBrackets(parts[3]) // Use custom title
	} else {
		// Default name format: "[Element] Resistance"
		if strings.ToLower(element) == "all" {
			name = "Elemental Resistance"
		} else {
			name = element + " Resistance"
		}
	}

	// TODO: Return multiple enchantments for each element
	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		Element:   element,
	}
}

func parseTemplateAbility(rawAbilityValue string) *api.Enchantment {
	const prefix = "{{Ability|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawAbilityValue, prefix) || !strings.HasSuffix(rawAbilityValue, suffix) {
		return nil
	}

	paramList := rawAbilityValue[len(prefix) : len(rawAbilityValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Ability)|(Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Ability (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	abilityScore := stripBrackets(parts[0])
	if abilityScore == "" {
		return nil
	}

	var amount string
	var name string
	var bonusType string

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil // Amount is required
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Enhancement)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 4. Title (Optional, Index 3) - overrides the standard Name if present
	if len(parts) >= 4 && stripBrackets(parts[3]) != "" {
		name = stripBrackets(parts[3]) // Use custom title (e.g., "Curse of Clumsiness")
	} else {
		name = abilityScore
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		// AbilityScore field is now omitted
	}
}

func parseTemplateHealingAmp(rawAmpValue string) *api.Enchantment {
	const prefix = "{{HealingAmp|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawAmpValue, prefix) || !strings.HasSuffix(rawAmpValue, suffix) {
		return nil
	}

	paramList := rawAmpValue[len(prefix) : len(rawAmpValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Type of Healing)|(Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Type of Healing (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	healingType := stripBrackets(parts[0])
	if healingType == "" {
		return nil
	}

	var amount string
	var name string
	var bonusType string

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil // Amount is required
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Enhancement)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 4. Title (Optional, Index 3) - overrides the standard Name if present
	if len(parts) >= 4 && stripBrackets(parts[3]) != "" {
		name = stripBrackets(parts[3]) // Use custom title
	} else {
		// Handle "All" case specially
		if strings.ToLower(healingType) == "all" {
			name = "Healing Amplification" // The item description often omits the "All" prefix
		} else if strings.ToLower(healingType) == "repair" {
			name = "Repair Amplification"
		} else {
			name = healingType + " Healing Amplification"
		}
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateEnhancementBonus(rawBonusValue string, itemType string) []*api.Enchantment {
	const prefix = "{{EnhancementBonus|"
	const suffix = "}}"
	const bonusType = "Enhancement"

	if !strings.HasPrefix(rawBonusValue, prefix) || !strings.HasSuffix(rawBonusValue, suffix) {
		return nil
	}

	paramList := rawBonusValue[len(prefix) : len(rawBonusValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var enchantments []*api.Enchantment // Use slice of pointers

	// Normalize itemType for comparison
	itemType = strings.ToLower(itemType)

	// TODO: Need to make a slice of all weapon types, not just generic `weapon`
	// 1. Handle Armor/Shield bonus to AC
	if strings.Contains(itemType, "docent") || strings.Contains(itemType, "outfit") || strings.Contains(itemType, "robe") || strings.Contains(itemType, "armor") || strings.Contains(itemType, "shield") || strings.Contains(itemType, "buckler") {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Armor Class",
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// 2. Handle Weapon/Shield bonus to Attack and Damage Rolls
	if strings.Contains(itemType, "weapon") || strings.Contains(itemType, "shield") || strings.Contains(itemType, "rune") || strings.Contains(itemType, "buckler") {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Attack Rolls",
			Amount:    amount,
			BonusType: bonusType,
		})
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Damage",
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// If no specific item type was matched (e.g., Trinket, Doc is incomplete),
	// we still return what was collected, which might be an empty slice.

	return enchantments
}

func parseTemplateSheltering(rawShelteringValue string) []*api.Enchantment {
	const prefix = "{{Sheltering|"
	const suffix = "}}"
	const defaultRating = "Both"           // Default from documentation
	const defaultBonusType = "Enhancement" // Default from documentation

	var output []*api.Enchantment

	if !strings.HasPrefix(rawShelteringValue, prefix) || !strings.HasSuffix(rawShelteringValue, suffix) {
		return nil
	}

	paramList := rawShelteringValue[len(prefix) : len(rawShelteringValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Enhancement Amount)|(Rating)|(Bonus Type)|(Title)|(Text)

	var amount string
	var rating string
	var bonusType string

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount = stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	// 2. Rating (Index 1) - Default to "Both"
	if len(parts) >= 2 {
		rating = stripBrackets(parts[1])
		if rating == "" {
			rating = defaultRating
		}
	} else {
		rating = defaultRating
	}

	// 3. Bonus Type (Index 2) - Default to "Enhancement"
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
	}

	// We ensure "Both" is formatted correctly if it was the default or specified.
	if strings.ToLower(rating) == "both" {
		output = append(output, &api.Enchantment{
			Name:      "Physical Resistance Rating",
			Amount:    amount,
			BonusType: bonusType,
		})
		output = append(output, &api.Enchantment{
			Name:      "Magic Resistance Rating",
			Amount:    amount,
			BonusType: bonusType,
		})
	} else {
		output = append(output, &api.Enchantment{
			Name:      rating + " Resistance Rating",
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return output
}

func parseTemplateProofAgainstPoison(rawProofValue string) *api.Enchantment {
	const prefix = "{{ProofAgainstPoison|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement"  // Assumed default based on common DDO patterns
	const baseName = "Proof Against Poison" // TODO: Find the exact resistances from equipping item

	if !strings.HasPrefix(rawProofValue, prefix) || !strings.HasSuffix(rawProofValue, suffix) {
		return nil
	}

	paramList := rawProofValue[len(prefix) : len(rawProofValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Enhancement Amount)|(Bonus Type)

	var amount string
	var bonusType string

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount = stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateSpellFocus(rawFocusValue string) []*api.Enchantment {
	const prefix = "{{SpellFocus|"
	const suffix = "}}"
	const defaultBonusType = "Equipment" // Default from documentation

	if !strings.HasPrefix(rawFocusValue, prefix) || !strings.HasSuffix(rawFocusValue, suffix) {
		return nil
	}

	paramList := rawFocusValue[len(prefix) : len(rawFocusValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (School)|(Enhancement Amount)|(Bonus Type)|(Title)

	// 1. School (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	school := stripBrackets(parts[0])
	if school == "" {
		return nil
	}

	var amount string
	var bonusType string
	var title string

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil // Amount is required
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Equipment)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 4. Title (Optional, Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	// --- MASTERY LOGIC ---
	if strings.EqualFold(school, "Mastery") {
		var enchantments []*api.Enchantment
		// Split the single Mastery enchantment into one entry for each school
		for _, schoolName := range spellSchools {
			name := fmt.Sprintf("Spell DC: %s", schoolName)
			// Use the generic title if it was provided
			if title != "" {
				name = title
			}

			enchantments = append(enchantments, &api.Enchantment{
				Name:      name,
				Amount:    amount,
				BonusType: bonusType,
			})
		}
		return enchantments
	}

	// --- Single School Logic ---
	var name string
	if title != "" {
		name = title // Use custom title
	} else {
		name = fmt.Sprintf("%s Focus", school)
	}

	return []*api.Enchantment{
		{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		},
	}
}

func parseTemplateGuardbreaking(rawGuardValue string) *api.Enchantment {
	const templateName = "Guardbreaking"
	const prefix = "{{" + templateName + "}}"

	// This template has no arguments, so we just check for the exact full string
	if strings.TrimSpace(rawGuardValue) != prefix {
		// If there are any characters inside the braces (which shouldn't happen based on docs)
		// we treat it as invalid, but if the prefix is found, we process it.
		logrus.Warnf("Invalid %s template: %s", templateName, rawGuardValue)
	}

	// Documentation: No arguments, just sets the Name.

	return &api.Enchantment{
		Name: templateName,
	}
}

func parseTemplateSpellPower(rawPowerValue string) []*api.Enchantment {
	const prefix = "{{SpellPower|"
	const suffix = "}}"
	const defaultBonusType = "Equipment"

	if !strings.HasPrefix(rawPowerValue, prefix) || !strings.HasSuffix(rawPowerValue, suffix) {
		return nil
	}

	paramList := rawPowerValue[len(prefix) : len(rawPowerValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	if len(parts) < 1 {
		return nil
	}
	powerTypeRaw := stripBrackets(parts[0])
	if powerTypeRaw == "" {
		return nil
	}

	var amount string
	var bonusType string

	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil
	}
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
	}

	var enchantments []*api.Enchantment

	// --- Generate Enchantment Objects ---
	elements := elementsMap[powerTypeRaw]
	if elements != nil {
		for _, elem := range elements {
			enchantments = append(enchantments, &api.Enchantment{
				Name:      strings.TrimSpace("Spell Power: " + elem),
				Amount:    amount,
				BonusType: bonusType,
			})
		}
	}

	return enchantments
}

func parseTemplateAC(rawACValue string) *api.Enchantment {
	const prefix = "{{AC|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawACValue, prefix) || !strings.HasSuffix(rawACValue, suffix) {
		return nil
	}

	paramList := rawACValue[len(prefix) : len(rawACValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Source)|(Enhancement Amount)|(Bonus Type)

	// 1. Source (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	acSource := stripBrackets(parts[0])
	if acSource == "" {
		return nil
	}

	var amount string
	var name string
	var bonusType string

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil // Amount is required
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Enhancement)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	normalizedSource := strings.ToLower(acSource)
	normalizedBonus := strings.ToLower(bonusType)

	// Define the required sets
	targetSources := map[string]bool{
		"natural armor": true,
		"shield":        true,
	}
	targetBonusTypes := map[string]bool{
		"artifact": true,
		"insight":  true,
		"profane":  true,
		"primal":   true,
	}

	if targetSources[normalizedSource] && targetBonusTypes[normalizedBonus] {
		// Prepend Bonus Type to the Source Name (e.g., "Insight Natural Armor")
		// and keep the Bonus field clean.
		name = fmt.Sprintf("%s %s", bonusType, acSource)
	} else {
		if normalizedSource == "rough hide" {
			name = bonusType
		} else {
			name = acSource
		}
	}

	return &api.Enchantment{
		Name:      "Armor Class",
		Amount:    amount,
		BonusType: name,
	}
}

func parseTemplateSpellPoints(rawSPValue string) *api.Enchantment {
	const prefix = "{{SpellPoints|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawSPValue, prefix) || !strings.HasSuffix(rawSPValue, suffix) {
		return nil
	}

	paramList := rawSPValue[len(prefix) : len(rawSPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Enhancement Amount)|(Bonus Type)|(Hide points in title)|(Value is percent)

	// 1. Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	spType := stripBrackets(parts[0])
	if spType == "" {
		return nil
	}

	var amount string
	var name string
	var bonusType string
	var isPercent = ""

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil // Amount is required
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Enhancement)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 5. Value is percent (Optional, Index 4)
	if len(parts) >= 5 {
		isPercent = stripBrackets(parts[4])
	}

	// --- CRITICAL NAME FORMATTING ---

	name = "Maximum Spell Points"

	// Add % suffix if Value is percent is set (regardless of HidePoints)
	if strings.EqualFold(isPercent, "true") || isPercent == "1" {
		amount = amount + "%"
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateFortification(rawFortValue string) *api.Enchantment {
	const prefix = "{{Fortification|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Fortification"

	if !strings.HasPrefix(rawFortValue, prefix) || !strings.HasSuffix(rawFortValue, suffix) {
		return nil
	}

	paramList := rawFortValue[len(prefix) : len(rawFortValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var name string
	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Title (Optional, Index 2) - overrides the standard Name if present
	if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
		name = stripBrackets(parts[2]) // Use custom title (e.g., "Fortification Penalty")
	} else {
		// Default name is just "Fortification"
		name = baseName
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

func parseTemplateActionBoostEnhancement(rawBoostValue string) *api.Enchantment {
	const prefix = "{{ActionBoostEnhancement|"
	const suffix = "}}"
	const baseName = "Action Boost Charges"

	if !strings.HasPrefix(rawBoostValue, prefix) || !strings.HasSuffix(rawBoostValue, suffix) {
		// Handle the case where the template is used without a pipe (e.g., {{ActionBoostEnhancement}})
		if strings.TrimSpace(rawBoostValue) == "{{ActionBoostEnhancement}}" {
			// Default case: Style is blank, which equals Normal
			return &api.Enchantment{Name: baseName, Amount: "3", BonusType: "Enhancement"}
		}
		return nil
	}

	paramList := rawBoostValue[len(prefix) : len(rawBoostValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Style)

	// 1. Style (Optional, Index 0)
	if len(parts) < 1 {
		return nil
	}

	var numCharges string

	switch stripBrackets(parts[0]) {
	case "Lesser":
		numCharges = "2"
	case "Minor":
		numCharges = "1"
	default:
		numCharges = "3"
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    numCharges,
		BonusType: "Enhancement",
	}
}

func parseTemplateArmorPiercing(rawAPValue string) *api.Enchantment {
	const prefix = "{{ArmorPiercing|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Fortification Bypass Chance"

	if !strings.HasPrefix(rawAPValue, prefix) || !strings.HasSuffix(rawAPValue, suffix) {
		return nil
	}

	paramList := rawAPValue[len(prefix) : len(rawAPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Amount)|(Bonus Type)

	// 1. Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// Name is always "Fortification Bypass Chance"
	name := baseName

	return &api.Enchantment{
		Name:      name,
		Amount:    amount + "%",
		BonusType: bonusType,
	}
}

func parseTemplateDodgeBypass(rawDBValue string) *api.Enchantment {
	const prefix = "{{DodgeBypass|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement"
	const defaultName = "Dodge Bypass"

	if !strings.HasPrefix(rawDBValue, prefix) || !strings.HasSuffix(rawDBValue, suffix) {
		return nil
	}

	paramList := rawDBValue[len(prefix) : len(rawDBValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType
	}

	return &api.Enchantment{
		Name:      defaultName,
		Amount:    amount + "%",
		BonusType: bonusType,
	}
}

func parseTemplateGoodluck(rawLuckValue string) []*api.Enchantment {
	const prefix = "{{goodluck|"
	const suffix = "}}"
	const bonusType = "Luck"

	if !strings.HasPrefix(strings.ToLower(rawLuckValue), prefix) || !strings.HasSuffix(rawLuckValue, suffix) {
		return nil
	}

	paramList := rawLuckValue[len(prefix) : len(rawLuckValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Enhancement Amount)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var enchantments []*api.Enchantment

	// --- 1. Generate entries for all three Saves ---
	for _, save := range saves {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      fmt.Sprintf("%s Saving Throws", save),
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// --- 2. Generate entry for Skill Checks ---
	for _, skill := range skills {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      fmt.Sprintf("Skill: %s", skill),
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateSpellLore(rawLoreValue string) []*api.Enchantment {
	const prefix = "{{SpellLore|"
	const suffix = "}}"
	const defaultBonusType = "Equipment" // Default from documentation

	if !strings.HasPrefix(rawLoreValue, prefix) || !strings.HasSuffix(rawLoreValue, suffix) {
		return nil
	}

	paramList := rawLoreValue[len(prefix) : len(rawLoreValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Group)|(Enhancement Amount)|(Bonus Type)|(Title)

	if len(parts) < 1 {
		return nil
	}
	groupTypeRaw := stripBrackets(parts[0])
	if groupTypeRaw == "" {
		return nil
	}

	var amount string
	var bonusType string

	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil
	}
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
	}

	var enchantments []*api.Enchantment

	// --- Generate Enchantment Objects ---
	elements := elementsMap[groupTypeRaw]
	if elements != nil {
		for _, elem := range elements {
			enchantments = append(enchantments, &api.Enchantment{
				Name:      strings.TrimSpace(elem + " Spell Critical Chance"),
				Amount:    amount,
				BonusType: bonusType,
			})
		}
	}

	return enchantments
}

// Template:SpellAugmentation
// Usage: {{SpellAugmentation|(Type)|(Spell Level)|(School)|(Title)|(Hide Class)}}
//   - Type: Basic (default), Lesser, Improved → maps to caster level bonus 2/1/3 respectively
//   - Spell Level: maximum level of spells affected (blank = all levels)
//   - School: school(s) of magic affected (blank = all schools)
//   - Title: optional override for name; otherwise name is "Spell Augmentation <Spell Level>" when level provided,
//     or just "Spell Augmentation" when not.
//   - Hide Class: when true-ish, omit the "sorcerer or wizard" wording in the notes.
func parseTemplateSpellAugmentation(raw string) *api.Enchantment {
	const prefix = "{{SpellAugmentation"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := []string{}
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	// Params: (Type)|(Spell Level)|(School)|(Title)|(Hide Class)
	typ := ""        // default Basic
	spellLevel := "" // optional
	school := ""     // optional
	title := ""      // optional
	hideClass := ""  // optional

	if len(parts) >= 1 {
		typ = stripBrackets(parts[0])
	}
	if len(parts) >= 2 {
		spellLevel = stripBrackets(parts[1])
	}
	if len(parts) >= 3 {
		school = stripBrackets(parts[2])
	}
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}
	if len(parts) >= 5 {
		hideClass = stripBrackets(parts[4])
	}

	// Map type → amount
	amount := "2" // Basic default
	switch strings.ToLower(strings.TrimSpace(typ)) {
	case "", "basic":
		amount = "2"
	case "lesser":
		amount = "1"
	case "improved":
		amount = "3"
	default:
		// Unknown value: keep default of 2
		amount = "2"
	}

	// Name resolution
	name := ""
	if title != "" {
		name = title
	} else if spellLevel != "" {
		name = "Spell Augmentation " + spellLevel
	} else {
		name = "Spell Augmentation"
	}

	// Build notes
	var noteParts []string
	// Class wording (unless hidden)
	hide := strings.ToLower(strings.TrimSpace(hideClass))
	classPhrase := "sorcerer or wizard "
	if hide == "true" || hide == "1" || hide == "yes" {
		classPhrase = ""
	}

	// Base sentence
	// Examples: "increases sorcerer or wizard caster level when casting fire spells levels 1-3 by two."
	// We'll use a concise standardized sentence.
	scope := "spells"
	if school != "" {
		scope = strings.ToLower(school) + " spells"
	}
	// Level scope
	levelScope := ""
	if spellLevel != "" {
		levelScope = " levels 1-" + spellLevel
	}
	noteParts = append(noteParts, fmt.Sprintf("Increases %scaster level when casting %s%s by +%s.", classPhrase, scope, levelScope, amount))

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: "Equipment",
		Notes:     new(strings.Join(noteParts, " ")),
	}
}

func parseTemplateDoubleshot(rawDSValue string) *api.Enchantment {
	const prefix = "{{Doubleshot|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawDSValue, prefix) || !strings.HasSuffix(rawDSValue, suffix) {
		return nil
	}

	paramList := rawDSValue[len(prefix) : len(rawDSValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      "Doubleshot Chance",
		Amount:    amount + "%",
		BonusType: bonusType,
	}
}

func parseTemplateFalseLife(rawFLValue string) *api.Enchantment {
	const prefix = "{{FalseLife|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawFLValue, prefix) || !strings.HasSuffix(rawFLValue, suffix) {
		// Handle argument-less case, though documentation suggests Type is first parameter
		if strings.TrimSpace(rawFLValue) == "{{FalseLife}}" {
			return &api.Enchantment{Name: "False Life"}
		}
		return nil
	}

	paramList := rawFLValue[len(prefix) : len(rawFLValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Bonus Type)|(Amount)|(Title)

	var bonusType string
	var amount string

	// The order in the template usage section is: (Type)|(Bonus Type)|(Amount)|(Title)
	// The order in the example usage section implies: (Type)|(Amount)|(Bonus Type)|(Title)
	// We will stick to the positional order listed in the USAGE section documentation: (Type)|(Bonus Type)|(Amount)|(Title)

	// 2. Bonus Type (Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		val := stripBrackets(parts[1])
		if val == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = val
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Amount (Index 2)
	if len(parts) >= 3 {
		amount = stripBrackets(parts[2])
		val := stripBrackets(parts[0])
		if val == "Conditioning" {
			amount = amount + "%"
		}
	}

	return &api.Enchantment{
		Name:      "Maximum Hit Points",
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateEnhancedKi(rawEKValue string) *api.Enchantment {
	const prefix = "{{EnhancedKi|"
	const suffix = "}}"
	const assumedBonusType = "Enhancement" // Assumed default for simple bonuses
	const baseName = "Enhanced Ki"

	if !strings.HasPrefix(rawEKValue, prefix) || !strings.HasSuffix(rawEKValue, suffix) {
		return nil
	}

	paramList := rawEKValue[len(prefix) : len(rawEKValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Value)

	// 1. Value (Enhancement Amount, Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: assumedBonusType,
		// All other fields remain empty.
	}
}

func parseTemplatePactDice(rawPDValue string) *api.Enchantment {
	const prefix = "{{PactDice|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Pact Dice"

	if !strings.HasPrefix(rawPDValue, prefix) || !strings.HasSuffix(rawPDValue, suffix) {
		return nil
	}

	paramList := rawPDValue[len(prefix) : len(rawPDValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateAccuracy(rawAccValue string) *api.Enchantment {
	const prefix = "{{Accuracy|"
	const suffix = "}}"
	const defaultBonusType = "Competence" // Default from documentation
	const baseName = "Attack Rolls"

	if !strings.HasPrefix(rawAccValue, prefix) || !strings.HasSuffix(rawAccValue, suffix) {
		return nil
	}

	paramList := rawAccValue[len(prefix) : len(rawAccValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Creature Types)|(Title)|(Specific time)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string
	var name string
	var creatureTypes = ""
	var specificTime = ""
	var baseTitle = baseName

	// 2. Bonus Type (Optional, Index 1 - defaults to Competence)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Creature Types (Optional, Index 2)
	if len(parts) >= 3 {
		creatureTypes = stripBrackets(parts[2])
	}

	// 4. Title (Optional, Index 3) - overrides the base Name
	if len(parts) >= 4 {
		baseTitle = stripBrackets(parts[3])
	} else {
		baseTitle = baseName
	}

	// 5. Specific time (Optional, Index 4)
	if len(parts) >= 5 {
		specificTime = stripBrackets(parts[4])
	}

	// --- CRITICAL NAME FORMATTING ---

	// Use Title if provided
	if baseTitle != baseName {
		name = baseTitle
	} else {
		// Construct standard name: "[Bonus] Accuracy" [vs Creature] [on Flanking]
		var nameParts []string

		nameParts = append(nameParts, baseName)

		if creatureTypes != "" {
			nameParts = append(nameParts, "vs "+creatureTypes)
		}

		if specificTime != "" {
			nameParts = append(nameParts, "("+specificTime+")")
		}

		name = strings.Join(nameParts, " ")
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are directly applicable or allowed.
	}
}

func parseTemplateUnconsciousRange(rawURValue string) *api.Enchantment {
	const prefix = "{{UnconsciousRange|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default is Enhancement
	const baseName = "Unconscious Range"

	if !strings.HasPrefix(rawURValue, prefix) || !strings.HasSuffix(rawURValue, suffix) {
		return nil
	}

	paramList := rawURValue[len(prefix) : len(rawURValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Value)|(Bonus Type)|(Healing Amount)|(Healing Rate)|(Title)

	// Initialize defaults
	var enchType = "default"
	var value = ""
	var bonusType string
	var healingAmount = ""
	var healingRate = ""

	// 1. Type (Index 0)
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			enchType = val
		}
	}

	// 2. Value (Index 1) - Required for non-default types, optional otherwise
	if len(parts) >= 2 {
		value = stripBrackets(parts[1])
	}

	// 3. Bonus Type (Index 2 - defaults to Enhancement)
	if len(parts) >= 3 {
		val := stripBrackets(parts[2])
		if val == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = val
		}
	} else {
		bonusType = defaultBonusType
	}

	// 4. Healing Amount (Index 3 - optional heal portion)
	if len(parts) >= 4 {
		healingAmount = stripBrackets(parts[3])
	}

	// 5. Healing Rate (Index 4 - optional, defaults to 10)
	if len(parts) >= 5 {
		healingRate = stripBrackets(parts[4])
	}

	var name string
	var amount string

	if strings.EqualFold(enchType, "Don't Count Me Out!") {
		amount = "400"
	} else if strings.EqualFold(enchType, "Weighty Asset") {
		amount = "100"
	} else {
		amount = value
	}

	if healingAmount != "" {
		if healingRate == "" {
			healingRate = "10" // Default rate
		}

		// Example: Unconscious Range [Type] [Value] + Heal N every X seconds
		name = fmt.Sprintf("%s + Heal %s every %s Seconds", name, healingAmount, healingRate)
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateSeeker(rawSeekerValue string) []*api.Enchantment {
	const prefix = "{{Seeker|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawSeekerValue, prefix) || !strings.HasSuffix(rawSeekerValue, suffix) {
		return nil
	}

	paramList := rawSeekerValue[len(prefix) : len(rawSeekerValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	var enchantments []*api.Enchantment

	// --- CRITICAL: Generate Two Separate Enchantments ---

	// 1. Critical Accuracy (Confirm Critical Hits)
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Critical Accuracy",
		Amount:    amount,
		BonusType: bonusType,
	})

	// 2. Critical Damage (Damage on Critical Hits)
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Critical Damage",
		Amount:    amount,
		BonusType: bonusType,
	})

	return enchantments
}

func parseTemplateSkillGroupBonus(rawSGBValue string) []*api.Enchantment {
	const prefix = "{{SkillGroupBonus|"
	const suffix = "}}"
	const defaultBonusType = "Competence" // Default from documentation

	if !strings.HasPrefix(rawSGBValue, prefix) || !strings.HasSuffix(rawSGBValue, suffix) {
		return nil
	}

	paramList := rawSGBValue[len(prefix) : len(rawSGBValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Skill Group)|(Amount)|(Bonus Type)|(Title)

	// 1. Skill Group (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	groupNameRaw := stripBrackets(parts[0])
	if groupNameRaw == "" {
		return nil
	}

	// 2. Amount (Required, Index 1)
	if len(parts) < 2 {
		return nil
	}
	amount := stripBrackets(parts[1])
	if amount == "" {
		return nil
	}

	var bonusType string
	var title string // Custom title can override the default group name.

	// 3. Bonus Type (Optional, Index 2 - defaults to Competence)
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
	}

	// 4. Title (Optional, Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	var enchantments []*api.Enchantment

	// --- Determine list of skills to generate ---

	// Normalize group name and look up the skill list
	skillList, exists := skillGroupsMap[groupNameRaw]
	if !exists {
		// If the group isn't defined, treat it as a single raw entry
		logrus.Warnf("Skill Group '%s' not recognized for expansion.\n", groupNameRaw)
		return nil
	}

	// --- Generate Enchantment Objects for each Skill ---

	for _, skill := range skillList {
		// Generate the name: Use custom title if provided, otherwise format the skill name.
		name := title
		if name == "" {
			name = fmt.Sprintf("Skill: %s", skill)
		}

		// Use the existing Skill parser's naming convention where possible, but here we enforce
		// a simple, uniform name for the skill group bonus.

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateOrbBonus(rawOrbValue string) []*api.Enchantment {
	const prefix = "{{OrbBonus|"
	const suffix = "}}"
	const bonusType = "Enhancement" // Assumed default

	if !strings.HasPrefix(rawOrbValue, prefix) || !strings.HasSuffix(rawOrbValue, suffix) {
		return nil
	}

	paramList := rawOrbValue[len(prefix) : len(rawOrbValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Enhancement Amount)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var enchantments []*api.Enchantment

	// --- 1. General Save Bonus (Applies to all saves) ---
	// Note: DDO items often list this once as "Orb Bonus" applying to saves.
	// For consistency with Goodluck, we will list the component saves.

	// Add entry for the general Orb Bonus Saves
	for _, save := range saves {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      fmt.Sprintf("%s Saving Throws", save),
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// --- 2. Elemental Resistances ---
	for _, element := range elements {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      fmt.Sprintf("%s Resistance", element),
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateVampirism(rawVampValue string) *api.Enchantment {
	const prefix = "{{Vampirism|"
	const suffix = "}}"
	const baseName = "Vampirism"

	if !strings.HasPrefix(rawVampValue, prefix) || !strings.HasSuffix(rawVampValue, suffix) {
		// Handle argument-less case, which defaults to Normal
		if strings.TrimSpace(rawVampValue) == "{{Vampirism}}" {
			return &api.Enchantment{Name: baseName, Amount: "1d2"}
		}
		return nil
	}

	paramList := rawVampValue[len(prefix) : len(rawVampValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Dice Count)

	var vampType string
	var diceCount = ""

	// 1. Type (Index 0)
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			vampType = val
		}
	}

	// 2. Dice Count (Index 1)
	if len(parts) >= 2 {
		diceCount = stripBrackets(parts[1])
	}

	name := baseName

	// --- CRITICAL NAME FORMATTING ---

	normalizedType := strings.ToLower(vampType)

	if normalizedType == "lesser" {
		// Example: Lesser Vampirism
		name = "Lesser " + baseName
	}

	return &api.Enchantment{
		Name:   name,
		Amount: diceCount + "d2", // Reuse Amount field to store the dice count, if any
		// All other fields remain empty.
	}
}

// TODO: Going to need to revisit this later
func parseTemplateOffensiveEffect(rawOEValue string) *api.Enchantment {
	const prefix = "{{OffensiveEffect|"
	const suffix = "}}"

	if !strings.HasPrefix(rawOEValue, prefix) || !strings.HasSuffix(rawOEValue, suffix) {
		return nil
	}

	paramList := rawOEValue[len(prefix) : len(rawOEValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Effect)|(Difficulty)|(Dice)|(Title)|(Intro Text)

	// 1. Effect (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	effect := stripBrackets(parts[0])
	if effect == "" {
		return nil
	}

	var difficulty = ""
	var title = ""
	var name string

	// 2. Difficulty (Optional, Index 1)
	if len(parts) >= 2 {
		difficulty = stripBrackets(parts[1])
	}

	// 4. Title (Optional, Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	// --- MAPPING AND NAME FORMATTING ---

	// Set Name based on Title, Effect, and Difficulty
	if title != "" {
		name = title // Use custom title
	} else {
		// Default name format: [Difficulty] [Effect]
		if strings.EqualFold(difficulty, "legendary") {
			name = "Legendary " + effect
		} else {
			name = effect
		}
	}

	return &api.Enchantment{Name: name}
}

func parseTemplateSpellSchoolSave(rawSaveValue string) []*api.Enchantment {
	const prefix = "{{SpellSchoolSave|"
	const suffix = "}}"
	const defaultBonusType = "Resistance" // Default from documentation

	if !strings.HasPrefix(rawSaveValue, prefix) || !strings.HasSuffix(rawSaveValue, suffix) {
		return nil
	}

	paramList := rawSaveValue[len(prefix) : len(rawSaveValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (School)|(Enhancement Amount)|(Bonus Type)|(Title)|(When)

	// 1. School (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	schoolRaw := stripBrackets(parts[0])
	if schoolRaw == "" {
		return nil
	}

	var amount string
	var bonusType string
	var title string // We'll use this as the custom prefix/name if present
	var when string

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil // Amount is required
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Resistance)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 4. Title (Optional, Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	// 5. When (Optional, Index 4)
	if len(parts) >= 5 {
		when = stripBrackets(parts[4])
	}

	// --- CRITICAL SPLIT AND NAMING LOGIC ---

	// 1. Determine the display name for the save type (Magic, Enchantment, etc.)
	saveDisplayType := schoolRaw
	if mappedType, ok := saveSchoolMap[schoolRaw]; ok {
		saveDisplayType = mappedType
	}

	var enchantments []*api.Enchantment

	for _, saveBase := range saves {
		// Default Name: [Base Save] ([Display Type]) Saving Throws
		name := fmt.Sprintf("%s (%s) Saving Throws", saveBase, saveDisplayType)

		// Use custom Title as the primary Name if provided, optionally appending the condition
		if title != "" {
			if when != "" {
				name = fmt.Sprintf("%s (When %s)", name, when)
			}
		} else if when != "" {
			// Append condition to the default generated name
			name = fmt.Sprintf("%s (When %s)", name, when)
		}

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateRuneArmImbue(rawImbueValue string) *api.Enchantment {
	const prefix = "{{RuneArmImbue|"
	const suffix = "}}"
	const baseName = "Rune Arm Imbue"

	if !strings.HasPrefix(rawImbueValue, prefix) || !strings.HasSuffix(rawImbueValue, suffix) {
		return nil
	}

	paramList := rawImbueValue[len(prefix) : len(rawImbueValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Damage Type)|(Damage Style)|(Magnitude)|(Damage Type Name)|(Creature)

	// 1. Damage Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	damageType := stripBrackets(parts[0])
	if damageType == "" {
		return nil
	}

	var damageStyle = ""
	var magnitude = ""
	var damageTypeName = ""
	var creature = ""
	var name string

	// 2. Damage Style (Optional, Index 1)
	if len(parts) >= 2 {
		damageStyle = stripBrackets(parts[1])
	}

	// 3. Magnitude (Optional, Index 2)
	if len(parts) >= 3 {
		magnitude = stripBrackets(parts[2])
	}

	// 4. Damage Type Name (Optional, Index 3) - Custom Name
	if len(parts) >= 4 {
		damageTypeName = stripBrackets(parts[3])
	}

	// 5. Creature (Optional, Index 4)
	if len(parts) >= 5 {
		creature = stripBrackets(parts[4])
	}

	// --- MAPPING AND NAME FORMATTING ---

	// Set Name based on custom name or standard format: "Rune Arm Imbue: [Damage Type] [Magnitude]"
	if damageTypeName != "" {
		name = damageTypeName // Use custom name
	} else {
		name = fmt.Sprintf("%s: %s %s", baseName, damageType, magnitude)
	}

	return &api.Enchantment{
		// Name is mandatory
		Name: name,

		// Map to existing fields
		Element: damageType, // Store the damage type (Fire, Force, etc.)

		// Map to NEW fields
		ImbueDamageStyle:    strings.TrimSpace(damageStyle),
		ImbueMagnitude:      strings.TrimSpace(magnitude),
		ImbueCreatureTarget: strings.TrimSpace(creature),

		// Amount/Bonus are unused/empty
	}
}

func parseSimpleTemplate(raw, prefix, name, notes string) *api.Enchantment {
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, "}}") {
		return nil
	}

	res := &api.Enchantment{
		Name: name,
	}
	if notes != "" {
		res.Notes = new(notes)
	}
	return res
}

func parseVariantTemplate(raw, prefix, name, notes, variant, variantName, variantNotes string) *api.Enchantment {
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, "}}") {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, "}}")

	resName := name
	resNotes := notes

	if strings.HasPrefix(content, "|") {
		v := strings.TrimSpace(strings.TrimPrefix(content, "|"))
		if strings.EqualFold(v, variant) {
			resName = variantName
			resNotes = variantNotes
		}
	}

	res := &api.Enchantment{
		Name: resName,
	}
	if resNotes != "" {
		res.Notes = new(resNotes)
	}
	return res
}

func parseTemplateTrueSeeing() *api.Enchantment {
	const templateName = "True Seeing"

	// Documentation: No arguments, just sets the Name.

	return &api.Enchantment{
		Name: templateName,
	}
}

func parseTemplateCombatMastery(rawCMValue string) []*api.Enchantment {
	const prefix = "{{CombatMastery|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawCMValue, prefix) || !strings.HasSuffix(rawCMValue, suffix) {
		return nil
	}

	paramList := rawCMValue[len(prefix) : len(rawCMValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	var enchantments []*api.Enchantment

	// --- CRITICAL: Generate Six Separate Enchantments ---
	for _, maneuver := range combatManeuvers {
		// Name format: "[Maneuver] DC"
		name := fmt.Sprintf("Tactical DC: %s", maneuver)

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateSpeed(rawSpeedValue string) []*api.Enchantment {
	const prefix = "{{Speed|"
	const suffix = "}}"
	const defaultAttackType = "Melee and Ranged"
	const baseBonusType = "Enhancement" // Default bonus type for the amount

	if !strings.HasPrefix(rawSpeedValue, prefix) || !strings.HasSuffix(rawSpeedValue, suffix) {
		// Handle argument-less case, though documentation suggests amount is required.
		if strings.TrimSpace(rawSpeedValue) == "{{Speed}}" {
			return []*api.Enchantment{{Name: "Speed"}}
		}
		return nil
	}

	paramList := rawSpeedValue[len(prefix) : len(rawSpeedValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Attack Type)|(Attack Speed)

	// 1. Enhancement Amount (Required, Index 0) - Applies to Movement Speed
	if len(parts) < 1 {
		return nil
	}
	movementAmount := stripBrackets(parts[0])
	if movementAmount == "" {
		return nil
	}

	var attackType string
	var attackAmount string // Optional override for Attack Speed amount

	// 2. Attack Type (Optional, Index 1 - defaults to Melee and Ranged)
	if len(parts) >= 2 {
		attackType = stripBrackets(parts[1])
		if attackType == "" {
			attackType = defaultAttackType
		}
	} else {
		attackType = defaultAttackType
	}

	// 3. Attack Speed (Optional, Index 2 - explicit attack speed amount)
	if len(parts) >= 3 {
		attackAmount = stripBrackets(parts[2])
	}

	var enchantments []*api.Enchantment

	// --- 1. Movement Speed Enhancement (Always present) ---
	if _, err := strconv.Atoi(movementAmount); err != nil {
		move := &api.Enchantment{
			Name:      "Movement Speed",
			BonusType: baseBonusType,
		}
		switch strings.ToLower(movementAmount) {
		case "i":
			move.Amount = "5%"
		case "ii":
			move.Amount = "10%"
		case "iii":
			move.Amount = "15%"
		case "iv":
			move.Amount = "20%"
		case "v":
			move.Amount = "25%"
		default:
			move.Amount = "30%"
		}

		enchantments = append(enchantments, move)

		// --- 2a. Attack Speed Enhancement (Conditional/Derived) ---
		if attackType == defaultAttackType || strings.ToLower(attackAmount) == "melee" {
			melee := &api.Enchantment{
				Name:      "Melee Attack Speed",
				BonusType: baseBonusType,
			}

			switch strings.ToLower(movementAmount) {
			case "i":
				melee.Amount = "1%"
			case "ii":
				melee.Amount = "2%"
			case "iii":
				melee.Amount = "3%"
			case "iv":
				melee.Amount = "4%"
			case "v":
				melee.Amount = "5%"
			default:
				melee.Amount = strconv.Itoa(romanToInt(movementAmount)) + "%"
			}
		}

		if attackType == defaultAttackType || strings.ToLower(attackAmount) == "ranged" {
			melee := &api.Enchantment{
				Name:      "Ranged Attack Speed",
				BonusType: baseBonusType,
			}

			switch strings.ToLower(movementAmount) {
			case "i":
				melee.Amount = "1%"
			case "ii":
				melee.Amount = "2%"
			case "iii":
				melee.Amount = "3%"
			case "iv":
				melee.Amount = "4%"
			case "v":
				melee.Amount = "5%"
			default:
				melee.Amount = strconv.Itoa(romanToInt(movementAmount)) + "%"
			}
		}
	} else {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Movement Speed",
			Amount:    movementAmount + "%",
			BonusType: baseBonusType,
		})

		// --- 2b. Attack Speed Enhancement (Conditional/Derived) ---
		if attackType == defaultAttackType || strings.ToLower(attackAmount) == "melee" {
			melee := &api.Enchantment{
				Name:      "Melee Attack Speed",
				BonusType: baseBonusType,
			}

			if attackAmount != "" {
				melee.Amount = attackAmount + "%"
			} else {
				amount, _ := strconv.Atoi(movementAmount)
				melee.Amount = strconv.Itoa(amount/2) + "%"
			}

			enchantments = append(enchantments, melee)
		}

		if attackType == defaultAttackType || strings.ToLower(attackAmount) == "melee" {
			ranged := &api.Enchantment{
				Name:      "Ranged Attack Speed",
				BonusType: baseBonusType,
			}

			if attackAmount != "" {
				ranged.Amount = attackAmount + "%"
			} else {
				amount, _ := strconv.Atoi(movementAmount)
				ranged.Amount = strconv.Itoa(amount/2) + "%"
			}

			enchantments = append(enchantments, ranged)
		}
	}

	return enchantments
}

func parseTemplateBloodRage(rawBRValue string) *api.Enchantment {
	const prefix = "{{BloodRage|"
	const suffix = "}}"
	const baseName = "Blood Rage"

	// Handle argument-less case, which defaults to Normal
	if strings.TrimSpace(rawBRValue) == "{{BloodRage}}" {
		return &api.Enchantment{Name: baseName}
	}

	if !strings.HasPrefix(rawBRValue, prefix) || !strings.HasSuffix(rawBRValue, suffix) {
		return nil
	}

	paramList := rawBRValue[len(prefix) : len(rawBRValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (type)

	var rageType = "" // Default is blank/Normal

	// 1. Type (Index 0)
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			rageType = val
		}
	}

	var name string
	normalizedType := strings.ToLower(rageType)

	if normalizedType == "enhanced" {
		name = "Enhanced " + baseName
	} else {
		// Default or blank type
		name = baseName
	}

	return &api.Enchantment{
		Name: name,
		// Amount and Bonus remain empty.
	}
}

func parseTemplateSpellPenetration(rawSPValue string) *api.Enchantment {
	const prefix = "{{SpellPenetration|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Spell Penetration (Level 9)"

	if !strings.HasPrefix(rawSPValue, prefix) || !strings.HasSuffix(rawSPValue, suffix) {
		return nil
	}

	paramList := rawSPValue[len(prefix) : len(rawSPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var name string
	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Title (Optional, Index 2) - overrides the standard Name if present
	if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
		name = stripBrackets(parts[2]) // Use custom title
	} else {
		// Default name is just "Spell Penetration"
		name = baseName
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateDodge(rawDodgeValue string) *api.Enchantment {
	const prefix = "{{Dodge|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Dodge"

	if !strings.HasPrefix(rawDodgeValue, prefix) || !strings.HasSuffix(rawDodgeValue, suffix) {
		return nil
	}

	paramList := rawDodgeValue[len(prefix) : len(rawDodgeValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount + "%",
		BonusType: bonusType,
	}
}

func parseTemplateDeadly(rawDeadlyValue string) *api.Enchantment {
	const prefix = "{{Deadly|"
	const suffix = "}}"
	const defaultBonusType = "Competence" // Default from documentation
	const baseName = "Damage"

	if !strings.HasPrefix(rawDeadlyValue, prefix) || !strings.HasSuffix(rawDeadlyValue, suffix) {
		return nil
	}

	paramList := rawDeadlyValue[len(prefix) : len(rawDeadlyValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Specific case)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var name string
	var bonusType string
	var specificCase string

	// 2. Bonus Type (Optional, Index 1 - defaults to Competence)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Specific case (Optional, Index 2)
	if len(parts) >= 3 {
		specificCase = stripBrackets(parts[2])
	}

	// --- CRITICAL NAME FORMATTING ---

	// Prepend a specific case if present (e.g., "Helpless Deadly")
	if specificCase != "" {
		name = fmt.Sprintf("%s vs %s", baseName, specificCase)
	} else {
		name = baseName
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateTemperanceOfBelief() *api.Enchantment {
	const templateName = "Magical Resistance"
	const amount = "1"
	const note = "Applies +" + amount + " per Religous Lore Feat"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name:   templateName,
		Amount: amount,
		Notes:  new(note),
		// All other fields remain empty.
	}
}

func parseTemplateReturning(rawRetValue string) *api.Enchantment {
	const prefix = "{{Returning|"
	const suffix = "}}"
	const baseName = "Returning"

	// Handle argument-less case, which defaults to 100%
	if strings.TrimSpace(rawRetValue) == "{{Returning}}" {
		return &api.Enchantment{
			Name:   baseName,
			Amount: "100", // Set Amount to 100
		}
	}

	if !strings.HasPrefix(rawRetValue, prefix) || !strings.HasSuffix(rawRetValue, suffix) {
		return nil
	}

	paramList := rawRetValue[len(prefix) : len(rawRetValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (percent)|(enchantment)

	var percent = "100" // Default is 100
	var isEnchantment = ""

	// 1. Percent (Optional, Index 0)
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			// The docs specify "leave blank is 100", so if True is here, percent is likely omitted
			if strings.EqualFold(val, "True") {
				isEnchantment = val
			} else {
				percent = val
			}
		}
	}

	// If the first field was the percent, check the second field for the boolean.
	// If the first field was True, the second field is the amount.
	if len(parts) >= 2 {
		val := stripBrackets(parts[1])
		if val != "" {
			// If the first param was True, this is the percent amount.
			if strings.EqualFold(parts[0], "True") {
				percent = val
			} else {
				// Otherwise, this is the boolean enchantment flag.
				isEnchantment = val
			}
		}
	}

	// --- CRITICAL NAME FORMATTING ---
	var name string

	// If 'enchantment' is True/1, the name is just "Returning"
	if strings.EqualFold(isEnchantment, "True") || isEnchantment == "1" {
		name = baseName
	} else {
		// Otherwise, it's descriptive
		name = fmt.Sprintf("%s (%s% Chance)", baseName, percent)
	}

	return &api.Enchantment{
		Name:   name,
		Amount: percent, // Store percent in the Amount field
	}
}

func parseTemplateGhostly(rawGhostValue string) []*api.Enchantment {
	const prefix = "{{Ghostly|"
	const suffix = "}}"
	const defaultMissChance = "10"
	const defaultSkillBonus = "5"
	const skillBonusType = "Enhancement" // Implied by example usage: "+5 enhancement bonus to your Hide and Move Silently skills"

	// Handle argument-less case, which uses all defaults
	if strings.TrimSpace(rawGhostValue) == "{{Ghostly}}" {
		// Set defaults
		missChance := defaultMissChance
		skillBonus := defaultSkillBonus

		// Generate results from the defaults
		var enchantments []*api.Enchantment

		// 1. Miss Chance Effect
		enchantments = append(enchantments, &api.Enchantment{
			Name:   "Ghostly (Miss Chance)",
			Amount: missChance, // Stores 10 (for 10%)
		})

		// 2. Skill Bonuses
		for _, skill := range ghostlySkills {
			name := "Skill: " + skill
			enchantments = append(enchantments, &api.Enchantment{
				Name:      name,
				Amount:    skillBonus,
				BonusType: skillBonusType,
			})
		}
		return enchantments
	}

	if !strings.HasPrefix(rawGhostValue, prefix) || !strings.HasSuffix(rawGhostValue, suffix) {
		return nil
	}

	paramList := rawGhostValue[len(prefix) : len(rawGhostValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Miss Chance)|(Bonus to Skills)|(Title)

	var missChance string
	var skillBonus string
	var title string

	// 1. Miss Chance (Index 0)
	if len(parts) >= 1 {
		missChance = stripBrackets(parts[0])
		if missChance == "" {
			missChance = defaultMissChance
		}
	} else {
		missChance = defaultMissChance
	}

	// 2. Bonus to Skills (Index 1)
	if len(parts) >= 2 {
		skillBonus = stripBrackets(parts[1])
		if skillBonus == "" {
			skillBonus = defaultSkillBonus
		}
	} else {
		skillBonus = defaultSkillBonus
	}

	// 3. Title (Index 2)
	if len(parts) >= 3 {
		title = stripBrackets(parts[2])
	}

	var enchantments []*api.Enchantment

	// --- Generate Enchantment Objects ---

	// 1. Miss Chance Effect
	finalMissChanceName := "Ghostly (Miss Chance)"
	if title != "" {
		finalMissChanceName = title // Use custom title only for the main effect
	}

	enchantments = append(enchantments, &api.Enchantment{
		Name:      finalMissChanceName,
		Amount:    missChance, // Stores the percentage value
		BonusType: "",         // No bonus type specified for the miss chance itself
	})

	// 2. Skill Bonuses (Uses the standard naming convention established for Template:Skill)
	for _, skill := range ghostlySkills {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Skill: " + skill,
			Amount:    skillBonus,
			BonusType: skillBonusType,
		})
	}

	return enchantments
}

func parseTemplateMurderous(rawMValue string) *api.Enchantment {
	const prefix = "{{Murderous|"
	const suffix = "}}"
	const baseName = "Murderous"

	if !strings.HasPrefix(rawMValue, prefix) || !strings.HasSuffix(rawMValue, suffix) {
		return nil
	}

	paramList := rawMValue[len(prefix) : len(rawMValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Title)

	// 1. Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	mType := stripBrackets(parts[0])
	if mType == "" {
		return nil
	}

	var name string
	var title string

	// 2. Title (Optional, Index 1)
	if len(parts) >= 2 {
		title = stripBrackets(parts[1])
	}

	// --- MAPPING AND NAME FORMATTING ---

	// 1. Determine the base damage type for classification (Element field)
	damageType := mType
	if dt, ok := murderousTypeToDamage[mType]; ok {
		damageType = dt
	}

	// 2. Determine the final display name
	if title != "" {
		name = title // Use custom title
	} else {
		// Default name format: "Murderous [Type]" (e.g., "Murderous Point")
		name = baseName + " " + mType
	}

	return &api.Enchantment{
		Name:    name,
		Element: damageType, // Store Piercing/Slashing/Bludgeoning here
		// All other fields remain empty.
	}
}

func parseTemplateRevelInBlood(rawRBValue string) *api.Enchantment {
	const prefix = "{{RevelInBlood|"
	const suffix = "}}"
	const baseName = "Revel in Blood"

	if !strings.HasPrefix(rawRBValue, prefix) || !strings.HasSuffix(rawRBValue, suffix) {
		return nil
	}

	paramList := rawRBValue[len(prefix) : len(rawRBValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Title)

	// 1. Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	rbType := stripBrackets(parts[0])
	if rbType == "" {
		return nil
	}

	var name string
	var title string

	// 2. Title (Optional, Index 1)
	if len(parts) >= 2 {
		title = stripBrackets(parts[1])
	}

	// --- MAPPING AND NAME FORMATTING ---

	// 1. Determine the base damage type for classification (Element field)
	damageType := rbType
	if dt, ok := revelInBloodTypeToDamage[rbType]; ok {
		damageType = dt
	}

	// 2. Determine the final display name
	if title != "" {
		name = title // Use custom title
	} else {
		// Default name format: "Revel in Blood (Slashing)"
		name = fmt.Sprintf("%s (%s)", baseName, rbType)
	}

	return &api.Enchantment{
		// Name is mandatory
		Name:    name,
		Element: damageType, // Store the corresponding elemental/physical damage type
		// All other fields remain empty.
	}
}

func parseTemplateBottledHeart() []*api.Enchantment {
	const bonusType = "Legendary" // Fixed bonus type from example

	var enchantments []*api.Enchantment

	// 1. Melee Threat Generation Bonus
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Melee Threat Generation",
		Amount:    "100%", // Fixed amount from example
		BonusType: bonusType,
	})

	// 2. Intimidate Skill Bonus (Following the Skill naming convention: "Intimidate Skill")
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Skill: Intimidate",
		Amount:    "10", // Fixed amount from example
		BonusType: bonusType,
	})

	return enchantments
}

func parseTemplateParrying(rawPValue string) []*api.Enchantment {
	const prefix = "{{Parrying|"
	const suffix = "}}"
	const bonusType = "Insight" // Assumed default from example usage
	const baseName = "Parrying"

	// Handle argument-less case
	if strings.TrimSpace(rawPValue) == "{{Parrying}}" {
		return nil // Should be rare, but no enhancement amount means no bonus.
	}

	if !strings.HasPrefix(rawPValue, prefix) || !strings.HasSuffix(rawPValue, suffix) {
		return nil
	}

	paramList := rawPValue[len(prefix) : len(rawPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Version)

	// 1. Version (Enhancement Amount, Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	// Normalize Roman Numerals (e.g., 'III' or '3') into the primary Name
	if _, err := strconv.Atoi(amount); err != nil {
		amount = strconv.Itoa(romanToInt(amount))
	}

	var enchantments []*api.Enchantment

	// --- CRITICAL: Generate Four Separate Enchantments ---

	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Armor Class",
		Amount:    amount,
		BonusType: bonusType,
	})

	for _, effect := range saves {
		// Save bonuses
		enchantments = append(enchantments, &api.Enchantment{
			Name:      fmt.Sprintf("%s Saving Throws", effect),
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateDeathblock(rawDBValue string) []*api.Enchantment {
	const prefix = "{{Deathblock|"
	const suffix = "}}"
	const baseName = "Deathblock"
	const absorptionName = "Negative Energy Absorption"
	const absorptionBonusType = "Enhancement"
	const absorptionElement = "Negative Energy"

	// Handle argument-less case, which means full immunity without the absorption bonus
	if strings.TrimSpace(rawDBValue) == "{{Deathblock}}" {
		return []*api.Enchantment{
			{
				Name: baseName, // Provides the core immunity effect
			},
		}
	}

	if !strings.HasPrefix(rawDBValue, prefix) || !strings.HasSuffix(rawDBValue, suffix) {
		return nil
	}

	paramList := rawDBValue[len(prefix) : len(rawDBValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Magnitude)

	// 1. Magnitude (Index 0) - This is the version number, not the final amount.
	if len(parts) < 1 {
		return nil
	}
	magnitude := stripBrackets(parts[0])
	if magnitude == "" {
		return nil
	}

	magnitude = strconv.Itoa(romanToInt(magnitude) * 3)

	// The amount of absorption (9%) is hardcoded/derived based on the magnitude/type (e.g., Deathblock III is 9%)
	// Since we don't have a conversion table, we must assume the typical/documented values.
	// For Deathblock III (or similar Roman numeral usage), the value is typically +9%.
	const absorptionAmount = "9%"

	var enchantments []*api.Enchantment

	// --- 1. Core Immunity Effect (Always present if template is used) ---
	enchantments = append(enchantments, &api.Enchantment{
		Name: baseName,
	})

	// --- 2. Negative Energy Absorption Bonus (Conditional on Magnitude being present) ---
	// The presence of a Magnitude typically implies the Negative Energy Absorption bonus.

	// Add entry for the Negative Energy Absorption bonus
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Negative Energy Absorption",
		Amount:    magnitude + "%",
		BonusType: absorptionBonusType,
		Element:   absorptionElement,
	})

	return enchantments
}

func parseTemplateFeatherFalling(rawFFValue string) *api.Enchantment {
	const templateName = "Feather Falling"
	const prefix = "{{" + templateName + "}}"

	// This template has no arguments, so we just check for the exact full string
	if strings.TrimSpace(rawFFValue) != prefix {
		// Since the name in the docs uses a space, we check for both {{FeatherFalling}} and {{Feather Falling}}
		if strings.TrimSpace(strings.ReplaceAll(rawFFValue, " ", "")) != "{{FeatherFalling}}" {
			return nil
		}
	}

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

func parseTemplateProficiency(rawProfValue string) *api.Enchantment {
	const prefix = "{{Proficiency|"
	const suffix = "}}"
	const baseName = "Proficiency"

	if !strings.HasPrefix(rawProfValue, prefix) || !strings.HasSuffix(rawProfValue, suffix) {
		return nil
	}

	paramList := rawProfValue[len(prefix) : len(rawProfValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Feat)

	// 1. Feat (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	feat := stripBrackets(parts[0])
	if feat == "" {
		return nil
	}

	var name string

	// Default name format: "Proficiency: [Feat]"
	name = fmt.Sprintf("%s: %s", baseName, feat)

	return &api.Enchantment{
		Name: name,
		// All other fields remain empty.
	}
}

// Legacy Deception parser kept for backward compatibility in case other
// code paths referenced it in the past. New logic is implemented in
// parseTemplateDeception (plural-output) below.
func parseTemplateDeceptionLegacy(rawDecValue string) *api.Enchantment {
	const prefix = "{{Deception|"
	const suffix = "}}"
	const baseName = "Deception"
	const defaultImprovedAmount = "5"
	const defaultBonusType = "Competence"

	if !strings.HasPrefix(rawDecValue, prefix) || !strings.HasSuffix(rawDecValue, suffix) {
		// Handle argument-less case
		if strings.TrimSpace(rawDecValue) == "{{Deception}}" {
			return &api.Enchantment{Name: baseName}
		}
		return nil
	}

	paramList := rawDecValue[len(prefix) : len(rawDecValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Enhancement Amount)|(Bonus Type)|(Damage)|(Title)

	// Initialize fields
	var enchType = ""
	var amount = ""
	var bonusType = defaultBonusType
	var damage = ""
	var title = ""

	// 1. Type (Index 0)
	if len(parts) >= 1 {
		enchType = stripBrackets(parts[0])
		switch enchType {
		case "New Improved":
			fallthrough
		case "Improved":
			enchType = "Improved Deception"
		case "Classic":
			fallthrough
		case "Historic":
			fallthrough
		case "Custom":
			fallthrough
		default:
			enchType = "Deception"
		}
	}

	// 2. Enhancement Amount (Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	}

	// 3. Bonus Type (Index 2)
	if len(parts) >= 3 {
		val := stripBrackets(parts[2])
		if val != "" {
			bonusType = val
		}
	}

	// 4. Damage (Index 3)
	if len(parts) >= 4 {
		damage = stripBrackets(parts[3])
	}

	// 5. Title (Index 4)
	if len(parts) >= 5 {
		title = stripBrackets(parts[4])
	}

	// --- CONDITIONAL LOGIC & DEFAULTING ---

	normalizedType := strings.ToLower(enchType)

	// Handle specific types that imply default values
	if normalizedType == "improved" || normalizedType == "new improved" {
		if amount == "" {
			amount = defaultImprovedAmount
		}
	}

	// --- NAME FORMATTING ---

	var name string

	if title != "" {
		name = title
	} else {
		// Default name: [Type] Deception
		if enchType != "" {
			name = enchType
		} else {
			name = baseName
		}
	}

	// --- COMPLEX FIELD CONSOLIDATION ---

	// If Damage is specified (Classic/Custom), we must append it to Name or use AdditionalText
	if damage != "" {
		// We use AdditionalText to convey the damage component, as the main Amount field
		// is reserved for the Hit Bonus. This adheres to the no-new-fields rule.
		return &api.Enchantment{
			Name:      name,
			Amount:    amount, // Hit Bonus (e.g., +10)
			BonusType: bonusType,
		}
	}

	// Final simplified return (standard format)
	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateDoublestrike(rawDSValue string) *api.Enchantment {
	const prefix = "{{Doublestrike|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Doublestrike Chance"

	if !strings.HasPrefix(rawDSValue, prefix) || !strings.HasSuffix(rawDSValue, suffix) {
		return nil
	}

	paramList := rawDSValue[len(prefix) : len(rawDSValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Title)|(Requirement)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string
	var requirement string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 4. Requirement (Optional, Index 3)
	if len(parts) >= 4 {
		requirement = stripBrackets(parts[3])
	}

	// --- CRITICAL NAME FORMATTING ---

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount + "%",
		BonusType: bonusType,
		Notes:     &requirement,
	}
}

// Template:RuneArmRechargeRate
// Usage (per screenshot): {{RuneArmRechargeRate|(Value)|(Bonus Type)}}
// Behavior:
//   - Name must be exactly: "Rune Arm Recharge Rate".
//   - Amount should contain a percentage (e.g., "30%"). If the input already
//     includes a '%', preserve/normalize it; otherwise, append '%'.
//   - Bonus Type should be wired; defaults to "Enhancement" when not specified.
func parseTemplateRuneArmRechargeRate(raw string) *api.Enchantment {
	const prefix = "{{RuneArmRechargeRate"
	const suffix = "}}"
	const baseName = "Rune Arm Recharge Rate"
	const defaultBonusType = "Enhancement"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract inner params
	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}
	if inner == "" {
		// No params → cannot infer magnitude
		return nil
	}

	parts := strings.Split(inner, "|")
	// 1. Value (required)
	val := stripBrackets(parts[0])
	val = strings.TrimSpace(val)
	if val == "" {
		return nil
	}
	// Normalize amount with %
	amount := val
	if strings.Contains(amount, "%") {
		amount = strings.ReplaceAll(amount, " ", "")
	} else {
		amount = amount + "%"
	}

	// 2. Bonus Type (optional, defaults to Enhancement)
	bonusType := defaultBonusType
	if len(parts) >= 2 {
		bt := strings.TrimSpace(stripBrackets(parts[1]))
		if bt != "" {
			bonusType = bt
		}
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateItemFeat(rawIFValue string) *api.Enchantment {
	const prefix = "{{ItemFeat|"
	const suffix = "}}"
	const baseName = "Feat"

	if !strings.HasPrefix(rawIFValue, prefix) || !strings.HasSuffix(rawIFValue, suffix) {
		return nil
	}

	paramList := rawIFValue[len(prefix) : len(rawIFValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Feat)|(bonus)|(title)|(link)

	// 1. Feat (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	feat := stripBrackets(parts[0])
	if feat == "" {
		return nil
	}

	var title string
	var name string

	// 3. Title (Optional, Index 2)
	if len(parts) >= 3 {
		title = stripBrackets(parts[2])
	}

	// --- CRITICAL NAME FORMATTING ---

	if title != "" {
		name = title // Use custom title
	} else {
		// Default name format: Feat: [Feat Name]
		name = fmt.Sprintf("%s: %s", baseName, feat)
	}

	return &api.Enchantment{
		Name: name,
	}
}

// Template:ItemSet
// Usage examples:
//
//	{{ItemSet|Epic Griffon}}
//	{{ItemSet|Way of the Sun Soul}}
//	{{ItemSet|Vol's Influence|True}}
//
// Params: (Set Name)|(Disable Category)|(Disable Title)
// We only care about the Set Name, and we disregard any Disable* params.
func parseTemplateItemSet(rawISValue string) *api.Enchantment {
	const prefix = "{{ItemSet|"
	const suffix = "}}"

	if !strings.HasPrefix(rawISValue, prefix) || !strings.HasSuffix(rawISValue, suffix) {
		return nil
	}

	paramList := rawISValue[len(prefix) : len(rawISValue)-len(suffix)]
	parts := strings.Split(paramList, "|")
	if len(parts) < 1 {
		return nil
	}
	setName := stripBrackets(parts[0])
	if setName == "" {
		return nil
	}

	// Return an Enchantment that carries the set name in a dedicated field so
	// downstream processors can populate setBonus consistently.
	return &api.Enchantment{
		Name:         "Item Set: " + setName, // keep textual marker for backward compat
		SetBonusName: setName,
	}
}

// ExtractSetBonus scans a list of enchantments and separates out any Item Set
// markers into a normalized []api.SetBonusOut. It returns the remaining
// enchantments (with set markers removed) and the set bonuses (singular entry by default).
// If multiple ItemSet markers are present, all are converted.
func ExtractSetBonus(in []api.Enchantment) (rest []api.Enchantment, sets []api.SetBonusOut) {
	if len(in) == 0 {
		return nil, nil
	}
	rest = make([]api.Enchantment, 0, len(in))
	for _, e := range in {
		setName := e.SetBonusName
		if setName == "" {
			// Fallback for older callers: detect by name prefix
			if strings.HasPrefix(e.Name, "Item Set: ") {
				setName = strings.TrimSpace(strings.TrimPrefix(e.Name, "Item Set: "))
			}
		}
		if setName != "" {
			// Normalize into SetBonusOut; leave enhancements/numPieces empty for now
			sets = append(sets, api.SetBonusOut{Name: setName})
			continue
		}
		rest = append(rest, e)
	}
	return rest, sets
}

// Template:LitanyAbilityBonus
// Usage per docs: {{LitanyAbilityBonus|Magnitude}}
// - Magnitude is a Roman numeral I..II indicating the version on the weapon.
// - Grants a +[Magnitude] Profane bonus to all ability scores.
// We emit six standard ability bonuses: Strength, Dexterity, Constitution,
// Intelligence, Wisdom, Charisma.
func parseTemplateLitanyAbilityBonus(raw string) []*api.Enchantment {
	const prefix = "{{LitanyAbilityBonus|"
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return nil
	}
	params := raw[len(prefix) : len(raw)-len(suffix)]
	magnitude := stripBrackets(params)
	if magnitude == "" {
		return nil
	}
	// Convert Roman numeral (I/II) to integer string
	// If already numeric, keep as-is.
	magInt := romanToInt(magnitude)
	if magInt <= 0 {
		// try parse numeric fallback
		if n, err := strconv.Atoi(magnitude); err == nil {
			magInt = n
		}
	}
	if magInt <= 0 {
		return nil
	}
	amount := strconv.Itoa(magInt)

	abilities := []string{"Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"}
	out := make([]*api.Enchantment, 0, len(abilities))
	for _, ab := range abilities {
		out = append(out, &api.Enchantment{
			Name:      ab,
			Amount:    amount,
			BonusType: "Profane",
		})
	}
	return out
}

// Template:WildEmpathy
// Usage per docs: {{WildEmpathy|(Enhancement Amount)|(Bonus Type)}}
// Example: {{WildEmpathy|3}} -> Wild Empathy +3: +3 Enhancement bonus to Wild Empathy Charges.
// Parsed as a standard enchantment with:
//
//	Name: "Wild Empathy Charges"
//	Amount: first parameter (e.g., "3")
//	Bonus: optional second parameter (defaults to "Enhancement")
func parseTemplateWildEmpathy(rawWEValue string) *api.Enchantment {
	const prefix = "{{WildEmpathy|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement"
	const baseName = "Wild Empathy Charges"

	if !strings.HasPrefix(rawWEValue, prefix) || !strings.HasSuffix(rawWEValue, suffix) {
		return nil
	}

	paramList := rawWEValue[len(prefix) : len(rawWEValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	bonusType := defaultBonusType
	if len(parts) >= 2 {
		if bt := stripBrackets(parts[1]); bt != "" {
			bonusType = bt
		}
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
	}
}

// Template:Anger
// Documentation screenshot indicates:
//
//	{{Anger}} -> increases total number of Rages you can use by 3 (basic)
//	{{Anger|Minor}} -> increases by 1
//	Type parameter values: Minor, Basic, Lesser (default Basic if blank)
//
// We emit a single standard enchantment:
//
//	Name: "Rage Charges"
//	Amount: "1" | "2" | "3" depending on the type
func parseTemplateAnger(raw string) *api.Enchantment {
	const prefix = "{{Anger"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract parameter section (if any)
	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if inner == "" { // no params
		return &api.Enchantment{Name: "Rage Charges", Amount: "3"}
	}

	// If there's a leading pipe, trim it
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	// Only first parameter matters per docs
	parts := strings.SplitN(inner, "|", 2)
	t := stripBrackets(parts[0])
	tLower := strings.ToLower(strings.TrimSpace(t))

	// Map type to charges
	amount := "3" // default Basic
	switch tLower {
	case "minor":
		amount = "1"
	case "lesser":
		amount = "2"
	case "basic", "":
		amount = "3"
	default:
		// If a number is provided unexpectedly, pass it through
		if _, err := strconv.Atoi(tLower); err == nil {
			amount = tLower
		}
	}

	return &api.Enchantment{
		Name:   "Rage Charges",
		Amount: amount,
	}
}

func parseTemplateReinforcedFists(rawRFValue string) *api.Enchantment {
	const prefix = "{{ReinforcedFists|"
	const suffix = "}}"
	const baseName = "Reinforced Fists"

	// Handle argument-less case, which defaults to Normal
	if strings.TrimSpace(rawRFValue) == "{{ReinforcedFists}}" {
		return &api.Enchantment{
			Name: baseName,
		}
	}

	if !strings.HasPrefix(rawRFValue, prefix) || !strings.HasSuffix(rawRFValue, suffix) {
		return nil
	}

	paramList := rawRFValue[len(prefix) : len(rawRFValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)

	var rfType = "Normal" // Default is Normal

	// 1. Type (Index 0)
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			rfType = val
		}
	}

	// --- CRITICAL NAME FORMATTING ---

	name := baseName

	// Default name format: "[Type] Reinforced Fists"
	if !strings.EqualFold(rfType, "Normal") {
		name = cases.Title(language.English).String(strings.ToLower(rfType)) + " " + baseName
	}

	return &api.Enchantment{
		Name: name,
		// All other fields remain empty.
	}
}

func parseTemplateSoundproof() *api.Enchantment {
	const templateName = "Soundproof"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

func parseTemplateEfficientMetamagic(rawEMValue string) *api.Enchantment {
	const prefix = "{{EfficientMetamagic|"
	const suffix = "}}"
	const baseName = "Efficient Metamagic"

	if !strings.HasPrefix(rawEMValue, prefix) || !strings.HasSuffix(rawEMValue, suffix) {
		return nil
	}

	paramList := rawEMValue[len(prefix) : len(rawEMValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Metamagic)|(Magnitude)|(Title)|(Info)

	// 1. Metamagic (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	metamagic := stripBrackets(parts[0])
	if metamagic == "" {
		return nil
	}

	var magnitude int
	var title string
	var info string
	var name string

	// 2. Magnitude (Required, Index 1) - Roman numeral I to IV
	if len(parts) >= 2 {
		magnitude = romanToInt(stripBrackets(parts[1]))
	} else {
		return nil // Magnitude is required
	}

	// 3. Title (Optional, Index 2)
	if len(parts) >= 3 {
		title = stripBrackets(parts[2])
	}

	// 4. Info (Optional, Index 3) - Descriptive text
	if len(parts) >= 4 {
		info = stripBrackets(parts[3])
	}

	// --- CRITICAL NAME FORMATTING ---

	if title != "" {
		name = title // Use custom title
	} else {
		// Default name format: Efficient Metamagic - [Metamagic] [Magnitude]
		name = fmt.Sprintf("%s Spell (Cost Reduction)", metamagic)
	}

	return &api.Enchantment{
		Name:      name,
		BonusType: "Enhancement",
		Amount:    strconv.Itoa(magnitude),
		// Amount is implicitly the SP cost reduction, which we don't have a direct number for, so we leave it empty.
		// Bonus Type is also not applicable.

		// Consolidate 'Info' text into AdditionalText
		Notes: &info,
	}
}

func parseTemplateEversight(rawEValue string) []*api.Enchantment {
	const templateName = "Eversight"
	const prefix = "{{" + templateName + "}}"

	// This template has no arguments, so we just check for the exact full string
	if strings.TrimSpace(rawEValue) != prefix {
		return nil
	}

	var enchantments []*api.Enchantment

	// 1. True Seeing Effect
	enchantments = append(enchantments, &api.Enchantment{
		Name: "True Seeing",
		// Amount and Bonus are empty.
	})

	// 2. Immunity: Blindness Effect
	enchantments = append(enchantments, &api.Enchantment{
		Name: "Immunity: Blindness",
		// Amount and Bonus are empty.
	})

	return enchantments
}

func parseTemplateImmune(rawImmuneValue string) *api.Enchantment {
	const prefix = "{{Immune|"
	const suffix = "}}"
	const baseName = "Immunity"

	if !strings.HasPrefix(rawImmuneValue, prefix) || !strings.HasSuffix(rawImmuneValue, suffix) {
		return nil
	}

	paramList := rawImmuneValue[len(prefix) : len(rawImmuneValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Title)

	// 1. Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	immuneType := stripBrackets(parts[0])
	if immuneType == "" {
		return nil
	}

	var name string
	var title string

	// 2. Title (Optional, Index 1)
	if len(parts) >= 2 {
		title = stripBrackets(parts[1])
	}

	// --- CRITICAL NAME FORMATTING ---

	if title != "" {
		name = title // Use custom title
	} else {
		// Default name format: "Immunity: [Type]"
		name = fmt.Sprintf("%s: %s", baseName, immuneType)
	}

	return &api.Enchantment{
		Name: name,
		// All other fields remain empty.
	}
}

func parseTemplateEldritchBlastDice(rawEBDValue string) *api.Enchantment {
	const prefix = "{{EldritchBlastDice|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Eldritch Blast Dice"

	if !strings.HasPrefix(rawEBDValue, prefix) || !strings.HasSuffix(rawEBDValue, suffix) {
		return nil
	}

	paramList := rawEBDValue[len(prefix) : len(rawEBDValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

func parseTemplateAbilitySkills(rawASValue string) []*api.Enchantment {
	const prefix = "{{AbilitySkills|"
	const suffix = "}}"
	const defaultBonusType = "Competence" // Default from documentation

	if !strings.HasPrefix(rawASValue, prefix) || !strings.HasSuffix(rawASValue, suffix) {
		return nil
	}

	paramList := rawASValue[len(prefix) : len(rawASValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Ability)|(Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Ability (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	abilityRaw := stripBrackets(parts[0])
	if abilityRaw == "" {
		return nil
	}

	// 2. Amount (Required, Index 1)
	if len(parts) < 2 {
		return nil
	}
	amount := stripBrackets(parts[1])
	if amount == "" {
		return nil
	}

	var bonusType string
	var title string

	// 3. Bonus Type (Optional, Index 2 - defaults to Competence)
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
	}

	// 4. Title (Optional, Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	var enchantments []*api.Enchantment

	// --- Determine the list of skills to generate ---

	skillList, exists := abilityToSkillsMap[abilityRaw]
	if !exists {
		logrus.Warnf("Ability score '%s' not recognized for skill expansion.\n", abilityRaw)
		return nil
	}

	// --- Generate Enchantment Objects for each Skill ---

	for _, skill := range skillList {
		// Generate the name: Use custom title if provided, otherwise format the skill name.
		name := title
		if name == "" {
			// Use the standard Skill naming convention: "Skill Name Skill"
			name = "Skill: " + skill
		}

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateVitality(rawVitValue string) *api.Enchantment {
	const prefix = "{{Vitality|"
	const suffix = "}}"
	const baseName = "Maximum Hit Points"

	if !strings.HasPrefix(rawVitValue, prefix) || !strings.HasSuffix(rawVitValue, suffix) {
		return nil
	}

	paramList := rawVitValue[len(prefix) : len(rawVitValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			// Default to "Vitality" bonus type for clarity if left blank
			bonusType = "Vitality"
		} else {
			bonusType = value
		}
	} else {
		// Default to "Vitality" bonus type if the parameter is omitted
		bonusType = "Vitality"
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplatePermanantEffect(rawPEValue string) *api.Enchantment {
	const prefix = "{{PermanantEffect|"
	const suffix = "}}"
	const baseName = "Permanent Effect"

	if !strings.HasPrefix(rawPEValue, prefix) || !strings.HasSuffix(rawPEValue, suffix) {
		return nil
	}

	paramList := rawPEValue[len(prefix) : len(rawPEValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Permanent effect)|(Extra Text)|(Title)

	// 1. Type (Index 0)
	if len(parts) < 1 {
		return nil
	}
	pType := stripBrackets(parts[0])
	if pType == "" {
		return nil
	}

	var permanentEffect string

	// 2. Permanent effect (Index 1)
	if len(parts) >= 2 {
		permanentEffect = stripBrackets(parts[1])
	}

	// Consolidate PermanentEffect and Extra Text into AdditionalText
	var additionalTextParts string
	if permanentEffect != "" {
		// Example: Permanent effect: Ram's Might
		additionalTextParts = fmt.Sprintf("%s: %s (%s)", baseName, permanentEffect, pType)
	}

	return &api.Enchantment{
		Name: additionalTextParts,
		// All other fields remain empty.
	}
}

func parseTemplateMagicalEfficiency(rawMEValue string) *api.Enchantment {
	const prefix = "{{MagicalEfficiency|"
	const suffix = "}}"
	const baseName = "Spell Point Multiplier" // Required Name
	const bonusType = "Enhancement"           // Assumed default based on example

	if !strings.HasPrefix(rawMEValue, prefix) || !strings.HasSuffix(rawMEValue, suffix) {
		return nil
	}

	paramList := rawMEValue[len(prefix) : len(rawMEValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amountRaw := stripBrackets(parts[0])
	if amountRaw == "" {
		return nil
	}

	// --- CRITICAL AMOUNT FORMATTING ---
	// The amount must be stored as a negative percentage (e.g., 5 -> -5%)
	amount := ""
	if num, err := strconv.Atoi(amountRaw); err == nil {
		amount = fmt.Sprintf("-%d%", num)
	} else {
		// If conversion fails (e.g., amount is 'I', 'V'), use raw value with a negative prefix
		amount = "-" + amountRaw + "%"
	}
	// ------------------------------------

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

func parseTemplateDiversion(rawDivValue string) []*api.Enchantment {
	const prefix = "{{Diversion|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement"

	if !strings.HasPrefix(rawDivValue, prefix) || !strings.HasSuffix(rawDivValue, suffix) {
		return nil
	}

	paramList := rawDivValue[len(prefix) : len(rawDivValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Attack Style)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amountRaw := stripBrackets(parts[0])
	if amountRaw == "" {
		return nil
	}

	var attackStyle string
	var bonusType string
	var title string

	// 2. Attack Style (Index 1)
	if len(parts) >= 2 {
		attackStyle = stripBrackets(parts[1])
	} else {
		attackStyle = "All"
	}

	// 3. Bonus Type (Index 2 - defaults to Enhancement)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType
	}

	// 4. Title (Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	// --- CRITICAL PROCESSING ---

	var enchantments []*api.Enchantment
	normalizedStyle := strings.Title(strings.ToLower(attackStyle))

	// Determine the actual amount (negative percentage)
	amountNum, err := strconv.Atoi(amountRaw)
	if err != nil {
		return nil
	} // Amount must be convertible to number
	amount := fmt.Sprintf("-%d%", amountNum)

	styleFlags, exists := diversionStyles[normalizedStyle]
	if !exists {
		styleFlags = diversionStyles["All"] // Fallback to 'All' if unhandled style is passed
	}

	// Generator function for split enchantments
	generateEnch := func(name string) *api.Enchantment {
		finalName := title
		if finalName == "" {
			finalName = name
		}
		return &api.Enchantment{
			Name:      finalName,
			Amount:    amount,
			BonusType: bonusType,
		}
	}

	// 1. Melee
	if styleFlags.Melee {
		enchantments = append(enchantments, generateEnch("Melee Threat Generation"))
	}
	// 2. Ranged
	if styleFlags.Ranged {
		enchantments = append(enchantments, generateEnch("Ranged Threat Generation"))
	}
	// 3. Spell
	if styleFlags.Spell {
		enchantments = append(enchantments, generateEnch("Spell Threat Generation"))
	}

	return enchantments
}

func parseTemplateTendonSlice(rawTSValue string) *api.Enchantment {
	const prefix = "{{TendonSlice|"
	const suffix = "}}"

	if !strings.HasPrefix(rawTSValue, prefix) || !strings.HasSuffix(rawTSValue, suffix) {
		return nil
	}

	paramList := rawTSValue[len(prefix) : len(rawTSValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	typeParam := ""
	if len(parts) >= 2 {
		typeParam = strings.ToLower(stripBrackets(parts[1]))
	}

	name := "Tendon Slice"
	notes := ""
	displayAmount := amount

	switch typeParam {
	case "percent":
		name = "Tendon Slice " + amount + "%"
		displayAmount = amount + "%"
		notes = fmt.Sprintf("This effect gives a %s% chance to Hamstring the target for each attack that does damage.", amount)
	case "time":
		name = "Tendon Slice " + amount
		notes = fmt.Sprintf("On Hit: 6% chance to slow target's movement by 50%% for %s seconds.", amount)
	default:
		// Default: On Hit: {{#expr:{{{1}}}*2}}% chance to slow target's movement by 50% for 3 seconds.
		val := 0
		fmt.Sscanf(amount, "%d", &val)
		name = "Tendon Slice " + amount
		notes = fmt.Sprintf("On Hit: %d% chance to slow target's movement by 50%% for 3 seconds.", val*2)
	}

	return &api.Enchantment{
		Name:   name,
		Amount: displayAmount,
		Notes:  new(notes),
	}
}

func parseTemplateIncite(rawIncValue string, itemType string) []*api.Enchantment {
	const prefix = "{{Incite|"
	const suffix = "}}"
	const defaultAttackType = "Melee" // Default from documentation

	if !strings.HasPrefix(rawIncValue, prefix) || !strings.HasSuffix(rawIncValue, suffix) {
		return nil
	}

	paramList := rawIncValue[len(prefix) : len(rawIncValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Attack Type)|(Title)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amountRaw := stripBrackets(parts[0])
	if amountRaw == "" {
		return nil
	}

	var attackStyle string
	var title string
	var bonusType string

	// 2. Attack Type (Optional, Index 1 - defaults to Melee)
	if len(parts) >= 2 {
		attackStyle = stripBrackets(parts[1])
	} else {
		attackStyle = defaultAttackType
	}

	// 3. Title (Optional, Index 2)
	if len(parts) >= 3 {
		title = stripBrackets(parts[2])
	}

	// 4. Bonus Type (Optional, Index 3 - if not specified, amount is a percent)
	if len(parts) >= 4 {
		bonusType = stripBrackets(parts[3])
	}

	// --- CRITICAL PROCESSING ---

	var enchantments []*api.Enchantment
	normalizedStyle := strings.Title(strings.ToLower(attackStyle))

	// 1. Determine the final amount string (with % if Bonus Type is missing)
	finalAmount := amountRaw
	isPercentage := false
	if bonusType == "" {
		finalAmount = amountRaw + "%"
		isPercentage = true
	}

	// 2. Determine base names for threat effects
	baseThreatName := "Threat Generation"

	styleFlags, exists := diversionStyles[normalizedStyle]
	if !exists {
		styleFlags = diversionStyles[defaultAttackType] // Fallback
	}

	// Generator function for split enchantments
	generateEnch := func(styleName string) *api.Enchantment {
		finalName := title
		if finalName == "" {
			finalName = styleName + " " + baseThreatName
		} else {
			// If custom title is used, we append the style for differentiation
			finalName = fmt.Sprintf("%s (%s)", finalName, styleName)
		}

		// Use a standard bonus type if the amount is numerical (not a percentage)
		// If it's a percentage, the Bonus field usually reflects the effect type (e.g., Profane, Insight)
		enchBonusType := bonusType
		if isPercentage {
			// For simple percentage bonuses, the Bonus Type is left empty or set to Enhancement
			// to indicate it's not Insight/Quality etc., but since we need a string, we keep the original.
		}

		return &api.Enchantment{
			Name:      finalName,
			Amount:    finalAmount + "%",
			BonusType: enchBonusType,
			// AdditionalText could potentially be used for the base attack style if needed.
		}
	}

	// 3. Generate enchantments for split styles
	if styleFlags.Melee {
		enchantments = append(enchantments, generateEnch("Melee"))
	}
	if styleFlags.Ranged {
		enchantments = append(enchantments, generateEnch("Ranged"))
	}
	if styleFlags.Spell {
		enchantments = append(enchantments, generateEnch("Spell"))
	}

	return enchantments
}

func parseTemplateClickie(rawClickieValue string) *api.Enchantment {
	const prefix = "{{Clickie|"
	const suffix = "}}"
	const baseName = "Clickie Spell"

	if !strings.HasPrefix(rawClickieValue, prefix) || !strings.HasSuffix(rawClickieValue, suffix) {
		return nil
	}

	paramList := rawClickieValue[len(prefix) : len(rawClickieValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Spell)|(Caster level)|(Charges)|(Recharge Rate)|(Icon)

	// Initialize fields (mandatory first two)
	var spell = ""
	var casterLevel = ""
	var charges = ""
	var rechargeRate = ""

	// 1. Spell (Required, Index 0)
	if len(parts) >= 1 {
		spell = stripBrackets(parts[0])
	}
	if spell == "" {
		return nil
	}

	// 2. Caster level (Required, Index 1)
	if len(parts) >= 2 {
		casterLevel = stripBrackets(parts[1])
	}

	// 3. Charges (Optional, Index 2)
	if len(parts) >= 3 {
		charges = stripBrackets(parts[2])
	}

	// 4. Recharge Rate (Optional, Index 3)
	if len(parts) >= 4 {
		rechargeRate = stripBrackets(parts[3])
	}

	// --- CRITICAL NAME FORMATTING ---

	// Pattern: "Clickie Spell: <spell> [CL: <CL>] (<num charges> [Recharge: <num recharges per day>)"

	// 1. Construct Charge/Recharge segment
	chargeSegment := ""
	if charges != "" {
		chargeSegment = charges
		if rechargeRate != "" {
			chargeSegment = fmt.Sprintf("%s Recharge: %s/Day", chargeSegment, rechargeRate)
		}
	}

	// 2. Construct final Name
	name := fmt.Sprintf(
		"%s: %s [CL:%s])",
		baseName,
		spell,
		casterLevel,
	)

	if chargeSegment != "" {
		name = name + fmt.Sprintf("(%s Recharge: %s/Day)", chargeSegment, rechargeRate)
	}

	return &api.Enchantment{
		Name: name,
	}
}

func parseTemplateMarksmanship(rawMSValue string) []*api.Enchantment {
	const prefix = "{{Marksmanship|"
	const suffix = "}}"

	var enchType = "Default" // Assume Default if blank

	if strings.TrimSpace(rawMSValue) == "{{Marksmanship}}" {
		// Argument-less call defaults to the "Default" lookup
	} else if strings.HasPrefix(rawMSValue, prefix) && strings.HasSuffix(rawMSValue, suffix) {
		paramList := rawMSValue[len(prefix) : len(rawMSValue)-len(suffix)]
		parts := strings.Split(paramList, "|")

		// 1. Type (Index 0)
		if len(parts) >= 1 {
			val := strings.TrimSpace(parts[0])
			if val != "" {
				enchType = cases.Title(language.English).String(strings.ToLower(val)) // Normalize to "Greater", "New Normal", or "Default"
			}
		}
	} else {
		return nil // Invalid format
	}

	// Lookup the fixed values
	lookup, exists := marksmanshipLookup[enchType]
	if !exists {
		lookup = marksmanshipLookup["Default"] // Fallback
	}

	var enchantments []*api.Enchantment

	// --- 1. Ranged Attack Rolls Enhancement ---

	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Attack Rolls (Ranged)",
		Amount:    lookup.AttackAmount,
		BonusType: lookup.BonusType,
	})

	// --- 2. Ranged Damage Enhancement ---
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Damage (Ranged)",
		Amount:    lookup.DamageAmount,
		BonusType: lookup.BonusType,
	})

	return enchantments
}

func parseTemplateAssassination(rawAValue string) *api.Enchantment {
	const prefix = "{{Assassination|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement"         // Default from documentation
	const baseName = "Assassin Special Ability DC" // Required Name

	if !strings.HasPrefix(rawAValue, prefix) || !strings.HasSuffix(rawAValue, suffix) {
		return nil
	}

	paramList := rawAValue[len(prefix) : len(rawAValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var name string
	var bonusType string
	var title string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Title (Optional, Index 2) - overrides the standard Name if present
	if len(parts) >= 3 {
		title = stripBrackets(parts[2])
	}

	// --- CRITICAL NAME FORMATTING ---

	if title != "" {
		name = title // Use custom title
	} else {
		name = baseName // Use required default name
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateWeaponEffect(rawWEValue string) *api.Enchantment {
	const prefix = "{{WeaponEffect|"
	const suffix = "}}"

	if !strings.HasPrefix(rawWEValue, prefix) || !strings.HasSuffix(rawWEValue, suffix) {
		return nil
	}

	paramList := rawWEValue[len(prefix) : len(rawWEValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(die count)|(Effect name)|(Title)|(Sides)

	// 1. Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	effectType := stripBrackets(parts[0])
	if effectType == "" {
		return nil
	}

	var dieCount string
	var effectName string
	var title string
	var dieSides string
	var name string

	// 2. Die Count (Required, Index 1)
	if len(parts) >= 2 {
		dieCount = stripBrackets(parts[1])
	} else {
		return nil // Die Count is required
	}

	// 3. Effect name (Index 2)
	if len(parts) >= 3 {
		effectName = stripBrackets(parts[2])
	}

	// 4. Title (Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	// 5. Sides (Index 4) - defaults to d6 if not specified
	if len(parts) >= 5 {
		dieSides = stripBrackets(parts[4])
	}
	if dieSides == "" {
		dieSides = "d6"
	}

	// --- MAPPING AND NAME FORMATTING ---

	// Set Name based on Title, or Effect Name
	if title != "" {
		name = title // Use custom title
	} else if effectName != "" {
		// Use the effect name (e.g., Reverberating, Impactful)
		name = effectName
	} else {
		// Default based on the Type (e.g., Sonic, Force)
		name = effectType + " Damage"
	}

	// Combine Dice information for a single amount/text field if possible, or use AdditionalText
	diceRoll := fmt.Sprintf("%s%s", dieCount, dieSides)

	return &api.Enchantment{
		Name: name,

		// Use Amount for the die roll to make it searchable
		Amount: diceRoll,

		// Use BlastType for the specific effect type (for future complex parsing)
		BlastType: effectType,

		// All other fields remain empty.
	}
}

func parseTemplateShockwave(rawSWValue string) *api.Enchantment {
	const prefix = "{{Shockwave|"
	const suffix = "}}"
	const baseName = "Shockwave"

	var shockwaveType = "basic" // Default to basic if no argument or argument is blank

	if strings.TrimSpace(rawSWValue) == "{{Shockwave}}" {
		// Argument-less call defaults to "basic"
	} else if strings.HasPrefix(rawSWValue, prefix) && strings.HasSuffix(rawSWValue, suffix) {
		paramList := rawSWValue[len(prefix) : len(rawSWValue)-len(suffix)]
		parts := strings.Split(paramList, "|")

		// 1. Type (Index 0)
		if len(parts) >= 1 {
			val := strings.TrimSpace(parts[0])
			if val != "" {
				shockwaveType = strings.ToLower(val)
			}
		}
	} else {
		return nil // Invalid format
	}

	// Look up the fixed values
	lookup, exists := shockwaveTypeMap[shockwaveType]
	if !exists {
		lookup = shockwaveTypeMap["basic"] // Fallback
	}

	var name string

	// Construct Name: [Prefix] Shockwave
	if lookup.NamePrefix != "" {
		name = lookup.NamePrefix + " " + baseName
	} else {
		name = baseName
	}

	return &api.Enchantment{
		Name: name,
		// Use Element to store the damage type
		Element: lookup.DamageElement,
		// All other fields remain empty.
	}
}

func parseTemplateDamageEffect(rawDEValue string) *api.Enchantment {
	const prefix = "{{DamageEffect|"
	const suffix = "}}"
	const baseName = "Damage Effect"

	if !strings.HasPrefix(rawDEValue, prefix) || !strings.HasSuffix(rawDEValue, suffix) {
		return nil
	}

	paramList := rawDEValue[len(prefix) : len(rawDEValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Effect Name)|(Effect Type)|(Dice Count)|(Alignment)|(Title)|(Quote)

	// 1. Effect Name (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	effectName := stripBrackets(parts[0])
	if effectName == "" {
		return nil
	}

	var effectType = "Effect" // Default Effect Type
	var diceCount = ""
	var alignmentDebuff = "False"
	var title = ""
	var name string

	// 2. Effect Type (Optional, Index 1) - Defaults to Effect
	if len(parts) >= 2 {
		val := stripBrackets(parts[1])
		if val != "" {
			effectType = val
		}
	}

	// 3. Dice Count (Optional, Index 2)
	if len(parts) >= 3 {
		diceCount = stripBrackets(parts[2])
	}

	// 4. Alignment Debuff (Optional, Index 3) - Defaults to False
	if len(parts) >= 4 {
		alignmentDebuff = stripBrackets(parts[3])
	}

	// 5. Title (Optional, Index 4)
	if len(parts) >= 5 {
		title = stripBrackets(parts[4])
	}

	// --- MAPPING AND NAME FORMATTING ---

	// Determine the base damage element for classification (Element field)
	element := effectName
	if el, ok := damageEffectToElementMap[effectName]; ok {
		element = el
	}

	// Set Name based on Title or Effect Name/Dice
	if title != "" {
		name = title // Use custom title
	} else {
		name = effectName // Default to just the effect name
	}

	// Combine complex/secondary info into existing fields
	var additionalTextParts []string
	if alignmentDebuff == "True" {
		additionalTextParts = append(additionalTextParts, "Causes negative level on opposite alignment.")
	}

	return &api.Enchantment{
		// Name is mandatory
		Name: name,

		// Use Amount for the Dice Count (since damage amount is primary here)
		Amount: diceCount + "d6",

		// Use Element for damage classification
		Element: element,

		// Use BlastType for the specific Effect Type (Touch, Burst, etc.)
		BlastType: effectType,

		// Use AdditionalText for complex debuffs/quotes/extra info
		Notes: new(strings.Join(additionalTextParts, " | ")),

		// Bonus, SpellPowerType, etc. are unused.
	}
}

func parseTemplateConcealment(rawConcValue string) *api.Enchantment {
	const prefix = "{{Concealment|"
	const suffix = "}}"
	const baseName = "Concealment"

	// Handle argument-less case
	if strings.TrimSpace(rawConcValue) == "{{Concealment}}" {
		// Default (no type specified) can mean standard 20% concealment.
		return &api.Enchantment{Name: baseName}
	}

	if !strings.HasPrefix(rawConcValue, prefix) || !strings.HasSuffix(rawConcValue, suffix) {
		return nil
	}

	paramList := rawConcValue[len(prefix) : len(rawConcValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)

	var concType = ""

	// 1. Type (Index 0)
	if len(parts) >= 1 {
		concType = stripBrackets(parts[0])
	}

	var amount string
	// --- CRITICAL NAME FORMATTING ---
	if concType == "Blurry" {
		amount = "20%"
	} else if concType == "Dusk" {
		amount = "10%"
	} else if concType == "Lesser Displacement" || concType == "LesserDisplacement" {
		amount = "25%"
	} else if concType == "Smoke Screen" || concType == "SmokeScreen" {
		amount = "20%"
	}

	return &api.Enchantment{
		Name:   "Incorporeal Miss Chance",
		Amount: amount,
		// All other fields remain empty.
	}
}

func parseTemplateProofAgainstDisease(rawPDValue string) []*api.Enchantment {
	const prefix = "{{ProofAgainstDisease|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Assumed default

	if !strings.HasPrefix(rawPDValue, prefix) || !strings.HasSuffix(rawPDValue, suffix) {
		return nil
	}

	paramList := rawPDValue[len(prefix) : len(rawPDValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	var enchantments []*api.Enchantment

	// --- 1. Fortitude Save Bonus (Against Magical Disease) ---
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Fortitude (Disease) Saving Throws", // Required Name format
		Amount:    amount,
		BonusType: bonusType,
	})

	// --- 2. Static Immunity Effect ---
	enchantments = append(enchantments, &api.Enchantment{
		Name: "Immunity: Natural Disease", // Required Static Name
		// Amount and Bonus remain empty.
	})

	return enchantments
}

func parseTemplateMemoryOfButchery() *api.Enchantment {
	const templateName = "Memory of Butchery"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

func parseTemplateMemoryOfAnimatedObjects() []*api.Enchantment {
	var enchantments []*api.Enchantment

	// 1. Rust and Repair Spell Power Bonus (Complex/Scaling)
	enchantments = append(enchantments, &api.Enchantment{
		Name: "Repair Spell Power",
		// The Amount/Bonus/AdditionalText fields can be used to manually store the scaling info for post-processing:
		Notes: new("+(Above 159) Equipment bonus to Repair Spell Power"),
	})

	enchantments = append(enchantments, &api.Enchantment{
		Name: "Rust Spell Power",
		// The Amount/Bonus/AdditionalText fields can be used to manually store the scaling info for post-processing:
		Notes: new("+(Above 159) Equipment bonus to Rust Spell Power"),
	})

	// 2. Rust and Repair Spell Crit Damage Bonus (Complex/Scaling)
	enchantments = append(enchantments, &api.Enchantment{
		Name:  "Spell Critical Damage: Repair",
		Notes: new("+(Above 23) Enhancement Bonus to Repair Spell Critical Damage"),
	})

	enchantments = append(enchantments, &api.Enchantment{
		Name:  "Spell Critical Damage: Rust",
		Notes: new("+(Above 23) Enhancement Bonus to Rust Spell Critical Damage"),
	})

	return enchantments
}

func parseTemplateMemoryOfBinding() *api.Enchantment {
	const templateName = "Memory of Binding"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

func parseTemplateMemoryOfShatteredLife() *api.Enchantment {
	const templateName = "Memory of Shattered Life"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

func parseTemplateResistance(rawResValue string) []*api.Enchantment {
	const prefix = "{{Resistance|"
	const suffix = "}}"
	const defaultBonusType = "Resistance" // Default from documentation

	if !strings.HasPrefix(rawResValue, prefix) || !strings.HasSuffix(rawResValue, suffix) {
		return nil
	}

	paramList := rawResValue[len(prefix) : len(rawResValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Resistance Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string
	var resType string // The custom type (Curse, Enchantment, or blank)

	// 2. Bonus Type (Optional, Index 1 - defaults to Resistance)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			if value == "Insightful" {
				value = "Insight"
			}

			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Resistance Type (Optional, Index 2 - affects final name/description)
	if len(parts) >= 3 {
		resType = stripBrackets(parts[2])
	}

	var enchantments []*api.Enchantment

	// --- CRITICAL: Generate Three Separate Saves ---
	for _, save := range saves {
		var name string

		// If ResType is provided, the naming convention changes (e.g., "Curse Resistance")
		if resType != "" {
			name = fmt.Sprintf("%s (%s) Saving Throws", save, resType)
			name = save + "(" + resType + ")" + " Saving Throws"
		} else {
			name = fmt.Sprintf("%s Saving Throws", save)
		}

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateMaiming(rawMValue string) *api.Enchantment {
	const prefix = "{{Maiming|"
	const suffix = "}}"
	const baseName = "Maiming"

	if !strings.HasPrefix(rawMValue, prefix) || !strings.HasSuffix(rawMValue, suffix) {
		// Handle argument-less case, defaults to "Normal"
		if strings.TrimSpace(rawMValue) == "{{Maiming}}" {
			return &api.Enchantment{Name: baseName + " (Normal)"}
		}
		return nil
	}

	paramList := rawMValue[len(prefix) : len(rawMValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Amount)

	var enchType = "Normal" // Default type
	var amount = ""
	var name string

	// Determine which field is which: Type is Index 0, Amount is Index 1
	if len(parts) >= 1 {
		enchType = stripBrackets(parts[0])
	}
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	}

	if enchType == "" {
		enchType = "Normal"
	}

	// --- CRITICAL NAME FORMATTING & DATA MAPPING ---

	normalizedType := strings.ToLower(enchType)

	if normalizedType == "greater" {
		// Greater Maiming has complex, fixed dice damage and no input amount.
		name = "Greater " + baseName
	} else if normalizedType == "normal" {
		// Normal Maiming also has complex, fixed dice damage and no input amount.
		name = baseName
	} else if normalizedType == "new" || normalizedType == "weapon" {
		// New Maiming uses a fixed numerical input amount (e.g., +9d8 damage in example)
		name = baseName + " " + amount
		// Amount is the actual damage roll or multiplier (e.g., 9d8)
	} else {
		name = baseName
	}

	return &api.Enchantment{
		Name:    name,
		Amount:  amount + "d8", // Stores either the fixed dice roll type or the custom amount
		Element: "Untyped",     // The core effect is untyped damage
		// All other fields remain empty.
	}
}

func parseTemplateDruidicStoneshape() *api.Enchantment {
	const templateName = "Druidic Stoneshape"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

func parseTemplateCrippling(rawCripValue string) *api.Enchantment {
	const prefix = "{{Crippling|"
	const suffix = "}}"
	const baseName = "Crippling"

	// Handle argument-less case, which defaults to the base name (Melee/General)
	if strings.TrimSpace(rawCripValue) == "{{Crippling}}" {
		return &api.Enchantment{Name: baseName}
	}

	if !strings.HasPrefix(rawCripValue, prefix) || !strings.HasSuffix(rawCripValue, suffix) {
		return nil
	}

	paramList := rawCripValue[len(prefix) : len(rawCripValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Attack Style)

	var attackStyle = ""
	var name string

	// 1. Attack Style (Index 0)
	if len(parts) >= 1 {
		attackStyle = stripBrackets(parts[0])
	}

	// --- CRITICAL NAME FORMATTING ---

	normalizedStyle := strings.ToLower(attackStyle)

	if normalizedStyle == "melee" || normalizedStyle == "ranged" {
		name = fmt.Sprintf("Crippling (%s)", cases.Title(language.English).String(strings.ToLower(normalizedStyle)))
	} else {
		name = baseName
	}

	return &api.Enchantment{
		Name: name,
		// All other fields remain empty.
	}
}

func parseTemplateStrikethrough(rawSTValue string) *api.Enchantment {
	const prefix = "{{Strikethrough|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Strikethrough Chance"

	if !strings.HasPrefix(rawSTValue, prefix) || !strings.HasSuffix(rawSTValue, suffix) {
		return nil
	}

	paramList := rawSTValue[len(prefix) : len(rawSTValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	name := baseName
	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Title (Optional, Index 2) - overrides the standard Name if present
	if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
		name = stripBrackets(parts[2]) // Use custom title (e.g., "Calamitous Blows")
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

func parseTemplateImbueDice(rawIDValue string) *api.Enchantment {
	const prefix = "{{ImbueDice|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Imbue Dice"

	if !strings.HasPrefix(rawIDValue, prefix) || !strings.HasSuffix(rawIDValue, suffix) {
		return nil
	}

	paramList := rawIDValue[len(prefix) : len(rawIDValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
	}
}

func parseTemplateDestruction(rawDestValue string) *api.Enchantment {
	const prefix = "{{Destruction|"
	const suffix = "}}"
	const baseName = "Destruction"

	// Handle argument-less case, which defaults to basic Destruction
	if strings.TrimSpace(rawDestValue) == "{{Destruction}}" {
		return &api.Enchantment{Name: baseName}
	}

	if !strings.HasPrefix(rawDestValue, prefix) || !strings.HasSuffix(rawDestValue, suffix) {
		return nil
	}

	paramList := rawDestValue[len(prefix) : len(rawDestValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)

	var destType = ""
	var name string

	// 1. Type (Index 0)
	if len(parts) >= 1 {
		destType = stripBrackets(parts[0])
	}

	// --- CRITICAL NAME FORMATTING ---

	normalizedType := strings.ToLower(destType)

	if normalizedType == "" || normalizedType == "none" || normalizedType == "basic destruction" {
		// Default or Blank is Basic Destruction
		name = baseName + " (Basic)"
	} else {
		// Prepend the type (e.g., "Improved Destruction", "Destroying Destruction")
		name = strings.Title(normalizedType) + " " + baseName
	}

	return &api.Enchantment{
		Name: name,
		// All other fields remain empty.
	}
}

func parseTemplateSpellResistance(rawSRValue string) *api.Enchantment {
	const prefix = "{{SpellResistance|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Spell Resistance"

	if !strings.HasPrefix(rawSRValue, prefix) || !strings.HasSuffix(rawSRValue, suffix) {
		return nil
	}

	paramList := rawSRValue[len(prefix) : len(rawSRValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

func parseTemplateThornGuard(rawTGValue string) *api.Enchantment {
	const templateName = "ThornGuard"
	const prefix = "{{" + templateName
	const suffix = "}}"
	const baseName = "Thorn Guard"

	var tgType = "basic" // Default type

	// Handle argument-less case, which defaults to "Basic"
	if strings.TrimSpace(rawTGValue) == "{{"+templateName+"}}" {
		// No arguments, proceed with basic default
	} else if strings.HasPrefix(rawTGValue, prefix) && strings.HasSuffix(rawTGValue, suffix) {
		paramList := rawTGValue[len(prefix) : len(rawTGValue)-len(suffix)]
		parts := strings.Split(paramList, "|")

		// 1. Type (Index 0)
		if len(parts) >= 1 {
			val := strings.TrimSpace(parts[1])
			if val != "" {
				tgType = strings.ToLower(val)
			}
		}
	} else {
		return nil // Invalid format
	}

	var name string

	// Construct Name: [Type] Thorn Guard
	if tgType == "basic" {
		name = baseName // Basic Thorn Guard
	} else {
		// Use a normalized title case for display
		name = cases.Title(language.English).String(strings.ToLower(tgType)) + " " + baseName // e.g., Greater Thorn Guard
	}

	return &api.Enchantment{
		Name: name,
	}
}

func parseTemplateCarryingCapacity(rawCCValue string) *api.Enchantment {
	const prefix = "{{CarryingCapacity|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Carrying Capacity"

	if !strings.HasPrefix(rawCCValue, prefix) || !strings.HasSuffix(rawCCValue, suffix) {
		return nil
	}

	paramList := rawCCValue[len(prefix) : len(rawCCValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// --- CRITICAL NAME FORMATTING ---

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

func parseTemplateElementalDOT(rawDOTValue string) *api.Enchantment {
	const prefix = "{{ElementalDOT|"
	const suffix = "}}"

	if !strings.HasPrefix(rawDOTValue, prefix) || !strings.HasSuffix(rawDOTValue, suffix) {
		return nil
	}

	paramList := rawDOTValue[len(prefix) : len(rawDOTValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Element)

	// 1. Element (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	element := stripBrackets(parts[0])
	if element == "" {
		return nil
	}

	// --- CRITICAL NAME FORMATTING ---

	// Determine the descriptive name
	name := fmt.Sprintf("%s Damage over Time", element)

	return &api.Enchantment{
		Name: name,
		// Use Element for classification
		Element: element,
		// All other fields remain empty.
	}
}

func parseTemplateElementalAOE(rawAOEValue string) *api.Enchantment {
	const prefix = "{{ElementalAOE|"
	const suffix = "}}"

	if !strings.HasPrefix(rawAOEValue, prefix) || !strings.HasSuffix(rawAOEValue, suffix) {
		return nil
	}

	paramList := rawAOEValue[len(prefix) : len(rawAOEValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Element)|(Type)

	// 1. Element (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	element := stripBrackets(parts[0])
	if element == "" {
		return nil
	}

	var aoeType = "Basic" // Default to Basic
	var name string

	// 2. Type (Optional, Index 1)
	if len(parts) >= 2 {
		val := stripBrackets(parts[1])
		if val != "" {
			aoeType = val
		}
	}

	// --- CRITICAL NAME FORMATTING ---

	// Determine the base name (e.g., Fiery Detonation)
	baseEffectName, ok := elementalAoeNames[element]
	if !ok {
		baseEffectName = fmt.Sprintf("%s AOE", element)
	}

	// Prepend Type (e.g., Greater Fiery Detonation)
	normalizedType := strings.ToLower(aoeType)
	if normalizedType == "basic" || normalizedType == "" {
		name = baseEffectName
	} else {
		name = strings.Title(normalizedType) + " " + baseEffectName
	}

	return &api.Enchantment{
		Name: name,
		// Use Element for classification
		Element: element,
		// Use BlastType for the AOE magnitude/type
		BlastType: aoeType,
		// All other fields remain empty.
	}
}

func parseTemplateSealedInMist() *api.Enchantment {
	const templateName = "Sealed in Mist"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

// Template:SealedInFire
// No parameters. Documentation indicates it simply marks the item as
// "Sealed in Fire" with explanatory upgrade text elsewhere. We capture
// this as a simple named enchantment.
func parseTemplateSealedInFire() *api.Enchantment {
	return &api.Enchantment{
		Name: "Sealed in Fire",
		// All other fields remain empty.
	}
}

func parseTemplateAnthemMelody(rawAMValue string) *api.Enchantment {
	const prefix = "{{AnthemMelody|"
	const suffix = "}}"
	const baseName = "Anthem Melody"

	// Handle argument-less case
	if strings.TrimSpace(rawAMValue) == "{{AnthemMelody}}" {
		return &api.Enchantment{Name: baseName}
	}

	if !strings.HasPrefix(rawAMValue, prefix) || !strings.HasSuffix(rawAMValue, suffix) {
		return nil
	}

	paramList := rawAMValue[len(prefix) : len(rawAMValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Song)

	var song = ""
	var name string

	// 1. Song (Index 0)
	if len(parts) >= 1 {
		song = stripBrackets(parts[0])
	}

	// --- CRITICAL NAME FORMATTING ---

	if song != "" {
		// Name format: Melody: [Song]
		name = fmt.Sprintf("Melody: %s", song)
	} else {
		name = baseName
	}

	return &api.Enchantment{
		Name: name,
		// All other fields remain empty.
	}
}

func parseTemplateMeltscale(rawMSValue string) *api.Enchantment {
	const templateName = "Meltscale"
	const prefix = "{{" + templateName + "}}"
	const damageDice = "15d6"
	const damageElement = "Acid"

	// This template has no arguments, so we check for the exact full string
	if strings.TrimSpace(rawMSValue) != prefix {
		return nil
	}

	// Documentation: No arguments.

	return &api.Enchantment{
		Name: templateName,
		// Use Amount for the primary damage dice
		Amount: damageDice,
		// Use Element for the damage type
		Element: damageElement,
	}
}

// Template:Venomscale
// No parameters. According to docs/screenshot it:
//   - Adds Cold Iron material type (i.e., bypasses Cold Iron DR)
//   - On Hit: 15d6 Acid Damage
//
// Emits two standard effects:
//  1. Name: "Venomscale" with Amount "15d6" and Element "Acid"
//  2. Name: "Damage Reduction Bypass: Cold Iron"
func parseTemplateVenomscale() []*api.Enchantment {
	// Primary on-hit damage portion
	venom := &api.Enchantment{
		Name:    "Venomscale",
		Amount:  "15d6",
		Element: "Acid",
	}

	// DR bypass material tagging
	bypass := &api.Enchantment{
		Name:    "Damage Reduction Bypass: Cold Iron",
		Element: "Cold Iron",
	}

	return []*api.Enchantment{venom, bypass}
}

// Template:ShadowStriker
// No parameters. As per documentation screenshot, this template confers four effects:
//   - +3% Profane bonus to Doublestrike
//   - +3% Profane bonus to Doubleshot
//   - +15% Enhancement bonus to Melee Attack Speed
//   - +20 Enhancement bonus to Ranged Attack (attack rolls)
//
// Returns a slice of standard enchantments representing these effects.
func parseTemplateShadowStriker() []*api.Enchantment {
	return []*api.Enchantment{
		{ // Doublestrike
			Name:      "Doublestrike Chance",
			Amount:    "3%",
			BonusType: "Profane",
		},
		{ // Doubleshot
			Name:      "Doubleshot Chance",
			Amount:    "3%",
			BonusType: "Profane",
		},
		{ // Melee attack speed
			Name:      "Melee Attack Speed",
			Amount:    "15%",
			BonusType: "Enhancement",
		},
		{ // Ranged attack roll bonus
			Name:      "Attack Rolls (Ranged)",
			Amount:    "20",
			BonusType: "Enhancement",
		},
	}
}

func parseTemplateSealedInGloom() *api.Enchantment {
	const templateName = "Sealed in Gloom"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

// Template:TemperanceOfSpirit
// No parameters. As per documentation screenshot:
//
//	"Temperance of Spirit: You have a +1 Quality Bonus to Physical Resistance Rating per Religious Lore Feat."
//
// We capture this as a single standard enchantment increasing PRR by +1 (Quality).
// Notes indicate the per-feat scaling.
func parseTemplateTemperanceOfSpirit() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Physical Resistance Rating",
		Amount:    "1",
		BonusType: "Quality",
		Notes:     new("+1 to Physical Resistance Rating per Religious Lore Feat."),
	}
}

// Template:FavoredWeapon
// No parameters; simple named enchantment with descriptive note.
// Example text from docs:
// "Favored Weapon: This weapon has a divine attunement and may be wielded as if it were a Favored Weapon regardless of your Deity."
func parseTemplateFavoredWeapon() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Favored Weapon",
		Notes: new("This weapon has a divine attunement and may be wielded as if it were a Favored Weapon regardless of your Deity."),
	}
}

// parseTemplateElemental not super worried about this one as it's a damaging template, but it needs work for any work
// going forward with damage typing
func parseTemplateElemental(rawElValue string) *api.Enchantment {
	const prefix = "{{Elemental|"
	const suffix = "}}"

	if !strings.HasPrefix(rawElValue, prefix) || !strings.HasSuffix(rawElValue, suffix) {
		return nil
	}

	paramList := rawElValue[len(prefix) : len(rawElValue)-len(suffix)]

	// Split parameters by pipe, but respect nested templates
	var parts []string
	var cur strings.Builder
	depth := 0
	for _, r := range paramList {
		if r == '{' {
			depth++
		} else if r == '}' {
			if depth > 0 {
				depth--
			}
		}
		if r == '|' && depth == 0 {
			parts = append(parts, strings.TrimSpace(cur.String()))
			cur.Reset()
		} else {
			cur.WriteRune(r)
		}
	}
	parts = append(parts, strings.TrimSpace(cur.String()))

	// Docs: (Element)|(Type)|(Damage Amount)|(Creature)|(Title)|(Is Armor)

	// 1. Element (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	element := stripBrackets(parts[0])
	if element == "" {
		return nil
	}

	var enchType = "Basic"   // Default type
	var damageAmountRaw = "" // Can be a number or a nested {{Dice|...}} template
	var creature = ""
	var isArmor = ""
	var name string
	var amount string

	// 2. Type (Optional, Index 1) - Assumes Basic if missing
	if len(parts) >= 2 {
		val := stripBrackets(parts[1])
		if val != "" {
			enchType = val
		}
	}

	// 3. Damage Amount (Optional/Conditional, Index 2)
	if len(parts) >= 3 {
		damageAmountRaw = strings.TrimSpace(parts[2])
	}

	// 4. Creature (Optional, Index 3)
	if len(parts) >= 4 {
		creature = stripBrackets(parts[3])
	}

	// 6. Is Armor (Optional, Index 5)
	if len(parts) >= 6 {
		isArmor = stripBrackets(parts[5])
	}

	// --- CRITICAL CONDITIONAL LOGIC ---

	// 1. Resolve Damage Amount (Amount field)
	normalizedType := strings.ToLower(enchType)

	if normalizedType == "dice" || normalizedType == "vorpal" {
		// Type requires nested Dice template or raw dice string
		diceData := ParseTemplateDice(damageAmountRaw)
		amount = diceData.Raw // Store the full parsed or raw dice string

		// If dice parsing failed, try to get a simple amount
		if amount == "" {
			amount = damageAmountRaw
		}

	} else if normalizedType == "effect" || normalizedType == "critical" || normalizedType == "basic" || normalizedType == "hitandcrit" {
		// Type requires a flat damage amount if present, or uses default weapon dice if not.
		if damageAmountRaw != "" {
			amount = damageAmountRaw // Flat amount (e.g., '9' in example)
		} else {
			// Default elemental damage is 1d6 or similar.
			amount = elementalDefaultDice[element] // Use lookup if available
		}
	} else {
		// Other types (Burst, Concussing, Radiance, etc.) often imply fixed dice or no amount field needed
		// We leave the amount blank unless explicitly passed
		amount = damageAmountRaw
	}

	// 2. Resolve Name
	if creature != "" {
		name = fmt.Sprintf("%s Damage vs %s", element, creature)
	} else {
		// Default name: [Element] [Type]
		if normalizedType == "basic" || normalizedType == "effect" {
			name = element // Example: "Fire"
		} else {
			// Example: "Critical Fire" or "Fire Critical"
			name = fmt.Sprintf("%s Damage", element)
		}
	}

	// 3. Consolidate Context into AdditionalText
	var additionalTextParts []string
	if creature != "" {
		additionalTextParts = append(additionalTextParts, fmt.Sprintf("Extra damage vs: %s", creature))
	}
	if isArmor == "True" || isArmor == "1" {
		additionalTextParts = append(additionalTextParts, "Applies to armor.")
	}

	bonusType := "Enhancement"
	if normalizedType == "basic" || normalizedType == "effect" || normalizedType == "dice" || normalizedType == "vorpal" {
		bonusType = "On-hit"
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount, // Contains flat bonus or dice string
		Element:   element,
		BlastType: enchType,  // Type of the elemental effect (Critical, Burst, Dice)
		BonusType: bonusType, // Elemental damage is implicitly enhancement or on-hit
	}
}

func parseTemplateBluntTrama() *api.Enchantment {
	const templateName = "BluntTrama"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

// Template:LimbChopper
// No parameters. Vorpal-like effect that severs a limb on a confirmed 20.
// We capture it as a simple named enchantment with an On-vorpal bonus type.
func parseTemplateLimbChopper() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Limb Chopper",
		BonusType: "On-vorpal",
		Notes:     new("On a confirmed 20 critical, severs a limb; many creatures are unaffected"),
	}
}

// Template:3rdDegreeBurns
// No parameters. As per documentation screenshot, this is a vorpal-triggered
// effect that applies periodic Fire damage and stacks Vulnerability.
// We model it as a single standard enchantment with an On-vorpal bonus and
// concise notes capturing the DoT and debuff behavior.
func parseTemplate3rdDegreeBurns() *api.Enchantment {
	return &api.Enchantment{
		Name:      "3rd Degree Burns",
		BonusType: "On-vorpal",
		Notes:     new("On Vorpal: deals 85–195 Fire damage every 2 seconds for 10 seconds and applies 1–5 stacks of Vulnerability (1% more damage taken for 3 seconds; stacks up to 20, losing one stack on expiration)."),
		// Element is internal only; mark as Fire for classification if needed.
		Element: "Fire",
	}
}

// Template:Sparkscale
// No parameters; this template label expands to descriptive text on the wiki.
// For our structured data, we capture it as a simple named enchantment.
func parseTemplateSparkscale() *api.Enchantment {
	return &api.Enchantment{
		Name: "Sparkscale",
	}
}

// Template:IntercessionWard
// No parameters; defensive utility effect. Capture name and concise rules text.
func parseTemplateIntercessionWard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Intercession Ward",
		Notes: new("Protects the user's connection to a source of Divine power and wards that connection from such things as a Quell's intercession ability. This effect only protects from incoming attacks and will not restore a lost connection."),
	}
}

// TODO: Revisit this when touching weapon enchantments as a whole
// Template:Keen
// Usage: {{Keen|(Magnitude)|(Title)}}
// - Magnitude: Roman numeral I–V. Defaults to I when omitted.
// - Title: Optional custom name override.
// Behavior per docs screenshot:
//
//	Keen (I): Passive – doubles base critical threat range; does not stack with Improved Critical.
//	           Vorpal strikes by this weapon also bypass all Fortification.
//	Keen II:  Additionally grants +0.5[W] damage, plus the same Keen effects above.
func parseTemplateKeen(raw string) *api.Enchantment {
	const prefix = "{{Keen"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var magnitude = "I" // default
	var title string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := stripBrackets(parts[0])
			if v != "" {
				magnitude = v
			}
		}
		if len(parts) >= 2 {
			title = stripBrackets(parts[1])
		}
	}

	// Name resolution
	var name string
	if title != "" {
		name = title
	} else if strings.EqualFold(magnitude, "I") || magnitude == "" {
		name = "Keen"
	} else {
		name = "Keen " + magnitude
	}

	// Notes assembly
	base := "Passive: base critical threat range of this weapon is doubled. This does not stack with the Improved Critical Feat. Vorpal strikes by this weapon also bypass all Fortification."
	var note string
	if strings.EqualFold(magnitude, "II") {
		note = "Passive: This weapon deals an additional +0.5[W] damage. " + base
	} else {
		note = base
	}

	return &api.Enchantment{
		Name:  name,
		Notes: &note,
	}
}

// Template:Sacred
// Usage: {{Sacred|(Amount)}}
// - Amount: Effective level bonus to Turning checks; defaults to 2 if omitted.
// Output: single standard enchantment with BonusType "Sacred" and the Amount value.
// Notes capture the concise rule text from the docs.
func parseTemplateSacred(raw string) *api.Enchantment {
	const prefix = "{{Sacred"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract inner params (Amount is optional)
	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	amount := "2" // default per documentation
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := stripBrackets(parts[0])
			if v != "" {
				amount = v
			}
		}
	}

	return &api.Enchantment{
		Name:      "Turn Undead Level",
		Amount:    amount,
		BonusType: "Sacred",
		Notes:     new("Assists only wearers who can turn undead; increases effective level for turning check by +" + amount + "."),
	}
}

// Template:FellingTheOak
// No parameters; simple named enchantment.
func parseTemplateFellingTheOak() *api.Enchantment {
	return &api.Enchantment{
		Name: "Felling the Oak",
	}
}

// Template:Faith
// No parameters. Per documentation, Insightful Faith grants three Insight bonuses to Turn Undead mechanics:
//   - +2 to effective level for the turning check
//   - +2 to maximum Hit Dice turned
//   - +4 to total Hit Dice turned
//
// We output three standard enchantments to capture these separately.
func parseTemplateFaith() []*api.Enchantment {
	return []*api.Enchantment{
		{
			Name:      "Turn Undead Level",
			Amount:    "2",
			BonusType: "Insight",
			Notes:     new("Assists only wearers who have the ability to turn undead. Provides Insight bonuses to Turn Undead: +2 effective level for the turning check, +2 maximum Hit Dice turned, and +4 total Hit Dice turned."),
		},
		{
			Name:      "Turn Undead Maximum Hit Dice",
			Amount:    "2",
			BonusType: "Insight",
		},
		{
			Name:      "Turn Undead Additional Hit Dice",
			Amount:    "4",
			BonusType: "Insight",
		},
	}
}

// Template:Vorpal
// Supports the following forms:
//
//	{{Vorpal}}                                  -> Name: "Vorpal", Bonus: On-vorpal
//	{{Vorpal|Effect Name}}                      -> Name: Effect Name, Bonus: On-vorpal
//	{{Vorpal|Effect Name|{{Dice||X|Y}}}}        -> Name: Effect Name, Amount: dice, Bonus: On-vorpal
//	{{Vorpal|Effect Name|flat or dice string}}  -> Name: Effect Name, Amount: raw, Bonus: On-vorpal
func parseTemplateVorpal(raw string) *api.Enchantment {
	const template = "Vorpal"
	const open = "{{" + template
	const close = "}}"

	if !strings.HasPrefix(raw, open) || !strings.HasSuffix(raw, close) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(raw, open), close)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	// No params
	if inner == "" {
		return &api.Enchantment{Name: template, BonusType: "On-vorpal"}
	}

	// Split parameters by pipe, but respect nested templates
	var parts []string
	var cur strings.Builder
	depth := 0
	for _, r := range inner {
		if r == '{' {
			depth++
		} else if r == '}' {
			if depth > 0 {
				depth--
			}
		}
		if r == '|' && depth == 0 {
			parts = append(parts, strings.TrimSpace(cur.String()))
			cur.Reset()
		} else {
			cur.WriteRune(r)
		}
	}
	parts = append(parts, strings.TrimSpace(cur.String()))

	name := stripBrackets(parts[0])
	var amount string
	if len(parts) >= 2 {
		rawAmount := strings.TrimSpace(parts[1])
		dice := ParseTemplateDice(rawAmount)
		if dice.Raw != "" {
			amount = dice.Raw
		} else {
			amount = stripBrackets(rawAmount)
		}
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: "On-vorpal",
	}
}

func parseTemplateFreezingIce(rawFIValue string) *api.Enchantment {
	const prefix = "{{FreezingIce|"
	const suffix = "}}"
	const baseName = "Freezing Ice"

	// Handle argument-less case, which defaults to "Regular"
	if strings.TrimSpace(rawFIValue) == "{{FreezingIce}}" {
		return &api.Enchantment{Name: baseName + " (Regular)", Element: "Cold"}
	}

	if !strings.HasPrefix(rawFIValue, prefix) || !strings.HasSuffix(rawFIValue, suffix) {
		return nil
	}

	paramList := rawFIValue[len(prefix) : len(rawFIValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (version)

	var version = "Regular" // Default type

	// 1. Version (Index 0)
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			version = val
		}
	}

	// --- CRITICAL NAME FORMATTING ---

	var name string
	normalizedVersion := strings.ToLower(version)

	if normalizedVersion == "regular" {
		name = baseName + " (Regular)"
	} else if normalizedVersion == "minor" {
		name = "Minor " + baseName
	} else if normalizedVersion == "lesser" {
		name = "Lesser " + baseName
	} else if strings.Contains(normalizedVersion, "weapon") {
		// Weapon type has a different description but same effect principle
		name = baseName + " (Weapon)"
	} else {
		// Catch-all: "Legendary Weapon", "Legendary Ice", etc.
		name = strings.Title(normalizedVersion) + " " + baseName
	}

	return &api.Enchantment{
		Name:    name,
		Element: "Cold", // The base element of the effect
		// All other fields remain empty.
	}
}

// Template:AlignmentDamage
// Usage: {{AlignmentDamage|(Alignment)|(Amount)|(Causes Negative Level)|(Die Side)|(Title)|(Crit Dice)}}
// Examples from docs:
//   - {{AlignmentDamage|Axiomatic|9|True}}  -> 9d6 Law damage; weapon becomes Lawful aligned; Chaotic wielders suffer a negative level.
//   - {{AlignmentDamage|Unholy|9|False}}    -> 9d6 Evil damage; weapon becomes Evil aligned.
//   - {{AlignmentDamage|Holy|7|True|4}}     -> 7d4 Good damage; Evil wielders suffer a negative level.
//
// Output: single standard enchantment with
//
//	Name:  (Title if provided, else Alignment string)
//	Amount: "<Amount>d<DieSide>" (DieSide defaults to 6)
//	BonusType: "Enhancement"
//	Element: alignment damage type mapped to one of: Good, Evil, Law, Chaos
//	Notes: when Causes Negative Level is true, add concise note about opposite-aligned wielders.
func parseTemplateAlignmentDamage(raw string) *api.Enchantment {
	const prefix = "{{AlignmentDamage"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := []string{}
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	// Params
	// (Alignment)|(Amount)|(Causes Negative Level)|(Die Side)|(Title)|(Crit Dice)
	alignmentRaw := ""
	if len(parts) >= 1 {
		alignmentRaw = stripBrackets(parts[0])
	}
	amountNum := ""
	if len(parts) >= 2 {
		amountNum = stripBrackets(parts[1])
	}
	causesNeg := ""
	if len(parts) >= 3 {
		causesNeg = stripBrackets(parts[2])
	}
	dieSide := "6"
	if len(parts) >= 4 {
		v := stripBrackets(parts[3])
		if v != "" {
			dieSide = v
		}
	}
	title := ""
	if len(parts) >= 5 {
		title = stripBrackets(parts[4])
	}

	if alignmentRaw == "" || amountNum == "" {
		return nil
	}

	// Name preference: Title > Alignment
	name := alignmentRaw
	if title != "" {
		name = title
	}

	// Amount in NdS format
	amount := amountNum + "d" + dieSide

	// Map alignment to elemental damage type and opposite for notes
	lowerAlign := strings.ToLower(alignmentRaw)
	elem := ""
	opposite := ""
	switch {
	case strings.Contains(lowerAlign, "holy"):
		elem, opposite = "Good", "Evil"
	case strings.Contains(lowerAlign, "unholy"):
		elem, opposite = "Evil", "Good"
	case strings.Contains(lowerAlign, "axiomatic"):
		elem, opposite = "Law", "Chaos"
	case strings.Contains(lowerAlign, "anarchic"):
		elem, opposite = "Chaos", "Lawful"
	default:
		// Fallback: try exact matches of core four
		switch lowerAlign {
		case "good":
			elem, opposite = "Good", "Evil"
		case "evil":
			elem, opposite = "Evil", "Good"
		case "law", "lawful":
			elem, opposite = "Law", "Chaos"
		case "chaos", "chaotic":
			elem, opposite = "Chaos", "Lawful"
		}
	}

	var notes *string
	// Causes Negative Level when true-ish
	if v := strings.ToLower(strings.TrimSpace(causesNeg)); v == "true" || v == "1" || v == "yes" {
		if opposite != "" {
			notes = new(fmt.Sprintf("%s characters wielding this weapon will suffer one negative level.", opposite))
		} else {
			notes = new("Opposite-aligned characters wielding this weapon will suffer one negative level.")
		}
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: "Enhancement",
		Notes:     notes,
		Element:   elem,
	}
}

func parseTemplateSpellCritDamage(rawSCDValue string) []*api.Enchantment {
	const prefix = "{{SpellCritDamage|"
	const suffix = "}}"
	const defaultBonusType = "Equipment"

	if !strings.HasPrefix(rawSCDValue, prefix) || !strings.HasSuffix(rawSCDValue, suffix) {
		return nil
	}

	paramList := rawSCDValue[len(prefix) : len(rawSCDValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Group)|(Enhancement Amount)|(Bonus Type)|(Title)

	// 1. Group (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	groupRaw := stripBrackets(parts[0])

	// 2. Amount (Required, Index 1)
	if len(parts) < 2 {
		return nil
	}
	amount := stripBrackets(parts[1])
	if amount == "" {
		return nil
	}

	var bonusType string
	var _title string // Ignored for this template per requirement

	// 3. Bonus Type (Optional, Index 2 - defaults to Equipment)
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
	}

	// 4. Title (Optional, Index 3) — present but intentionally ignored for this template
	if len(parts) >= 4 {
		_title = stripBrackets(parts[3])
		_ = _title
	}

	var enchantments []*api.Enchantment
	var groupsToGenerate []string

	// --- Determine list of groups to generate ---

	// 1. Universal Split (Default, Universal, or blank)
	if strings.EqualFold(groupRaw, "Universal") || groupRaw == "" || groupRaw == "*" || strings.Contains(strings.ToUpper(groupRaw), "ALL SPELLS") {
		groupsToGenerate = allSpellCritDamageGroups
	} else {
		// 2. Compound/Elemental Split (Reuse SpellPower's map)
		foundCompound := false
		for compoundName, elements := range compoundSpellPowers {
			if strings.Contains(groupRaw, compoundName) {
				groupsToGenerate = elements
				foundCompound = true
				break
			}
		}

		// 3. Single Group
		if !foundCompound {
			groupsToGenerate = []string{groupRaw}
		}
	}

	// --- Generate Enchantment Objects ---

	seen := map[string]bool{}
	for _, group := range groupsToGenerate {
		expanded := expandSpellCritGroup(group)
		for _, category := range expanded {
			// Final required naming format: "<element or type> Spell Critical Damage"
			name := fmt.Sprintf("Spell Critical Damage: %s", category)

			// Element field mirrors the category's elemental/type identity
			element := category
			// Some categories are phrased types; keep as-is. No additional mapping here.
			if seen[name] {
				continue
			}
			seen[name] = true
			enchantments = append(enchantments, &api.Enchantment{
				Name:      name,
				Amount:    amount,
				BonusType: bonusType,
				Element:   element,
			})
		}
	}

	return enchantments
}

func parseTemplateAlacrity(rawAlValue string) *api.Enchantment {
	const prefix = "{{Alacrity|"
	const suffix = "}}"
	const defaultAttackStyle = "Melee"
	const defaultBonusType = "Enhancement" // Implied by example
	const baseName = "Alacrity"

	if !strings.HasPrefix(rawAlValue, prefix) || !strings.HasSuffix(rawAlValue, suffix) {
		return nil
	}

	paramList := rawAlValue[len(prefix) : len(rawAlValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Attack Style)|(Enhancement Amount)

	var attackStyle = defaultAttackStyle
	var amount string

	// 1. Attack Style (Index 0)
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			attackStyle = val
		}
	}

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	} else {
		return nil // Amount is required
	}
	if amount == "" {
		return nil
	}

	// --- CRITICAL NAME & AMOUNT FORMATTING ---

	// Ensure Amount is represented as a percentage
	if !strings.HasSuffix(amount, "%") {
		amount = amount + "%"
	}

	// Name format: [Attack Style] Alacrity
	name := fmt.Sprintf("%s %s", attackStyle, baseName)

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: defaultBonusType,
		// All other fields remain empty.
	}
}

func parseTemplateStunning(rawStunValue string) []*api.Enchantment {
	const prefix = "{{Stunning|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawStunValue, prefix) || !strings.HasSuffix(rawStunValue, suffix) {
		return nil
	}

	paramList := rawStunValue[len(prefix) : len(rawStunValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	var enchantments []*api.Enchantment

	// --- CRITICAL: Generate Two Separate Enchantments ---
	for _, maneuver := range stunningManeuvers {
		// Name format: "[Maneuver] DC Bonus"
		name := fmt.Sprintf("Tactical DC: %s", maneuver)

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateShatter(rawShatterValue string) *api.Enchantment {
	const prefix = "{{Shatter|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawShatterValue, prefix) || !strings.HasSuffix(rawShatterValue, suffix) {
		return nil
	}

	paramList := rawShatterValue[len(prefix) : len(rawShatterValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var name string
	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// --- CRITICAL NAME FORMATTING ---

	// Name format: [Bonus Type] Shatter (to distinguish it from generic Sunder DC)
	if strings.ToLower(bonusType) == strings.ToLower(defaultBonusType) {
		name = "Tactical DC: Sunder"
	} else {
		name = "Tactical DC: " + bonusType + " Sunder"
	}

	// For clarity, we map the effect name to the actual maneuver DC it affects.
	// The final name uses the template's common name for recognition.

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

// Template:Paralyzing
// Usage examples from docs:
//
//	{{Paralyzing}}                -> Regular version (Will DC 17)
//	{{Paralyzing|Improved}}       -> Improved version (Will DC 25)
//	{{Paralyzing|Legendary}}      -> Legendary version (DC not specified in docs screenshot)
//
// Output: single standard enchantment with BonusType "On-hit" and Amount set to DC when known.
func parseTemplateParalyzing(raw string) *api.Enchantment {
	const name = "Paralyzing"
	const prefix = "{{" + name
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract inner params
	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	version := "Regular"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := stripBrackets(parts[0])
			if v != "" {
				version = v
			}
		}
	}

	// Map versions to DCs when known
	var dc string
	switch strings.ToLower(strings.TrimSpace(version)) {
	case "", "regular":
		dc = "17"
		version = "Regular"
	case "improved":
		dc = "25"
		version = "Improved"
	default:
		// Unknown or Legendary – keep name prefix, leave dc blank
		// version will be title-cased by caller in name formatting below
	}

	// Build output name
	outName := name
	if version != "Regular" {
		outName = version + " " + name
	}

	// Optional notes about the saving throw
	// Keeping concise; consumer may render this or ignore it.
	notes := new("Will save or be paralyzed")

	e := &api.Enchantment{
		Name:      outName,
		BonusType: "On-hit",
		Notes:     notes,
	}
	if dc != "" {
		// Store just the numeric DC in Amount for consistency with other DC-style outputs
		e.Amount = dc
	}
	return e
}

func parseTemplateArmorMastery(rawAMValue string) *api.Enchantment {
	const prefix = "{{ArmorMastery|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Armor Mastery"

	if !strings.HasPrefix(rawAMValue, prefix) || !strings.HasSuffix(rawAMValue, suffix) {
		return nil
	}

	paramList := rawAMValue[len(prefix) : len(rawAMValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var name string
	var bonusType string

	// 2. Bonus Type (Optional, Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// --- CRITICAL NAME FORMATTING ---

	// Default name format: [Bonus Type] Armor Mastery
	if strings.ToLower(bonusType) == strings.ToLower(defaultBonusType) {
		name = baseName
	} else {
		name = bonusType + " " + baseName
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

func parseTemplateBane(rawBaneValue string) *api.Enchantment {
	const prefix = "{{Bane|"
	const suffix = "}}"
	const defaultBonusType = "On-hit"

	if !strings.HasPrefix(rawBaneValue, prefix) || !strings.HasSuffix(rawBaneValue, suffix) {
		return nil
	}

	paramList := rawBaneValue[len(prefix) : len(rawBaneValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Creature Type)|(Dice)|(Enhancement Bonus)|(Die type)|(Title)

	// 1. Creature Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	creatureType := stripBrackets(parts[0])
	if creatureType == "" {
		return nil
	}

	var dice string
	var enhancementBonus string
	var dieType = "6" // Default die type is d6
	var name string

	// 2. Dice (Optional, Index 1)
	if len(parts) >= 2 {
		dice = stripBrackets(parts[1])
	}

	// 3. Enhancement Bonus (Optional, Index 2)
	if len(parts) >= 3 {
		enhancementBonus = stripBrackets(parts[2])
	}

	// 4. Die type (Optional, Index 3)
	if len(parts) >= 4 {
		val := stripBrackets(parts[3])
		if val != "" {
			dieType = val
		}
	}

	// --- CRITICAL NAME FORMATTING & DATA MAPPING ---
	name = fmt.Sprintf("Bane Damage vs %s", creatureType)

	// Construct Modifier
	var modifier string
	if dice != "" {
		modifier = fmt.Sprintf("%sd%s", dice, dieType)
	} else if enhancementBonus != "" {
		// Fallback for older items that might use enhancement bonus
		modifier = enhancementBonus
	}

	return &api.Enchantment{
		Name: name,

		// Use Amount for the Bane Damage amount (e.g. 4d10)
		Amount: modifier,

		// Use Bonus to store "On-hit"
		BonusType: defaultBonusType,

		// Use Element to store the target creature type for classification
		Element: creatureType,
	}
}

func parseTemplateVertigo(rawVertigoValue string) []*api.Enchantment {
	const prefix = "{{Vertigo|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawVertigoValue, prefix) || !strings.HasSuffix(rawVertigoValue, suffix) {
		return nil
	}

	paramList := rawVertigoValue[len(prefix) : len(rawVertigoValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Bonus Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 2. Bonus Type (Optional, Index 1)
	if len(parts) >= 2 {
		value := stripBrackets(parts[1])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	var enchantments []*api.Enchantment

	// --- CRITICAL: Generate Two Separate Enchantments ---
	for _, maneuver := range vertigoManeuvers {
		// Name format: "[Maneuver] DC Bonus"
		name := fmt.Sprintf("Tactical DC: %s", maneuver)

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

func parseTemplateRelentlessFury() *api.Enchantment {
	const templateName = "Relentless Fury"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}

// Template:InspireGreatnessExtra
// Documentation screenshot indicates no parameters; used on equipment to
// enhance the Inspire Greatness enhancement. Per request, just output the
// name of the enchantment.
func parseTemplateInspireGreatnessExtra(raw string) *api.Enchantment {
	const prefix = "{{InspireGreatnessExtra"
	const suffix = "}}"
	const baseName = "Inspire Greatness"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}
	return &api.Enchantment{Name: baseName}
}

// Template:Vacuum
// Usage per docs: {{Vacuum|(Type)|(Title)}}
// - Type: blank (Basic) or Legendary. We will use this to prefix the name when present.
// - Title: Ignored per request.
// Output: a single enchantment placed under effectsAdded with only the name.
//
//	Name rules: if Type provided -> "<Type> Vacuum"; else "Vacuum".
func parseTemplateVacuum(raw string) *api.Enchantment {
	const prefix = "{{Vacuum"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract parameter section, if any
	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	var typ string
	if inner != "" {
		if strings.HasPrefix(inner, "|") {
			inner = strings.TrimPrefix(inner, "|")
		}
		// Only the first parameter (Type) is considered
		parts := strings.SplitN(inner, "|", 2)
		if len(parts) > 0 {
			typ = stripBrackets(parts[0])
		}
	}

	// Normalize type
	t := strings.TrimSpace(strings.ToLower(typ))
	var name string
	switch t {
	case "legendary":
		name = "Legendary Vacuum"
	case "", "basic":
		name = "Vacuum"
	default:
		// If an unexpected value is provided, fall back to capitalized word + " Vacuum"
		c := cases.Title(language.English).String(t)
		if c == "" {
			name = "Vacuum"
		} else {
			name = c + " Vacuum"
		}
	}

	return &api.Enchantment{Name: name}
}

// Template:TouchoftheMournlands
// Per request: just output the effect name. No parameters expected/used.
// Example usage: {{TouchoftheMournlands}}
func parseTemplateTouchoftheMournlands(raw string) *api.Enchantment {
	const prefix = "{{TouchoftheMournlands"
	const suffix = "}}"
	const name = "Touch of the Mournlands"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}
	return &api.Enchantment{Name: name}
}

// Template:Bodyfeeder
// Usage (from docs): {{Bodyfeeder|(Type)|(Title)}}
// - Type: Basic (blank), Legendary, Slayer
// Requirement: Output only the name of the enchantment; if Title is present, use it.
// Otherwise, use the Type to prefix the base name "Bodyfeeder".
func parseTemplateBodyfeeder(raw string) *api.Enchantment {
	const prefix = "{{Bodyfeeder"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract parameter section
	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var parts []string
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	// Title takes precedence when provided
	var title string
	if len(parts) >= 2 {
		title = stripBrackets(parts[1])
	}
	if title != "" {
		return &api.Enchantment{Name: title}
	}

	// Otherwise, form name from Type
	var typ string
	if len(parts) >= 1 {
		typ = stripBrackets(parts[0])
	}
	t := strings.ToLower(strings.TrimSpace(typ))
	name := "Bodyfeeder"
	switch t {
	case "legendary":
		name = "Legendary Bodyfeeder"
	case "slayer":
		name = "Slayer Bodyfeeder"
	case "", "basic":
		name = "Bodyfeeder"
	default:
		// Unknown value: title-case and prefix if non-empty
		if t != "" {
			name = cases.Title(language.English).String(t) + " Bodyfeeder"
		}
	}
	return &api.Enchantment{Name: name}
}

// Template:AlignmentBypass
// Usage per docs: {{AlignmentBypass|(Alignment)|(Title)}}
// - Alignment: Chaos, Good, Evil, Lawful. Blank means all alignments.
// - Title: Optional custom title (IGNORED here – we standardize output).
// Output requirement: one or more effects named exactly:
//
//	"Damage Reduction Bypass: <Alignment>"
//
// If alignment is blank → emit four effects: Chaos, Evil, Good, Lawful (in that order).
func parseTemplateAlignmentBypass(raw string) []*api.Enchantment {
	const prefix = "{{AlignmentBypass"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract inner content between name and closing
	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var align string
	if inner != "" {
		// Only the first parameter (Alignment) is relevant for our standardized output
		parts := strings.SplitN(inner, "|", 2)
		align = stripBrackets(parts[0])
	}

	// Normalize alignment casing
	normAlign := func(a string) string {
		a = strings.TrimSpace(strings.ToLower(a))
		switch a {
		case "good":
			return "Good"
		case "evil":
			return "Evil"
		case "lawful":
			return "Lawful"
		case "chaos":
			return "Chaos"
		case "all", "":
			return "" // special case → expand to all four below
		default:
			return "" // unknown → treat as blank (no output) to be safe
		}
	}

	aNorm := normAlign(align)

	makeEffect := func(al string) *api.Enchantment {
		return &api.Enchantment{Name: "Damage Reduction Bypass: " + al, Element: al}
	}

	if aNorm == "" {
		// Emit all four in deterministic order
		return []*api.Enchantment{
			makeEffect("Chaos"),
			makeEffect("Evil"),
			makeEffect("Good"),
			makeEffect("Lawful"),
		}
	}

	return []*api.Enchantment{makeEffect(aNorm)}
}

// Template:Metalline
// Usage per docs: {{Metalline|(Type)|(Metal)|(Title)}}
//   - Type: blank/None (basic → bypasses ALL metal DR), "Legendary" (also bypasses ALL), or "Single" (requires Metal param).
//   - Metal: when Type==Single, indicates which metal DR is bypassed. Accept common aliases.
//   - Title: Ignored. We standardize output to one or more effects with names:
//     "Damage Reduction Bypass: <Metal>"
//
// Metals covered (from documentation): Adamantine, Alchemical Silver, Byeshk, Cold Iron, Mithril.
func parseTemplateMetalline(raw string) []*api.Enchantment {
	const prefix = "{{Metalline"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract inner
	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	// Split top-level params simply; Metalline params do not nest templates typically
	parts := []string{}
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	// Normalize metals list and helpers
	allMetals := []string{"Adamantine", "Alchemical Silver", "Byeshk", "Cold Iron", "Mithril"}

	// Alias map for input normalization
	alias := map[string]string{
		"adamantine":        "Adamantine",
		"silver":            "Alchemical Silver",
		"alchemical silver": "Alchemical Silver",
		"byeshk":            "Byeshk",
		"cold iron":         "Cold Iron",
		"mithril":           "Mithril",
	}

	// Helper to emit unique in deterministic order
	addEffects := func(metals []string) []*api.Enchantment {
		seen := map[string]bool{}
		out := make([]*api.Enchantment, 0, len(metals))
		for _, m := range metals {
			norm := strings.TrimSpace(m)
			if norm == "" {
				continue
			}
			// normalize to canonical display via alias table
			key := strings.ToLower(norm)
			if v, ok := alias[key]; ok {
				norm = v
			} else {
				// try to title-case generic input
				norm = cases.Title(language.English).String(key)
			}
			if !seen[norm] {
				seen[norm] = true
				out = append(out, &api.Enchantment{Name: "Damage Reduction Bypass: " + norm, Element: norm})
			}
		}
		return out
	}

	// Determine behavior from Type
	typ := ""
	if len(parts) >= 1 {
		typ = stripBrackets(parts[0])
	}
	t := strings.ToLower(strings.TrimSpace(typ))

	switch t {
	case "", "none", "basic", "legendary":
		// Emit all metal bypasses
		return addEffects(allMetals)
	case "single":
		// Read Metal parameter; allow multiple separated by commas or '/'
		metalParam := ""
		if len(parts) >= 2 {
			metalParam = stripBrackets(parts[1])
		}
		metalParam = strings.TrimSpace(metalParam)
		if metalParam == "" {
			return nil
		}
		// Split on commas and slashes
		split := func(s string) []string {
			s = strings.ReplaceAll(s, "/", ",")
			segs := strings.Split(s, ",")
			for i := range segs {
				segs[i] = strings.TrimSpace(segs[i])
			}
			return segs
		}
		return addEffects(split(metalParam))
	default:
		// Unrecognized type; safest default is to treat like basic Metalline
		return addEffects(allMetals)
	}
}

func parseTemplateWeaponPower(rawWPValue string) []*api.Enchantment {
	const prefix = "{{WeaponPower|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const defaultPower = "Melee"           // Default attack type from documentation
	const baseName = "Weapon Power"

	if !strings.HasPrefix(rawWPValue, prefix) || !strings.HasSuffix(rawWPValue, suffix) {
		return nil
	}

	paramList := rawWPValue[len(prefix) : len(rawWPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Power)|(Enhancement Amount)|(Bonus Type)

	// 1. Power (Optional, Index 0) - Defaults to Melee
	var powerType = defaultPower
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			powerType = val
		}
	}

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) < 2 {
		return nil
	}
	amount := stripBrackets(parts[1])
	if amount == "" {
		return nil
	}

	var bonusType string

	// 3. Bonus Type (Optional, Index 2 - defaults to Enhancement)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = value
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	var enchantments []*api.Enchantment

	// --- CRITICAL SPLIT LOGIC ---
	normalizedPower := strings.ToLower(powerType)

	// Check if we need to split (Both/All)
	isSplit := strings.EqualFold(normalizedPower, "both") || strings.EqualFold(normalizedPower, "all")

	if isSplit {
		// Split into Melee and Ranged
		for _, attackType := range weaponPowerTypes {
			// Name format: [Bonus Type] [Attack Type] Power
			name := fmt.Sprintf("%s Power", attackType)
			if strings.ToLower(bonusType) != strings.ToLower(defaultBonusType) {
				name = bonusType + " " + name
			}

			enchantments = append(enchantments, &api.Enchantment{
				Name:      name,
				Amount:    amount,
				BonusType: bonusType,
			})
		}
	} else {
		// Single Power Type (Melee or Ranged)
		// Name format: [Bonus Type] [Power Type] Power
		name := fmt.Sprintf("%s Power", powerType)
		if strings.ToLower(bonusType) != strings.ToLower(defaultBonusType) {
			name = bonusType + " " + name
		}

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}

// Template:ItemMaterialDR
// Usage per screenshot/doc:
//
//	{{ItemMaterialDR|(Material)|(Item Type)}}
//
// Behavior requested: Output just the Material name; if an Item Type is
// specified, append it in parentheses.
// Examples:
//
//	{{ItemMaterialDR|Flametouched Iron}}         -> "Flametouched Iron"
//	{{ItemMaterialDR|Silver|Long Bow}}           -> "Silver (Long Bow)"
func parseTemplateItemMaterialDR(raw string) *api.Enchantment {
	const prefix = "{{ItemMaterialDR"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := []string{}
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	if len(parts) < 1 {
		return nil
	}
	material := stripBrackets(parts[0])
	material = strings.TrimSpace(material)
	if material == "" {
		return nil
	}

	var itemType string
	if len(parts) >= 2 {
		itemType = strings.TrimSpace(stripBrackets(parts[1]))
	}

	name := "Damage Reduction Bypass: " + material
	if itemType != "" {
		name = material + " (" + itemType + ")"
	}

	return &api.Enchantment{Name: name}
}

// Template:Aligned
// Usage per screenshot/doc:
//
//	{{Aligned|(Alignment)|(Title)}}
//
// We only need to output the name of the enhancement. If a Title is provided,
// use it as-is. Otherwise, map Alignment to a default name used in examples:
//
//	Evil   -> "Taint of Evil"
//	Good   -> "Taint of Good"
//	Lawful -> "Taint of Law"
//	Chaos  -> "Taint of Chaos"
//	EmbodyLaw -> "Embodiment of Law"
//
// Unknown/blank values are ignored (no output).
func parseTemplateAligned(raw string) *api.Enchantment {
	const prefix = "{{Aligned"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	// Split simple params: (Alignment)|(Title)
	parts := []string{}
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	var alignment, title string
	if len(parts) >= 1 {
		alignment = stripBrackets(parts[0])
	}
	if len(parts) >= 2 {
		title = stripBrackets(parts[1])
	}

	if title != "" {
		return &api.Enchantment{Name: title}
	}

	a := strings.ToLower(strings.TrimSpace(alignment))
	switch a {
	case "evil":
		return &api.Enchantment{Name: "Taint of Evil"}
	case "good":
		return &api.Enchantment{Name: "Taint of Good"}
	case "law", "lawful":
		return &api.Enchantment{Name: "Taint of Law"}
	case "chaos", "chaotic":
		return &api.Enchantment{Name: "Taint of Chaos"}
	case "embodylaw", "embody law", "embody-law":
		return &api.Enchantment{Name: "Embodiment of Law"}
	case "embodychaos", "embody chaos", "embody-chaos":
		return &api.Enchantment{Name: "Embodiment of Chaos"}
	default:
		return nil
	}
}

// Template:HealLikeaGolem
// No parameters. Output only the name: "Heal Like a Golem".
func parseTemplateHealLikeaGolem(raw string) *api.Enchantment {
	const prefix = "{{HealLikeaGolem"
	const suffix = "}}"
	const name = "Heal Like a Golem"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}
	return &api.Enchantment{Name: name}
}

// Template:Steam
// Usage: {{Steam|(Type)|(Title)}}
// Behavior: output only the enchantment name. If Title is provided, use it.
// Otherwise, form the name from Type:
//   - blank or "Basic" -> "Steam"
//   - otherwise -> "<Title-Cased Type> Steam" (e.g., Legendary -> "Legendary Steam")
func parseTemplateSteam(raw string) *api.Enchantment {
	const prefix = "{{Steam"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var typ, title string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			typ = stripBrackets(parts[0])
		}
		if len(parts) >= 2 {
			title = stripBrackets(parts[1])
		}
	}

	if strings.TrimSpace(title) != "" {
		return &api.Enchantment{Name: title}
	}

	t := strings.ToLower(strings.TrimSpace(typ))
	switch t {
	case "", "basic":
		return &api.Enchantment{Name: "Steam"}
	default:
		name := cases.Title(language.English).String(t) + " Steam"
		return &api.Enchantment{Name: name}
	}
}

// Template:Salt
// Usage: {{Salt|(Type)|(Title)}}
// Behavior mirrors Template:Steam:
// - If Title present → use it exactly.
// - If Type blank or "Basic" → base name "Salt".
// - Else → "<Title-Cased Type> Salt".
func parseTemplateSalt(raw string) *api.Enchantment {
	const prefix = "{{Salt"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var typ, title string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			typ = stripBrackets(parts[0])
		}
		if len(parts) >= 2 {
			title = stripBrackets(parts[1])
		}
	}

	if strings.TrimSpace(title) != "" {
		return &api.Enchantment{Name: title}
	}

	t := strings.ToLower(strings.TrimSpace(typ))
	switch t {
	case "", "basic":
		return &api.Enchantment{Name: "Salt"}
	default:
		name := cases.Title(language.English).String(t) + " Salt"
		return &api.Enchantment{Name: name}
	}
}

// Template:Ice
// Usage: {{Ice|(Type)|(Title)}}
// Behavior mirrors Steam/Salt:
// - If Title present → use it exactly.
// - If Type blank or "Basic" → base name "Ice".
// - Else → "<Title-Cased Type> Ice".
func parseTemplateIce(raw string) *api.Enchantment {
	const prefix = "{{Ice"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var typ, title string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			typ = stripBrackets(parts[0])
		}
		if len(parts) >= 2 {
			title = stripBrackets(parts[1])
		}
	}

	if strings.TrimSpace(title) != "" {
		return &api.Enchantment{Name: title}
	}

	t := strings.ToLower(strings.TrimSpace(typ))
	switch t {
	case "", "basic":
		return &api.Enchantment{Name: "Ice"}
	default:
		name := cases.Title(language.English).String(t) + " Ice"
		return &api.Enchantment{Name: name}
	}
}

// Template:SneakAttackDamage
// Usage (assumed): {{SneakAttackDamage|(Amount)|(Bonus Type)}}
// Requirements:
//   - Output name must be exactly: "Sneak Attack Damage".
//   - Include Amount and Bonus.
//   - Amount should include a trailing '%' only if provided in the source (or if
//     the amount clearly represents a percentage like "5%"), otherwise keep as plain number.
//   - No Title override.
func parseTemplateSneakAttackDamage(raw string) *api.Enchantment {
	const prefix = "{{SneakAttackDamage|"
	const altPrefix = "{{SneakAttackDamage" // tolerate no trailing pipe when empty
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !(strings.HasPrefix(s, prefix) || (strings.HasPrefix(s, altPrefix) && strings.HasSuffix(s, suffix))) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract parameter list between first '|' after name and '}}' if present
	var params string
	if strings.HasPrefix(s, prefix) {
		params = s[len(prefix) : len(s)-len(suffix)]
	} else {
		// Handle "{{SneakAttackDamage}}" (no params)
		inner := strings.TrimSuffix(strings.TrimPrefix(s, altPrefix), suffix)
		inner = strings.TrimSpace(inner)
		if inner == "" {
			// No params → cannot infer amount; skip
			return nil
		}
		if strings.HasPrefix(inner, "|") {
			inner = strings.TrimPrefix(inner, "|")
		}
		params = inner
	}

	parts := strings.Split(params, "|")
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	amount = strings.TrimSpace(amount)
	if amount == "" {
		return nil
	}

	// If amount is numeric without a % sign, keep as-is; if contains '%', preserve it.
	// Also allow inputs like "5 %" → normalize to "5%".
	if strings.Contains(amount, "%") {
		amount = strings.ReplaceAll(amount, " ", "")
	}

	bonusType := "Enhancement"
	if len(parts) >= 2 {
		bt := stripBrackets(parts[1])
		bt = strings.TrimSpace(bt)
		if bt != "" {
			bonusType = bt
		}
	}

	return &api.Enchantment{
		Name:      "Sneak Attack Damage",
		Amount:    amount,
		BonusType: bonusType,
	}
}

// Template:Deception
// Docs and source provided via screenshot and raw #switch from Template:Deception.
// Signature: {{Deception|(Type)|(Enhancement Amount)|(Bonus Type)|(Damage)|(Title)}}
// Types and behavior we support:
// - improved: Bluff Skill +5 Enhancement
// - new: Bluff Skill +3 Enhancement
// - new improved: Bluff Skill +{Enhancement Amount} Enhancement
// - historic: Bluff Skill +3 Enhancement
// - classic: for attacks that qualify as Sneak Attacks → +{Enhancement Amount} to hit and +{2*Enhancement Amount} to damage
// - custom: +{Enhancement Amount} {Bonus Type} to hit and +{Damage} {Bonus Type} to damage to attacks that qualify as Sneak Attacks
// - #default: +{Enhancement Amount} {Bonus Type} to hit and +{2*Enhancement Amount} {Bonus Type} to damage to attacks that qualify as Sneak Attacks
// Output:
// - For Bluff cases → one enchantment: { Name: "Bluff Skill", Amount: value, Bonus: Enhancement }
// - For Sneak Attack cases → two enchantments:
//  1. { Name: "Sneak Attack", Amount: toHit, Bonus: <bonus> }
//  2. { Name: "Sneak Attack Damage", Amount: dmg, Bonus: <bonus> }
func parseTemplateDeception(raw string) []*api.Enchantment {
	const prefix = "{{Deception"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := []string{}
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	// Helper to get param by 1-based index used in wiki examples
	get := func(idx int) string {
		// idx is 1-based here
		i := idx - 1
		if i >= 0 && i < len(parts) {
			return stripBrackets(parts[i])
		}
		return ""
	}

	// Params
	typ := strings.ToLower(strings.TrimSpace(get(1)))
	enh := strings.TrimSpace(get(2)) // Enhancement Amount
	bt := strings.TrimSpace(get(3))  // Bonus Type
	dmg := strings.TrimSpace(get(4)) // Damage (for custom only)
	if bt == "" {
		bt = "Enhancement"
	}

	// Utilities
	// multiply number string by 2 (simple integer math); if not integer, leave blank
	timesTwo := func(a string) string {
		if a == "" {
			return ""
		}
		if n, err := strconv.Atoi(a); err == nil {
			return strconv.Itoa(n * 2)
		}
		return ""
	}

	// Build outputs
	var out []*api.Enchantment

	switch typ {
	case "improved":
		out = append(out, &api.Enchantment{Name: "Skill: Bluff", Amount: "5", BonusType: "Enhancement"})
	case "new":
		out = append(out, &api.Enchantment{Name: "Skill: Bluff", Amount: "3", BonusType: "Enhancement"})
	case "new improved":
		if enh == "" {
			enh = "5"
		}
		out = append(out, &api.Enchantment{Name: "Skill: Bluff", Amount: enh, BonusType: "Enhancement"})
	case "historic":
		out = append(out, &api.Enchantment{Name: "Skill: Bluff", Amount: "3", BonusType: "Enhancement"})
	case "classic":
		// +enh to hit; +2*enh to damage → use Sneak Attack / Sneak Attack Damage
		if enh == "" {
			enh = "1"
		}
		out = append(out, &api.Enchantment{Name: "Sneak Attack", Amount: enh, BonusType: "Enhancement"})
		out = append(out, &api.Enchantment{Name: "Sneak Attack Damage", Amount: timesTwo(enh), BonusType: "Enhancement"})
	case "custom":
		if enh != "" {
			out = append(out, &api.Enchantment{Name: "Sneak Attack", Amount: enh, BonusType: bt})
		}
		if dmg != "" {
			out = append(out, &api.Enchantment{Name: "Sneak Attack Damage", Amount: dmg, BonusType: bt})
		}
	case "": // #default path when type omitted
		fallthrough
	default: // #default in the template when unrecognized value
		if enh != "" {
			out = append(out, &api.Enchantment{Name: "Sneak Attack", Amount: enh, BonusType: bt})
			out = append(out, &api.Enchantment{Name: "Sneak Attack Damage", Amount: timesTwo(enh), BonusType: bt})
		}
	}

	if len(out) == 0 {
		return nil
	}
	return out
}

// --- Main Enchantment Dispatcher ---

// ParseEnchantments finds and parses all enchantment templates in the raw string.
func ParseEnchantments(rawEnchantments string, itemType string) []api.Enchantment {
	if strings.TrimSpace(rawEnchantments) == "" {
		return nil
	}

	var finalEnchantments []api.Enchantment
	var parsedEnchantments []api.Enchantment
	var remaining = rawEnchantments

	const openingBraces = "{{"

	for {
		start := strings.Index(remaining, openingBraces)
		if start == -1 {
			break
		}

		// 1. Identify the full template name
		pipeIndex := strings.Index(remaining[start+2:], "|")
		braceIndex := strings.Index(remaining[start+2:], "}}")

		var templateName string
		if pipeIndex != -1 && (pipeIndex < braceIndex || braceIndex == -1) {
			templateName = strings.TrimSpace(remaining[start+2 : start+2+pipeIndex])
		} else if braceIndex != -1 {
			templateName = strings.TrimSpace(remaining[start+2 : start+2+braceIndex])
		} else {
			remaining = remaining[start+2:]
			continue
		}

		// 2. Find the matching closing "}}" using the brace counter
		openBraceCount := 0
		endOfTemplate := -1
		searchStart := start + 2

		for i := searchStart; i < len(remaining); i++ {
			char := remaining[i]

			if char == '{' {
				openBraceCount++
			} else if char == '}' {
				if openBraceCount > 0 {
					openBraceCount--
				} else if openBraceCount == 0 {
					if i+1 < len(remaining) && remaining[i+1] == '}' {
						endOfTemplate = i + 1
						break
					}
				}
			}
		}

		if endOfTemplate == -1 {
			break
		}

		fullTemplate := remaining[start : endOfTemplate+1]
		// DO NOT advance remaining here, we will do it after the switch
		// remaining = remaining[endOfTemplate+1:] // Removed to fix double-advance bug

		var enchantmentData *api.Enchantment
		var multiEnchantments []*api.Enchantment
		var isStandard = false

		// 3. Dispatch and classify
		switch templateName {
		case "ThaarakCorrosion":
			enchantmentData = parseTemplateThaarakCorrosion(fullTemplate)
			isStandard = true
		case "SunBurst":
			enchantmentData = parseTemplateSunBurst(fullTemplate)
			isStandard = true
		case "SoulEating":
			enchantmentData = parseTemplateSoulEating(fullTemplate)
			isStandard = true
		case "MonkPath":
			enchantmentData = parseTemplateMonkPath(fullTemplate)
			isStandard = true
		case "PathoftheGuardingStone":
			enchantmentData = parseTemplatePathoftheGuardingStone(fullTemplate)
			isStandard = true
		case "Sirocco":
			enchantmentData = parseTemplateSirocco(fullTemplate)
			isStandard = true
		case "BetterOffhanded":
			enchantmentData = parseTemplateBetterOffhanded(fullTemplate)
			isStandard = true
		case "Unbalancing":
			enchantmentData = parseTemplateUnbalancing(fullTemplate)
			isStandard = true
		case "Unwieldy":
			enchantmentData = parseTemplateUnwieldy(fullTemplate)
			isStandard = true
		case "WildFrenzy":
			enchantmentData = parseTemplateWildFrenzy(fullTemplate)
			isStandard = true
		case "MedusaFury":
			enchantmentData = parseTemplateMedusaFury(fullTemplate)
			isStandard = true
		case "StealerOfSouls":
			enchantmentData = parseTemplateStealerOfSouls(fullTemplate)
			isStandard = true
		case "TheMoralCompass":
			enchantmentData = parseTemplateTheMoralCompass(fullTemplate)
			isStandard = true
		case "MindTear":
			enchantmentData = parseTemplateMindTear(fullTemplate)
			isStandard = true
		case "PlantSlaying":
			enchantmentData = parseTemplatePlantSlaying(fullTemplate)
			isStandard = true
		case "StaticAttraction":
			enchantmentData = parseTemplateStaticAttraction(fullTemplate)
			isStandard = true
		case "SoulTear":
			enchantmentData = parseTemplateSoulTear(fullTemplate)
			isStandard = true
		case "CleverStrike":
			enchantmentData = parseTemplateCleverStrike(fullTemplate)
			isStandard = true
		case "CripplingFlames":
			enchantmentData = parseTemplateCripplingFlames(fullTemplate)
			isStandard = true
		case "Cloudburst":
			enchantmentData = parseTemplateCloudburst(fullTemplate)
			isStandard = true
		case "Boneshatter":
			enchantmentData = parseTemplateBoneshatter(fullTemplate)
			isStandard = true
		case "Bonesplitter":
			enchantmentData = parseTemplateBonesplitter(fullTemplate)
			isStandard = true
		case "StonePrison":
			enchantmentData = parseTemplateStonePrison(fullTemplate)
			isStandard = true
		case "BlindingFlash":
			enchantmentData = parseTemplateBlindingFlash(fullTemplate)
			isStandard = true
		case "RadiantBlast":
			enchantmentData = parseTemplateRadiantBlast(fullTemplate)
			isStandard = true
		case "DemonFever":
			enchantmentData = parseTemplateDemonFever(fullTemplate)
			isStandard = true
		case "BlindingEmbers":
			enchantmentData = parseTemplateBlindingEmbers(fullTemplate)
			isStandard = true
		case "Lifedrinker":
			enchantmentData = parseTemplateLifedrinker(fullTemplate)
			isStandard = true
		case "MagmaSurge":
			enchantmentData = parseTemplateMagmaSurge(fullTemplate)
			isStandard = true
		case "WrathOfTheZealot":
			enchantmentData = parseTemplateWrathOfTheZealot(fullTemplate)
			isStandard = true
		case "Feeding":
			enchantmentData = parseTemplateFeeding(fullTemplate)
			isStandard = true
		case "Flamebitten":
			enchantmentData = parseTemplateFlamebitten(fullTemplate)
			isStandard = true
		case "Skybreaker":
			enchantmentData = parseTemplateSkybreaker(fullTemplate)
			isStandard = true
		case "BrillanceoftheShatteredSun":
			enchantmentData = parseTemplateBrillanceoftheShatteredSun(fullTemplate)
			isStandard = true
		case "Entangling":
			enchantmentData = parseTemplateEntangling(fullTemplate)
			isStandard = true
		case "Slowburst":
			enchantmentData = parseTemplateSlowburst(fullTemplate)
			isStandard = true
		case "MindTurbulence":
			enchantmentData = parseTemplateMindTurbulence(fullTemplate)
			isStandard = true
		case "CrushingWave":
			enchantmentData = parseTemplateCrushingWave(fullTemplate)
			isStandard = true
		case "AntiMagicRunes":
			enchantmentData = parseTemplateAntiMagicRunes(fullTemplate)
			isStandard = true
		case "ElementalSpiral":
			enchantmentData = parseTemplateElementalSpiral(fullTemplate)
			isStandard = true
		case "Fusible":
			enchantmentData = parseTemplateFusible(fullTemplate)
			isStandard = true
		case "Malleable":
			enchantmentData = parseTemplateMalleable(fullTemplate)
			isStandard = true
		case "Fragmented":
			enchantmentData = parseTemplateFragmented(fullTemplate)
			isStandard = true
		case "Impact":
			enchantmentData = parseTemplateImpact(fullTemplate)
			isStandard = true
		case "TheDraggingOfTheDepths":
			enchantmentData = parseTemplateTheDraggingOfTheDepths(fullTemplate)
			isStandard = true
		case "Fracturing":
			enchantmentData = parseTemplateFracturing(fullTemplate)
			isStandard = true
		case "PlanarSearing":
			enchantmentData = parseTemplatePlanarSearing(fullTemplate)
			isStandard = true
		case "IdentityCrisis":
			enchantmentData = parseTemplateIdentityCrisis(fullTemplate)
			isStandard = true
		case "Masterwork":
			enchantmentData = parseTemplateMasterwork(fullTemplate)
			isStandard = true
		case "AccursedFlame":
			enchantmentData = parseTemplateAccursedFlame(fullTemplate)
			isStandard = true
		case "FascinationGuard":
			enchantmentData = parseTemplateFascinationGuard(fullTemplate)
			isStandard = true
		case "SecretDoorDetection":
			enchantmentData = parseTemplateSecretDoorDetection()
			isStandard = true
		case "Echoesof2006":
			enchantmentData = parseTemplateEchoesof2006()
			isStandard = true
		case "Undersun":
			enchantmentData = parseTemplateUndersun()
			isStandard = true
		case "BattleScarred":
			enchantmentData = parseTemplateBattleScarred()
			isStandard = true
		case "AlmostThere":
			enchantmentData = parseTemplateAlmostThere()
			isStandard = true
		case "HiddenHandSecretVisibility":
			enchantmentData = parseTemplateHiddenHandSecretVisibility(fullTemplate)
			isStandard = true
		case "Dazing":
			multiEnchantments = parseTemplateDazing(fullTemplate)
			isStandard = true
		case "DreamVision":
			multiEnchantments = parseTemplateDreamVision(fullTemplate)
			isStandard = true
		case "TouchOfImmortality":
			multiEnchantments = parseTemplateTouchOfImmortality(fullTemplate)
			isStandard = true
		case "Vulnerability":
			enchantmentData = parseTemplateVulnerability(fullTemplate)
			isStandard = true
		case "Vicious":
			enchantmentData = parseTemplateVicious(fullTemplate)
			isStandard = true
		case "Polycurse":
			enchantmentData = parseTemplatePolycurse(fullTemplate)
			isStandard = true
		case "CrimsonCovenant":
			enchantmentData = parseTemplateCrimsonCovenant(fullTemplate)
			isStandard = true
		case "CurseVector":
			enchantmentData = parseTemplateCurseVector(fullTemplate)
			isStandard = true
		case "Bloodletter":
			enchantmentData = parseTemplateBloodletter(fullTemplate)
			isStandard = true
		case "FettersofUnreality":
			enchantmentData = parseTemplateFettersofUnreality(fullTemplate)
			isStandard = true
		case "Finesse":
			enchantmentData = parseTemplateFinesse(fullTemplate)
			isStandard = true
		case "GiantSlayer":
			enchantmentData = parseTemplateGiantSlayer(fullTemplate)
			isStandard = true
		case "GodlyWrath":
			enchantmentData = parseTemplateGodlyWrath(fullTemplate)
			isStandard = true
		case "GreaterDispelling":
			enchantmentData = parseTemplateGreaterDispelling(fullTemplate)
			isStandard = true
		case "MotherNightsEmbrace":
			enchantmentData = parseTemplateMotherNightsEmbrace(fullTemplate)
			isStandard = true
		case "EchoesOfAngdrelve":
			enchantmentData = parseTemplateEchoesOfAngdrelve(fullTemplate)
			isStandard = true
		case "Righteous":
			enchantmentData = parseTemplateRighteous(fullTemplate)
			isStandard = true
		case "Smiting":
			enchantmentData = parseTemplateSmiting(fullTemplate)
			isStandard = true
		case "Alchemical":
			enchantmentData = parseTemplateAlchemical(fullTemplate)
			isStandard = true
		case "Thunderforged":
			enchantmentData = parseTemplateThunderforged(fullTemplate)
			isStandard = true
		case "Ribcracker":
			enchantmentData = parseTemplateRibcracker(fullTemplate)
			isStandard = true
		case "ConstrictingNightmare":
			enchantmentData = parseTemplateConstrictingNightmare(fullTemplate)
			isStandard = true
		case "Enfeebling":
			enchantmentData = parseTemplateEnfeebling(fullTemplate)
			isStandard = true
		case "CorrosiveSaltGuard":
			enchantmentData = parseTemplateCorrosiveSaltGuard(fullTemplate)
			isStandard = true
		case "LifeStealing":
			enchantmentData = parseTemplateLifeStealing(fullTemplate)
			isStandard = true
		case "CursedMaelstrom":
			enchantmentData = parseTemplateCursedMaelstrom(fullTemplate)
			isStandard = true
		case "Incineration":
			enchantmentData = parseTemplateIncineration(fullTemplate)
			isStandard = true
		case "Stumbling":
			enchantmentData = parseTemplateStumbling(fullTemplate)
			isStandard = true
		case "Sundering":
			enchantmentData = parseTemplateSundering(fullTemplate)
			isStandard = true
		case "Frostbite":
			enchantmentData = parseTemplateFrostbite()
			isStandard = true
		case "Thunderstruck":
			enchantmentData = parseTemplateThunderstruck(fullTemplate)
			isStandard = true
		case "Ghostbane":
			enchantmentData = parseTemplateGhostbane(fullTemplate)
			isStandard = true
		case "Puncturing":
			enchantmentData = parseTemplatePuncturing(fullTemplate)
			isStandard = true
		case "Goldcurse":
			enchantmentData = parseTemplateGoldcurse(fullTemplate)
			isStandard = true
		case "VileGrip":
			enchantmentData = parseTemplateVileGrip(fullTemplate)
			isStandard = true
		case "Bleed":
			enchantmentData = parseTemplateBleed(fullTemplate)
			isStandard = true
		case "Heartseeker":
			enchantmentData = parseTemplateHeartseeker(fullTemplate)
			isStandard = true
		case "Disruption":
			enchantmentData = parseTemplateDisruption(fullTemplate)
			isStandard = true
		case "Wounding":
			enchantmentData = parseTemplateWounding(fullTemplate)
			isStandard = true
		case "MortalStrike":
			enchantmentData = parseTemplateMortalStrike(fullTemplate)
			isStandard = true
		case "AbilityDamage":
			enchantmentData = parseTemplateAbilityDamage(fullTemplate)
			isStandard = true
		case "PlanarConflux":
			enchantmentData = parseTemplatePlanarConflux(fullTemplate)
			isStandard = true
		case "IncrediblePotential":
			enchantmentData = parseTemplateIncrediblePotential(fullTemplate)
			isStandard = true
		case "OverwhelmingDespair":
			enchantmentData = parseTemplateOverwhelmingDespair(fullTemplate)
			isStandard = true
		case "SolarGuard":
			enchantmentData = parseTemplateSolarGuard(fullTemplate)
			isStandard = true
		case "SoulOfElements":
			enchantmentData = parseTemplateSoulOfElements(fullTemplate)
			isStandard = true
		case "CreatedViaCrafting":
			// ignore this template when it appears in the enchantment list. it is already covered in drop locations
			isStandard = true
		case "SubtleTarget":
			enchantmentData = parseTemplateSubtleTarget()
			isStandard = true
		case "MelodicGuard":
			enchantmentData = parseTemplateMelodicGuard(fullTemplate)
			isStandard = true
		case "IceBarrier":
			enchantmentData = parseTemplateIceBarrier(fullTemplate)
			isStandard = true
		case "TransmutedPlatinum":
			enchantmentData = parseTemplateTransmutedPlatinum(fullTemplate)
			isStandard = true
		case "Nightsinger":
			enchantmentData = parseTemplateNightsinger()
			isStandard = true
		case "CeruleanWave":
			enchantmentData = parseTemplateCeruleanWave(fullTemplate)
			isStandard = true
		case "TransformKineticEnergy":
			enchantmentData = parseTemplateTransformKineticEnergy(fullTemplate)
			isStandard = true
		case "EidolonSummons":
			enchantmentData = parseTemplateEidolonSummons(fullTemplate)
			isStandard = true
		case "RagingResilience":
			enchantmentData = parseTemplateRagingResilience()
			isStandard = true
		case "ChaoticCurse":
			enchantmentData = parseTemplateChaoticCurse()
			isStandard = true
		case "StickyGooGuard":
			enchantmentData = parseTemplateStickyGooGuard()
			isStandard = true
		case "PoisonGuard":
			enchantmentData = parseTemplatePoisonGuard(fullTemplate)
			isStandard = true
		case "Hallowed":
			enchantmentData = parseTemplateHallowed(fullTemplate)
			isStandard = true
		case "MakersTouch":
			enchantmentData = parseTemplateMakersTouch()
			isStandard = true
		case "AutoRepair":
			enchantmentData = parseTemplateAutoRepair(fullTemplate)
			isStandard = true
		case "FeedsOffMadness":
			enchantmentData = parseTemplateFeedsOffMadness()
			isStandard = true
		case "SunAndStars":
			enchantmentData = parseTemplateSunAndStars()
			isStandard = true
		case "LightningStormGuard":
			enchantmentData = parseTemplateLightningStormGuard(fullTemplate)
			isStandard = true
		case "DemonicCurse":
			enchantmentData = parseTemplateDemonicCurse(fullTemplate)
			isStandard = true
		case "DemonicRetribution":
			enchantmentData = parseTemplateDemonicRetribution(fullTemplate)
			isStandard = true
		case "SlaveLordsBlank":
			multiEnchantments = parseTemplateSlaveLordsBlank(fullTemplate)
			isStandard = true
		case "Tet-zik":
			enchantmentData = parseTemplateTetZik(fullTemplate)
			isStandard = true
		case "TemporarySpellPoints":
			enchantmentData = parseTemplateTemporarySpellPoints(fullTemplate)
			isStandard = true
		case "DruidicSurvivalMastery":
			enchantmentData = parseTemplateDruidicSurvivalMastery(fullTemplate)
			isStandard = true
		case "PowerStore":
			enchantmentData = parseTemplatePowerStore(fullTemplate)
			isStandard = true
		case "ScallawagLuck":
			enchantmentData = parseTemplateScallawagLuck(fullTemplate)
			isStandard = true
		case "CCHatUpgrades":
			multiEnchantments = parseTemplateCCHatUpgrades(fullTemplate)
			isStandard = true
		case "FaeryfireCurse":
			multiEnchantments = parseTemplateFaeryfireCurse(fullTemplate)
			isStandard = true
		case "Dragonmark":
			multiEnchantments = parseTemplateDragonmark(fullTemplate, itemType)
			isStandard = true
		case "BrazenBrilliance":
			enchantmentData = parseTemplateBrazenBrilliance(fullTemplate)
			isStandard = true
		case "VoiceofDeceit":
			multiEnchantments = parseTemplateVoiceofDeceit(fullTemplate)
			isStandard = true
		case "MindDrain":
			enchantmentData = parseTemplateMindDrain(fullTemplate)
			isStandard = true
		case "EnergySiphon":
			enchantmentData = parseTemplateEnergySiphon(fullTemplate)
			isStandard = true
		case "CraftableRuneArm":
			enchantmentData = parseTemplateCraftableRuneArm(fullTemplate)
			isStandard = true
		case "Stability":
			enchantmentData = parseTemplateStability(fullTemplate)
			isStandard = true
		case "Price":
			// ignore this template when it appears in the enchantment list. it is already covered elsewhere
			isStandard = true
		case "CategoryList":
			// ignore this template when it appears in the enchantment list. it is already covered elsewhere
			isStandard = true
		case "EmptyAugments":
			// EmptyAugments does not add enchantments; it's handled in the converter to add augment slots.
			isStandard = true
		case "CannithCraftingSlots":
			// CannithCraftingSlots does not add enchantments; it's handled in the converter to add augment slots.
			isStandard = true
		case "WhirlwindAbsorption":
			enchantmentData = parseTemplateWhirlwindAbsorption(fullTemplate)
			isStandard = true
		case "WingedAllure":
			enchantmentData = parseTemplateWingedAllure(fullTemplate)
			isStandard = true
		case "IceShardsGuard":
			enchantmentData = parseTemplateIceShardsGuard(fullTemplate)
			isStandard = true
		case "DeificFocus":
			enchantmentData = parseTemplateDeificFocus(fullTemplate)
			isStandard = true
		case "Hammerblock":
			enchantmentData = parseTemplateHammerblock(fullTemplate)
			isStandard = true
		case "FinishingTouch":
			enchantmentData = parseTemplateFinishingTouch(fullTemplate)
			isStandard = true
		case "CompletedWeapon":
			enchantmentData = parseTemplateCompletedWeapon(fullTemplate)
			isStandard = true
		case "ThornyCrownofMadness":
			enchantmentData = parseTemplateThornyCrownofMadness(fullTemplate)
			isStandard = true
		case "DragonshardFocus":
			enchantmentData = parseTemplateDragonshardFocus(fullTemplate)
			isStandard = true
		case "ThornOfTheRose":
			enchantmentData = parseTemplateThornOfTheRose(fullTemplate)
			isStandard = true
		case "TrapTheSoul":
			enchantmentData = parseTemplateTrapTheSoul(fullTemplate)
			isStandard = true
		case "Poison":
			enchantmentData = parseTemplatePoison(fullTemplate)
			isStandard = true
		case "WondrousCraftsmanship":
			enchantmentData = parseTemplateWondrousCraftsmanship(fullTemplate)
			isStandard = true
		case "Reaping":
			enchantmentData = parseTemplateReaping(fullTemplate)
			isStandard = true
		case "GreaterDispellingGuard":
			enchantmentData = parseTemplateGreaterDispellingGuard()
			isStandard = true
		case "HalcyonMind":
			enchantmentData = parseTemplateHalcyonMind()
			isStandard = true
		case "Anchoring":
			enchantmentData = parseTemplateAnchoring()
			isStandard = true
		case "SinkLikeaBrick":
			enchantmentData = parseTemplateSinkLikeaBrick()
			isStandard = true
		case "BloodyThorns":
			enchantmentData = parseTemplateBloodyThorns()
			isStandard = true
		case "StonePrisonGuard":
			enchantmentData = parseTemplateStonePrisonGuard(fullTemplate)
			isStandard = true
		case "SpikeGuard":
			enchantmentData = parseTemplateSpikeGuard()
			isStandard = true
		case "ChaosGuard":
			multiEnchantments = parseTemplateChaosGuard()
			isStandard = true
		case "AdditionalDamageType":
			enchantmentData = parseTemplateAdditionalDamageType(fullTemplate)
			isStandard = true
		case "SwimLikeAFish":
			enchantmentData = parseTemplateSwimLikeAFish()
			isStandard = true
		case "ConfoundingEnchantment":
			enchantmentData = parseTemplateConfoundingEnchantment()
			isStandard = true
		case "ElementalEnergy":
			enchantmentData = parseTemplateElementalEnergy(fullTemplate)
			isStandard = true
		case "ElementalAttuned":
			enchantmentData = parseTemplateElementalAttuned(fullTemplate)
			isStandard = true
		case "LightningGuard":
			enchantmentData = parseTemplateLightningGuard(fullTemplate)
			isStandard = true
		case "BlackscaleFerocity":
			enchantmentData = parseTemplateBlackscaleFerocity()
			isStandard = true
		case "ExtraLayOnHands":
			enchantmentData = parseTemplateExtraLayOnHands(fullTemplate)
			isStandard = true
		case "Lifesealed":
			multiEnchantments = parseTemplateLifesealed(fullTemplate)
			isStandard = true
		case "CannithCombatInfusion":
			enchantmentData = parseTemplateCannithCombatInfusion()
			isStandard = true
		case "VengefulFury":
			multiEnchantments = parseTemplateVengefulFury()
			isStandard = true
		case "NearlyFinished":
			enchantmentData = parseTemplateNearlyFinished()
			isStandard = true
		case "Fearsome":
			enchantmentData = parseTemplateFearsome()
			isStandard = true
		case "Diehard":
			enchantmentData = parseTemplateDiehard()
			isStandard = true
		case "SymbioticFlexibility":
			enchantmentData = parseTemplateSymbioticFlexibility()
			isStandard = true
		case "SymbioticBacklash":
			enchantmentData = parseTemplateSymbioticBacklash()
			isStandard = true
		case "Spearblock":
			enchantmentData = parseTemplateSpearblock(fullTemplate)
			isStandard = true
		case "WeakenUndead":
			enchantmentData = parseTemplateWeakenUndead(fullTemplate)
			isStandard = true
		case "KickEmWhileTheyreDown":
			enchantmentData = parseTemplateKickEmWhileTheyreDown(fullTemplate)
			isStandard = true
		case "RagingInferno":
			enchantmentData = parseTemplateRagingInferno(fullTemplate)
			isStandard = true
		case "MetalFatigue":
			enchantmentData = parseTemplateMetalFatigue(fullTemplate)
			isStandard = true
		case "TelekinesisGuard":
			enchantmentData = parseTemplateTelekinesisGuard(fullTemplate)
		case "TheReaver":
			enchantmentData = parseTemplateTheReaver(fullTemplate)
			isStandard = true
		case "Telekinetic":
			enchantmentData = parseTemplateTelekinetic(fullTemplate)
			isStandard = true
		case "SlicingWinds":
			enchantmentData = parseTemplateSlicingWinds(fullTemplate)
			isStandard = true
		case "Shadowblade":
			enchantmentData = parseTemplateShadowblade(fullTemplate)
			isStandard = true
		case "StaggeringBlow":
			enchantmentData = parseTemplateStaggeringBlow(fullTemplate)
			isStandard = true
		case "AngelicGrace":
			enchantmentData = parseTemplateAngelicGrace(fullTemplate)
			isStandard = true
		case "FreezingIceGuard":
			enchantmentData = parseTemplateFreezingIceGuard(fullTemplate)
			isStandard = true
		case "Nimbleness":
			enchantmentData = parseTemplateNimbleness(fullTemplate)
			isStandard = true
		case "AntimagicSpike":
			enchantmentData = parseTemplateAntimagicSpike(fullTemplate)
			isStandard = true
		case "Overfocus":
			multiEnchantments = parseTemplateOverfocus(fullTemplate)
			isStandard = true
		case "Blood":
			enchantmentData = parseTemplateBlood()
			isStandard = true
		case "Banishing":
			enchantmentData = parseTemplateBanishing(fullTemplate)
			isStandard = true
		case "BrillianceGuard":
			enchantmentData = parseTemplateBrillianceGuard(fullTemplate)
			isStandard = true
		case "RadianceGuard":
			enchantmentData = parseTemplateRadianceGuard(fullTemplate)
			isStandard = true
		case "DiseaseGuard":
			enchantmentData = parseTemplateDiseaseGuard(fullTemplate)
			isStandard = true
		case "TheGoldenCurse":
			enchantmentData = parseTemplateTheGoldenCurse(fullTemplate)
			isStandard = true
		case "AirGuard":
			enchantmentData = parseTemplateAirGuard(fullTemplate)
			isStandard = true
		case "EarthgrabGuard":
			enchantmentData = parseTemplateEarthgrabGuard(fullTemplate)
			isStandard = true
		case "LifeShield":
			enchantmentData = parseTemplateLifeShield(fullTemplate)
			isStandard = true
		case "Dice":
			dice := ParseTemplateDice(fullTemplate)
			if dice.Raw != "" {
				enchantmentData = &api.Enchantment{
					Name:   "Damage",
					Amount: dice.Raw,
				}
			}
			isStandard = false
		case "Command":
			multiEnchantments = parseTemplateCommand(fullTemplate)
			isStandard = false
		case "Save":
			enchantmentData = parseTemplateSave(fullTemplate)
			isStandard = true
		case "JetPropulsion":
			enchantmentData = parseTemplateJetPropulsion(fullTemplate)
			isStandard = true
		case "RuneArmBlast":
			enchantmentData = parseTemplateRuneArmBlast(fullTemplate)
			isStandard = false
		case "ElementalAbsorb":
			enchantmentData = parseTemplateElementalAbsorb(fullTemplate)
			isStandard = true
		case "Skill":
			enchantmentData = parseTemplateSkill(fullTemplate)
			isStandard = true
		case "ElementalResistance":
			enchantmentData = parseTemplateElementalResistance(fullTemplate)
			isStandard = true
		case "Ability":
			enchantmentData = parseTemplateAbility(fullTemplate)
			isStandard = true
		case "HealingAmp":
			enchantmentData = parseTemplateHealingAmp(fullTemplate)
			isStandard = true
		case "EnhancementBonus":
			multiEnchantments = parseTemplateEnhancementBonus(fullTemplate, itemType)
			isStandard = true
		case "ItemMaterialDR":
			enchantmentData = parseTemplateItemMaterialDR(fullTemplate)
			isStandard = true
		case "Aligned":
			enchantmentData = parseTemplateAligned(fullTemplate)
			isStandard = true
		case "PreslottedAugment":
			// PreslottedAugment is handled in ConvertItemToJSON to affect data.Augments directly.
			// We skip it here to avoid duplication in `Enchantments` slice,
			// though we could return a placeholder if we wanted it to show up there too.
			isStandard = false
		case "ScarabofProtectionWard":
			multiEnchantments = parseTemplateScarabofProtectionWard()
			isStandard = true
		case "RechargeBar":
			// Template:RechargeBar is explicitly ignored.
			isStandard = false
		case "HealLikeaGolem":
			enchantmentData = parseTemplateHealLikeaGolem(fullTemplate)
			isStandard = true
		case "Steam":
			enchantmentData = parseTemplateSteam(fullTemplate)
			isStandard = true
		case "Salt":
			enchantmentData = parseTemplateSalt(fullTemplate)
			isStandard = true
		case "Ice":
			enchantmentData = parseTemplateIce(fullTemplate)
			isStandard = true
		case "SneakAttackDamage":
			enchantmentData = parseTemplateSneakAttackDamage(fullTemplate)
			isStandard = true
		case "Deception":
			multiEnchantments = parseTemplateDeception(fullTemplate)
		case "Bodyfeeder":
			enchantmentData = parseTemplateBodyfeeder(fullTemplate)
			isStandard = true
		case "TouchoftheMournlands":
			enchantmentData = parseTemplateTouchoftheMournlands(fullTemplate)
			isStandard = true
		case "Sheltering":
			multiEnchantments = parseTemplateSheltering(fullTemplate)
			isStandard = true
		case "ProofAgainstPoison":
			enchantmentData = parseTemplateProofAgainstPoison(fullTemplate)
			isStandard = true
		case "SpellFocus":
			multiEnchantments = parseTemplateSpellFocus(fullTemplate)
			isStandard = true
		case "Guardbreaking":
			enchantmentData = parseTemplateGuardbreaking(fullTemplate)
			isStandard = true
		case "SpellPower":
			multiEnchantments = parseTemplateSpellPower(fullTemplate)
			isStandard = true
		case "AC":
			enchantmentData = parseTemplateAC(fullTemplate)
			isStandard = true
		case "SpellPoints":
			enchantmentData = parseTemplateSpellPoints(fullTemplate)
			isStandard = true
		case "Vacuum":
			enchantmentData = parseTemplateVacuum(fullTemplate)
			isStandard = true
		case "Keen":
			enchantmentData = parseTemplateKeen(fullTemplate)
			isStandard = true
		case "Fortification":
			enchantmentData = parseTemplateFortification(fullTemplate)
			isStandard = true
		case "Metalline":
			multiEnchantments = parseTemplateMetalline(fullTemplate)
			isStandard = true
		case "ActionBoostEnhancement":
			enchantmentData = parseTemplateActionBoostEnhancement(fullTemplate)
			isStandard = true
		case "ArmorPiercing":
			enchantmentData = parseTemplateArmorPiercing(fullTemplate)
			isStandard = true
		case "DodgeBypass":
			enchantmentData = parseTemplateDodgeBypass(fullTemplate)
			isStandard = true
		case "GoodLuck":
			fallthrough
		case "Goodluck":
			multiEnchantments = parseTemplateGoodluck(fullTemplate)
			isStandard = true
		case "InspireGreatnessExtra":
			enchantmentData = parseTemplateInspireGreatnessExtra(fullTemplate)
			isStandard = true
		case "FavoredWeapon":
			// Template:FavoredWeapon — simple named effect with explanatory note.
			enchantmentData = parseTemplateFavoredWeapon()
			isStandard = true
		case "Faith":
			// Template:Faith — emits three Insight bonuses related to Turn Undead mechanics
			multiEnchantments = parseTemplateFaith()
			isStandard = true
		case "Sacred":
			// Template:Sacred — optional amount (defaults to 2), Sacred bonus to turning effective level.
			enchantmentData = parseTemplateSacred(fullTemplate)
			isStandard = true
		case "Fleshmaker":
			enchantmentData = parseTemplateFleshmaker(fullTemplate)
			isStandard = true
		case "Sonic":
			enchantmentData = parseTemplateSonic(fullTemplate)
			isStandard = true
		case "AlignmentBypass":
			multiEnchantments = parseTemplateAlignmentBypass(fullTemplate)
			isStandard = true
		case "SpellLore":
			multiEnchantments = parseTemplateSpellLore(fullTemplate)
			isStandard = true
		case "SpellAugmentation":
			enchantmentData = parseTemplateSpellAugmentation(fullTemplate)
			isStandard = true
		case "Doubleshot":
			enchantmentData = parseTemplateDoubleshot(fullTemplate)
			isStandard = true
		case "FalseLife":
			enchantmentData = parseTemplateFalseLife(fullTemplate)
			isStandard = true
		case "EnhancedKi":
			enchantmentData = parseTemplateEnhancedKi(fullTemplate)
			isStandard = true
		case "PactDice":
			enchantmentData = parseTemplatePactDice(fullTemplate)
			isStandard = true
		case "Accuracy":
			enchantmentData = parseTemplateAccuracy(fullTemplate)
			isStandard = true
		case "UnconsciousRange":
			enchantmentData = parseTemplateUnconsciousRange(fullTemplate)
			isStandard = true
		case "Seeker":
			multiEnchantments = parseTemplateSeeker(fullTemplate)
			isStandard = true
		case "SkillGroupBonus":
			multiEnchantments = parseTemplateSkillGroupBonus(fullTemplate)
			isStandard = true
		case "OrbBonus":
			multiEnchantments = parseTemplateOrbBonus(fullTemplate)
			isStandard = true
		case "Vampirism":
			enchantmentData = parseTemplateVampirism(fullTemplate)
			isStandard = true
		case "OffensiveDamage":
			enchantmentData = parseTemplateOffensiveDamage(fullTemplate)
			isStandard = true
		case "Anthem":
			enchantmentData = parseTemplateAnthem(fullTemplate)
			isStandard = true
		case "HealersBounty":
			enchantmentData = parseTemplateHealersBounty(fullTemplate)
			isStandard = true
		case "Dust":
			enchantmentData = parseTemplateDust(fullTemplate)
			isStandard = true
		case "Ash":
			enchantmentData = parseTemplateAsh(fullTemplate)
			isStandard = true
		case "Disintegration":
			enchantmentData = parseTemplateDisintegration(fullTemplate)
			isStandard = true
		case "DisintegrationGuard":
			enchantmentData = parseTemplateDisintegrationGuard(fullTemplate)
			isStandard = true
		case "InvisibilityGuard":
			enchantmentData = parseTemplateInvisibilityGuard(fullTemplate)
			isStandard = true
		case "Trembling":
			enchantmentData = parseTemplateTrembling(fullTemplate)
			isStandard = true
		case "IncinerationGuard":
			enchantmentData = parseTemplateIncinerationGuard(fullTemplate)
			isStandard = true
		case "AcidCorrosion":
			enchantmentData = parseTemplateAcidCorrosion(fullTemplate)
			isStandard = true
		case "HolySmite":
			enchantmentData = parseTemplateHolySmite(fullTemplate)
			isStandard = true
		case "TempestStorm":
			enchantmentData = parseTemplateTempestStorm(fullTemplate)
			isStandard = true
		case "AlchemicalConservation":
			multiEnchantments = parseTemplateAlchemicalConservation(fullTemplate)
			isStandard = true
		case "AlchemicalElementalAttuned":
			enchantmentData = parseTemplateAlchemicalElementalAttuned(fullTemplate)
			isStandard = true
		case "ArcaneCastingDexterity":
			enchantmentData = parseTemplateArcaneCastingDexterity(fullTemplate)
			isStandard = true
		case "Flamescale":
			multiEnchantments = parseTemplateFlamescale(fullTemplate)
			isStandard = true
		case "OffensiveEffect":
			enchantmentData = parseTemplateOffensiveEffect(fullTemplate)
			isStandard = false
		case "SpellSchoolSave":
			multiEnchantments = parseTemplateSpellSchoolSave(fullTemplate)
			isStandard = true
		case "RuneArmImbue":
			enchantmentData = parseTemplateRuneArmImbue(fullTemplate)
			isStandard = false
		case "TrueSeeing":
			fallthrough
		case "Trueseeing":
			enchantmentData = parseTemplateTrueSeeing()
			isStandard = true
		case "LitanyAbilityBonus":
			multiEnchantments = parseTemplateLitanyAbilityBonus(fullTemplate)
			isStandard = true
		case "LitanyCombatBonus":
			multiEnchantments = parseTemplateLitanyCombatBonus(fullTemplate)
			isStandard = true
		case "CacophonicGuard":
			enchantmentData = parseTemplateCacophonicGuard(fullTemplate)
			isStandard = false
		case "UndeadGuard":
			enchantmentData = parseTemplateUndeadGuard(fullTemplate)
			isStandard = false
		case "CombatMastery":
			multiEnchantments = parseTemplateCombatMastery(fullTemplate)
			isStandard = true
		case "Speed":
			multiEnchantments = parseTemplateSpeed(fullTemplate)
			isStandard = true
		case "BloodRage":
			enchantmentData = parseTemplateBloodRage(fullTemplate)
			isStandard = true
		case "Anger":
			enchantmentData = parseTemplateAnger(fullTemplate)
			isStandard = true
		case "SpellPenetration":
			enchantmentData = parseTemplateSpellPenetration(fullTemplate)
			isStandard = true
		case "Dodge":
			enchantmentData = parseTemplateDodge(fullTemplate)
			isStandard = true
		case "Deadly":
			enchantmentData = parseTemplateDeadly(fullTemplate)
			isStandard = true
		case "TemperanceOfBelief":
			enchantmentData = parseTemplateTemperanceOfBelief()
			isStandard = true
		case "Returning":
			enchantmentData = parseTemplateReturning(fullTemplate)
			isStandard = true
		case "Ghostly":
			multiEnchantments = parseTemplateGhostly(fullTemplate)
			isStandard = true
		case "Murderous":
			enchantmentData = parseTemplateMurderous(fullTemplate)
			isStandard = true
		case "RevelInBlood":
			enchantmentData = parseTemplateRevelInBlood(fullTemplate)
			isStandard = true
		case "BottledHeart":
			multiEnchantments = parseTemplateBottledHeart()
			isStandard = true
		case "Parrying":
			multiEnchantments = parseTemplateParrying(fullTemplate)
			isStandard = true
		case "Deathblock":
			multiEnchantments = parseTemplateDeathblock(fullTemplate)
			isStandard = true
		case "FeatherFalling":
			enchantmentData = parseTemplateFeatherFalling(fullTemplate)
			isStandard = true
		case "Proficiency":
			enchantmentData = parseTemplateProficiency(fullTemplate)
			isStandard = true
		// Deception handled above via multiEnchantments branch
		case "Doublestrike":
			enchantmentData = parseTemplateDoublestrike(fullTemplate)
			isStandard = true
		case "RuneArmRechargeRate":
			enchantmentData = parseTemplateRuneArmRechargeRate(fullTemplate)
			isStandard = true
		case "ItemFeat":
			enchantmentData = parseTemplateItemFeat(fullTemplate)
			isStandard = true
		case "ItemSet":
			enchantmentData = parseTemplateItemSet(fullTemplate)
			isStandard = true
		case "WildEmpathy":
			enchantmentData = parseTemplateWildEmpathy(fullTemplate)
			isStandard = true
		case "ReinforcedFists":
			enchantmentData = parseTemplateReinforcedFists(fullTemplate)
			isStandard = true
		case "Soundproof":
			enchantmentData = parseTemplateSoundproof()
			isStandard = true
		case "EfficientMetamagic":
			enchantmentData = parseTemplateEfficientMetamagic(fullTemplate)
			isStandard = true
		case "Eversight":
			multiEnchantments = parseTemplateEversight(fullTemplate)
			isStandard = true
		case "Immune":
			enchantmentData = parseTemplateImmune(fullTemplate)
			isStandard = true
		case "EldritchBlastDice":
			enchantmentData = parseTemplateEldritchBlastDice(fullTemplate)
			isStandard = true
		case "AbilitySkills":
			multiEnchantments = parseTemplateAbilitySkills(fullTemplate)
			isStandard = true
		case "Vitality":
			enchantmentData = parseTemplateVitality(fullTemplate)
			isStandard = true
		case "PermanentEffect":
			fallthrough
		case "PermanantEffect":
			enchantmentData = parseTemplatePermanantEffect(fullTemplate)
			isStandard = true
		case "MagicalEfficiency":
			enchantmentData = parseTemplateMagicalEfficiency(fullTemplate)
			isStandard = true
		case "Diversion":
			multiEnchantments = parseTemplateDiversion(fullTemplate)
			isStandard = true
		case "TendonSlice":
			enchantmentData = parseTemplateTendonSlice(fullTemplate)
			isStandard = true
		case "Incite":
			multiEnchantments = parseTemplateIncite(fullTemplate, itemType)
			isStandard = true
		case "Clickie":
			enchantmentData = parseTemplateClickie(fullTemplate)
			isStandard = false
		case "Marksmanship":
			multiEnchantments = parseTemplateMarksmanship(fullTemplate)
			isStandard = true
		case "Assassination":
			enchantmentData = parseTemplateAssassination(fullTemplate)
			isStandard = true
		case "WeaponEffect":
			enchantmentData = parseTemplateWeaponEffect(fullTemplate)
			isStandard = false
		case "Shockwave":
			enchantmentData = parseTemplateShockwave(fullTemplate)
			isStandard = true
		case "DamageEffect":
			enchantmentData = parseTemplateDamageEffect(fullTemplate)
			isStandard = false
		case "Concealment":
			enchantmentData = parseTemplateConcealment(fullTemplate)
			isStandard = true
		case "ProofAgainstDisease":
			multiEnchantments = parseTemplateProofAgainstDisease(fullTemplate)
			isStandard = true
		case "MemoryOfButchery":
			enchantmentData = parseTemplateMemoryOfButchery()
			isStandard = true
		case "MemoryOfAnimatedObjects":
			multiEnchantments = parseTemplateMemoryOfAnimatedObjects()
			isStandard = true
		case "MemoryOfBinding":
			enchantmentData = parseTemplateMemoryOfBinding()
			isStandard = true
		case "MemoryOfShatteredLife":
			enchantmentData = parseTemplateMemoryOfShatteredLife()
			isStandard = true
		case "Resistance":
			multiEnchantments = parseTemplateResistance(fullTemplate)
			isStandard = true
		case "Maiming":
			enchantmentData = parseTemplateMaiming(fullTemplate)
			isStandard = false
		case "DruidicStoneshape":
			enchantmentData = parseTemplateDruidicStoneshape()
			isStandard = true
		case "Crippling":
			enchantmentData = parseTemplateCrippling(fullTemplate)
			isStandard = true
		case "Strikethrough":
			enchantmentData = parseTemplateStrikethrough(fullTemplate)
			isStandard = true
		case "ImbueDice":
			enchantmentData = parseTemplateImbueDice(fullTemplate)
			isStandard = true
		case "Destruction":
			enchantmentData = parseTemplateDestruction(fullTemplate)
			isStandard = true
		case "SpellResistance":
			enchantmentData = parseTemplateSpellResistance(fullTemplate)
			isStandard = true
		case "ThornGuard":
			enchantmentData = parseTemplateThornGuard(fullTemplate)
			isStandard = true
		case "CarryingCapacity":
			enchantmentData = parseTemplateCarryingCapacity(fullTemplate)
			isStandard = true
		case "ElementalDOT":
			enchantmentData = parseTemplateElementalDOT(fullTemplate)
			isStandard = false
		case "ElementalAOE":
			enchantmentData = parseTemplateElementalAOE(fullTemplate)
			isStandard = false
		case "SealedInMist":
			enchantmentData = parseTemplateSealedInMist()
			isStandard = true
		case "SealedInFire":
			// Template:SealedInFire — simple named marker enchantment; no parameters.
			enchantmentData = parseTemplateSealedInFire()
			isStandard = true
		case "AnthemMelody":
			enchantmentData = parseTemplateAnthemMelody(fullTemplate)
			isStandard = true
		case "Meltscale":
			enchantmentData = parseTemplateMeltscale(fullTemplate)
			isStandard = true
		case "SealedInGloom":
			enchantmentData = parseTemplateSealedInGloom()
			isStandard = true
		case "Elemental":
			enchantmentData = parseTemplateElemental(fullTemplate)
			isStandard = false
		case "AlignmentDamage":
			// Template:AlignmentDamage — alignment-based damage dice with optional negative level on wield.
			enchantmentData = parseTemplateAlignmentDamage(fullTemplate)
			isStandard = true
		case "BluntTrama":
			enchantmentData = parseTemplateBluntTrama()
			isStandard = true
		case "FreezingIce":
			enchantmentData = parseTemplateFreezingIce(fullTemplate)
			isStandard = true
		case "SpellCritDamage":
			multiEnchantments = parseTemplateSpellCritDamage(fullTemplate)
			isStandard = true
		case "Alacrity":
			enchantmentData = parseTemplateAlacrity(fullTemplate)
			isStandard = true
		case "Stunning":
			multiEnchantments = parseTemplateStunning(fullTemplate)
			isStandard = true
		case "IntercessionWard":
			// Template:IntercessionWard — simple defensive utility; name + notes.
			enchantmentData = parseTemplateIntercessionWard()
			isStandard = true
		case "LimbChopper":
			// Template:LimbChopper — sever limb on confirmed 20 (vorpal-like trigger)
			enchantmentData = parseTemplateLimbChopper()
			isStandard = true
		case "Paralyzing":
			// Template:Paralyzing — Regular/Improved/Legendary versions; on-hit Will save to paralyze.
			enchantmentData = parseTemplateParalyzing(fullTemplate)
			isStandard = true
		case "Shatter":
			enchantmentData = parseTemplateShatter(fullTemplate)
			isStandard = true
		case "ArmorMastery":
			enchantmentData = parseTemplateArmorMastery(fullTemplate)
			isStandard = true
		case "Bane":
			enchantmentData = parseTemplateBane(fullTemplate)
			isStandard = true
		case "Vertigo":
			multiEnchantments = parseTemplateVertigo(fullTemplate)
			isStandard = true
		case "RelentlessFury":
			enchantmentData = parseTemplateRelentlessFury()
			isStandard = true
		case "WeaponPower":
			multiEnchantments = parseTemplateWeaponPower(fullTemplate)
			isStandard = true
		case "Sparkscale":
			// Template:Sparkscale — simple marker template that denotes the
			// Sparkscale enchantment on the item. No parameters; emit name only.
			enchantmentData = parseTemplateSparkscale()
			isStandard = true
		case "Vorpal":
			// Template:Vorpal — may include an optional effect name and dice.
			// Emits a single standard enchantment with BonusType 'On-vorpal'.
			enchantmentData = parseTemplateVorpal(fullTemplate)
			isStandard = true
		case "3rdDegreeBurns":
			// Template:3rdDegreeBurns — vorpal-triggered Fire DoT and Vulnerability stacks
			enchantmentData = parseTemplate3rdDegreeBurns()
			isStandard = true
		case "FellingTheOak":
			// Template:FellingTheOak — simple named effect with no parameters.
			enchantmentData = parseTemplateFellingTheOak()
			isStandard = true
		case "Venomscale":
			// Template:Venomscale — adds Cold Iron bypass and 15d6 Acid on-hit damage.
			multiEnchantments = parseTemplateVenomscale()
			isStandard = true
		case "ShadowStriker":
			// Template:ShadowStriker — returns multiple standard effects
			multiEnchantments = parseTemplateShadowStriker()
			isStandard = true
		case "TemperanceOfSpirit":
			// Template:TemperanceOfSpirit — +1 Quality PRR per Religious Lore Feat
			enchantmentData = parseTemplateTemperanceOfSpirit()
			isStandard = true
		case "Ooze":
			enchantmentData = parseTemplateOoze(fullTemplate)
			isStandard = true
		case "Regeneration":
			enchantmentData = parseTemplateRegeneration(fullTemplate)
			isStandard = true
		case "DemonicMight":
			enchantmentData = parseTemplateDemonicMight()
			isStandard = true
		case "StormreaverThunderclap":
			enchantmentData = parseTemplateStormreaverThunderclap()
			isStandard = true
		case "RepairSystems":
			enchantmentData = parseTemplateRepairSystems()
			isStandard = true
		case "SpellPowerGuard":
			enchantmentData = parseTemplateSpellPowerGuard()
			isStandard = true
		case "HitPointGuard":
			enchantmentData = parseTemplateHitPointGuard()
			isStandard = true
		case "CrushingWaveGuard":
			enchantmentData = parseTemplateCrushingWaveGuard(fullTemplate)
			isStandard = true
		case "ScorchingFlame":
			enchantmentData = parseTemplateScorchingFlame(fullTemplate)
			isStandard = true
		case "NullmagicGuard":
			enchantmentData = parseTemplateNullmagicGuard(fullTemplate)
			isStandard = true
		case "RunicRevitalization":
			enchantmentData = parseTemplateRunicRevitalization(fullTemplate)
			isStandard = true
		case "GlacialFrost":
			enchantmentData = parseTemplateGlacialFrost(fullTemplate)
			isStandard = true
		case "DemonicShield":
			enchantmentData = parseTemplateDemonicShield(fullTemplate)
			isStandard = true
		case "UnderwaterAction":
			multiEnchantments = parseTemplateUnderwaterAction(fullTemplate)
			isStandard = true
		case "Ethereal":
			enchantmentData = parseTemplateEthereal(fullTemplate)
			isStandard = true
		case "Shattermantle":
			enchantmentData = parseTemplateShattermantle(fullTemplate)
			isStandard = true
		case "Heroism":
			multiEnchantments = parseTemplateHeroism(fullTemplate)
			isStandard = true
		case "Riposte":
			multiEnchantments = parseTemplateRiposte(fullTemplate)
			isStandard = true
		case "Striding":
			enchantmentData = parseTemplateStriding(fullTemplate)
			isStandard = true
		case "AlignmentAbsorb":
			enchantmentData = parseTemplateAlignmentAbsorb(fullTemplate)
			isStandard = true
		case "Linguistics":
			multiEnchantments = parseTemplateLinguistics(fullTemplate)
			isStandard = true
		case "ProtectionFromEvil":
			multiEnchantments = parseTemplateProtectionFromEvil(fullTemplate)
			isStandard = true
		case "QuellingStrikes":
			enchantmentData = parseTemplateQuellingStrikes(fullTemplate)
			isStandard = true
		case "SneakAttackDice":
			enchantmentData = parseTemplateSneakAttackDice(fullTemplate)
			isStandard = true
		case "ExtraSmites":
			multiEnchantments = parseTemplateExtraSmites(fullTemplate)
			isStandard = true
		case "Turning":
			enchantmentData = parseTemplateTurning(fullTemplate)
			isStandard = true
		case "WeakenConstruct":
			enchantmentData = parseTemplateWeakenConstruct(fullTemplate)
			isStandard = true
		case "AttunedToHeroism":
			enchantmentData = parseTemplateAttunedToHeroism(fullTemplate)
			isStandard = true
		case "SealedInUndeath":
			enchantmentData = parseTemplateSealedInUndeath()
			isStandard = true
		case "ShockingBlow":
			enchantmentData = parseTemplateShockingBlow(fullTemplate)
			isStandard = true
		case "HeroicInspiration":
			enchantmentData = parseTemplateHeroicInspiration(fullTemplate)
			isStandard = true
		case "SpellTurmoil":
			enchantmentData = parseTemplateSpellTurmoil(fullTemplate)
			isStandard = true
		case "GuidanceofShar":
			enchantmentData = parseTemplateGuidanceofShar(fullTemplate)
			isStandard = true
		case "ForceBlast":
			enchantmentData = parseTemplateForceBlast(fullTemplate)
			isStandard = true
		case "BoonofUndeath":
			enchantmentData = parseTemplateBoonofUndeath(fullTemplate)
			isStandard = true
		case "CrystalCoveUpgrade":
			enchantmentData = parseTemplateCrystalCoveUpgrade(fullTemplate)
			isStandard = true
		case "SpellAbsorption":
			enchantmentData = parseTemplateSpellAbsorption(fullTemplate)
			isStandard = false
		case "GhostTouch":
			enchantmentData = parseTemplateGhostTouch(fullTemplate)
			isStandard = true
		case "Suppressed":
			enchantmentData = parseTemplateSuppressed()
			isStandard = true
		case "Nightmares":
			enchantmentData = parseTemplateNightmares(fullTemplate)
			isStandard = false
		case "AgainstTheSlaveLordsSetBonus":
			enchantmentData = parseTemplateAgainstTheSlaveLordsSetBonus()
			isStandard = false
		case "VaultsofArtificersUpgradeable":
			enchantmentData = parseTemplateVaultsofArtificersUpgradeable(fullTemplate)
			isStandard = false
		case "DR":
			enchantmentData = parseTemplateDR(fullTemplate)
			isStandard = true
		case "Guard":
			enchantmentData = parseTemplateGuard(fullTemplate)
			isStandard = true
		case "ZhentarimAttuned":
			enchantmentData = parseTemplateZhentarimAttuned(fullTemplate)
			isStandard = true
		case "BlackAbbotItemUpgrade":
			enchantmentData = parseTemplateBlackAbbotItemUpgrade(fullTemplate)
			isStandard = true
		case "QuoriMindShield":
			multiEnchantments = parseTemplateQuoriMindShield(fullTemplate)
			isStandard = true
		case "EternalHolyBurst":
			enchantmentData = parseTemplateEternalHolyBurst(fullTemplate)
			isStandard = true
		case "StormreaverUpgrade":
			enchantmentData = parseTemplateStormreaverUpgrade(fullTemplate)
			isStandard = true
		case "SuppressMadness":
			enchantmentData = parseTemplateSuppressMadness(fullTemplate)
			isStandard = true
		case "EpicNecropolisItemUpgrade":
			multiEnchantments = parseTemplateEpicNecropolisItemUpgrade(fullTemplate)
			isStandard = true
		case "EternalFaith":
			multiEnchantments = parseTemplateEternalFaith(fullTemplate)
			isStandard = true
		case "EmbraceoftheSpiderQueen":
			enchantmentData = parseTemplateEmbraceoftheSpiderQueen(fullTemplate)
			isStandard = true
		case "Unnatural":
			enchantmentData = parseTemplateUnnatural(fullTemplate)
			isStandard = true
		case "SneakAttack":
			multiEnchantments = parseTemplateSneakAttack(fullTemplate)
			isStandard = true
		case "Quenched":
			enchantmentData = parseTemplateQuenched(fullTemplate)
			isStandard = true
		case "NightmareGuard":
			enchantmentData = parseTemplateNightmareGuard(fullTemplate)
			isStandard = true
		case "EarthenGuard":
			enchantmentData = parseTemplateEarthenGuard(fullTemplate)
			isStandard = true
		case "Raging":
			enchantmentData = parseTemplateRaging(fullTemplate)
			isStandard = true
		case "SlayLiving":
			enchantmentData = parseTemplateSlayLiving(fullTemplate)
			isStandard = true
		case "FireShield":
			enchantmentData = parseTemplateFireShield(fullTemplate)
			isStandard = true
		case "Dragontouched":
			enchantmentData = parseTemplateDragontouched(fullTemplate)
			isStandard = true
		case "LostPurpose":
			enchantmentData = parseTemplateLostPurpose(fullTemplate)
			isStandard = true
		case "HasteGuard":
			enchantmentData = parseTemplateHasteGuard(fullTemplate)
			isStandard = true
		case "FreedomOfMovement":
			enchantmentData = parseTemplateFreedomOfMovement(fullTemplate)
			isStandard = true
		case "SpellResonance":
			enchantmentData = parseTemplateSpellResonance(fullTemplate)
			isStandard = true
		case "MagmaSurgeGuard":
			enchantmentData = parseTemplateMagmaSurgeGuard(fullTemplate)
			isStandard = true
		case "MagicalNull":
			enchantmentData = parseTemplateMagicalNull(fullTemplate)
		case "Vengeful":
			enchantmentData = parseTemplateVengeful(fullTemplate)
			isStandard = true
		case "PowerDrain":
			enchantmentData = parseTemplatePowerDrain(fullTemplate)
			isStandard = true
		case "FlawedShadowscaleArmor":
			enchantmentData = parseTemplateFlawedShadowscaleArmor(fullTemplate)
			isStandard = true
		case "FromTheShadows":
			enchantmentData = parseTemplateFromTheShadows(fullTemplate)
			isStandard = true
		case "ArcaneAugmentation":
			enchantmentData = parseTemplateArcaneAugmentation(fullTemplate)
			isStandard = true
		case "DivineAugmentation":
			enchantmentData = parseTemplateDivineAugmentation(fullTemplate)
			isStandard = true
		case "Axeblock":
			enchantmentData = parseTemplateAxeblock(fullTemplate)
			isStandard = true
		case "Cursespewing":
			enchantmentData = parseTemplateCursespewing(fullTemplate)
			isStandard = true
		case "TraceOfMadness":
			enchantmentData = parseTemplateTraceOfMadness(fullTemplate)
			isStandard = true
		case "Dampened":
			enchantmentData = parseTemplateDampened(fullTemplate)
			isStandard = true
		case "GlassJawStrike":
			enchantmentData = parseTemplateGlassJawStrike()
			isStandard = true
		case "LightningStrike":
			enchantmentData = parseTemplateLightningStrike(fullTemplate)
			isStandard = true
		case "SpikeStudded":
			enchantmentData = parseTemplateSpikeStudded()
			isStandard = true
		case "MistsLantern":
		default:
			// FATAL ERROR for unknown templates
			//logrus.Fatalf("FATAL ERROR: Found unknown enchantment template: %s. Please update parsing logic. Raw string: %s", templateName, fullTemplate)
			logrus.Warnf("Found unknown enchantment template: %s. Please update parsing logic. Raw string: %s", templateName, fullTemplate)
		}

		// 4. Collection logic
		if isStandard || templateName == "Lifesealed" || templateName == "Command" || templateName == "QuoriMindShield" || templateName == "SneakAttack" || templateName == "EarthenGuard" || templateName == "NightmareGuard" || templateName == "ArcaneAugmentation" || templateName == "DivineAugmentation" || templateName == "DreamVision" {
			if enchantmentData != nil {
				parsedEnchantments = append(parsedEnchantments, *enchantmentData)
			}
			if len(multiEnchantments) > 0 {
				for _, ench := range multiEnchantments {
					parsedEnchantments = append(parsedEnchantments, *ench)
				}
			}
		} else if enchantmentData != nil {
			// Handle complex types individually
			finalEnchantments = append(finalEnchantments, *enchantmentData)
		}

		// Move the remaining string pointer past the found template
		remaining = remaining[endOfTemplate+1:]
	}

	// Final step: Group all collected standard enchantments together.
	if len(parsedEnchantments) > 0 {
		// Prepend the Standard group to the final list of enchantments
		finalEnchantments = append(parsedEnchantments, finalEnchantments...)
	}

	return finalEnchantments
}

// Template:Ooze
// Usage: {{Ooze|(Type)|(Title)}}
// - Type: Basic (blank), Legendary, LegendaryGS
// - Title: Optional custom title
func parseTemplateOoze(raw string) *api.Enchantment {
	const prefix = "{{Ooze"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	oozeType := ""
	title := ""

	if len(parts) > 0 {
		oozeType = strings.TrimSpace(parts[0])
		if strings.HasSuffix(oozeType, "GS") {
			oozeType = "Legendary"
		}
	}
	if len(parts) > 1 {
		title = strings.TrimSpace(parts[1])
	}

	name := "Ooze"
	if oozeType != "" && oozeType != "Basic" {
		name = oozeType + " Ooze"
	}
	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name: name,
	}
}

func parseTemplateCommand(raw string) []*api.Enchantment {
	// {{Command|(Amount)|(Bonus type)}}
	const prefix = "{{Command"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	amount := "2"
	if len(parts) >= 1 {
		val := strings.TrimSpace(parts[0])
		if val != "" {
			amount = val
		}
	}

	bonusType := "Competence"
	if len(parts) >= 2 {
		val := strings.TrimSpace(parts[1])
		if val != "" {
			bonusType = val
		}
	}

	skills := []string{
		"Bluff",
		"Diplomacy",
		"Haggle",
		"Intimidate",
		"Perform",
		"Use Magic Device",
	}

	var results []*api.Enchantment
	for _, skill := range skills {
		results = append(results, &api.Enchantment{
			Name:      "Skill: " + skill,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// Command also imposes a -6 penalty on Hide checks.
	results = append(results, &api.Enchantment{
		Name:      "Skill: Hide",
		Amount:    "-6",
		BonusType: "Penalty",
	})

	return results
}

func parseTemplateRegeneration(raw string) *api.Enchantment {
	// {{Regeneration|(Type)|(HP)|(time)|(title)}}
	const prefix = "{{Regeneration"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	regenType := ""
	if len(parts) >= 1 {
		regenType = strings.TrimSpace(parts[0])
	}

	hp := "1"
	if len(parts) >= 2 {
		val := strings.TrimSpace(parts[1])
		if val != "" {
			hp = val
		}
	}

	timeframe := "minute"
	if len(parts) >= 3 {
		val := strings.TrimSpace(parts[2])
		if val != "" {
			timeframe = val
		}
	} else {
		// Default time based on type if not explicitly provided
		if regenType == "Improved" || regenType == "Greater" {
			timeframe = "30 seconds"
		}
	}

	title := ""
	if len(parts) >= 4 {
		title = strings.TrimSpace(parts[3])
	}

	bonus := "per " + timeframe

	name := "Positive Healing"
	if title != "" {
		name = title
	} else if regenType != "" && regenType != "Basic" && regenType != "Custom" {
		name = regenType + " Regeneration"
	}

	return &api.Enchantment{
		Name:      name,
		BonusType: bonus,
		Amount:    hp,
	}
}

// Template:SpellPowerGuard
// Usage: {{SpellPowerGuard}}
// Returns a Psionic Bonus of 8 to Universal Spell Power.
func parseTemplateSpellPowerGuard() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Spell Power: Universal",
		BonusType: "Psionic",
		Amount:    "8",
	}
}

// Template:HitPointGuard
// Usage: {{HitPointGuard}}
// Returns 150 Temporary Hitpoints on being hit.
func parseTemplateHitPointGuard() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Temporary Hit Points",
		BonusType: "On being hit",
		Amount:    "150",
		Notes:     new("This can only proc once every 10 seconds. These Temporary Hitpoints last for 10 minutes or until used up, whichever is first."),
	}
}

// Template:DemonicShield
// Usage: {{DemonicShield|(Style)}}
// - Style: Regular (default), Improved, Legendary
func parseTemplateDemonicShield(raw string) *api.Enchantment {
	const prefix = "{{DemonicShield"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	style := "Regular"
	if len(parts) >= 1 {
		val := strings.TrimSpace(parts[0])
		if val != "" {
			style = val
		}
	}

	amount := "30"
	name := "Temporary Hit Points (on-hit chance)"

	switch style {
	case "Improved":
		amount = "120"
	case "Legendary":
		amount = "150"
	}

	return &api.Enchantment{
		Name:      name,
		BonusType: "Profane",
		Amount:    amount,
		Notes:     new("Each time you are hit in melee combat there is a 10% chance that a shield of demonic energy will grant you temporary hit points."),
	}
}

// Template:Shattermantle
// Usage: {{Shattermantle|(Type)}}
// - Type: None (default), Improved
func parseTemplateShattermantle(raw string) *api.Enchantment {
	const prefix = "{{Shattermantle"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	shatterType := ""
	if len(parts) >= 1 {
		shatterType = strings.TrimSpace(parts[0])
	}

	amount := "3"
	if strings.EqualFold(shatterType, "Improved") {
		amount = "6"
	}

	return &api.Enchantment{
		Name:   "Spell Resistance (Reduction)",
		Amount: amount,
		Notes:  new(fmt.Sprintf("Reduces opponent's spell resistance by %s for 9 seconds.", amount)),
	}
}

func parseTemplateHeroism(raw string) []*api.Enchantment {
	// {{Heroism|(Style)}}
	const prefix = "{{Heroism"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	style := "Normal"
	if len(parts) >= 1 {
		val := strings.TrimSpace(parts[0])
		if val != "" {
			style = val
		}
	}

	amount := "2"
	switch style {
	case "Lesser":
		amount = "1"
	case "Greater":
		amount = "4"
	case "Superior":
		amount = "5"
	default:
		amount = "2"
	}

	bonusType := "Morale"

	var results []*api.Enchantment

	// Attack
	results = append(results, &api.Enchantment{
		Name:      "Attack",
		Amount:    amount,
		BonusType: bonusType,
	})

	// Saving Throws
	saves := []string{"Fortitude Save", "Reflex Save", "Will Save"}
	for _, save := range saves {
		results = append(results, &api.Enchantment{
			Name:      save,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// Skill Checks
	allSkills := []string{
		"Appraise", "Balance", "Bluff", "Concentration", "Diplomacy", "Disable Device",
		"Haggle", "Heal", "Hide", "Intimidate", "Jump", "Listen",
		"Move Silently", "Open Lock", "Perform", "Repair", "Search",
		"Spellcraft", "Spot", "Swim", "Tumble", "Use Magic Device",
	}
	for _, skill := range allSkills {
		results = append(results, &api.Enchantment{
			Name:      "Skill: " + skill,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return results
}

// Template:Striding
// Usage: {{Striding|(Enhancement Amount)|(Public Area)}}
func parseTemplateStriding(raw string) *api.Enchantment {
	const prefix = "{{Striding"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	amount := ""
	if len(parts) >= 1 {
		amount = strings.TrimSpace(parts[0])
	}
	if amount == "" {
		return nil
	}

	publicArea := ""
	if len(parts) >= 2 {
		publicArea = strings.TrimSpace(parts[1])
	}

	name := "Movement Speed"
	if publicArea != "" {
		name = name + " (Public Areas)"
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount + "%",
		BonusType: "Enhancement",
	}
}

// Template:Riposte
// Usage: {{Riposte|(Amount)|(Style)}}
func parseTemplateRiposte(raw string) []*api.Enchantment {
	const prefix = "{{Riposte"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	amountStr := ""
	if len(parts) >= 1 {
		amountStr = strings.TrimSpace(parts[0])
	}
	if amountStr == "" {
		return nil
	}

	style := "ACSaves"
	if len(parts) >= 2 {
		val := strings.TrimSpace(parts[1])
		if val != "" {
			style = val
		}
	}

	var results []*api.Enchantment
	bonusType := "Insight"

	acAmount := amountStr
	saveAmount := amountStr

	// Handle different styles
	if strings.EqualFold(style, "Damage") {
		// Based on the wikitext:
		// AC: ceil(amount/2)
		// Saves: floor(amount/2)
		amountInt, _ := strconv.Atoi(amountStr)
		if amountInt > 0 {
			// ceil(n/2) is (n+1)/2 for integers
			acAmount = strconv.Itoa((amountInt + 1) / 2)
			// floor(n/2) is n/2 for integers
			saveAmount = strconv.Itoa(amountInt / 2)
		}
	} else if strings.EqualFold(style, "ACSaves") {
		// +{1} Insight bonus to AC and to Saves.
		acAmount = amountStr
		saveAmount = amountStr
	} else if strings.EqualFold(style, "Legacy") {
		// Legacy doesn't seem to have passive stats in the EnchBody provided
		return nil
	}

	// Armor Class
	results = append(results, &api.Enchantment{
		Name:      "Armor Class",
		Amount:    acAmount,
		BonusType: bonusType,
	})

	// Individual Saves
	for _, save := range saves {
		results = append(results, &api.Enchantment{
			Name:      save + " Saving Throws",
			Amount:    saveAmount,
			BonusType: bonusType,
		})
	}

	return results
}

// Template:Linguistics
// Usage: {{Linguistics|(Amount)}}
func parseTemplateLinguistics(raw string) []*api.Enchantment {
	const prefix = "{{Linguistics"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	amount := ""
	if len(parts) >= 1 {
		amount = strings.TrimSpace(parts[0])
	}
	if amount == "" {
		return nil
	}

	skills := []string{
		"Bluff",
		"Diplomacy",
		"Intimidate",
	}

	var results []*api.Enchantment
	for _, skill := range skills {
		results = append(results, &api.Enchantment{
			Name:      "Skill: " + skill + " (Cooldown Reduction)",
			Amount:    amount + "%",
			BonusType: "Enhancement",
		})
	}

	return results
}

func parseTemplateProtectionFromEvil(raw string) []*api.Enchantment {
	// {{ProtectionFromEvil}}
	const prefix = "{{ProtectionFromEvil"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	var results []*api.Enchantment

	// Deflection Bonus to AC
	results = append(results, &api.Enchantment{
		Name:      "Armor Class",
		Amount:    "2",
		BonusType: "Deflection",
		Notes:     new("vs evil creatures."),
	})

	// Resistance Bonus to Saves
	saves := []string{"Fortitude Save", "Reflex Save", "Will Save"}
	for _, save := range saves {
		results = append(results, &api.Enchantment{
			Name:      save,
			Amount:    "2",
			BonusType: "Resistance",
			Notes:     new("vs evil creatures."),
		})
	}

	return results
}

// Template: Ethereal
// Usage: {{Ethereal}}
func parseTemplateEthereal(raw string) *api.Enchantment {
	const prefix = "{{Ethereal"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Ethereal",
		Notes: new("Equipping this item causes your hands and weapons to be partially incorporeal. Your melee attacks do not roll a miss chance for Incorporeal targets."),
	}
}

// Template: AlignmentAbsorb
// Usage: {{AlignmentAbsorb|(Alignment)|(Enhancement Amount)|(Bonus Type)|(Title)}}
func parseTemplateAlignmentAbsorb(raw string) *api.Enchantment {
	const prefix = "{{AlignmentAbsorb"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	alignment := ""
	amount := ""
	bonusType := "Enhancement"
	title := ""

	if len(parts) >= 1 {
		alignment = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		amount = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 && strings.TrimSpace(parts[2]) != "" {
		bonusType = strings.TrimSpace(parts[2])
	}
	if len(parts) >= 4 {
		title = strings.TrimSpace(parts[3])
	}

	if amount == "" {
		return nil
	}

	name := ""
	var notes *string

	if strings.EqualFold(alignment, "All") {
		name = "Alignment Absorption"
		notes = new("Alignment absorption includes Law, Chaos, Good, and Evil damage.")
	} else {
		name = alignment + " Absorption"
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    "+" + amount + "%",
		BonusType: bonusType,
		Notes:     notes,
	}
}

// Usage: {{QuellingStrikes|(Type)}}
func parseTemplateQuellingStrikes(raw string) *api.Enchantment {
	const prefix = "{{QuellingStrikes"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	strikeType := ""
	if len(parts) >= 1 {
		strikeType = strings.TrimSpace(parts[0])
	}

	name := "Quelling Strikes"
	note := "On Vorpal Melee: applies Quell to target enemies for six seconds, rendering them unable to cast divine spells. This has a chance of preventing the target from casting all spells for three seconds (12 second cooldown)."

	if strings.EqualFold(strikeType, "Improved") {
		name = "Improved Quelling Strikes"
		note = "On Vorpal Melee: applies Quell to target enemies for six seconds, rendering them unable to cast divine spells. This has a 50% chance of preventing the target from casting all spells for three seconds (12 second cooldown)."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: SneakAttackDice
// Usage: {{SneakAttackDice|(Enhancement Amount)|(Bonus Type)|(Fixed Amount)}}
func parseTemplateSneakAttackDice(raw string) *api.Enchantment {
	const prefix = "{{SneakAttackDice"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	amount := ""
	bonusType := "Enhancement"
	fixedAmount := false

	if len(parts) >= 1 {
		amount = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 && strings.TrimSpace(parts[1]) != "" {
		bonusType = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 && strings.EqualFold(strings.TrimSpace(parts[2]), "True") {
		fixedAmount = true
	}

	if amount == "" {
		return nil
	}

	modifier := amount
	if !fixedAmount {
		modifier = amount + "d6"
	}

	return &api.Enchantment{
		Name:      "Sneak Attack Dice",
		Amount:    modifier,
		BonusType: bonusType,
	}
}

// Template: ForceBlast
// Usage: {{ForceBlast}}
func parseTemplateForceBlast(raw string) *api.Enchantment {
	const prefix = "{{ForceBlast"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Force Blast",
		Amount:    "3d4",
		BonusType: "On-hit",
		Notes:     new("Adds a 2% Chance On Hit to cause a burst of magical force to strike your target, dealing 3d4 Force Damage per Minimum Level of the weapon to all nearby enemies."),
	}
}

// Template: SlayLiving
// Usage: {{SlayLiving|(Type)}}
func parseTemplateSlayLiving(raw string) *api.Enchantment {
	const prefix = "{{SlayLiving"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	slayType := ""
	if len(parts) >= 1 {
		slayType = strings.TrimSpace(parts[0])
	}

	name := "Slay Living"
	note := "This weapon stores a dark and sinister power deep within. When the weapon is used, this power occasionally comes to the surface, attempting to instantly snuff out the life force of the enemy."

	if strings.EqualFold(slayType, "Legendary") {
		name = "Legendary Slay Living"
		note = "On hit, this has a chance of snuffing the life from your foes, slaying them instantly. Struck enemies must make a Fortitude DC: 100 save or be slain."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// parseSaveDC parses `{{SaveDC|Fortitude|100||||color}}` to "Fortitude DC: 100"
func parseSaveDC(raw string) string {
	const prefix = "{{SaveDC|"
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return raw
	}

	paramList := raw[len(prefix) : len(raw)-len(suffix)]
	parts := strings.Split(paramList, "|")
	if len(parts) < 2 {
		return raw
	}

	saveType := strings.TrimSpace(parts[0])
	dc := strings.TrimSpace(parts[1])
	if dc == "" {
		return saveType
	}

	return fmt.Sprintf("%s DC: %s", saveType, dc)
}

func parseEnchTitle(raw string) string {
	const prefix = "{{EnchTitle|"
	const suffix = "}}"
	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return raw
	}
	paramList := raw[len(prefix) : len(raw)-len(suffix)]
	parts := splitParams(paramList)
	if len(parts) >= 2 {
		return strings.TrimSpace(parts[1])
	}
	if len(parts) >= 1 {
		return strings.TrimSpace(parts[0])
	}
	return ""
}

func parseEnchBody(raw string) string {
	const prefix = "{{EnchBody|"
	const suffix = "}}"
	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return raw
	}
	paramList := raw[len(prefix) : len(raw)-len(suffix)]
	return strings.TrimSpace(paramList)
}

func processEnchText(s string) string {
	// Handle embedded templates
	for {
		start := strings.Index(s, "{{")
		if start == -1 {
			break
		}
		// Use brace counter to find matching }}
		openBraceCount := 0
		endOfTemplate := -1
		for i := start + 2; i < len(s); i++ {
			if s[i] == '{' && i+1 < len(s) && s[i+1] == '{' {
				openBraceCount++
				i++
			} else if s[i] == '}' && i+1 < len(s) && s[i+1] == '}' {
				if openBraceCount > 0 {
					openBraceCount--
					i++
				} else {
					endOfTemplate = i + 1
					break
				}
			}
		}

		if endOfTemplate == -1 {
			break
		}

		fullTemplate := s[start : endOfTemplate+1]
		replacement := fullTemplate

		if strings.HasPrefix(fullTemplate, "{{SaveDC|") {
			replacement = parseSaveDC(fullTemplate)
		} else if strings.HasPrefix(fullTemplate, "{{Dice|") {
			dice := ParseTemplateDice(fullTemplate)
			replacement = dice.Raw
		} else if strings.HasPrefix(fullTemplate, "{{EnchTitle|") {
			replacement = parseEnchTitle(fullTemplate)
		} else if strings.HasPrefix(fullTemplate, "{{EnchBody|") {
			replacement = parseEnchBody(fullTemplate)
		}

		s = s[:start] + replacement + s[endOfTemplate+1:]
	}

	return stripWikitext(s)
}

func parseTemplateNightmares(raw string) *api.Enchantment {
	const prefix = "{{Nightmares"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	nType := ""
	if len(parts) >= 1 {
		nType = strings.TrimSpace(parts[0])
	}

	var titleText, bodyText string

	switch strings.ToLower(nType) {
	case "legendary":
		titleText = "{{EnchTitle|Nightmares|Legendary Nightmares}}"
		bodyText = "{{EnchBody|On hit, this item has a chance to attempt to fear your enemy, rippin the life from them as if they were struck with a [[Phantasmal Killer]] spell. Enemies must make a {{SaveDC|Fortitude|100||||color}} Save versus Death or be slain. Even if they make their save versus Death, they may still be feared.}}"
	case "sovereign":
		titleText = "{{EnchTitle|Nightmares|Sovereign Nightmares}}"
		bodyText = "{{EnchBody|On Vorpal Hit: If your target has below 5,000 Hit Points, a burst of pure terror emanates from this weapon, snuffing out its life as if it were the subject of a [[Phantasmal Killer]] spell. If your target has above 5,000 Hit Points, they instead take significant Force damage.}}"
	default:
		titleText = "{{EnchTitle|Nightmares|Nightmares}}"
		bodyText = "{{EnchBody|This weapon terrorizes your foes, applying a Mind Thrust effect on successful hits (dealing {{Dice||5|8}} force damage, Will vs. Enchantments negates) and exposing your foes to their greatest fears on vorpal hits, acting as a [[Phantasmal Killer]] spell.}}"
	}

	name := processEnchText(titleText)
	note := processEnchText(bodyText)

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: BoonofUndeath
// Usage: {{BoonofUndeath|(Type)}}
func parseTemplateBoonofUndeath(raw string) *api.Enchantment {
	const prefix = "{{BoonofUndeath"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	bType := ""
	if len(parts) >= 1 {
		bType = strings.TrimSpace(parts[0])
	}

	name := "Boon of Undeath"
	spell := "Inflict Light Wounds"

	if strings.EqualFold(bType, "Greater") {
		name = "Greater Boon of Undeath"
		spell = "Inflict Moderate Wounds"
	}

	note := fmt.Sprintf("Undead take solace in the hate of others. Every time a character wearing a Boon of Undeath item is struck in combat, an %s spell will be cast on the character.", spell)

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: GhostTouch
// Usage: {{GhostTouch}}
func parseTemplateGhostTouch(raw string) *api.Enchantment {
	const prefix = "{{GhostTouch"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Ghost Touch",
		Notes: new("An incorporeal creature's 50% chance to avoid damage does not apply to attacks with ghost touch weapons."),
	}
}

// Template: OffensiveDamage
// Usage: {{OffensiveDamage|(Effect)|(Title)}}
func parseTemplateOffensiveDamage(raw string) *api.Enchantment {
	const prefix = "{{OffensiveDamage"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	// Use splitParams to handle potential nested templates/links
	parts := splitParams(inner)
	effect := ""
	title := ""

	if len(parts) >= 1 {
		effect = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		title = strings.TrimSpace(parts[1])
	}

	name := ""
	note := ""

	switch strings.ToLower(effect) {
	case "fire":
		name = "Fire Damage"
		note = "Attacks and offensive spells have a high chance to deal very strong fire damage."
	case "electricity":
		name = "Electric Damage"
		note = "Attacks and offensive spells have a high chance to deal very massive amount of electric damage."
	case "untyped":
		name = "Untyped Damage"
		note = "Attacks and offensive spells have a chance to deal untyped damage."
	case "cursedot":
		name = "Curse DOT"
		note = "Attacks and offensive spells have a chance to apply a Curse that deals significant untyped damage over time."
	default:
		return nil
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: ExtraSmites
// Usage: {{ExtraSmites|(Count)|(Hide Fast Regen)}}
func parseTemplateExtraSmites(raw string) []*api.Enchantment {
	const prefix = "{{ExtraSmites"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	count := ""
	hideRegen := ""

	if len(parts) >= 1 {
		count = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		hideRegen = strings.TrimSpace(parts[1])
	}

	if count == "" {
		return nil
	}

	var enchantments []*api.Enchantment

	// 1. Extra Smite charges
	enchantments = append(enchantments, &api.Enchantment{
		Name:   "Smite Evil Charges",
		Amount: count,
	})

	// 2. Regeneration aspect (default 10% faster)
	if hideRegen == "" {
		enchantments = append(enchantments, &api.Enchantment{
			Name:   "Smite Evil Charge (Regeneration)",
			Amount: "10%",
		})
	}

	return enchantments
}

// Template: Turning
// Usage: {{Turning|(Type)}}
func parseTemplateTurning(raw string) *api.Enchantment {
	const prefix = "{{Turning"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	turningType := ""
	if len(parts) >= 1 {
		turningType = strings.TrimSpace(parts[0])
	}

	name := "Turning"
	amount := ""
	note := "This will increase the total number of Turn Undead attempts you can use. However, these additional Turn Undead attempts will only take effect after the wielder rests."

	switch strings.ToLower(turningType) {
	case "minor":
		name = "Minor Turning"
		amount = "1"
		note = "Minor Turning: This will increase the total number of Turn Undead attempts you can use by 1. However, these additional Turn Undead attempts will only take effect after the wielder rests."
	case "lesser":
		name = "Lesser Turning"
		amount = "2"
		note = "Lesser Turning: This will increase the total number of Turn Undead attempts you can use by 2. However, these additional Turn Undead attempts will only take effect after the wielder rests."
	case "greater":
		name = "Greater Turning"
		amount = "4"
		note = "Greater Turning: This will increase the total number of Turn Undead attempts you can use by 4. However, these additional Turn Undead attempts will only take effect after the wielder rests."
	default:
		// Normal (Blank)
		amount = "3" // Standard Turning is usually +3
	}

	return &api.Enchantment{
		Name:   name,
		Amount: amount,
		Notes:  new(note),
	}
}

// Template: AttunedToHeroism
// Usage: {{AttunedToHeroism|(Location)|(Tier)}}
func parseTemplateAttunedToHeroism(raw string) *api.Enchantment {
	const prefix = "{{AttunedToHeroism"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	location := ""
	tier := ""

	if len(parts) >= 1 {
		location = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		tier = strings.TrimSpace(parts[1])
	}

	name := "Attuned to Heroism"
	if tier != "" && tier != "0" {
		name = fmt.Sprintf("Attuned to Heroism: Tier %s", tier)
	}

	var note string
	locLower := strings.ToLower(location)
	if locLower == "eveningstar" {
		note = "Attuned to Heroism: This relic is attuned to heroic actions. If you have earned enough favor with the Purple Dragon Knights of Cormyr, you can upgrade this relic at their representative in Eveningstar to become part of a Planar Conflux item set."
	} else {
		// Default to Gianthold if blank or explicitly Gianthold
		note = "Attuned to Heroism: This relic is attuned to heroic actions. Through the use of Commendations of Heroism, you can upgrade this item at the Stormreaver Monument in the Ruins of Gianthold."
		if tier != "" && tier != "0" {
			note = fmt.Sprintf("Attuned to Heroism: Tier %s: This relic is attuned to heroic actions. Through the use of Commendations of Heroism, you can upgrade this item at the Stormreaver Monument in the Ruins of Gianthold.", tier)
		}
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: WeakenConstruct
// Usage: {{WeakenConstruct}}
func parseTemplateWeakenConstruct(raw string) *api.Enchantment {
	const prefix = "{{WeakenConstruct"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	note := "While wearing this item, your melee attacks cause construct to lose 20% of their fortification for the next 20 seconds. This effect does not stack with itself."

	return &api.Enchantment{
		Name:  "Weaken Construct",
		Notes: new(note),
	}
}

func parseTemplateSealedInUndeath() *api.Enchantment {
	note := "This item seethes with a sealed power. It can have its power unsealed at the Ritual Table, adding one effect. Attempting to add another will remove the original."
	return &api.Enchantment{
		Name:  "Sealed in Undeath",
		Notes: new(note),
	}
}

// Template: SpellTurmoil
// Usage: {{SpellTurmoil}}
func parseTemplateSpellTurmoil(raw string) *api.Enchantment {
	const prefix = "{{SpellTurmoil"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	note := "When casting any damaging Fire, Cold, Acid or Electric spells, there is a chance that you will gain a +20 Alchemical bonus to Spell Power to one of those energy types for 30 seconds."

	return &api.Enchantment{
		Name:  "Spell Turmoil",
		Notes: new(note),
	}
}

// Template: ShockingBlow
// Usage: {{ShockingBlow|(Style)}}
func parseTemplateShockingBlow(raw string) *api.Enchantment {
	const prefix = "{{ShockingBlow"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	style := ""
	if len(parts) > 0 {
		style = strings.TrimSpace(parts[0])
	}

	name := "Shocking Blow"
	note := "This item is charged with electricity. When in melee, on an attack roll of 20 which is confirmed as a critical hit it will punish the target with a large electric show (10d6 electric damage). A successful Reflex DC: 22 reduces this damage by half."

	if strings.EqualFold(style, "Greater") {
		name = "Greater Shocking Blow"
		note = "This item is charged with electricity. When in melee, on an attack roll of 20 which is confirmed as a critical hit it will punish the target with a large electric show (20d6 electric damage)."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: GuidanceofShar
// Usage: {{GuidanceofShar}}
func parseTemplateGuidanceofShar(raw string) *api.Enchantment {
	const prefix = "{{GuidanceofShar"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	note := "On Vorpal Melee hit target is Blinded for 3 seconds. 10% Chance On Being Hit: You are blinded for 1 second. Blindness immunity does not prevent this effect."

	return &api.Enchantment{
		Name:  "Guidance of Shar",
		Notes: new(note),
	}
}

// Template: HeroicInspiration
// Usage: {{HeroicInspiration|(Amount)|(Bonus Type)}}
func parseTemplateHeroicInspiration(raw string) *api.Enchantment {
	const prefix = "{{HeroicInspiration"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	amount := "5%"
	bonusType := "Enhancement"

	if len(parts) > 0 {
		val := strings.TrimSpace(parts[0])
		if val != "" {
			amount = val
		}
	}
	if len(parts) > 1 {
		val := strings.TrimSpace(parts[1])
		if val != "" {
			bonusType = val
		}
	}

	name := "Experience Point Gain"
	note := fmt.Sprintf("Heroic Inspiration: This item inspires you to acts of great heroism, granting a %s %s bonus to experience points granted by completing quests while it is equipped. This stacks with experience boosting effects from elixirs but does not stack with experience boosting effects from other equippable items.", amount, bonusType)

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		Notes:     new(note),
	}
}

// Usage: {{Dust|(Type)|(Title)}}
func parseTemplateDust(raw string) *api.Enchantment {
	const prefix = "{{Dust"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	// Use splitParams to handle potential nested templates/links
	parts := splitParams(inner)
	dustType := ""
	title := ""

	if len(parts) >= 1 {
		dustType = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		title = strings.TrimSpace(parts[1])
	}

	name := "Dust"
	note := "UNKNOWN"

	if strings.EqualFold(dustType, "Legendary") {
		name = "Legendary Dust"
		note = "Attacks and offensive spells have a chance to reduce enemy Physical Resistance Rating and Positive Healing Amplification."
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Usage: {{Ash|(Type)|(Title)}}
func parseTemplateAsh(raw string) *api.Enchantment {
	const prefix = "{{Ash"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	// Use splitParams to handle potential nested templates/links
	parts := splitParams(inner)
	ashType := ""
	title := ""

	if len(parts) >= 1 {
		ashType = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		title = strings.TrimSpace(parts[1])
	}

	name := "Ash"
	note := "UNKNOWN"

	if strings.EqualFold(ashType, "Legendary") {
		name = "Legendary Ash"
		note = "Your attacks and offensive spells have a chance to reduce enemy Magical Resistance Rating and Universal Spell Power."
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Usage: {{ArcaneCastingDexterity|(Bonus Type)|(Title)}}
func parseTemplateArcaneCastingDexterity(raw string) *api.Enchantment {
	const prefix = "{{ArcaneCastingDexterity"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	bonusType := ""
	title := ""

	if len(parts) >= 1 {
		bonusType = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		title = strings.TrimSpace(parts[1])
	}

	name := "Arcane Spell Failure (Reduction)"
	amount := "-10%" // Default

	switch strings.ToLower(bonusType) {
	case "lesser":
		amount = "-5%"
	case "greater":
		amount = "-15%"
	case "epic":
		amount = "-20%"
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: "Enhancement",
	}
}

// Template: Disintegration
// Usage: {{Disintegration|(Type)}}
func parseTemplateDisintegration(raw string) *api.Enchantment {
	const prefix = "{{Disintegration"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	disType := ""
	if len(parts) >= 1 {
		disType = strings.TrimSpace(parts[0])
	}

	name := "Disintegration"
	note := "This weapon has a dark, insidious power deep within. Occasionally, this power lashes out violently at enemies and attempts to disintegrate them."

	if strings.EqualFold(disType, "Utter") {
		name = "Utter Disintegration"
		note = "This weapon has a dark, insidious power deep within. Occasionally, this power lashes out violently at enemies and attempts to disintegrate them. This disintegrate is incredibly powerful, and will utterly destroy weaker foes."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: DisintegrationGuard
// Usage: {{DisintegrationGuard|(Type)}}
func parseTemplateDisintegrationGuard(raw string) *api.Enchantment {
	const prefix = "{{DisintegrationGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	disType := ""
	if len(parts) >= 1 {
		disType = strings.TrimSpace(parts[0])
	}

	name := "Disintegration Guard"
	note := "This item has a dark, insidious power deep within. Occasionally, this power lashes out violently at enemies attack you and attempts to disintegrate them."

	if strings.EqualFold(disType, "Utter") {
		name = "Utter Disintegration Guard"
		note = "This item has a dark, insidious power deep within. Occasionally, this power lashes out violently at enemies attack you and attempts to disintegrate them. This disintegrate is incredibly powerful, and will utterly destroy weaker foes."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Usage: {{Flamescale}}
func parseTemplateFlamescale(raw string) []*api.Enchantment {
	const prefix = "{{Flamescale"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	var enchantments []*api.Enchantment

	// 1. Damage Reduction Bypass
	enchantments = append(enchantments, &api.Enchantment{
		Name: "Damage Reduction Bypass: Adamantine",
	})

	// 2. Fire Damage
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Fire Damage",
		Amount:    "15d6",
		BonusType: "On-hit",
	})

	return enchantments
}

// Template: HolySmite
// Usage: {{HolySmite}}
func parseTemplateHolySmite(raw string) *api.Enchantment {
	const prefix = "{{HolySmite"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Holy Smite",
		Amount:    "3d4",
		BonusType: "On-hit (2% Chance) (per Weapon ML)",
		Notes:     new("Adds a 2% Chance On Hit to cause a blast of holy energy to smite your target, dealing 3d4 Holy Damage per Minimum Level of the weapon to all non-good nearby enemies."),
	}
}

// Template: TempestStorm
// Usage: {{TempestStorm}}
func parseTemplateTempestStorm(raw string) *api.Enchantment {
	const prefix = "{{TempestStorm"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Electric Damage",
		Amount:    "1d20",
		BonusType: "On-hit (2% Chance) (per Weapon ML)",
		Notes:     new("Adds a 2% Chance On Hit to cause a bold of lightning to strike your target, dealing 1d20 Lightning Damage per Minimum Level of the weapon to all nearby enemies."),
	}
}

// Template: AcidCorrosion
// Usage: {{AcidCorrosion}}
func parseTemplateAcidCorrosion(raw string) *api.Enchantment {
	const prefix = "{{AcidCorrosion"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Acid Damage",
		Amount:    "3d6",
		BonusType: "On-hit (2% Chance) (per Weapon ML)",
		Notes:     new("Adds a 2% Chance to cause a blast of acid to corrode your target, dealing 3d6 Acid Damage per Minimum Level of the weapon to all nearby enemies."),
	}
}

// Template: InvisibilityGuard
// Usage: {{InvisibilityGuard}}
func parseTemplateInvisibilityGuard(raw string) *api.Enchantment {
	const prefix = "{{InvisibilityGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Invisibility Guard",
		Notes: new("This item has a chance of granting you temporary invisibility when you are hit by foes. The invisibility will not be removed when you attack or take damage, but it will wear off after 10 seconds."),
	}
}

// Template: Trembling
// Usage: {{Trembling}}
func parseTemplateTrembling(raw string) *api.Enchantment {
	const prefix = "{{Trembling"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Trembling",
		Notes: new("On a Critical Hit, this weapon applies the Shaken debuff."),
	}
}

// Template: Anthem
// Usage: {{Anthem|(Type)}}
func parseTemplateAnthem(raw string) *api.Enchantment {
	const prefix = "{{Anthem"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	aType := ""
	if len(parts) >= 1 {
		aType = strings.TrimSpace(parts[0])
	}

	name := "Anthem"
	note := "When equipped by a character with Bard levels, this item begins to hum an inspiring tune. Your bard songs regenerate slowly over time."

	if strings.EqualFold(aType, "Inspiring Echoes") {
		name = "Anthem: Inspiring Echoes"
		note = "When a Bard wields this item, Anthem abilities that restore Bard songs over time restore them 40% faster (for example, an ability that restores a Song every 5 minutes would restore one song every 3 minutes instead)."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: HealersBounty
// Usage: {{HealersBounty}}
func parseTemplateHealersBounty(raw string) *api.Enchantment {
	const prefix = "{{HealersBounty"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Healers Bounty",
		Notes: new("This shield has a small percentage to cast a Heal spell on you when you take damage."),
	}
}

// Template: AlchemicalConservation
// Usage: {{AlchemicalConservation}}
func parseTemplateAlchemicalConservation(raw string) []*api.Enchantment {
	const prefix = "{{AlchemicalConservation"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	var enchantments []*api.Enchantment

	// 1. +1 ki on every successful attack
	enchantments = append(enchantments, &api.Enchantment{
		Name:   "Ki Retrieval",
		Amount: "1",
		Notes:  new("You will gain +1 ki on every successful attack."),
	})

	// 2. Action Boosts
	enchantments = append(enchantments, &api.Enchantment{
		Name:   "Action Boost Charges",
		Amount: "1",
		Notes:  new("Increase the number of Action Boosts you can use per rest by 1. These additional uses will only take effect after your rest."),
	})

	// 3. Turn Undead attempts
	enchantments = append(enchantments, &api.Enchantment{
		Name:   "Turn Undead Charges",
		Amount: "1",
		Notes:  new("Increase the number of Turn Undead attempts you can use per rest by 1. These additional uses will only take effect after your rest."),
	})

	// 4. Bard Songs
	enchantments = append(enchantments, &api.Enchantment{
		Name:   "Bard Song Charges",
		Amount: "1",
		Notes:  new("Increase the number of Bard Songs you can use per rest by 1. These additional uses will only take effect after your rest."),
	})

	return enchantments
}

// Template: AlchemicalElementalAttuned
// Usage: {{AlchemicalElementalAttuned|(Type of Elemental)}}
func parseTemplateAlchemicalElementalAttuned(raw string) *api.Enchantment {
	const prefix = "{{AlchemicalElementalAttuned"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	elementType := ""
	if len(parts) >= 1 {
		elementType = strings.TrimSpace(parts[0])
	}

	name := ""
	note := ""

	switch strings.ToLower(elementType) {
	case "water":
		name = "Alchemical Water Attunement"
		note = "Attacks and offensive spells have a chance to inflict ten stacks of cold damage over time, fading one stack at a time. This effect as an internal cooldown."
	case "fire":
		name = "Alchemical Fire Attunement"
		note = "Attacks and offensive spells have a small chance to deal massive fire damage."
	case "earth":
		name = "Alchemical Earth Attunement"
		note = "Attacks and offensive spells have a chance to inflict ten stacks of acid damage over time, fading one stack at a time. This effect as an internal cooldown."
	case "air":
		name = "Alchemical Air Attunement"
		note = "Attacks and offensive spells have a small chance to deal massive electric damage."
	default:
		// Fallback or generic name if type is unknown or missing
		if elementType == "" {
			return nil
		}
		name = "Alchemical " + elementType + " Attunement"
		note = "Attacks and offensive spells have a chance to deal elemental damage."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// Template: CrushingWaveGuard
// Usage: {{CrushingWaveGuard}}
func parseTemplateCrushingWaveGuard(raw string) *api.Enchantment {
	const prefix = "{{CrushingWaveGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Crushing Wave Guard",
		BonusType: "On-being-hit",
		Notes:     new("This item stores the unstoppable force of the ocean's fury deep within. When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, crushing enemies beneath a torrent of frigid water."),
	}
}

// Template: ScorchingFlame
// Usage: {{ScorchingFlame}}
func parseTemplateScorchingFlame(raw string) *api.Enchantment {
	const prefix = "{{ScorchingFlame"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Scorching Flame",
		Amount:    "4d4",
		BonusType: "On-hit (2% Chance) (per Weapon ML)",
		Notes:     new("Adds a 2% Chance On Hit to cause a blast of flame to scorcher your target, dealing 4d4 Fire Damage per Minimum Level of the weapon to all nearby enemies."),
	}
}

// Template: NullmagicGuard
// Usage: {{NullmagicGuard}}
func parseTemplateNullmagicGuard(raw string) *api.Enchantment {
	const prefix = "{{NullmagicGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Nullmagic Guard",
		BonusType: "On being hit with a spell",
		Notes:     new("There is a small chance that you explode in arcane energies. Foes hit are subject to a silencing effect, preventing their spellcasts and dampening their magical protections for 10 seconds."),
	}
}

// Template: GlacialFrost
// Usage: {{GlacialFrost}}
func parseTemplateGlacialFrost(raw string) *api.Enchantment {
	const prefix = "{{GlacialFrost"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Glacial Frost",
		Amount:    "7d2",
		BonusType: "On-hit (2% Chance) (per Weapon ML)",
		Notes:     new("Adds a 2% Chance cause a burst of glacial frost to chill your target, dealing 7d2 Cold Damage per Minimum Level of the weapon to all nearby enemies."),
	}
}

// Template: RunicRevitalization
// Usage: {{RunicRevitalization}}
func parseTemplateRunicRevitalization(raw string) *api.Enchantment {
	const prefix = "{{RunicRevitalization"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Runic Revitalization",
		BonusType: "On Positive Energy Spell Cast",
		Notes:     new("You have a 10% chance to gain 100 Temporary Hit Points and 50 Temporary Spell Points for 60 seconds. This effect can trigger once per 120 seconds."),
	}
}

// Template: UnderwaterAction
// Usage: {{UnderwaterAction|(Amount)}}
func parseTemplateSuppressed() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Suppressed",
		Notes: new("This psionic item is powerful, but you sense that it has not unlocked all of its secrets to you at this time."),
	}
}

func parseTemplateUnderwaterAction(raw string) []*api.Enchantment {
	const prefix = "{{UnderwaterAction"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	amount := ""
	if len(parts) >= 1 {
		amount = strings.TrimSpace(parts[0])
	}

	var results []*api.Enchantment

	// 1. Water Breathing
	results = append(results, &api.Enchantment{
		Name:  "Water Breathing",
		Notes: new("This item grants its wearer the ability to breathe water as if it were air."),
	})

	// 2. Swim bonus (if amount provided)
	if amount != "" {
		results = append(results, &api.Enchantment{
			Name:      "Skill: Swim",
			Amount:    amount,
			BonusType: "Competence",
		})
	}

	return results
}

// Template: CrystalCoveUpgrade
// Usage: {{CrystalCoveUpgrade|(Tier)}}
func parseTemplateCrystalCoveUpgrade(raw string) *api.Enchantment {
	const prefix = "{{CrystalCoveUpgrade"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	parts := splitParams(inner)
	tier := "1"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		tier = strings.TrimSpace(parts[0])
	}

	return &api.Enchantment{
		Name:  fmt.Sprintf("Upgradeable - Tier %s", tier),
		Notes: new(fmt.Sprintf("This is a tier %s upgradeable item.", tier)),
	}
}

// Template: SpellAbsorption
// Usage: {{SpellAbsorption|(Charges)|(Recharge Rate)|(Spell Blocked)|(Special Type)|(Title)}}
func parseTemplateSpellAbsorption(raw string) *api.Enchantment {
	const prefix = "{{SpellAbsorption"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}
	parts := splitParams(inner)

	chargesStr := ""
	rechargeRateStr := ""
	spellBlocked := ""
	specialType := ""
	title := ""

	if len(parts) >= 1 {
		chargesStr = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		rechargeRateStr = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		spellBlocked = strings.TrimSpace(parts[2])
	}
	if len(parts) >= 4 {
		specialType = strings.TrimSpace(parts[3])
	}
	if len(parts) >= 5 {
		title = strings.TrimSpace(parts[4])
	}

	// Convert strings to ints
	charges, _ := strconv.Atoi(chargesStr)
	rechargeRate, _ := strconv.Atoi(rechargeRateStr)

	// Determine Name
	name := "Spell Absorption"
	if title != "" {
		name = title
	} else if spellBlocked != "" {
		name = spellBlocked + " Absorption"
	} else if specialType != "" {
		name = specialType + " Absorption"
	}

	// Determine Notes
	note := ""
	if spellBlocked != "" {
		note = fmt.Sprintf("This effect absorbs %d %s spells targeted at the wearer.", charges, spellBlocked)
	} else {
		note = fmt.Sprintf("This effect absorbs %d harmful spells targeted at the wearer.", charges)
	}

	return &api.Enchantment{
		Name:         name,
		Notes:        new(note),
		Charges:      charges,
		RechargeRate: rechargeRate,
	}
}

// Template: AgainstTheSlaveLordsSetBonus
// Usage: {{AgainstTheSlaveLordsSetBonus}}
func parseTemplateAgainstTheSlaveLordsSetBonus() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Against the Slave Lords Set Bonus",
		Notes: new("An Against the Slave Lords Set Bonus can be applied to this item."),
	}
}

// Template: LitanyCombatBonus
// Usage: {{LitanyCombatBonus|(Magnitude)}}
func parseTemplateLitanyCombatBonus(raw string) []*api.Enchantment {
	const prefix = "{{LitanyCombatBonus"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	magnitude := "I"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		magnitude = strings.TrimSpace(parts[0])
	}

	attackBonus := "1"
	damageBonus := "1"
	if strings.EqualFold(magnitude, "II") {
		attackBonus = "4"
		damageBonus = "4"
	}

	return []*api.Enchantment{
		{
			Name:      "Attack Rolls",
			Amount:    attackBonus,
			BonusType: "Profane",
			Notes:     new("The Litany of the Dead enhances the combat abilities of its owner. Grants a Profane bonus to attack bonus."),
		},
		{
			Name:      "Damage",
			Amount:    damageBonus,
			BonusType: "Profane",
			Notes:     new("The Litany of the Dead enhances the combat abilities of its owner. Grants a Profane bonus to damage."),
		},
	}
}

// Template: CacophonicGuard
// Usage: {{CacophonicGuard|(Type)}}
func parseTemplateCacophonicGuard(raw string) *api.Enchantment {
	const prefix = "{{CacophonicGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	isLegendary := false
	if len(parts) >= 1 && strings.EqualFold(strings.TrimSpace(parts[0]), "Legendary") {
		isLegendary = true
	}

	name := "Cacophonic Guard"
	if isLegendary {
		name = "Legendary Cacophonic Guard"
	}

	notes := "This item stores the resonant power of pur sound within it. When the wearer is successfully attacked in melee, this power occasionally comes to the surface, dealing an overwhelming amount of Sonic damage to the attacker."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: UndeadGuard
// Usage: {{UndeadGuard|(Type)|(DiceCount)}}
func parseTemplateUndeadGuard(raw string) *api.Enchantment {
	const prefix = "{{UndeadGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	typeName := ""
	diceCount := "3"
	if len(parts) >= 1 {
		typeName = strings.TrimSpace(parts[0])
	}

	name := "Undead Guard"
	switch strings.ToLower(typeName) {
	case "lesser":
		diceCount = "1"
	case "superior":
		diceCount = "7"
	case "greater":
		diceCount = "5"
	case "custom":
		diceCount = "0" // default for custom if second param missing
		if len(parts) >= 2 {
			diceCount = strings.TrimSpace(parts[1])
		}
		name = fmt.Sprintf("Undead Guard +%s", diceCount)
	default:
		// Default diceCount is already "3"
		name = "Undead Guard"
	}

	dice := ParseTemplateDice(fmt.Sprintf("{{Dice||%s|8}}", diceCount))
	name = fmt.Sprintf("%s (%s)", name, dice.Raw)
	notes := fmt.Sprintf("This item burns those Undead that attack the wearer, causing %s Good damage on a successful melee attack.", dice.Raw)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: VaultsofArtificersUpgradeable
// Usage: {{VaultsofArtificersUpgradeable|(Tier)}}
func parseTemplateVaultsofArtificersUpgradeable(raw string) *api.Enchantment {
	const prefix = "{{VaultsofArtificersUpgradeable"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	parts := splitParams(inner)
	tier := "0"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		tier = strings.TrimSpace(parts[0])
	}

	return &api.Enchantment{
		Name:  fmt.Sprintf("Upgradeable - Tier %s", tier),
		Notes: new(fmt.Sprintf("This is a tier %s upgradeable item.", tier)),
	}
}

// Template: DR
// Usage: {{DR|(Reduced Amount)|(Bypassed Damage Type)|(Title)|(Description)|(Type of damage)}}
func parseTemplateDR(raw string) *api.Enchantment {
	const prefix = "{{DR"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)
	// (Reduced Amount)|(Bypassed Damage Type)|(Title)|(Description)|(Type of damage)

	var amount, bypass, title string
	if len(parts) >= 1 {
		amount = strings.TrimSpace(stripWikitext(parts[0]))
	}
	if len(parts) >= 2 {
		bypass = strings.TrimSpace(stripWikitext(parts[1]))
	}

	name := "Damage Reduction"
	if title != "" {
		name = title
	} else if amount != "" {
		if bypass == "" {
			bypass = "-"
		}
		name = fmt.Sprintf("Damage Reduction %s/%s", amount, bypass)
	}

	return &api.Enchantment{
		Name:   name,
		Amount: amount,
	}
}

// Template: Guard
// Usage: {{Guard|(Damage Type)|(Additional Dice)|(Die Side)|(Title)|(Save that Negates)|(DC)}}
func parseTemplateGuard(raw string) *api.Enchantment {
	const prefix = "{{Guard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := splitParams(inner)

	var damageType, addDice, dieSide, title, saveType, dc string
	if len(parts) >= 1 {
		damageType = strings.TrimSpace(stripWikitext(parts[0]))
	}
	if len(parts) >= 2 {
		addDice = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		dieSide = strings.TrimSpace(parts[2])
	}
	if dieSide == "" {
		dieSide = "6"
	}
	if len(parts) >= 4 {
		title = strings.TrimSpace(stripWikitext(parts[3]))
	}
	if len(parts) >= 5 {
		saveType = strings.TrimSpace(stripWikitext(parts[4]))
	}
	if len(parts) >= 6 {
		dc = strings.TrimSpace(parts[5])
	}

	// Name logic: "Put the type of damage at the end of the name in parentheses"
	var name string
	if title != "" {
		name = title
	} else {
		name = "Guard"
		if addDice != "" {
			if !strings.HasPrefix(addDice, "+") && !strings.HasPrefix(addDice, "-") {
				name += " +" + addDice
			} else {
				name += " " + addDice
			}
		}
	}

	if damageType != "" {
		name = fmt.Sprintf("%s (%s)", name, damageType)
	}

	// Notes logic: Deals {Dice} {Damage Type} damage...
	// Dice format: {addDice}d{dieSide}
	dice := ""
	if addDice != "" {
		dice = addDice + "d" + dieSide
	}

	notes := ""
	if damageType != "" {
		notes = fmt.Sprintf("When hit or missed in Melee: Deals %s %s damage to your attacker.", dice, damageType)
		if saveType != "" && dc != "" {
			notes += fmt.Sprintf(" A successful %s DC: %s will negate this effect.", saveType, dc)
		}
	} else {
		notes = "When hit or missed in Melee: Deals damage to your attacker."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: ZhentarimAttuned
// Usage: {{ZhentarimAttuned}}
func parseTemplateZhentarimAttuned(raw string) *api.Enchantment {
	const prefix = "{{ZhentarimAttuned"
	const suffix = "}}"
	const name = "Zhentarim Attuned"
	const notes = "This item has been attuned by the Zhentarim mage, Whisper. It can be upgraded with Zhentarim Black Stones."

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: BlackAbbotItemUpgrade
// Usage: {{BlackAbbotItemUpgrade}}
func parseTemplateBlackAbbotItemUpgrade(raw string) *api.Enchantment {
	const prefix = "{{BlackAbbotItemUpgrade"
	const suffix = "}}"
	const name = "Upgradeable Item (Black Abbot)"
	const notes = "This item could be upgraded if you found a Seal of the Black Abbot to combine it with. Bring this item to the Fountain of Necrotic Might outside the Black Mausoleum and combine it with a Seal of the Black Abbot to upgrade the item to a more powerful form."

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: QuoriMindShield
// Usage: {{QuoriMindShield}}
func parseTemplateQuoriMindShield(raw string) []*api.Enchantment {
	const prefix = "{{QuoriMindShield"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return []*api.Enchantment{
		{
			Name: "Immunity: Confusion",
		},
		{
			Name: "Immunity: Domination",
		},
		{
			Name:      "Alignment Absorption (Chaos)",
			Amount:    "31%",
			BonusType: "Enhancement",
		},
	}
}

// Template: EternalHolyBurst
// Usage: {{EternalHolyBurst}}
func parseTemplateEternalHolyBurst(raw string) *api.Enchantment {
	const prefix = "{{EternalHolyBurst"
	const suffix = "}}"
	const name = "Eternal Holy Burst"
	const notes = "While you are wearing this time, your melee, ranged, and unarmed attacks gain the Holy Burst ability. (This weapon is holy, The weapon deals an additional 1 to 6 good damage each hit. In addition, critical hits deal an additional 1 to 10 good damage for weapons with a x2 critical multiplier, 2 to 20 for a x3 critical multiplier and 3 to 30 for a x4 multiplier.)"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: StormreaverUpgrade
// Usage: {{StormreaverUpgrade}}
func parseTemplateStormreaverUpgrade(raw string) *api.Enchantment {
	const prefix = "{{StormreaverUpgrade"
	const suffix = "}}"
	const name = "Upgradeable Item (Stormreaver)"
	const notes = "This item could be upgraded if you found a Seal of the Stormreaver to combine it with. Bring this item to the Stormreaver Monument in Gianthold and combine it with a Seal of the Stormreaver to upgrade the item to a more powerful form."

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: Raging
// Usage: {{Raging|(Ability)|(Enhancement Amount)}}
func parseTemplateRaging(raw string) *api.Enchantment {
	const prefix = "{{Raging|"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, "}}") {
		return nil
	}

	inner := s[len(prefix) : len(s)-2]
	parts := strings.Split(inner, "|")
	if len(parts) < 2 {
		return nil
	}

	ability := strings.TrimSpace(parts[0])
	amountRaw := strings.TrimSpace(parts[1])

	amountInt, _ := strconv.Atoi(amountRaw)
	bonusType := "Rage"
	if amountInt < 0 {
		bonusType = "Penalty"
	}

	absAmount := amountInt
	if absAmount < 0 {
		absAmount = -absAmount
	}

	roman := intToRoman(absAmount)
	name := "Raging " + ability
	if roman != "" {
		name += " " + roman
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amountRaw,
		BonusType: bonusType,
	}
}

// Template: SuppressMadness
// Usage: {{SuppressMadness}}
func parseTemplateSuppressMadness(raw string) *api.Enchantment {
	const prefix = "{{SuppressMadness"
	const suffix = "}}"
	const name = "Suppress Madness"
	const notes = "This strange creature is enchanted with the ability to temporarily filter the maddening effects of certain Xoriat items. Wearing it will suppress the effects of the following: Curse Vector, Unwieldy, Overfocus, Mind Turbulence, Symbiotic Backlash, Metal Fatigue, Power Drain, and Single-Mindedness."

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: EpicNecropolisItemUpgrade
// Usage: {{EpicNecropolisItemUpgrade|(Which)}}
func parseTemplateEpicNecropolisItemUpgrade(raw string) []*api.Enchantment {
	const primaryName = "Upgradeable - Primary Augment"
	const primaryNotes = "This item can be upgraded to contain a Yellow, Blue or Red (weapons and shields only) augment. Bring this item to the Fountain of Necrotic Might outside the Black Mausoleum and combine it with Epic Tapestry Shreds to upgrade the item."
	const secondaryName = "Upgradeable - Secondary Augment"
	const secondaryNotes = "This item can be upgraded to contain a Green, Orange (weapons and shields only) or Purple (weapons and shields only) augment. Bring this item to the Fountain of Necrotic Might outside the Black Mausoleum and combine it with Epic Tapestry Shreds to upgrade the item."

	s := strings.TrimSpace(raw)
	s = strings.TrimPrefix(s, "{{")
	s = strings.TrimSuffix(s, "}}")
	parts := strings.Split(s, "|")

	which := ""
	if len(parts) > 1 {
		which = strings.ToLower(strings.TrimSpace(parts[1]))
	}

	var results []*api.Enchantment
	if which == "" || which == "primary" {
		results = append(results, &api.Enchantment{
			Name:  primaryName,
			Notes: new(primaryNotes),
		})
	}
	if which == "" || which == "secondary" {
		results = append(results, &api.Enchantment{
			Name:  secondaryName,
			Notes: new(secondaryNotes),
		})
	}

	return results
}

// Template: SneakAttack
// Usage: {{SneakAttack|(Enhancement Amount)|(Bonus Type)|(Damage Amount)}}
func parseTemplateSneakAttack(raw string) []*api.Enchantment {
	const prefix = "{{SneakAttack"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	var enhancementAmount string
	var bonusType string
	var damageAmount string

	if len(parts) > 0 {
		enhancementAmount = strings.TrimSpace(parts[0])
	}
	if len(parts) > 1 {
		bonusType = strings.TrimSpace(parts[1])
	}
	if bonusType == "" {
		bonusType = "Enhancement"
	}
	if len(parts) > 2 {
		damageAmount = strings.TrimSpace(parts[2])
	}

	// Default damage amount calculation if not provided
	if damageAmount == "" && enhancementAmount != "" {
		if val, err := strconv.Atoi(enhancementAmount); err == nil {
			// Based on examples: 3 -> 5, 6 -> 9
			// damage = ceil(val * 1.5)
			damageAmount = strconv.Itoa(val + (val+1)/2)
		}
	}

	var results []*api.Enchantment

	// 1. Sneak Attack (Accuracy)
	results = append(results, &api.Enchantment{
		Name:      "Sneak Attack",
		Amount:    enhancementAmount,
		BonusType: bonusType,
	})

	// 2. Sneak Attack Damage
	if damageAmount != "" {
		results = append(results, &api.Enchantment{
			Name:      "Sneak Attack Damage",
			Amount:    damageAmount,
			BonusType: bonusType,
		})
	}

	return results
}

// Template: Quenched
// Usage: {{Quenched}}
func parseTemplateQuenched(raw string) *api.Enchantment {
	const prefix = "{{Quenched"
	const suffix = "}}"
	const name = "Quenched"
	const notes = "Your Cold and Lightning spells apply the debuff portion of Quench with no save."

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: EarthenGuard
// Usage: {{EarthenGuard|(Type)|(Title)}}
func parseTemplateEarthenGuard(raw string) *api.Enchantment {
	const prefix = "{{EarthenGuard"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	eType := "Basic"
	if len(parts) > 0 {
		eType = strings.TrimSpace(parts[0])
	}
	if eType == "" {
		eType = "Basic"
	}

	title := ""
	if len(parts) > 1 {
		title = strings.TrimSpace(parts[1])
	}

	var name, notes string
	switch strings.ToLower(eType) {
	case "improved":
		name = "Improved Earthen Guard"
		notes = "When you are successfully attacked, there is a 15% chance that a Stone Skin will be cast on you."
	case "legendary":
		name = "Legendary Earthen Guard"
		notes = "This item in invested with the power of the earth. On being struck in melee, it has a chance to attempt to turn the target to stone, as the Flesh to Stone spell. A successful Fortitude DC: 100 save negates the effect."
	default:
		name = "Earthen Guard"
		notes = "When you are successfully attacked, there is a chance that a Stone Skin will be cast on you."
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: EternalFaith
// Usage: {{EternalFaith}}
// Per documentation, Eternal Faith grants three bonuses to Turn Undead mechanics:
//   - +2 to effective level for the turning check
//   - +2 to maximum Hit Dice turned
//   - +4 to total Hit Dice turned
//
// Note: While similar to {{Faith}}, this template doesn't specify 'Insight' and typically appears on older items.
func parseTemplateEternalFaith(raw string) []*api.Enchantment {
	const prefix = "{{EternalFaith"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	const note = "This ability helps only those who can Turn Undead. Your effective level while Turning is increased by 2, the maximum hit dice you can affect is increased by 2 and the total hit dice you can affect is increased by 4."

	return []*api.Enchantment{
		{
			Name:   "Turn Undead Level",
			Amount: "2",
			Notes:  new(note),
		},
		{
			Name:   "Turn Undead Maximum Hit Dice",
			Amount: "2",
		},
		{
			Name:   "Turn Undead Hit Dice",
			Amount: "4",
		},
	}
}

// Template: Unnatural
// Usage: {{Unnatural}}
func parseTemplateUnnatural(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Unnatural",
		Notes: new("Items so profane can have unintended consequences... This item will uncenter you and break your druid oath."),
	}
}

// Template: EmbraceoftheSpiderQueen
// Usage: {{EmbraceoftheSpiderQueen}}
func parseTemplateEmbraceoftheSpiderQueen(raw string) *api.Enchantment {
	const prefix = "{{EmbraceoftheSpiderQueen"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Fortitude (Poison) Saving Throws",
		Amount:    "-6",
		BonusType: "Penalty",
		Notes:     new("While Lolth protects her faithful from the venom of her spiders, non-evil beings who bear items sacred to her may feel her displeasure, suffering a -6 penalty to Fortitude saving throws versus Poison."),
	}
}

// Template: NightmareGuard
// Usage: {{NightmareGuard|(Type)}}
func parseTemplateNightmareGuard(raw string) *api.Enchantment {
	const prefix = "{{NightmareGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	eType := "Basic"
	if len(parts) > 0 {
		eType = strings.TrimSpace(parts[0])
	}
	if eType == "" {
		eType = "Basic"
	}

	var name, notes string
	switch strings.ToLower(eType) {
	case "legendary":
		name = "Legendary Nightmare Guard"
		notes = "On being hit or missed, this item has a chance to attempt to fear your enemy, ripping the life from them as they were struck with a Phantasmal Killer spell. Enemies must make a Will DC: 100 save versus the Fear or a Fortitude DC: 100 save versus Death or be slain. Even if they make their save versus Death, they may be still be feared."
	default:
		name = "Nightmare Guard"
		notes = "This item has a chance to terrorizing foes that hit you, applying a Mind Thrust effect, when you are hit by them (dealing 5d8 force damage, Will save vs. Enchantments negates). It may also expose your foes to their greatest fears, acting as a Phantasmal Killer spell."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: Dragontouched
// Usage: {{Dragontouched}}
func parseTemplateDragontouched(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Dragontouched",
		Notes: new("This mythical material was created by combining an unknown metal with ancient enchantments known only by the dragons. This material is said to enchant the wielder as if they were protected by +5 armor enchantment, and provide leather items with additional flexibility, and metal armors additional protection."),
	}
}

// Template: LostPurpose
// Usage: {{LostPurpose}}
func parseTemplateLostPurpose(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Lost Purpose",
		Notes: new("This item is missing some parts that made it unique. Perhaps you can fix that at a Cannith Repurposing Station."),
	}
}

// Usage: {{ScarabofProtectionWard}}
func parseTemplateScarabofProtectionWard() []*api.Enchantment {
	const note = "This effect absorbs negative energy, death and energy drain effect. It has 12 charges and does not recharge."
	return []*api.Enchantment{
		{
			Name:  "Absorption: Negative Energy (Limited Charges)",
			Notes: new(note),
		},
		{
			Name: "Absorption: Energy Drain (Limited Charges)",
		},
		{
			Name: "Absorption: Death Effects (Limited Charges)",
		},
	}
}

// Template: HasteGuard
// Usage: {{HasteGuard}}
func parseTemplateHasteGuard(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Haste Guard",
		Notes: new("When you are hit by enemies, there is a chance you will be hasted, quickening your attack and movement speed."),
	}
}

// Template: FreedomOfMovement
// Usage: {{FreedomOfMovement}}
func parseTemplateFreedomOfMovement(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Freedom of Movement",
		Notes: new("This item grants its wearer the ability to move and attack normally while under the influence of magic that impedes movement, such as paralysis, solid fog, slow and web."),
	}
}

// Template: FireShield
// Usage: {{FireShield|(Version)|(Is Miss-Guard)}}
// - Version: Fire, Hot, Cold, Ice
// - Is Miss-Guard: If present, it's a miss-guard
func parseTemplateFireShield(raw string) *api.Enchantment {
	const prefix = "{{FireShield"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	version := "Hot"
	isMissGuard := false

	if len(parts) > 0 {
		v := strings.TrimSpace(parts[0])
		if strings.EqualFold(v, "Cold") || strings.EqualFold(v, "Ice") {
			version = "Cold"
		} else {
			version = "Hot"
		}
	}

	if len(parts) > 1 {
		if strings.TrimSpace(parts[1]) != "" {
			isMissGuard = true
		}
	}

	name := "Fire Shield (" + version + ")"
	trigger := "successfully attacked"
	if isMissGuard {
		name += " Miss-Guard"
		trigger = "missed"
	}

	otherVersion := "Cold"
	if version == "Cold" {
		otherVersion = "Hot"
	}

	notes := fmt.Sprintf("When you are %s, there is a 10% chance that Fire Shield (%s) will be cast on you. If this effect activates while you have an active Fire Shield (%s) from another item source, they will nullify each other.", trigger, version, otherVersion)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: IncinerationGuard
// Usage: {{IncinerationGuard}}
func parseTemplateIncinerationGuard(raw string) *api.Enchantment {
	const prefix = "{{IncinerationGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Incineration Guard",
		Notes: new("When the wearer of this item is successfully attacked in melee, this destructive power occasionally comes to the surface, devastating enemies with massive fire damage."),
	}
}

// Template: SpellResonance
// Usage: {{SpellResonance}}
func parseTemplateSpellResonance(raw string) *api.Enchantment {
	const prefix = "{{SpellResonance"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Spell Resonance",
		Notes: new("When casting Force spells, there is a chance that you will gain a +20 alchemical bonus to Force Spell Power for 30 seconds. When casting Sonic spells, there is a chance that you will gain a +20 alchemical bonus to Sonic Spell Power 30 seconds."),
	}
}

// Template: MagmaSurgeGuard
// Usage: {{MagmaSurgeGuard|(Type)}}
// - Type: Normal (Blank), Legendary
func parseTemplateMagmaSurgeGuard(raw string) *api.Enchantment {
	const prefix = "{{MagmaSurgeGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	parts := strings.Split(inner, "|")
	magmaType := ""
	if len(parts) > 0 {
		magmaType = strings.TrimSpace(parts[0])
	}

	name := "Magma Surge Guard"
	if strings.EqualFold(magmaType, "Legendary") {
		name = "Legendary Magma Surge Guard"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("When the wearer of this item is successfully attacked in melee, superheated magma occasionally surges to the surface, slowing an enemy down and inflicting massive fire damage over time."),
	}
}

// Template: MagicalNull
// Usage: {{MagicalNull}}
func parseTemplateMagicalNull(raw string) *api.Enchantment {
	const prefix = "{{MagicalNull"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Arcane Spell Failure",
		BonusType: "Penalty",
		Notes:     new("This nullcloth that this is made from absorbs spell energies making it difficult for all spell casters, even Diving casters, to complete their spells. +15% Spell Failure chance."),
	}
}

// Template: Dampened
// Usage: {{Dampened}}
func parseTemplateDampened(raw string) *api.Enchantment {
	const prefix = "{{Dampened"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Dampened",
		Notes: new("This item has been in a wet environment for too long and its original power has been weakened. Combine it with a Token of Vulkoor at the Altar of Vulkoor in the Red Fens to restore it back to its former glory."),
	}
}

// Template: Vengeful
// Usage: {{Vengeful}}
func parseTemplateVengeful(raw string) *api.Enchantment {
	const prefix = "{{Vengeful"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Vengeful",
		Notes: new("When its wielder is hit in battle, this weapon has a 10% chance to cause him or her to become full of anger and go into a Rage."),
	}
}

// Template: TraceOfMadness
// Usage: {{TraceOfMadness}}
func parseTemplateTraceOfMadness(raw string) *api.Enchantment {
	const prefix = "{{TraceOfMadness"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Trace of Madness",
		Notes: new("You can almost hear faint, panicked voices when this item is close to you. Perhaps the latent power of this item's hint of madness could be brought out by some catalyst."),
	}
}

// Template: PowerDrain
// Usage: {{PowerDrain}}
func parseTemplatePowerDrain(raw string) *api.Enchantment {
	const prefix = "{{PowerDrain"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Maximum Spell Points",
		BonusType: "Penalty",
		Amount:    "30",
		Notes:     new("You lose 30 maximum spell points (or up to 60 if you are a Sorcerer or Favored Soul)."),
	}
}

// Template: FlawedShadowscaleArmor
// Usage: {{FlawedShadowscaleArmor}}
func parseTemplateFlawedShadowscaleArmor(raw string) *api.Enchantment {
	const prefix = "{{FlawedShadowscaleArmor"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Flawed Shadowscale Armor",
		Notes: new("This Shadowscale Armor is not at its full potential. Another run through the forge could improve it."),
	}
}

// Template: FromTheShadows
// Usage: {{FromTheShadows}}
func parseTemplateFromTheShadows(raw string) *api.Enchantment {
	const prefix = "{{FromTheShadows"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "From The Shadows",
		Notes: new("On Being Missed in Combat: Chance to do 10d6 Negative Energy Damage to the Attacker."),
	}
}

// Template: Axeblock
// Usage: {{Axeblock|(Enhancement Amount)|(Title)}}
func parseTemplateAxeblock(raw string) *api.Enchantment {
	const prefix = "{{Axeblock"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
	}
	parts := strings.Split(inner, "|")

	amountStr := ""
	if len(parts) > 0 {
		amountStr = strings.TrimSpace(parts[0])
	}

	// Double the amount for the description and name
	// If it's a number, double it. If it's "X", it's 10, so doubled is 20.
	doubledAmount := ""
	if amountStr == "X" {
		doubledAmount = "20"
	} else if amountStr != "" {
		if val, err := strconv.ParseFloat(amountStr, 64); err == nil {
			doubledAmount = fmt.Sprintf("%g", val*2)
		} else {
			// If it's not a number (e.g. wikitext), we can't easily double it.
			// But for Axeblock it's usually a number or X.
			doubledAmount = amountStr + " * 2"
		}
	}

	name := "Damage Reduction"
	if doubledAmount != "" {
		name += " (" + doubledAmount + "/Pierce, Bludgeon)"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(fmt.Sprintf("Passive Reduces physical damage taken by %s, except from Bludgeoning or Piercing weapons. (Damage Reduction: %s/Pierce, Bludgeon)", doubledAmount, doubledAmount)),
	}
}

// Template: ArcaneAugmentation
// Usage: {{ArcaneAugmentation|Spell Level|Augmentation Version|Spell Type}}
func parseTemplateBanishing(raw string) *api.Enchantment {
	const template = "Banishing"
	const prefix = "{{" + template
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(raw, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	var bonusType string
	if inner != "" {
		parts := strings.Split(inner, "|")
		bonusType = stripBrackets(parts[0])
	}

	var name string
	var amount string

	normalizedType := strings.ToLower(bonusType)
	switch normalizedType {
	case "improved":
		name = "Improved Banishing"
		amount = "150"
	case "sovereign":
		name = "Sovereign Banishing"
		amount = "250"
	case "weapons":
		name = "Banishing Weapons"
		amount = "150"
	case "fists":
		name = "Banishing Fists"
		amount = "150"
	default:
		name = "Banishing"
		amount = "100"
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: "On-vorpal",
	}
}

// Template: RadianceGuard
// Usage: {{RadianceGuard|(Title)}}
func parseTemplateRadianceGuard(raw string) *api.Enchantment {
	const template = "RadianceGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	title := ""
	if len(parts) >= 1 {
		title = strings.TrimSpace(parts[0])
	}

	name := "Radiance Guard"
	if title != "" {
		name = title
	}

	notes := "When the wearer of this item is successfully attacked in melee, the attacker has a chance of being hit by 4d6 points of light damage and has a chance of being blinded."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateLifeShield(raw string) *api.Enchantment {
	const template = "LifeShield"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	typeName := ""
	if len(parts) >= 1 {
		typeName = strings.TrimSpace(parts[0])
	}

	name := "Life Shield"
	var notes string
	if strings.ToLower(typeName) == "weapon" {
		name = "Life Shield (Weapon)"
		notes = "Every time you are hit while wielding a Life Shield weapon there is a 10% chance you gain 15 temporary hitpoints that last for up to 1 minute."
	} else {
		notes = "Every time you are hit while wearing a Life Shield item there is a 10% chance you gain 15 temporary hitpoints that last for up to 1 minute."
	}

	return &api.Enchantment{
		Name:   name,
		Amount: "15",
		Notes:  new(notes),
	}
}

// Template: PoisonGuard
// Usage: {{PoisonGuard|(Style)}}
func parseTemplatePoisonGuard(raw string) *api.Enchantment {
	const template = "PoisonGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	style := "Normal"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		style = strings.TrimSpace(parts[0])
	}

	var name string
	var dice string
	var dc string

	switch strings.ToLower(style) {
	case "greater":
		name = "Greater Poison Guard"
		dice = "2d6"
		dc = "28"
	case "legendary":
		name = "Legendary Poison Guard"
		dice = "3d6"
		dc = "100"
	default:
		name = "Poison Guard"
		dice = "1d6"
		dc = "20"
	}

	notes := fmt.Sprintf("This item carries a potent venom that may be contracted by enemies that hit you, dealing %s Strength damage. A successful Fortitude DC: %s will negate this effect.", dice, dc)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: DiseaseGuard
// Usage: {{DiseaseGuard|(Style)}}
func parseTemplateDiseaseGuard(raw string) *api.Enchantment {
	const template = "DiseaseGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	style := "Normal"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		style = strings.TrimSpace(parts[0])
	}

	var name string
	var dice string
	var dc string

	switch strings.ToLower(style) {
	case "greater":
		name = "Greater Disease Guard"
		dice = "2d6"
		dc = "28"
	case "legendary":
		name = "Legendary Disease Guard"
		dice = "3d6"
		dc = "100"
	default:
		name = "Disease Guard"
		dice = "1d6"
		dc = "20"
	}

	notes := fmt.Sprintf("This item carries the disease that may be contracted by enemies that hit you, dealing %s Constitution damage and may be contracted by enemies that hit you. A successful Fortitude DC: %s will negate this effect.", dice, dc)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: BrillianceGuard
// Usage: {{BrillianceGuard|(Title)}}
func parseTemplateBrillianceGuard(raw string) *api.Enchantment {
	const template = "BrillianceGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	name := "Brilliance Guard"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		name = strings.TrimSpace(parts[0])
	}

	notes := "This item is imbued with a brilliant, radiant power. When the wearer of this item is successfully attacked in melee, the attacker has a chance of becoming blinded."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: EarthgrabGuard
// Usage: {{EarthgrabGuard|(Type)}}
func parseTemplateEarthgrabGuard(raw string) *api.Enchantment {
	const template = "EarthgrabGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	isLegendary := false
	if len(parts) >= 1 && strings.EqualFold(strings.TrimSpace(parts[0]), "Legendary") {
		isLegendary = true
	}

	name := "Earthgrab Guard"
	if isLegendary {
		name = "Legendary Earthgrab Guard"
	}

	notes := "This item stores the implacable strength of the earth deep within. When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, calling on the earth to erupt from the ground and hold an enemy in place."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateFreezingIceGuard(raw string) *api.Enchantment {
	const template = "FreezingIceGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	isLegendary := false
	if len(parts) >= 1 && strings.EqualFold(strings.TrimSpace(parts[0]), "Legendary") {
		isLegendary = true
	}

	name := "Freezing Ice Guard"
	if isLegendary {
		name = "Legendary Freezing Ice Guard"
	}

	notes := "When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateStaggeringBlow(raw string) *api.Enchantment {
	const template = "StaggeringBlow"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	isUnstoppable := false
	if len(parts) >= 1 && strings.EqualFold(strings.TrimSpace(parts[0]), "Unstoppable") {
		isUnstoppable = true
	}

	name := "Staggering Blow"
	notes := "Staggering Blow: This item is enchanted to make your attacks send enemies reeling. When you roll a natural 20 on an attack with a melee weapon you will knock the target down unless it makes a DC 17 Balance check."

	if isUnstoppable {
		name = "Unstoppable Staggering Blow"
		notes = "Unstoppable Staggering Blow: On a natural 20 that is confirmed as a critical hit, this weapon will trip your opponent, forcing them to fall prone. There is no save against this effect."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateArcaneAugmentation(raw string) *api.Enchantment {
	const prefix = "{{ArcaneAugmentation"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
	}
	parts := strings.Split(inner, "|")

	spellLevel := ""
	if len(parts) > 0 {
		spellLevel = strings.TrimSpace(parts[0])
	}
	version := ""
	if len(parts) > 1 {
		version = strings.TrimSpace(parts[1])
	}
	spellType := "sorcerer or wizard"
	if len(parts) > 2 {
		if t := strings.TrimSpace(parts[2]); t != "" {
			spellType = t
		}
	}

	// Mapping Roman numerals to words for the notes
	levelWords := map[string]string{
		"I":    "first",
		"II":   "first through second",
		"III":  "first through third",
		"IV":   "first through fourth",
		"V":    "first through fifth",
		"VI":   "first through sixth",
		"VII":  "first through seventh",
		"VIII": "first through eighth",
		"IX":   "first through ninth",
	}

	word := levelWords[strings.ToUpper(spellLevel)]
	if word == "" {
		word = spellLevel // Fallback
	}

	bonus := "two"
	nameVersion := ""
	switch strings.ToLower(version) {
	case "lesser":
		bonus = "one"
		nameVersion = "Lesser "
	case "improved":
		bonus = "three"
		nameVersion = "Improved "
	}

	name := fmt.Sprintf("%sArcane Augmentation %s", nameVersion, spellLevel)
	return &api.Enchantment{
		Name:  name,
		Notes: new(fmt.Sprintf("%sArcane Augmentation %s: This item increases your caster level when casting %s level %s spells by %s.", nameVersion, spellLevel, word, spellType, bonus)),
	}
}

func parseTemplateDivineAugmentation(raw string) *api.Enchantment {
	const prefix = "{{DivineAugmentation"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
	}
	parts := strings.Split(inner, "|")

	spellLevel := ""
	if len(parts) > 0 {
		spellLevel = strings.TrimSpace(parts[0])
	}
	version := ""
	if len(parts) > 1 {
		version = strings.TrimSpace(parts[1])
	}

	// Mapping Roman numerals to words for the notes
	levelWords := map[string]string{
		"I":    "first",
		"II":   "first through second",
		"III":  "first through third",
		"IV":   "first through fourth",
		"V":    "first through fifth",
		"VI":   "first through sixth",
		"VII":  "first through seventh",
		"VIII": "first through eighth",
		"IX":   "first through ninth",
	}

	word := levelWords[strings.ToUpper(spellLevel)]
	if word == "" {
		word = spellLevel // Fallback
	}

	bonus := "two"
	nameVersion := ""
	switch strings.ToLower(version) {
	case "lesser":
		bonus = "one"
		nameVersion = "Lesser "
	case "improved":
		bonus = "three"
		nameVersion = "Improved "
	}

	name := fmt.Sprintf("%sDivine Augmentation %s", nameVersion, spellLevel)
	return &api.Enchantment{
		Name:  name,
		Notes: new(fmt.Sprintf("%sDivine Augmentation %s: This item increases your caster level when casting %s level Divine spells by %s.", nameVersion, spellLevel, word, bonus)),
	}
}

// Template: TouchOfImmortality
// Usage: {{TouchOfImmortality}}
func parseTemplateDreamVision(raw string) []*api.Enchantment {
	const template = "DreamVision"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
	}

	params := strings.Split(inner, "|")
	amount := "0"
	if len(params) > 0 && strings.TrimSpace(params[0]) != "" {
		amount = strings.TrimSpace(params[0])
	}

	return []*api.Enchantment{
		{
			Name:      "Attack Rolls",
			Amount:    amount,
			BonusType: "Competence",
			Notes:     new(fmt.Sprintf("Passive: +%s Competence bonus to Attack Rolls.", amount)),
		},
		{
			Name:      "Damage Rolls",
			Amount:    amount,
			BonusType: "Competence",
			Notes:     new(fmt.Sprintf("Passive: +%s Competence bonus to Damage Rolls.", amount)),
		},
		{
			Name:  "Ghost Touch",
			Notes: new("Your melee and ranged weapons are also able to bypass the miss chance for attacking Incorporeal enemies as if they had Ghost Touch."),
		},
	}
}

func parseTemplateTouchOfImmortality(raw string) []*api.Enchantment {
	const template = "TouchOfImmortality"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract parameters
	content := s[len(prefix) : len(s)-len(suffix)]
	params := strings.Split(content, "|")

	title := "Touch of Immortality"
	if len(params) > 1 && strings.TrimSpace(params[1]) != "" {
		title = strings.TrimSpace(params[1])
	}

	return []*api.Enchantment{
		{
			Name:      "Skill: Heal",
			Amount:    "20",
			BonusType: "Competence",
			Notes:     new("Passive: +20 Competence bonus to the Heal skill."),
		},
		{
			Name:      "Skill: Repair",
			Amount:    "20",
			BonusType: "Competence",
			Notes:     new("Passive: +20 Competence bonus to the Repair skill."),
		},
		{
			Name:  title,
			Notes: new("Passive: While this item is equipped, you regenerate 2d2 Hit Points every 15 seconds."),
		},
	}
}

// Template: AngelicGrace
// Usage: {{AngelicGrace}}
func parseTemplateAngelicGrace(raw string) *api.Enchantment {
	const template = "AngelicGrace"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Angelic Grace"
	notes := "When you are hit, 5% chance to gain 150 Temporary Hitpoints. This can only proc once every 10 seconds. These temporary Hitpoints last for 10 minutes or until used up, whichever is first."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: Nimbleness
// Usage: {{Nimbleness|(Type)}}
func parseTemplateAntimagicSpike(raw string) *api.Enchantment {
	const template = "AntimagicSpike"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Antimagic Spike"
	notes := "When scoring a critical hit on an enemy with your ranged or melee weapons, the target must make a Fortitude DC: 28 save or be unable to cast spells for a brief duration."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateMetalFatigue(raw string) *api.Enchantment {
	const template = "MetalFatigue"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Metal Fatigue"
	notes := "When you are damaged there is a small chance that you will become Exhausted."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateOverfocus(raw string) []*api.Enchantment {
	const template = "Overfocus"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	const notes = "Overfocus: This item helps you focus your attention, but it makes you somewhat oblivious to your surroundings, causing a -10 penalty to search and spot."

	return []*api.Enchantment{
		{
			Name:  "Overfocus",
			Notes: new(notes),
		},
		{
			Name:      "Skill: Search",
			Amount:    "-10",
			BonusType: "Penalty",
			Notes:     new("Passive: -10 Penalty to Search skill."),
		},
		{
			Name:      "Skill: Spot",
			Amount:    "-10",
			BonusType: "Penalty",
			Notes:     new("Passive: -10 Penalty to Spot skill."),
		},
	}
}

func parseTemplateTelekinesisGuard(raw string) *api.Enchantment {
	const template = "TelekinesisGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Telekinesis Guard"
	notes := "When enemies hit you they may be assaulted by these psychic forces, falling to the ground unless they make a Reflex DC: 35 save."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateWeakenUndead(raw string) *api.Enchantment {
	const template = "WeakenUndead"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Weaken Undead"
	notes := "Each time this weapon deals damage to an undead creature, the target loses 20% of its fortification for the next 20 seconds. This effect does not stack with itself."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateKickEmWhileTheyreDown(raw string) *api.Enchantment {
	const template = "KickEmWhileTheyreDown"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Kick 'Em While They're Down"
	notes := "You have 5 more attack and deal 5 more damage to enemies that are knocked down or stunned."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateRagingInferno(raw string) *api.Enchantment {
	const template = "RagingInferno"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Raging Inferno"
	notes := "Your True Rage effects (such as Barbarian or Bestial Rage) light you on fire, as if you were under the effects of a Fire Shield. The ability also protects you from Energy Drain for the duration."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateFleshmaker(raw string) *api.Enchantment {
	const template = "Fleshmaker"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Healing Amplification"
	notes := "Grants +20 enhancement bonus to Healing Amplification."

	return &api.Enchantment{
		Name:      name,
		Amount:    "20",
		BonusType: "Enhancement",
		Notes:     new(notes),
	}
}

// Template: Spearblock
// Usage: {{Spearblock|(Enhancement Amount)|(Title)}}
func parseTemplateSpearblock(raw string) *api.Enchantment {
	const prefix = "{{Spearblock"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
	}
	parts := strings.Split(inner, "|")

	amountStr := ""
	if len(parts) > 0 {
		amountStr = strings.TrimSpace(parts[0])
	}

	// Double the amount for the description and name
	// If it's a number, double it. If it's "X", it's 10, so doubled is 20.
	doubledAmount := ""
	if amountStr == "X" {
		doubledAmount = "20"
	} else if amountStr != "" {
		if val, err := strconv.ParseFloat(amountStr, 64); err == nil {
			doubledAmount = fmt.Sprintf("%g", val*2)
		} else {
			// If it's not a number (e.g. wikitext), we can't easily double it.
			doubledAmount = amountStr + " * 2"
		}
	}

	name := "Damage Reduction"
	if doubledAmount != "" {
		name += " (" + doubledAmount + "/Slash, Bludgeon)"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(fmt.Sprintf("Passive: Reduces physical damage taken by %s, except from Bludgeoning or Slashing weapons. (Damage Reduction: %s/Slash, Bludgeon)", doubledAmount, doubledAmount)),
	}
}

func parseTemplateFearsome() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Fearsome",
		Notes: new("This item causes those who strike the user to be overcome with terror, as from the Fear spell."),
	}
}

func parseTemplateSymbioticFlexibility() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Symbiotic Flexibility",
		Notes: new("A suit of armor that has this property has a maximum Dexterity bonus 4 higher than normal, and its armor check penalty is reduced by 4."),
	}
}

func parseTemplateDiehard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Diehard",
		Notes: new("If you are incapacitated while this item is equipped, it will automatically stabilize you as though you had the Diehard feat."),
	}
}

func parseTemplateSymbioticBacklash() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Symbiotic Backlash",
		Notes: new("This item is symbiotic and grants you benefits, but it also deals 2d6 extra damage to you when enemies roll a 20 on an attack against you."),
	}
}

func parseTemplateTheGoldenCurse(raw string) *api.Enchantment {
	const template = "TheGoldenCurse"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	parts := splitParams(inner)

	name := "The Golden Curse"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		name = strings.TrimSpace(parts[0])
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("When the wearer of this item is successfully attacked, occasionally an incredible power comes to the surface, shielding its wielder in solid gold to protect from further attacks."),
	}
}

func parseTemplateBlood() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Blood",
		Notes: new("The Warforged will benefit more from positive energy healing such as cure spells and potions (+20 Positive Healing Amplification) but will also be more subject to critical hits (-10% fortification)."),
	}
}

func parseTemplateAirGuard(raw string) *api.Enchantment {
	const template = "AirGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	parts := splitParams(inner)

	name := "Air Guard"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		name = strings.TrimSpace(parts[0])
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("When the user of this item is successfully attacked in melee, this power occasionally comes to the surface, knocking enemies over or speeding up the wearer with rushing winds."),
	}
}

func parseTemplateSonic(raw string) *api.Enchantment {
	const template = "Sonic"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	parts := splitParams(inner)

	typeName := ""
	if len(parts) >= 1 {
		typeName = strings.TrimSpace(parts[0])
	}

	dieCount := "1"
	if len(parts) >= 2 && strings.TrimSpace(parts[1]) != "" {
		dieCount = strings.TrimSpace(parts[1])
	}

	dieSides := "6"
	if len(parts) >= 3 && strings.TrimSpace(parts[2]) != "" {
		dieSides = strings.TrimSpace(parts[2])
	}

	title := ""
	if len(parts) >= 4 {
		title = strings.TrimSpace(parts[3])
	}

	name := ""
	notes := ""

	switch strings.ToLower(typeName) {
	case "screaming":
		if len(parts) < 2 {
			dieCount = "1"
		}
		dice := ParseTemplateDice(fmt.Sprintf("{{Dice||%s|%s}}", dieCount, dieSides))
		name = fmt.Sprintf("Sonic Damage %s", dice.Raw)
		notes = fmt.Sprintf("Screaming weapons emit a piercing screech whenever they are used to make a successful attack. This screech does an additional %s sonic damage.", dice.Raw)
	case "shrieking":
		if len(parts) < 2 {
			dieCount = "2"
		}
		dice := ParseTemplateDice(fmt.Sprintf("{{Dice||%s|%s}}", dieCount, dieSides))
		name = fmt.Sprintf("Sonic Damage %s", dice.Raw)
		notes = fmt.Sprintf("Shrieking weapons emit a piercing screech whenever they are used to make a successful attack. This screech does an additional %s sonic damage.", dice.Raw)
	case "wailing":
		if len(parts) < 2 {
			dieCount = "3"
		}
		dice := ParseTemplateDice(fmt.Sprintf("{{Dice||%s|%s}}", dieCount, dieSides))
		name = fmt.Sprintf("Sonic Damage %s", dice.Raw)
		notes = fmt.Sprintf("Wailing weapons emit a piercing screech whenever they are used to make a successful attack. This screech does an additional %s sonic damage.", dice.Raw)
	case "roaring":
		if len(parts) < 2 {
			dieCount = "2"
		}
		dice := ParseTemplateDice(fmt.Sprintf("{{Dice||%s|%s}}", dieCount, dieSides))
		name = fmt.Sprintf("Sonic Damage %s", dice.Raw)
		notes = fmt.Sprintf("This weapon causes targets to become shaken and, on a critical hit, does %s sonic damage to the target.", dice.Raw)
	case "improved roaring":
		if len(parts) < 2 {
			dieCount = "2"
		}
		dice := ParseTemplateDice(fmt.Sprintf("{{Dice||%s|%s}}", dieCount, dieSides))
		name = fmt.Sprintf("Sonic Damage %s", dice.Raw)
		notes = fmt.Sprintf("This weapon causes targets to become shaken and, on a critical hit, does %s sonic damage to the target.", dice.Raw)
	case "cacophony":
		name = "Cacophony"
		notes = "This weapon stores the power of a hundred blasts of sound within. Occasionally, this resonating power comes to the surface, devastating enemies with massive sonic damage."
	case "cacophonic guard":
		name = "Cacophonic Guard"
		notes = "This item stores the power of a hundred blasts of sound within. When the wearer of this item is successfully attacked in melee, this resonating power occasionally comes to the surface, devastating enemies with massive sonic damage."
	case "shrieking bolt":
		if len(parts) < 2 {
			dieCount = "10"
		}
		dice := ParseTemplateDice(fmt.Sprintf("{{Dice||%s|%s}}", dieCount, dieSides))
		name = fmt.Sprintf("Sonic Damage %s", dice.Raw)
		notes = fmt.Sprintf("This item resonates with sonic energy. On ranged attacks, on an attack roll of 20 which is confirmed as a critical hit it will punish the target with a blast of sound (%s sonic damage). A successful Fortitude DC 22 save reduces this damage by half.", dice.Raw)
	case "greater shrieking bolt":
		dice := ParseTemplateDice("{{Dice||20|6}}")
		name = fmt.Sprintf("Sonic Damage %s", dice.Raw)
		notes = fmt.Sprintf("This item resonates with sonic energy. On ranged attacks, on an attack roll of 20 which is confirmed as a critical hit it will punish the target with a blast of sound (%s sonic damage).", dice.Raw)
	case "thundering":
		name = "Thundering"
		notes = "A thundering weapons creates a cacophonous roar when striking a successful critical hit. A thundering weapon deals an extra 1d8 points of sonic damage upon a successful critical hit with a weapon that has a x2 critical multiplier, an extra 2d8 for a x3 multiplier, and an extra 3d8 for x4 multiplier."
	case "roar":
		name = "Roar"
		notes = "This item emits a frightening roar when melee attackers score a critical hit on the wearer, causing them to resist or be shaken with fear."
	case "thunderclap":
		name = "Thunderclap"
		notes = "This potent ability will in certain cases send forth a cacophony of sound. On an attack roll of 20, which is confirmed as a critical hit, the target may suffer the following conditions: Stunned, Knockdown, and Disorient."
	default:
		name = "Sonic"
		notes = "Deals sonic damage."
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: &notes,
	}
}

func parseTemplateNimbleness(raw string) *api.Enchantment {
	const template = "Nimbleness"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	typeName := ""
	if len(parts) >= 1 {
		typeName = strings.TrimSpace(parts[0])
	}

	name := "Armor Check Penalty Reduction"
	amount := 2
	bonus := "Stacking"
	notes := "A suit of armor that has this property has its armor check penalty reduced by 2."

	switch strings.ToLower(typeName) {
	case "greater":
		amount = 4
		notes = "A suit of armor that has this property has a maximum Dexterity bonus 2 higher than normal, and its armor check penalty is reduced by 4."
	case "superior":
		amount = 4
		notes = "A suit of armor that has this property has a maximum Dexterity bonus 4 higher than normal, and its armor check penalty is reduced by 4."
	case "epic":
		amount = 4
		notes = "A suit of armor that has this property has a maximum Dexterity bonus 6 higher than normal, and its armor check penalty is reduced by 4."
	}

	return &api.Enchantment{
		Name:      name,
		BonusType: bonus,
		Amount:    fmt.Sprintf("%d", amount),
		Notes:     new(notes),
	}
}

func parseTemplateNearlyFinished() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Nearly Finished",
		Notes: new("Bring it to a Cannith Reforging Station and combine it with melted materials to activate this item's set bonus trigger."),
	}
}

func parseTemplateCannithCombatInfusion() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Cannith Combat Infusion",
		Notes: new("For the next ten seconds, this will grant a +4 Alchemical bonus to Strength, Constitution and Dexterity, as well as a 5% Alchemical bonus to your chance to doublestrike and a +2 Alchemical bonus to Armor Class."),
	}
}

func parseTemplateElementalEnergy(raw string) *api.Enchantment {
	const template = "ElementalEnergy"
	const prefix = "{{" + template
	const suffix = "}}"

	enchantmentName := template

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	rawType := ""
	if len(parts) >= 1 {
		rawType = strings.TrimSpace(parts[0])
	}

	rawEnergy := ""
	if len(parts) >= 2 {
		rawEnergy = strings.TrimSpace(parts[1])
	}

	value := "+10"
	switch strings.ToLower(rawType) {
	case "improved":
		enchantmentName = "Improved " + enchantmentName
		value = "+15"
	case "greater":
		enchantmentName = "Greater " + enchantmentName
		value = "+20"
	case "legendary":
		enchantmentName = "Legendary " + enchantmentName
		value = "+150"
	}

	energy := "hit points"
	name := "Maximum Hit Points"
	switch strings.ToLower(rawEnergy) {
	case "spell points", "spellpoints", "sp":
		energy = "spell points"
		name = "Maximum Spell Points"
	}

	notes := fmt.Sprintf("This items gives you a %s bonus to your maximum %s. This stacks with all bonuses except %s.", value, energy, enchantmentName)

	return &api.Enchantment{
		Name:   name,
		Amount: value,
		Notes:  new(notes),
	}
}

func parseTemplateLightningGuard(raw string) *api.Enchantment {
	const template = "LightningGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	magnitude := ""
	if len(parts) >= 1 {
		magnitude = strings.TrimSpace(parts[0])
	}

	num := romanToInt(magnitude)
	dice := ""
	if num > 0 {
		dice = fmt.Sprintf("%dd4", num)
	}

	name := "Lightning Guard"
	if magnitude != "" {
		name = fmt.Sprintf("Lightning Guard %s", magnitude)
	}

	notes := "On being Hit in Melee: Electric damage to your attacker."
	if dice != "" {
		notes = fmt.Sprintf("On being Hit in Melee: %s Electric damage to your attacker.", dice)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSecretDoorDetection() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Secret Door Detection",
		Notes: new("This item grants the ability to reveal secret and hidden doors."),
	}
}

func parseTemplateUndersun() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Undersun",
		Notes: new("While this item is equipped in areas with Underdark radiation, your sight is augmented to allow you to discern your surroundings even with little or no light."),
	}
}

func parseTemplateEchoesof2006() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Echoes of 2006",
		Notes: new("Take a trip into the past!"),
	}
}

func parseTemplateAlmostThere() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Almost There",
		Notes: new("Bring it to a Cannith Reforging Station and combine it with melted materials to restore this item to its full potential."),
	}
}

func parseTemplateBlackscaleFerocity() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Blackscale Ferocity",
		Notes: new("Killing enemies may cause you to fall into a ferocious rage, granting you the benefits of the Haste spell."),
	}
}

func parseTemplateExtraLayOnHands(raw string) *api.Enchantment {
	const template = "ExtraLayOnHands"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	count := ""
	if len(parts) >= 1 {
		count = strings.TrimSpace(parts[0])
	}

	name := "Lay on Hands Charges"
	if count != "" {
		name = fmt.Sprintf("Extra Lay on Hands +%s", count)
	}

	notes := fmt.Sprintf("You have +%s Lay on Hands charges.", count)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSwimLikeAFish() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Swim like a Fish",
		Notes: new("While this item is equipped and you are swimming, you gain the Evasion feat. Evasion causes you to take no damage on a successful Reflex saving throw against an effect which would normally allow half damage on a successful Reflex save."),
	}
}

func parseTemplateConfoundingEnchantment() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Confounding Enchantment",
		Notes: new("The shifting nature of the magic that enchants this belt makes the effects hard to determine."),
	}
}

func parseTemplateLifesealed(raw string) []*api.Enchantment {
	const template = "Lifesealed"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	amount := ""
	bonusType := "Enhancement"

	if len(parts) >= 1 {
		amount = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		bonusType = strings.TrimSpace(parts[1])
		if bonusType == "" {
			bonusType = "Enhancement"
		}
	}

	var results []*api.Enchantment

	// 1. Immunity: Magical Death Effects
	results = append(results, &api.Enchantment{
		Name:  "Immunity: Magical Death Effects",
		Notes: new("You are immune to magical effects that cause instant death."),
	})

	// 2. Negative Energy Absorption
	name := "Negative Energy Absorption"
	if amount != "" {
		name = fmt.Sprintf("Negative Energy Absorption %s%", amount)
	}

	notes := fmt.Sprintf("You have a %s% %s bonus to Negative Energy Absorption.", amount, bonusType)

	results = append(results, &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		Notes:     new(notes),
	})

	return results
}

func parseTemplateLightningStormGuard(raw string) *api.Enchantment {
	const template = "LightningStormGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	itemType := ""
	if len(parts) >= 1 {
		itemType = strings.TrimSpace(parts[0])
	}

	name := "Lightning Storm Guard"
	notes := "This item stores the power of a volatile thunderstorm deep within. Occasionally, this dynamic power comes to the surface, devastating enemies with a massive lightning strike."

	if strings.EqualFold(itemType, "legendary") {
		name = "Legendary Lightning Storm Guard"
		notes = "When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, striking the attacker with an incredible amount of electrical force."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateDemonicCurse(raw string) *api.Enchantment {
	const template = "DemonicCurse"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	title := ""
	if len(parts) >= 1 {
		title = strings.TrimSpace(parts[0])
	}

	name := "Demonic Curse"
	if title != "" {
		name = title
	}
	notes := "Each time you are hit in melee combat there is a chance that your attacker will be Cursed."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSlaveLordsBlank(raw string) []*api.Enchantment {
	const template = "SlaveLordsBlank"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	version := ""
	if len(parts) >= 1 {
		version = strings.TrimSpace(parts[0])
	}

	namePrefix := ""
	if strings.EqualFold(version, "Legendary") {
		namePrefix = "Legendary "
	}

	return []*api.Enchantment{
		{
			Name:  namePrefix + "Slaver's Prefix Slot",
			Notes: new("Apply a Slaver's shard to this item."),
		},
		{
			Name:  namePrefix + "Slaver's Suffix Slot",
			Notes: new("Apply a Slaver's shard to this item."),
		},
		{
			Name:  namePrefix + "Slaver's Extra Slot",
			Notes: new("Apply a Slaver's shard to this item."),
		},
		{
			Name:  namePrefix + "Slaver's Bonus Slot",
			Notes: new("Apply a Slaver's shard to this item."),
		},
		{
			Name:  "Against the Slave Lords Set Bonus",
			Notes: new("An Against the Slave Lords Set Bonus can be applied to this item."),
		},
		{
			Name:  namePrefix + "Slaver's Augment Slot",
			Notes: new("Apply a Slaver's shard to this item."),
		},
	}
}

func parseTemplateDemonicRetribution(raw string) *api.Enchantment {
	const template = "DemonicRetribution"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	title := ""
	if len(parts) >= 1 {
		title = strings.TrimSpace(parts[0])
	}

	name := "Demonic Retribution"
	if title != "" {
		name = title
	}
	notes := "Each time you are hit in melee combat there is a chance that a demonic force will strike back at your attacker hitting them with an Inflict Moderate Wounds spell."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateTetZik(raw string) *api.Enchantment {
	const template = "Tet-zik"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	version := ""
	if len(parts) >= 1 {
		version = strings.TrimSpace(parts[0])
	}

	name := "Tet-zik, The Enlightened Change"
	var notes string

	if strings.EqualFold(version, "Legendary") {
		notes = "Whispers of the ancients grant you the ancient martial secrets of the Thri-Kreen. Your elemental monk stances grant additional bonuses.\n" +
			"* If in Wind stance:\n" +
			"** Insightful Jump +20: +20 Insight bonus to Jump.\n" +
			"** Insightful Tumble +20: +20 Insight bonus to Tumble.\n" +
			"** Sneak Attack +5: Provides a +5 to attack bonus and a +8 bonus to damage for any attack that would qualify as a Sneak Attack, even if the wielder is not a Rogue.\n" +
			"** Sneak Attack Damage +5: Provides a +5 to damage for any attack that would qualify as a Sneak Attack, even if the wielder is not a Rogue.\n" +
			"* If in Sun stance:\n" +
			"** Superior Reinforced Fists: This item surrounds your fists with kinetic energy. Your unarmed damage is boosted by one and a half dice.\n" +
			"* If in Mountain stance:\n" +
			"** Physical Sheltering +10: Passive: +10 Enhancement bonus to Physical Resistance Rating.\n" +
			"** Seeker +5: +5 Enhancement bonus to confirm critical hits, and damage (before multiplier) on critical hits.\n" +
			"* If in Ocean stance:\n" +
			"** Magical Resistance Rating Cap +10: Passive: +10 Enhancement bonus to Magical Resistance Rating Cap.\n" +
			"** Luck Accuracy +5: +5 Luck bonus to your attack rolls.\n" +
			"** Luck Deadly +5: +5 Luck bonus to weapon damage."
	} else {
		notes = "Whispers of the ancients grant you the ancient martial secrets of the Thri-Kreen. Your elemental monk stances grant additional bonuses.\n" +
			"* If in Wind stance:\n" +
			"** Insightful Jump +10: +10 Insight bonus to Jump.\n" +
			"* If in Sun stance:\n" +
			"** Insightful Healing Amplification +50: Passive: +50 Insight Bonus to Positive Healing Amplification, which amplifies incoming Positive healing.\n" +
			"* If in Mountain stance:\n" +
			"** Reinforced Fists: This item surrounds your fists with kinetic energy. Your unarmed damage is boosted by one half die.\n" +
			"* If in Ocean stance:\n" +
			"** On unarmed confirmed vorpal strikes, delivers a poison that paralyzes the target (Fortitude DC: 17 negates) and inflicts 1d6 Dexterity damage (Fortitude DC: 17 negates, increased 50% if paralysis is successful or if the mob is already helpless). The dexterity damage and paralysis effects are saved against separately."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateTemporarySpellPoints(raw string) *api.Enchantment {
	const template = "TemporarySpellPoints"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	spells := ""
	pointsGained := ""
	duration := ""
	triggerTimer := ""
	title := ""

	if len(parts) >= 1 {
		spells = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		pointsGained = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		duration = strings.TrimSpace(parts[2])
	}
	if len(parts) >= 4 {
		triggerTimer = strings.TrimSpace(parts[3])
	}
	if len(parts) >= 5 {
		title = strings.TrimSpace(parts[4])
	}

	name := "Temporary Spell Points"
	if title != "" {
		name = title
	}

	notes := fmt.Sprintf("Whenever you cast a %s spell, you gain +%s Temporary Spell Points that last for %s seconds. This can only trigger once every %s seconds.", spells, pointsGained, duration, triggerTimer)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateWondrousCraftsmanship(raw string) *api.Enchantment {
	const template = "WondrousCraftsmanship"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	amount := ""

	if len(parts) >= 1 {
		amount = strings.TrimSpace(parts[0])
	}

	name := "Wondrous Craftsmanship"
	notes := fmt.Sprintf("+%s Total Enhancement Value.", amount)

	return &api.Enchantment{
		Name:   name,
		Amount: amount,
		Notes:  new(notes),
	}
}

func parseTemplateDruidicSurvivalMastery(raw string) *api.Enchantment {
	const template = "DruidicSurvivalMastery"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Druidic Survival Mastery"
	notes := "While in Wild Shape, you receive a Primal bonus to damage equal to half the number of Wilderness Lore feats you have."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplatePowerStore(raw string) *api.Enchantment {
	const template = "PowerStore"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	name := "Spell Point Cost Reduction"
	notes := "Any spellcaster can use this energy to partially power their spells. All spells cast while holding this item receive an enhancement bonus of -10% spell point cost."

	return &api.Enchantment{
		Name:      name,
		BonusType: "Enhancement",
		Amount:    "10%",
		Notes:     new(notes),
	}
}

func parseTemplateFeedsOffMadness() *api.Enchantment {
	name := "Feeds Off Madness"
	notes := "This item greedily feeds off the aura of madness related to certain Xoriat effects. The more of these the wearer is affected by, the stronger the item will become."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSunAndStars() *api.Enchantment {
	name := "Sun and Stars"
	notes := "When you activate Hand of Healing or Hand of Harm from the Shintao enhancement tree, you benefit from increased Melee Power and Positive Healing Amplification for a short time."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateMakersTouch() *api.Enchantment {
	name := "Maker's Touch"
	notes := "Casting a Repair spell on yourself of allies leaves a lingering defensive buff that increases the AC and Physical Resistance Rating of your target by +3 for 12 seconds."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateAutoRepair(raw string) *api.Enchantment {
	const template = "AutoRepair"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	repairType := ""
	if len(parts) >= 1 {
		repairType = strings.TrimSpace(parts[0])
	}

	name := "Auto-Repair"
	spell := "Repair Moderate Damage"

	switch strings.ToLower(repairType) {
	case "improved":
		name = "Improved Auto-Repair"
		spell = "Repair Serious Damage"
	case "greater":
		name = "Greater Auto-Repair"
		spell = "Reconstruct"
	}

	notes := fmt.Sprintf("%s: This item has a small percentage chance to cast a %s spell on you when you take damage.", name, spell)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateHallowed(raw string) *api.Enchantment {
	const template = "Hallowed"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	amount := "2"
	bonusType := "Enhancement"

	if len(parts) >= 1 {
		p0 := strings.TrimSpace(parts[0])
		if p0 != "" {
			amount = p0
		}
	}
	if len(parts) >= 2 {
		p1 := strings.TrimSpace(parts[1])
		if p1 != "" {
			bonusType = p1
		}
	}

	name := "Turn Undead Maximum Dice"
	notes := fmt.Sprintf("%s: An item with this quality assists only wearers who have the ability to turn undead. Hallowed items provide a +%s %s bonus to the maximum Hit Dice of undead turned.", name, amount, bonusType)

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		Notes:     new(notes),
	}
}

func parseTemplateReaping(raw string) *api.Enchantment {
	const template = "Reaping"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	element := ""
	amount := ""
	lifetime := ""

	if len(parts) >= 1 {
		element = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		amount = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		lifetime = strings.TrimSpace(parts[2])
	}

	normalizedElement := ""
	switch strings.ToLower(element) {
	case "acid":
		normalizedElement = "Acid"
	case "fire":
		normalizedElement = "Fire"
	case "cold":
		normalizedElement = "Cold"
	case "electricity":
		normalizedElement = "Electric"
	default:
		normalizedElement = element
	}

	name := fmt.Sprintf("Elemental Resistance: %s (Temp)", normalizedElement)
	notes := fmt.Sprintf("While this item is equipped, any killing blows you strike against enemies grants you +%s %s resistance for %s seconds. Slaying weaker opponents has a reduced change of producing this effect.", amount, element, lifetime)

	return &api.Enchantment{
		Name:   name,
		Amount: amount,
		Notes:  new(notes),
	}
}

func parseTemplateGreaterDispellingGuard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Greater Dispelling Guard",
		Notes: new("When the wearer is hit in melee it will apply a Greater Dispel Magic effect to the attacker, stripping away its protective spells."),
	}
}

func parseTemplateHalcyonMind() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Halcyon Mind",
		Notes: new("Halcyon Mind: When you are damaged by an attack: 5% chance to gain 15 Temporary Spell Points. These Temporary Spell Points last for one minute, or until consumed to cast a spell."),
	}
}

func parseTemplateAnchoring() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Anchoring",
		Notes: new("Anchoring: This item grants its wearer immunity to effects that are time based or involve planar displacement."),
	}
}

func parseTemplateSinkLikeaBrick() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Sink Like a Brick",
		Notes: new("Sink Like a Brick: These boots are made of concrete. You sink in water."),
	}
}

func parseTemplateBloodyThorns() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Bloody Thorns",
		Notes: new("Bloody Thorns: This powerful item is a dangerous weapon to those well-versed in Nature. You receive a Primal bonus to Damage for every four of your Wilderness Lore feats."),
	}
}

func parseTemplateStonePrisonGuard(raw string) *api.Enchantment {
	const template = "StonePrisonGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	itemType := ""
	if len(parts) >= 1 {
		itemType = strings.TrimSpace(parts[0])
	}

	name := "Stone Prison Guard"
	notes := "This item has a chance to turn those who hit you to stone. A successful Fortitude DC: 17 save will negate this effect."

	if strings.EqualFold(itemType, "Lesser") {
		name = "Lesser Stone Prison Guard"
		notes = "This item has a small chance to turn those who hit you to stone. A successful Fortitude DC: 17 save will negate this effect."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateIceBarrier(raw string) *api.Enchantment {
	name := "Ice Barrier"
	amount := "15"

	if strings.Contains(raw, "|Legendary") {
		name = "Legendary Ice Barrier"
		amount = "150"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(fmt.Sprintf("When struck in combat, there is a small chance you will be shielded by conjured ice, granting you +%s Temporary Hit Points. These Temporary Hit Points last 1 minute or until depleted.", amount)),
	}
}

func parseTemplateVulnerability(raw string) *api.Enchantment {
	parts := strings.Split(strings.Trim(raw, "{}"), "|")
	element := ""
	percentage := "1"

	if len(parts) > 1 {
		element = strings.TrimSpace(parts[1])
	}
	if len(parts) > 2 {
		percentage = strings.TrimSpace(parts[2])
	}
	if percentage == "" {
		percentage = "1"
	}

	name := "Vulnerability"
	if element != "" {
		name = element + " Vulnerability"
	}

	vulnerableType := "Vulnerable"
	if element != "" {
		vulnerableType = element + " Vulnerable"
	}

	notes := fmt.Sprintf("On Hit: Applies a stack of %s (%s% more damage for 3 seconds. This effect stacks up to 20 times, and loses one stack on expiration.). This effect may only occur on-hit once a second.", vulnerableType, percentage)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateFrostbite() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Frostbite",
		Notes: new("Frostbite: On Hit: Applies a stack of Vulnerable (1% more damage for 3 seconds. This effect stacks up to 20 times, and loses one stack on expiration.). This effect may only occur on-hit once every two seconds.\nOn Vorpal: Applies a stack of Lethargy (-1 to all Saving Throws. Non-bosses also move and attack 5% slower. This effect stacks up to 5 times.)"),
	}
}

func parseTemplateSubtleTarget() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Subtle Target",
		Notes: new("Once per minute, when you use Diplomacy, you gain a -100% Profane bonus to threat generation with weapon strikes for 20 seconds."),
	}
}

func parseTemplateTransmutedPlatinum(raw string) *api.Enchantment {
	name := "Transmuted Platinum"
	dc := "35"
	notes := "This weapon, made of transmuted platinum, is slightly magically unstable, and has a chance to transfer its magic to those it strikes. Struck enemies have a small chance to turn into transmuted platinum, preventing all movement, with a DC of 35 negating this effect."

	if strings.Contains(raw, "|EpicGuard") {
		name = "Transmuted Platinum Guard (Epic)"
		notes = "This glorious item shines with a warm magic, and has a chance of freezing your attackers in a cage of Transmuted Platinum."
	} else if strings.Contains(raw, "|Guard") {
		name = "Transmuted Platinum Guard"
		notes = "This glorious item shines with a warm magic, and has a chance of freezing your attackers in a cage of Transmuted Platinum."
	} else if strings.Contains(raw, "|Epic") {
		name = "Transmuted Platinum (Epic)"
		dc = "70"
		notes = fmt.Sprintf("This weapon, made of transmuted platinum, is slightly magically unstable, and has a chance to transfer its magic to those it strikes. Struck enemies have a small chance to turn into transmuted platinum, preventing all movement, with a DC of %s negating this effect.", dc)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateNightsinger() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Nightsinger",
		Notes: new("5% Chance on Sonic Spell Hit: Target it Blinded for 6 Seconds."),
	}
}

func parseTemplateRagingResilience() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Fortitude Saving Throws (While Raged)",
		Amount:    "4",
		BonusType: "Rage",
		Notes:     new("While Raged, +4 Rage bonus to Fortitude Saves."),
	}
}

func parseTemplateChaoticCurse() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Chaotic Curse",
		Notes: new("The curse on this item is so powerful it can be transferred to any creature that dares touch the wearer. The rents in the fabric of the underlying cloth has made the curse unstable and it can reverse itself. Note especially that while the wearer is partially shielded he is not entirely immune to this effect."),
	}
}

func parseTemplateStickyGooGuard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Sticky Goo Guard",
		Notes: new("This item has a chance of encasing a creature in sticky goo, much like an attack of a mimic. It reduces the creatures move speed and attack speed."),
	}
}

func parseTemplateSpikeGuard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Spike Guard",
		Notes: new("On Being Hit in Melee: 5% chance to do 10d20+500 Piercing Damage to the Attacker."),
	}
}

func parseTemplateChaosGuard() []*api.Enchantment {
	return []*api.Enchantment{
		{
			Name:      "Armor Class",
			Amount:    "2",
			BonusType: "Deflection",
			Notes:     new("The bearer of this item gains +2 Deflection bonus to AC from Chaotic enemies."),
		},
		{
			Name:      "Saves vs Chaotic Enemies",
			Amount:    "2",
			BonusType: "Resistance",
			Notes:     new("The bearer of this item gains +2 Resistance bonus to saves from Chaotic enemies."),
		},
	}
}

func parseTemplateVengefulFury() []*api.Enchantment {
	return []*api.Enchantment{
		{
			Name:      "Doublestrike (On Taking Damage)",
			Amount:    "12%",
			BonusType: "Enhancement",
			Notes:     new("On Taking Damage: Gain a 12% Enhancement Bonus to Doublestrike."),
		},
		{
			Name:      "Attack Bonus (On Taking Damage)",
			Amount:    "4",
			BonusType: "Rage",
			Notes:     new("On Taking Damage: Gain a +4 Rage Bonus to your Attack Bonus."),
		},
	}
}

func parseTemplateAdditionalDamageType(raw string) *api.Enchantment {
	const template = "AdditionalDamageType"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	damageType := ""
	attackType := ""
	title := ""

	if len(parts) >= 1 {
		damageType = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		attackType = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		title = strings.TrimSpace(parts[2])
	}

	name := title
	if name == "" {
		// Logic to determine default name
		if strings.EqualFold(attackType, "Ranged") && strings.EqualFold(damageType, "Bludgeon") {
			name = "Blunted Ammunition"
		} else if strings.EqualFold(attackType, "Melee") {
			if strings.EqualFold(damageType, "Pierce") {
				name = "Damage Type: Spiked"
			} else if strings.EqualFold(damageType, "Pierce Damage") {
				name = "Damage Type: Piercing"
			} else if strings.EqualFold(damageType, "Silver") {
				name = "Pierce Silver"
			} else if strings.EqualFold(damageType, "Adamantine") {
				name = "Damage Type: Adamantine"
			} else {
				name = "Damage Type: " + damageType // Fallback
			}
		} else {
			name = "Damage Type: " + damageType // Fallback
		}
	}

	// Logic to determine notes
	var notes string
	if strings.EqualFold(attackType, "Ranged") {
		notes = fmt.Sprintf("The ammunition fired by this weapon deals %s damage in addition to its other damage types.", strings.ToLower(damageType))
		// Special case from example: Bludgeon -> blunt
		if strings.EqualFold(damageType, "Bludgeon") {
			notes = "The ammunition fired by this weapon deals blunt damage in addition to its other damage types."
		}
	} else if strings.EqualFold(attackType, "Melee") {
		// Specific cases for Melee
		if strings.EqualFold(damageType, "Pierce") {
			notes = "This weapon is studded with vicious spikes, causing to deal piercing damage in addition to its normal damage types."
		} else if strings.EqualFold(damageType, "Pierce Damage") {
			notes = "On Damage: 10% Chance of dealing an additional 10d6 Piercing Damage."
		} else if strings.EqualFold(damageType, "Silver") {
			notes = "Provides the Pierce Silver feat, allowing your equipped weapons to break Silver DR."
		} else if strings.EqualFold(damageType, "Adamantine") {
			notes = "Your weapons bypass Adamantine Damage Reduction."
		} else {
			notes = fmt.Sprintf("This weapon is studded with vicious spikes, causing to deal %s damage in addition to its normal damage types.", strings.ToLower(damageType))
		}
	} else {
		// Fallback notes
		notes = fmt.Sprintf("This weapon deals %s damage in addition to its other damage types.", strings.ToLower(damageType))
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSpikeStudded() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Spike-Studded",
		Notes: new("This item is reinforced with metal studs that improve your unarmed strikes. Your unarmed strikes do an additional 1d4 piercing damage."),
	}
}

func parseTemplateBattleScarred() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Battle-Scarred",
		Notes: new("This item has obviously seen use in many fights. It is chipped and scratched, but perhaps in the future there will be a way to restore it to its former glory."),
	}
}

func parseTemplateGlassJawStrike() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Glass Jaw Strike",
		Notes: new("While wearing this item, when you roll a natural 20 on an unarmed attack, you will deal a tremendous blow to your target that will daze it (as the Sap ability) and may knock it down as well."),
	}
}

func parseTemplateLightningStrike(raw string) *api.Enchantment {
	const template = "LightningStrike"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	strikeType := ""
	if len(parts) >= 1 {
		strikeType = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	name := "Lightning Strike"
	var notes string

	switch strikeType {
	case "sovereign":
		name = "Sovereign Lightning Strike"
		notes = "On any vorpal strike that is confirmed as a critical hit, this item will strike your foe with a tremendous burst of lightning. A successful 100 DC: Reflex save reduces this by half."
	case "weapon":
		notes = "While wearing this item, your melee and ranged weapons gain Hit Effect: This item stores the power of a volatile thunderstorm deep within. Occasionally, this dynamic power comes to the surface, devastating enemies with a massive lighting strike."
	default:
		notes = "Occasionally, this dynamic power comes to the surface, devastating enemies with a massive lightning strike."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateRepairSystems() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Repair Systems",
		Notes: new("This item gradually repairs constructs and living constructs."),
	}
}

func parseTemplateStormreaverThunderclap() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Stormreaver's Thunderclap",
		Notes: new("On a Melee strike of a Natural 20 that is confirmed as a critical hit, this item will strike your foe with tremendous burst of lightning. A Reflex DC: 100 save will prevent half of this damage."),
	}
}

func parseTemplateDazing(raw string) []*api.Enchantment {
	const template = "Dazing"
	const prefix = "{{" + template + "|"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	magnitude := "I"

	if strings.HasPrefix(s, prefix) && strings.HasSuffix(s, suffix) {
		inner := s[len(prefix) : len(s)-len(suffix)]
		parts := splitParams(inner)
		if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
			magnitude = strings.ToUpper(strings.TrimSpace(parts[0]))
		}
	} else if s == "{{"+template+"}}" {
		// Default to I
	} else {
		return nil
	}

	dcMap := map[string]string{
		"I":    "2",
		"II":   "4",
		"III":  "6",
		"IV":   "8",
		"V":    "10",
		"VI":   "11",
		"VII":  "12",
		"VIII": "13",
		"IX":   "14",
		"X":    "15",
	}

	dc, ok := dcMap[magnitude]
	if !ok {
		dc = "2" // Default to I if unknown magnitude
		magnitude = "I"
	}

	name := "Dazing " + magnitude
	enchantments := []*api.Enchantment{
		{
			Name:  name,
			Notes: new(fmt.Sprintf("%s: On hit: Your target suffers a -1 Penalty to Will Saving Throws for 6 seconds. This effect stacks up to 5 times. This effect may only occur on-hit once every three seconds.", name)),
		},
		{
			Name:      "Tactical DC: Stunning",
			Amount:    dc,
			BonusType: "Enhancement",
		},
	}

	for _, maneuver := range stunningManeuvers {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Tactical DC: " + maneuver,
			Amount:    dc,
			BonusType: "Enhancement",
		})
	}

	return enchantments
}

func parseTemplateDemonicMight() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Strength",
		Amount:    "2",
		BonusType: "Profane",
		Notes:     new("This item gives the wearer the power of a demon, granting a +2 profane bonus to Strength."),
	}
}

func parseTemplateCeruleanWave(raw string) *api.Enchantment {
	const template = "CeruleanWave"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	version := ""
	if len(parts) >= 1 {
		version = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	name := "Cerulean Wave"
	var notes string

	switch version {
	case "legendary", "paragon", "ice":
		if version == "legendary" {
			name = "Legendary Cerulean Wave"
		} else if version == "paragon" {
			name = "Paragon Cerulean Wave"
		}
		notes = "This powerful magical implement hums in your hands and resonates with icy magic. Spells you cast have a chance of freezing your targets in a block of solid ice."
	default:
		notes = "When struck in combat, there is a small chance you will be shielded by conjured ice, granting you +15 Temporary Hit Points. These Temporary Hit Points last 1 minute or until depleted."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateHiddenHandSecretVisibility(raw string) *api.Enchantment {
	const template = "HiddenHandSecretVisibility"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	title := ""
	if len(parts) >= 1 {
		title = strings.TrimSpace(parts[0])
	}

	name := "Hidden Hand Secret Visibility"
	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("Allows the wearer to see some things that the Hidden Hand has hidden handily."),
	}
}

func parseTemplateFaeryfireCurse(raw string) []*api.Enchantment {
	const template = "FaeryfireCurse"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	title := ""
	if len(parts) >= 1 {
		title = strings.TrimSpace(parts[0])
	}

	name := "Faeryfire Curse"
	if title != "" {
		name = title
	}

	notes := "Faeryfire Curse: Empowered by the Faerylights, your Illusion spells have a chance to curse your enemies with Purple Faery Fire, dispelling stealth, invisibility, blur, and displacement for 30 seconds, and giving a -40 penalty to hide. Sightless enemies are immune to the dazzle effect."

	return []*api.Enchantment{
		{
			Name:  name,
			Notes: new(notes),
		},
		{
			Name:      "Skill: Hide",
			Amount:    "-40",
			BonusType: "Penalty",
		},
	}
}

func parseTemplateFascinationGuard(raw string) *api.Enchantment {
	const template = "FascinationGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	title := ""
	if len(parts) >= 1 {
		title = strings.TrimSpace(parts[0])
	}

	name := "Fascination Guard"
	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("When hit or missed in melee combat, your foes have a chance to be Fascinated with no save."),
	}
}

func parseTemplateScallawagLuck(raw string) *api.Enchantment {
	const template = "ScallawagLuck"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	magnitude := "I"
	if len(parts) >= 1 {
		magnitude = strings.TrimSpace(parts[0])
	}

	percentage := "10%"
	switch strings.ToUpper(magnitude) {
	case "I":
		percentage = "10%"
	case "II":
		percentage = "15%"
	case "III":
		percentage = "20%"
	case "IV":
		percentage = "25%"
	case "V":
		percentage = "30%"
	case "VI":
		percentage = "35%"
	}

	return &api.Enchantment{
		Name:  "Scallawag's Luck " + magnitude,
		Notes: new(fmt.Sprintf("While in Smuggler's Rest, you gain %s additional doubloons when fighting pirates.", percentage)),
	}
}

func parseTemplateCCHatUpgrades(raw string) []*api.Enchantment {
	const template = "CCHatUpgrades"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return []*api.Enchantment{
		{
			Name:  "Enchantable: Crystal Rush",
			Notes: new("This hat can be enchanted to bestow one of various benefits to nearby kobolds in Crystal Cove."),
		},
		{
			Name:  "Enchantable: Adventuring Bonus",
			Notes: new("This hat can be enchanted to bestow one of various benefits useful in general adventuring. Adventuring effects may change the minim level of this item."),
		},
		{
			Name:  "Enchantable: Skilled Seaman",
			Notes: new("This had can be enchanted to grant a bonus to one skill. You can have one skill bonus on a hat at at time, but can replace it with a different choice. Skill effects may change the minimum level of this item."),
		},
	}
}

func parseTemplateDragonmark(raw string, itemType string) []*api.Enchantment {
	const template = "Dragonmark"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	if len(parts) == 0 {
		return nil
	}

	variant := strings.ToLower(strings.TrimSpace(parts[0]))
	increaseType := ""
	if len(parts) >= 2 {
		increaseType = strings.ToLower(strings.TrimSpace(parts[1]))
	}

	useIncrease := 3
	switch increaseType {
	case "minor":
		useIncrease = 1
	case "major":
		useIncrease = 5
	}

	var enchantments []*api.Enchantment

	switch variant {
	case "lesser":
		name := "Lesser Dragonmark Enhancement"
		if increaseType != "" {
			name = cases.Title(language.English).String(increaseType) + " " + name
		}
		enchantments = append(enchantments, &api.Enchantment{
			Name:   name,
			Amount: strconv.Itoa(useIncrease),
			Notes:  new(fmt.Sprintf("This will increase the total number of Lesser Dragonmarks you can use by %d. However, these additional Lesser Dragonmarks will only take effect after the wielder rests.", useIncrease)),
		})

	case "greater":
		name := "Greater Dragonmark Enhancement"
		if increaseType != "" {
			name = cases.Title(language.English).String(increaseType) + " " + name
		}
		enchantments = append(enchantments, &api.Enchantment{
			Name:   name,
			Amount: strconv.Itoa(useIncrease),
			Notes:  new(fmt.Sprintf("This will increase the total number of Greater Dragonmarks you can use by %d. However, these additional Greater Dragonmarks will only take effect after the wielder rests.", useIncrease)),
		})

	case "chimera's vitality":
		enchantments = append(enchantments, &api.Enchantment{
			Name: "Chimera's Vitality",
			Notes: new("This item grants extra bonuses if the wearer has been bestowed with Dragonmarks. You gain +1 use of Greater Dragonmark and +5 Quality PRR per Dragonmark you have.\n\n" +
				"Dragonmark of Sentinel bonus: You gain the effects of the Deific Warding feat. This does not stack with the feat itself."),
		})

	case "historic chimera's vitality":
		enchantments = append(enchantments, &api.Enchantment{
			Name:  "Chimera's Vitality",
			Notes: new("This item grants extra bonuses if the wearer has been bestowed with Dragonmarks. 1 Dragonmark feat: the item will grant 10 hitpoints. 2 Dragonmark feats: the item will grant 15 hitpoints. 3 Dragonmark feats: the item will grant 20 hitpoints and Spell Resistance 30. The hitpoint bonuses will stack with all other hitpoint-granting effects except for themselves."),
		})

	case "greater chimera's ferocity":
		notes := "This weapon's ultimate form may only be realized by those who bear a Dragonmark.\n" +
			"* With any Dragonmark, add:\n" +
			"** Feat: Exotic Weapon Proficiency: Bastard Sword\n" +
			"** +7 Enhancement Bonus\n" +
			"* With 2 Dragonmarks, add:\n" +
			"** Incite +10%\n" +
			"** Parrying IV\n" +
			"** +8 Enhancement Bonus\n" +
			"* With 3 Dragonmarks, add:\n" +
			"** Incite +15%\n" +
			"** Parrying VIII\n" +
			"** +7 Enhancement Bonus\n" +
			"* With Greater Dragonmark of Sentinel, add\n" +
			"** Incite +20%\n" +
			"** Insightful Fortification +50%\n" +
			"** +10 Enhancement Bonus\n" +
			"* With Greater Dragonmark of Storm, add\n" +
			"** Electricity Absorption +38%\n" +
			"** Whirlwind Ward\n" +
			"* With Greater Dragonmark of Healing, add\n" +
			"** Healing Amplification +38\n" +
			"* With Greater Dragonmark of Making, add\n" +
			"** Repair Amplification +38\n" +
			"* With Greater Dragonmark of Warding, add\n" +
			"** Spell Resistance +38"

		enchantments = append(enchantments, &api.Enchantment{
			Name:  "Greater Chimera's Ferocity",
			Notes: new(notes),
		})

	case "legendary chimera's ferocity", "legendary":
		notes := "This weapon's ultimate form may only be realized by those who bear a Dragonmark.\n" +
			"* With any Dragonmark, add:\n" +
			"** Feat: Exotic Weapon Proficiency: Bastard Sword\n" +
			"* With Greater Dragonmark of Sentinel, add\n" +
			"** Incite +124%\n" +
			"* With Greater Dragonmark of Shadow, add\n" +
			"** Lesser Displacement\n" +
			"* With Greater Dragonmark of Scribing, add\n" +
			"** Armor Class +13\n" +
			"* With Greater Dragonmark of Passage, add\n" +
			"** Resistance +11\n" +
			"* With Greater Dragonmark of Finding, add\n" +
			"** Insightful Fortification +73%"

		enchantments = append(enchantments, &api.Enchantment{
			Name:  "Legendary Chimera's Ferocity",
			Notes: new(notes),
		})

	case "historic chimera's ferocity":
		enchantments = append(enchantments, &api.Enchantment{
			Name:  "Chimera's Ferocity",
			Notes: new("This effect grants extra bonuses if the wearer has been bestowed with Dragonmarks: 1 or more Dragonmarks: item becomes +7 and grants Bastard Sword Proficiency. 2 or more Dragonmarks: item becomes +8 and grants Incite +10% and Greater Parrying. 3 Dragonmarks: item grants Incite +15% and Superior Parrying. If the wearer has the Greater Dragonmark of Sentinel, it will also become +10 and grants Incite +20% and Fortified Defenses +50%."),
		})
	}

	return enchantments
}

func parseTemplateWhirlwindAbsorption(raw string) *api.Enchantment {
	const template = "WhirlwindAbsorption"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	chargesStr := ""
	rechargeRateStr := ""

	if len(parts) >= 1 {
		chargesStr = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		rechargeRateStr = strings.TrimSpace(parts[1])
	}

	charges, _ := strconv.Atoi(chargesStr)
	rechargeRate, _ := strconv.Atoi(rechargeRateStr)

	name := "Whirlwind Absorption"
	if chargesStr != "" {
		if rechargeRateStr != "" {
			name = fmt.Sprintf("Whirlwind Absorption (%s Charges, %s/Day)", chargesStr, rechargeRateStr)
		} else {
			name = fmt.Sprintf("Whirlwind Absorption (%s Charges)", chargesStr)
		}
	}

	notes := "Whirlwind Absorption: This effect absorbs air elementals knockdown attack. " + chargesStr + " / " + chargesStr + " Charges"
	if rechargeRateStr != "" {
		notes += "(Recharged/Day: " + rechargeRateStr + ")"
	}

	return &api.Enchantment{
		Name:         name,
		Notes:        new(notes),
		Charges:      charges,
		RechargeRate: rechargeRate,
	}
}

func parseTemplatePoison(raw string) *api.Enchantment {
	const prefix = "{{Poison"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	variant := ""
	if len(parts) >= 1 {
		variant = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	ability := ""
	if len(parts) >= 2 {
		ability = strings.TrimSpace(parts[1])
	}

	magnitude := ""
	if len(parts) >= 3 {
		magnitude = strings.TrimSpace(parts[2])
	}

	dieCount := "1"
	if len(parts) >= 4 && strings.TrimSpace(parts[3]) != "" {
		dieCount = strings.TrimSpace(parts[3])
	}

	title := ""
	if len(parts) >= 5 {
		title = strings.TrimSpace(parts[4])
	}

	name := ""
	var notes string

	switch variant {
	case "burst":
		name = "Poison Burst"
		notes = "This weapon is dripping with poison, and deals 1 to 6 poison damage each hit. Critical hits deal an additional 1 to 10 poison damage for weapons with a x2 critical multiplier, 2 to 20 for a x3 multiplier and 3 to 30 for a x4 multiplier."
	case "virulent":
		name = ability + " Poison, Virulent"
		notes = fmt.Sprintf("The deadly poison coating this weapon deals one point of %s damage every time it strikes an enemy, and an additional 1 to 6 points of %s damage when it scores a critical hit. Some creatures may be immune or resistant to ability damage.", strings.ToLower(ability), strings.ToLower(ability))
	case "legendary virulent":
		name = "Legendary Virulent Poison"
		notes = "This item carries a potent venom that is delivered with your attacks. On any strike, the Poison has a chance to be applied, dealing 5d6 Constitution damage if your enemy fails a Fortitude DC 100 saving throw."
	case "greater":
		name = ability + " Poison, Greater"
		notes = fmt.Sprintf("The deadly poison coating this weapon deals one point of %s damage every time it strikes an enemy. Some creatures may be immune or resistant to ability damage.", strings.ToLower(ability))
	case "lesser":
		name = ability + " Poison, Lesser"
		notes = fmt.Sprintf("The deadly poison coating this weapon deals an additional 1 to 6 points of %s damage when it scores a critical hit. Some creatures may be immune or resistant to ability damage.", strings.ToLower(ability))
	case "stench":
		name = "Stench"
		notes = "This weapon creates a near paralyzing stench. On critical hits the target becomes nauseous, severely slowing its movement rate."
	case "toxic":
		name = "Toxic"
		notes = fmt.Sprintf("This weapon oozes with magical poisons from a dozen esoteric sources. Occasionally, these toxins will erupt on your target, unleashing a vile fog that will dissolve your foes with acid, and will additionally deal %s damage to enemies whom are not immune to poison. Weak foes may be killed outright by this Toxic Cloud.", strings.ToLower(ability))
	case "magnitude":
		name = "Poison " + magnitude
		dmg := strconv.Itoa(romanToInt(magnitude))
		notes = fmt.Sprintf("On Hit: %s to %s Poison Damage. On Critical Hit: 1 Strength, 1 Dexterity, or 1 Constitution Damage.", dmg, strconv.Itoa(romanToInt(magnitude)*3))
	case "large scorpion":
		name = "Large Scorpion Poison"
		notes = "On a critical hit, this weapon injects the target with Large Scorpion poison, causing 1d4 Constitution loss with an additional 1d4 Constitution loss after 1 minute if a Fortitude DC 14 save is failed."
	case "nightshade venom":
		name = "Nightshade Venom"
		notes = "Any creature struck by this weapon must succeed on a Fortitude DC 22 save or fall unconscious. The target may attempt a new save to end the effect every several seconds; otherwise the sleep lasts for 20 seconds."
	case "twining hemlock":
		name = "Twining Hemlock"
		notes = "This weapon is poisoned with a deadly strain of flowering plant. Hits by this weapon have a chance of putting your foe to sleep."
	case "critical":
		name = "Poison " + magnitude
		notes = fmt.Sprintf("This effect causes the edges of this weapon to drip with a vile venom, dealing %sd6 poison damage on each critical hit.", dieCount)
	case "noxious venom":
		name = "Noxious Venom Spike"
		notes = "On Damage: Do an additional 1d6 Poison Damage"
	case "epic noxious venom":
		name = "Epic Noxious Venom Spike"
		notes = "On Damage: Do an additional 2d6 Poison Damage"
	default:
		name = "Poisonous"
		if dieCount != "1" {
			name += " " + dieCount
		}
		notes = fmt.Sprintf("This weapon is dripping with poison. It deals an additional %sd6 poison damage on a successful hit.", dieCount)
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateWingedAllure(raw string) *api.Enchantment {
	const template = "WingedAllure"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Winged Allure",
		Notes: new("The butterflies of this crown have a tendency to distract your enemies. When hit or missed in melee combat, your foes have a chance to be Fascinated with no save."),
	}
}

func parseTemplateIceShardsGuard(raw string) *api.Enchantment {
	const template = "IceShardsGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	variant := ""
	if len(parts) >= 1 {
		variant = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	name := "Ice Shards Guard"
	if variant == "legendary" {
		name = "Legendary Ice Shards Guard"
	}

	const notes = "This item stores the pitiless immovable power of the ice deep within. When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, dealing an incredible amount of Cold damage to the attacker."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateDeificFocus(raw string) *api.Enchantment {
	const template = "DeificFocus"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	magnitude := "I"
	if inner != "" {
		magnitude = strings.ToUpper(inner)
	}

	stacks := romanToInt(magnitude)

	name := "Deific Focus " + magnitude
	notes := fmt.Sprintf("On Spell Cast: +1 Sacred Bonus to DC of that school for five seconds. Stacks up to %d times. Casting a spell from another school clears all stacks of this effect.", stacks)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateTrapTheSoul(raw string) *api.Enchantment {
	const template = "TrapTheSoul"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	variant := ""
	if len(parts) >= 1 {
		variant = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	var name, notes string
	switch variant {
	case "guard":
		name = "Trap the Soul Guard"
		notes = "When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, sucking out the life force of an enemy and imprisoning the essence of their body and soul in a gem."
	case "epic":
		name = "Epic Trap the Soul"
		notes = "When this weapon is used, this power occasionally comes to the surface, sucking out the life force of an enemy and imprisoning the essence of their body and soul in a gem."
	case "legendary":
		name = "Legendary Trap the Soul"
		notes = "When you strike an enemy with a melee or missle attack, this power occasionally comes to the surface, sucking out the life force of an enemy and imprisoning the essence of their body and soul in a gem."
	default:
		name = "Trap the Soul"
		notes = "When this weapon is used, this power occasionally comes to the surface, sucking out the life force of an enemy and imprisoning the essence of their body and soul in a gem."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateHammerblock(raw string) *api.Enchantment {
	const template = "Hammerblock"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	amountStr := ""
	title := ""

	if len(parts) >= 1 {
		amountStr = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		title = strings.TrimSpace(parts[1])
	}

	// Hammerblock (Enhancement Amount) (Title)
	// Amount is doubled in the description.
	// Enhancement Amount can be Roman numerals, numbers, or decimals.

	var amount float64
	var err error
	if amountStr != "" && (amountStr[0] == 'I' || amountStr[0] == 'V' || amountStr[0] == 'X' || amountStr[0] == 'L' || amountStr[0] == 'C' || amountStr[0] == 'D' || amountStr[0] == 'M') {
		amount = float64(romanToInt(strings.ToUpper(amountStr)))
	} else {
		amount, err = strconv.ParseFloat(amountStr, 64)
		if err != nil {
			amount = 0
		}
	}

	doubledAmount := amount * 2
	doubledAmountStr := strconv.FormatFloat(doubledAmount, 'f', -1, 64)

	name := fmt.Sprintf("Damage Reduction: %s/Slash, Pierce", doubledAmountStr)
	if title != "" {
		name = title
	}

	notes := fmt.Sprintf("Passive: Reduces physical damage taken by %s, except from Piercing or Slashing weapons. (Damage Reduction: %s/Slash, Pierce)", doubledAmountStr, doubledAmountStr)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateThunderstruck(raw string) *api.Enchantment {
	const template = "Thunderstruck"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Thunderstruck"
	notes := "On Melee Vorpal Hit: 25d2+10 Electric and 25d2+10 Sonic damage to your target."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateTransformKineticEnergy(raw string) *api.Enchantment {
	const template = "TransformKineticEnergy"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Transform Kinetic Energy"
	notes := "Transform Kinetic Energy: Each time you are physically hit in combat there is a chance that the energy of the blow will be converted into spell points."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateEidolonSummons(raw string) *api.Enchantment {
	const template = "EidolonSummons"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	variant := ""
	if len(parts) >= 1 {
		variant = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	name := "Eidolon Summons"
	var notes string

	if variant == "upgraded" {
		notes = "On Being Damaged: Animates a portion of the wearer's shadow to support them in battle. The shadow remains animate for 30 seconds and can be created once every 80 seconds"
	} else {
		notes = "On Being Damaged: Animates a portion of the wearer's shadow to support them in battle. The shadow remains animate for 30 seconds and can be created once every 120 seconds"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateThornOfTheRose(raw string) *api.Enchantment {
	const template = "ThornOfTheRose"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Thorn of the Rose"
	notes := "Thorn of the Rose: Your Piercing damage from any source has a chance to Paralyze non-Boss enemies with no save."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateElementalAttuned(raw string) *api.Enchantment {
	const template = "ElementalAttuned"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	elemType := ""
	if len(parts) >= 1 {
		elemType = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	var name, notes string
	if elemType == "water" {
		name = "Sea Attunement"
		notes = "While you are a Water Elemental, you gain bonuses to your Cold Spell's Caster Level, Cold Spell Power and Cold Spell Critical Chance."
	} else if elemType == "fire" {
		name = "Sky Attunement"
		notes = "While you are a Fire Elemental, you gain bonuses to your Fire Spell's Caster Level, Fire Spell Power and Fire Spell Critical Chance."
	} else {
		// Default to something sensible or just name it based on what we have
		name = "Elemental Attunement"
		notes = "Elemental Attunement: While you are an Elemental, you gain bonuses to your Spell's Caster Level, Spell Power and Spell Critical Chance."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateMelodicGuard(raw string) *api.Enchantment {
	const template = "MelodicGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Melodic Guard"
	notes := "Each time you are hit in melee combat there is a chance that your attacker will be overcome with an urge to dance."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateOverwhelmingDespair(raw string) *api.Enchantment {
	const template = "OverwhelmingDespair"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Overwhelming Despair"
	notes := "Overwhelming Despair: The moon empowers your Necromancy spells - causing them to bring Terror to your enemies. Your offensive Necromancy spells automatically apply Crushing Despair with no save."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateIncrediblePotential(raw string) *api.Enchantment {
	const template = "IncrediblePotential"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Incredible Potential"
	notes := "When this ring is combined with 9 Shavarath War Trophies and an Imbued Shard of Great Power in an Alter of Subjugation, its full potential will be revealed."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSoulOfElements(raw string) *api.Enchantment {
	const template = "SoulOfElements"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Soul of the Elements"
	notes := "While you are centered, this item grants you a bonus depending on your current monk stance.\n* Fire: Chance on hit to blind and fear the target.\n* Water: Chance on hit to trip the target.\n* Air: On hit: 3 to 18 electric damage, and target bleeds for 1 to 8 bleed damage periodically.\n* Earth: +10 Insight bonus to Armor Class and Reflex Saves."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSolarGuard(raw string) *api.Enchantment {
	const template = "SolarGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	inner = strings.TrimSpace(inner)

	parts := splitParams(inner)
	diceCount := "0"
	dieSides := "6"

	if len(parts) >= 1 {
		diceCount = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		dieSides = strings.TrimSpace(parts[1])
	}

	if dieSides == "" {
		dieSides = "6"
	}

	countInt, _ := strconv.Atoi(diceCount)
	roman := intToRoman(countInt)
	name := "Solar Guard"
	if roman != "" {
		name += " " + roman
	}

	notes := fmt.Sprintf("%s: When hit or missed in Melee: Deals %sd%s light damage to your attacker.", name, diceCount, dieSides)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateBrazenBrilliance(raw string) *api.Enchantment {
	const template = "BrazenBrilliance"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Brazen Brilliance"
	notes := "With this item equipped, your offensive attacks and spells have a chance of creating a burst of pure light, dealing Light damage and blinding enemies."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateVoiceofDeceit(raw string) []*api.Enchantment {
	const template = "VoiceofDeceit"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	skillList := []string{"Bluff", "Diplomacy", "Haggle", "Perform"}
	var enchantments []*api.Enchantment

	for _, skill := range skillList {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Skill: " + skill,
			Amount:    "20",
			BonusType: "Competence",
		})
	}

	return enchantments
}

func parseTemplateMindDrain(raw string) *api.Enchantment {
	const template = "MindDrain"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Maximum Spell Points"
	bonusType := "Penalty"
	amount := "-5%"
	notes := "This item reduces your maximum spell points by 5% while equipped."

	return &api.Enchantment{
		Name:      name,
		BonusType: bonusType,
		Amount:    amount,
		Notes:     new(notes),
	}
}

func parseTemplateStability(raw string) *api.Enchantment {
	const template = "Stability"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(content, "|") {
		content = content[1:]
	}

	params := splitParams(content)
	variant := ""
	if len(params) > 0 && params[0] != "" {
		variant = strings.ToLower(strings.TrimSpace(params[0]))
	}

	name := "Stability"
	bonus := "2"

	switch variant {
	case "greater":
		name = "Greater Stability"
		bonus = "4"
	case "superior":
		name = "Superior Stability"
		bonus = "6"
	}

	notes := fmt.Sprintf("%s: Grants the wearer a +%s deflection bonus to Armor Class and a +%s resistance bonus to all saving throws if they are of True Neutral alignment.", name, bonus, bonus)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateEnergySiphon(raw string) *api.Enchantment {
	const template = "EnergySiphon"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(content, "|") {
		content = content[1:]
	}

	params := splitParams(content)
	magnitude := ""
	if len(params) > 0 && params[0] != "" {
		magnitude = strings.TrimSpace(params[0])
	}

	magInt := romanToInt(magnitude)
	sp := magInt * 5

	name := "Energy Siphon"
	if magnitude != "" {
		name += " " + magnitude
	}

	notes := fmt.Sprintf("On Hit: Gain %d Temporary Spellpoints which last for up to 1 minute. This effect can trigger at most once per minute.", sp)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateCraftableRuneArm(raw string) *api.Enchantment {
	const template = "CraftableRuneArm"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Craftable Rune Arm",
		Notes: new("Craftable Rune Arm: This Rune Arm is craftable and can be customized using recipes at standard crafting devices after disjuncting."),
	}
}

// Template:Puncturing
// Usage: {{Puncturing|(Type)}} where Type is optional and may be "Normal" or "Greater".
// If omitted, defaults to Normal.
// Effect text per docs: on a critical hit, deals Constitution damage from blood loss.
// Normal: 1d4 Con damage; Greater: 3d4 Con damage.
func parseTemplatePuncturing(raw string) *api.Enchantment {
	const prefix = "{{Puncturing"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	typ := "Normal"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := stripBrackets(parts[0])
			if v != "" {
				typ = v
			}
		}
	}

	dice := "1d4"
	name := "Puncturing"
	if strings.EqualFold(typ, "Greater") {
		name = "Greater Puncturing"
		dice = "3d4"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(fmt.Sprintf("Critical hits by this weapon deal an extra %s points of Constitution damage from blood loss.", dice)),
	}
}

// Template:Ghostbane
// Usage: {{Ghostbane|(Magnitude)|(Version)|(Die Side)}}
// Parameters:
// 1. Magnitude: Roman numeral (I-X) or digit if Version is "Digit". Default "I".
// 2. Version: "Legacy" (default), "New", "Incorporeal", "Dice", "Digit".
// 3. Die Side: Number of sides on the die (for "Dice" version).
func parseTemplateGhostbane(raw string) *api.Enchantment {
	const prefix = "{{Ghostbane"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitudeStr := "I"
	version := "legacy"
	dieSide := "6"

	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			if v := strings.TrimSpace(parts[0]); v != "" {
				magnitudeStr = v
			}
		}
		if len(parts) >= 2 {
			if v := strings.TrimSpace(parts[1]); v != "" {
				version = strings.ToLower(v)
			}
		}
		if len(parts) >= 3 {
			if v := strings.TrimSpace(parts[2]); v != "" {
				dieSide = v
			}
		}
	}

	magnitude := romanToInt(magnitudeStr)
	if version == "digit" {
		if m, err := strconv.Atoi(magnitudeStr); err == nil {
			magnitude = m
		}
	}
	if magnitude == 0 {
		magnitude = 1
	}

	romanMagnitude := intToRoman(magnitude)
	name := "Ghostbane"
	if romanMagnitude != "" {
		name += " " + romanMagnitude
	}

	var notes string
	switch version {
	case "incorporeal":
		notes = fmt.Sprintf("This weapon is attuned specifically to hunt the risen dead, dealing an additional %dd10 bane damage vs. Undead monsters.\n\nPassive: The Weapon has Ghost Touch and bypasses ethereal monster's 50%% chance to evade bane damage.", magnitude)
	case "new":
		notes = fmt.Sprintf("On Hit: %dd10 Bane Damage vs. Undead. (Bane damage cannot be resisted.)\nPassive: Attacks from this weapon bypass the miss chance of incorporeal creatures, such as ghosts, shadows, and wraiths.", magnitude)
	case "dice":
		notes = fmt.Sprintf("On Hit: %dd%s Bane Damage vs. Undead. (Bane damage cannot be resisted.)\nPassive: Attacks from this weapon bypass the miss chance of incorporeal creatures, such as ghosts, shadows, and wraiths.", magnitude, dieSide)
	case "digit":
		notes = fmt.Sprintf("This weapon is attuned specifically to hunt ethereal monsters, dealing an additional %dd10 bane damage vs. Undead monsters.\n\nPassive: The Weapon has Ghost Touch and bypasses ethereal monster's 50%% chance to evade bane damage.", magnitude)
	default: // legacy or default
		notes = fmt.Sprintf("On Hit: %dd6 Bane Damage vs. Undead. (Bane damage cannot be resisted.)\nPassive: Attacks from this weapon bypass the miss chance of incorporeal creatures, such as ghosts, shadows, and wraiths.", magnitude)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateGoldcurse parses `{{Goldcurse}}`, `{{Goldcurse|Epic}}`, or `{{Goldcurse|Legendary}}`.
func parseTemplateGoldcurse(raw string) *api.Enchantment {
	const prefix = "{{Goldcurse"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	tier := "heroic"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			if v := strings.TrimSpace(parts[0]); v != "" {
				tier = strings.ToLower(v)
			}
		}
	}

	var name, notes string
	switch tier {
	case "epic":
		name = "Epic Goldcurse"
		notes = "This weapon applies a dangerous, golden curse on enemies struck! They must succeed on a Fortitude DC: 25 save on each hit or be Paralyzed by solid gold."
	case "legendary":
		name = "Legendary Goldcurse"
		notes = "This weapon applies a dangerous, golden curse to enemies struck! They must succeed on a Fortitude DC: 100 save on each Critical hit or be Paralyzed by solid gold."
	default: // heroic
		name = "Goldcurse"
		notes = "This weapon applies a dangerous, golden curse on enemies struck! They must succeed on a Fortitude DC: 17 save on each hit or be Paralyzed by solid gold."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateVileGrip parses `{{VileGrip}}` or `{{VileGrip|Legendary}}`.
func parseTemplateVileGrip(raw string) *api.Enchantment {
	const prefix = "{{VileGrip"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	tier := "basic"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			if v := strings.TrimSpace(parts[0]); v != "" {
				tier = strings.ToLower(v)
			}
		}
	}

	name := "Vile Grip of the Hidden Hand"
	if tier == "legendary" {
		name = "Legendary " + name
	}
	notes := "Attacks and offensive spells have a small chance to deal massive evil damage."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateHeartseeker parses: {{Heartseeker|(Magnitude)}} where Magnitude is Roman I–VI.
// It scales dice count by (2*Magnitude + 1) and sets notes to describe crit-multiplier-based damage.
func parseTemplateHeartseeker(raw string) *api.Enchantment {
	const prefix = "{{Heartseeker"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitudeRoman := "I" // default
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := strings.TrimSpace(parts[0])
			if v != "" {
				magnitudeRoman = strings.ToUpper(v)
			}
		}
	}

	mag := romanToInt(magnitudeRoman)
	if mag <= 0 { // fallback safety
		mag = 1
		magnitudeRoman = "I"
	}

	diceCount := 2*mag + 1
	name := "Heartseeker " + strings.ToUpper(intToRoman(mag))
	notes := fmt.Sprintf("On Critical Hit: %dd6 piercing damage from weapons with x2 Critical Multiplier, %dd8 piercing damage from weapons with a x3 Critical Multiplier, and %dd10 piercing damage from weapons with a x4 or greater Critical Multiplier.", diceCount, diceCount, diceCount)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateDisruption parses `{{Disruption|(Type)}}`.
// Types: Improved (1500/150), Greater (2000/200), Superior (2500/250), Sovereign (3000/300), Basic (1000/100).
func parseTemplateDisruption(raw string) *api.Enchantment {
	const prefix = "{{Disruption"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	tier := "basic"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			if v := strings.TrimSpace(parts[0]); v != "" {
				tier = strings.ToLower(v)
			}
		}
	}

	var name string
	var hpThreshold, damage int

	switch tier {
	case "improved":
		name = "Improved Disruption"
		hpThreshold = 1500
		damage = 150
	case "greater":
		name = "Greater Disruption"
		hpThreshold = 2000
		damage = 200
	case "superior":
		name = "Superior Disruption"
		hpThreshold = 2500
		damage = 250
	case "sovereign":
		name = "Sovereign Disruption"
		hpThreshold = 3000
		damage = 300
	default:
		name = "Disruption"
		hpThreshold = 1000
		damage = 100
	}

	notes := fmt.Sprintf("%s: On Hit: 4d6 Bane damage to Undead\nOn Vorpal Hit: If an undead struck by this weapon has fewer than %d Hit Points it is instantly slain. If the undead has above %d Hit Points, it takes %d damage.", name, hpThreshold, hpThreshold, damage)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateWounding parses `{{Wounding|(Type)|(Value)|(Title)}}`.
// Types:
// - empty/basic: 1 point of CON damage on hit
// - Greater: 3 points of CON damage on hit
// - Specific: `Value` points of CON damage on hit
// - Critical: `Value` points of CON damage on critical hit
// Title: optional override for the enchantment name
func parseTemplateWounding(raw string) *api.Enchantment {
	const prefix = "{{Wounding"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var typ, value, title string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			typ = strings.ToLower(strings.TrimSpace(parts[0]))
		}
		if len(parts) >= 2 {
			value = strings.TrimSpace(parts[1])
		}
		if len(parts) >= 3 {
			title = strings.TrimSpace(parts[2])
		}
	}

	// Determine points and default name
	points := 1
	name := "Wounding"

	switch typ {
	case "greater":
		name = "Greater Wounding"
		points = 3
	case "specific":
		if n, err := strconv.Atoi(value); err == nil && n > 0 {
			points = n
		}
		name = fmt.Sprintf("Wounding %d", points)
	case "critical":
		if n, err := strconv.Atoi(value); err == nil && n > 0 {
			points = n
		}
		// keep name base; title may override
	default:
		// basic (1 point)
	}

	if title != "" {
		name = title
	}

	pointWord := "point"
	if points != 1 {
		pointWord = "points"
	}

	whenText := "when it hits a creature"
	if typ == "critical" {
		whenText = "when it critically hits a creature"
	}

	notes := fmt.Sprintf("%s: A wounding weapons deals %d %s of Constitution damage from blood loss %s. Creatures immune to critical hits are immune to the Constitution damage dealt by this weapon.", name, points, pointWord, whenText)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// {{Bleed|(Style)|(Die Count)}}
// Styles: Slicing (1d4), Hemorrhaging (2d8), Phlebotomizing (3d8), Greater (8d5), default Bleeding (1d8).
// If (Die Count) is provided, it overrides the default count and is appended to the name.
func parseTemplateBleed(raw string) *api.Enchantment {
	const prefix = "{{Bleed"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var styleRaw, countParam string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			styleRaw = strings.ToLower(strings.TrimSpace(parts[0]))
		}
		if len(parts) >= 2 {
			countParam = strings.TrimSpace(parts[1])
		}
	}

	// Defaults per style
	nameBase := "Bleeding"
	dieSides := 8
	defaultCount := "1"
	adjective := "cruelly"

	switch styleRaw {
	case "slicing", "slice", "s":
		nameBase = "Slicing"
		dieSides = 4
		defaultCount = "1"
		adjective = "viciously"
	case "hemorrhaging", "hemorrhage", "h":
		nameBase = "Hemorrhaging"
		dieSides = 8
		defaultCount = "2"
		adjective = "incredibly"
	case "phlebotomizing", "phleb", "p":
		nameBase = "Phlebotomizing"
		dieSides = 8
		defaultCount = "3"
		adjective = "wickedly"
	case "greater", "g":
		nameBase = "Greater Bleeding"
		dieSides = 5
		defaultCount = "8"
		adjective = "precisely"
	}

	dieCount := defaultCount
	if countParam != "" {
		dieCount = countParam
	}

	name := nameBase
	if countParam != "" {
		name += " " + countParam
	}

	notes := fmt.Sprintf("This weapon is %s sharp and will do an additional %sd%d damage to targets that are vulnerable to bleeding.", adjective, dieCount, dieSides)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMortalStrike parses `{{MortalStrike}}`.
func parseTemplateMortalStrike(raw string) *api.Enchantment {
	const prefix = "{{MortalStrike"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Mortal Strike"
	notes := "On an attack roll of 20 which is confirmed as a critical hit this weapon triggers the Slay Living spell and attempts to instantly snuff out the life force of the enemy."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplatePlanarConflux parses `{{PlanarConflux}}`.
func parseTemplatePlanarConflux(raw string) *api.Enchantment {
	const prefix = "{{PlanarConflux"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Planar Conflux"
	notes := "When this item is equipped at the same time as a Planar Focus, you will gain set bonuses based on the Planar Focus that you have equipped."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateAbilityDamage parses `{{AbilityDamage|Ability|Value|Title|Critical|Range}}`.
func parseTemplateAbilityDamage(raw string) *api.Enchantment {
	const prefix = "{{AbilityDamage"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var ability, value, title, critical, rangeParam string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			ability = strings.TrimSpace(parts[0])
		}
		if len(parts) >= 2 {
			value = strings.TrimSpace(parts[1])
		}
		if len(parts) >= 3 {
			title = strings.TrimSpace(parts[2])
		}
		if len(parts) >= 4 {
			critical = strings.ToLower(strings.TrimSpace(parts[3]))
		}
		if len(parts) >= 5 {
			rangeParam = strings.ToLower(strings.TrimSpace(parts[4]))
		}
	}

	name := ability
	if title != "" {
		name = title
	}

	isCritical := critical == "true" || critical == "yes" || critical == "1"
	isRange := rangeParam == "true" || rangeParam == "yes" || rangeParam == "1"

	var notes string
	if isCritical {
		if isRange {
			notes = fmt.Sprintf("On Critical Hit: This weapon deals %s %s damage.", value, ability)
		} else {
			notes = fmt.Sprintf("On Critical Hit: This weapon deals %s points of %s damage.", value, ability)
		}
	} else {
		if isRange {
			notes = fmt.Sprintf("On Hit: This weapon deals %s %s damage.", value, ability)
		} else {
			notes = fmt.Sprintf("On Hit: This weapon deals %s points of %s damage.", value, ability)
		}
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBloodletter parses `{{Bloodletter|(Magnitude)}}`.
func parseTemplateBloodletter(raw string) *api.Enchantment {
	const prefix = "{{Bloodletter"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitude := strings.ToLower(strings.TrimSpace(inner))

	var notes string
	var nameSuffix string

	switch magnitude {
	case "i":
		nameSuffix = "I"
		notes = "If using this, update the template with the text"
	case "ii":
		nameSuffix = "II"
		notes = "On Critical Hit: 5d6 Slashing damage from weapons with x2 Critical Multiplier, 5d8 Slashing damage from weapons with a x3 Critical Multiplier, and 5 to 50 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	case "iii":
		nameSuffix = "III"
		notes = "On Critical Hit: 7d6 Slashing damage from weapons with x2 Critical Multiplier, 7d8 Slashing damage from weapons with a x3 Critical Multiplier, and 7d10 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	case "iv":
		nameSuffix = "IV"
		notes = "If using this, update the template with the text"
	case "v":
		nameSuffix = "V"
		notes = "On Critical Hit: 11d6 Slashing damage from weapons with x2 Critical Multiplier, 11d8 Slashing damage from weapons with a x3 Critical Multiplier, and 11d10 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	case "vi":
		nameSuffix = "VI"
		notes = "On Critical Hit: 13d6 Slashing damage from weapons with x2 Critical Multiplier, 13d8 Slashing damage from weapons with a x3 Critical Multiplier, and 13d10 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	case "vii":
		nameSuffix = "VII"
		notes = "On Critical Hit: 15d6 Slashing damage from weapons with x2 Critical Multiplier, 15d8 Slashing damage from weapons with a x3 Critical Multiplier, and 15d10 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	default:
		notes = "Please add which version of bloodletter is being used (I-VII)"
	}

	name := "Bloodletter"
	if nameSuffix != "" {
		name += " " + nameSuffix
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCurseVector parses `{{CurseVector}}`.
func parseTemplateCurseVector(raw string) *api.Enchantment {
	const prefix = "{{CurseVector"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Curse Vector"
	notes := "This item is a carrier of curses. It can apply them to your foes, but also to you- when you are damaged there is a small chance that you will have a Bestow Curse cast on you."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateVicious(raw string) *api.Enchantment {

	const prefix = "{{Vicious"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Vicious"
	notes := "On Hit: 2d6 Bane Damage to your target and 1d3 Bane Damage to yourself. (Bane damage cannot be resisted.)"

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplatePolycurse parses `{{Polycurse}}`.
func parseTemplatePolycurse(raw string) *api.Enchantment {
	const prefix = "{{Polycurse"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Polycurse"
	notes := "On a critical hit an enemy may be hit with one of these effects at random: Blindness, Exhaustion, Bestow Curse, or Enervation."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCrimsonCovenant parses `{{CrimsonCovenant}}`.
func parseTemplateCrimsonCovenant(raw string) *api.Enchantment {
	const prefix = "{{CrimsonCovenant"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Crimson Covenant"
	notes := "First Litany of the Crimson Covenant: On Hit: 6d6 Evil damage and 6d8 bleeding damage to those that are vulnerable to it.\n" +
		"* Second Litany of the Crimson Covenant: On Hit: You are healed for 3d2 hit points.\n" +
		"* Third Litany of the Crimson Covenant: On Hit: Strip the vitality from you renemies, dealing 3 Constitution damage and reducing their Physical and Magical Resistance Ratings by 10.\n" +
		"* Final Litany of the Crimson Covenant: On Hit: This dagger has a chance of conjuring the Mark of Death itself, snuffing the life from your foes and slaying them instantly without a save."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFettersofUnreality parses `{{FettersofUnreality}}`.
func parseTemplateFettersofUnreality(raw string) *api.Enchantment {
	const prefix = "{{FettersofUnreality"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Fetters of Unreality"
	notes := "This weapon has a chance to inflict multiple stacks of Vulnerable.\n\nVulnerable: You take 1% more damage for 3 seconds. This effect stacks up to 20 times, and loses one stack on expiration."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateGiantSlayer parses `{{GiantSlayer}}`.
func parseTemplateGiantSlayer(raw string) *api.Enchantment {
	const prefix = "{{GiantSlayer"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Giant Slayer"
	notes := "This weapon has a small chance to force a target Giant to make a Fortitude DC: 25 save or die instantly."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateGreaterDispelling parses `{{GreaterDispelling}}`.
func parseTemplateGreaterDispelling(raw string) *api.Enchantment {
	const prefix = "{{GreaterDispelling"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Greater Dispelling"
	notes := "On an attack roll of 20 which is confirmed as a critical hit is will apply a Greater Dispel Magic effect to the target, stripping away its protective spells."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMotherNightsEmbrace parses `{{MotherNightsEmbrace|(Enhancement Amount)}}`.
func parseTemplateMotherNightsEmbrace(raw string) *api.Enchantment {
	const prefix = "{{MotherNightsEmbrace"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	amount := ""
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			amount = strings.TrimSpace(parts[0])
		}
	}

	name := "Mother Night's Embrace"
	notes := "This weapon is unholy and imbued with one of the two deities of Barovia - the Mother Night. This weapon is evil, dealing an additional 3d6 evil damage on each hit."

	if amount != "" {
		bonusType := "bonus"
		if strings.HasPrefix(amount, "-") {
			bonusType = "penalty"
		}
		// If amount doesn't have a sign, it's a bonus by default.
		if !strings.HasPrefix(amount, "+") && !strings.HasPrefix(amount, "-") {
			amount = "+" + amount
		}

		notes += fmt.Sprintf(" In addition, the weapon grants a %s %s to its enhancement bonus.", amount, bonusType)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateRighteous parses `{{Righteous}}`.
func parseTemplateRighteous(raw string) *api.Enchantment {
	const prefix = "{{Righteous"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Righteous"
	notes := "Righteous: This weapon is imbued with holy power, giving it an additional +2 to attack bonus and damage against any evil creature. This power makes the weapon good-aligned."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateSmiting parses `{{Smiting|(Style)}}`.
// Styles: Improved, Sovereign, Weapons, default Smiting.
func parseTemplateSmiting(raw string) *api.Enchantment {
	const prefix = "{{Smiting"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var styleRaw string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			styleRaw = strings.ToLower(strings.TrimSpace(parts[0]))
		}
	}

	var name, notes string
	switch styleRaw {
	case "improved":
		name = "Improved Smiting"
		notes = "On Hit: 4d6 Bane damage to Constructs. On Vorpal Hit: If an Construct struck by this weapon has fewer than 1500 Hit Points, it is instantly slain. If an Construct has above 1500 Hit Points, it takes 150 damage."
	case "sovereign":
		name = "Sovereign Smiting"
		notes = "On Hit: 4d6 Bane damage to Constructs. On Vorpal Hit: If an Construct struck by this weapon has fewer than 3000 Hit Points, it is instantly slain. If an Construct has above 3000 Hit Points, it takes 300 damage."
	case "weapons":
		name = "Smiting Weapons"
		notes = "While wearing this item, your melee and ranged weapons gain Vorpal effect: If an Construct struck by this weapon has fewer than 1500 Hit Points, it is instantly slain. If an Construct has above 1500 Hit Points, it takes 150 damage."
	default:
		name = "Smiting"
		notes = "On Hit: 4d6 Bane damage to Constructs. On Vorpal Hit: If an Construct struck by this weapon has fewer than 1000 Hit Points, it is instantly slain. If an Construct has above 1000 Hit Points, it takes 100 damage."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateStumbling parses `{{Stumbling|(Magnitude)}}`.
// Magnitude is a Roman Numeral from I to X. Defaults to I.
func parseTemplateStumbling(raw string) *api.Enchantment {
	const prefix = "{{Stumbling"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitudeRaw := strings.ToUpper(strings.TrimSpace(inner))
	if magnitudeRaw == "" {
		magnitudeRaw = "I"
	}

	romanToVal := map[string]int{
		"I": 1, "II": 4, "III": 6, "IV": 8, "V": 10,
		"VI": 1, "VII": 12, "VIII": 13, "IX": 14, "X": 15,
	}

	val, ok := romanToVal[magnitudeRaw]
	if !ok {
		val = 1
		magnitudeRaw = "I"
	}

	tripDC := val
	name := fmt.Sprintf("Stumbling %s", magnitudeRaw)
	notes := fmt.Sprintf("On Hit: Your target suffers a -1 Penalty to Reflex Saving Throws for 6 second. This effect stacks up to 5 times. This effect may only occur on-hit once every three seconds. Passive: The DC of the saving throw to resist your Trip combat feats is increased by %d.", tripDC)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateSundering parses `{{Sundering|(Magnitude)}}`.
// Magnitude is a Roman Numeral from I to X. Defaults to I.
func parseTemplateSundering(raw string) *api.Enchantment {
	const prefix = "{{Sundering"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitudeRaw := strings.ToUpper(strings.TrimSpace(inner))
	if magnitudeRaw == "" {
		magnitudeRaw = "I"
	}

	romanToVal := map[string]int{
		"I": 1, "II": 4, "III": 6, "IV": 8, "V": 10,
		"VI": 11, "VII": 12, "VIII": 13, "IX": 14, "X": 15,
	}

	val, ok := romanToVal[magnitudeRaw]
	if !ok {
		val = 1
		magnitudeRaw = "I"
	}

	sunderDC := val
	name := fmt.Sprintf("Sundering %s", magnitudeRaw)
	notes := fmt.Sprintf("On Hit: Your target suffers a -1 Penalty to Fortitude Saving Throws for 6 second. This effect stacks up to 5 times. This effect may only occur on-hit once every three seconds. Passive: The DC of the saving throw to resist your Sunder combat feats is increased by %d.", sunderDC)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateFinesse(raw string) *api.Enchantment {
	const prefix = "{{Finesse"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	amount := "+2"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
			val := strings.TrimSpace(parts[0])
			if !strings.HasPrefix(val, "+") && !strings.HasPrefix(val, "-") {
				amount = "+" + val
			} else {
				amount = val
			}
		}
	}

	name := "Finesse"
	notes := fmt.Sprintf("The wielder can use a finesse weapon as if he had the Weapon Finesse feat. In addition, the weapon grants a %s enhancement bonus to the wielder's Dexterity score.", amount)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateAlchemical(raw string) *api.Enchantment {
	const prefix = "{{Alchemical"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	typ := strings.ToLower(strings.TrimSpace(inner))

	name := "Alchemical (Prototype)"
	notes := "This experimental item, crafted and enchanted at ancient Cannith creation forges using powerful alchemy, is made of a material that allows elemental power sources to be bound to it. This item is in a prototype state and is currently in need of refinement before an elemental can be bound to it."

	if typ == "legendary" {
		name = "Legendary Alchemical Crafting (Prototype)"
		notes = "This experimental item, crafted and enchanted at ancient Cannith creation forges using powerful alchemy, is made of a material that allows elemental power sources to be bound to it. This item is in a prototype state and is currently in need of refinement."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateConstrictingNightmare parses `{{ConstrictingNightmare}}`.
func parseTemplateConstrictingNightmare(raw string) *api.Enchantment {
	const prefix = "{{ConstrictingNightmare"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Constricting Nightmare"
	notes := "Enemies struck by this weapon are stricken with a horrible fear of death, reducing their Physical Resistance and Magical Resistance by 10."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateEnfeebling parses `{{Enfeebling}}`.
func parseTemplateEnfeebling(raw string) *api.Enchantment {
	const prefix = "{{Enfeebling"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Enfeebling"
	notes := "Critical hits by this weapon deal an extra 1d6 points of Strength damage."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCorrosiveSaltGuard parses `{{CorrosiveSaltGuard}}`.
func parseTemplateCorrosiveSaltGuard(raw string) *api.Enchantment {
	const prefix = "{{CorrosiveSaltGuard"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Corrosive Salt Guard"
	notes := "When the wearer of this item is successfully attacked in melee, this power can come to the surface in the form of a noxious, corrosive salt that dissolves all substances."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateLifeStealing parses `{{LifeStealing}}`.
func parseTemplateLifeStealing(raw string) *api.Enchantment {
	const prefix = "{{LifeStealing"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Life Stealing"
	notes := "This weapon has a chance to drain 1 to 3 levels from its target on a critical hit."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateGodlyWrath parses `{{GodlyWrath}}`.
func parseTemplateGodlyWrath(raw string) *api.Enchantment {
	const prefix = "{{GodlyWrath"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Godly Wrath"
	notes := "Occasionally, this holy power is unleashed, applying a lasting effect that deals 2d4 light damage every two seconds for six seconds. If the effect is reapplied before it wears off, the effect will stack and the duration will reset. The effect can be stacked up to 3 times."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateIncineration parses `{{Incineration|Type}}`.
func parseTemplateIncineration(raw string) *api.Enchantment {
	const prefix = "{{Incineration"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	typ := strings.ToLower(strings.TrimSpace(inner))
	name := "Incineration"
	notes := "This weapon stores the power of a raging inferno deep within. Occasionally, this destructive power comes to the surface, devastating enemies with massive fire damage."

	switch typ {
	case "greater":
		name = "Greater Incineration"
		notes += " This damage will be dealt more often that a standard Incineration weapon."
	case "overwhelming":
		name = "Overwhelming Incineration"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateDragonshardFocus parses `{{DragonshardFocus|dragonmark}}`.
func parseTemplateDragonshardFocus(raw string) *api.Enchantment {
	const prefix = "{{DragonshardFocus"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var dragonmark string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			dragonmark = strings.ToLower(strings.TrimSpace(parts[0]))
		}
	}

	var name, notes string
	switch dragonmark {
	case "sentinel":
		name = "Dragonshard Focus: Sentinel"
		notes = "This item bestows additional benefits to those that bear the Dragonmark of Sentinel.\n* Least: Exotic Weapon Proficiency: Bastard Sword.\n* Lesser: Parrying (+1 Insight bonus to AC and saves).\n* Greater: Fortified Defenses +25% (When a critical hit or sneak attack is scored on the wielder, there is a 25% chance that the critical hit or sneak attack is negated and the damage is rolled normally. This ability is considered an Insight bonus when determining stacking with other sources of fortification.)"
	default:
		name = "Dragonshard Focus"
		notes = "This item bestows additional benefits to those that bear a Dragonmark."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateAccursedFlame parses `{{AccursedFlame}}`.
func parseTemplateAccursedFlame(raw string) *api.Enchantment {
	const prefix = "{{AccursedFlame"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Accursed Flame"
	notes := "This weapon is wrapped in cursed flames, dealing an additional 6d6 Fire damage on each hit. When striking an enemy that has been Quelled, it also deals 6d6 Evil damage on each hit.\n\nThis effect makes the weapon evil aligned. Good characters wielding this weapon will suffer one negative level."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCursedMaelstrom parses `{{CursedMaelstrom}}`.
func parseTemplateCursedMaelstrom(raw string) *api.Enchantment {
	const prefix = "{{CursedMaelstrom"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Cursed Maelstrom"
	notes := "Striking an enemy has a chance to place a random, debilitating, and deadly curse on your foe."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateThunderforged(raw string) *api.Enchantment {
	const prefix = "{{Thunderforged"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	tier := strings.TrimSpace(inner)
	if tier == "" {
		tier = "0"
	}

	name := fmt.Sprintf("Thunder-Forged (Tier %s)", tier)
	var notes string

	switch tier {
	case "1":
		notes = "Though it has been reforged once, there is room to make the weapon even stronger. Tier 1 weapons have 0.5[W] over tier 0. Upgrading this item further will make it Bound to Character."
	case "2":
		notes = "Though it has been reforged twice, there is still room to make the weapon even stronger. Tier 2 weapons have +0.5[W] over Tier 1."
	default:
		tier = "0"
		name = "Thunder-Forged (Tier 0)"
		notes = "Reforging the weapon with certain ingredients could unleash more power."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplatePlanarSearing parses `{{PlanarSearing}}`.
func parseTemplatePlanarSearing(raw string) *api.Enchantment {
	const prefix = "{{PlanarSearing"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Planar Searing"
	notes := "This weapon harbors a burn unlike anything you've ever seen - As if otherworldly power has started to change it forever."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateIdentityCrisis parses `{{IdentityCrisis}}`.
func parseTemplateIdentityCrisis(raw string) *api.Enchantment {
	const prefix = "{{IdentityCrisis"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Identity Crisis"
	notes := "Enemies hit by this weapon are plagued by visions of their past and future selves, significantly slowing their movements."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMasterwork parses `{{Masterwork}}`.
func parseTemplateMasterwork(raw string) *api.Enchantment {
	const prefix = "{{Masterwork"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Masterwork"
	notes := "This weapon is more finely crafted than normal, providing a +1 enhancement bonus on attack rolls."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCompletedWeapon parses `{{CompletedWeapon}}`.
func parseTemplateCompletedWeapon(raw string) *api.Enchantment {
	const prefix = "{{CompletedWeapon"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Completed Weapon"
	notes := "This item is fully completed, and as a result deals an additional .5[W] damage."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateEchoesOfAngdrelve parses `{{EchoesOfAngdrelve|(Enhancement Amount)|(Bonus Type)}}`.
func parseTemplateEchoesOfAngdrelve(raw string) *api.Enchantment {
	const prefix = "{{EchoesOfAngdrelve"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	amount := "1"
	bonusType := "Enhancement"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			if a := strings.TrimSpace(parts[0]); a != "" {
				amount = a
			}
		}
		if len(parts) >= 2 {
			if b := strings.TrimSpace(parts[1]); b != "" {
				bonusType = b
			}
		}
	}

	name := "Echoes of Angdrelve"
	notes := fmt.Sprintf("Each strike from this devastating weapon deals an additional %sd6 Acid damage on each hit.", amount)
	notes += fmt.Sprintf(" %s bonus.", bonusType)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateThornyCrownofMadness parses `{{ThornyCrownofMadness}}`.
func parseTemplateThornyCrownofMadness(raw string) *api.Enchantment {
	const prefix = "{{ThornyCrownofMadness"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Thorny Crown of Madness"
	notes := "Strikes with this weapon have a chance to confuse your target, allowing them to harm and be harmed by friend and foe alike. Furthermore, hits with this weapon against Confused targets deal an additional 6d6 Chaos damage."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFinishingTouch parses `{{FinishingTouch}}`.
func parseTemplateFinishingTouch(raw string) *api.Enchantment {
	const prefix = "{{FinishingTouch"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Finishing Touch"
	notes := "This item is one step away from its completion. Bring it to a Cannith Reforging Station and combine it with melted materials to restore this item to its full potential."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMalleable parses `{{Malleable}}`.
func parseTemplateMalleable(raw string) *api.Enchantment {
	const prefix = "{{Malleable"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Malleable"
	notes := "This item has a magical aura of malleability and can be combined with any item that has the Fusible property to create a new, more powerful fusion of the two items."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFusible parses `{{Fusible}}`.
func parseTemplateFusible(raw string) *api.Enchantment {
	const prefix = "{{Fusible"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Fusible"
	notes := "Something about this item looks incomplete. Perhaps in the future it will be compatible with another item to create a brand-new fusion of the two."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFragmented parses `{{Fragmented}}`.
func parseTemplateFragmented(raw string) *api.Enchantment {
	const prefix = "{{Fragmented"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Fragmented"
	notes := "This item looks as though it is only one half of a greater item. Perhaps in the future it could be rejoined with its other half to reform the item in its original glory."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateImpact parses `{{Impact|(Magnitude)}}`.
func parseTemplateImpact(raw string) *api.Enchantment {
	const prefix = "{{Impact"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitude := "I"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := stripBrackets(parts[0])
			if v != "" {
				magnitude = v
			}
		}
	}

	var name string
	if strings.EqualFold(magnitude, "I") {
		name = "Impact"
	} else {
		name = "Impact " + magnitude
	}

	baseNotesStart := "Passive: The base critical threat range is doubled. "
	baseNotesEnd := "This does not stack with the Improved Critical Feat. Vorpal strikes by this weapon also bypass all Fortification."

	var mid string
	switch strings.ToLower(magnitude) {
	case "ii":
		mid = "This weapon deals an additional +0.5[W], and the base critical threat range is doubled. "
	case "iii":
		mid = "This weapon deals an additional +1[W], and the base critical threat range is doubled. "
	case "iv":
		mid = "This weapon deals an additional +1.5[W], and the base critical threat range is doubled. "
	case "v":
		mid = "This weapon deals an additional +2[W], and the base critical threat range is doubled. "
	}

	notes := baseNotesStart + mid + baseNotesEnd

	return &api.Enchantment{
		Name:  name,
		Notes: &notes,
	}
}

// parseTemplateFracturing parses `{{Fracturing|(Enhancement Amount)|(Sides)|(Title)}}`.
func parseTemplateFracturing(raw string) *api.Enchantment {
	const prefix = "{{Fracturing"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	amount := "2"
	sides := "6"
	name := "Fracturing"

	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			if a := strings.TrimSpace(parts[0]); a != "" {
				amount = a
			}
		}
		if len(parts) >= 2 {
			if s := strings.TrimSpace(parts[1]); s != "" {
				sides = s
			}
		}
		if len(parts) >= 3 {
			if t := strings.TrimSpace(parts[2]); t != "" {
				name = t
			}
		}
	}

	notes := fmt.Sprintf("This weapon is ideal for breaking bones and does %sd%s damage to targets that have skeletons or are made of bone.", amount, sides)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateElementalSpiral parses `{{ElementalSpiral}}`.
func parseTemplateElementalSpiral(raw string) *api.Enchantment {
	const prefix = "{{ElementalSpiral"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Elemental Spiral"
	notes := "Elemental power pulses within you.\n\n'Can you feel the Heartbeat? Can you hear the Music? Can you comprehend the Magic? It is there, right at your fingertips.'"

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateAntiMagicRunes parses `{{AntiMagicRunes}}`.
func parseTemplateAntiMagicRunes(raw string) *api.Enchantment {
	const prefix = "{{AntiMagicRunes"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Anti-Magic Runes"
	notes := "The runes inscribed on this weapon activate on a critical hit and attempt to suppress the spell casting abilities of the target. The target must make a Fortitude DC: 20 save or be unable to cast spells for 18 seconds."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCrushingWave parses `{{CrushingWave|Type}}`.
func parseTemplateCrushingWave(raw string) *api.Enchantment {
	const prefix = "{{CrushingWave"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	name := "Crushing Wave"
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) > 0 {
			switch strings.ToLower(strings.TrimSpace(parts[0])) {
			case "tsunami":
				name = "Crushing Tsunami"
			}
		}
	}

	notes := "This weapon stores the unstoppable force of the oceans fury deep within. When this weapon is used this power occasionally comes to the surface, crushing enemies beneath a torrent of frigid water."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateEntangling parses `{{Entangling|(Type)}}`.
func parseTemplateEntangling(raw string) *api.Enchantment {
	const prefix = "{{Entangling"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	variant := ""
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) > 0 {
			variant = strings.TrimSpace(parts[0])
		}
	}

	name := "Entangling"
	dc := "35"
	if strings.EqualFold(variant, "Yarn") {
		name = "Entangling Yarn"
		dc = "35"
	} else if strings.EqualFold(variant, "Legendary Yarn") {
		name = "Legendary Entangling Yarn"
		dc = "110"
	}

	notes := fmt.Sprintf("Enemies struck by this weapon have a small chance to be tangled up in its enchanged yarn, becoming Entangled and preventing all movement for 9 seconds. A Reflex DC: %s save negates this effect.", dc)
	if name == "Legendary Entangling Yarn" {
		notes = fmt.Sprintf("Enemies struck by this weapon have a small chance to be tangled up in its enchanged yarn, becoming Entangled and preventing all movement for 9 seconds. A Reflex DC: %s Save negates this effect.", dc)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateSlowburst parses `{{Slowburst|(Slowburst Version)}}`.
func parseTemplateSlowburst(raw string) *api.Enchantment {
	const prefix = "{{Slowburst"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	version := "Regular"
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) > 0 {
			if v := strings.TrimSpace(parts[0]); v != "" {
				version = v
			}
		}
	}

	name := "Slowburst"
	dc := "15"

	switch strings.ToLower(version) {
	case "improved":
		name = "Improved Slowburst"
		dc = "28"
	case "legendary":
		name = "Legendary Slowburst"
		dc = "90"
	}

	notes := fmt.Sprintf("%s: This weapon has an image of a snail worked into its hilt or grip, and it feels cold to the touch. Whenever you score a critical hit with this weapon, the target is slowed for 30 seconds. A Will DC: %s save negates this effect.", name, dc)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMindTurbulence parses `{{MindTurbulence}}`.
func parseTemplateMindTurbulence(raw string) *api.Enchantment {
	const prefix = "{{MindTurbulence"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Conecentration"
	notes := "This item fills your mind with chaos, disrupting your thoughts and causing a -10 Concentration penalty."

	return &api.Enchantment{
		Name:      name,
		Amount:    "-10",
		BonusType: "Penalty",
		Notes:     new(notes),
	}
}

// parseTemplateLifedrinker parses `{{Lifedrinker}}`.
func parseTemplateLifedrinker(raw string) *api.Enchantment {
	const prefix = "{{Lifedrinker"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Lifedrinker"
	notes := "On an attack roll of 20 which is confirmed as a critical hit, this power comes to the surface, granting 25 temporary hit points to the wielder and deals 5d5+20 damage to the target. Creatures with the Fire trait take double this damage instead."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateRadiantBlast parses `{{RadiantBlast}}`.
func parseTemplateRadiantBlast(raw string) *api.Enchantment {
	const prefix = "{{RadiantBlast"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Radiant Blast"
	notes := "Occasionally, this dynamic power comes to the surface, devastating enemies with a massive blast of radiant light."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateDemonFever parses `{{DemonFever|Level}}`.
func parseTemplateDemonFever(raw string) *api.Enchantment {
	const prefix = "{{DemonFever"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	name := "Demon Fever"
	notes := "This weapon is infected with a night hag's Demon Fever disease. On critical hits it will transfer the disease to enemies, dealing 1d8 Constitution damage. A successful Fortitude DC: 22 save negates this effect."

	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) >= 1 {
			if strings.EqualFold(strings.TrimSpace(parts[0]), "Legendary") {
				name = "Legendary Demon Fever"
				notes = "This deadly weapon saps the health from your enemies, dealing 3 Constitution damage on each critical hit."
			}
		}
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBlindingFlash parses `{{BlindingFlash}}`.
func parseTemplateBlindingFlash(raw string) *api.Enchantment {
	const prefix = "{{BlindingFlash"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Blinding Flash"
	notes := "If you roll a 20 when attacking and confirm the critical hit, the target will become blinded by a burst of high-intensity light."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBlindingEmbers parses `{{BlindingEmbers|type}}`.
func parseTemplateBlindingEmbers(raw string) *api.Enchantment {
	const prefix = "{{BlindingEmbers"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	name := "Blinding Embers"
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) >= 1 {
			if strings.EqualFold(strings.TrimSpace(parts[0]), "Legendary") {
				name = "Legendary Blinding Embers"
			}
		}
	}

	notes := "If you roll a 20 when attacking and confirm the critical hit, the target will become blinded by a burst of fiery sparks."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateTheDraggingOfTheDepths parses `{{TheDraggingOfTheDepths|(Enhancement Amount)|(Bonus Type)}}`.
func parseTemplateTheDraggingOfTheDepths(raw string) *api.Enchantment {
	const prefix = "{{TheDraggingOfTheDepths"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	amount := "1"
	bonusType := "Competence"
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) >= 1 {
			if a := strings.TrimSpace(parts[0]); a != "" {
				amount = a
			}
		}
		if len(parts) >= 2 {
			if b := strings.TrimSpace(parts[1]); b != "" {
				bonusType = b
			}
		}
	}

	name := "The Dragging of the Depths"
	notes := fmt.Sprintf("Attuned to the dark depths of the waves below, this weapon is cold to the touch and unholy. Each hit drains life from your enemies, dealing %sd6 Evil damage, and when striking Good enemies, it also deals an additional %sd6 Cold damage.", amount, amount)

	if bonusType != "Competence" && bonusType != "" {
		notes += fmt.Sprintf(" This is a %s bonus.", bonusType)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFlamebitten parses `{{Flamebitten}}`.
func parseTemplateFlamebitten(raw string) *api.Enchantment {
	const prefix = "{{Flamebitten"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Flamebitten"
	notes := "Applies a stack of Vulnerable (1% more damage for 3 seconds. This effect stacks up to 20 times, and loses one stack on expiration.). This effect may only occur on-hit once every two seconds.\n\nOn Vorpal: Applies a stack of Ashcarred (-1 to all Saving Throws. Non-bosses also move and attack 5% slower. This effect stacks up to 5 times.)"

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBrillanceoftheShatteredSun parses `{{BrillanceoftheShatteredSun}}`.
func parseTemplateBrillanceoftheShatteredSun(raw string) *api.Enchantment {
	const prefix = "{{BrillanceoftheShatteredSun"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Brilliance of the Shattered Sun"
	notes := "Light drips from within this small container, sparking before your eyes. With this item equipped, your offensive attacks and spells have a chance of creating a burst of pure light, dealing Light damage and blinding enemies."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFeeding parses `{{Feeding|(Enhancement Amount)}}`.
func parseTemplateFeeding(raw string) *api.Enchantment {
	const prefix = "{{Feeding"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	amount := ""
	if strings.HasPrefix(content, "|") {
		amount = strings.TrimSpace(content[1:])
	}

	name := "Feeding"
	if amount != "" {
		name = fmt.Sprintf("Feeding %s", amount)
	} else {
		amount = "1" // Default amount if not specified
	}

	notes := fmt.Sprintf("On Vorpal Hit: Your target incurs one Negative level, and you gain +%s Temporary Hit Points. (These Temporary Hit Points last for one minute, or until used to negate incoming damage.)", amount)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMagmaSurge parses `{{MagmaSurge|(Type)}}`.
func parseTemplateMagmaSurge(raw string) *api.Enchantment {
	const prefix = "{{MagmaSurge"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	magmaType := ""
	if strings.HasPrefix(content, "|") {
		magmaType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Magma Surge"
	if strings.EqualFold(magmaType, "Legendary") {
		name = "Legendary Magma Surge"
	}

	notes := "This weapon stores the immeasurable heat of the planet's molten mantle. When this weapon is used, superheated magma occasionally surges to the surface, slowing an enemy down and inflicting massive fire damage over time."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateWrathOfTheZealot parses `{{WrathOfTheZealot}}`.
func parseTemplateWrathOfTheZealot(raw string) *api.Enchantment {
	const prefix = "{{WrathOfTheZealot"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Wrath of the Zealot"
	notes := "You gain a Sacred Bonus to Damage equal to half your Religious Lore feats."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMedusaFury parses `{{MedusaFury}}`.
func parseTemplateMedusaFury(raw string) *api.Enchantment {
	const prefix = "{{MedusaFury"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Medusa Fury"
	notes := "When you fall below 25% of your maximum hit points you will enter a constant Medusa Fury until your hit points return to 25% or greater. Medusa Fury grants a +4 morale bonus to Strength and Constitution, a 5% morale bonus to your chance to doublestrike, and a -25% penalty to fortifications."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateStealerOfSouls parses `{{StealerOfSouls|Soul Count|Type}}`.
func parseTemplateStealerOfSouls(raw string) *api.Enchantment {
	const prefix = "{{StealerOfSouls"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	params := strings.Split(content, "|")
	soulCount := "20" // Default as seen in some items, or could be empty. Switch uses {{{1}}}
	stealerType := ""

	if len(params) > 1 {
		soulCount = strings.TrimSpace(params[1])
	}
	if len(params) > 2 {
		stealerType = strings.TrimSpace(params[2])
	}

	name := "Stealer of Souls"
	var notes string

	if strings.EqualFold(stealerType, "overwhelming") {
		name = "Overwhelming Stealer of Souls"
		notes = "This weapon tears at the very essence of your foes. On any strike, this weapon applies a single stack of Soul Scar, which reduces your target's Will Saves, Armor Class, and Fortification by 1 per stack, max 10. Occasionally, this weapon attempts to rip the life from your foe, as if it were the victim of a Phantasmal Killer spell with a Will DC 100 save. Bosses (and enemies with more than 10,000 hit points) are immune to this effect.\n\nKilling a monster will consume its soul, adding a stack of Consumed Soul to you. Consumed Souls stack up to 20 times, and linger for 20 seconds. Each one provides a +1 Profane bonus to Damage and Melee Power. If you block or unequip this weapon, the Consumed Souls will be released."
	} else {
		if strings.EqualFold(stealerType, "Legendary") {
			name = "Legendary Stealer of Souls"
		}
		notes = fmt.Sprintf("This item hungers for the Souls of those you have defeated. On a Vorpal hit with this weapon, this item will absorb some of its Soul, draining one level from the target. When you strike the killing blow on an enemy, this item retains one Defeated Soul, up to a maximum of %s. Each Defeated Soul grants you +1 Profane bonus to Melee Power and +1 Profane bonus to Damage. If you block or unequip this item, the Defeated Souls will be released. Defeated Souls last for 30 seconds.", soulCount)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCloudburst parses `{{Cloudburst}}`.
func parseTemplateCloudburst(raw string) *api.Enchantment {
	const prefix = "{{Cloudburst"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Cloudburst"
	notes := "On Vorpal, this weapon triggers a Cloudburst, striking its target with lightning and dealing sonic damage to surrounding enemies through a powerful thunderclap."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCursespewing parses `{{Cursespewing|(Type)}}`.
func parseTemplateCursespewing(raw string) *api.Enchantment {
	const prefix = "{{Cursespewing"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	curseType := ""
	if strings.HasPrefix(content, "|") {
		curseType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Cursespewing"
	damageDice := "1d6"

	if strings.EqualFold(curseType, "Improved") {
		name = "Improved Cursespewing"
		damageDice = "2d6"
	} else if strings.EqualFold(curseType, "Legendary") {
		name = "Legendary Cursespewing"
		damageDice = "5d6" // Common scaling for Legendary Cursespewing
	}

	notes := fmt.Sprintf("On a natural 20 attack, this weapon lashes out with a vengeful curse that confers a -4 morale penalty on attack rolls, damage rolls, saving throws, and skill checks. This agonizing curse also causes the victim to take %s damage every two seconds for a duration of twelve seconds. Additional vorpal strikes while this curse is active will extend the duration by another 12 seconds.", damageDice)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBonesplitter parses `{{Bonesplitter}}`.
func parseTemplateBonesplitter(raw string) *api.Enchantment {
	const prefix = "{{Bonesplitter"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Bonesplitter"
	notes := "On an attack roll of 20 which is confirmed as a critical hit, the weapon breaks multiple bones in the target's body, causing significant impairment. Creatures with skeletons take 40d6 damage and will have their movement and attacks slowed by 25% and their attack damage reduced by 25% when their bones are shattered."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBoneshatter parses `{{Boneshatter|(Type)}}`.
func parseTemplateBoneshatter(raw string) *api.Enchantment {
	const prefix = "{{Boneshatter"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	boneType := ""
	if strings.HasPrefix(content, "|") {
		boneType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Boneshatter"
	damageDice := "40d6"

	if strings.EqualFold(boneType, "Lesser") {
		name = "Lesser Boneshatter"
		damageDice = "10d6"
	}

	notes := fmt.Sprintf("This weapon is powerful enough to shatter the bones of those it strikes. On an attack roll of 20 which is confirmed as a critical hit, the weapon breaks multiple bones in the target's body, causing significant impairment. Creatures with skeletons take %s damage and will have their movement and attacks slowed by 25% and their attack damage reduced by 25% when their bones are shattered.", damageDice)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateStonePrison parses `{{StonePrison|(Type)}}`.
func parseTemplateStonePrison(raw string) *api.Enchantment {
	const prefix = "{{StonePrison"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	prisonType := ""
	if strings.HasPrefix(content, "|") {
		prisonType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Stone Prison"
	dc := "27"

	if strings.EqualFold(prisonType, "Greater") {
		name = "Greater Stone Prison"
		dc = "33"
	} else if strings.EqualFold(prisonType, "Legendary") {
		name = "Legendary Stone Prison"
		dc = "100"
	}

	notes := fmt.Sprintf("This weapon is invested with the power of the earth. On an attack roll of 20 which is confirmed as a critical hit it will attempt to turn the target to stone, as the Flesh to Stone spell. A successful Fortitude DC: %s save negates the effect.", dc)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateTheReaver parses `{{TheReaver|Type}}`.
func parseTemplateTheReaver(raw string) *api.Enchantment {
	const prefix = "{{TheReaver"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	name := "The Reaver's Resolve"
	notes := "While the Stormreaver was a guest of The Celestial One, Ternathear, some know that he wallowed for a time in drink. He had lost everything he had once held dear - even his prized blade, Cloudburst. After a group of adventurers defeated his former lieutenant, the storm giant lich Sor'jek Incanni, the Stormreaver resolved to take matters into his own two hands."

	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) >= 1 {
			variant := strings.TrimSpace(parts[0])
			if strings.EqualFold(variant, "Quest") {
				name = "The Reaver's Quest"
				notes = "The Stormreaver slipped from The Celestial One's care, and set out across Xen'drik for the components to craft a new sword. Purest Mithral was gathered from the Bluespine Peaks, and diamonds from the Burning Mountain, ground to dust under his heal. He forged his blade in the heart of Mount Reysalon's volcano, battering itself against Shargon's Teeth."
			} else if strings.EqualFold(variant, "Fate") {
				name = "The Reaver's Fate"
				notes = "With Skybreaker in hand, The Stormreaver returned to Gianthold to fight the menace to his people, and to seek triumph where he had once found only failure."
			}
		}
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateSlicingWinds parses `{{SlicingWinds|(Type)}}`.
func parseTemplateSlicingWinds(raw string) *api.Enchantment {
	return parseVariantTemplate(raw, "{{SlicingWinds", "Slicing Winds", "This weapon stores the cyclonic might of the windstorm within. When the weapon is used, this power can come to the surface as a series of rushing, cutting winds that deal slashing damage to the target over several seconds.", "Legendary", "Legendary Slicing Winds", "This weapon whistles with the wind. On hit, this mysterious power has a chance of coming to the surface, slicing at the struck enemy for a significant amount of Slashing damage.")
}

// parseTemplateShadowblade parses `{{Shadowblade}}`.
func parseTemplateShadowblade(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{Shadowblade", "Shadowblade", "This blade is made of pure force and is surprisingly light to the touch. It bypasses the Incorporeal chances of Ethereal monsters innately.")
}

// parseTemplateSkybreaker parses `{{Skybreaker}}`.
func parseTemplateSkybreaker(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{Skybreaker", "Skybreaker", "On Hit: 3d6 Electric damage. On Critical Hit: 10d6 additional Sonic damage. On Vorpal Hit: 60d2 additional Electrical damage to your target, plus a shockwave that deals an additional 45d2 Sonic damage to all nearby foes.")
}

// parseTemplateWildFrenzy parses `{{WildFrenzy}}`.
func parseTemplateWildFrenzy(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{WildFrenzy", "Wild Frenzy", "This weapon has a tendency to drive those it strikes insane. On an attack roll of 20 which is confirmed as a critical hit the target will go wild and attack its own allies for 15 seconds if it fails a Will DC: 25 save. Enemies driven wild in this way, however, have a chance of coming to their senses if damaged.")
}

// parseTemplateUnbalancing parses `{{Unbalancing}}`.
func parseTemplateUnbalancing(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{Unbalancing", "Unbalancing", "Anything that melee attacks a character with an Unbalancing item has a chance to be pulled off balance giving them -2 penalty to AC.")
}

// parseTemplateUnwieldy parses `{{Unwieldy}}`.
func parseTemplateUnwieldy(raw string) *api.Enchantment {
	const prefix = "{{Unwieldy"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Unwieldy"
	notes := "This weapon is very large and makes you clumsier as you wield it, causing a -2 Dexterity penalty."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateTelekinetic parses `{{Telekinetic|(Type)}}`.
func parseTemplateTelekinetic(raw string) *api.Enchantment {
	const prefix = "{{Telekinetic"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	teleType := ""
	if strings.HasPrefix(content, "|") {
		teleType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Telekinetic"
	var notes string

	if strings.EqualFold(teleType, "Legendary") {
		name = "Legendary Telekinetic"
		notes = "On hit, this has a chance of knocking your enemies off their feet. Struck enemies must make a Reflex DC: 100 save or be knocked down."
	} else if strings.EqualFold(teleType, "Epic") {
		name = "Epic Telekinetic"
		notes = "Targets that suffer a critical hit from a telekinetic weapon must make a DC Strength or Dexterity DC: 35 check or be knocked down. The target will then be force to make Balance DC: 16 checks to recover from the effect."
	} else {
		// Greater is mentioned in documentation but no example text provided.
		// "All others are normal" suggests we use the default text for Greater as well.
		if strings.EqualFold(teleType, "Greater") {
			name = "Greater Telekinetic"
		}
		notes = "Targets that suffer a critical hit from a telekinetic weapon must make a DC Strength or Dexterity DC: 17 check or be knocked down. The target will then be force to make Balance DC: 16 checks to recover from the effect."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateSunBurst parses `{{SunBurst|(Type)|(Title)}}`.
func parseTemplateSunBurst(raw string) *api.Enchantment {
	const prefix = "{{SunBurst"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	var sbType, title string
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(strings.TrimPrefix(content, "|"), "|")
		if len(parts) > 0 {
			sbType = strings.TrimSpace(parts[0])
		}
		if len(parts) > 1 {
			title = strings.TrimSpace(parts[1])
		}
	}

	name := "Sun Burst"
	var notes string

	if strings.EqualFold(sbType, "Greater") || strings.EqualFold(sbType, "Lesser") {
		if strings.EqualFold(sbType, "Greater") {
			name = "Greater Sun Burst"
		} else {
			name = "Lesser Sun Burst"
		}
		notes = "Occasionally, this power comes to the surface, unleashing a nova of light which will blind the struck enemy, dealing severe light damage to it and any other nearby foes."
	} else {
		notes = "This weapon flashes an intense burst of sunlight on any critical hit. The target is blasted for 6d6 of light damage and is blinded as well. Oozes and Undead take 12d6 light damage. A successful Reflex DC: 22 save reduces the damage by half and negates the blindness."
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplatePlantSlaying parses `{{PlantSlaying}}`.
func parseTemplatePlantSlaying(raw string) *api.Enchantment {
	const prefix = "{{PlantSlaying"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Plant Slaying"
	notes := "This item is keyed to plants. If it strikes such a creature, the target must make a Fortitude DC: 20 save or die instantly."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCleverStrike parses `{{CleverStrike}}`.
func parseTemplateCleverStrike(raw string) *api.Enchantment {
	const prefix = "{{CleverStrike"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Clever Strike"
	notes := "This item changes its enhancement bonus if your Intelligence is high enough. The enhancement bonus will be equal to your Intelligence modifier while the item is equipped (minimum 6, maximum 10)."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCripplingFlames parses `{{CripplingFlames}}`.
func parseTemplateCripplingFlames(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{CripplingFlames", "Crippling Flames", "Crippling Flames: On Hit: 5% chance to apply 2 Negative Levels. On Crit: 10d20+125 Fire Damage.")
}

// parseTemplateStaticAttraction parses `{{StaticAttraction}}`.
func parseTemplateStaticAttraction(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{StaticAttraction", "Static Attraction", "This weapon attracts the static electricity in the air, and over time will charge with magic. Every five seconds, this weapon gains a charge of Static Electricity, up to a maximum of 3, providing +10 Exceptional bonus to Electric Spell Power and a 5% Exceptional bonus to Electric Spell Lore. When you cast an Electric spell, all stacks are consumed.")
}

// parseTemplateSoulTear parses `{{SoulTear}}`.
func parseTemplateSoulTear(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{SoulTear", "Soul Tear", "This weapon tears at the soul of your foes, reducing their PRR and Healing Amplification.")
}

// parseTemplateMindTear parses `{{MindTear}}`.
func parseTemplateMindTear(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{MindTear", "Mind Tear", "This weapon tears at the identity of your foes, reducing their MRR and Spell Power.")
}

// parseTemplateTheMoralCompass parses `{{TheMoralCompass}}`.
func parseTemplateTheMoralCompass(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{TheMoralCompass", "The Moral Compass", "An oft repeated mantra of the Shintao is written on these sacred handwraps:\n\n\"True strength comes from within, and true power comes from rising above.\" While wearing these Handwraps, Monks will gain additional power and bonuses based on their Philosophy.")
}

// parseTemplateThaarakCorrosion parses `{{ThaarakCorrosion}}`.
func parseTemplateThaarakCorrosion(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{ThaarakCorrosion", "Thaarak Corrosion", "Like a Thaarak Hound's vitriolic breath, this weapon is corrosive and can damage enemies over time. Occasionally, it applies a lasting effect to its targets that deals 2d4 acid damage every second for six seconds. If the effect is reapplied before it has a chance to wear off, the duration will reset and stack up to three times.")
}

// parseTemplateSoulEating parses `{{SoulEating}}`.
func parseTemplateSoulEating(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{SoulEating", "Soul Eating", "On a Vorpal strike, the dark energy that inhabits this weapons will tear at the soul of your foe, inflicting up to three negative levels to your target. The Soul Eating weapons will feed this stolen life back to you in the form of 35 Temporary Hit Points that last for one minute or until depleted by incoming damage.")
}

// parseTemplateMonkPath parses `{{MonkPath|(stance)}}`.
func parseTemplateMonkPath(raw string) *api.Enchantment {
	const prefix = "{{MonkPath"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	stance := ""
	if strings.HasPrefix(content, "|") {
		stance = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	var name, notes string
	if strings.EqualFold(stance, "sun") {
		name = "Path of the Fire Dragon"
		notes = "While wearing this item and in sun stance, you gain a +54 Equipment bonus to Fire Spell Power, which increases damage from spells and fire finishing moves such as Breath of the Fire Dragon."
	} else if strings.EqualFold(stance, "mountain") {
		name = "Path of the Guarding Stone"
		notes = "While wearing this item and in mountain stance, there is a chance you will be protected by a Stoneskin spell when enemies strike you."
	} else {
		// Default to mountain if stance is unknown or missing, based on the switch logic usually having a default or first case
		// But here it seems safer to just return a basic name if unknown
		name = "Monk Path"
		notes = "Please add which monk stance is being used (Sun, Mountain)"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplatePathoftheGuardingStone parses `{{PathoftheGuardingStone}}`.
func parseTemplatePathoftheGuardingStone(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{PathoftheGuardingStone", "Path of the Guarding Stone", "While wearing this item and in mountain stance, there is a chance you will be protected by a Stoneskin spell when enemies strike you.")
}

// parseTemplateBetterOffhanded parses `{{BetterOffhanded}}`.
func parseTemplateBetterOffhanded(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{BetterOffhanded", "Better Offhanded", "While this item is in your offhand, it gains +2[W].")
}

// parseTemplateSirocco parses `{{Sirocco|(Type)}}`.
func parseTemplateSirocco(raw string) *api.Enchantment {
	const prefix = "{{Sirocco"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	siroType := ""
	if strings.HasPrefix(content, "|") {
		siroType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Sirocco"
	var notes string

	if strings.EqualFold(siroType, "Legendary") {
		name = "Legendary Sirocco"
		notes = "On hit, this has a chance of blinding your enemies with whirling sand. Struck enemies must make a Fortitude DC: 100 save or be blinded."
	} else if strings.EqualFold(siroType, "Greater") {
		name = "Greater Sirocco"
		notes = "A critical hit with this weapon causes a whirlwind of desert sand to swirl about the target, temporarily blinding it. A successful Reflex DC: 38 save prevents the effect"
	} else {
		notes = "A critical hit with this weapon causes a whirlwind of desert sand to swirl about the target, temporarily blinding it. A successful Reflex DC: 20 save prevents the effect"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateRibcracker parses `{{Ribcracker|(Magnitude)}}`.
func parseTemplateRibcracker(raw string) *api.Enchantment {
	const prefix = "{{Ribcracker"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitude := strings.ToLower(strings.TrimSpace(inner))

	var notes string
	var nameSuffix string

	switch magnitude {
	case "i":
		nameSuffix = "I"
		notes = "On Critical Hit: 3d6 bludgeoning damage from weapons with x2 Critical Multiplier, 3d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 3d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	case "ii":
		nameSuffix = "II"
		notes = "On Critical Hit: 5d6 bludgeoning damage from weapons with x2 Critical Multiplier, 5d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 5d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	case "iii":
		nameSuffix = "III"
		notes = "On Critical Hit: 7d6 bludgeoning damage from weapons with x2 Critical Multiplier, 7d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 7d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	case "iv":
		nameSuffix = "IV"
		notes = "On Critical Hit: 9d6 bludgeoning damage from weapons with x2 Critical Multiplier, 9d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 9d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	case "v":
		nameSuffix = "V"
		notes = "On Critical Hit: 11d6 bludgeoning damage from weapons with x2 Critical Multiplier, 11d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 11d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	case "vi":
		nameSuffix = "VI"
		notes = "On Critical Hit: 13d6 bludgeoning damage from weapons with x2 Critical Multiplier, 13d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 13d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	case "vii":
		nameSuffix = "VII"
		notes = "On Critical Hit: 15d6 bludgeoning damage from weapons with x2 Critical Multiplier, 15d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 15d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	case "viii":
		nameSuffix = "VIII"
		notes = "On Critical Hit: 17d6 bludgeoning damage from weapons with x2 Critical Multiplier, 17d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 17d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	default:
		notes = "On Critical Hit: 3d6 bludgeoning damage from weapons with x2 Critical Multiplier, 3d8 bludgeoning damage from weapons with a x3 Critical Multiplier, and 3d10 bludgeoning damage from weapons with a x4 or greater Critical Multiplier."
	}

	name := "Ribcracker"
	if nameSuffix != "" {
		name += " " + nameSuffix
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}
