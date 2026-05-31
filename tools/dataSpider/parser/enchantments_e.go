package parser

import (
	"fmt"
	"strconv"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

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

	isArmor := armorTypes[itemType] || strings.Contains(itemType, "armor")
	isShield := shieldTypes[itemType] || strings.Contains(itemType, "shield") || strings.Contains(itemType, "buckler")
	isWeapon := weaponTypes[itemType] || strings.Contains(itemType, "weapon")

	// 1. Handle Armor/Shield bonus to AC
	if isArmor || isShield {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Armor Class",
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// 2. Handle Weapon/Shield bonus to Attack and Damage Rolls
	if isWeapon || isShield {
		attackName := "Attack Rolls"
		damageName := "Damage Rolls"
		if isShield {
			attackName += " (Shield)"
			damageName += " (Shield)"
		}
		enchantments = append(enchantments, &api.Enchantment{
			Name:      attackName,
			Amount:    amount,
			BonusType: bonusType,
		})
		enchantments = append(enchantments, &api.Enchantment{
			Name:      damageName,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// If no specific item type was matched (e.g., Trinket, Doc is incomplete),
	// we still return what was collected, which might be an empty slice.

	return enchantments
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


// Template:Elasticity
// No parameters. Documentation indicates it simply marks the item as "Elasticity" with critical multiplier increase.
func parseTemplateElasticity() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Elasticity",
		Notes: new("When rolling a 19 or 20 on a ranged attack, your critical multiplier is increased by +1."),
	}
}

// parseTemplateWeaponMod handles Template:WeaponMod
// It takes up to 10 ability abbreviations and returns a slice of Attack and Damage modifiers.

func parseTemplateElementalArrow(rawEAValue string) *api.Enchantment {
	const prefix = "{{ElementalArrow|"
	const suffix = "}}"

	if !strings.HasPrefix(rawEAValue, prefix) || !strings.HasSuffix(rawEAValue, suffix) {
		return nil
	}

	paramList := rawEAValue[len(prefix) : len(rawEAValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Element)|(Style)|(Title)

	// 1. Element (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	element := stripBrackets(parts[0])
	if element == "" {
		return nil
	}

	var style = "Basic" // Default style
	var title = ""

	// 2. Style (Optional, Index 1)
	if len(parts) >= 2 {
		val := stripBrackets(parts[1])
		if val != "" {
			style = val
		}
	}

	// 3. Title (Optional, Index 2)
	if len(parts) >= 3 {
		title = stripBrackets(parts[2])
	}

	// Resolve amount (damage dice) based on style
	var amount = ""
	normalizedStyle := strings.ToLower(style)
	switch normalizedStyle {
	case "improved":
		amount = "{{Dice||4|4||4}}"
	case "greater":
		amount = "{{Dice||6|4||6}}"
	case "superior":
		amount = "{{Dice||8|4||8}}"
	case "sovereign":
		amount = "{{Dice||10|4||10}}"
	case "lesser":
		amount = "{{Dice||2|4}}"
	default:
		amount = "{{Dice||3|4||3}}"
	}

	// Resolve the final name
	var name string
	if title != "" {
		name = title
	} else {
		if normalizedStyle == "basic" || normalizedStyle == "" {
			name = element + " Arrow"
		} else {
			name = cases.Title(language.English).String(style) + " " + element + " Arrow"
		}
	}

	// Resolve the damage dice if it's a template
	if amount != "" {
		diceData := ParseTemplateDice(amount)
		amount = diceData.Raw
	}

	return &api.Enchantment{
		Name:    name,
		Element: element,
		Amount:  amount,
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


// Template: ExtraSongs
// Usage: {{ExtraSongs|(Count)|(Hide Fast Regen)}}
func parseTemplateExtraSongs(raw string) []*api.Enchantment {
	const prefix = "{{ExtraSongs"
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
	count := "1"
	hideRegen := ""

	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		count = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		hideRegen = strings.TrimSpace(parts[1])
	}

	var enchantments []*api.Enchantment

	// 1. Extra Bard Song uses
	enchantments = append(enchantments, &api.Enchantment{
		Name:   "Extra Songs",
		Amount: count,
		Notes:  new("You have " + count + " additional Bard Song use per rest. You must rest to gain your initial charge."),
	})

	// 2. Regeneration aspect (default 10% faster)
	if hideRegen == "" {
		enchantments = append(enchantments, &api.Enchantment{
			Name:   "Bard Song (Regeneration)",
			Amount: "10%",
			Notes:  new("This item makes your Bard Songs regenerate 10% faster."),
		})
	}

	return enchantments
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


func parseTemplateEchoesof2006() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Echoes of 2006",
		Notes: new("Take a trip into the past!"),
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

func parseTemplateEarthgrab() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Earthgrab",
		Notes: new("When the wearer of this item is used, this power occasionally comes to the surface, calling on the earth to erupt from the ground and hold an enemy in place."),
	}
}

// parseTemplateLightsOut handles Template:LightsOut

func parseTemplateElementalForm(raw string) *api.Enchantment {
	const prefix = "{{ElementalForm|"
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return nil
	}

	paramList := raw[len(prefix) : len(raw)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Elemental Type)|(Type of form)|(Title)
	// Switch is on {{lc:{{{2|}}}-{{{1|}}}}}

	var elementalType string
	if len(parts) > 0 {
		elementalType = strings.TrimSpace(parts[0])
	}
	var typeOfForm string
	if len(parts) > 1 {
		typeOfForm = strings.TrimSpace(parts[1])
	}
	var title string
	if len(parts) > 2 {
		title = strings.TrimSpace(parts[2])
	}

	key := strings.ToLower(typeOfForm + "-" + elementalType)

	var name string
	var notes string

	switch key {
	case "greater-water":
		name = "Greater Water Elemental Form"
		notes = "If you are a Water Elemental (either from a Druid Form or from Sorcerer's Elemental Apotheosis), you benefit from 5 additional caster levels for your Cold spells, as well as 50 Exceptional Cold Spell Power and 5% Exceptional Cold Spell Crit damage."
	default:
		name = "Elemental Form"
		notes = "UNKNOWN Entry, Update the Template"
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateTheFallingStar handles Template:TheFallingStar

func parseTemplateEnervation() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Enervation",
		Notes: new("This weapon stores a menacing, ravenous power deep within. When this weapon is used, this power occasionally comes to the surface, draining the life force of the enemy and giving negative levels."),
	}
}

// parseTemplateVulnerabilityGuard handles Template:VulnerabilityGuard

func parseTemplateElementalManipulation() []*api.Enchantment {
	const amount = "90"
	const bonusType = "Equipment"
	elements := []string{"Acid", "Cold", "Electric", "Fire"}

	var enchantments []*api.Enchantment
	for _, elem := range elements {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Spell Power: " + elem,
			Amount:    amount,
			BonusType: bonusType,
			Notes:     new("This item provides a +" + amount + " " + bonusType + " bonus to your " + elem + " Spell Power."),
		})
	}
	return enchantments
}

// parseTemplateParagonWeapon handles Template:ParagonWeapon
