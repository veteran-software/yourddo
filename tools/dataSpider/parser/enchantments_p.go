package parser

import (
	"fmt"
	"strconv"
	"strings"
	api "compendium-crawler-go/api"
)

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

func parseTemplatePathoftheGuardingStone(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{PathoftheGuardingStone", "Path of the Guarding Stone", "While wearing this item and in mountain stance, there is a chance you will be protected by a Stoneskin spell when enemies strike you.")
}

// parseTemplateBetterOffhanded parses `{{BetterOffhanded}}`.

func parseTemplatePealsOfThunder() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Peals of Thunder",
		Notes: new("Occasionally, this thunderous power is unleashed, applying a lasting effect that deals 2 to 8 sonic damage every two seconds for six seconds. If the effect is reapplied before it has a chance to wear off, the effect will stack and the duration will reset. The effect can be stacked up to 3 times."),
	}
}

// parseTemplateTurbulentBurst handles Template:TurbulentBurst

func parseTemplateParagonWeapon() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Paragon Weapon",
		Notes: new("Weapons and Shields with a Total Enhancement value of +6 or higher gain an additional +0.5[W] damage dice."),
	}
}

// parseTemplatePickaCard handles Template:PickaCard

func parseTemplatePickaCard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Pick a Card",
		Notes: new("See beyond your fate and destiny. This deck of Tarokka cards is beyond your comprehension."),
	}
}

// parseTemplateTouchedbyWildMagic parses `{{TouchedbyWildMagic}}`.
