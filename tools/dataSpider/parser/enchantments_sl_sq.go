package parser

import (
	api "compendium-crawler-go/api"
	"fmt"
	"strconv"
	"strings"
)

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
			enchantments = append(enchantments, &api.Enchantment{
				Name:      fmt.Sprintf("Spell DC: %s", schoolName),
				Amount:    amount,
				BonusType: bonusType,
			})
		}
		if title != "" {
			for _, enchantment := range enchantments {
				enchantment.Name = title
			}
		}
		return enchantments
	}

	// --- Single School Logic ---
	var name string
	if title != "" {
		name = title // Use custom title
	} else if strings.EqualFold(school, "Rune Arm") {
		name = "Rune Arm: DC"
	} else {
		name = fmt.Sprintf("Spell DC: %s", school)
	}

	return []*api.Enchantment{
		{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		},
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
	name = maximumSpellPoints

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

func parseTemplateSoundproof() *api.Enchantment {
	const templateName = "Soundproof"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
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

// Template:Sparkscale
// No parameters; this template label expands to descriptive text on the wiki.
// For our structured data, we capture it as a simple named enchantment.
func parseTemplateSparkscale() *api.Enchantment {
	return &api.Enchantment{
		Name: "Sparkscale",
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

	// 3. Bonus Type (Optional, Index 2 - defaults to Equipment)
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
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

func parseTemplateSpellIntensity(raw string) []*api.Enchantment {
	const prefix = "{{SpellIntensity|"
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return nil
	}

	parts := strings.Split(raw[len(prefix):len(raw)-len(suffix)], "|")
	if len(parts) < 2 {
		return nil
	}

	amount := stripBrackets(parts[1])
	if amount == "" {
		return nil
	}

	bonusType := "Equipment"
	if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
		bonusType = stripBrackets(parts[2])
	}

	powersByGroup := map[string][]string{
		"combustion":            {"Fire"},
		"fire":                  {"Fire"},
		"corrosion":             {"Acid"},
		"acid":                  {"Acid"},
		"devotion":              {"Positive Energy"},
		"healing":               {"Positive Energy"},
		"glaciation":            {"Cold"},
		"ice":                   {"Cold"},
		"force":                 {"Force", "Piercing", "Slashing", "Bludgeoning"},
		"kenetic":               {"Force", "Piercing", "Slashing", "Bludgeoning"},
		"kinetic":               {"Force", "Piercing", "Slashing", "Bludgeoning"},
		"impulse":               {"Force", "Piercing", "Slashing", "Bludgeoning"},
		"lightning":             {"Electric"},
		"magnetism":             {"Electric"},
		"negative":              {"Negative Energy", "Poison"},
		"nullification":         {"Negative Energy", "Poison"},
		"void":                  {"Negative Energy", "Poison"},
		"light":                 {"Light", "Chaos", "Evil", "Good", "Lawful"},
		"radiance":              {"Light", "Chaos", "Evil", "Good", "Lawful"},
		"repair":                {"Repair", "Rust"},
		"reconstruction":        {"Repair", "Rust"},
		"sonic":                 {"Sonic"},
		"resonance":             {"Sonic"},
		"purifying flame":       {"Fire", "Light"},
		"frozen storm":          {"Cold", "Electric"},
		"creeping dust":         {"Cold", "Acid"},
		"firestorm":             {"Fire", "Electric"},
		"silver flame":          {"Positive Energy", "Light", "Chaos", "Evil", "Good", "Lawful"},
		"blighted":              {"Acid", "Negative Energy", "Poison", "Evil"},
		"moonlit haunt":         {"Negative Energy", "Force", "Poison"},
		"winter's impertenence": {"Force", "Negative Energy"},
		"summer's impertenence": {"Fire", "Light"},
		"frozen depths":         {"Negative Energy", "Poison", "Cold"},
		"thunderstorm":          {"Sonic", "Electric"},
		"tunderstorm":           {"Sonic", "Electric"},
		"sacred ground":         {"Acid", "Light", "Chaos", "Evil", "Good", "Lawful"},
		"dark restoration":      {"Negative Energy", "Poison", "Positive Energy"},
		"flames of darkness":    {"Fire", "Negative Energy", "Poison"},
	}

	group := strings.ToLower(stripBrackets(parts[0]))
	powers, ok := powersByGroup[group]
	if !ok || group == "universal" {
		powers = elementsMap["Potency"]
	}

	enchantments := make([]*api.Enchantment, 0, len(powers))
	for _, power := range powers {
		enchantments = append(enchantments, &api.Enchantment{
			Name:      "Spell Critical Damage: " + power,
			Amount:    amount,
			BonusType: bonusType,
			Element:   power,
		})
	}

	return enchantments
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
		Name:      "Sneak Attack Damage Rolls",
		Amount:    amount,
		BonusType: bonusType,
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
		name = legendaryPrefix + "Slay Living"
		note = "On hit, this has a chance of snuffing the life from your foes, slaying them instantly. Struck enemies must make a Fortitude DC: 100 save or be slain."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}

// parseSaveDC parses `{{SaveDC|Fortitude|100||||color}}` to "Fortitude DC: 100"

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
		Name:      "Sneak Attack Rolls",
		Amount:    enhancementAmount,
		BonusType: bonusType,
	})

	// 2. Sneak Attack Damage
	if damageAmount != "" {
		results = append(results, &api.Enchantment{
			Name:      "Sneak Attack Damage Rolls",
			Amount:    damageAmount,
			BonusType: bonusType,
		})
	}

	return results
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

	const applySlaversShardToItem = "Apply a Slaver's shard to this item."
	return []*api.Enchantment{
		{
			Name:  namePrefix + "Slaver's Prefix Slot",
			Notes: new(applySlaversShardToItem),
		},
		{
			Name:  namePrefix + "Slaver's Suffix Slot",
			Notes: new(applySlaversShardToItem),
		},
		{
			Name:  namePrefix + "Slaver's Extra Slot",
			Notes: new(applySlaversShardToItem),
		},
		{
			Name:  namePrefix + "Slaver's Bonus Slot",
			Notes: new(applySlaversShardToItem),
		},
		{
			Name:  "Against the Slave Lords Set Bonus",
			Notes: new("An Against the Slave Lords Set Bonus can be applied to this item."),
		},
		{
			Name:  namePrefix + "Slaver's Augment Slot",
			Notes: new(applySlaversShardToItem),
		},
	}
}

func parseTemplateSpikeGuard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Spike Guard",
		Notes: new("On Being Hit in Melee: 5% chance to do 10d20+500 Piercing Damage to the Attacker."),
	}
}

func parseTemplateSpikeStudded() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Spike-Studded",
		Notes: new("This item is reinforced with metal studs that improve your unarmed strikes. Your unarmed strikes do an additional 1d4 piercing damage."),
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

func parseTemplateSlicingWinds(raw string) *api.Enchantment {
	return parseVariantTemplate(raw, "{{SlicingWinds", "Slicing Winds", "This weapon stores the cyclonic might of the windstorm within. When the weapon is used, this power can come to the surface as a series of rushing, cutting winds that deal slashing damage to the target over several seconds.", "Legendary", "Legendary Slicing Winds", "This weapon whistles with the wind. On hit, this mysterious power has a chance of coming to the surface, slicing at the struck enemy for a significant amount of Slashing damage.")
}

// parseTemplateShadowblade parses `{{Shadowblade}}`.

func parseTemplateSoulTear(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{SoulTear", "Soul Tear", "This weapon tears at the soul of your foes, reducing their PRR and Healing Amplification.")
}

// parseTemplateMindTear parses `{{MindTear}}`.

func parseTemplateSoulEating(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{SoulEating", "Soul Eating", "On a Vorpal strike, the dark energy that inhabits this weapons will tear at the soul of your foe, inflicting up to three negative levels to your target. The Soul Eating weapons will feed this stolen life back to you in the form of 35 Temporary Hit Points that last for one minute or until depleted by incoming damage.")
}

// parseTemplateMonkPath parses `{{MonkPath|(stance)}}`.
