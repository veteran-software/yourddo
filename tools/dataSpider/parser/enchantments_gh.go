package parser

import (
	"fmt"
	"strconv"
	"strings"
	"github.com/sirupsen/logrus"
	api "compendium-crawler-go/api"
)

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


// Template: HasteGuard
// Usage: {{HasteGuard}}
func parseTemplateHasteGuard(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Haste Guard",
		Notes: new("When you are hit by enemies, there is a chance you will be hasted, quickening your attack and movement speed."),
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


func parseTemplateGlassJawStrike() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Glass Jaw Strike",
		Notes: new("While wearing this item, when you roll a natural 20 on an unarmed attack, you will deal a tremendous blow to your target that will daze it (as the Sap ability) and may knock it down as well."),
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
