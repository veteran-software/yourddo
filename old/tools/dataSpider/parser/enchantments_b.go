package parser

import (
	"fmt"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

func parseTemplateBloodRage(rawBRValue string) *api.Enchantment {
	const prefix = "{{BloodRage|"
	const suffix = "}}"
	const baseName = "Blood Rage"

	// Handle argument-less case, which defaults to Normal
	if strings.TrimSpace(rawBRValue) == "{{BloodRage}}" {
		return &api.Enchantment{Name: baseName}
	}

	if !strings.HasPrefix(rawBRValue, prefix) || !strings.HasSuffix(rawBRValue, suffix) {
		return nil
	}

	paramList := rawBRValue[len(prefix) : len(rawBRValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (type)

	var rageType = "" // Default is blank/Normal

	// 1. Type (Index 0)
	if len(parts) >= 1 {
		val := stripBrackets(parts[0])
		if val != "" {
			rageType = val
		}
	}

	var name string
	normalizedType := strings.ToLower(rageType)

	if normalizedType == "enhanced" {
		name = "Enhanced " + baseName
	} else {
		// Default or blank type
		name = baseName
	}

	return &api.Enchantment{
		Name: name,
		// Amount and Bonus remain empty.
	}
}


func parseTemplateBottledHeart() []*api.Enchantment {
	const bonusType = "Legendary" // Fixed bonus type from example

	var enchantments []*api.Enchantment

	// 1. Melee Threat Generation Bonus
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Melee Threat Generation",
		Amount:    "100%", // Fixed amount from example
		BonusType: bonusType,
	})

	// 2. Intimidate Skill Bonus (Following the Skill naming convention: "Intimidate Skill")
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Skill: Intimidate",
		Amount:    "10", // Fixed amount from example
		BonusType: bonusType,
	})

	return enchantments
}


func parseTemplateBluntTrama() *api.Enchantment {
	const templateName = "BluntTrama"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}


func parseTemplateBane(rawBaneValue string) *api.Enchantment {
	const prefix = "{{Bane|"
	const suffix = "}}"
	const defaultBonusType = "On-hit"

	if !strings.HasPrefix(rawBaneValue, prefix) || !strings.HasSuffix(rawBaneValue, suffix) {
		return nil
	}

	paramList := rawBaneValue[len(prefix) : len(rawBaneValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Creature Type)|(Dice)|(Enhancement Bonus)|(Die type)|(Title)

	// 1. Creature Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	creatureType := stripBrackets(parts[0])
	if creatureType == "" {
		return nil
	}

	var dice string
	var enhancementBonus string
	var dieType = "6" // Default die type is d6
	var name string

	// 2. Dice (Optional, Index 1)
	if len(parts) >= 2 {
		dice = stripBrackets(parts[1])
	}

	// 3. Enhancement Bonus (Optional, Index 2)
	if len(parts) >= 3 {
		enhancementBonus = stripBrackets(parts[2])
	}

	// 4. Die type (Optional, Index 3)
	if len(parts) >= 4 {
		val := stripBrackets(parts[3])
		if val != "" {
			dieType = val
		}
	}

	// --- CRITICAL NAME FORMATTING & DATA MAPPING ---
	name = fmt.Sprintf("Bane Damage vs %s", creatureType)

	// Construct Modifier
	var modifier string
	if dice != "" {
		modifier = fmt.Sprintf("%sd%s", dice, dieType)
	} else if enhancementBonus != "" {
		// Fallback for older items that might use enhancement bonus
		modifier = enhancementBonus
	}

	return &api.Enchantment{
		Name: name,

		// Use Amount for the Bane Damage amount (e.g. 4d10)
		Amount: modifier,

		// Use Bonus to store "On-hit"
		BonusType: defaultBonusType,

		// Use Element to store the target creature type for classification
		Element: creatureType,
	}
}


// Template:Bodyfeeder
// Usage (from docs): {{Bodyfeeder|(Type)|(Title)}}
// - Type: Basic (blank), Legendary, Slayer
// Requirement: Output only the name of the enchantment; if Title is present, use it.
// Otherwise, use the Type to prefix the base name "Bodyfeeder".
func parseTemplateBodyfeeder(raw string) *api.Enchantment {
	const prefix = "{{Bodyfeeder"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract parameter section
	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimSpace(inner)
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var parts []string
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	// Title takes precedence when provided
	var title string
	if len(parts) >= 2 {
		title = stripBrackets(parts[1])
	}
	if title != "" {
		return &api.Enchantment{Name: title}
	}

	// Otherwise, form name from Type
	var typ string
	if len(parts) >= 1 {
		typ = stripBrackets(parts[0])
	}
	t := strings.ToLower(strings.TrimSpace(typ))
	name := "Bodyfeeder"
	switch t {
	case "legendary":
		name = legendaryPrefix + "Bodyfeeder"
	case "slayer":
		name = "Slayer Bodyfeeder"
	case "", "basic":
		name = "Bodyfeeder"
	default:
		// Unknown value: title-case and prefix if non-empty
		if t != "" {
			name = cases.Title(language.English).String(t) + " Bodyfeeder"
		}
	}
	return &api.Enchantment{Name: name}
}


// Template: BoonofUndeath
// Usage: {{BoonofUndeath|(Type)}}
func parseTemplateBoonofUndeath(raw string) *api.Enchantment {
	const prefix = "{{BoonofUndeath"
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
	bType := ""
	if len(parts) >= 1 {
		bType = strings.TrimSpace(parts[0])
	}

	name := "Boon of Undeath"
	spell := "Inflict Light Wounds"

	if strings.EqualFold(bType, "Greater") {
		name = "Greater Boon of Undeath"
		spell = "Inflict Moderate Wounds"
	}

	note := fmt.Sprintf("Undead take solace in the hate of others. Every time a character wearing a Boon of Undeath item is struck in combat, an %s spell will be cast on the character.", spell)

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}


// Template: BlackAbbotItemUpgrade
// Usage: {{BlackAbbotItemUpgrade}}
func parseTemplateBlackAbbotItemUpgrade(raw string) *api.Enchantment {
	const prefix = "{{BlackAbbotItemUpgrade"
	const suffix = "}}"
	const name = "Upgradeable Item (Black Abbot)"
	const notes = "This item could be upgraded if you found a Seal of the Black Abbot to combine it with. Bring this item to the Fountain of Necrotic Might outside the Black Mausoleum and combine it with a Seal of the Black Abbot to upgrade the item to a more powerful form."

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateBanishing(raw string) *api.Enchantment {
	const template = "Banishing"
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
	banishingType := ""
	if len(parts) >= 1 {
		banishingType = stripBrackets(parts[0])
	}

	var name string
	var amount string

	normalizedType := strings.ToLower(banishingType)
	switch normalizedType {
	case "improved":
		name = "Improved Banishing"
		amount = "150"
	case "sovereign":
		name = "Sovereign Banishing"
		amount = "300"
	case "weapons":
		name = "Banishing Weapons"
		amount = "150"
	case "fists":
		name = "Banishing Fists"
		amount = "100"
	case "custom":
		name = "Banishing"
		if len(parts) >= 2 {
			enhancementAmount := stripBrackets(parts[1])
			if enhancementAmount != "" {
				name += " +" + enhancementAmount
			}
		}
		if len(parts) >= 3 {
			dieCount := stripBrackets(parts[2])
			if dieCount != "" {
				amount = ParseTemplateDice(fmt.Sprintf("{{Dice||%s|20}}", dieCount)).Raw
			}
		}
	default:
		name = "Banishing"
		amount = "100"
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: "On-vorpal",
	}
}


// Template: BrillianceGuard
// Usage: {{BrillianceGuard|(Title)}}
func parseTemplateBrillianceGuard(raw string) *api.Enchantment {
	const template = "BrillianceGuard"
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
	name := "Brilliance Guard"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		name = strings.TrimSpace(parts[0])
	}

	notes := "This item is imbued with a brilliant, radiant power. When the wearer of this item is successfully attacked in melee, the attacker has a chance of becoming blinded."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateBlood() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Blood",
		Notes: new("The Warforged will benefit more from positive energy healing such as cure spells and potions (+20 Positive Healing Amplification) but will also be more subject to critical hits (-10% fortification)."),
	}
}


func parseTemplateBlackscaleFerocity() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Blackscale Ferocity",
		Notes: new("Killing enemies may cause you to fall into a ferocious rage, granting you the benefits of the Haste spell."),
	}
}


func parseTemplateBloodyThorns() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Bloody Thorns",
		Notes: new("Bloody Thorns: This powerful item is a dangerous weapon to those well-versed in Nature. You receive a Primal bonus to Damage for every four of your Wilderness Lore feats."),
	}
}


func parseTemplateBattleScarred() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Battle-Scarred",
		Notes: new("This item has obviously seen use in many fights. It is chipped and scratched, but perhaps in the future there will be a way to restore it to its former glory."),
	}
}


func parseTemplateBrazenBrilliance(raw string) *api.Enchantment {
	const template = "BrazenBrilliance"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Brazen Brilliance"
	notes := "With this item equipped, your offensive attacks and spells have a chance of creating a burst of pure light, dealing Light damage and blinding enemies."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateBleed(raw string) *api.Enchantment {
	const prefix = "{{Bleed"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	var styleRaw, countParam string
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			styleRaw = strings.ToLower(strings.TrimSpace(parts[0]))
		}
		if len(parts) >= 2 {
			countParam = strings.TrimSpace(parts[1])
		}
	}

	// Defaults per style
	nameBase := "Bleeding"
	dieSides := 8
	defaultCount := "1"
	adjective := "cruelly"

	switch styleRaw {
	case "slicing", "slice", "s":
		nameBase = "Slicing"
		dieSides = 4
		defaultCount = "1"
		adjective = "viciously"
	case "hemorrhaging", "hemorrhage", "h":
		nameBase = "Hemorrhaging"
		dieSides = 8
		defaultCount = "2"
		adjective = "incredibly"
	case "phlebotomizing", "phleb", "p":
		nameBase = "Phlebotomizing"
		dieSides = 8
		defaultCount = "3"
		adjective = "wickedly"
	case "greater", "g":
		nameBase = "Greater Bleeding"
		dieSides = 5
		defaultCount = "8"
		adjective = "precisely"
	}

	dieCount := defaultCount
	if countParam != "" {
		dieCount = countParam
	}

	name := nameBase
	if countParam != "" {
		name += " " + countParam
	}

	notes := fmt.Sprintf("This weapon is %s sharp and will do an additional %sd%d damage to targets that are vulnerable to bleeding.", adjective, dieCount, dieSides)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMortalStrike parses `{{MortalStrike}}`.

func parseTemplateBloodletter(raw string) *api.Enchantment {
	const prefix = "{{Bloodletter"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitude := strings.ToLower(strings.TrimSpace(inner))

	var notes string
	var nameSuffix string

	switch magnitude {
	case "i":
		nameSuffix = "I"
		notes = "If using this, update the template with the text"
	case "ii":
		nameSuffix = "II"
		notes = "On Critical Hit: 5d6 Slashing damage from weapons with x2 Critical Multiplier, 5d8 Slashing damage from weapons with a x3 Critical Multiplier, and 5 to 50 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	case "iii":
		nameSuffix = "III"
		notes = "On Critical Hit: 7d6 Slashing damage from weapons with x2 Critical Multiplier, 7d8 Slashing damage from weapons with a x3 Critical Multiplier, and 7d10 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	case "iv":
		nameSuffix = "IV"
		notes = "If using this, update the template with the text"
	case "v":
		nameSuffix = "V"
		notes = "On Critical Hit: 11d6 Slashing damage from weapons with x2 Critical Multiplier, 11d8 Slashing damage from weapons with a x3 Critical Multiplier, and 11d10 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	case "vi":
		nameSuffix = "VI"
		notes = "On Critical Hit: 13d6 Slashing damage from weapons with x2 Critical Multiplier, 13d8 Slashing damage from weapons with a x3 Critical Multiplier, and 13d10 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	case "vii":
		nameSuffix = "VII"
		notes = "On Critical Hit: 15d6 Slashing damage from weapons with x2 Critical Multiplier, 15d8 Slashing damage from weapons with a x3 Critical Multiplier, and 15d10 Slashing damage from weapons with a x4 or greater Critical Multiplier."
	default:
		notes = "Please add which version of bloodletter is being used (I-VII)"
	}

	name := "Bloodletter"
	if nameSuffix != "" {
		name += " " + nameSuffix
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCurseVector parses `{{CurseVector}}`.

func parseTemplateBlindingFlash(raw string) *api.Enchantment {
	const prefix = "{{BlindingFlash"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Blinding Flash"
	notes := "If you roll a 20 when attacking and confirm the critical hit, the target will become blinded by a burst of high-intensity light."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBlindingEmbers parses `{{BlindingEmbers|type}}`.

func parseTemplateBlindingEmbers(raw string) *api.Enchantment {
	const prefix = "{{BlindingEmbers"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	name := "Blinding Embers"
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) >= 1 {
			if strings.EqualFold(strings.TrimSpace(parts[0]), "Legendary") {
				name = "Legendary Blinding Embers"
			}
		}
	}

	notes := "If you roll a 20 when attacking and confirm the critical hit, the target will become blinded by a burst of fiery sparks."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateTheDraggingOfTheDepths parses `{{TheDraggingOfTheDepths|(Enhancement Amount)|(Bonus Type)}}`.

func parseTemplateBrillanceoftheShatteredSun(raw string) *api.Enchantment {
	const prefix = "{{BrillanceoftheShatteredSun"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Brilliance of the Shattered Sun"
	notes := "Light drips from within this small container, sparking before your eyes. With this item equipped, your offensive attacks and spells have a chance of creating a burst of pure light, dealing Light damage and blinding enemies."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFeeding parses `{{Feeding|(Enhancement Amount)}}`.

func parseTemplateBonesplitter(raw string) *api.Enchantment {
	const prefix = "{{Bonesplitter"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Bonesplitter"
	notes := "On an attack roll of 20 which is confirmed as a critical hit, the weapon breaks multiple bones in the target's body, causing significant impairment. Creatures with skeletons take 40d6 damage and will have their movement and attacks slowed by 25% and their attack damage reduced by 25% when their bones are shattered."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBoneshatter parses `{{Boneshatter|(Type)}}`.

func parseTemplateBoneshatter(raw string) *api.Enchantment {
	const prefix = "{{Boneshatter"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	boneType := ""
	if strings.HasPrefix(content, "|") {
		boneType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Boneshatter"
	damageDice := "40d6"

	if strings.EqualFold(boneType, "Lesser") {
		name = "Lesser Boneshatter"
		damageDice = "10d6"
	}

	notes := "This weapon is powerful enough to shatter the bones of those it strikes. On an attack roll of 20 which is confirmed as a critical hit, the weapon breaks multiple bones in the target's body, causing significant impairment. Creatures with skeletons take " + damageDice + " damage and will have their movement and attacks slowed by 25% and their attack damage reduced by 25% when their bones are shattered."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateStonePrison parses `{{StonePrison|(Type)}}`.

func parseTemplateBetterOffhanded(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{BetterOffhanded", "Better Offhanded", "While this item is in your offhand, it gains +2[W].")
}

// parseTemplateSirocco parses `{{Sirocco|(Type)}}`.

func parseTemplateBoneBreaking() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Bone Breaking",
		Notes: new("Critical hits by this weapon deal an extra 1d6 points of Dexterity damage by shattering the bones of its target."),
	}
}

// parseTemplateEarthgrab handles Template:Earthgrab

func parseTemplateBaneOfTheDepths() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Bane of the Depths",
		Notes: new("Your Negative, Cold, and Poison Spells automatically apply the effects of Bane to enemies struck."),
	}
}

// parseTemplatePealsOfThunder handles Template:PealsOfThunder (and PearlsOfThunder typo)

func parseTemplateBlinding() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Blinding",
		Notes: new("This item can generate a flash of light that has a chance to blind opponents."),
	}
}

// parseTemplateBlindingFear handles Template:BlindingFear

func parseTemplateBlindingFear() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Blinding Fear",
		Notes: new("On Hit: Blinds and Shakens foe for 6 seconds, 12 second cool down."),
	}
}

// parseTemplateStonePaws handles Template:StonePaws

func parseTemplateBlockElements(fullTemplate string) *api.Enchantment {
	// Documentation: {{BlockElements|(Type)}}
	// 1. Type (Optional, Default: empty)
	const prefix = "{{BlockElements"
	const suffix = "}}"

	if !strings.HasPrefix(fullTemplate, prefix) || !strings.HasSuffix(fullTemplate, suffix) {
		return nil
	}

	inner := fullTemplate[len(prefix) : len(fullTemplate)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
	}

	blockType := strings.ToLower(strings.TrimSpace(inner))

	if blockType == "snow" {
		return &api.Enchantment{
			Name:  "Shield of Snow",
			Notes: new("This snow provides a powerful defense against physical attacks. While actively blocking, you gain +50 Insight bonus to Magical Resistance Rating."),
		}
	}

	return &api.Enchantment{
		Name:  "Block Elements",
		Notes: new("On Shield Block: Gain 15% damage absorption versus acid, cold, electric, fire, and sonic damage."),
	}
}

// parseTemplateAvalanche handles Template:Avalanche
