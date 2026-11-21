package parser

import (
	"fmt"
	"strconv"
	"strings"
	api "compendium-crawler-go/api"
)

func parseTemplateJetPropulsion(rawJetValue string) *api.Enchantment {
	const prefix = "{{JetPropulsion"
	const suffix = "}}"
	const baseName = " Jet Propulsion" // Suffix to the Type parameter

	if !strings.HasPrefix(rawJetValue, prefix) || !strings.HasSuffix(rawJetValue, suffix) {
		return nil
	}

	paramList := rawJetValue[len(prefix) : len(rawJetValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	var enchName string
	if len(parts) >= 1 && stripBrackets(parts[0]) != "" {
		// Concatenate Type and Base Name (e.g., "Enhanced" + " Jet Propulsion")
		enchName = stripBrackets(parts[0]) + baseName
	} else {
		// If Type is missing, use the default name
		enchName = "Jet Propulsion"
	}

	// Since this is a static effect, Amount and Bonus remain empty.
	return &api.Enchantment{
		Name: enchName,
	}
}


func parseTemplateLegendaryGreenSteel() *api.Enchantment {
	return &api.Enchantment{
		Name: "Legendary Green Steel",
	}
}


// Template:LitanyAbilityBonus
// Usage per docs: {{LitanyAbilityBonus|Magnitude}}
// - Magnitude is a Roman numeral I..II indicating the version on the weapon.
// - Grants a +[Magnitude] Profane bonus to all ability scores.
// We emit six standard ability bonuses: Strength, Dexterity, Constitution,
// Intelligence, Wisdom, Charisma.
func parseTemplateLitanyAbilityBonus(raw string) []*api.Enchantment {
	const prefix = "{{LitanyAbilityBonus|"
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return nil
	}
	params := raw[len(prefix) : len(raw)-len(suffix)]
	magnitude := stripBrackets(params)
	if magnitude == "" {
		return nil
	}
	// Convert Roman numeral (I/II) to integer string
	// If already numeric, keep as-is.
	magInt := romanToInt(magnitude)
	if magInt <= 0 {
		// try parse numeric fallback
		if n, err := strconv.Atoi(magnitude); err == nil {
			magInt = n
		}
	}
	if magInt <= 0 {
		return nil
	}
	amount := strconv.Itoa(magInt)

	abilities := []string{"Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"}
	out := make([]*api.Enchantment, 0, len(abilities))
	for _, ab := range abilities {
		out = append(out, &api.Enchantment{
			Name:      ab,
			Amount:    amount,
			BonusType: "Profane",
		})
	}
	return out
}


// Template:LimbChopper
// No parameters. Vorpal-like effect that severs a limb on a confirmed 20.
// We capture it as a simple named enchantment with an On-vorpal bonus type.
func parseTemplateLimbChopper() *api.Enchantment {
	return &api.Enchantment{
		Name:      "Limb Chopper",
		BonusType: "On-vorpal",
		Notes:     new("On a confirmed 20 critical, severs a limb; many creatures are unaffected"),
	}
}


// Template:Keen
// Usage: {{Keen|(Magnitude)|(Title)}}
// - Magnitude: Roman numeral I–V. Defaults to I when omitted.
// - Title: Optional custom name override.
// Behavior per docs screenshot:
//
//	Keen (I): Passive – doubles base critical threat range; does not stack with Improved Critical.
//	           Vorpal strikes by this weapon also bypass all Fortification.
//	Keen II:  Additionally grants +0.5[W] damage, plus the same Keen effects above.
func parseTemplateKeen(raw string) *api.Enchantment {
	const prefix = "{{Keen"
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

	var magnitude = "I" // default
	var title string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := stripBrackets(parts[0])
			if v != "" {
				magnitude = v
			}
		}
		if len(parts) >= 2 {
			title = stripBrackets(parts[1])
		}
	}

	// Name resolution
	var name string
	if title != "" {
		name = title
	} else if strings.EqualFold(magnitude, "I") || magnitude == "" {
		name = "Keen"
	} else {
		name = "Keen " + magnitude
	}

	// Notes assembly
	base := "Passive: base critical threat range of this weapon is doubled. This does not stack with the Improved Critical Feat. Vorpal strikes by this weapon also bypass all Fortification."
	var note string
	if strings.EqualFold(magnitude, "II") {
		note = "Passive: This weapon deals an additional +0.5[W] damage. " + base
	} else {
		note = base
	}

	return &api.Enchantment{
		Name:  name,
		Notes: &note,
	}
}


// Template:Linguistics
// Usage: {{Linguistics|(Amount)}}
func parseTemplateLinguistics(raw string) []*api.Enchantment {
	const prefix = "{{Linguistics"
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

	skills := []string{
		"Bluff",
		"Diplomacy",
		"Intimidate",
	}

	var results []*api.Enchantment
	for _, skill := range skills {
		results = append(results, &api.Enchantment{
			Name:      "Skill: " + skill + " (Cooldown Reduction)",
			Amount:    amount + "%",
			BonusType: "Enhancement",
		})
	}

	return results
}


// Template: LitanyCombatBonus
// Usage: {{LitanyCombatBonus|(Magnitude)}}
func parseTemplateLitanyCombatBonus(raw string) []*api.Enchantment {
	const prefix = "{{LitanyCombatBonus"
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
	magnitude := "I"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		magnitude = strings.TrimSpace(parts[0])
	}

	attackBonus := "1"
	damageBonus := "1"
	if strings.EqualFold(magnitude, "II") {
		attackBonus = "4"
		damageBonus = "4"
	}

	return []*api.Enchantment{
		{
			Name:      "Attack Rolls",
			Amount:    attackBonus,
			BonusType: "Profane",
			Notes:     new("The Litany of the Dead enhances the combat abilities of its owner. Grants a Profane bonus to attack bonus."),
		},
		{
			Name:      "Damage Rolls",
			Amount:    damageBonus,
			BonusType: "Profane",
			Notes:     new("The Litany of the Dead enhances the combat abilities of its owner. Grants a Profane bonus to damage."),
		},
	}
}


// Template: LostPurpose
// Usage: {{LostPurpose}}
func parseTemplateLostPurpose(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Lost Purpose",
		Notes: new("This item is missing some parts that made it unique. Perhaps you can fix that at a Cannith Repurposing Station."),
	}
}

// Usage: {{ScarabofProtectionWard}}

func parseTemplateLifeShield(raw string) *api.Enchantment {
	const template = "LifeShield"
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

	name := "Life Shield"
	var notes string
	if strings.ToLower(typeName) == "weapon" {
		name = "Life Shield (Weapon)"
		notes = "Every time you are hit while wielding a Life Shield weapon there is a 10% chance you gain 15 temporary hitpoints that last for up to 1 minute."
	} else {
		notes = "Every time you are hit while wearing a Life Shield item there is a 10% chance you gain 15 temporary hitpoints that last for up to 1 minute."
	}

	return &api.Enchantment{
		Name:   name,
		Amount: "15",
		Notes:  new(notes),
	}
}


func parseTemplateKickEmWhileTheyreDown(raw string) *api.Enchantment {
	const template = "KickEmWhileTheyreDown"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Kick 'Em While They're Down"
	notes := "You have 5 more attack and deal 5 more damage to enemies that are knocked down or stunned."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateLightningGuard(raw string) *api.Enchantment {
	const template = "LightningGuard"
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
	magnitude := ""
	if len(parts) >= 1 {
		magnitude = strings.TrimSpace(parts[0])
	}

	num := romanToInt(magnitude)
	dice := ""
	if num > 0 {
		dice = fmt.Sprintf("%dd4", num)
	}

	name := "Lightning Guard"
	if magnitude != "" {
		name = fmt.Sprintf("Lightning Guard %s", magnitude)
	}

	notes := "On being Hit in Melee: Electric damage to your attacker."
	if dice != "" {
		notes = fmt.Sprintf("On being Hit in Melee: %s Electric damage to your attacker.", dice)
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateLifesealed(raw string) []*api.Enchantment {
	const template = "Lifesealed"
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
	bonusType := "Enhancement"

	if len(parts) >= 1 {
		amount = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		bonusType = strings.TrimSpace(parts[1])
		if bonusType == "" {
			bonusType = "Enhancement"
		}
	}

	var results []*api.Enchantment

	// 1. Immunity: Magical Death Effects
	results = append(results, &api.Enchantment{
		Name:  "Immunity: Magical Death Effects",
		Notes: new("You are immune to magical effects that cause instant death."),
	})

	// 2. Negative Energy Absorption
	name := "Negative Energy Absorption"
	if amount != "" {
		name = fmt.Sprintf("Negative Energy Absorption %s%%", amount)
	}

	notes := fmt.Sprintf("You have a %s%% %s bonus to Negative Energy Absorption.", amount, bonusType)

	results = append(results, &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		Notes:     new(notes),
	})

	return results
}


func parseTemplateLightningStormGuard(raw string) *api.Enchantment {
	const template = "LightningStormGuard"
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

	name := "Lightning Storm Guard"
	notes := "This item stores the power of a volatile thunderstorm deep within. Occasionally, this dynamic power comes to the surface, devastating enemies with a massive lightning strike."

	if strings.EqualFold(itemType, "legendary") {
		name = "Legendary Lightning Storm Guard"
		notes = "When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, striking the attacker with an incredible amount of electrical force."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateLightningStrike(raw string) *api.Enchantment {
	const template = "LightningStrike"
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
	strikeType := ""
	if len(parts) >= 1 {
		strikeType = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	name := "Lightning Strike"
	var notes string

	switch strikeType {
	case "sovereign":
		name = "Sovereign Lightning Strike"
		notes = "On any vorpal strike that is confirmed as a critical hit, this item will strike your foe with a tremendous burst of lightning. A successful 100 DC: Reflex save reduces this by half."
	case "weapon":
		notes = "While wearing this item, your melee and ranged weapons gain Hit Effect: This item stores the power of a volatile thunderstorm deep within. Occasionally, this dynamic power comes to the surface, devastating enemies with a massive lighting strike."
	default:
		notes = "Occasionally, this dynamic power comes to the surface, devastating enemies with a massive lightning strike."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateLifeStealing(raw string) *api.Enchantment {
	const prefix = "{{LifeStealing"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Life Stealing"
	notes := "This weapon has a chance to drain 1 to 3 levels from its target on a critical hit."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateGodlyWrath parses `{{GodlyWrath}}`.

func parseTemplateLifedrinker(raw string) *api.Enchantment {
	const prefix = "{{Lifedrinker"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Lifedrinker"
	notes := "On an attack roll of 20 which is confirmed as a critical hit, this power comes to the surface, granting 25 temporary hit points to the wielder and deals 5d5+20 damage to the target. Creatures with the Fire trait take double this damage instead."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateRadiantBlast parses `{{RadiantBlast}}`.

func parseTemplateLightsOut() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Lights Out",
		Notes: new("On hit, this has a chance of blinding your enemies with ash."),
	}
}

// parseTemplateElementalForm handles Template:ElementalForm

func parseTemplateKneeCracker() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Knee Cracker",
		Notes: new("On Hit: 15% chance to slow 25% (No Save) for 5 sec (non-bosses only)."),
	}
}

// parseTemplateRebellion handles Template:Rebellion
