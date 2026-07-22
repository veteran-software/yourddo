package parser

import (
	api "compendium-crawler-go/api"
	"fmt"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"strings"
)

func parseTemplateStrikethrough(rawSTValue string) *api.Enchantment {
	const prefix = "{{Strikethrough|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Strikethrough Chance"

	if !strings.HasPrefix(rawSTValue, prefix) || !strings.HasSuffix(rawSTValue, suffix) {
		return nil
	}

	paramList := rawSTValue[len(prefix) : len(rawSTValue)-len(suffix)]
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

	name := baseName
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
		name = stripBrackets(parts[2]) // Use custom title (e.g., "Calamitous Blows")
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}

func parseTemplateStunning(rawStunValue string) []*api.Enchantment {
	const prefix = "{{Stunning|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawStunValue, prefix) || !strings.HasSuffix(rawStunValue, suffix) {
		return nil
	}

	paramList := rawStunValue[len(prefix) : len(rawStunValue)-len(suffix)]
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

	// --- CRITICAL: Generate Two Separate Enchantments ---
	for _, maneuver := range stunningManeuvers {
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

// Template:Steam
// Usage: {{Steam|(Type)|(Title)}}
// Behavior: output only the enchantment name. If Title is provided, use it.
// Otherwise, form the name from Type:
//   - blank or "Basic" -> "Steam"
//   - otherwise -> "<Title-Cased Type> Steam" (e.g., Legendary -> "Legendary Steam")
func parseTemplateSteam(raw string) *api.Enchantment {
	const prefix = "{{Steam"
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

	var typ, title string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			typ = stripBrackets(parts[0])
		}
		if len(parts) >= 2 {
			title = stripBrackets(parts[1])
		}
	}

	if strings.TrimSpace(title) != "" {
		return &api.Enchantment{Name: title}
	}

	t := strings.ToLower(strings.TrimSpace(typ))
	switch t {
	case "", "basic":
		return &api.Enchantment{Name: "Steam"}
	default:
		name := cases.Title(language.English).String(t) + " Steam"
		return &api.Enchantment{Name: name}
	}
}

// Template:Striding
// Usage: {{Striding|(Enhancement Amount)|(Public Area)}}
func parseTemplateStriding(raw string) *api.Enchantment {
	const prefix = "{{Striding"
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
	if len(parts) >= 1 {
		amount = strings.TrimSpace(parts[0])
	}
	if amount == "" {
		return nil
	}

	publicArea := ""
	if len(parts) >= 2 {
		publicArea = strings.TrimSpace(parts[1])
	}

	name := "Movement Speed"
	if publicArea != "" {
		name = name + " (Public Areas)"
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount + "%",
		BonusType: "Enhancement",
	}
}

func parseTemplateSuppressed() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Suppressed",
		Notes: new("This psionic item is powerful, but you sense that it has not unlocked all of its secrets to you at this time."),
	}
}

// Template: StormreaverUpgrade
// Usage: {{StormreaverUpgrade}}
func parseTemplateStormreaverUpgrade(raw string) *api.Enchantment {
	const prefix = "{{StormreaverUpgrade"
	const suffix = "}}"
	const name = "Upgradeable Item (Stormreaver)"
	const notes = "This item could be upgraded if you found a Seal of the Stormreaver to combine it with. Bring this item to the Stormreaver Monument in Gianthold and combine it with a Seal of the Stormreaver to upgrade the item to a more powerful form."

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// Template: SuppressMadness
// Usage: {{SuppressMadness}}
func parseTemplateSuppressMadness(raw string) *api.Enchantment {
	const prefix = "{{SuppressMadness"
	const suffix = "}}"
	const name = "Suppress Madness"
	const notes = "This strange creature is enchanted with the ability to temporarily filter the maddening effects of certain Xoriat items. Wearing it will suppress the effects of the following: Curse Vector, Unwieldy, Overfocus, Mind Turbulence, Symbiotic Backlash, Metal Fatigue, Power Drain, and Single-Mindedness."

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateStaggeringBlow(raw string) *api.Enchantment {
	const template = "StaggeringBlow"
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
	staggeringType := ""
	if len(parts) >= 1 {
		staggeringType = strings.TrimSpace(parts[0])
	}

	name := "Staggering Blow"
	notes := "This item is enchanted to make your attacks send enemies reeling. When you roll a natural 20 on an attack with a melee weapon you will knock the target down unless it makes a DC 17 Balance check."

	switch {
	case strings.EqualFold(staggeringType, "Unstoppable"):
		name = staggeringType + " Staggering Blow"
		notes = "On a natural 20 that is confirmed as a critical hit, this weapon will trip your opponent, forcing them to fall prone. There is no save against this effect."
	case strings.EqualFold(staggeringType, "Custom") && len(parts) >= 2:
		dc := strings.TrimSpace(parts[1])
		name = "Staggering +" + dc
		notes = "This item is enchanted to make your attacks send enemies realing. On an attack roll of 20 which is confirmed as a critical hit you will knock the target down unless it makes a Reflex DC: " + dc + " saving throw."
	case staggeringType != "":
		name = staggeringType + " Staggering Blow"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSymbioticFlexibility() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Symbiotic Flexibility",
		Notes: new("A suit of armor that has this property has a maximum Dexterity bonus 4 higher than normal, and its armor check penalty is reduced by 4."),
	}
}

func parseTemplateSymbioticBacklash() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Symbiotic Backlash",
		Notes: new("This item is symbiotic and grants you benefits, but it also deals 2d6 extra damage to you when enemies roll a 20 on an attack against you."),
	}
}

func parseTemplateSwimLikeAFish() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Swim like a Fish",
		Notes: new("While this item is equipped and you are swimming, you gain the Evasion feat. Evasion causes you to take no damage on a successful Reflex saving throw against an effect which would normally allow half damage on a successful Reflex save."),
	}
}

func parseTemplateSunAndStars() *api.Enchantment {
	name := "Sun and Stars"
	notes := "When you activate Hand of Healing or Hand of Harm from the Shintao enhancement tree, you benefit from increased Melee Power and Positive Healing Amplification for a short time."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateStonePrisonGuard(raw string) *api.Enchantment {
	const template = "StonePrisonGuard"
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
	itemType := ""
	if len(parts) >= 1 {
		itemType = strings.TrimSpace(parts[0])
	}

	name := "Stone Prison Guard"
	notes := "This item has a chance to turn those who hit you to stone. A successful Fortitude DC: 17 save will negate this effect."

	if strings.EqualFold(itemType, "Lesser") {
		name = "Lesser Stone Prison Guard"
		notes = "This item has a small chance to turn those who hit you to stone. A successful Fortitude DC: 17 save will negate this effect."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateSubtleTarget() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Subtle Target",
		Notes: new("Once per minute, when you use Diplomacy, you gain a -100% Profane bonus to threat generation with weapon strikes for 20 seconds."),
	}
}

func parseTemplateStickyGooGuard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Sticky Goo Guard",
		Notes: new("This item has a chance of encasing a creature in sticky goo, much like an attack of a mimic. It reduces the creatures move speed and attack speed."),
	}
}

func parseTemplateStormreaverThunderclap() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Stormreaver's Thunderclap",
		Notes: new("On a Melee strike of a Natural 20 that is confirmed as a critical hit, this item will strike your foe with tremendous burst of lightning. A Reflex DC: 100 save will prevent half of this damage."),
	}
}

func parseTemplateStability(raw string) *api.Enchantment {
	const template = "Stability"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := s[len(prefix) : len(s)-len(suffix)]
	if strings.HasPrefix(content, "|") {
		content = content[1:]
	}

	params := splitParams(content)
	variant := ""
	if len(params) > 0 && params[0] != "" {
		variant = strings.ToLower(strings.TrimSpace(params[0]))
	}

	name := "Stability"
	bonus := "2"

	switch variant {
	case "greater":
		name = "Greater Stability"
		bonus = "4"
	case "superior":
		name = "Superior Stability"
		bonus = "6"
	}

	notes := fmt.Sprintf("%s: Grants the wearer a +%s deflection bonus to Armor Class and a +%s resistance bonus to all saving throws if they are of True Neutral alignment.", name, bonus, bonus)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateStumbling(raw string) *api.Enchantment {
	const prefix = "{{Stumbling"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitudeRaw := strings.ToUpper(strings.TrimSpace(inner))
	if magnitudeRaw == "" {
		magnitudeRaw = "I"
	}

	romanToVal := map[string]int{
		"I": 1, "II": 4, "III": 6, "IV": 8, "V": 10,
		"VI": 1, "VII": 12, "VIII": 13, "IX": 14, "X": 15,
	}

	val, ok := romanToVal[magnitudeRaw]
	if !ok {
		val = 1
		magnitudeRaw = "I"
	}

	tripDC := val
	name := fmt.Sprintf("Stumbling %s", magnitudeRaw)
	notes := fmt.Sprintf("On Hit: Your target suffers a -1 Penalty to Reflex Saving Throws for 6 second. This effect stacks up to 5 times. This effect may only occur on-hit once every three seconds. Passive: The DC of the saving throw to resist your Trip combat feats is increased by %d.", tripDC)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateSundering parses `{{Sundering|(Magnitude)}}`.
// Magnitude is a Roman Numeral from I to X. Defaults to I.

func parseTemplateSundering(raw string) *api.Enchantment {
	const prefix = "{{Sundering"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitudeRaw := strings.ToUpper(strings.TrimSpace(inner))
	if magnitudeRaw == "" {
		magnitudeRaw = "I"
	}

	romanToVal := map[string]int{
		"I": 1, "II": 4, "III": 6, "IV": 8, "V": 10,
		"VI": 11, "VII": 12, "VIII": 13, "IX": 14, "X": 15,
	}

	val, ok := romanToVal[magnitudeRaw]
	if !ok {
		val = 1
		magnitudeRaw = "I"
	}

	sunderDC := val
	name := fmt.Sprintf("Sundering %s", magnitudeRaw)
	notes := fmt.Sprintf("On Hit: Your target suffers a -1 Penalty to Fortitude Saving Throws for 6 second. This effect stacks up to 5 times. This effect may only occur on-hit once every three seconds. Passive: The DC of the saving throw to resist your Sunder combat feats is increased by %d.", sunderDC)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateStealerOfSouls(raw string) *api.Enchantment {
	const prefix = "{{StealerOfSouls"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	params := strings.Split(content, "|")
	soulCount := "20" // Default as seen in some items, or could be empty. Switch uses {{{1}}}
	stealerType := ""

	if len(params) > 1 {
		soulCount = strings.TrimSpace(params[1])
	}
	if len(params) > 2 {
		stealerType = strings.TrimSpace(params[2])
	}

	name := "Stealer of Souls"
	var notes string

	if strings.EqualFold(stealerType, "overwhelming") {
		name = "Overwhelming Stealer of Souls"
		notes = "This weapon tears at the very essence of your foes. On any strike, this weapon applies a single stack of Soul Scar, which reduces your target's Will Saves, Armor Class, and Fortification by 1 per stack, max 10. Occasionally, this weapon attempts to rip the life from your foe, as if it were the victim of a Phantasmal Killer spell with a Will DC 100 save. Bosses (and enemies with more than 10,000 hit points) are immune to this effect.\n\nKilling a monster will consume its soul, adding a stack of Consumed Soul to you. Consumed Souls stack up to 20 times, and linger for 20 seconds. Each one provides a +1 Profane bonus to Damage and Melee Power. If you block or unequip this weapon, the Consumed Souls will be released."
	} else {
		if strings.EqualFold(stealerType, "Legendary") {
			name = "Legendary Stealer of Souls"
		}
		notes = fmt.Sprintf("This item hungers for the Souls of those you have defeated. On a Vorpal hit with this weapon, this item will absorb some of its Soul, draining one level from the target. When you strike the killing blow on an enemy, this item retains one Defeated Soul, up to a maximum of %s. Each Defeated Soul grants you +1 Profane bonus to Melee Power and +1 Profane bonus to Damage. If you block or unequip this item, the Defeated Souls will be released. Defeated Souls last for 30 seconds.", soulCount)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCloudburst parses `{{Cloudburst}}`.

func parseTemplateStonePrison(raw string) *api.Enchantment {
	const prefix = "{{StonePrison"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	prisonType := ""
	if strings.HasPrefix(content, "|") {
		prisonType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Stone Prison"
	dc := "27"

	if strings.EqualFold(prisonType, "Greater") {
		name = "Greater Stone Prison"
		dc = "33"
	} else if strings.EqualFold(prisonType, "Legendary") {
		name = "Legendary Stone Prison"
		dc = "100"
	}

	notes := "This weapon is invested with the power of the earth. On an attack roll of 20 which is confirmed as a critical hit it will attempt to turn the target to stone, as the Flesh to Stone spell. A successful Fortitude DC: " + dc + " save negates the effect."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateSunBurst parses `{{SunBurst|Type|DC Amount|Title}}`.
func parseTemplateSunBurst(raw string) *api.Enchantment {
	const prefix = "{{SunBurst"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	var sbType, dc, title string
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(strings.TrimPrefix(content, "|"), "|")
		if len(parts) > 0 {
			sbType = strings.TrimSpace(parts[0])
		}
		if len(parts) > 1 {
			dc = strings.TrimSpace(parts[1])
		}
		if len(parts) > 2 {
			title = strings.TrimSpace(parts[2])
		}
	}

	name := "Sun Burst"
	var notes string

	if strings.EqualFold(sbType, "Greater") || strings.EqualFold(sbType, "Lesser") {
		if strings.EqualFold(sbType, "Greater") {
			name = "Greater Sun Burst"
		} else {
			name = "Lesser Sun Burst"
		}
		notes = "This weapon/shield blazes with the eternal fury at the heart of a sun. Occasionally, this power comes to the surface, unleashing a nova of light which will blind the struck enemy, dealing severe light damage to it and any other nearby foes."
	} else if strings.EqualFold(sbType, "Custom") {
		name = "Sun Burst +" + dc
		notes = "This weapon blazes with the eternal fury at the heart of a sun. Occassionally, this power comes to the surface, unleashing a nova of light which will blind the struck enemey for 6 seconds unless it succeeds on a Reflex DC: " + dc + " saving throw."
	} else {
		notes = "This weapon flashes an intense burst of sunlight on any critical hit. The target is blasted for 6d6 of light damage and is blinded as well. Oozes and Undead take 12d6 light damage. A successful Reflex DC: 22 save reduces the damage by half and negates the blindness."
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplatePlantSlaying parses `{{PlantSlaying}}`.

func parseTemplateStaticAttraction(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{StaticAttraction", "Static Attraction", "This weapon attracts the static electricity in the air, and over time will charge with magic. Every five seconds, this weapon gains a charge of Static Electricity, up to a maximum of 3, providing +10 Exceptional bonus to Electric Spell Power and a 5% Exceptional bonus to Electric Spell Lore. When you cast an Electric spell, all stacks are consumed.")
}

// parseTemplateSoulTear parses `{{SoulTear}}`.

func parseTemplateStonePaws() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Stone Paws",
		Notes: new("In Animal Form, Gain +2[W] and DR 15/Adamantine."),
	}
}

// parseTemplateCasterLevel handles Template:CasterLevel
