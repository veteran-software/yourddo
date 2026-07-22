package parser

import (
	"fmt"
	"strconv"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

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


func parseTemplateDodgeCap(rawDodgeCapValue string) *api.Enchantment {
	const prefix = "{{DodgeCap|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Maximum Dodge"

	if !strings.HasPrefix(rawDodgeCapValue, prefix) || !strings.HasSuffix(rawDodgeCapValue, suffix) {
		return nil
	}

	paramList := rawDodgeCapValue[len(prefix) : len(rawDodgeCapValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Usage: {{DodgeCap|(Enhancement Amount)|(Bonus Type)}}

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

	name := bonusType + " " + baseName + " +" + amount + "%"

	return &api.Enchantment{
		Name:      name,
		Amount:    amount + "%",
		BonusType: bonusType,
		Notes:     new("Passive: +" + amount + "% " + bonusType + " bonus to Maximum Dodge."),
	}
}


func parseTemplateDeadly(rawDeadlyValue string) *api.Enchantment {
	const prefix = "{{Deadly|"
	const suffix = "}}"
	const defaultBonusType = "Competence" // Default from documentation
	const baseName = "Damage Rolls"

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
	amount := fmt.Sprintf("-%d%%", amountNum)

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


func parseTemplateDruidicStoneshape() *api.Enchantment {
	const templateName = "Druidic Stoneshape"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
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


func parseTemplateDisruptionGuard(raw string) *api.Enchantment {
	const prefix = "{{DisruptionGuard|"
	const suffix = "}}"

	var inner string
	if strings.HasPrefix(raw, prefix) && strings.HasSuffix(raw, suffix) {
		inner = raw[len(prefix) : len(raw)-len(suffix)]
	} else if raw == "{{DisruptionGuard}}" {
		inner = ""
	} else {
		return nil
	}

	parts := splitParams(inner)
	// Usage: {{DisruptionGuard|(Title)}}

	name := "Disruption Guard"
	notes := "When the wearer of this item is successfully attacked in melee by undead, this power occasionally comes to the surface, annihilating enemy undead."

	if len(parts) >= 1 {
		title := strings.TrimSpace(parts[0])
		if title != "" {
			name = title
		}
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
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
		out = append(out, &api.Enchantment{Name: "Sneak Attack Rolls", Amount: enh, BonusType: "Enhancement"})
		out = append(out, &api.Enchantment{Name: "Sneak Attack Damage Rolls", Amount: timesTwo(enh), BonusType: "Enhancement"})
	case "custom":
		if enh != "" {
			out = append(out, &api.Enchantment{Name: "Sneak Attack Rolls", Amount: enh, BonusType: bt})
		}
		if dmg != "" {
			out = append(out, &api.Enchantment{Name: "Sneak Attack Damage Rolls", Amount: dmg, BonusType: bt})
		}
	case "": // #default path when type omitted
		fallthrough
	default: // #default in the template when unrecognized value
		if enh != "" {
			out = append(out, &api.Enchantment{Name: "Sneak Attack Rolls", Amount: enh, BonusType: bt})
			out = append(out, &api.Enchantment{Name: "Sneak Attack Damage Rolls", Amount: timesTwo(enh), BonusType: bt})
		}
	}

	if len(out) == 0 {
		return nil
	}
	return out
}

// --- Main Enchantment Dispatcher ---


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
		name = legendaryPrefix + name
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

// Template: Disintegration
// Usage: {{Disintegration|(Type)|(Enhancement Amount)}}
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
	enhancementAmount := ""
	if len(parts) >= 1 {
		disType = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		enhancementAmount = strings.TrimSpace(parts[1])
	}

	name := "Disintegration"
	note := "This weapon has a dark, insidious power deep within. Occasionally, this power lashes out violently at enemies and attempts to disintegrate them."

	switch {
	case strings.EqualFold(disType, "Utter"):
		name = "Utter Disintegration"
		note = "This weapon has a dark, insidious power deep within. Occasionally, this power lashes out violently at enemies and attempts to disintegrate them. This disintegrate is incredibly powerful, and will utterly destroy weaker foes."
	case strings.EqualFold(disType, "damage"):
		amount, err := strconv.Atoi(enhancementAmount)
		if err != nil {
			return nil
		}

		name = "Disintigrate +" + enhancementAmount
		note = fmt.Sprintf(
			"Strikes with this weapon have a small chance to call forth a spike of entropic force, dealing %sd20+%d untyped damage.",
			enhancementAmount,
			(amount+1)*9,
		)
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


// Template: Dragontouched
// Usage: {{Dragontouched}}
func parseTemplateDragontouched(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Dragontouched",
		Notes: new("This mythical material was created by combining an unknown metal with ancient enchantments known only by the dragons. This material is said to enchant the wielder as if they were protected by +5 armor enchantment, and provide leather items with additional flexibility, and metal armors additional protection."),
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


func parseTemplateDiehard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Diehard",
		Notes: new("If you are incapacitated while this item is equipped, it will automatically stabilize you as though you had the Diehard feat."),
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

func parseTemplateDisruptingWeapons() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Disrupting Weapons",
		Notes: new("While wearing this item, your melee and ranged weapons gain Vorpal Effect: On an attack roll of 20 which is confirmed as a critical hit this weapon will completely destroy an undead. Powerful undead may resist the vorpal effect until sufficiently damaged."),
	}
}

// parseTemplateDeadlySpiderVenom handles Template:DeadlySpiderVenom

func parseTemplateDeadlySpiderVenom() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Deadly Spider Venom",
		Notes: new("On an attack roll of 20 which is confirmed as a critical hit it will inflict the target with a poison that deals 10d6 poison damage every 2 seconds for 6 seconds. When the poison wears off, it also deals 3d6 Constitution damage to the target. A successful Fortitude DC: 34 save negates the Constitution damage."),
	}
}

// parseTemplateNegation handles Template:Negation

func parseTemplateDragonsEdge(fullTemplate string) *api.Enchantment {
	// Documentation: {{DragonsEdge|(Fort Bypass Amount)|(Bleeding Die Count)}}
	const prefix = "{{DragonsEdge"
	const suffix = "}}"

	if !strings.HasPrefix(fullTemplate, prefix) || !strings.HasSuffix(fullTemplate, suffix) {
		return nil
	}

	inner := fullTemplate[len(prefix) : len(fullTemplate)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
	}

	parts := strings.Split(inner, "|")
	var fortBypass, bleedingDice string

	if len(parts) >= 1 {
		fortBypass = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		bleedingDice = strings.TrimSpace(parts[1])
	}

	notes := fmt.Sprintf("Dragon's Edge: +%s%% Enhancement bonus to bypass enemy Fortification. On Crit: %sd8 Bleeding Damage to those that are vulnerable to it.", fortBypass, bleedingDice)

	return &api.Enchantment{
		Name:  "Dragon's Edge",
		Notes: new(notes),
	}
}

// parseTemplateArrowSpitting handles Template:ArrowSpitting
