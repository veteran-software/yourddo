package parser

import (
	"fmt"
	"strings"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

func parseTemplateItemFeat(rawIFValue string) *api.Enchantment {
	const prefix = "{{ItemFeat|"
	const suffix = "}}"
	const baseName = "Feat"

	if !strings.HasPrefix(rawIFValue, prefix) || !strings.HasSuffix(rawIFValue, suffix) {
		return nil
	}

	paramList := rawIFValue[len(prefix) : len(rawIFValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Feat)|(bonus)|(title)|(link)

	// 1. Feat (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	feat := stripBrackets(parts[0])
	if feat == "" {
		return nil
	}

	var title string
	var name string

	// 3. Title (Optional, Index 2)
	if len(parts) >= 3 {
		title = stripBrackets(parts[2])
	}

	// --- CRITICAL NAME FORMATTING ---

	if title != "" {
		name = title // Use custom title
	} else {
		// Default name format: Feat: [Feat Name]
		name = fmt.Sprintf("%s: %s", baseName, feat)
	}

	return &api.Enchantment{
		Name: name,
	}
}


// Template:ItemSet
// Usage examples:
//
//	{{ItemSet|Epic Griffon}}
//	{{ItemSet|Way of the Sun Soul}}
//	{{ItemSet|Vol's Influence|True}}
//
// Params: (Set Name)|(Disable Category)|(Disable Title)
// We only care about the Set Name, and we disregard any Disable* params.
func parseTemplateItemSet(rawISValue string) *api.Enchantment {
	const prefix = "{{ItemSet|"
	const suffix = "}}"

	if !strings.HasPrefix(rawISValue, prefix) || !strings.HasSuffix(rawISValue, suffix) {
		return nil
	}

	paramList := rawISValue[len(prefix) : len(rawISValue)-len(suffix)]
	parts := strings.Split(paramList, "|")
	if len(parts) < 1 {
		return nil
	}
	setName := stripBrackets(parts[0])
	if setName == "" {
		return nil
	}

	// Return an Enchantment that carries the set name in a dedicated field so
	// downstream processors can populate setBonus consistently.
	return &api.Enchantment{
		Name:         "Item Set: " + setName, // keep textual marker for backward compat
		SetBonusName: setName,
	}
}

// ExtractSetBonus scans a list of enchantments and separates out any Item Set
// markers into a normalized []api.SetBonusOut. It returns the remaining
// enchantments (with set markers removed) and the set bonuses (singular entry by default).
// If multiple ItemSet markers are present, all are converted.

func parseTemplateImmune(rawImmuneValue string) *api.Enchantment {
	const prefix = "{{Immune|"
	const suffix = "}}"
	const baseName = "Immunity"

	if !strings.HasPrefix(rawImmuneValue, prefix) || !strings.HasSuffix(rawImmuneValue, suffix) {
		return nil
	}

	paramList := rawImmuneValue[len(prefix) : len(rawImmuneValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Type)|(Title)

	// 1. Type (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	immuneType := stripBrackets(parts[0])
	if immuneType == "" {
		return nil
	}

	var name string
	var title string

	// 2. Title (Optional, Index 1)
	if len(parts) >= 2 {
		title = stripBrackets(parts[1])
	}

	// --- CRITICAL NAME FORMATTING ---

	if title != "" {
		name = title // Use custom title
	} else {
		// Default name format: "Immunity: [Type]"
		name = fmt.Sprintf("%s: %s", baseName, immuneType)
	}

	return &api.Enchantment{
		Name: name,
		// All other fields remain empty.
	}
}


func parseTemplateIncite(rawIncValue string, itemType string) []*api.Enchantment {
	const prefix = "{{Incite|"
	const suffix = "}}"

	if !strings.HasPrefix(rawIncValue, prefix) || !strings.HasSuffix(rawIncValue, suffix) {
		return nil
	}

	paramList := rawIncValue[len(prefix) : len(rawIncValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Enhancement Amount)|(Attack Type)|(Bonus Type)|(Title)

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amountRaw := stripBrackets(parts[0])
	if amountRaw == "" {
		return nil
	}

	attackStyle := "Melee"
	var bonusType string
	var title string

	// 2. Attack Type (Optional, Index 1 - defaults to Melee)
	if len(parts) >= 2 {
		if value := stripBrackets(parts[1]); value != "" {
			attackStyle = value
		}
	}

	// 3. Bonus Type (Optional, Index 2)
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
	}

	// 4. Title (Optional, Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	// --- CRITICAL PROCESSING ---

	var enchantments []*api.Enchantment
	finalAmount := amountRaw + "%"

	// Determine base names for threat effects.
	baseThreatName := "Threat Generation"

	styleFlags := struct {
		Melee  bool
		Ranged bool
		Spell  bool
	}{}
	switch strings.ToLower(attackStyle) {
	case "ranged":
		styleFlags.Ranged = true
	case "spell":
		styleFlags.Spell = true
	case "spellmelee":
		styleFlags.Melee = true
		styleFlags.Spell = true
	case "spellranged":
		styleFlags.Ranged = true
		styleFlags.Spell = true
	case "all":
		styleFlags.Melee = true
		styleFlags.Ranged = true
		styleFlags.Spell = true
	default:
		styleFlags.Melee = true
	}

	// Generator function for split enchantments
	generateEnch := func(styleName string) *api.Enchantment {
		finalName := title
		if finalName == "" {
			finalName = styleName + " " + baseThreatName
		}

		return &api.Enchantment{
			Name:      finalName,
			Amount:    finalAmount,
			BonusType: bonusType,
			// AdditionalText could potentially be used for the base attack style if needed.
		}
	}

	// 3. Generate enchantments for split styles
	if styleFlags.Melee {
		enchantments = append(enchantments, generateEnch("Melee"))
	}
	if styleFlags.Ranged {
		enchantments = append(enchantments, generateEnch("Ranged"))
	}
	if styleFlags.Spell {
		enchantments = append(enchantments, generateEnch("Spell"))
	}

	return enchantments
}


func parseTemplateImbueDice(rawIDValue string) *api.Enchantment {
	const prefix = "{{ImbueDice|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation
	const baseName = "Imbue Dice"

	if !strings.HasPrefix(rawIDValue, prefix) || !strings.HasSuffix(rawIDValue, suffix) {
		return nil
	}

	paramList := rawIDValue[len(prefix) : len(rawIDValue)-len(suffix)]
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


// Template:IntercessionWard
// No parameters; defensive utility effect. Capture name and concise rules text.
func parseTemplateIntercessionWard() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Intercession Ward",
		Notes: new("Protects the user's connection to a source of Divine power and wards that connection from such things as a Quell's intercession ability. This effect only protects from incoming attacks and will not restore a lost connection."),
	}
}

// TODO: Revisit this when touching weapon enchantments as a whole

// Template:InspireGreatnessExtra
// Documentation screenshot indicates no parameters; used on equipment to
// enhance the Inspire Greatness enhancement. Per request, just output the
// name of the enchantment.
func parseTemplateInspireGreatnessExtra(raw string) *api.Enchantment {
	const prefix = "{{InspireGreatnessExtra"
	const suffix = "}}"
	const baseName = "Inspire Greatness"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}
	return &api.Enchantment{Name: baseName}
}


// Template:ItemMaterialDR
// Usage per screenshot/doc:
//
//	{{ItemMaterialDR|(Material)|(Item Type)}}
//
// Behavior requested: Output just the Material name; if an Item Type is
// specified, append it in parentheses.
// Examples:
//
//	{{ItemMaterialDR|Flametouched Iron}}         -> "Flametouched Iron"
//	{{ItemMaterialDR|Silver|Long Bow}}           -> "Silver (Long Bow)"
func parseTemplateItemMaterialDR(raw string) *api.Enchantment {
	const prefix = "{{ItemMaterialDR"
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

	parts := []string{}
	if inner != "" {
		parts = strings.Split(inner, "|")
	}

	if len(parts) < 1 {
		return nil
	}
	material := stripBrackets(parts[0])
	material = strings.TrimSpace(material)
	if material == "" {
		return nil
	}

	var itemType string
	if len(parts) >= 2 {
		itemType = strings.TrimSpace(stripBrackets(parts[1]))
	}

	name := "Damage Reduction Bypass: " + material
	if itemType != "" {
		name = material + " (" + itemType + ")"
	}

	return &api.Enchantment{Name: name}
}


// Template:Ice
// Usage: {{Ice|(Type)|(Title)}}
// Behavior mirrors Steam/Salt:
// - If Title present → use it exactly.
// - If Type blank or "Basic" → base name "Ice".
// - Else → "<Title-Cased Type> Ice".
func parseTemplateIce(raw string) *api.Enchantment {
	const prefix = "{{Ice"
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
		return &api.Enchantment{Name: "Ice"}
	default:
		name := cases.Title(language.English).String(t) + " Ice"
		return &api.Enchantment{Name: name}
	}
}


// Template: InvisibilityGuard
// Usage: {{InvisibilityGuard}}
func parseTemplateInvisibilityGuard(raw string) *api.Enchantment {
	const prefix = "{{InvisibilityGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Invisibility Guard",
		Notes: new("This item has a chance of granting you temporary invisibility when you are hit by foes. The invisibility will not be removed when you attack or take damage, but it will wear off after 10 seconds."),
	}
}


// Template: IncinerationGuard
// Usage: {{IncinerationGuard}}
func parseTemplateIncinerationGuard(raw string) *api.Enchantment {
	const prefix = "{{IncinerationGuard"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:  "Incineration Guard",
		Notes: new("When the wearer of this item is successfully attacked in melee, this destructive power occasionally comes to the surface, devastating enemies with massive fire damage."),
	}
}


func parseTemplateIceBarrier(raw string) *api.Enchantment {
	name := "Ice Barrier"
	amount := "15"

	if strings.Contains(raw, "|Legendary") {
		name = "Legendary Ice Barrier"
		amount = "150"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(fmt.Sprintf("When struck in combat, there is a small chance you will be shielded by conjured ice, granting you +%s Temporary Hit Points. These Temporary Hit Points last 1 minute or until depleted.", amount)),
	}
}


func parseTemplateIceShardsGuard(raw string) *api.Enchantment {
	const template = "IceShardsGuard"
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

	name := "Ice Shards Guard"
	if variant == "legendary" {
		name = "Legendary Ice Shards Guard"
	}

	const notes = "This item stores the pitiless immovable power of the ice deep within. When the wearer of this item is successfully attacked in melee, this power occasionally comes to the surface, dealing an incredible amount of Cold damage to the attacker."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateIncrediblePotential(raw string) *api.Enchantment {
	const template = "IncrediblePotential"
	const prefix = "{{" + template
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Incredible Potential"
	notes := "When this ring is combined with 9 Shavarath War Trophies and an Imbued Shard of Great Power in an Alter of Subjugation, its full potential will be revealed."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}


func parseTemplateIncineration(raw string) *api.Enchantment {
	const prefix = "{{Incineration"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	typ := strings.ToLower(strings.TrimSpace(inner))
	name := "Incineration"
	notes := "This weapon stores the power of a raging inferno deep within. Occasionally, this destructive power comes to the surface, devastating enemies with massive fire damage."

	switch typ {
	case "greater":
		name = "Greater Incineration"
		notes += " This damage will be dealt more often that a standard Incineration weapon."
	case "overwhelming":
		name = "Overwhelming Incineration"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateDragonshardFocus parses `{{DragonshardFocus|dragonmark}}`.

func parseTemplateIdentityCrisis(raw string) *api.Enchantment {
	const prefix = "{{IdentityCrisis"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	name := "Identity Crisis"
	notes := "Enemies hit by this weapon are plagued by visions of their past and future selves, significantly slowing their movements."

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateMasterwork parses `{{Masterwork}}`.

func parseTemplateImpact(raw string) *api.Enchantment {
	const prefix = "{{Impact"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	magnitude := "I"
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := stripBrackets(parts[0])
			if v != "" {
				magnitude = v
			}
		}
	}

	var name string
	if strings.EqualFold(magnitude, "I") {
		name = "Impact"
	} else {
		name = "Impact " + magnitude
	}

	baseNotesStart := "Passive: The base critical threat range is doubled. "
	baseNotesEnd := "This does not stack with the Improved Critical Feat. Vorpal strikes by this weapon also bypass all Fortification."

	var mid string
	switch strings.ToLower(magnitude) {
	case "ii":
		mid = "This weapon deals an additional +0.5[W], and the base critical threat range is doubled. "
	case "iii":
		mid = "This weapon deals an additional +1[W], and the base critical threat range is doubled. "
	case "iv":
		mid = "This weapon deals an additional +1.5[W], and the base critical threat range is doubled. "
	case "v":
		mid = "This weapon deals an additional +2[W], and the base critical threat range is doubled. "
	}

	notes := baseNotesStart + mid + baseNotesEnd

	return &api.Enchantment{
		Name:  name,
		Notes: &notes,
	}
}

// parseTemplateFracturing parses `{{Fracturing|(Enhancement Amount)|(Sides)|(Title)}}`.

func parseTemplateIriansMight() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Irian's Might",
		Notes: new("If Quarterstaves are you favored weapon, whenever you Turn Undead, you become Favored by Irian, increasing your Fire and Light Spell Critical Damage by 5% (Quality Bonus) for 20 seconds."),
	}
}

// parseTemplateInflictBlight handles Template:InflictBlight

func parseTemplateInflictBlight() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Inflict Blight",
		Notes: new("Rarely, this power will come to the surface, attempting to melt enemies struck with Acid, Negative, Poison, or Evil spells by dealing significant Acid damage over time."),
	}
}

// parseTemplateRockslide handles Template:Rockslide

func parseTemplateInspirationoftheInferno() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Inspiration of the Inferno",
		Notes: new("While this Fiddle is equipped, you will use it to perform your Bardic Music."),
	}
}

// parseTemplateBaneOfTheDepths handles Template:BaneOfTheDepths
