package parser

import (
	"fmt"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

func parseTemplateTrueSeeing() *api.Enchantment {
	const templateName = "True Seeing"

	// Documentation: No arguments, just sets the Name.

	return &api.Enchantment{
		Name: templateName,
	}
}


func parseTemplateTurnDice(rawTurnDiceValue string) *api.Enchantment {
	const prefix = "{{TurnDice|"
	const suffix = "}}"
	const baseName = "Turn Undead Hit Dice"

	if !strings.HasPrefix(rawTurnDiceValue, prefix) || !strings.HasSuffix(rawTurnDiceValue, suffix) {
		return nil
	}

	paramList := rawTurnDiceValue[len(prefix) : len(rawTurnDiceValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Usage: {{TurnDice|(Count)}}

	// 1. Count (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	count := stripBrackets(parts[0])
	if count == "" {
		return nil
	}

	name := baseName + " +" + count

	return &api.Enchantment{
		Name:   name,
		Amount: count,
		Notes:  new("This will increase the total number of Hit Dice used in the Turn Undead calculation by " + count + ". However, these additional Dice will only take effect after the wielder rests."),
	}
}


func parseTemplateTemperanceOfBelief() *api.Enchantment {
	const templateName = "Magical Resistance"
	const amount = "1"
	const note = "Applies +" + amount + " per Religous Lore Feat"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name:   templateName,
		Amount: amount,
		Notes:  new(note),
		// All other fields remain empty.
	}
}


func parseTemplateTendonSlice(rawTSValue string) *api.Enchantment {
	const prefix = "{{TendonSlice|"
	const suffix = "}}"

	if !strings.HasPrefix(rawTSValue, prefix) || !strings.HasSuffix(rawTSValue, suffix) {
		return nil
	}

	paramList := rawTSValue[len(prefix) : len(rawTSValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Type)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount := stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	typeParam := ""
	if len(parts) >= 2 {
		typeParam = strings.ToLower(stripBrackets(parts[1]))
	}

	name := "Tendon Slice"
	notes := ""
	displayAmount := amount

	switch typeParam {
	case "percent":
		name = "Tendon Slice " + amount + "%"
		displayAmount = amount + "%"
		notes = fmt.Sprintf("This effect gives a %s%% chance to Hamstring the target for each attack that does damage.", amount)
	case "time":
		name = "Tendon Slice " + amount
		notes = fmt.Sprintf("On Hit: 6%% chance to slow target's movement by 50%% for %s seconds.", amount)
	default:
		// Default: On Hit: {{#expr:{{{1}}}*2}}% chance to slow target's movement by 50% for 3 seconds.
		val := 0
		fmt.Sscanf(amount, "%d", &val)
		name = "Tendon Slice " + amount
		notes = fmt.Sprintf("On Hit: %d%% chance to slow target's movement by 50%% for 3 seconds.", val*2)
	}

	return &api.Enchantment{
		Name:   name,
		Amount: displayAmount,
		Notes:  new(notes),
	}
}


func parseTemplateThornGuard(rawTGValue string) *api.Enchantment {
	const templateName = "ThornGuard"
	const prefix = "{{" + templateName
	const suffix = "}}"
	const baseName = "Thorn Guard"

	var tgType = "basic" // Default type

	// Handle argument-less case, which defaults to "Basic"
	if strings.TrimSpace(rawTGValue) == "{{"+templateName+"}}" {
		// No arguments, proceed with basic default
	} else if strings.HasPrefix(rawTGValue, prefix) && strings.HasSuffix(rawTGValue, suffix) {
		paramList := rawTGValue[len(prefix) : len(rawTGValue)-len(suffix)]
		parts := strings.Split(paramList, "|")

		// 1. Type (Index 0)
		if len(parts) >= 1 {
			val := strings.TrimSpace(parts[1])
			if val != "" {
				tgType = strings.ToLower(val)
			}
		}
	} else {
		return nil // Invalid format
	}

	var name string

	// Construct Name: [Type] Thorn Guard
	if tgType == "basic" {
		name = baseName // Basic Thorn Guard
	} else {
		// Use a normalized title case for display
		name = cases.Title(language.English).String(strings.ToLower(tgType)) + " " + baseName // e.g., Greater Thorn Guard
	}

	return &api.Enchantment{
		Name: name,
	}
}


// Template:TemperanceOfSpirit
// No parameters. As per documentation screenshot:
//
//	"Temperance of Spirit: You have a +1 Quality Bonus to Physical Resistance Rating per Religious Lore Feat."
//
// We capture this as a single standard enchantment increasing PRR by +1 (Quality).
// Notes indicate the per-feat scaling.
func parseTemplateTemperanceOfSpirit() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Physical Resistance Rating",
		Amount:    "1",
		BonusType: "Quality",
		Notes:     new("+1 to Physical Resistance Rating per Religious Lore Feat."),
	}
}


// Template:TheArtbladesGift
// No parameters. Documentation indicates it simply marks the item as "The Artblade's Gift" with explanatory text.
func parseTemplateTheArtbladesGift() *api.Enchantment {
	return &api.Enchantment{
		Name:  "The Artblade's Gift",
		Notes: new("You gain Legendary Concordant Opposition: Being struck in melee has a small chance to return some lost Hit Points and Spell Points to you. Offensive spells have a chance to grant 100 Temporary Spell Points. This has a one minute cooldown, which is shared with the effects that grant Legendary Concordant Opposition."),
	}
}

// parseTemplateRadiance handles Template:Radiance

// Template:TheWarbladesWrath
// No parameters. Documentation indicates it simply marks the item as "The Warblade's Wrath" with explanatory text.
func parseTemplateTheWarbladesWrath() *api.Enchantment {
	return &api.Enchantment{
		Name:  "The Warblade's Wrath",
		Notes: new("On an attack roll of 20 which is confirmed as a critical hit this power is released, dealing damage to the target and all enemies near it for 30d6+90 slashing damage. A successful Reflex DC: 130 reduces this by half."),
	}
}


// Template:TaintOfShavarath
// Usage: {{TaintOfShavarath|(Legendary)}}
// Legendary param → "Legendary Taint of Shavarath"; default → "Taint of Shavarath".
func parseTemplateTaintOfShavarath(raw string) *api.Enchantment {
	const prefix = "{{TaintOfShavarath"
	const suffix = "}}"
	const baseName = "Taint of Shavarath"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	var typ string
	if strings.HasPrefix(inner, "|") {
		parts := strings.SplitN(strings.TrimPrefix(inner, "|"), "|", 2)
		typ = strings.TrimSpace(parts[0])
	}

	name := baseName
	if strings.ToLower(typ) == "legendary" {
		name = legendaryPrefix + baseName
	}

	return &api.Enchantment{Name: name}
}

// Template:TouchoftheMournlands
// Per request: just output the effect name. No parameters expected/used.
// Example usage: {{TouchoftheMournlands}}
func parseTemplateTouchoftheMournlands(raw string) *api.Enchantment {
	const prefix = "{{TouchoftheMournlands"
	const suffix = "}}"
	const name = "Touch of the Mournlands"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}
	return &api.Enchantment{Name: name}
}


// Template: Turning
// Usage: {{Turning|(Type)}}
func parseTemplateTurning(raw string) *api.Enchantment {
	const prefix = "{{Turning"
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
	turningType := ""
	if len(parts) >= 1 {
		turningType = strings.TrimSpace(parts[0])
	}

	name := "Turning"
	amount := ""
	note := "This will increase the total number of Turn Undead attempts you can use. However, these additional Turn Undead attempts will only take effect after the wielder rests."

	switch strings.ToLower(turningType) {
	case "minor":
		name = "Minor Turning"
		amount = "1"
		note = "Minor Turning: This will increase the total number of Turn Undead attempts you can use by 1. However, these additional Turn Undead attempts will only take effect after the wielder rests."
	case "lesser":
		name = "Lesser Turning"
		amount = "2"
		note = "Lesser Turning: This will increase the total number of Turn Undead attempts you can use by 2. However, these additional Turn Undead attempts will only take effect after the wielder rests."
	case "greater":
		name = "Greater Turning"
		amount = "4"
		note = "Greater Turning: This will increase the total number of Turn Undead attempts you can use by 4. However, these additional Turn Undead attempts will only take effect after the wielder rests."
	default:
		// Normal (Blank)
		amount = "3" // Standard Turning is usually +3
	}

	return &api.Enchantment{
		Name:   name,
		Amount: amount,
		Notes:  new(note),
	}
}


// Template: TempestStorm
// Usage: {{TempestStorm}}
func parseTemplateTempestStorm(raw string) *api.Enchantment {
	const prefix = "{{TempestStorm"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Electric Damage",
		Amount:    "1d20",
		BonusType: "On-hit (2% Chance) (per Weapon ML)",
		Notes:     new("Adds a 2% Chance On Hit to cause a bold of lightning to strike your target, dealing 1d20 Lightning Damage per Minimum Level of the weapon to all nearby enemies."),
	}
}


// Template: Trembling
// Usage: {{Trembling}}
func parseTemplateTrembling(raw string) *api.Enchantment {
	const prefix = "{{Trembling"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Trembling",
		Notes: new("On a Critical Hit, this weapon applies the Shaken debuff."),
	}
}


// Template: TraceOfMadness
// Usage: {{TraceOfMadness}}
func parseTemplateTraceOfMadness(raw string) *api.Enchantment {
	const prefix = "{{TraceOfMadness"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Trace of Madness",
		Notes: new("You can almost hear faint, panicked voices when this item is close to you. Perhaps the latent power of this item's hint of madness could be brought out by some catalyst."),
	}
}


// Template: TouchOfImmortality
// Usage: {{TouchOfImmortality}}
func parseTemplateTouchOfImmortality(raw string) []*api.Enchantment {
	const template = "TouchOfImmortality"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract parameters
	content := s[len(prefix) : len(s)-len(suffix)]
	params := strings.Split(content, "|")

	title := "Touch of Immortality"
	if len(params) > 1 && strings.TrimSpace(params[1]) != "" {
		title = strings.TrimSpace(params[1])
	}

	return []*api.Enchantment{
		{
			Name:      "Skill: Heal",
			Amount:    "20",
			BonusType: "Competence",
			Notes:     new("Passive: +20 Competence bonus to the Heal skill."),
		},
		{
			Name:      "Skill: Repair",
			Amount:    "20",
			BonusType: "Competence",
			Notes:     new("Passive: +20 Competence bonus to the Repair skill."),
		},
		{
			Name:  title,
			Notes: new("Passive: While this item is equipped, you regenerate 2d2 Hit Points every 15 seconds."),
		},
	}
}


func parseTemplateTelekinesisGuard(raw string) *api.Enchantment {
	const template = "TelekinesisGuard"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Telekinesis Guard"
	notes := "When enemies hit you they may be assaulted by these psychic forces, falling to the ground unless they make a Reflex DC: 35 save."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateTheGoldenCurse(raw string) *api.Enchantment {
	const template = "TheGoldenCurse"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	parts := splitParams(inner)

	name := "The Golden Curse"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		name = strings.TrimSpace(parts[0])
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("When the wearer of this item is successfully attacked, occasionally an incredible power comes to the surface, shielding its wielder in solid gold to protect from further attacks."),
	}
}


func parseTemplateTetZik(raw string) *api.Enchantment {
	const template = "Tet-zik"
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

	name := "Tet-zik, The Enlightened Change"
	var notes string

	if strings.EqualFold(version, "Legendary") {
		notes = "Whispers of the ancients grant you the ancient martial secrets of the Thri-Kreen. Your elemental monk stances grant additional bonuses.\n" +
			"* If in Wind stance:\n" +
			"** Insightful Jump +20: +20 Insight bonus to Jump.\n" +
			"** Insightful Tumble +20: +20 Insight bonus to Tumble.\n" +
			"** Sneak Attack +5: Provides a +5 to attack bonus and a +8 bonus to damage for any attack that would qualify as a Sneak Attack, even if the wielder is not a Rogue.\n" +
			"** Sneak Attack Damage +5: Provides a +5 to damage for any attack that would qualify as a Sneak Attack, even if the wielder is not a Rogue.\n" +
			"* If in Sun stance:\n" +
			"** Superior Reinforced Fists: This item surrounds your fists with kinetic energy. Your unarmed damage is boosted by one and a half dice.\n" +
			"* If in Mountain stance:\n" +
			"** Physical Sheltering +10: Passive: +10 Enhancement bonus to Physical Resistance Rating.\n" +
			"** Seeker +5: +5 Enhancement bonus to confirm critical hits, and damage (before multiplier) on critical hits.\n" +
			"* If in Ocean stance:\n" +
			"** Magical Resistance Rating Cap +10: Passive: +10 Enhancement bonus to Magical Resistance Rating Cap.\n" +
			"** Luck Accuracy +5: +5 Luck bonus to your attack rolls.\n" +
			"** Luck Deadly +5: +5 Luck bonus to weapon damage."
	} else {
		notes = "Whispers of the ancients grant you the ancient martial secrets of the Thri-Kreen. Your elemental monk stances grant additional bonuses.\n" +
			"* If in Wind stance:\n" +
			"** Insightful Jump +10: +10 Insight bonus to Jump.\n" +
			"* If in Sun stance:\n" +
			"** Insightful Healing Amplification +50: Passive: +50 Insight Bonus to Positive Healing Amplification, which amplifies incoming Positive healing.\n" +
			"* If in Mountain stance:\n" +
			"** Reinforced Fists: This item surrounds your fists with kinetic energy. Your unarmed damage is boosted by one half die.\n" +
			"* If in Ocean stance:\n" +
			"** On unarmed confirmed vorpal strikes, delivers a poison that paralyzes the target (Fortitude DC: 17 negates) and inflicts 1d6 Dexterity damage (Fortitude DC: 17 negates, increased 50% if paralysis is successful or if the mob is already helpless). The dexterity damage and paralysis effects are saved against separately."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateTemporarySpellPoints(raw string) *api.Enchantment {
	const template = "TemporarySpellPoints"
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
	spells := ""
	pointsGained := ""
	duration := ""
	triggerTimer := ""
	title := ""

	if len(parts) >= 1 {
		spells = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		pointsGained = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		duration = strings.TrimSpace(parts[2])
	}
	if len(parts) >= 4 {
		triggerTimer = strings.TrimSpace(parts[3])
	}
	if len(parts) >= 5 {
		title = strings.TrimSpace(parts[4])
	}

	name := "Temporary Spell Points"
	if title != "" {
		name = title
	}

	notes := fmt.Sprintf("Whenever you cast a %s spell, you gain +%s Temporary Spell Points that last for %s seconds. This can only trigger once every %s seconds.", spells, pointsGained, duration, triggerTimer)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateTransmutedPlatinum(raw string) *api.Enchantment {
	name := "Transmuted Platinum"
	dc := "35"
	notes := "This weapon, made of transmuted platinum, is slightly magically unstable, and has a chance to transfer its magic to those it strikes. Struck enemies have a small chance to turn into transmuted platinum, preventing all movement, with a DC of 35 negating this effect."

	if strings.Contains(raw, "|EpicGuard") {
		name = "Transmuted Platinum Guard (Epic)"
		notes = "This glorious item shines with a warm magic, and has a chance of freezing your attackers in a cage of Transmuted Platinum."
	} else if strings.Contains(raw, "|Guard") {
		name = "Transmuted Platinum Guard"
		notes = "This glorious item shines with a warm magic, and has a chance of freezing your attackers in a cage of Transmuted Platinum."
	} else if strings.Contains(raw, "|Epic") {
		name = "Transmuted Platinum (Epic)"
		dc = "70"
		notes = fmt.Sprintf("This weapon, made of transmuted platinum, is slightly magically unstable, and has a chance to transfer its magic to those it strikes. Struck enemies have a small chance to turn into transmuted platinum, preventing all movement, with a DC of %s negating this effect.", dc)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateTrapTheSoul(raw string) *api.Enchantment {
	const template = "TrapTheSoul"
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

	var name, notes string
	switch variant {
	case "guard":
		name = "Trap the Soul Guard"
		notes = "When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, sucking out the life force of an enemy and imprisoning the essence of their body and soul in a gem."
	case "epic":
		name = "Epic Trap the Soul"
		notes = "When this weapon is used, this power occasionally comes to the surface, sucking out the life force of an enemy and imprisoning the essence of their body and soul in a gem."
	case "legendary":
		name = "Legendary Trap the Soul"
		notes = "When you strike an enemy with a melee or missle attack, this power occasionally comes to the surface, sucking out the life force of an enemy and imprisoning the essence of their body and soul in a gem."
	default:
		name = "Trap the Soul"
		notes = "When this weapon is used, this power occasionally comes to the surface, sucking out the life force of an enemy and imprisoning the essence of their body and soul in a gem."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateThunderstruck(raw string) *api.Enchantment {
	const template = "Thunderstruck"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Thunderstruck"
	notes := "On Melee Vorpal Hit: 25d2+10 Electric and 25d2+10 Sonic damage to your target."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateTransformKineticEnergy(raw string) *api.Enchantment {
	const template = "TransformKineticEnergy"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Transform Kinetic Energy"
	notes := "Transform Kinetic Energy: Each time you are physically hit in combat there is a chance that the energy of the blow will be converted into spell points."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateThornOfTheRose(raw string) *api.Enchantment {
	const template = "ThornOfTheRose"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Thorn of the Rose"
	notes := "Thorn of the Rose: Your Piercing damage from any source has a chance to Paralyze non-Boss enemies with no save."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateThunderforged(raw string) *api.Enchantment {
	const prefix = "{{Thunderforged"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	tier := strings.TrimSpace(inner)
	if tier == "" {
		tier = "0"
	}

	name := fmt.Sprintf("Thunder-Forged (Tier %s)", tier)
	var notes string

	switch tier {
	case "1":
		notes = "Though it has been reforged once, there is room to make the weapon even stronger. Tier 1 weapons have 0.5[W] over tier 0. Upgrading this item further will make it Bound to Character."
	case "2":
		notes = "Though it has been reforged twice, there is still room to make the weapon even stronger. Tier 2 weapons have +0.5[W] over Tier 1."
	default:
		tier = "0"
		name = "Thunder-Forged (Tier 0)"
		notes = "Reforging the weapon with certain ingredients could unleash more power."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplatePlanarSearing parses `{{PlanarSearing}}`.

func parseTemplateThornyCrownofMadness(raw string) *api.Enchantment {
	const prefix = "{{ThornyCrownofMadness"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Thorny Crown of Madness"
	notes := "Strikes with this weapon have a chance to confuse your target, allowing them to harm and be harmed by friend and foe alike. Furthermore, hits with this weapon against Confused targets deal an additional 6d6 Chaos damage."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFinishingTouch parses `{{FinishingTouch}}`.

func parseTemplateTheDraggingOfTheDepths(raw string) *api.Enchantment {
	const prefix = "{{TheDraggingOfTheDepths"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	amount := "1"
	bonusType := "Competence"
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
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

	name := "The Dragging of the Depths"
	notes := fmt.Sprintf("Attuned to the dark depths of the waves below, this weapon is cold to the touch and unholy. Each hit drains life from your enemies, dealing %sd6 Evil damage, and when striking Good enemies, it also deals an additional %sd6 Cold damage.", amount, amount)

	if bonusType != "Competence" && bonusType != "" {
		notes += fmt.Sprintf(" This is a %s bonus.", bonusType)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFlamebitten parses `{{Flamebitten}}`.

func parseTemplateTheReaver(raw string) *api.Enchantment {
	const prefix = "{{TheReaver"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	name := "The Reaver's Resolve"
	notes := "While the Stormreaver was a guest of The Celestial One, Ternathear, some know that he wallowed for a time in drink. He had lost everything he had once held dear - even his prized blade, Cloudburst. After a group of adventurers defeated his former lieutenant, the storm giant lich Sor'jek Incanni, the Stormreaver resolved to take matters into his own two hands."

	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) >= 1 {
			variant := strings.TrimSpace(parts[0])
			if strings.EqualFold(variant, "Quest") {
				name = "The Reaver's Quest"
				notes = "The Stormreaver slipped from The Celestial One's care, and set out across Xen'drik for the components to craft a new sword. Purest Mithral was gathered from the Bluespine Peaks, and diamonds from the Burning Mountain, ground to dust under his heal. He forged his blade in the heart of Mount Reysalon's volcano, battering itself against Shargon's Teeth."
			} else if strings.EqualFold(variant, "Fate") {
				name = "The Reaver's Fate"
				notes = "With Skybreaker in hand, The Stormreaver returned to Gianthold to fight the menace to his people, and to seek triumph where he had once found only failure."
			}
		}
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateTelekinetic parses `{{Telekinetic|Type|DC Amount}}`.

func parseTemplateTelekinetic(raw string) *api.Enchantment {
	const prefix = "{{Telekinetic"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	var teleType, dc string
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(strings.TrimPrefix(content, "|"), "|")
		if len(parts) > 0 {
			teleType = strings.TrimSpace(parts[0])
		}
		if len(parts) > 1 {
			dc = strings.TrimSpace(parts[1])
		}
	}

	name := "Telekinetic"
	var notes string

	if strings.EqualFold(teleType, "Legendary") {
		name = "Legendary Telekinetic"
		notes = "On hit, this has a chance of knocking your enemies off their feet. Struck enemies must make a Reflex DC: 100 save or be knocked down."
	} else if strings.EqualFold(teleType, "Custom") {
		name = "Telekinetic +" + dc
		notes = "Targets that suffer a critical hit from a Telekinetic weapons must make a Reflex DC: " + dc + " saving throw or be knocked down."
	} else if strings.EqualFold(teleType, "Epic") {
		name = "Epic Telekinetic"
		notes = "Targets that suffer a critical hit from a telekinetic weapon must make a DC Strength or Dexterity DC: 35. The target will then be force to make Balance DC: 16 checks to recover from the effect."
	} else if strings.EqualFold(teleType, "Greater") {
		name = "Greater Telekinetic"
		notes = "Targets that suffer a critical hit from a telekinetic weapon must make a Strength or Dexterity DC: 28 check or be knocked down. The target will then be force to make Balance DC: 16 checks to recover from the effect."
	} else {
		if teleType != "" {
			name = teleType + " Telekinetic"
		}
		notes = "Targets that suffer a critical hit from a telekinetic weapon must make a Balance DC: 17 check or be knocked down."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateTheMoralCompass(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{TheMoralCompass", "The Moral Compass", "An oft repeated mantra of the Shintao is written on these sacred handwraps:\n\n\"True strength comes from within, and true power comes from rising above.\" While wearing these Handwraps, Monks will gain additional power and bonuses based on their Philosophy.")
}

// parseTemplateThaarakCorrosion parses `{{ThaarakCorrosion}}`.

func parseTemplateThaarakCorrosion(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{ThaarakCorrosion", "Thaarak Corrosion", "Like a Thaarak Hound's vitriolic breath, this weapon is corrosive and can damage enemies over time. Occasionally, it applies a lasting effect to its targets that deals 2d4 acid damage every second for six seconds. If the effect is reapplied before it has a chance to wear off, the duration will reset and stack up to three times.")
}

// parseTemplateSoulEating parses `{{SoulEating}}`.

func parseTemplateTheFallingStar() *api.Enchantment {
	return &api.Enchantment{
		Name:  "The Falling Star",
		Notes: new("On hit, this weapon has a chance to pull down a falling star upon your foes, dealing 90d6 Fire Damage and 30d6 Bludgeoning Damage to enemies caught within the blast. This blast is so powerful it has a chance to knowck nearby enemies down upon impact."),
	}
}

// parseTemplateThrilloftheHunt handles Template:ThrilloftheHunt

func parseTemplateThrilloftheHunt() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Thrill of the Hunt",
		Notes: new("On Hit: You have a small chance to attempt to hold a monster in place. Even if the Hold is unsuccessful, their Will saves will be reduced by 5."),
	}
}

// parseTemplateIriansMight handles Template:IriansMight

func parseTemplateThunderbane() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Thunderbane",
		Notes: new("This weapon was crafted in the great Thunderforge before Dragons came. Against constructs and the undead, this weapon's effective enhancement bonus is +8 better than its normal enhancement bonus. It deals an extra 7d6 points of damage against the foes."),
	}
}

// parseTemplateKneeCracker handles Template:KneeCracker

func parseTemplateTurbulentBurst() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Turbulent Burst",
		Notes: new("This weapon is enchanted with wild, unpredictable energy. It will do 1d8 damage of a random energy type (fire/cold/electric/acid) on a successful hit and 3d8 damage of a random energy type on critical hits."),
	}
}

// parseTemplateElementalManipulation handles Template:ElementalManipulation

func parseTemplateTouchedbyWildMagic(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Touched by Wild Magic",
		Notes: new("See beyond your fate and destiny. This deck of Tarokka Cards is beyond your comprehension."),
	}
}

// parseTemplateRibcracker parses `{{Ribcracker|(Magnitude)}}`.
