package parser

import (
	"fmt"
	"regexp"
	"strings"
	api "compendium-crawler-go/api"
)

func parseTemplateFortification(rawFortValue string) *api.Enchantment {
	const prefix = "{{Fortification|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Fortification"

	if !strings.HasPrefix(rawFortValue, prefix) || !strings.HasSuffix(rawFortValue, suffix) {
		return nil
	}

	paramList := rawFortValue[len(prefix) : len(rawFortValue)-len(suffix)]
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
		// No other fields are needed.
	}
}


func parseTemplateFalseLife(rawFLValue string) *api.Enchantment {
	const prefix = "{{FalseLife|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawFLValue, prefix) || !strings.HasSuffix(rawFLValue, suffix) {
		// Handle argument-less case, though documentation suggests Type is first parameter
		if strings.TrimSpace(rawFLValue) == "{{FalseLife}}" {
			return &api.Enchantment{Name: "False Life"}
		}
		return nil
	}

	paramList := rawFLValue[len(prefix) : len(rawFLValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Bonus Type)|(Amount)|(Title)

	var bonusType string
	var amount string

	// The order in the template usage section is: (Type)|(Bonus Type)|(Amount)|(Title)
	// The order in the example usage section implies: (Type)|(Amount)|(Bonus Type)|(Title)
	// We will stick to the positional order listed in the USAGE section documentation: (Type)|(Bonus Type)|(Amount)|(Title)

	// 2. Bonus Type (Index 1 - defaults to Enhancement)
	if len(parts) >= 2 {
		val := stripBrackets(parts[1])
		if val == "" {
			bonusType = defaultBonusType
		} else {
			bonusType = val
		}
	} else {
		bonusType = defaultBonusType // Default value
	}

	// 3. Amount (Index 2)
	if len(parts) >= 3 {
		amount = stripBrackets(parts[2])
		val := stripBrackets(parts[0])
		if val == "Conditioning" {
			amount = amount + "%"
		}
	}

	return &api.Enchantment{
		Name:      "Maximum Hit Points",
		Amount:    amount,
		BonusType: bonusType,
	}
}


func parseTemplateFeatherFalling(rawFFValue string) *api.Enchantment {
	const templateName = "Feather Falling"
	const prefix = "{{" + templateName + "}}"

	// This template has no arguments, so we just check for the exact full string
	if strings.TrimSpace(rawFFValue) != prefix {
		// Since the name in the docs uses a space, we check for both {{FeatherFalling}} and {{Feather Falling}}
		if strings.TrimSpace(strings.ReplaceAll(rawFFValue, " ", "")) != "{{FeatherFalling}}" {
			return nil
		}
	}

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}


// Template:FavoredWeapon
// No parameters; simple named enchantment with descriptive note.
// Example text from docs:
// "Favored Weapon: This weapon has a divine attunement and may be wielded as if it were a Favored Weapon regardless of your Deity."
func parseTemplateFavoredWeapon() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Favored Weapon",
		Notes: new("This weapon has a divine attunement and may be wielded as if it were a Favored Weapon regardless of your Deity."),
	}
}


// Template:FrozenAether
// No parameters. Documentation indicates it simply marks the item as "Frozen Aether" with explanatory text.
func parseTemplateFrozenAether() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Frozen Aether",
		Notes: new("This weapon can inflict ten stacks of Cold Damage over time, with one stack expiring at a time."),
	}
}


// Template:FellingTheOak
// No parameters; simple named enchantment.
func parseTemplateFellingTheOak() *api.Enchantment {
	return &api.Enchantment{
		Name: "Felling the Oak",
	}
}


// Template:Faith
// No parameters. Per documentation, Insightful Faith grants three Insight bonuses to Turn Undead mechanics:
//   - +2 to effective level for the turning check
//   - +2 to maximum Hit Dice turned
//   - +4 to total Hit Dice turned
//
// We output three standard enchantments to capture these separately.
func parseTemplateFaith() []*api.Enchantment {
	return []*api.Enchantment{
		{
			Name:      "Turn Undead Level",
			Amount:    "2",
			BonusType: "Insight",
			Notes:     new("Assists only wearers who have the ability to turn undead. Provides Insight bonuses to Turn Undead: +2 effective level for the turning check, +2 maximum Hit Dice turned, and +4 total Hit Dice turned."),
		},
		{
			Name:      "Turn Undead Maximum Hit Dice",
			Amount:    "2",
			BonusType: "Insight",
		},
		{
			Name:      "Turn Undead Additional Hit Dice",
			Amount:    "4",
			BonusType: "Insight",
		},
	}
}


func parseTemplateFreezingIce(rawFIValue string) *api.Enchantment {
	const prefix = "{{FreezingIce|"
	const suffix = "}}"
	const baseName = "Freezing Ice"

	s := strings.TrimSpace(rawFIValue)
	if s != "{{FreezingIce}}" && (!strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix)) {
		return nil
	}

	version := ""
	dc := ""
	if s != "{{FreezingIce}}" {
		paramList := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
		parts := splitParams(paramList)
		if len(parts) >= 1 {
			version = stripBrackets(parts[0])
		}
		if len(parts) >= 2 {
			dc = strings.TrimSpace(parts[1])
		}
	}

	name := baseName
	notes := "While you are wearing this item, your melee, ranged, and unarmed attacks gain the Freezing Ice ability. (When the weapon is used, an icy power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice.)"

	switch strings.ToLower(version) {
	case "minor", "lesser":
		name = version + " " + baseName
		notes = "While you are wearing this item, your melee, ranged, and unarmed attacks gain the " + version + " Freezing Ice ability. (When the weapon is used, an icy power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice.)"
	case "weapon":
		notes = "Your weapon stores the pitiless, immovable power of the ice deep within. When this weapon is used, this power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice."
	case "legendary weapon":
		name = "Legendary Freezing Ice"
		notes = "On hit, this has a chance of freezing your enemies in solid ice. Struck enemies must make a Fortitude DC: 100 save for be frozen solid."
	case "legendary ice":
		name = "Legendary Ice"
		notes = "Your attacks and offensive spells have a chance to freeze an enemy in a block of ice."
	case "new":
		name += " +" + dc
		notes = "Strikes with this weapon have a small chance to force the enemy to succeed against a Fortitude DC: " + dc + " save or be frozen in ice."
	}

	return &api.Enchantment{
		Name:    name,
		Element: "Cold",
		Notes:   new(notes),
	}
}


func parseTemplateFiligreeItemEnchantment(raw string) *api.Enchantment {
	// {{FiligreeItemEnchantment|Enchantment|Amount|VisibleText}}
	params := strings.TrimSuffix(strings.TrimPrefix(raw, "{{"), "}}")
	parts := strings.Split(params, "|")
	if len(parts) < 2 {
		return nil
	}

	name := strings.TrimSpace(parts[1])
	amount := ""
	if len(parts) >= 3 {
		amount = strings.TrimSpace(parts[2])
	}
	// If 4th param exists, it might be the visible text, but we usually want the actual effect name
	// In the example: {{FiligreeItemEnchantment|Armor Piercing||Fortification Bypass}}
	// Enchantment is "Armor Piercing", Amount is empty, VisibleText is "Fortification Bypass"
	// We'll prefer VisibleText if it's there as it's what the user sees.
	if len(parts) >= 4 && strings.TrimSpace(parts[3]) != "" {
		name = strings.TrimSpace(parts[3])
	}

	// Fix for "False Life (Enchantment)" etc.
	if strings.HasSuffix(name, " (Enchantment)") {
		name = strings.TrimSuffix(name, " (Enchantment)")
	}

	// Handle case where amount might be embedded in the name or vice versa
	// Example: {{FiligreeItemEnchantment|Spell Points}} -> name "Spell Points", amount ""
	// If it was meant to be "100 Spell Points", usually it's split.
	// But let's check if the name starts with a number.
	if amount == "" {
		re := regexp.MustCompile(`^([+-]?\d+%?)\s+(.*)$`)
		if m := re.FindStringSubmatch(name); len(m) >= 3 {
			amount = m[1]
			name = m[2]
		}
	}

	return &api.Enchantment{
		Name:   name,
		Amount: amount,
	}
}

// ParseEnchantments finds and parses all enchantment templates in the raw string.

// Template: ForceBlast
// Usage: {{ForceBlast}}
func parseTemplateForceBlast(raw string) *api.Enchantment {
	const prefix = "{{ForceBlast"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Force Blast",
		Amount:    "3d4",
		BonusType: "On-hit",
		Notes:     new("Adds a 2% Chance On Hit to cause a burst of magical force to strike your target, dealing 3d4 Force Damage per Minimum Level of the weapon to all nearby enemies."),
	}
}


func parseTemplateFlamescale(raw string) []*api.Enchantment {
	const prefix = "{{Flamescale"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	var enchantments []*api.Enchantment

	// 1. Damage Reduction Bypass
	enchantments = append(enchantments, &api.Enchantment{
		Name: "Damage Reduction Bypass: Adamantine",
	})

	// 2. Fire Damage
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Fire Damage",
		Amount:    "15d6",
		BonusType: "On-hit",
	})

	return enchantments
}


// Template: FreedomOfMovement
// Usage: {{FreedomOfMovement}}
func parseTemplateFreedomOfMovement(raw string) *api.Enchantment {
	return &api.Enchantment{
		Name:  "Freedom of Movement",
		Notes: new("This item grants its wearer the ability to move and attack normally while under the influence of magic that impedes movement, such as paralysis, solid fog, slow and web."),
	}
}


// Template: FireShield
// Usage: {{FireShield|(Version)|(Is Miss-Guard)}}
// - Version: Fire, Hot, Cold, Ice
// - Is Miss-Guard: If present, it's a miss-guard
func parseTemplateFireShield(raw string) *api.Enchantment {
	const prefix = "{{FireShield"
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
	version := "Hot"
	isMissGuard := false

	if len(parts) > 0 {
		v := strings.TrimSpace(parts[0])
		if strings.EqualFold(v, "Cold") || strings.EqualFold(v, "Ice") {
			version = "Cold"
		} else {
			version = "Hot"
		}
	}

	if len(parts) > 1 {
		if strings.TrimSpace(parts[1]) != "" {
			isMissGuard = true
		}
	}

	name := "Fire Shield (" + version + ")"
	trigger := "successfully attacked"
	if isMissGuard {
		name += " Miss-Guard"
		trigger = "missed"
	}

	otherVersion := "Cold"
	if version == "Cold" {
		otherVersion = "Hot"
	}

	notes := fmt.Sprintf("When you are %s, there is a 10%% chance that Fire Shield (%s) will be cast on you. If this effect activates while you have an active Fire Shield (%s) from another item source, they will nullify each other.", trigger, version, otherVersion)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


// Template: FlawedShadowscaleArmor
// Usage: {{FlawedShadowscaleArmor}}
func parseTemplateFlawedShadowscaleArmor(raw string) *api.Enchantment {
	const prefix = "{{FlawedShadowscaleArmor"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Flawed Shadowscale Armor",
		Notes: new("This Shadowscale Armor is not at its full potential. Another run through the forge could improve it."),
	}
}


// Template: FromTheShadows
// Usage: {{FromTheShadows}}
func parseTemplateFromTheShadows(raw string) *api.Enchantment {
	const prefix = "{{FromTheShadows"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "From The Shadows",
		Notes: new("On Being Missed in Combat: Chance to do 10d6 Negative Energy Damage to the Attacker."),
	}
}


func parseTemplateFreezingIceGuard(raw string) *api.Enchantment {
	const template = "FreezingIceGuard"
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
	isLegendary := false
	if len(parts) >= 1 && strings.EqualFold(strings.TrimSpace(parts[0]), "Legendary") {
		isLegendary = true
	}

	name := "Freezing Ice Guard"
	if isLegendary {
		name = "Legendary Freezing Ice Guard"
	}

	notes := "When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateFleshmaker(raw string) *api.Enchantment {
	const template = "Fleshmaker"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Healing Amplification"
	notes := "Grants +20 enhancement bonus to Healing Amplification."

	return &api.Enchantment{
		Name:      name,
		Amount:    "20",
		BonusType: "Enhancement",
		Notes:     new(notes),
	}
}


func parseTemplateFearsome() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Fearsome",
		Notes: new("This item causes those who strike the user to be overcome with terror, as from the Fear spell."),
	}
}


func parseTemplateFeedsOffMadness() *api.Enchantment {
	name := "Feeds Off Madness"
	notes := "This item greedily feeds off the aura of madness related to certain Xoriat effects. The more of these the wearer is affected by, the stronger the item will become."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateFrostbite() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Frostbite",
		Notes: new("Frostbite: On Hit: Applies a stack of Vulnerable (1% more damage for 3 seconds. This effect stacks up to 20 times, and loses one stack on expiration.). This effect may only occur on-hit once every two seconds.\nOn Vorpal: Applies a stack of Lethargy (-1 to all Saving Throws. Non-bosses also move and attack 5% slower. This effect stacks up to 5 times.)"),
	}
}


func parseTemplateFaeryfireCurse(raw string) []*api.Enchantment {
	const template = "FaeryfireCurse"
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

	name := "Faeryfire Curse"
	if title != "" {
		name = title
	}

	notes := "Faeryfire Curse: Empowered by the Faerylights, your Illusion spells have a chance to curse your enemies with Purple Faery Fire, dispelling stealth, invisibility, blur, and displacement for 30 seconds, and giving a -40 penalty to hide. Sightless enemies are immune to the dazzle effect."

	return []*api.Enchantment{
		{
			Name:  name,
			Notes: new(notes),
		},
		{
			Name:      "Skill: Hide",
			Amount:    "-40",
			BonusType: "Penalty",
		},
	}
}


func parseTemplateFascinationGuard(raw string) *api.Enchantment {
	const template = "FascinationGuard"
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

	name := "Fascination Guard"
	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new("When hit or missed in melee combat, your foes have a chance to be Fascinated with no save."),
	}
}


func parseTemplateFettersofUnreality(raw string) *api.Enchantment {
	const prefix = "{{FettersofUnreality"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Fetters of Unreality"
	notes := "This weapon has a chance to inflict multiple stacks of Vulnerable.\n\nVulnerable: You take 1% more damage for 3 seconds. This effect stacks up to 20 times, and loses one stack on expiration."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateGiantSlayer parses `{{GiantSlayer}}`.

func parseTemplateFinesse(raw string) *api.Enchantment {
	const prefix = "{{Finesse"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	amount := "+2"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
			val := strings.TrimSpace(parts[0])
			if !strings.HasPrefix(val, "+") && !strings.HasPrefix(val, "-") {
				amount = "+" + val
			} else {
				amount = val
			}
		}
	}

	name := "Finesse"
	notes := fmt.Sprintf("The wielder can use a finesse weapon as if he had the Weapon Finesse feat. In addition, the weapon grants a %s enhancement bonus to the wielder's Dexterity score.", amount)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateFinishingTouch(raw string) *api.Enchantment {
	const prefix = "{{FinishingTouch"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Finishing Touch"
	notes := "This item is one step away from its completion. Bring it to a Cannith Reforging Station and combine it with melted materials to restore this item to its full potential."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMalleable parses `{{Malleable}}`.

func parseTemplateFusible(raw string) *api.Enchantment {
	const prefix = "{{Fusible"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Fusible"
	notes := "Something about this item looks incomplete. Perhaps in the future it will be compatible with another item to create a brand-new fusion of the two."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFragmented parses `{{Fragmented}}`.

func parseTemplateFragmented(raw string) *api.Enchantment {
	const prefix = "{{Fragmented"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Fragmented"
	notes := "This item looks as though it is only one half of a greater item. Perhaps in the future it could be rejoined with its other half to reform the item in its original glory."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateImpact parses `{{Impact|(Magnitude)}}`.

func parseTemplateFracturing(raw string) *api.Enchantment {
	const prefix = "{{Fracturing"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	amount := "2"
	sides := "6"
	name := "Fracturing"

	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			if a := strings.TrimSpace(parts[0]); a != "" {
				amount = a
			}
		}
		if len(parts) >= 2 {
			if s := strings.TrimSpace(parts[1]); s != "" {
				sides = s
			}
		}
		if len(parts) >= 3 {
			if t := strings.TrimSpace(parts[2]); t != "" {
				name = t
			}
		}
	}

	notes := fmt.Sprintf("This weapon is ideal for breaking bones and does %sd%s damage to targets that have skeletons or are made of bone.", amount, sides)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateElementalSpiral parses `{{ElementalSpiral}}`.

func parseTemplateFlamebitten(raw string) *api.Enchantment {
	const prefix = "{{Flamebitten"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Flamebitten"
	notes := "Applies a stack of Vulnerable (1% more damage for 3 seconds. This effect stacks up to 20 times, and loses one stack on expiration.). This effect may only occur on-hit once every two seconds.\n\nOn Vorpal: Applies a stack of Ashcarred (-1 to all Saving Throws. Non-bosses also move and attack 5% slower. This effect stacks up to 5 times.)"

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBrillanceoftheShatteredSun parses `{{BrillanceoftheShatteredSun}}`.

func parseTemplateFeeding(raw string) *api.Enchantment {
	const prefix = "{{Feeding"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	amount := ""
	if strings.HasPrefix(content, "|") {
		amount = strings.TrimSpace(content[1:])
	}

	name := "Feeding"
	if amount != "" {
		name = fmt.Sprintf("Feeding %s", amount)
	} else {
		amount = "1" // Default amount if not specified
	}

	notes := fmt.Sprintf("On Vorpal Hit: Your target incurs one Negative level, and you gain +%s Temporary Hit Points. (These Temporary Hit Points last for one minute, or until used to negate incoming damage.)", amount)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

func parseTemplateForgedLightning() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Forged Lightning",
		Notes: new("On Hit: 2% Chance to do 300 to 500 damage in a blast radius."),
	}
}

// parseTemplateThunderbane handles Template:Thunderbane
