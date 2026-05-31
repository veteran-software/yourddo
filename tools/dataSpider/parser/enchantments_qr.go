package parser

import (
	"fmt"
	"strconv"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

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
		name = fmt.Sprintf("%s (%s%% Chance)", baseName, percent)
	}

	return &api.Enchantment{
		Name:   name,
		Amount: percent, // Store percent in the Amount field
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


func parseTemplateRadiance(raw string) *api.Enchantment {
	const prefix = "{{Radiance|"
	const suffix = "}}"

	var inner string
	if strings.HasPrefix(raw, prefix) && strings.HasSuffix(raw, suffix) {
		inner = raw[len(prefix) : len(raw)-len(suffix)]
	} else if raw == "{{Radiance}}" {
		inner = ""
	} else {
		return nil
	}

	parts := splitParams(inner)
	// Usage: {{Radiance|(type)|(title)}}

	var radianceType = ""
	var title = ""

	if len(parts) >= 1 {
		radianceType = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		title = strings.TrimSpace(parts[1])
	}

	var name string
	var notes string

	if strings.EqualFold(radianceType, "Legendary") {
		name = "Legendary Radiance"
		notes = "Attacks and offensive spells have a chance to blind enemies with Light Damage."
	} else {
		name = "Radiance"
		notes = "This weapon is imbued with a brilliant, radiant power that deals an additional 4d6 of Light Damage and Blinds the target on a successful critical hit."
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateDisruptionGuard handles Template:DisruptionGuard

func parseTemplateRelentlessFury() *api.Enchantment {
	const templateName = "Relentless Fury"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
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


func parseTemplateRagingResilience() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Fortitude Saving Throws (While Raged)",
		Amount:    "4",
		BonusType: "Rage",
		Notes:     new("While Raged, +4 Rage bonus to Fortitude Saves."),
	}
}


func parseTemplateRepairSystems() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Repair Systems",
		Notes: new("This item gradually repairs constructs and living constructs."),
	}
}


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

func parseTemplateRockslide() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Rockslide",
		Notes: new("On hit, there is a chance to do massive bludgeoning damage to your enemy."),
	}
}

// parseTemplateShieldedbyMoonlight handles Template:ShieldedbyMoonlight

func parseTemplateRockShattering() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Rock Shattering",
		Notes: new("When striking stone-like creatures (such as gargoyles and earth elementals) or creatures that have been turned to stone, there is a chance this weapon will instantly shatter and destroy the target."),
	}
}

// parseTemplateShieldBash handles Template:ShieldBash

func parseTemplateRebellion() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Rebellion",
		Notes: new("Passive: All threat you generate from attacks and spells is reduced by 25%. On Critical Hit: This weapon will strike with exceptional accuracy, dealing an additional 13d6 Piercing damage."),
	}
}

// parseTemplateCoronach handles Template:Coronach

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

// parseTemplateBlinding handles Template:Blinding
