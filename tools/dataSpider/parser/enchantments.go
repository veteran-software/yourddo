package parser

import (
	"fmt"
	"strings"

	"github.com/sirupsen/logrus"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	"compendium-crawler-go/api"
)

const (
	legendaryPrefix    = "Legendary "
	maximumSpellPoints = "Maximum Spell Points"
)

var spellSchools = []string{
	"Abjuration", "Breath Weapon", "Conjuration", "Divination", "Enchantment",
	"Evocation", "Illusion", "Necromancy", "Transmutation",
}

var skills = []string{
	"Balance", "Bluff", "Concentration", "Diplomacy", "Disable Device", "Haggle", "Heal", "Hide", "Intimidate", "Jump",
	"Listen", "Move Silently", "Open Lock", "Perform", "Repair", "Search", "Spellcraft", "Spot", "Swim", "Tumble",
	"Use Magic Device",
}

var saves = []string{
	"Fortitude",
	"Reflex",
	"Will",
}

var elements = []string{
	"Acid",
	"Cold",
	"Electric",
	"Fire",
	"Sonic",
}

var elementsMap = map[string][]string{
	"Combustion":            {"Fire"},
	"Corrosion":             {"Acid"},
	"Devotion":              {"Positive Energy"},
	"Glaciation":            {"Cold"},
	"Impulse":               {"Force", "Piercing", "Slashing", "Bludgeoning"},
	"Magnetism":             {"Electric"},
	"Nullification":         {"Negative Energy", "Poison"},
	"Radiance":              {"Light", "Chaos", "Evil", "Good", "Lawful"},
	"Reconstruction":        {"Repair", "Rust"},
	"Resonance":             {"Sonic"},
	"Kinetic":               {"Force", "Piercing", "Slashing", "Bludgeoning"},
	"Ice":                   {"Cold"},
	"Void":                  {"Negative Energy", "Poison"},
	"Repair":                {"Repair", "Rust"},
	"Lightning":             {"Electric"},
	"Healing":               {"Positive Energy"},
	"Fire":                  {"Fire"},
	"Acid":                  {"Acid"},
	"Cold":                  {"Cold"},
	"Electric":              {"Electric"},
	"Force":                 {"Force", "Piercing", "Slashing", "Bludgeoning"},
	"Light":                 {"Light", "Chaos", "Evil", "Good", "Lawful"},
	"Negative":              {"Negative Energy"},
	"Poison":                {"Poison"},
	"Positive":              {"Positive Energy"},
	"Blighted":              {"Acid", "Negative Energy", "Poison", "Evil"},
	"Creeping Dust":         {"Cold", "Acid"},
	"Dark Restoration":      {"Negative Energy", "Poison", "Positive Energy"},
	"Firestorm":             {"Fire", "Electric"},
	"Flames of Darkness":    {"Fire", "Negative Energy", "Poison"},
	"Frozen Depths":         {"Negative", "Cold", "Poison"},
	"Frozen Storm":          {"Cold", "Electric"},
	"Moonlit Haunt":         {"Negative Energy", "Force", "Poison"},
	"Purifying Flame":       {"Fire", "Light"},
	"Sacred Ground":         {"Acid", "Light", "Chaos", "Evil", "Good", "Lawful"},
	"Silver Flame":          {"Positive Energy", "Light", "Chaos", "Evil", "Good", "Lawful"},
	"Summer's Impertenence": {},
	"Thunderstorm":          {"Sonic", "Electric"},
	"Winter's Impertenence": {},
	"Universal":             {""},
	"Potency":               {"Acid", "Cold", "Electric", "Fire", "Force", "Piercing", "Slashing", "Bludgeoning", "Light", "Chaos", "Evil", "Good", "Lawful", "Negative Energy", "Poison", "Positive Energy", "Sonic", "Repair", "Rust"},
}

var abilityToSkillsMap = map[string][]string{
	"Strength":     {"Jump", "Swim"},
	"Dexterity":    {"Balance", "Hide", "Move Silently", "Open Lock", "Tumble"},
	"Constitution": {"Concentration"},
	"Intelligence": {"Disable Device", "Repair", "Search", "Spellcraft"},
	"Wisdom":       {"Heal", "Listen", "Spot"},
	"Charisma":     {"Bluff", "Diplomacy", "Haggle", "Intimidate", "Perform", "Use Magic Device"},
}

var skillGroupsMap = map[string][]string{
	"Nimble":     {"Balance", "Hide", "Move Silently", "Open Lock", "Tumble"},
	"Alluring":   {"Bluff", "Diplomacy", "Haggle", "Intimidate", "Perform"},
	"Aluring":    {"Bluff", "Diplomacy", "Haggle", "Intimidate", "Perform"},
	"Persuasion": {"Bluff", "Diplomacy", "Haggle", "Intimidate", "Perform"},
	"Prudent":    {"Heal", "Listen", "Spot"},
	"Astute":     {"Disable Device", "Repair", "Search"},
	"Mighty":     {"Jump", "Swim"},
}

var combatManeuvers = []string{
	"Trip",
	"Improved Trip",
	"Sunder",
	"Improved Sunder",
	"Stunning",
}

var ghostlySkills = []string{
	"Hide",
	"Move Silently",
}

var murderousTypeToDamage = map[string]string{
	"Point": "Piercing",
	"Edge":  "Slashing",
	"Swing": "Bludgeoning",
	"Spike": "Piercing", // Assuming Spike is Piercing damage
}

var diversionStyles = map[string]struct {
	Melee  bool
	Ranged bool
	Spell  bool
}{
	"Melee":      {Melee: true},
	"Ranged":     {Ranged: true},
	"Spell":      {Spell: true},
	"MeleeRange": {Melee: true, Ranged: true},
	"MeleeSpell": {Melee: true, Spell: true},
	"RangeSpell": {Ranged: true, Spell: true},
	"All":        {Melee: true, Ranged: true, Spell: true},
}

var marksmanshipLookup = map[string]struct {
	NamePrefix   string
	AttackAmount string
	DamageAmount string
	BonusType    string
}{
	// Default (Blank) Example: +2 Attack, +1 Damage, (Implied Enhancement Bonus)
	"Default": {"", "2", "1", "Enhancement"},

	// Greater Example: +3 Competence Attack, +2 Competence Damage
	"Greater": {"Greater", "3", "2", "Competence"},

	// New Normal: Assuming it follows the Greater pattern but with standard +2/+1 amounts (or identical to Default, needs confirmation).
	// Based on DDO norms, we'll assume it's like Default, but perhaps without the Roman numeral style.
	"New Normal": {"New Normal", "2", "1", "Enhancement"},
}

var shockwaveTypeMap = map[string]struct {
	NamePrefix    string
	DamageElement string
}{
	"basic":              {"", "Bludgeoning"},                           // Default/Blank: Bludgeoning damage
	"whelmling":          {"Whelming", "Bludgeoning"},                   // Whelming: Bludgeoning damage
	"legendary whelming": {legendaryPrefix + "Whelming", "Bludgeoning"}, // Legendary Whelming: Bludgeoning damage
	"overwhelming":       {"Overwhelming", "Sonic"},                     // Overwhelming: Sonic damage
}

var damageEffectToElementMap = map[string]string{
	"Force":       "Force",
	"Sonic":       "Sonic",
	"Bludgeon":    "Bludgeoning",
	"Slashing":    "Slashing",
	"Piercing":    "Piercing",
	"Acid":        "Acid",
	"Cold":        "Cold",
	"Electricity": "Electric",
	"Fire":        "Fire",
	"Light":       "Light",
	"Negative":    "Negative",
	"Poison":      "Poison",
	"Holy":        "Positive",
	"Unholy":      "Negative",
	"Anarchic":    "Chaos",
	"Axomatic":    "Lawful",
	"Entropic":    "Untyped",
}

var revelInBloodTypeToDamage = map[string]string{
	"Slashing":    "Slashing",
	"Piercing":    "Piercing",
	"Bludgeoning": "Bludgeoning",
	"Magic":       "Force",       // Magic usually corresponds to Force damage in this context
	"Shield":      "Bludgeoning", // Assuming Shield bash damage is Bludgeoning
}

var elementalAoeNames = map[string]string{
	"Acid":        "Acid Torrent",
	"Cold":        "Freezing Gale",
	"Electricity": "Electric Storm",
	"Fire":        "Fiery Detonation",
}

var elementalDefaultDice = map[string]string{
	"Fire": "1d6", // Default fire damage dice from standard enchants
	// Other elements may follow a pattern, but we use the general default 1d6 for simplicity if not specified.
}

var allSpellCritDamageGroups = []string{
	// Base groups that may appear as the first parameter for {{SpellCritDamage|...}}
	// This list is used when the group is "Universal" to expand into all supported groups.
	"Combustion", "Fire", "Corrosion", "Acid", "Devotion", "Glaciation", "Ice",
	"Impulse", "Force", "Magnetism", "Lightning", "Nullification", "Negative",
	"Radiance", "Light", "Reconstruction", "Repair", "Kinetic", "Resonance",
	"Sonic", "Healing", "Void",
}

var abilityNameMap = map[string]string{
	"STR": "Strength",
	"DEX": "Dexterity",
	"CON": "Constitution",
	"INT": "Intelligence",
	"WIS": "Wisdom",
	"CHA": "Charisma",
}

var weaponTypes = map[string]bool{
	"club":                     true,
	"greatclub":                true,
	"handwraps":                true,
	"heavy mace":               true,
	"light hammer":             true,
	"light mace":               true,
	"maul":                     true,
	"morningstar":              true,
	"quarterstaff":             true,
	"unarmed":                  true,
	"warhammer":                true,
	"dagger":                   true,
	"heavy pick":               true,
	"light pick":               true,
	"rapier":                   true,
	"shortsword":               true,
	"bastard sword":            true,
	"battleaxe":                true,
	"dwarven axe":              true,
	"falchion":                 true,
	"greataxe":                 true,
	"greatsword":               true,
	"handaxe":                  true,
	"kama":                     true,
	"khopesh":                  true,
	"kukri":                    true,
	"longsword":                true,
	"scimitar":                 true,
	"sickle":                   true,
	"great crossbow":           true,
	"heavy crossbow":           true,
	"light crossbow":           true,
	"longbow":                  true,
	"repeating heavy crossbow": true,
	"repeating light crossbow": true,
	"shortbow":                 true,
	"dart":                     true,
	"shuriken":                 true,
	"throwing axe":             true,
	"throwing dagger":          true,
	"throwing hammer":          true,
}

var armorTypes = map[string]bool{
	"docent":       true,
	"heavy armor":  true,
	"light armor":  true,
	"medium armor": true,
	"outfit":       true,
	"robe":         true,
}

var shieldTypes = map[string]bool{
	"buckler":      true,
	"large shield": true,
	"orb":          true,
	"small shield": true,
	"tower shield": true,
}

var compoundSpellPowers = map[string][]string{
	"Frozen Storm":        {"Cold", "Lightning"},
	"Creeping Dust":       {"Cold", "Acid"},
	"Firestorm":           {"Fire", "Lightning"},
	"Elemental Resonance": {"Acid", "Fire", "Electric", "Cold"},
	"Thunderstorm":        {"Sonic", "Electric"},
	"Force":               {"Force", "Untyped", "Bludgeoning", "Slashing", "Piercing"},
	"Negative":            {"Negative Energy", "Poison"},
	// Including other common compound names for comprehensive splitting (even if they don't map to elements easily)
	"Universal": {"Combustion", "Corrosion", "Devotion", "Glaciation", "Impulse", "Magnetism", "Nullification", "Radiance", "Reconstruction", "Resonance"},
}

// expandSpellCritGroup takes a high-level group/type name and expands it into one or more
// concrete categories for Spell Critical Damage naming, per requirements.
// Returned strings are already in their final display form (e.g., "Negative Energy",
// "Alignment (Chaotic)", "Physical (Bludgeoning)").
func expandSpellCritGroup(group string) []string {
	g := strings.TrimSpace(group)
	if g == "" {
		return nil
	}
	// Normalize common variants/aliases
	c := cases.Title(language.English)
	g = c.String(strings.ToLower(g))

	switch g {
	// Direct elements/types
	case "Fire":
		return []string{"Fire"}
	case "Acid":
		return []string{"Acid"}
	case "Cold":
		return []string{"Cold"}
	case "Force":
		return []string{"Force"}
	case "Electric", "Electricity", "Lightning", "Lighting", "Magnetism":
		return []string{"Electric"}
	case "Sonic", "Resonance":
		return []string{"Sonic"}
	case "Light", "Radiance":
		return []string{"Light", "Chaos", "Lawful", "Good", "Evil"}
	case "Positive", "Positive Energy", "Devotion":
		return []string{"Positive Energy"}
	case "Negative", "Negative Energy", "Void":
		return []string{"Negative Energy"}
	case "Nullification":
		return []string{"Negative Energy", "Poison"}
	case "Reconstruction":
		return []string{"Repair"}
	case "Repair":
		return []string{"Repair", "Rust"}
	case "Impulse":
		return []string{"Force", "Untyped", "Bludgeoning", "Slashing", "Piercing"}
	case "Kinetic":
		return []string{"Force"}
	case "Healing":
		return []string{"Healing"}
	case "Ice", "Glaciation":
		return []string{"Cold"}
	case "Combustion":
		return []string{"Fire"}
	case "Corrosion":
		return []string{"Acid"}
	default:
		// If it's already in a displayable form or an element we don't map specially, pass through.
		return []string{g}
	}
}

var stunningManeuvers = []string{
	"Stunning Blow",
	"Stunning Fist",
}

var vertigoManeuvers = []string{
	"Trip",
	"Improved Trip",
}

var weaponPowerTypes = []string{
	"Melee",
	"Ranged",
}

// Map of Spell School Save types to their display name for the parenthesis.
// This is easily extensible by adding new key/value pairs here.
var saveSchoolMap = map[string]string{
	"Spell":         "Magic", // Custom mapping for general "Spell" save
	"Abjuration":    "Abjuration",
	"Conjuration":   "Conjuration",
	"Divination":    "Divination",
	"Enchantment":   "Enchantment",
	"Evocation":     "Evocation",
	"Illusion":      "Illusion",
	"Necromancy":    "Necromancy",
	"Transmutation": "Transmutation",
}

// Helper function to strip brackets (copied from converter)
func stripBrackets(s string) string {
	s = strings.ReplaceAll(s, "[", "")
	s = strings.ReplaceAll(s, "]", "")
	return strings.TrimSpace(s)
}

// --- Specific Template Parsers that map to the standard format ---

// mapSaveTypeToName standardizes the save type name (e.g., "Reflex" -> "Reflex Save").
func mapSaveTypeToName(saveType string) string {
	// This is where you would implement your custom formatting/switch statement later.
	// For now, we'll keep it simple.
	switch strings.ToLower(saveType) {
	case "reflex", "will", "fortitude":
		return saveType + " Saving Throws"
	default:
		return saveType
	}
}

// parseTemplateSave extracts values for {{Save|...}} and maps them to api.Enchantment.
func parseSimpleTemplate(raw, prefix, name, notes string) *api.Enchantment {
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, "}}") {
		return nil
	}

	res := &api.Enchantment{
		Name: name,
	}
	if notes != "" {
		res.Notes = new(notes)
	}
	return res
}

func parseVariantTemplate(raw, prefix, name, notes, variant, variantName, variantNotes string) *api.Enchantment {
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, "}}") {
		return nil
	}

	content := strings.TrimPrefix(s, prefix)
	content = strings.TrimSuffix(content, "}}")

	resName := name
	resNotes := notes

	if strings.HasPrefix(content, "|") {
		v := strings.TrimSpace(strings.TrimPrefix(content, "|"))
		if strings.EqualFold(v, variant) {
			resName = variantName
			resNotes = variantNotes
		}
	}

	res := &api.Enchantment{
		Name: resName,
	}
	if resNotes != "" {
		res.Notes = new(resNotes)
	}
	return res
}

func ExtractSetBonus(in []api.Enchantment) (rest []api.Enchantment, sets []api.SetBonusOut) {
	if len(in) == 0 {
		return nil, nil
	}
	rest = make([]api.Enchantment, 0, len(in))
	for _, e := range in {
		setName := e.SetBonusName
		if setName == "" {
			// Fallback for older callers: detect by name prefix
			if strings.HasPrefix(e.Name, "Item Set: ") {
				setName = strings.TrimSpace(strings.TrimPrefix(e.Name, "Item Set: "))
			}
		}
		if setName != "" {
			// Normalize into SetBonusOut; leave enhancements/numPieces empty for now
			sets = append(sets, api.SetBonusOut{Name: setName})
			continue
		}
		rest = append(rest, e)
	}
	return rest, sets
}

var enchSingleHandlers = map[string]func(string) *api.Enchantment{
	"Ammunition":                    func(t string) *api.Enchantment { return parseTemplateAmmunition(t) },
	"ArrowSpitting":                 func(_ string) *api.Enchantment { return parseTemplateArrowSpitting() },
	"MemoryofChainsBroken":          func(_ string) *api.Enchantment { return parseTemplateMemoryofChainsBroken() },
	"SingleMindedness":              func(_ string) *api.Enchantment { return parseTemplateSingleMindedness() },
	"DragonsEdge":                   func(t string) *api.Enchantment { return parseTemplateDragonsEdge(t) },
	"DisruptingWeapons":             func(_ string) *api.Enchantment { return parseTemplateDisruptingWeapons() },
	"Coronach":                      func(_ string) *api.Enchantment { return parseTemplateCoronach() },
	"MissingParts":                  func(_ string) *api.Enchantment { return parseTemplateMissingParts() },
	"OccasionalOvercooling":         func(_ string) *api.Enchantment { return parseTemplateOccasionalOvercooling() },
	"Avalanche":                     func(t string) *api.Enchantment { return parseTemplateAvalanche(t) },
	"BlockElements":                 func(t string) *api.Enchantment { return parseTemplateBlockElements(t) },
	"InspirationoftheInferno":       func(_ string) *api.Enchantment { return parseTemplateInspirationoftheInferno() },
	"StonePaws":                     func(_ string) *api.Enchantment { return parseTemplateStonePaws() },
	"LegendaryGreenSteel":           func(_ string) *api.Enchantment { return parseTemplateLegendaryGreenSteel() },
	"VulnerabilityGuard":            func(_ string) *api.Enchantment { return parseTemplateVulnerabilityGuard() },
	"SetItemEnchantment":            func(t string) *api.Enchantment { return parseTemplateSetItemEnchantment(t) },
	"FiligreeItemEnchantment":       func(t string) *api.Enchantment { return parseTemplateFiligreeItemEnchantment(t) },
	"ColorText":                     func(t string) *api.Enchantment { return parseTemplateColorText(t) },
	"RockShattering":                func(_ string) *api.Enchantment { return parseTemplateRockShattering() },
	"ShieldBash":                    func(t string) *api.Enchantment { return parseTemplateShieldBash(t) },
	"Thunderbane":                   func(_ string) *api.Enchantment { return parseTemplateThunderbane() },
	"KneeCracker":                   func(_ string) *api.Enchantment { return parseTemplateKneeCracker() },
	"DeadlySpiderVenom":             func(_ string) *api.Enchantment { return parseTemplateDeadlySpiderVenom() },
	"ParagonWeapon":                 func(_ string) *api.Enchantment { return parseTemplateParagonWeapon() },
	"PickaCard":                     func(_ string) *api.Enchantment { return parseTemplatePickaCard() },
	"TouchedbyWildMagic":            func(t string) *api.Enchantment { return parseTemplateTouchedbyWildMagic(t) },
	"ThaarakCorrosion":              func(t string) *api.Enchantment { return parseTemplateThaarakCorrosion(t) },
	"SunBurst":                      func(t string) *api.Enchantment { return parseTemplateSunBurst(t) },
	"OrlassksPrison":                func(_ string) *api.Enchantment { return parseTemplateOrlassksPrison() },
	"SoulEating":                    func(t string) *api.Enchantment { return parseTemplateSoulEating(t) },
	"MonkPath":                      func(t string) *api.Enchantment { return parseTemplateMonkPath(t) },
	"PathoftheGuardingStone":        func(t string) *api.Enchantment { return parseTemplatePathoftheGuardingStone(t) },
	"Sirocco":                       func(t string) *api.Enchantment { return parseTemplateSirocco(t) },
	"BetterOffhanded":               func(t string) *api.Enchantment { return parseTemplateBetterOffhanded(t) },
	"Unbalancing":                   func(t string) *api.Enchantment { return parseTemplateUnbalancing(t) },
	"Unwieldy":                      func(t string) *api.Enchantment { return parseTemplateUnwieldy(t) },
	"WildFrenzy":                    func(t string) *api.Enchantment { return parseTemplateWildFrenzy(t) },
	"MedusaFury":                    func(t string) *api.Enchantment { return parseTemplateMedusaFury(t) },
	"StealerOfSouls":                func(t string) *api.Enchantment { return parseTemplateStealerOfSouls(t) },
	"TheMoralCompass":               func(t string) *api.Enchantment { return parseTemplateTheMoralCompass(t) },
	"MindTear":                      func(t string) *api.Enchantment { return parseTemplateMindTear(t) },
	"Mindcleaver":                   func(t string) *api.Enchantment { return parseTemplateMindcleaver(t) },
	"PlantSlaying":                  func(t string) *api.Enchantment { return parseTemplatePlantSlaying(t) },
	"StaticAttraction":              func(t string) *api.Enchantment { return parseTemplateStaticAttraction(t) },
	"SoulTear":                      func(t string) *api.Enchantment { return parseTemplateSoulTear(t) },
	"CleverStrike":                  func(t string) *api.Enchantment { return parseTemplateCleverStrike(t) },
	"CripplingFlames":               func(t string) *api.Enchantment { return parseTemplateCripplingFlames(t) },
	"Cloudburst":                    func(t string) *api.Enchantment { return parseTemplateCloudburst(t) },
	"Boneshatter":                   func(t string) *api.Enchantment { return parseTemplateBoneshatter(t) },
	"Bonesplitter":                  func(t string) *api.Enchantment { return parseTemplateBonesplitter(t) },
	"StonePrison":                   func(t string) *api.Enchantment { return parseTemplateStonePrison(t) },
	"BlindingFlash":                 func(t string) *api.Enchantment { return parseTemplateBlindingFlash(t) },
	"BlindingFear":                  func(_ string) *api.Enchantment { return parseTemplateBlindingFear() },
	"Blinding":                      func(_ string) *api.Enchantment { return parseTemplateBlinding() },
	"RadiantBlast":                  func(t string) *api.Enchantment { return parseTemplateRadiantBlast(t) },
	"DemonFever":                    func(t string) *api.Enchantment { return parseTemplateDemonFever(t) },
	"BlindingEmbers":                func(t string) *api.Enchantment { return parseTemplateBlindingEmbers(t) },
	"Lifedrinker":                   func(t string) *api.Enchantment { return parseTemplateLifedrinker(t) },
	"MagmaSurge":                    func(t string) *api.Enchantment { return parseTemplateMagmaSurge(t) },
	"WrathOfTheZealot":              func(t string) *api.Enchantment { return parseTemplateWrathOfTheZealot(t) },
	"Feeding":                       func(t string) *api.Enchantment { return parseTemplateFeeding(t) },
	"Flamebitten":                   func(t string) *api.Enchantment { return parseTemplateFlamebitten(t) },
	"Skybreaker":                    func(t string) *api.Enchantment { return parseTemplateSkybreaker(t) },
	"BrillanceoftheShatteredSun":    func(t string) *api.Enchantment { return parseTemplateBrillanceoftheShatteredSun(t) },
	"Entangling":                    func(t string) *api.Enchantment { return parseTemplateEntangling(t) },
	"Slowburst":                     func(t string) *api.Enchantment { return parseTemplateSlowburst(t) },
	"MindTurbulence":                func(t string) *api.Enchantment { return parseTemplateMindTurbulence(t) },
	"CrushingWave":                  func(t string) *api.Enchantment { return parseTemplateCrushingWave(t) },
	"AntiMagicRunes":                func(t string) *api.Enchantment { return parseTemplateAntiMagicRunes(t) },
	"ElementalSpiral":               func(t string) *api.Enchantment { return parseTemplateElementalSpiral(t) },
	"Fusible":                       func(t string) *api.Enchantment { return parseTemplateFusible(t) },
	"Malleable":                     func(t string) *api.Enchantment { return parseTemplateMalleable(t) },
	"Fragmented":                    func(t string) *api.Enchantment { return parseTemplateFragmented(t) },
	"Impact":                        func(t string) *api.Enchantment { return parseTemplateImpact(t) },
	"TheDraggingOfTheDepths":        func(t string) *api.Enchantment { return parseTemplateTheDraggingOfTheDepths(t) },
	"Fracturing":                    func(t string) *api.Enchantment { return parseTemplateFracturing(t) },
	"PlanarSearing":                 func(t string) *api.Enchantment { return parseTemplatePlanarSearing(t) },
	"IdentityCrisis":                func(t string) *api.Enchantment { return parseTemplateIdentityCrisis(t) },
	"Masterwork":                    func(t string) *api.Enchantment { return parseTemplateMasterwork(t) },
	"AccursedFlame":                 func(t string) *api.Enchantment { return parseTemplateAccursedFlame(t) },
	"FascinationGuard":              func(t string) *api.Enchantment { return parseTemplateFascinationGuard(t) },
	"SecretDoorDetection":           func(_ string) *api.Enchantment { return parseTemplateSecretDoorDetection() },
	"Echoesof2006":                  func(_ string) *api.Enchantment { return parseTemplateEchoesof2006() },
	"Undersun":                      func(_ string) *api.Enchantment { return parseTemplateUndersun() },
	"BattleScarred":                 func(_ string) *api.Enchantment { return parseTemplateBattleScarred() },
	"AlmostThere":                   func(_ string) *api.Enchantment { return parseTemplateAlmostThere() },
	"HiddenHandSecretVisibility":    func(t string) *api.Enchantment { return parseTemplateHiddenHandSecretVisibility(t) },
	"Vulnerability":                 func(t string) *api.Enchantment { return parseTemplateVulnerability(t) },
	"Vicious":                       func(t string) *api.Enchantment { return parseTemplateVicious(t) },
	"Polycurse":                     func(t string) *api.Enchantment { return parseTemplatePolycurse(t) },
	"CrimsonCovenant":               func(t string) *api.Enchantment { return parseTemplateCrimsonCovenant(t) },
	"CurseVector":                   func(t string) *api.Enchantment { return parseTemplateCurseVector(t) },
	"Bloodletter":                   func(t string) *api.Enchantment { return parseTemplateBloodletter(t) },
	"FettersofUnreality":            func(t string) *api.Enchantment { return parseTemplateFettersofUnreality(t) },
	"Finesse":                       func(t string) *api.Enchantment { return parseTemplateFinesse(t) },
	"GiantSlayer":                   func(t string) *api.Enchantment { return parseTemplateGiantSlayer(t) },
	"GodlyWrath":                    func(t string) *api.Enchantment { return parseTemplateGodlyWrath(t) },
	"GreaterDispelling":             func(t string) *api.Enchantment { return parseTemplateGreaterDispelling(t) },
	"MotherNightsEmbrace":           func(t string) *api.Enchantment { return parseTemplateMotherNightsEmbrace(t) },
	"EchoesOfAngdrelve":             func(t string) *api.Enchantment { return parseTemplateEchoesOfAngdrelve(t) },
	"Righteous":                     func(t string) *api.Enchantment { return parseTemplateRighteous(t) },
	"Smiting":                       func(t string) *api.Enchantment { return parseTemplateSmiting(t) },
	"Alchemical":                    func(t string) *api.Enchantment { return parseTemplateAlchemical(t) },
	"Thunderforged":                 func(t string) *api.Enchantment { return parseTemplateThunderforged(t) },
	"Ribcracker":                    func(t string) *api.Enchantment { return parseTemplateRibcracker(t) },
	"ConstrictingNightmare":         func(t string) *api.Enchantment { return parseTemplateConstrictingNightmare(t) },
	"Enfeebling":                    func(t string) *api.Enchantment { return parseTemplateEnfeebling(t) },
	"CorrosiveSaltGuard":            func(t string) *api.Enchantment { return parseTemplateCorrosiveSaltGuard(t) },
	"LifeStealing":                  func(t string) *api.Enchantment { return parseTemplateLifeStealing(t) },
	"CursedMaelstrom":               func(t string) *api.Enchantment { return parseTemplateCursedMaelstrom(t) },
	"Incineration":                  func(t string) *api.Enchantment { return parseTemplateIncineration(t) },
	"Stumbling":                     func(t string) *api.Enchantment { return parseTemplateStumbling(t) },
	"Sundering":                     func(t string) *api.Enchantment { return parseTemplateSundering(t) },
	"Frostbite":                     func(_ string) *api.Enchantment { return parseTemplateFrostbite() },
	"Thunderstruck":                 func(t string) *api.Enchantment { return parseTemplateThunderstruck(t) },
	"Ghostbane":                     func(t string) *api.Enchantment { return parseTemplateGhostbane(t) },
	"Puncturing":                    func(t string) *api.Enchantment { return parseTemplatePuncturing(t) },
	"Goldcurse":                     func(t string) *api.Enchantment { return parseTemplateGoldcurse(t) },
	"VileGrip":                      func(t string) *api.Enchantment { return parseTemplateVileGrip(t) },
	"Bleed":                         func(t string) *api.Enchantment { return parseTemplateBleed(t) },
	"Heartseeker":                   func(t string) *api.Enchantment { return parseTemplateHeartseeker(t) },
	"Disruption":                    func(t string) *api.Enchantment { return parseTemplateDisruption(t) },
	"Wounding":                      func(t string) *api.Enchantment { return parseTemplateWounding(t) },
	"MortalStrike":                  func(t string) *api.Enchantment { return parseTemplateMortalStrike(t) },
	"AbilityDamage":                 func(t string) *api.Enchantment { return parseTemplateAbilityDamage(t) },
	"PlanarConflux":                 func(t string) *api.Enchantment { return parseTemplatePlanarConflux(t) },
	"IncrediblePotential":           func(t string) *api.Enchantment { return parseTemplateIncrediblePotential(t) },
	"OverwhelmingDespair":           func(t string) *api.Enchantment { return parseTemplateOverwhelmingDespair(t) },
	"SolarGuard":                    func(t string) *api.Enchantment { return parseTemplateSolarGuard(t) },
	"SoulOfElements":                func(t string) *api.Enchantment { return parseTemplateSoulOfElements(t) },
	"CreatedViaCrafting":            func(_ string) *api.Enchantment { return nil },
	"SubtleTarget":                  func(_ string) *api.Enchantment { return parseTemplateSubtleTarget() },
	"MelodicGuard":                  func(t string) *api.Enchantment { return parseTemplateMelodicGuard(t) },
	"IceBarrier":                    func(t string) *api.Enchantment { return parseTemplateIceBarrier(t) },
	"TransmutedPlatinum":            func(t string) *api.Enchantment { return parseTemplateTransmutedPlatinum(t) },
	"Nightsinger":                   func(_ string) *api.Enchantment { return parseTemplateNightsinger() },
	"CeruleanWave":                  func(t string) *api.Enchantment { return parseTemplateCeruleanWave(t) },
	"TransformKineticEnergy":        func(t string) *api.Enchantment { return parseTemplateTransformKineticEnergy(t) },
	"EidolonSummons":                func(t string) *api.Enchantment { return parseTemplateEidolonSummons(t) },
	"RagingResilience":              func(_ string) *api.Enchantment { return parseTemplateRagingResilience() },
	"ChaoticCurse":                  func(_ string) *api.Enchantment { return parseTemplateChaoticCurse() },
	"StickyGooGuard":                func(_ string) *api.Enchantment { return parseTemplateStickyGooGuard() },
	"PoisonGuard":                   func(t string) *api.Enchantment { return parseTemplatePoisonGuard(t) },
	"Hallowed":                      func(t string) *api.Enchantment { return parseTemplateHallowed(t) },
	"MakersTouch":                   func(_ string) *api.Enchantment { return parseTemplateMakersTouch() },
	"AutoRepair":                    func(t string) *api.Enchantment { return parseTemplateAutoRepair(t) },
	"FeedsOffMadness":               func(_ string) *api.Enchantment { return parseTemplateFeedsOffMadness() },
	"SunAndStars":                   func(_ string) *api.Enchantment { return parseTemplateSunAndStars() },
	"LightningStormGuard":           func(t string) *api.Enchantment { return parseTemplateLightningStormGuard(t) },
	"DemonicCurse":                  func(t string) *api.Enchantment { return parseTemplateDemonicCurse(t) },
	"DemonicRetribution":            func(t string) *api.Enchantment { return parseTemplateDemonicRetribution(t) },
	"Tet-zik":                       func(t string) *api.Enchantment { return parseTemplateTetZik(t) },
	"TemporarySpellPoints":          func(t string) *api.Enchantment { return parseTemplateTemporarySpellPoints(t) },
	"DruidicSurvivalMastery":        func(t string) *api.Enchantment { return parseTemplateDruidicSurvivalMastery(t) },
	"PowerStore":                    func(t string) *api.Enchantment { return parseTemplatePowerStore(t) },
	"ScallawagLuck":                 func(t string) *api.Enchantment { return parseTemplateScallawagLuck(t) },
	"BrazenBrilliance":              func(t string) *api.Enchantment { return parseTemplateBrazenBrilliance(t) },
	"MindDrain":                     func(t string) *api.Enchantment { return parseTemplateMindDrain(t) },
	"EnergySiphon":                  func(t string) *api.Enchantment { return parseTemplateEnergySiphon(t) },
	"CraftableRuneArm":              func(t string) *api.Enchantment { return parseTemplateCraftableRuneArm(t) },
	"Stability":                     func(t string) *api.Enchantment { return parseTemplateStability(t) },
	"Price":                         func(_ string) *api.Enchantment { return nil },
	"CategoryList":                  func(_ string) *api.Enchantment { return nil },
	"EmptyAugments":                 func(_ string) *api.Enchantment { return nil },
	"LGSAugments":                   func(_ string) *api.Enchantment { return nil },
	"EssenceCraftingSlots":          func(_ string) *api.Enchantment { return nil },
	"WhirlwindAbsorption":           func(t string) *api.Enchantment { return parseTemplateWhirlwindAbsorption(t) },
	"WingedAllure":                  func(t string) *api.Enchantment { return parseTemplateWingedAllure(t) },
	"IceShardsGuard":                func(t string) *api.Enchantment { return parseTemplateIceShardsGuard(t) },
	"DeificFocus":                   func(t string) *api.Enchantment { return parseTemplateDeificFocus(t) },
	"Hammerblock":                   func(t string) *api.Enchantment { return parseTemplateHammerblock(t) },
	"FinishingTouch":                func(t string) *api.Enchantment { return parseTemplateFinishingTouch(t) },
	"CompletedWeapon":               func(t string) *api.Enchantment { return parseTemplateCompletedWeapon(t) },
	"ThornyCrownofMadness":          func(t string) *api.Enchantment { return parseTemplateThornyCrownofMadness(t) },
	"DragonshardFocus":              func(t string) *api.Enchantment { return parseTemplateDragonshardFocus(t) },
	"ThornOfTheRose":                func(t string) *api.Enchantment { return parseTemplateThornOfTheRose(t) },
	"TrapTheSoul":                   func(t string) *api.Enchantment { return parseTemplateTrapTheSoul(t) },
	"Poison":                        func(t string) *api.Enchantment { return parseTemplatePoison(t) },
	"WondrousCraftsmanship":         func(t string) *api.Enchantment { return parseTemplateWondrousCraftsmanship(t) },
	"Reaping":                       func(t string) *api.Enchantment { return parseTemplateReaping(t) },
	"GreaterDispellingGuard":        func(_ string) *api.Enchantment { return parseTemplateGreaterDispellingGuard() },
	"HalcyonMind":                   func(_ string) *api.Enchantment { return parseTemplateHalcyonMind() },
	"Anchoring":                     func(_ string) *api.Enchantment { return parseTemplateAnchoring() },
	"SinkLikeaBrick":                func(_ string) *api.Enchantment { return parseTemplateSinkLikeaBrick() },
	"BloodyThorns":                  func(_ string) *api.Enchantment { return parseTemplateBloodyThorns() },
	"StonePrisonGuard":              func(t string) *api.Enchantment { return parseTemplateStonePrisonGuard(t) },
	"SpikeGuard":                    func(_ string) *api.Enchantment { return parseTemplateSpikeGuard() },
	"AdditionalDamageType":          func(t string) *api.Enchantment { return parseTemplateAdditionalDamageType(t) },
	"SwimLikeAFish":                 func(_ string) *api.Enchantment { return parseTemplateSwimLikeAFish() },
	"ConfoundingEnchantment":        func(_ string) *api.Enchantment { return parseTemplateConfoundingEnchantment() },
	"ElementalEnergy":               func(t string) *api.Enchantment { return parseTemplateElementalEnergy(t) },
	"ElementalAttuned":              func(t string) *api.Enchantment { return parseTemplateElementalAttuned(t) },
	"LightningGuard":                func(t string) *api.Enchantment { return parseTemplateLightningGuard(t) },
	"BlackscaleFerocity":            func(_ string) *api.Enchantment { return parseTemplateBlackscaleFerocity() },
	"ExtraLayOnHands":               func(t string) *api.Enchantment { return parseTemplateExtraLayOnHands(t) },
	"CannithCombatInfusion":         func(_ string) *api.Enchantment { return parseTemplateCannithCombatInfusion() },
	"NearlyFinished":                func(_ string) *api.Enchantment { return parseTemplateNearlyFinished() },
	"NearlyComplete":                func(t string) *api.Enchantment { return parseTemplateNearlyComplete(t) },
	"Fearsome":                      func(_ string) *api.Enchantment { return parseTemplateFearsome() },
	"Diehard":                       func(_ string) *api.Enchantment { return parseTemplateDiehard() },
	"SymbioticFlexibility":          func(_ string) *api.Enchantment { return parseTemplateSymbioticFlexibility() },
	"SymbioticBacklash":             func(_ string) *api.Enchantment { return parseTemplateSymbioticBacklash() },
	"Spearblock":                    func(t string) *api.Enchantment { return parseTemplateSpearblock(t) },
	"WeakenUndead":                  func(t string) *api.Enchantment { return parseTemplateWeakenUndead(t) },
	"KickEmWhileTheyreDown":         func(t string) *api.Enchantment { return parseTemplateKickEmWhileTheyreDown(t) },
	"RagingInferno":                 func(t string) *api.Enchantment { return parseTemplateRagingInferno(t) },
	"MetalFatigue":                  func(t string) *api.Enchantment { return parseTemplateMetalFatigue(t) },
	"TelekinesisGuard":              func(t string) *api.Enchantment { return parseTemplateTelekinesisGuard(t) },
	"TheReaver":                     func(t string) *api.Enchantment { return parseTemplateTheReaver(t) },
	"Telekinetic":                   func(t string) *api.Enchantment { return parseTemplateTelekinetic(t) },
	"SlicingWinds":                  func(t string) *api.Enchantment { return parseTemplateSlicingWinds(t) },
	"Shadowblade":                   func(t string) *api.Enchantment { return parseTemplateShadowblade(t) },
	"StaggeringBlow":                func(t string) *api.Enchantment { return parseTemplateStaggeringBlow(t) },
	"AngelicGrace":                  func(t string) *api.Enchantment { return parseTemplateAngelicGrace(t) },
	"FreezingIceGuard":              func(t string) *api.Enchantment { return parseTemplateFreezingIceGuard(t) },
	"Nimbleness":                    func(t string) *api.Enchantment { return parseTemplateNimbleness(t) },
	"AntimagicSpike":                func(t string) *api.Enchantment { return parseTemplateAntimagicSpike(t) },
	"Blood":                         func(_ string) *api.Enchantment { return parseTemplateBlood() },
	"Banishing":                     func(t string) *api.Enchantment { return parseTemplateBanishing(t) },
	"BrillianceGuard":               func(t string) *api.Enchantment { return parseTemplateBrillianceGuard(t) },
	"RadianceGuard":                 func(t string) *api.Enchantment { return parseTemplateRadianceGuard(t) },
	"DiseaseGuard":                  func(t string) *api.Enchantment { return parseTemplateDiseaseGuard(t) },
	"TheGoldenCurse":                func(t string) *api.Enchantment { return parseTemplateTheGoldenCurse(t) },
	"AirGuard":                      func(t string) *api.Enchantment { return parseTemplateAirGuard(t) },
	"EarthgrabGuard":                func(t string) *api.Enchantment { return parseTemplateEarthgrabGuard(t) },
	"LifeShield":                    func(t string) *api.Enchantment { return parseTemplateLifeShield(t) },
	"Save":                          func(t string) *api.Enchantment { return parseTemplateSave(t) },
	"JetPropulsion":                 func(t string) *api.Enchantment { return parseTemplateJetPropulsion(t) },
	"RuneArmBlast":                  func(t string) *api.Enchantment { return parseTemplateRuneArmBlast(t) },
	"Skill":                         func(t string) *api.Enchantment { return parseTemplateSkill(t) },
	"ElementalResistance":           func(t string) *api.Enchantment { return parseTemplateElementalResistance(t) },
	"Ability":                       func(t string) *api.Enchantment { return parseTemplateAbility(t) },
	"HealingAmp":                    func(t string) *api.Enchantment { return parseTemplateHealingAmp(t) },
	"ItemMaterialDR":                func(t string) *api.Enchantment { return parseTemplateItemMaterialDR(t) },
	"Aligned":                       func(t string) *api.Enchantment { return parseTemplateAligned(t) },
	"PreslottedAugment":             func(_ string) *api.Enchantment { return nil },
	"HealLikeaGolem":                func(t string) *api.Enchantment { return parseTemplateHealLikeaGolem(t) },
	"Steam":                         func(t string) *api.Enchantment { return parseTemplateSteam(t) },
	"Salt":                          func(t string) *api.Enchantment { return parseTemplateSalt(t) },
	"Ice":                           func(t string) *api.Enchantment { return parseTemplateIce(t) },
	"SneakAttackDamage":             func(t string) *api.Enchantment { return parseTemplateSneakAttackDamage(t) },
	"Bodyfeeder":                    func(t string) *api.Enchantment { return parseTemplateBodyfeeder(t) },
	"TaintOfShavarath":              parseTemplateTaintOfShavarath,
	"TouchoftheMournlands":          func(t string) *api.Enchantment { return parseTemplateTouchoftheMournlands(t) },
	"ProofAgainstPoison":            func(t string) *api.Enchantment { return parseTemplateProofAgainstPoison(t) },
	"Guardbreaking":                 func(t string) *api.Enchantment { return parseTemplateGuardbreaking(t) },
	"AC":                            func(t string) *api.Enchantment { return parseTemplateAC(t) },
	"SpellPoints":                   func(t string) *api.Enchantment { return parseTemplateSpellPoints(t) },
	"Vacuum":                        func(t string) *api.Enchantment { return parseTemplateVacuum(t) },
	"Keen":                          func(t string) *api.Enchantment { return parseTemplateKeen(t) },
	"Fortification":                 func(t string) *api.Enchantment { return parseTemplateFortification(t) },
	"ActionBoostEnhancement":        func(t string) *api.Enchantment { return parseTemplateActionBoostEnhancement(t) },
	"ArmorPiercing":                 func(t string) *api.Enchantment { return parseTemplateArmorPiercing(t) },
	"DodgeBypass":                   func(t string) *api.Enchantment { return parseTemplateDodgeBypass(t) },
	"InspireGreatnessExtra":         func(t string) *api.Enchantment { return parseTemplateInspireGreatnessExtra(t) },
	"FavoredWeapon":                 func(_ string) *api.Enchantment { return parseTemplateFavoredWeapon() },
	"Sacred":                        func(t string) *api.Enchantment { return parseTemplateSacred(t) },
	"Fleshmaker":                    func(t string) *api.Enchantment { return parseTemplateFleshmaker(t) },
	"Sonic":                         func(t string) *api.Enchantment { return parseTemplateSonic(t) },
	"SpellAugmentation":             func(t string) *api.Enchantment { return parseTemplateSpellAugmentation(t) },
	"Doubleshot":                    func(t string) *api.Enchantment { return parseTemplateDoubleshot(t) },
	"FalseLife":                     func(t string) *api.Enchantment { return parseTemplateFalseLife(t) },
	"EnhancedKi":                    func(t string) *api.Enchantment { return parseTemplateEnhancedKi(t) },
	"PactDice":                      func(t string) *api.Enchantment { return parseTemplatePactDice(t) },
	"Accuracy":                      func(t string) *api.Enchantment { return parseTemplateAccuracy(t) },
	"UnconsciousRange":              func(t string) *api.Enchantment { return parseTemplateUnconsciousRange(t) },
	"Vampirism":                     func(t string) *api.Enchantment { return parseTemplateVampirism(t) },
	"OffensiveDamage":               func(t string) *api.Enchantment { return parseTemplateOffensiveDamage(t) },
	"Anthem":                        func(t string) *api.Enchantment { return parseTemplateAnthem(t) },
	"HealersBounty":                 func(t string) *api.Enchantment { return parseTemplateHealersBounty(t) },
	"Dust":                          func(t string) *api.Enchantment { return parseTemplateDust(t) },
	"Ash":                           func(t string) *api.Enchantment { return parseTemplateAsh(t) },
	"Disintegration":                func(t string) *api.Enchantment { return parseTemplateDisintegration(t) },
	"DisintegrationGuard":           func(t string) *api.Enchantment { return parseTemplateDisintegrationGuard(t) },
	"InvisibilityGuard":             func(t string) *api.Enchantment { return parseTemplateInvisibilityGuard(t) },
	"Trembling":                     func(t string) *api.Enchantment { return parseTemplateTrembling(t) },
	"IncinerationGuard":             func(t string) *api.Enchantment { return parseTemplateIncinerationGuard(t) },
	"AcidCorrosion":                 func(t string) *api.Enchantment { return parseTemplateAcidCorrosion(t) },
	"HolySmite":                     func(t string) *api.Enchantment { return parseTemplateHolySmite(t) },
	"TempestStorm":                  func(t string) *api.Enchantment { return parseTemplateTempestStorm(t) },
	"AlchemicalElementalAttuned":    func(t string) *api.Enchantment { return parseTemplateAlchemicalElementalAttuned(t) },
	"ArcaneCastingDexterity":        func(t string) *api.Enchantment { return parseTemplateArcaneCastingDexterity(t) },
	"OffensiveEffect":               func(t string) *api.Enchantment { return parseTemplateOffensiveEffect(t) },
	"RuneArmImbue":                  func(t string) *api.Enchantment { return parseTemplateRuneArmImbue(t) },
	"TrueSeeing":                    func(_ string) *api.Enchantment { return parseTemplateTrueSeeing() },
	"Trueseeing":                    func(_ string) *api.Enchantment { return parseTemplateTrueSeeing() },
	"CacophonicGuard":               func(t string) *api.Enchantment { return parseTemplateCacophonicGuard(t) },
	"UndeadGuard":                   func(t string) *api.Enchantment { return parseTemplateUndeadGuard(t) },
	"BloodRage":                     func(t string) *api.Enchantment { return parseTemplateBloodRage(t) },
	"Anger":                         func(t string) *api.Enchantment { return parseTemplateAnger(t) },
	"SpellPenetration":              func(t string) *api.Enchantment { return parseTemplateSpellPenetration(t) },
	"Dodge":                         func(t string) *api.Enchantment { return parseTemplateDodge(t) },
	"DodgeCap":                      func(t string) *api.Enchantment { return parseTemplateDodgeCap(t) },
	"TurnDice":                      func(t string) *api.Enchantment { return parseTemplateTurnDice(t) },
	"Deadly":                        func(t string) *api.Enchantment { return parseTemplateDeadly(t) },
	"TemperanceOfBelief":            func(_ string) *api.Enchantment { return parseTemplateTemperanceOfBelief() },
	"Returning":                     func(t string) *api.Enchantment { return parseTemplateReturning(t) },
	"Murderous":                     func(t string) *api.Enchantment { return parseTemplateMurderous(t) },
	"RevelInBlood":                  func(t string) *api.Enchantment { return parseTemplateRevelInBlood(t) },
	"FeatherFalling":                func(t string) *api.Enchantment { return parseTemplateFeatherFalling(t) },
	"Proficiency":                   func(t string) *api.Enchantment { return parseTemplateProficiency(t) },
	"Doublestrike":                  func(t string) *api.Enchantment { return parseTemplateDoublestrike(t) },
	"RuneArmRechargeRate":           func(t string) *api.Enchantment { return parseTemplateRuneArmRechargeRate(t) },
	"ItemFeat":                      func(t string) *api.Enchantment { return parseTemplateItemFeat(t) },
	"ItemSet":                       func(t string) *api.Enchantment { return parseTemplateItemSet(t) },
	"WildEmpathy":                   func(t string) *api.Enchantment { return parseTemplateWildEmpathy(t) },
	"ReinforcedFists":               func(t string) *api.Enchantment { return parseTemplateReinforcedFists(t) },
	"Soundproof":                    func(_ string) *api.Enchantment { return parseTemplateSoundproof() },
	"EfficientMetamagic":            func(t string) *api.Enchantment { return parseTemplateEfficientMetamagic(t) },
	"Immune":                        func(t string) *api.Enchantment { return parseTemplateImmune(t) },
	"EldritchBlastDice":             func(t string) *api.Enchantment { return parseTemplateEldritchBlastDice(t) },
	"Vitality":                      func(t string) *api.Enchantment { return parseTemplateVitality(t) },
	"PermanentEffect":               func(t string) *api.Enchantment { return parseTemplatePermanantEffect(t) },
	"PermanantEffect":               func(t string) *api.Enchantment { return parseTemplatePermanantEffect(t) },
	"MagicalEfficiency":             func(t string) *api.Enchantment { return parseTemplateMagicalEfficiency(t) },
	"TendonSlice":                   func(t string) *api.Enchantment { return parseTemplateTendonSlice(t) },
	"Assassination":                 func(t string) *api.Enchantment { return parseTemplateAssassination(t) },
	"WeaponEffect":                  func(t string) *api.Enchantment { return parseTemplateWeaponEffect(t) },
	"Shockwave":                     func(t string) *api.Enchantment { return parseTemplateShockwave(t) },
	"DamageEffect":                  func(t string) *api.Enchantment { return parseTemplateDamageEffect(t) },
	"Concealment":                   func(t string) *api.Enchantment { return parseTemplateConcealment(t) },
	"MemoryOfButchery":              func(_ string) *api.Enchantment { return parseTemplateMemoryOfButchery() },
	"MemoryOfBinding":               func(_ string) *api.Enchantment { return parseTemplateMemoryOfBinding() },
	"MemoryOfShatteredLife":         func(_ string) *api.Enchantment { return parseTemplateMemoryOfShatteredLife() },
	"Maiming":                       func(t string) *api.Enchantment { return parseTemplateMaiming(t) },
	"DruidicStoneshape":             func(_ string) *api.Enchantment { return parseTemplateDruidicStoneshape() },
	"Crippling":                     func(t string) *api.Enchantment { return parseTemplateCrippling(t) },
	"Strikethrough":                 func(t string) *api.Enchantment { return parseTemplateStrikethrough(t) },
	"ImbueDice":                     func(t string) *api.Enchantment { return parseTemplateImbueDice(t) },
	"Destruction":                   func(t string) *api.Enchantment { return parseTemplateDestruction(t) },
	"SpellResistance":               func(t string) *api.Enchantment { return parseTemplateSpellResistance(t) },
	"ThornGuard":                    func(t string) *api.Enchantment { return parseTemplateThornGuard(t) },
	"CarryingCapacity":              func(t string) *api.Enchantment { return parseTemplateCarryingCapacity(t) },
	"ElementalDOT":                  func(t string) *api.Enchantment { return parseTemplateElementalDOT(t) },
	"ElementalAOE":                  func(t string) *api.Enchantment { return parseTemplateElementalAOE(t) },
	"SealedInMist":                  func(_ string) *api.Enchantment { return parseTemplateSealedInMist() },
	"SealedInFire":                  func(_ string) *api.Enchantment { return parseTemplateSealedInFire() },
	"AnthemMelody":                  func(t string) *api.Enchantment { return parseTemplateAnthemMelody(t) },
	"Meltscale":                     func(t string) *api.Enchantment { return parseTemplateMeltscale(t) },
	"SealedInGloom":                 func(_ string) *api.Enchantment { return parseTemplateSealedInGloom() },
	"Elemental":                     func(t string) *api.Enchantment { return parseTemplateElemental(t) },
	"ElementalForm":                 func(t string) *api.Enchantment { return parseTemplateElementalForm(t) },
	"ElementalArrow":                func(t string) *api.Enchantment { return parseTemplateElementalArrow(t) },
	"AlignmentDamage":               func(t string) *api.Enchantment { return parseTemplateAlignmentDamage(t) },
	"BluntTrama":                    func(_ string) *api.Enchantment { return parseTemplateBluntTrama() },
	"FreezingIce":                   func(t string) *api.Enchantment { return parseTemplateFreezingIce(t) },
	"Alacrity":                      func(t string) *api.Enchantment { return parseTemplateAlacrity(t) },
	"IntercessionWard":              func(_ string) *api.Enchantment { return parseTemplateIntercessionWard() },
	"LimbChopper":                   func(_ string) *api.Enchantment { return parseTemplateLimbChopper() },
	"Paralyzing":                    func(t string) *api.Enchantment { return parseTemplateParalyzing(t) },
	"Shatter":                       func(t string) *api.Enchantment { return parseTemplateShatter(t) },
	"ArmorMastery":                  func(t string) *api.Enchantment { return parseTemplateArmorMastery(t) },
	"Bane":                          func(t string) *api.Enchantment { return parseTemplateBane(t) },
	"RelentlessFury":                func(_ string) *api.Enchantment { return parseTemplateRelentlessFury() },
	"Sparkscale":                    func(_ string) *api.Enchantment { return parseTemplateSparkscale() },
	"Vorpal":                        func(t string) *api.Enchantment { return parseTemplateVorpal(t) },
	"3rdDegreeBurns":                func(_ string) *api.Enchantment { return parseTemplate3rdDegreeBurns() },
	"FellingTheOak":                 func(_ string) *api.Enchantment { return parseTemplateFellingTheOak() },
	"Elasticity":                    func(_ string) *api.Enchantment { return parseTemplateElasticity() },
	"FrozenAether":                  func(_ string) *api.Enchantment { return parseTemplateFrozenAether() },
	"TheWarbladesWrath":             func(_ string) *api.Enchantment { return parseTemplateTheWarbladesWrath() },
	"TheArtbladesGift":              func(_ string) *api.Enchantment { return parseTemplateTheArtbladesGift() },
	"Radiance":                      func(t string) *api.Enchantment { return parseTemplateRadiance(t) },
	"DisruptionGuard":               func(t string) *api.Enchantment { return parseTemplateDisruptionGuard(t) },
	"Earthgrab":                     func(_ string) *api.Enchantment { return parseTemplateEarthgrab() },
	"BoneBreaking":                  func(_ string) *api.Enchantment { return parseTemplateBoneBreaking() },
	"LightsOut":                     func(_ string) *api.Enchantment { return parseTemplateLightsOut() },
	"TheFallingStar":                func(_ string) *api.Enchantment { return parseTemplateTheFallingStar() },
	"ThrilloftheHunt":               func(_ string) *api.Enchantment { return parseTemplateThrilloftheHunt() },
	"IriansMight":                   func(_ string) *api.Enchantment { return parseTemplateIriansMight() },
	"InflictBlight":                 func(_ string) *api.Enchantment { return parseTemplateInflictBlight() },
	"Rockslide":                     func(_ string) *api.Enchantment { return parseTemplateRockslide() },
	"ShieldedbyMoonlight":           func(_ string) *api.Enchantment { return parseTemplateShieldedbyMoonlight() },
	"TheMummysGift":                 func(_ string) *api.Enchantment { return parseTemplateTheMummysGift() },
	"Enervation":                    func(_ string) *api.Enchantment { return parseTemplateEnervation() },
	"ForgedLightning":               func(_ string) *api.Enchantment { return parseTemplateForgedLightning() },
	"Rebellion":                     func(_ string) *api.Enchantment { return parseTemplateRebellion() },
	"Negation":                      func(t string) *api.Enchantment { return parseTemplateNegation(t) },
	"BaneOfTheDepths":               func(_ string) *api.Enchantment { return parseTemplateBaneOfTheDepths() },
	"TurbulentBurst":                func(_ string) *api.Enchantment { return parseTemplateTurbulentBurst() },
	"PearlsOfThunder":               func(_ string) *api.Enchantment { return parseTemplatePealsOfThunder() },
	"PealsOfThunder":                func(_ string) *api.Enchantment { return parseTemplatePealsOfThunder() },
	"TemperanceOfSpirit":            func(_ string) *api.Enchantment { return parseTemplateTemperanceOfSpirit() },
	"Ooze":                          func(t string) *api.Enchantment { return parseTemplateOoze(t) },
	"Regeneration":                  func(t string) *api.Enchantment { return parseTemplateRegeneration(t) },
	"DemonicMight":                  func(_ string) *api.Enchantment { return parseTemplateDemonicMight() },
	"StormreaverThunderclap":        func(_ string) *api.Enchantment { return parseTemplateStormreaverThunderclap() },
	"RepairSystems":                 func(_ string) *api.Enchantment { return parseTemplateRepairSystems() },
	"SpellPowerGuard":               func(_ string) *api.Enchantment { return parseTemplateSpellPowerGuard() },
	"HitPointGuard":                 func(_ string) *api.Enchantment { return parseTemplateHitPointGuard() },
	"CrushingWaveGuard":             func(t string) *api.Enchantment { return parseTemplateCrushingWaveGuard(t) },
	"ScorchingFlame":                func(t string) *api.Enchantment { return parseTemplateScorchingFlame(t) },
	"NullmagicGuard":                func(t string) *api.Enchantment { return parseTemplateNullmagicGuard(t) },
	"RunicRevitalization":           func(t string) *api.Enchantment { return parseTemplateRunicRevitalization(t) },
	"GlacialFrost":                  func(t string) *api.Enchantment { return parseTemplateGlacialFrost(t) },
	"DemonicShield":                 func(t string) *api.Enchantment { return parseTemplateDemonicShield(t) },
	"Ethereal":                      func(t string) *api.Enchantment { return parseTemplateEthereal(t) },
	"Shattermantle":                 func(t string) *api.Enchantment { return parseTemplateShattermantle(t) },
	"Striding":                      func(t string) *api.Enchantment { return parseTemplateStriding(t) },
	"AlignmentAbsorb":               func(t string) *api.Enchantment { return parseTemplateAlignmentAbsorb(t) },
	"QuellingStrikes":               func(t string) *api.Enchantment { return parseTemplateQuellingStrikes(t) },
	"SneakAttackDice":               func(t string) *api.Enchantment { return parseTemplateSneakAttackDice(t) },
	"Turning":                       func(t string) *api.Enchantment { return parseTemplateTurning(t) },
	"WeakenConstruct":               func(t string) *api.Enchantment { return parseTemplateWeakenConstruct(t) },
	"AttunedToHeroism":              func(t string) *api.Enchantment { return parseTemplateAttunedToHeroism(t) },
	"SealedInUndeath":               func(_ string) *api.Enchantment { return parseTemplateSealedInUndeath() },
	"ShockingBlow":                  func(t string) *api.Enchantment { return parseTemplateShockingBlow(t) },
	"HeroicInspiration":             func(t string) *api.Enchantment { return parseTemplateHeroicInspiration(t) },
	"SpellTurmoil":                  func(t string) *api.Enchantment { return parseTemplateSpellTurmoil(t) },
	"GuidanceofShar":                func(t string) *api.Enchantment { return parseTemplateGuidanceofShar(t) },
	"ForceBlast":                    func(t string) *api.Enchantment { return parseTemplateForceBlast(t) },
	"BoonofUndeath":                 func(t string) *api.Enchantment { return parseTemplateBoonofUndeath(t) },
	"CrystalCoveUpgrade":            func(t string) *api.Enchantment { return parseTemplateCrystalCoveUpgrade(t) },
	"SpellAbsorption":               func(t string) *api.Enchantment { return parseTemplateSpellAbsorption(t) },
	"GhostTouch":                    func(t string) *api.Enchantment { return parseTemplateGhostTouch(t) },
	"Suppressed":                    func(_ string) *api.Enchantment { return parseTemplateSuppressed() },
	"Nightmares":                    func(t string) *api.Enchantment { return parseTemplateNightmares(t) },
	"AgainstTheSlaveLordsSetBonus":  func(_ string) *api.Enchantment { return parseTemplateAgainstTheSlaveLordsSetBonus() },
	"VaultsofArtificersUpgradeable": func(t string) *api.Enchantment { return parseTemplateVaultsofArtificersUpgradeable(t) },
	"DR":                            func(t string) *api.Enchantment { return parseTemplateDR(t) },
	"Guard":                         func(t string) *api.Enchantment { return parseTemplateGuard(t) },
	"ZhentarimAttuned":              func(t string) *api.Enchantment { return parseTemplateZhentarimAttuned(t) },
	"BlackAbbotItemUpgrade":         func(t string) *api.Enchantment { return parseTemplateBlackAbbotItemUpgrade(t) },
	"EternalHolyBurst":              func(t string) *api.Enchantment { return parseTemplateEternalHolyBurst(t) },
	"StormreaverUpgrade":            func(t string) *api.Enchantment { return parseTemplateStormreaverUpgrade(t) },
	"SuppressMadness":               func(t string) *api.Enchantment { return parseTemplateSuppressMadness(t) },
	"EmbraceoftheSpiderQueen":       func(t string) *api.Enchantment { return parseTemplateEmbraceoftheSpiderQueen(t) },
	"Unnatural":                     func(t string) *api.Enchantment { return parseTemplateUnnatural(t) },
	"Quenched":                      func(t string) *api.Enchantment { return parseTemplateQuenched(t) },
	"NightmareGuard":                func(t string) *api.Enchantment { return parseTemplateNightmareGuard(t) },
	"EarthenGuard":                  func(t string) *api.Enchantment { return parseTemplateEarthenGuard(t) },
	"Raging":                        func(t string) *api.Enchantment { return parseTemplateRaging(t) },
	"SlayLiving":                    func(t string) *api.Enchantment { return parseTemplateSlayLiving(t) },
	"FireShield":                    func(t string) *api.Enchantment { return parseTemplateFireShield(t) },
	"Dragontouched":                 func(t string) *api.Enchantment { return parseTemplateDragontouched(t) },
	"LostPurpose":                   func(t string) *api.Enchantment { return parseTemplateLostPurpose(t) },
	"HasteGuard":                    func(t string) *api.Enchantment { return parseTemplateHasteGuard(t) },
	"FreedomOfMovement":             func(t string) *api.Enchantment { return parseTemplateFreedomOfMovement(t) },
	"SpellResonance":                func(t string) *api.Enchantment { return parseTemplateSpellResonance(t) },
	"MagmaSurgeGuard":               func(t string) *api.Enchantment { return parseTemplateMagmaSurgeGuard(t) },
	"MagicalNull":                   func(t string) *api.Enchantment { return parseTemplateMagicalNull(t) },
	"Vengeful":                      func(t string) *api.Enchantment { return parseTemplateVengeful(t) },
	"PowerDrain":                    func(t string) *api.Enchantment { return parseTemplatePowerDrain(t) },
	"FlawedShadowscaleArmor":        func(t string) *api.Enchantment { return parseTemplateFlawedShadowscaleArmor(t) },
	"FromTheShadows":                func(t string) *api.Enchantment { return parseTemplateFromTheShadows(t) },
	"ArcaneAugmentation":            func(t string) *api.Enchantment { return parseTemplateArcaneAugmentation(t) },
	"DivineAugmentation":            func(t string) *api.Enchantment { return parseTemplateDivineAugmentation(t) },
	"Axeblock":                      func(t string) *api.Enchantment { return parseTemplateAxeblock(t) },
	"Cursespewing":                  func(t string) *api.Enchantment { return parseTemplateCursespewing(t) },
	"TraceOfMadness":                func(t string) *api.Enchantment { return parseTemplateTraceOfMadness(t) },
	"Dampened":                      func(t string) *api.Enchantment { return parseTemplateDampened(t) },
	"GlassJawStrike":                func(_ string) *api.Enchantment { return parseTemplateGlassJawStrike() },
	"LightningStrike":               func(t string) *api.Enchantment { return parseTemplateLightningStrike(t) },
	"SpikeStudded":                  func(_ string) *api.Enchantment { return parseTemplateSpikeStudded() },
	"Clickie":                       func(t string) *api.Enchantment { return parseTemplateClickie(t) },
}

var enchMultiHandlers = map[string]func(string) []*api.Enchantment{
	"ElementalAbsorb":           func(t string) []*api.Enchantment { return parseTemplateElementalAbsorb(t) },
	"CasterLevel":               func(t string) []*api.Enchantment { return parseTemplateCasterLevel(t) },
	"Dazing":                    func(t string) []*api.Enchantment { return parseTemplateDazing(t) },
	"DreamVision":               func(t string) []*api.Enchantment { return parseTemplateDreamVision(t) },
	"TouchOfImmortality":        func(t string) []*api.Enchantment { return parseTemplateTouchOfImmortality(t) },
	"SlaveLordsBlank":           func(t string) []*api.Enchantment { return parseTemplateSlaveLordsBlank(t) },
	"CCHatUpgrades":             func(t string) []*api.Enchantment { return parseTemplateCCHatUpgrades(t) },
	"FaeryfireCurse":            func(t string) []*api.Enchantment { return parseTemplateFaeryfireCurse(t) },
	"VoiceofDeceit":             func(t string) []*api.Enchantment { return parseTemplateVoiceofDeceit(t) },
	"ChaosGuard":                func(_ string) []*api.Enchantment { return parseTemplateChaosGuard() },
	"Lifesealed":                func(t string) []*api.Enchantment { return parseTemplateLifesealed(t) },
	"VengefulFury":              func(_ string) []*api.Enchantment { return parseTemplateVengefulFury() },
	"Overfocus":                 func(t string) []*api.Enchantment { return parseTemplateOverfocus(t) },
	"GoodLuck":                  func(t string) []*api.Enchantment { return parseTemplateGoodluck(t) },
	"Goodluck":                  func(t string) []*api.Enchantment { return parseTemplateGoodluck(t) },
	"Faith":                     func(_ string) []*api.Enchantment { return parseTemplateFaith() },
	"AlignmentBypass":           func(t string) []*api.Enchantment { return parseTemplateAlignmentBypass(t) },
	"SpellLore":                 func(t string) []*api.Enchantment { return parseTemplateSpellLore(t) },
	"Seeker":                    func(t string) []*api.Enchantment { return parseTemplateSeeker(t) },
	"SkillGroupBonus":           func(t string) []*api.Enchantment { return parseTemplateSkillGroupBonus(t) },
	"OrbBonus":                  func(t string) []*api.Enchantment { return parseTemplateOrbBonus(t) },
	"AlchemicalConservation":    func(t string) []*api.Enchantment { return parseTemplateAlchemicalConservation(t) },
	"Flamescale":                func(t string) []*api.Enchantment { return parseTemplateFlamescale(t) },
	"SpellSchoolSave":           func(t string) []*api.Enchantment { return parseTemplateSpellSchoolSave(t) },
	"LitanyAbilityBonus":        func(t string) []*api.Enchantment { return parseTemplateLitanyAbilityBonus(t) },
	"LitanyCombatBonus":         func(t string) []*api.Enchantment { return parseTemplateLitanyCombatBonus(t) },
	"CombatMastery":             func(t string) []*api.Enchantment { return parseTemplateCombatMastery(t) },
	"Speed":                     func(t string) []*api.Enchantment { return parseTemplateSpeed(t) },
	"Ghostly":                   func(t string) []*api.Enchantment { return parseTemplateGhostly(t) },
	"BottledHeart":              func(_ string) []*api.Enchantment { return parseTemplateBottledHeart() },
	"Parrying":                  func(t string) []*api.Enchantment { return parseTemplateParrying(t) },
	"Deathblock":                func(t string) []*api.Enchantment { return parseTemplateDeathblock(t) },
	"Eversight":                 func(t string) []*api.Enchantment { return parseTemplateEversight(t) },
	"AbilitySkills":             func(t string) []*api.Enchantment { return parseTemplateAbilitySkills(t) },
	"Diversion":                 func(t string) []*api.Enchantment { return parseTemplateDiversion(t) },
	"Marksmanship":              func(t string) []*api.Enchantment { return parseTemplateMarksmanship(t) },
	"ProofAgainstDisease":       func(t string) []*api.Enchantment { return parseTemplateProofAgainstDisease(t) },
	"MemoryOfAnimatedObjects":   func(_ string) []*api.Enchantment { return parseTemplateMemoryOfAnimatedObjects() },
	"Resistance":                func(t string) []*api.Enchantment { return parseTemplateResistance(t) },
	"ElementalManipulation":     func(_ string) []*api.Enchantment { return parseTemplateElementalManipulation() },
	"SpellCritDamage":           func(t string) []*api.Enchantment { return parseTemplateSpellCritDamage(t) },
	"SpellIntensity":            func(t string) []*api.Enchantment { return parseTemplateSpellIntensity(t) },
	"Stunning":                  func(t string) []*api.Enchantment { return parseTemplateStunning(t) },
	"Vertigo":                   func(t string) []*api.Enchantment { return parseTemplateVertigo(t) },
	"WeaponPower":               func(t string) []*api.Enchantment { return parseTemplateWeaponPower(t) },
	"WeaponMod":                 func(t string) []*api.Enchantment { return parseTemplateWeaponMod(t) },
	"Venomscale":                func(_ string) []*api.Enchantment { return parseTemplateVenomscale() },
	"ShadowStriker":             func(_ string) []*api.Enchantment { return parseTemplateShadowStriker() },
	"UnderwaterAction":          func(t string) []*api.Enchantment { return parseTemplateUnderwaterAction(t) },
	"Heroism":                   func(t string) []*api.Enchantment { return parseTemplateHeroism(t) },
	"Riposte":                   func(t string) []*api.Enchantment { return parseTemplateRiposte(t) },
	"Linguistics":               func(t string) []*api.Enchantment { return parseTemplateLinguistics(t) },
	"ProtectionFromEvil":        func(t string) []*api.Enchantment { return parseTemplateProtectionFromEvil(t) },
	"ExtraSongs":                func(t string) []*api.Enchantment { return parseTemplateExtraSongs(t) },
	"ExtraSmites":               func(t string) []*api.Enchantment { return parseTemplateExtraSmites(t) },
	"QuoriMindShield":           func(t string) []*api.Enchantment { return parseTemplateQuoriMindShield(t) },
	"EpicNecropolisItemUpgrade": func(t string) []*api.Enchantment { return parseTemplateEpicNecropolisItemUpgrade(t) },
	"EternalFaith":              func(t string) []*api.Enchantment { return parseTemplateEternalFaith(t) },
	"SneakAttack":               func(t string) []*api.Enchantment { return parseTemplateSneakAttack(t) },
	"Sheltering":                func(t string) []*api.Enchantment { return parseTemplateSheltering(t) },
	"SpellFocus":                func(t string) []*api.Enchantment { return parseTemplateSpellFocus(t) },
	"SpellPower":                func(t string) []*api.Enchantment { return parseTemplateSpellPower(t) },
	"Metalline":                 func(t string) []*api.Enchantment { return parseTemplateMetalline(t) },
	"Deception":                 func(t string) []*api.Enchantment { return parseTemplateDeception(t) },
	"ScarabofProtectionWard":    func(_ string) []*api.Enchantment { return parseTemplateScarabofProtectionWard() },
	"Command":                   func(t string) []*api.Enchantment { return parseTemplateCommand(t) },
}

func ParseEnchantments(rawEnchantments string, itemType string) []api.Enchantment {
	if strings.TrimSpace(rawEnchantments) == "" {
		return nil
	}

	var finalEnchantments []api.Enchantment
	var parsedEnchantments []api.Enchantment
	var remaining = rawEnchantments

	const openingBraces = "{{"

	for {
		start := strings.Index(remaining, openingBraces)
		if start == -1 {
			break
		}

		// 1. Identify the full template name
		pipeIndex := strings.Index(remaining[start+2:], "|")
		braceIndex := strings.Index(remaining[start+2:], "}}")

		var templateName string
		if pipeIndex != -1 && (pipeIndex < braceIndex || braceIndex == -1) {
			templateName = strings.TrimSpace(remaining[start+2 : start+2+pipeIndex])
		} else if braceIndex != -1 {
			templateName = strings.TrimSpace(remaining[start+2 : start+2+braceIndex])
		} else {
			remaining = remaining[start+2:]
			continue
		}

		// 2. Find the matching closing "}}" using the brace counter
		openBraceCount := 0
		endOfTemplate := -1
		searchStart := start + 2

		for i := searchStart; i < len(remaining); i++ {
			char := remaining[i]

			if char == '{' {
				openBraceCount++
			} else if char == '}' {
				if openBraceCount > 0 {
					openBraceCount--
				} else if openBraceCount == 0 {
					if i+1 < len(remaining) && remaining[i+1] == '}' {
						endOfTemplate = i + 1
						break
					}
				}
			}
		}

		if endOfTemplate == -1 {
			break
		}

		fullTemplate := remaining[start : endOfTemplate+1]
		// DO NOT advance remaining here, we will do it after the switch
		// remaining = remaining[endOfTemplate+1:] // Removed to fix double-advance bug

		// 3. Dispatch and classify

		// Special cases: skip entirely
		if templateName == "RechargeBar" || templateName == "MistsLantern" || templateName == "ItemSetTitle" {
			remaining = remaining[endOfTemplate+1:]
			continue
		}

		if templateName == "Dice" {
			dice := ParseTemplateDice(fullTemplate)
			if dice.Raw != "" {
				parsedEnchantments = append(parsedEnchantments, api.Enchantment{
					Name:   "Dice",
					Amount: dice.Raw,
				})
			}
		} else if templateName == "EnhancementBonus" {
			for _, enc := range parseTemplateEnhancementBonus(fullTemplate, itemType) {
				if enc != nil {
					parsedEnchantments = append(parsedEnchantments, *enc)
				}
			}
		} else if templateName == "Dragonmark" {
			for _, enc := range parseTemplateDragonmark(fullTemplate, itemType) {
				if enc != nil {
					parsedEnchantments = append(parsedEnchantments, *enc)
				}
			}
		} else if templateName == "Incite" {
			for _, enc := range parseTemplateIncite(fullTemplate, itemType) {
				if enc != nil {
					parsedEnchantments = append(parsedEnchantments, *enc)
				}
			}
		} else if handler, ok := enchSingleHandlers[templateName]; ok {
			if enc := handler(fullTemplate); enc != nil {
				parsedEnchantments = append(parsedEnchantments, *enc)
			}
		} else if handler, ok := enchMultiHandlers[templateName]; ok {
			for _, enc := range handler(fullTemplate) {
				if enc != nil {
					parsedEnchantments = append(parsedEnchantments, *enc)
				}
			}
		} else {
			logrus.Warnf("Found unknown enchantment template: %s. Please update parsing logic. Raw string: %s", templateName, fullTemplate)
		}

		// Move the remaining string pointer past the found template
		remaining = remaining[endOfTemplate+1:]
	}

	finalEnchantments = append(parsedEnchantments, finalEnchantments...)
	return finalEnchantments
}

func parseSaveDC(raw string) string {
	const prefix = "{{SaveDC|"
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return raw
	}

	paramList := raw[len(prefix) : len(raw)-len(suffix)]
	parts := strings.Split(paramList, "|")
	if len(parts) < 2 {
		return raw
	}

	saveType := strings.TrimSpace(parts[0])
	dc := strings.TrimSpace(parts[1])
	if dc == "" {
		return saveType
	}

	return fmt.Sprintf("%s DC: %s", saveType, dc)
}

func parseEnchTitle(raw string) string {
	const prefix = "{{EnchTitle|"
	const suffix = "}}"
	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return raw
	}
	paramList := raw[len(prefix) : len(raw)-len(suffix)]
	parts := splitParams(paramList)
	if len(parts) >= 2 {
		return strings.TrimSpace(parts[1])
	}
	if len(parts) >= 1 {
		return strings.TrimSpace(parts[0])
	}
	return ""
}

func parseEnchBody(raw string) string {
	const prefix = "{{EnchBody|"
	const suffix = "}}"
	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return raw
	}
	paramList := raw[len(prefix) : len(raw)-len(suffix)]
	return strings.TrimSpace(paramList)
}

func processEnchText(s string) string {
	// Handle embedded templates
	for {
		start := strings.Index(s, "{{")
		if start == -1 {
			break
		}
		// Use brace counter to find matching }}
		openBraceCount := 0
		endOfTemplate := -1
		for i := start + 2; i < len(s); i++ {
			if s[i] == '{' && i+1 < len(s) && s[i+1] == '{' {
				openBraceCount++
				i++
			} else if s[i] == '}' && i+1 < len(s) && s[i+1] == '}' {
				if openBraceCount > 0 {
					openBraceCount--
					i++
				} else {
					endOfTemplate = i + 1
					break
				}
			}
		}

		if endOfTemplate == -1 {
			break
		}

		fullTemplate := s[start : endOfTemplate+1]
		replacement := fullTemplate

		if strings.HasPrefix(fullTemplate, "{{SaveDC|") {
			replacement = parseSaveDC(fullTemplate)
		} else if strings.HasPrefix(fullTemplate, "{{Dice|") {
			dice := ParseTemplateDice(fullTemplate)
			replacement = dice.Raw
		} else if strings.HasPrefix(fullTemplate, "{{EnchTitle|") {
			replacement = parseEnchTitle(fullTemplate)
		} else if strings.HasPrefix(fullTemplate, "{{EnchBody|") {
			replacement = parseEnchBody(fullTemplate)
		}

		s = s[:start] + replacement + s[endOfTemplate+1:]
	}

	return stripWikitext(s)
}
