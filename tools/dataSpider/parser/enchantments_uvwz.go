package parser

import (
	"fmt"
	"strconv"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

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


func parseTemplateWeaponMod(raw string) []*api.Enchantment {
	const prefix = "{{WeaponMod|"
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return nil
	}

	inner := raw[len(prefix) : len(raw)-len(suffix)]
	parts := splitParams(inner)

	var enchantments []*api.Enchantment

	for _, part := range parts {
		abbr := strings.ToUpper(strings.TrimSpace(part))
		if fullName, ok := abilityNameMap[abbr]; ok {
			enchantments = append(enchantments, &api.Enchantment{
				Name:  "Attack Modifier",
				Notes: new(fullName),
			})
			enchantments = append(enchantments, &api.Enchantment{
				Name:  "Damage Modifier",
				Notes: new(fullName),
			})
		}
	}

	return enchantments
}

// parseTemplateElementalArrow handles Template:ElementalArrow

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
		name = legendaryPrefix + "Vacuum"
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


// Template: UnderwaterAction
// Usage: {{UnderwaterAction|(Amount)}}
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


// Template: Unnatural
// Usage: {{Unnatural}}
func parseTemplateUnnatural(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Unnatural",
		Notes: new("Items so profane can have unintended consequences... This item will uncenter you and break your druid oath."),
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


func parseTemplateUndersun() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Undersun",
		Notes: new("While this item is equipped in areas with Underdark radiation, your sight is augmented to allow you to discern your surroundings even with little or no light."),
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

	notes := fmt.Sprintf("On Hit: Applies a stack of %s (%s%% more damage for 3 seconds. This effect stacks up to 20 times, and loses one stack on expiration.). This effect may only occur on-hit once a second.", vulnerableType, percentage)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
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

func parseTemplateVulnerabilityGuard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Vulnerability Guard",
		Notes: new("When the wearer is missed in combat, this power occasionally releases a degrading blast, adding three stacks of vulnerability to all enemies nearby."),
	}
}

// parseTemplateRockShattering handles Template:RockShattering
