package parser

import (
	"fmt"
	"strings"
	api "compendium-crawler-go/api"
)

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
			name = legendaryPrefix + effect
		} else {
			name = effect
		}
	}

	return &api.Enchantment{Name: name}
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


// Template: Nimbleness
// Usage: {{Nimbleness|(Type)}}
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

func parseTemplateNearlyComplete(raw string) *api.Enchantment {
	const prefix = "{{NearlyComplete"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	upgradeType := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	upgradeType = strings.TrimSpace(strings.TrimPrefix(upgradeType, "|"))

	typeNames := map[string]string{
		"ability":        "Ability Score",
		"hamp":           "Healing Amplification",
		"insability":     "Insightful Ability Score",
		"qualityability": "Quality Ability Score",
		"skill":          "Skill",
		"spellfocus":     "Spell Focus",
	}

	name := "Nearly Complete"
	if typeName := typeNames[strings.ToLower(upgradeType)]; typeName != "" {
		name += ": " + typeName
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("This item isn't quite finished, but it's only a step away from completion. Bring it to the forges on the upper floor of Gravenhollow and combine it with melted materials to restore this item to its full potential."),
	}
}

func parseTemplateNightsinger() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Nightsinger",
		Notes: new("5% Chance on Sonic Spell Hit: Target it Blinded for 6 Seconds."),
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


func parseTemplateNegation(raw string) *api.Enchantment {
	const prefix = "{{Negation"
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

	if bonusType == "legendary" {
		return &api.Enchantment{
			Name:  "Legendary Negation",
			Notes: new("Attacks and offensive spells have a chance to inflict 1d3 Negative Levels."),
		}
	}

	return &api.Enchantment{
		Name:  "Negation",
		Notes: new("Attacks and offensive spells have a chance to inflict Negative Levels."),
	}
}

// parseTemplateMissingParts handles Template:MissingParts

func parseTemplateOccasionalOvercooling() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Occasional Overcooling",
		Notes: new("Your shots from this Rune Arm have a 15% chance of freezing your target solid for six seconds. (Fortitude Save negates, DC is equal to your Rune Arm shots, +2 per Charge Tier the shot was fired at)."),
	}
}

// parseTemplateInspirationoftheInferno handles Template:InspirationoftheInferno

func parseTemplateOrlassksPrison() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Orlassk's Prison",
		Notes: new("This shield radiates with the power of the Lord of Stone. A shield bash will turn the target to stone. This effect can trigger once every 90 seconds. A successful Fortitude DC: 65 save negates this effect."),
	}
}

// parseTemplateSingleMindedness handles Template:SingleMindedness
