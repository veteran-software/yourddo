package parser

import (
	"fmt"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

func parseTemplateCombatMastery(rawCMValue string) []*api.Enchantment {
	const prefix = "{{CombatMastery|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawCMValue, prefix) || !strings.HasSuffix(rawCMValue, suffix) {
		return nil
	}

	paramList := rawCMValue[len(prefix) : len(rawCMValue)-len(suffix)]
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

	// --- CRITICAL: Generate Six Separate Enchantments ---
	for _, maneuver := range combatManeuvers {
		// Name format: "[Maneuver] DC"
		name := fmt.Sprintf("Tactical DC: %s", maneuver)

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}


func parseTemplateClickie(rawClickieValue string) *api.Enchantment {
	const prefix = "{{Clickie|"
	const suffix = "}}"
	const baseName = "Clickie Spell"

	if !strings.HasPrefix(rawClickieValue, prefix) || !strings.HasSuffix(rawClickieValue, suffix) {
		return nil
	}

	paramList := rawClickieValue[len(prefix) : len(rawClickieValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Spell)|(Caster level)|(Charges)|(Recharge Rate)|(Icon)

	// Initialize fields (mandatory first two)
	var spell = ""
	var casterLevel = ""
	var charges = ""
	var rechargeRate = ""

	// 1. Spell (Required, Index 0)
	if len(parts) >= 1 {
		spell = stripBrackets(parts[0])
	}
	if spell == "" {
		return nil
	}

	// 2. Caster level (Required, Index 1)
	if len(parts) >= 2 {
		casterLevel = stripBrackets(parts[1])
	}

	// 3. Charges (Optional, Index 2)
	if len(parts) >= 3 {
		charges = stripBrackets(parts[2])
	}

	// 4. Recharge Rate (Optional, Index 3)
	if len(parts) >= 4 {
		rechargeRate = stripBrackets(parts[3])
	}

	// --- CRITICAL NAME FORMATTING ---

	// Pattern: "Clickie Spell: <spell> [CL: <CL>] (<num charges> [Recharge: <num recharges per day>)"

	// 1. Construct Charge/Recharge segment
	chargeSegment := ""
	if charges != "" {
		chargeSegment = charges
		if rechargeRate != "" {
			chargeSegment = fmt.Sprintf("%s Recharge: %s/Day", chargeSegment, rechargeRate)
		}
	}

	// 2. Construct final Name
	name := fmt.Sprintf(
		"%s: %s [CL:%s])",
		baseName,
		spell,
		casterLevel,
	)

	if chargeSegment != "" {
		name = name + fmt.Sprintf("(%s Recharge: %s/Day)", chargeSegment, rechargeRate)
	}

	return &api.Enchantment{
		Name: name,
	}
}


func parseTemplateConcealment(rawConcValue string) *api.Enchantment {
	const prefix = "{{Concealment|"
	const suffix = "}}"

	if !strings.HasPrefix(rawConcValue, prefix) || !strings.HasSuffix(rawConcValue, suffix) {
		return nil
	}

	paramList := rawConcValue[len(prefix) : len(rawConcValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Enhancement Amount)|(Bonus Type)|(Title)
	if len(parts) < 1 {
		return nil
	}

	concType := strings.ToLower(stripBrackets(parts[0]))
	name := ""
	amount := ""
	bonusType := ""

	switch concType {
	case "blurry":
		name = "Blurry"
		amount = "20%"
	case "dusk":
		name = "Dusk"
		amount = "10%"
	case "lesserdisplacement", "lesser displacement":
		name = "Lesser Displacement"
		amount = "25%"
	case "smokescreen", "smoke screen":
		name = "Smoke Screen"
		amount = "20%"
	case "custom":
		if len(parts) < 2 || stripBrackets(parts[1]) == "" {
			return nil
		}

		name = "Concealment"
		amount = stripBrackets(parts[1]) + "%"
		bonusType = "Enhancement"
		if len(parts) >= 3 && stripBrackets(parts[2]) != "" {
			bonusType = stripBrackets(parts[2])
		}
	default:
		return nil
	}

	if len(parts) >= 4 && stripBrackets(parts[3]) != "" {
		name = stripBrackets(parts[3])
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}


func parseTemplateCrippling(rawCripValue string) *api.Enchantment {
	const prefix = "{{Crippling|"
	const suffix = "}}"
	const baseName = "Crippling"

	// Handle argument-less case, which defaults to the base name (Melee/General)
	if strings.TrimSpace(rawCripValue) == "{{Crippling}}" {
		return &api.Enchantment{Name: baseName}
	}

	if !strings.HasPrefix(rawCripValue, prefix) || !strings.HasSuffix(rawCripValue, suffix) {
		return nil
	}

	paramList := rawCripValue[len(prefix) : len(rawCripValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Attack Style)

	var attackStyle = ""
	var name string

	// 1. Attack Style (Index 0)
	if len(parts) >= 1 {
		attackStyle = stripBrackets(parts[0])
	}

	// --- CRITICAL NAME FORMATTING ---

	normalizedStyle := strings.ToLower(attackStyle)

	if normalizedStyle == "melee" || normalizedStyle == "ranged" {
		name = fmt.Sprintf("Crippling (%s)", cases.Title(language.English).String(strings.ToLower(normalizedStyle)))
	} else {
		name = baseName
	}

	return &api.Enchantment{
		Name: name,
		// All other fields remain empty.
	}
}


func parseTemplateCarryingCapacity(rawCCValue string) *api.Enchantment {
	const prefix = "{{CarryingCapacity|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Carrying Capacity"

	if !strings.HasPrefix(rawCCValue, prefix) || !strings.HasSuffix(rawCCValue, suffix) {
		return nil
	}

	paramList := rawCCValue[len(prefix) : len(rawCCValue)-len(suffix)]
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

	// --- CRITICAL NAME FORMATTING ---

	return &api.Enchantment{
		Name:      baseName,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}


func parseTemplateColorText(raw string) *api.Enchantment {
	// {{ColorText|Color|Text}}
	params := strings.TrimSuffix(strings.TrimPrefix(raw, "{{"), "}}")
	parts := strings.Split(params, "|")
	if len(parts) >= 3 {
		return &api.Enchantment{
			Name: parts[2],
		}
	}
	return nil
}


func parseTemplateCommand(raw string) []*api.Enchantment {
	// {{Command|(Amount)|(Bonus type)}}
	const prefix = "{{Command"
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
	amount := "2"
	if len(parts) >= 1 {
		val := strings.TrimSpace(parts[0])
		if val != "" {
			amount = val
		}
	}

	bonusType := "Competence"
	if len(parts) >= 2 {
		val := strings.TrimSpace(parts[1])
		if val != "" {
			bonusType = val
		}
	}

	skills := []string{
		"Bluff",
		"Diplomacy",
		"Haggle",
		"Intimidate",
		"Perform",
		"Use Magic Device",
	}

	var results []*api.Enchantment
	for _, skill := range skills {
		results = append(results, &api.Enchantment{
			Name:      "Skill: " + skill,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	// Command also imposes a -6 penalty on Hide checks.
	results = append(results, &api.Enchantment{
		Name:      "Skill: Hide",
		Amount:    "-6",
		BonusType: "Penalty",
	})

	return results
}


// Template: CrushingWaveGuard
// Usage: {{CrushingWaveGuard}}
func parseTemplateCrushingWaveGuard(raw string) *api.Enchantment {
	const prefix = "{{CrushingWaveGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Crushing Wave Guard",
		BonusType: "On-being-hit",
		Notes:     new("This item stores the unstoppable force of the ocean's fury deep within. When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, crushing enemies beneath a torrent of frigid water."),
	}
}


// Template: CrystalCoveUpgrade
// Usage: {{CrystalCoveUpgrade|(Tier)}}
func parseTemplateCrystalCoveUpgrade(raw string) *api.Enchantment {
	const prefix = "{{CrystalCoveUpgrade"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	inner = strings.TrimPrefix(inner, "|")
	parts := splitParams(inner)
	tier := "1"
	if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
		tier = strings.TrimSpace(parts[0])
	}

	return &api.Enchantment{
		Name:  fmt.Sprintf("Upgradeable - Tier %s", tier),
		Notes: new(fmt.Sprintf("This is a tier %s upgradeable item.", tier)),
	}
}


// Template: CacophonicGuard
// Usage: {{CacophonicGuard|(Type)}}
func parseTemplateCacophonicGuard(raw string) *api.Enchantment {
	const prefix = "{{CacophonicGuard"
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
	isLegendary := false
	if len(parts) >= 1 && strings.EqualFold(strings.TrimSpace(parts[0]), "Legendary") {
		isLegendary = true
	}

	name := "Cacophonic Guard"
	if isLegendary {
		name = "Legendary Cacophonic Guard"
	}

	notes := "This item stores the resonant power of pur sound within it. When the wearer is successfully attacked in melee, this power occasionally comes to the surface, dealing an overwhelming amount of Sonic damage to the attacker."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateCannithCombatInfusion() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Cannith Combat Infusion",
		Notes: new("For the next ten seconds, this will grant a +4 Alchemical bonus to Strength, Constitution and Dexterity, as well as a 5% Alchemical bonus to your chance to doublestrike and a +2 Alchemical bonus to Armor Class."),
	}
}


func parseTemplateConfoundingEnchantment() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Confounding Enchantment",
		Notes: new("The shifting nature of the magic that enchants this belt makes the effects hard to determine."),
	}
}


func parseTemplateChaoticCurse() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Chaotic Curse",
		Notes: new("The curse on this item is so powerful it can be transferred to any creature that dares touch the wearer. The rents in the fabric of the underlying cloth has made the curse unstable and it can reverse itself. Note especially that while the wearer is partially shielded he is not entirely immune to this effect."),
	}
}


func parseTemplateChaosGuard() []*api.Enchantment {
	return []*api.Enchantment{
		{
			Name:      "Armor Class",
			Amount:    "2",
			BonusType: "Deflection",
			Notes:     new("The bearer of this item gains +2 Deflection bonus to AC from Chaotic enemies."),
		},
		{
			Name:      "Saves vs Chaotic Enemies",
			Amount:    "2",
			BonusType: "Resistance",
			Notes:     new("The bearer of this item gains +2 Resistance bonus to saves from Chaotic enemies."),
		},
	}
}


func parseTemplateCeruleanWave(raw string) *api.Enchantment {
	const template = "CeruleanWave"
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
		version = strings.ToLower(strings.TrimSpace(parts[0]))
	}

	name := "Cerulean Wave"
	var notes string

	switch version {
	case "legendary", "paragon", "ice":
		if version == "legendary" {
			name = "Legendary Cerulean Wave"
		} else if version == "paragon" {
			name = "Paragon Cerulean Wave"
		}
		notes = "This powerful magical implement hums in your hands and resonates with icy magic. Spells you cast have a chance of freezing your targets in a block of solid ice."
	default:
		notes = "When struck in combat, there is a small chance you will be shielded by conjured ice, granting you +15 Temporary Hit Points. These Temporary Hit Points last 1 minute or until depleted."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateCCHatUpgrades(raw string) []*api.Enchantment {
	const template = "CCHatUpgrades"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return []*api.Enchantment{
		{
			Name:  "Enchantable: Crystal Rush",
			Notes: new("This hat can be enchanted to bestow one of various benefits to nearby kobolds in Crystal Cove."),
		},
		{
			Name:  "Enchantable: Adventuring Bonus",
			Notes: new("This hat can be enchanted to bestow one of various benefits useful in general adventuring. Adventuring effects may change the minim level of this item."),
		},
		{
			Name:  "Enchantable: Skilled Seaman",
			Notes: new("This had can be enchanted to grant a bonus to one skill. You can have one skill bonus on a hat at at time, but can replace it with a different choice. Skill effects may change the minimum level of this item."),
		},
	}
}


func parseTemplateCraftableRuneArm(raw string) *api.Enchantment {
	const template = "CraftableRuneArm"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Craftable Rune Arm",
		Notes: new("Craftable Rune Arm: This Rune Arm is craftable and can be customized using recipes at standard crafting devices after disjuncting."),
	}
}


func parseTemplateCurseVector(raw string) *api.Enchantment {
	const prefix = "{{CurseVector"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Curse Vector"
	notes := "This item is a carrier of curses. It can apply them to your foes, but also to you- when you are damaged there is a small chance that you will have a Bestow Curse cast on you."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateCrimsonCovenant(raw string) *api.Enchantment {
	const prefix = "{{CrimsonCovenant"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Crimson Covenant"
	notes := "First Litany of the Crimson Covenant: On Hit: 6d6 Evil damage and 6d8 bleeding damage to those that are vulnerable to it.\n" +
		"* Second Litany of the Crimson Covenant: On Hit: You are healed for 3d2 hit points.\n" +
		"* Third Litany of the Crimson Covenant: On Hit: Strip the vitality from you renemies, dealing 3 Constitution damage and reducing their Physical and Magical Resistance Ratings by 10.\n" +
		"* Final Litany of the Crimson Covenant: On Hit: This dagger has a chance of conjuring the Mark of Death itself, snuffing the life from your foes and slaying them instantly without a save."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateFettersofUnreality parses `{{FettersofUnreality}}`.

func parseTemplateConstrictingNightmare(raw string) *api.Enchantment {
	const prefix = "{{ConstrictingNightmare"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Constricting Nightmare"
	notes := "Enemies struck by this weapon are stricken with a horrible fear of death, reducing their Physical Resistance and Magical Resistance by 10."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateEnfeebling parses `{{Enfeebling}}`.

func parseTemplateCorrosiveSaltGuard(raw string) *api.Enchantment {
	const prefix = "{{CorrosiveSaltGuard"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Corrosive Salt Guard"
	notes := "When the wearer of this item is successfully attacked in melee, this power can come to the surface in the form of a noxious, corrosive salt that dissolves all substances."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateLifeStealing parses `{{LifeStealing}}`.

func parseTemplateCursedMaelstrom(raw string) *api.Enchantment {
	const prefix = "{{CursedMaelstrom"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Cursed Maelstrom"
	notes := "Striking an enemy has a chance to place a random, debilitating, and deadly curse on your foe."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateCompletedWeapon(raw string) *api.Enchantment {
	const prefix = "{{CompletedWeapon"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Completed Weapon"
	notes := "This item is fully completed, and as a result deals an additional .5[W] damage."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateEchoesOfAngdrelve parses `{{EchoesOfAngdrelve|(Enhancement Amount)|(Bonus Type)}}`.

func parseTemplateCrushingWave(raw string) *api.Enchantment {
	const prefix = "{{CrushingWave"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	name := "Crushing Wave"
	if strings.HasPrefix(content, "|") {
		parts := strings.Split(content[1:], "|")
		if len(parts) > 0 {
			switch strings.ToLower(strings.TrimSpace(parts[0])) {
			case "tsunami":
				name = "Crushing Tsunami"
			}
		}
	}

	notes := "This weapon stores the unstoppable force of the oceans fury deep within. When this weapon is used this power occasionally comes to the surface, crushing enemies beneath a torrent of frigid water."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateEntangling parses `{{Entangling|(Type)}}`.

func parseTemplateCloudburst(raw string) *api.Enchantment {
	const prefix = "{{Cloudburst"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Cloudburst"
	notes := "On Vorpal, this weapon triggers a Cloudburst, striking its target with lightning and dealing sonic damage to surrounding enemies through a powerful thunderclap."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCursespewing parses `{{Cursespewing|(Type)}}`.

func parseTemplateCursespewing(raw string) *api.Enchantment {
	const prefix = "{{Cursespewing"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, suffix)

	curseType := ""
	if strings.HasPrefix(content, "|") {
		curseType = strings.TrimSpace(strings.TrimPrefix(content, "|"))
	}

	name := "Cursespewing"
	damageDice := "1d6"

	if strings.EqualFold(curseType, "Improved") {
		name = "Improved Cursespewing"
		damageDice = "2d6"
	} else if strings.EqualFold(curseType, "Legendary") {
		name = "Legendary Cursespewing"
		damageDice = "5d6" // Common scaling for Legendary Cursespewing
	}

	notes := fmt.Sprintf("On a natural 20 attack, this weapon lashes out with a vengeful curse that confers a -4 morale penalty on attack rolls, damage rolls, saving throws, and skill checks. This agonizing curse also causes the victim to take %s damage every two seconds for a duration of twelve seconds. Additional vorpal strikes while this curse is active will extend the duration by another 12 seconds.", damageDice)

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBonesplitter parses `{{Bonesplitter}}`.

func parseTemplateCleverStrike(raw string) *api.Enchantment {
	const prefix = "{{CleverStrike"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Clever Strike"
	notes := "This item changes its enhancement bonus if your Intelligence is high enough. The enhancement bonus will be equal to your Intelligence modifier while the item is equipped (minimum 6, maximum 10)."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateCripplingFlames parses `{{CripplingFlames}}`.

func parseTemplateCripplingFlames(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{CripplingFlames", "Crippling Flames", "Crippling Flames: On Hit: 5% chance to apply 2 Negative Levels. On Crit: 10d20+125 Fire Damage.")
}

// parseTemplateStaticAttraction parses `{{StaticAttraction}}`.

func parseTemplateCoronach() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Coronach",
		Notes: new("While wearing this item, your melee and ranged weapons gain Critical Hit Effect: Critical hit with this weapon will fascinate an undead opponent. (Will DC: 20 negates)"),
	}
}

// parseTemplateDisruptingWeapons handles Template:DisruptingWeapons

func parseTemplateCasterLevel(fullTemplate string) []*api.Enchantment {
	// Documentation: {{CasterLevel|(Spell Types)|(Amount)|(Title)}}
	// 1. Spell Types (Required, Index 0)
	// 2. Amount (Required, Index 1)
	// 3. Title (Optional, Index 2)
	const prefix = "{{CasterLevel|"
	const suffix = "}}"

	if !strings.HasPrefix(fullTemplate, prefix) || !strings.HasSuffix(fullTemplate, suffix) {
		return nil
	}

	paramList := fullTemplate[len(prefix) : len(fullTemplate)-len(suffix)]
	parts := strings.Split(paramList, "|")
	if len(parts) < 2 {
		return nil
	}

	spellTypesRaw := stripBrackets(parts[0])
	amount := strings.TrimSpace(parts[1])
	if !strings.HasPrefix(amount, "+") && amount != "" {
		amount = "+" + amount
	}

	title := ""
	if len(parts) > 2 {
		title = strings.TrimSpace(parts[2])
	}

	// Split spell types by "and", ",", or "/"
	var rawTypes []string
	if strings.Contains(spellTypesRaw, " and ") {
		rawTypes = strings.Split(spellTypesRaw, " and ")
	} else if strings.Contains(spellTypesRaw, ",") {
		rawTypes = strings.Split(spellTypesRaw, ",")
	} else if strings.Contains(spellTypesRaw, "/") {
		rawTypes = strings.Split(spellTypesRaw, "/")
	} else {
		rawTypes = []string{spellTypesRaw}
	}

	var finalTypes []string
	for _, t := range rawTypes {
		t = strings.TrimSpace(t)
		if t == "" {
			continue
		}

		// Expand based on existing maps if possible
		// We'll check for schools first
		found := false
		for _, school := range spellSchools {
			if strings.EqualFold(t, school) {
				finalTypes = append(finalTypes, school)
				found = true
				break
			}
		}
		if found {
			continue
		}

		// Check for subtypes/elements
		if elements, ok := elementsMap[t]; ok && len(elements) > 0 {
			finalTypes = append(finalTypes, elements...)
		} else {
			finalTypes = append(finalTypes, t)
		}
	}

	var enchantments []*api.Enchantment
	for _, t := range finalTypes {
		name := fmt.Sprintf("Caster Level (%s): %s", t, amount)
		if title != "" {
			name = title
		}

		notes := fmt.Sprintf("Increases your caster level when casting %s spells by %s.", spellTypesRaw, strings.TrimPrefix(amount, "+"))

		enchantments = append(enchantments, &api.Enchantment{
			Name:  name,
			Notes: new(notes),
		})
	}

	return enchantments
}

// parseTemplateBlockElements handles Template:BlockElements
