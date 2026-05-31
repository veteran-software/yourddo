package parser

import (
	"compendium-crawler-go/api"
	"regexp"
	"strconv"
	"strings"
)

// ParseFiligreeSets parses the wikitext from the Filigree_Item_Sets page.
func ParseFiligreeSets(wikitext string) []api.FiligreeSet {
	var sets []api.FiligreeSet

	// We look for table rows |-|{{FiligreeTitle|...}}|...
	// The rows usually start with |-
	// Then a cell with {{FiligreeTitle|Set Name}}
	// Then a cell with the description, often starting with <section begin=... />

	// Let's split by |- to get rows
	rows := strings.Split(wikitext, "|-")

	reTitle := regexp.MustCompile(`\{\{FiligreeTitle\|([^}|]+)\}\}`)
	reThreshold := regexp.MustCompile(`(?m)^\s*:\s*(\d+)\s+Pieces?\s+Equipped:\s*(.*)$`)

	for _, row := range rows {
		titleMatch := reTitle.FindStringSubmatch(row)
		if len(titleMatch) < 2 {
			continue
		}

		setName := strings.TrimSpace(titleMatch[1])
		set := api.FiligreeSet{
			Name: setName,
		}

		// Now find thresholds in this row
		// Thresholds look like ": 2 Pieces Equipped: +10 Natural Armor"
		thresholdMatches := reThreshold.FindAllStringSubmatch(row, -1)
		for _, m := range thresholdMatches {
			if len(m) < 3 {
				continue
			}

			count, err := strconv.Atoi(m[1])
			if err != nil {
				continue
			}

			rawEffect := strings.TrimSpace(m[2])
			// Some effects might have trailing <section end=... />
			if idx := strings.Index(rawEffect, "<section"); idx != -1 {
				rawEffect = strings.TrimSpace(rawEffect[:idx])
			}

			bonus := api.FiligreeSetBonus{
				Threshold: count,
			}

			// Parse the effect text for enchantments
			enchantments := ParseEnchantments(rawEffect, "Filigree")

			// If the rawEffect starts with something like "+10%" or "+2", and the first enchantment
			// has no amount, let's try to extract it and assign it.
			reLeadingAmount := regexp.MustCompile(`^([+-]?\d+%?)\s+`)
			var leadingAmount string
			if m := reLeadingAmount.FindStringSubmatch(rawEffect); len(m) >= 2 {
				leadingAmount = m[1]
			}

			if len(enchantments) > 0 {
				for i, e := range enchantments {
					if i == 0 && e.Amount == "" && leadingAmount != "" {
						e.Amount = leadingAmount
					}
					// Split names like "Dodge and Maximum Dodge"
					names := splitMultiNames(e.Name, setName)
					for _, name := range names {
						ecopy := e
						ecopy.Name = name
						bonus.Enhancements = append(bonus.Enhancements, mapEnchantmentToPartial(ecopy))
					}
				}
			} else {
				// If no templates found, try to see if it's a simple "+X Name" or similar
				// before defaulting to Description.
				reSimple := regexp.MustCompile(`^([+-]?\d+%?)\s+(.*)$`)
				if mSimple := reSimple.FindStringSubmatch(rawEffect); len(mSimple) >= 3 {
					// Extra check for things like "+50 Electric Spellpower" which are very common
					name := mSimple[2]
					amount := mSimple[1]

					// If it ends with Spellpower, normalize it
					if strings.HasSuffix(strings.ToLower(name), " spellpower") {
						typeStr := strings.TrimSpace(name[:len(name)-len(" spellpower")])
						name = "Spell Power: " + typeStr
					}

					names := splitMultiNames(name, setName)
					for _, n := range names {
						bonus.Enhancements = append(bonus.Enhancements, mapEnchantmentToPartial(api.Enchantment{
							Name:   n,
							Amount: amount,
						}))
					}
				} else {
					// Fallback for names starting with numbers but no explicit + or -
					reSimpleNoSign := regexp.MustCompile(`^(\d+%?)\s+(.*)$`)
					if mSimple := reSimpleNoSign.FindStringSubmatch(rawEffect); len(mSimple) >= 3 {
						name := mSimple[2]
						amount := mSimple[1]
						if strings.HasSuffix(strings.ToLower(name), " spellpower") {
							typeStr := strings.TrimSpace(name[:len(name)-len(" spellpower")])
							name = "Spell Power: " + typeStr
						}
						names := splitMultiNames(name, setName)
						for _, n := range names {
							bonus.Enhancements = append(bonus.Enhancements, mapEnchantmentToPartial(api.Enchantment{
								Name:   n,
								Amount: amount,
							}))
						}
					} else {
						// If no patterns match, treat as raw text description
						// BUT check if it's a long-form text that should be in notes
						normalized := normalizeFiligreeName(rawEffect, setName)
						if normalized != rawEffect {
							// If normalization changed it, it's likely a known enchantment now
							names := splitMultiNames(normalized, setName)
							for _, n := range names {
								bonus.Enhancements = append(bonus.Enhancements, mapEnchantmentToPartial(api.Enchantment{
									Name: n,
								}))
							}
						} else if len(rawEffect) > 30 || strings.Contains(rawEffect, "Melee and Ranged attacks") || strings.Contains(rawEffect, "chance to reduce") || strings.Contains(rawEffect, "Stacks with other sources") {
							bonus.Enhancements = append(bonus.Enhancements, api.PartialEnhancementOut{
								Notes: rawEffect,
							})
						} else {
							bonus.Enhancements = append(bonus.Enhancements, api.PartialEnhancementOut{
								Description: rawEffect,
							})
						}
					}
				}
			}

			set.Bonuses = append(set.Bonuses, bonus)
		}

		if len(set.Bonuses) > 0 {
			sets = append(sets, set)
		}
	}

	return sets
}

// splitMultiNames handles splitting and normalization of multi-attribute names.
func splitMultiNames(name string, setName string) []string {
	// Normalize the name first
	name = normalizeFiligreeName(name, setName)

	// Spell DC special case: if it's just "Spell DC", "Spell DCs", or "DCs of all spells", return all schools
	trimmedName := strings.TrimSpace(name)
	if strings.EqualFold(trimmedName, "spell dc") ||
		strings.EqualFold(trimmedName, "spell dcs") ||
		strings.EqualFold(trimmedName, "DCs of all spells") ||
		strings.HasSuffix(strings.ToLower(trimmedName), "dcs of all spells") {
		var res []string
		for _, s := range spellSchools {
			res = append(res, "Spell DC: "+s)
		}
		return res
	}

	// Handle "all Saving Throws"
	if strings.Contains(strings.ToLower(trimmedName), "all saving throws") {
		return []string{"Fortitude Saving Throws", "Reflex Saving Throws", "Will Saving Throws"}
	}

	// Handle "Open Locks, Disable Device, Spot, Search"
	if strings.Contains(trimmedName, "Open Locks, Disable Device, Spot, Search") {
		return []string{"Skill: Open Lock", "Skill: Disable Device", "Skill: Spot", "Skill: Search"}
	}

	// Handle "X and Y DCs" -> "Spell DC: X", "Spell DC: Y"
	reSpellDCs := regexp.MustCompile(`(?i)(.*)\s+and\s+(.*)\s+DCs?`)
	if m := reSpellDCs.FindStringSubmatch(name); len(m) >= 3 {
		school1 := strings.TrimSpace(m[1])
		school2 := strings.TrimSpace(m[2])

		// Some cases might have "to your Transmutation and Conjuration DCs"
		school1 = strings.TrimPrefix(school1, "to your ")
		school1 = strings.TrimPrefix(school1, "to the ")

		return []string{"Spell DC: " + school1, "Spell DC: " + school2}
	}

	// Handle "X, Y, and Z DCs" (3 schools)
	reSpellDCs3 := regexp.MustCompile(`(?i)(.*),\s+(.*),\s+and\s+(.*)\s+DCs?`)
	if m := reSpellDCs3.FindStringSubmatch(name); len(m) >= 4 {
		school1 := strings.TrimSpace(m[1])
		school2 := strings.TrimSpace(m[2])
		school3 := strings.TrimSpace(m[3])

		school1 = strings.TrimPrefix(school1, "to your ")
		school1 = strings.TrimPrefix(school1, "to the ")

		return []string{"Spell DC: " + school1, "Spell DC: " + school2, "Spell DC: " + school3}
	}

	// Special case: Physical and Magical Resistance Rating
	if strings.Contains(strings.ToLower(name), "physical and magical resistance rating") {
		return []string{"Physical Resistance Rating", "Magical Resistance Rating"}
	}
	if strings.Contains(strings.ToLower(name), "physical & magical resistance rating") {
		return []string{"Physical Resistance Rating", "Magical Resistance Rating"}
	}

	// Look for " and " or " & " (case-insensitive)
	lower := strings.ToLower(name)
	if strings.Contains(lower, " and ") {
		// We need to keep original casing if possible.
		re := regexp.MustCompile(`(?i)\s+and\s+`)
		split := re.Split(name, -1)
		for i := range split {
			split[i] = strings.TrimSpace(split[i])
		}
		return split
	}
	if strings.Contains(name, " & ") {
		parts := strings.Split(name, " & ")
		for i := range parts {
			parts[i] = strings.TrimSpace(parts[i])
		}
		return parts
	}
	return []string{name}
}

func normalizeFiligreeName(name string, setName string) string {
	lower := strings.ToLower(name)

	// Treachery 2 piece set give bonuses to Melee Power and Ranged Power
	if setName == "Treachery" && (strings.Contains(lower, "melee power") || strings.Contains(lower, "ranged power")) {
		return "Melee Power and Ranged Power"
	}

	// Touch of Grace 2 piece set gives a bonus to Maimum Spell Points
	if setName == "Touch of Grace" && strings.Contains(lower, "spell points") {
		return "Maximum Spell Points"
	}

	if strings.Contains(lower, "uses of wild empathy") {
		return "Wild Empathy: Max Charges"
	}
	if strings.EqualFold(name, "Universal Spell Power") {
		return "Spell Power: Universal"
	}
	if strings.Contains(lower, "you gain true seeing") {
		return "True Seeing"
	}
	if strings.Contains(lower, "lay on hands charges") {
		return "Lay on Hands: Max Charges"
	}
	if strings.Contains(lower, "displacement") && strings.Contains(lower, "stacks with other sources") {
		return "Displacement"
	}
	if strings.Contains(lower, "to the dc of assassinate") {
		return "Assassinate DCs"
	}

	// Immunity: <thing>
	if strings.HasPrefix(lower, "you are immune to ") {
		thing := name[len("you are immune to "):]
		// Capitalize first letter of thing
		if len(thing) > 0 {
			thing = strings.ToUpper(thing[:1]) + thing[1:]
		}
		return "Immunity: " + thing
	}

	return name
}

func mapEnchantmentToPartial(e api.Enchantment) api.PartialEnhancementOut {
	p := api.PartialEnhancementOut{
		Name:  e.Name,
		Bonus: e.BonusType,
	}
	if e.Amount != "" {
		// Clean up amount (e.g., "+10%" -> "10")
		cleanAmount := strings.TrimSpace(e.Amount)
		cleanAmount = strings.TrimPrefix(cleanAmount, "+")
		cleanAmount = strings.TrimPrefix(cleanAmount, "-")

		isPercent := strings.HasSuffix(cleanAmount, "%")
		cleanAmount = strings.TrimSuffix(cleanAmount, "%")

		// Try to parse as number if possible
		if val, err := strconv.ParseFloat(cleanAmount, 64); err == nil {
			if isPercent {
				p.Modifier = strconv.FormatFloat(val, 'f', -1, 64) + "%"
			} else {
				p.Modifier = val
			}
		} else {
			p.Modifier = e.Amount
		}
	}
	if e.Notes != nil {
		p.Notes = *e.Notes
	}
	return p
}
