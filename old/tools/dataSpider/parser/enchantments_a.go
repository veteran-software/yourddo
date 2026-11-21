package parser

import (
	"fmt"
	"strconv"
	"strings"
	"github.com/sirupsen/logrus"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

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

	if strings.ToLower(bonusType) == "insightful" {
		bonusType = "Insight"
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
	var notes *string

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

	// Determine BonusType (modifier) based on source and parameters
	var calculatedBonusType string
	switch normalizedSource {
	case "deflection", "natural armor", "shield", "armor":
		calculatedBonusType = bonusType
	case "rough hide", "hardened exterior":
		if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
			calculatedBonusType = stripBrackets(parts[2])
		} else {
			calculatedBonusType = "Primal"
		}
	case "heightened awareness":
		if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
			calculatedBonusType = stripBrackets(parts[2])
		} else {
			calculatedBonusType = "Insight"
		}
	case "protection from evil":
		if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
			calculatedBonusType = stripBrackets(parts[2])
		} else {
			calculatedBonusType = "Deflection"
		}
		notes = new("vs. Evil")
	case "armor class":
		calculatedBonusType = "" // armor class case doesn't specify a bonus type in the EnchCat
	default:
		calculatedBonusType = bonusType
	}

	if strings.ToLower(calculatedBonusType) == "insightful" {
		calculatedBonusType = "Insight"
	}

	// Format Name as Armor Class (<source>)
	// Use title case for source in name
	var sourceForName string
	if normalizedSource == "armor class" {
		sourceForName = "Base"
	} else {
		sourceForName = cases.Title(language.English).String(acSource)
	}

	name = fmt.Sprintf("Armor Class (%s)", sourceForName)

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: calculatedBonusType,
		Notes:     notes,
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


// Template: AgainstTheSlaveLordsSetBonus
// Usage: {{AgainstTheSlaveLordsSetBonus}}
func parseTemplateAgainstTheSlaveLordsSetBonus() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Against the Slave Lords Set Bonus",
		Notes: new("An Against the Slave Lords Set Bonus can be applied to this item."),
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


func parseTemplateAntimagicSpike(raw string) *api.Enchantment {
	const template = "AntimagicSpike"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	parts := splitParams(inner)

	name := "Antimagic Spike"
	notes := "This item was made from powerful antimagic materials. When scoring a critical hit on an enemy with your ranged or melee weapons, the target must make a Fortitude DC: 28 save or be unable to cast spells for a brief duration."

	if len(parts) >= 1 && strings.EqualFold(strings.TrimSpace(parts[0]), "custom") {
		dc := ""
		if len(parts) >= 2 {
			dc = strings.TrimSpace(parts[1])
		}

		name += " +" + dc
		notes = "This item was made from powerful antimagic materials. When scoring a critical hit on an enemy, it must make a Fortitude DC: " + dc + " save or be unable to cast spells for a brief duration."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
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


func parseTemplateAlmostThere() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Almost There",
		Notes: new("Bring it to a Cannith Reforging Station and combine it with melted materials to restore this item to its full potential."),
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


func parseTemplateAnchoring() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Anchoring",
		Notes: new("Anchoring: This item grants its wearer immunity to effects that are time based or involve planar displacement."),
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

func parseTemplateAvalanche(raw string) *api.Enchantment {
	const prefix = "{{Avalanche"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	bonusType := strings.ToLower(strings.TrimSpace(inner))
	name := "Avalanche"
	if bonusType == "legendary" {
		name = "Legendary Avalanche"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("This magical item contains the destructive power of an avalanche within, and when you are damaged below 50% HP, its power is unleashed in the form of a massive explosion of Cold damage."),
	}
}

// parseTemplateMemoryofChainsBroken handles Template:MemoryofChainsBroken

func parseTemplateArrowSpitting() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Arrow Spitting",
		Notes: new("While this item is equipped and an enemy hits you, there is a chance that this item will produce a stack of 20 arrows of a random type. Where exactly the arrows come from remains a mystery."),
	}
}

// parseTemplateAmmunition handles Template:Ammunition

func parseTemplateAmmunition(fullTemplate string) *api.Enchantment {
	// Documentation: {{Ammunition|(Damage Type)|(Die Count)|(Die Side)}}
	const prefix = "{{Ammunition"
	const suffix = "}}"

	if !strings.HasPrefix(fullTemplate, prefix) || !strings.HasSuffix(fullTemplate, suffix) {
		return nil
	}

	inner := fullTemplate[len(prefix) : len(fullTemplate)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
	}

	parts := strings.Split(inner, "|")
	var damageType, dieCount, dieSide string

	if len(parts) >= 1 {
		damageType = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		dieCount = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		dieSide = strings.TrimSpace(parts[2])
	}

	dieString := fmt.Sprintf("%sd%s", dieCount, dieSide)

	var typePrefix string
	switch strings.ToLower(damageType) {
	case "fire":
		typePrefix = "Burning"
	case "poison":
		typePrefix = "Venomed"
	case "acid":
		typePrefix = "Corrosive"
	case "cold":
		typePrefix = "Freezing"
	case "electric":
		typePrefix = "Shocking"
	default:
		typePrefix = damageType
	}

	name := fmt.Sprintf("%s Ammunition - %s", typePrefix, dieString)
	notes := fmt.Sprintf("On Ranged Attack: %s %s Damage", dieString, damageType)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}
