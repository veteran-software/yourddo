package parser

import (
	"fmt"
	"strconv"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

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
		amount = fmt.Sprintf("-%d%%", num)
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


func parseTemplateMakersTouch() *api.Enchantment {
	name := "Maker's Touch"
	notes := "Casting a Repair spell on yourself of allies leaves a lingering defensive buff that increases the AC and Physical Resistance Rating of your target by +3 for 12 seconds."

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

func parseTemplateMindTear(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{MindTear", "Mind Tear", "This weapon tears at the identity of your foes, reducing their MRR and Spell Power.")
}

// parseTemplateTheMoralCompass parses `{{TheMoralCompass}}`.

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

func parseTemplateMissingParts() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Missing Parts",
		Notes: new("Toven's Hammer appears to have been damaged during the fight. You think that you might be able to partially repair it if you had a elemental motion fixation device."),
	}
}

// parseTemplateOccasionalOvercooling handles Template:OccasionalOvercooling

func parseTemplateMemoryofChainsBroken() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Memory of Chains Broken",
		Notes: new("Your hits have a 5% chance to Paralyze enemies for 5 seconds."),
	}
}

// parseTemplateOrlassksPrison handles Template:OrlassksPrison
