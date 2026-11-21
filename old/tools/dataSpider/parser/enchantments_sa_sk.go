package parser

import (
	"fmt"
	"strings"
	"github.com/sirupsen/logrus"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	api "compendium-crawler-go/api"
)

func parseTemplateSave(rawSaveValue string) *api.Enchantment {
	const prefix = "{{Save|"
	const suffix = "}}"

	if !strings.HasPrefix(rawSaveValue, prefix) || !strings.HasSuffix(rawSaveValue, suffix) {
		return nil
	}

	paramList := rawSaveValue[len(prefix) : len(rawSaveValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Save Type)|(Enhancement Amount)|(Bonus Type)|(Title)

	// Ensure minimum required fields are present
	if len(parts) < 2 {
		return nil // Not enough data for Amount and Type
	}

	amount := stripBrackets(parts[1])
	if amount == "" {
		return nil // Amount is required
	}

	saveType := stripBrackets(parts[0])

	var bonusType string
	// 3. Bonus Type (Optional, Index 2 - defaults to Resistance if empty)
	if len(parts) >= 3 {
		value := stripBrackets(parts[2])
		if value == "" {
			bonusType = "Resistance"
		} else {
			bonusType = value
		}
	} else {
		bonusType = "Resistance" // Default value
	}

	if strings.ToLower(bonusType) == "insightful" {
		bonusType = "Insight"
	}

	// 4. Title (Optional, Index 3) - overrides the standard Name if present
	var name string
	if len(parts) >= 4 && stripBrackets(parts[3]) != "" {
		name = stripBrackets(parts[3]) // Use custom title
	} else {
		name = mapSaveTypeToName(saveType) // Use standardized name
	}

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
	}
}


func parseTemplateSkill(rawSkillValue string) *api.Enchantment {
	const prefix = "{{Skill|"
	const suffix = "}}"
	const defaultBonusType = "Competence"

	if !strings.HasPrefix(rawSkillValue, prefix) || !strings.HasSuffix(rawSkillValue, suffix) {
		return nil
	}

	paramList := rawSkillValue[len(prefix) : len(rawSkillValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// 1. Skill (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	skillName := stripBrackets(parts[0])
	if skillName == "" {
		return nil
	}

	var amount string
	var bonusType string

	// 2. Enhancement Amount (Required, Index 1)
	if len(parts) >= 2 {
		amount = stripBrackets(parts[1])
	}

	// 3. Bonus Type (Optional, Index 2 - defaults to Competence)
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

	return &api.Enchantment{
		Name:      "Skill: " + skillName,
		Amount:    amount,
		BonusType: bonusType,
		// SkillName field is now omitted
	}
}


func parseTemplateSheltering(rawShelteringValue string) []*api.Enchantment {
	const prefix = "{{Sheltering|"
	const suffix = "}}"
	const defaultRating = "Both"           // Default from documentation
	const defaultBonusType = "Enhancement" // Default from documentation

	var output []*api.Enchantment

	if !strings.HasPrefix(rawShelteringValue, prefix) || !strings.HasSuffix(rawShelteringValue, suffix) {
		return nil
	}

	paramList := rawShelteringValue[len(prefix) : len(rawShelteringValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Documentation: (Enhancement Amount)|(Rating)|(Bonus Type)|(Title)|(Text)

	var amount string
	var rating string
	var bonusType string

	// 1. Enhancement Amount (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	amount = stripBrackets(parts[0])
	if amount == "" {
		return nil
	}

	// 2. Rating (Index 1) - Default to "Both"
	if len(parts) >= 2 {
		rating = stripBrackets(parts[1])
		if rating == "" {
			rating = defaultRating
		}
	} else {
		rating = defaultRating
	}

	// 3. Bonus Type (Index 2) - Default to "Enhancement"
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
	}

	// We ensure "Both" is formatted correctly if it was the default or specified.
	if strings.ToLower(rating) == "both" {
		output = append(output, &api.Enchantment{
			Name:      "Physical Resistance Rating",
			Amount:    amount,
			BonusType: bonusType,
		})
		output = append(output, &api.Enchantment{
			Name:      "Magic Resistance Rating",
			Amount:    amount,
			BonusType: bonusType,
		})
	} else {
		output = append(output, &api.Enchantment{
			Name:      rating + " Resistance Rating",
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return output
}


func parseTemplateSeeker(rawSeekerValue string) []*api.Enchantment {
	const prefix = "{{Seeker|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawSeekerValue, prefix) || !strings.HasSuffix(rawSeekerValue, suffix) {
		return nil
	}

	paramList := rawSeekerValue[len(prefix) : len(rawSeekerValue)-len(suffix)]
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

	var enchantments []*api.Enchantment

	// --- CRITICAL: Generate Two Separate Enchantments ---

	// 1. Critical Accuracy (Confirm Critical Hits)
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Critical Accuracy",
		Amount:    amount,
		BonusType: bonusType,
	})

	// 2. Critical Damage (Damage on Critical Hits)
	enchantments = append(enchantments, &api.Enchantment{
		Name:      "Critical Damage",
		Amount:    amount,
		BonusType: bonusType,
	})

	return enchantments
}


func parseTemplateSkillGroupBonus(rawSGBValue string) []*api.Enchantment {
	const prefix = "{{SkillGroupBonus|"
	const suffix = "}}"
	const defaultBonusType = "Competence" // Default from documentation

	if !strings.HasPrefix(rawSGBValue, prefix) || !strings.HasSuffix(rawSGBValue, suffix) {
		return nil
	}

	paramList := rawSGBValue[len(prefix) : len(rawSGBValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	// Docs: (Skill Group)|(Amount)|(Bonus Type)|(Title)

	// 1. Skill Group (Required, Index 0)
	if len(parts) < 1 {
		return nil
	}
	groupNameRaw := stripBrackets(parts[0])
	if groupNameRaw == "" {
		return nil
	}

	// 2. Amount (Required, Index 1)
	if len(parts) < 2 {
		return nil
	}
	amount := stripBrackets(parts[1])
	if amount == "" {
		return nil
	}

	var bonusType string
	var title string // Custom title can override the default group name.

	// 3. Bonus Type (Optional, Index 2 - defaults to Competence)
	if len(parts) >= 3 {
		bonusType = stripBrackets(parts[2])
		if bonusType == "" {
			bonusType = defaultBonusType
		}
	} else {
		bonusType = defaultBonusType
	}

	// 4. Title (Optional, Index 3)
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}

	var enchantments []*api.Enchantment

	// --- Determine list of skills to generate ---

	// Normalize group name and look up the skill list
	skillList, exists := skillGroupsMap[groupNameRaw]
	if !exists {
		// If the group isn't defined, treat it as a single raw entry
		logrus.Warnf("Skill Group '%s' not recognized for expansion.\n", groupNameRaw)
		return nil
	}

	// --- Generate Enchantment Objects for each Skill ---

	for _, skill := range skillList {
		// Generate the name: Use custom title if provided, otherwise format the skill name.
		name := title
		if name == "" {
			name = fmt.Sprintf("Skill: %s", skill)
		}

		// Use the existing Skill parser's naming convention where possible, but here we enforce
		// a simple, uniform name for the skill group bonus.

		enchantments = append(enchantments, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}

	return enchantments
}


func parseTemplateShockwave(rawSWValue string) *api.Enchantment {
	const prefix = "{{Shockwave|"
	const suffix = "}}"
	const baseName = "Shockwave"

	var shockwaveType = "basic" // Default to basic if no argument or argument is blank

	if strings.TrimSpace(rawSWValue) == "{{Shockwave}}" {
		// Argument-less call defaults to "basic"
	} else if strings.HasPrefix(rawSWValue, prefix) && strings.HasSuffix(rawSWValue, suffix) {
		paramList := rawSWValue[len(prefix) : len(rawSWValue)-len(suffix)]
		parts := strings.Split(paramList, "|")

		// 1. Type (Index 0)
		if len(parts) >= 1 {
			val := strings.TrimSpace(parts[0])
			if val != "" {
				shockwaveType = strings.ToLower(val)
			}
		}
	} else {
		return nil // Invalid format
	}

	// Look up the fixed values
	lookup, exists := shockwaveTypeMap[shockwaveType]
	if !exists {
		lookup = shockwaveTypeMap["basic"] // Fallback
	}

	var name string

	// Construct Name: [Prefix] Shockwave
	if lookup.NamePrefix != "" {
		name = lookup.NamePrefix + " " + baseName
	} else {
		name = baseName
	}

	return &api.Enchantment{
		Name: name,
		// Use Element to store the damage type
		Element: lookup.DamageElement,
		// All other fields remain empty.
	}
}


func parseTemplateSealedInMist() *api.Enchantment {
	const templateName = "Sealed in Mist"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}


// Template:SealedInFire
// No parameters. Documentation indicates it simply marks the item as
// "Sealed in Fire" with explanatory upgrade text elsewhere. We capture
// this as a simple named enchantment.
func parseTemplateSealedInFire() *api.Enchantment {
	return &api.Enchantment{
		Name: "Sealed in Fire",
		// All other fields remain empty.
	}
}


// Template:ShadowStriker
// No parameters. As per documentation screenshot, this template confers four effects:
//   - +3% Profane bonus to Doublestrike
//   - +3% Profane bonus to Doubleshot
//   - +15% Enhancement bonus to Melee Attack Speed
//   - +20 Enhancement bonus to Ranged Attack (attack rolls)
//
// Returns a slice of standard enchantments representing these effects.
func parseTemplateShadowStriker() []*api.Enchantment {
	return []*api.Enchantment{
		{ // Doublestrike
			Name:      "Doublestrike Chance",
			Amount:    "3%",
			BonusType: "Profane",
		},
		{ // Doubleshot
			Name:      "Doubleshot Chance",
			Amount:    "3%",
			BonusType: "Profane",
		},
		{ // Melee attack speed
			Name:      "Melee Attack Speed",
			Amount:    "15%",
			BonusType: "Enhancement",
		},
		{ // Ranged attack roll bonus
			Name:      "Attack Rolls (Ranged)",
			Amount:    "20",
			BonusType: "Enhancement",
		},
	}
}


func parseTemplateSealedInGloom() *api.Enchantment {
	const templateName = "Sealed in Gloom"

	// Documentation: No arguments, sets the Name.

	return &api.Enchantment{
		Name: templateName,
		// All other fields remain empty.
	}
}


// Template:Sacred
// Usage: {{Sacred|(Amount)}}
// - Amount: Effective level bonus to Turning checks; defaults to 2 if omitted.
// Output: single standard enchantment with BonusType "Sacred" and the Amount value.
// Notes capture the concise rule text from the docs.
func parseTemplateSacred(raw string) *api.Enchantment {
	const prefix = "{{Sacred"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	// Extract inner params (Amount is optional)
	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	amount := "2" // default per documentation
	if inner != "" {
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			v := stripBrackets(parts[0])
			if v != "" {
				amount = v
			}
		}
	}

	return &api.Enchantment{
		Name:      "Turn Undead Level",
		Amount:    amount,
		BonusType: "Sacred",
		Notes:     new("Assists only wearers who can turn undead; increases effective level for turning check by +" + amount + "."),
	}
}


func parseTemplateShatter(rawShatterValue string) *api.Enchantment {
	const prefix = "{{Shatter|"
	const suffix = "}}"
	const defaultBonusType = "Enhancement" // Default from documentation

	if !strings.HasPrefix(rawShatterValue, prefix) || !strings.HasSuffix(rawShatterValue, suffix) {
		return nil
	}

	paramList := rawShatterValue[len(prefix) : len(rawShatterValue)-len(suffix)]
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

	var name string
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

	// Name format: [Bonus Type] Shatter (to distinguish it from generic Sunder DC)
	if strings.ToLower(bonusType) == strings.ToLower(defaultBonusType) {
		name = "Tactical DC: Sunder"
	} else {
		name = "Tactical DC: " + bonusType + " Sunder"
	}

	// For clarity, we map the effect name to the actual maneuver DC it affects.
	// The final name uses the template's common name for recognition.

	return &api.Enchantment{
		Name:      name,
		Amount:    amount,
		BonusType: bonusType,
		// No other fields are needed.
	}
}


// Template:Salt
// Usage: {{Salt|(Type)|(Title)}}
// Behavior mirrors Template:Steam:
// - If Title present → use it exactly.
// - If Type blank or "Basic" → base name "Salt".
// - Else → "<Title-Cased Type> Salt".
func parseTemplateSalt(raw string) *api.Enchantment {
	const prefix = "{{Salt"
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
		return &api.Enchantment{Name: "Salt"}
	default:
		name := cases.Title(language.English).String(t) + " Salt"
		return &api.Enchantment{Name: name}
	}
}


func parseTemplateSetItemEnchantment(raw string) *api.Enchantment {
	// {{SetItemEnchantment|Enchantment Name|Modifier (optional)|Display Name (optional)}}
	parts := strings.Split(raw, "|")
	if len(parts) < 2 {
		return nil
	}
	name := strings.TrimSpace(parts[1])
	// Remove "(Enchantment)" suffix if present
	name = strings.TrimSuffix(name, " (Enchantment)")

	res := &api.Enchantment{
		Name: name,
	}
	if len(parts) >= 3 && strings.TrimSpace(parts[2]) != "" {
		res.Amount = strings.TrimSpace(parts[2])
	}
	return res
}


// Template:Shattermantle
// Usage: {{Shattermantle|(Type)}}
// - Type: None (default), Improved
func parseTemplateShattermantle(raw string) *api.Enchantment {
	const prefix = "{{Shattermantle"
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
	shatterType := ""
	if len(parts) >= 1 {
		shatterType = strings.TrimSpace(parts[0])
	}

	amount := "3"
	if strings.EqualFold(shatterType, "Improved") {
		amount = "6"
	}

	return &api.Enchantment{
		Name:   "Spell Resistance (Reduction)",
		Amount: amount,
		Notes:  new(fmt.Sprintf("Reduces opponent's spell resistance by %s for 9 seconds.", amount)),
	}
}


func parseTemplateSealedInUndeath() *api.Enchantment {
	note := "This item seethes with a sealed power. It can have its power unsealed at the Ritual Table, adding one effect. Attempting to add another will remove the original."
	return &api.Enchantment{
		Name:  "Sealed in Undeath",
		Notes: new(note),
	}
}


// Template: ShockingBlow
// Usage: {{ShockingBlow|(Style)}}
func parseTemplateShockingBlow(raw string) *api.Enchantment {
	const prefix = "{{ShockingBlow"
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
	style := ""
	if len(parts) > 0 {
		style = strings.TrimSpace(parts[0])
	}

	name := "Shocking Blow"
	note := "This item is charged with electricity. When in melee, on an attack roll of 20 which is confirmed as a critical hit it will punish the target with a large electric show (10d6 electric damage). A successful Reflex DC: 22 reduces this damage by half."

	if strings.EqualFold(style, "Greater") {
		name = "Greater Shocking Blow"
		note = "This item is charged with electricity. When in melee, on an attack roll of 20 which is confirmed as a critical hit it will punish the target with a large electric show (20d6 electric damage)."
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(note),
	}
}


// Template: ScorchingFlame
// Usage: {{ScorchingFlame}}
func parseTemplateScorchingFlame(raw string) *api.Enchantment {
	const prefix = "{{ScorchingFlame"
	const suffix = "}}"
	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	return &api.Enchantment{
		Name:      "Scorching Flame",
		Amount:    "4d4",
		BonusType: "On-hit (2% Chance) (per Weapon ML)",
		Notes:     new("Adds a 2% Chance On Hit to cause a blast of flame to scorcher your target, dealing 4d4 Fire Damage per Minimum Level of the weapon to all nearby enemies."),
	}
}


func parseTemplateScarabofProtectionWard() []*api.Enchantment {
	const note = "This effect absorbs negative energy, death and energy drain effect. It has 12 charges and does not recharge."
	return []*api.Enchantment{
		{
			Name:  "Absorption: Negative Energy (Limited Charges)",
			Notes: new(note),
		},
		{
			Name: "Absorption: Energy Drain (Limited Charges)",
		},
		{
			Name: "Absorption: Death Effects (Limited Charges)",
		},
	}
}


func parseTemplateSecretDoorDetection() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Secret Door Detection",
		Notes: new("This item grants the ability to reveal secret and hidden doors."),
	}
}


func parseTemplateSinkLikeaBrick() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Sink Like a Brick",
		Notes: new("Sink Like a Brick: These boots are made of concrete. You sink in water."),
	}
}


func parseTemplateScallawagLuck(raw string) *api.Enchantment {
	const template = "ScallawagLuck"
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
	magnitude := "I"
	if len(parts) >= 1 {
		magnitude = strings.TrimSpace(parts[0])
	}

	percentage := "10%"
	switch strings.ToUpper(magnitude) {
	case "I":
		percentage = "10%"
	case "II":
		percentage = "15%"
	case "III":
		percentage = "20%"
	case "IV":
		percentage = "25%"
	case "V":
		percentage = "30%"
	case "VI":
		percentage = "35%"
	}

	return &api.Enchantment{
		Name:  "Scallawag's Luck " + magnitude,
		Notes: new(fmt.Sprintf("While in Smuggler's Rest, you gain %s additional doubloons when fighting pirates.", percentage)),
	}
}


func parseTemplateShadowblade(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{Shadowblade", "Shadowblade", "This blade is made of pure force and is surprisingly light to the touch. It bypasses the Incorporeal chances of Ethereal monsters innately.")
}

// parseTemplateSkybreaker parses `{{Skybreaker}}`.

func parseTemplateSkybreaker(raw string) *api.Enchantment {
	return parseSimpleTemplate(raw, "{{Skybreaker", "Skybreaker", "On Hit: 3d6 Electric damage. On Critical Hit: 10d6 additional Sonic damage. On Vorpal Hit: 60d2 additional Electrical damage to your target, plus a shockwave that deals an additional 45d2 Sonic damage to all nearby foes.")
}

// parseTemplateWildFrenzy parses `{{WildFrenzy}}`.

func parseTemplateSirocco(raw string) *api.Enchantment {
	const prefix = "{{Sirocco"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return nil
	}

	content := strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix)
	content = strings.TrimPrefix(content, "|")
	parts := splitParams(content)

	siroType := strings.TrimSpace(parts[0])

	name := "Sirocco"
	notes := "A critical hit with this weapon causes a whirlwind of desert sand to swirl about the target, temporarily blinding it. A successful Reflex DC: 20 save prevents the effect."

	switch {
	case strings.EqualFold(siroType, "Legendary"):
		name = "Legendary Sirocco"
		notes = "On hit, this has a chance of blinding your enemies with whirling sand. Struck enemies must make a Fortitude DC: 100 save or be blinded."
	case strings.EqualFold(siroType, "Custom"):
		if len(parts) >= 2 {
			dc := strings.TrimSpace(parts[1])
			name = "Sirocco +" + dc
			notes = "On a critical hit, a creature struck by this weapon must succeed on a Reflex DC: " + dc + " save or be blinded for 6 seconds."
		}
	case strings.EqualFold(siroType, "Greater"):
		name = "Greater Sirocco"
		notes = "A critical hit with this weapon causes a whirlwind of desert sand to swirl about the target, temporarily blinding it. A successful Reflex DC: 38 save prevents the effect."
	case siroType != "":
		name = siroType + " Sirocco"
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateBoneBreaking handles Template:BoneBreaking

func parseTemplateShieldedbyMoonlight() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Shielded by Moonlight",
		Notes: new("Being struck in melee has a small chance to return some lost Hitpoints and Spellpoints to you. Offensive spells have a chance to grant 100 temporary spellpoints. This has a one minute cooldown."),
	}
}

// parseTemplateEnervation handles Template:Enervation

func parseTemplateShieldBash(raw string) *api.Enchantment {
	const prefix = "{{ShieldBash|"
	const suffix = "}}"

	if !strings.HasPrefix(raw, prefix) || !strings.HasSuffix(raw, suffix) {
		return nil
	}

	paramList := raw[len(prefix) : len(raw)-len(suffix)]

	// Respect nested templates when splitting by pipe
	var parts []string
	var cur strings.Builder
	depth := 0
	for _, r := range paramList {
		if r == '{' {
			depth++
		} else if r == '}' {
			if depth > 0 {
				depth--
			}
		}
		if r == '|' && depth == 0 {
			parts = append(parts, strings.TrimSpace(cur.String()))
			cur.Reset()
		} else {
			cur.WriteRune(r)
		}
	}
	parts = append(parts, strings.TrimSpace(cur.String()))

	// Docs: {{ShieldBash|(Type)|(Enhancement Amount)|(Chance increase for both)|(Title)|(Bonus Type)}}
	// Possible Type Values: Chance, Damage, Improved, Both

	if len(parts) < 1 {
		return nil
	}

	typeName := strings.ToLower(parts[0])
	enhancementAmount := ""
	if len(parts) >= 2 {
		enhancementAmount = stripBrackets(parts[1])
	}
	chanceIncreaseBoth := ""
	if len(parts) >= 3 {
		chanceIncreaseBoth = stripBrackets(parts[2])
	}
	title := ""
	if len(parts) >= 4 {
		title = stripBrackets(parts[3])
	}
	bonusType := "Enhancement"
	if len(parts) >= 5 && parts[4] != "" {
		bonusType = stripBrackets(parts[4])
	}

	var name string
	var notes string

	switch typeName {
	case "chance":
		name = bonusType + " Shield Bashing +" + enhancementAmount + "%"
		if bonusType == "Enhancement" {
			name = "Shield Bashing +" + enhancementAmount + "%"
		}
		notes = "+" + enhancementAmount + "% " + bonusType + " bonus to increased chance of Secondary Shield Bash."

	case "damage":
		name = "Bashing"
		// If enhancementAmount contains {{Dice}}, parse it
		notesValue := enhancementAmount
		if strings.Contains(enhancementAmount, "{{Dice") {
			diceData := ParseTemplateDice(enhancementAmount)
			notesValue = diceData.Raw
		}
		notes = "This shield is exceptionally durable and dense, and does and additional " + notesValue + " damage when use to shield bash."

	case "improved":
		name = "Improved Bashing " + enhancementAmount
		notes = "On Shield Bash: +5d4 Bludgeoning damage. On Melee Hit: +20% Chance to automatically hit your enemy with a Shield Bash attack."

	case "both":
		name = bonusType + " Shield Bashing +" + enhancementAmount + "%"
		if bonusType == "Enhancement" {
			name = "Shield Bashing +" + enhancementAmount + "%"
		}
		notes = "+" + enhancementAmount + "% " + bonusType + " bonus to increased chance of Secondary Shield Bash. +" + chanceIncreaseBoth + "% " + bonusType + " bonus to increased chance of Secondary Shield Bash."

	default:
		name = "Shield Bash"
		notes = "UNKNOWN Entry, Update the Template"
	}

	if title != "" {
		name = title
	}

	return &api.Enchantment{
		Name:  name,
		Notes: new(notes),
	}
}

// parseTemplateForgedLightning handles Template:ForgedLightning

func parseTemplateSingleMindedness() *api.Enchantment {
	return &api.Enchantment{
		Name:  "Single-Mindedness",
		Notes: new("This item drives your magic towards chaos, and you cannot focus as well on the nuances of subtler spells, -2 DCs on your enchantment spells."),
	}
}

// parseTemplateDragonsEdge handles Template:DragonsEdge
