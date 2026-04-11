package parser

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/sirupsen/logrus"

	"compendium-crawler-go/api"
)

func parseTemplateVendorPurchaseTable(rawValue string) api.DropSourceData {
	const prefix = "{{VendorPurchaseTable|"
	const suffix = "}}"

	if !strings.HasPrefix(rawValue, prefix) || !strings.HasSuffix(rawValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	// The Vendors parameter is positional (the first one after the template name)
	// For now, we extract the raw content between the pipe and the closing braces.

	// We expect the cleaned raw value to be {{VendorPurchaseTable|Vendors=...}} or {{VendorPurchaseTable|...}}

	paramList := rawValue[len(prefix) : len(rawValue)-len(suffix)]

	// Since this template is positional, the entire content is the 'Vendors' parameter.

	vendorData := api.VendorPurchaseTableData{
		// Trim any remaining whitespace or bullets from the vendor list
		VendorsRaw: strings.TrimSpace(paramList),
	}

	return api.DropSourceData{
		SourceType:  "Vendor",
		VendorTable: &vendorData,
	}
}

// splitParams splits a template parameter string into individual parameters,
// respecting nested templates {{ }} and links [[ ]].
func splitParams(params string) []string {
	var parts []string
	var cur strings.Builder
	depthBraces := 0
	depthBrackets := 0
	for _, r := range params {
		switch r {
		case '{':
			depthBraces++
			cur.WriteRune(r)
		case '}':
			if depthBraces > 0 {
				depthBraces--
			}
			cur.WriteRune(r)
		case '[':
			depthBrackets++
			cur.WriteRune(r)
		case ']':
			if depthBrackets > 0 {
				depthBrackets--
			}
			cur.WriteRune(r)
		case '|':
			if depthBraces == 0 && depthBrackets == 0 {
				parts = append(parts, cur.String())
				cur.Reset()
			} else {
				cur.WriteRune(r)
			}
		default:
			cur.WriteRune(r)
		}
	}
	parts = append(parts, cur.String())
	return parts
}

// stripWikitext removes wikitext formatting like [[Link|Text]] or [[Link]],
// returning just the visible text.
func stripWikitext(s string) string {
	s = strings.TrimSpace(s)
	// Handle [[Link|Text]]
	for {
		start := strings.Index(s, "[[")
		if start == -1 {
			break
		}
		end := strings.Index(s[start:], "]]")
		if end == -1 {
			break
		}
		end += start // Absolute index

		content := s[start+2 : end]
		visible := content
		if pipe := strings.Index(content, "|"); pipe != -1 {
			visible = content[pipe+1:]
		}

		s = s[:start] + visible + s[end+2:]
	}

	// Also handle any remaining single brackets just in case, though usually not needed for this issue
	s = strings.ReplaceAll(s, "[", "")
	s = strings.ReplaceAll(s, "]", "")

	return strings.TrimSpace(s)
}

// parseTemplateDropLocation extracts the positional values for {{DropLocation|...}}
func parseTemplateDropLocation(rawDropValue string) api.DropSourceData {
	const prefix = "{{DropLocation|"
	const suffix = "}}"

	if !strings.HasPrefix(rawDropValue, prefix) || !strings.HasSuffix(rawDropValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawDropValue[len(prefix) : len(rawDropValue)-len(suffix)]
	parts := splitParams(paramList)

	drop := api.DropSourceData{SourceType: "Quest"} // Set Type

	// Positional mapping
	if len(parts) >= 1 {
		drop.QuestWildernessChain = stripWikitext(parts[0])
	}
	if len(parts) >= 2 {
		drop.WhichChestPerson = stripWikitext(parts[1])
	}
	if len(parts) >= 3 {
		drop.TitleForLink = stripWikitext(parts[2])
	}
	if len(parts) >= 4 {
		drop.Difficulty = stripWikitext(parts[3])
	}
	if len(parts) >= 5 {
		drop.ExcludeAsQuestLoot = stripWikitext(parts[4])
	}

	return drop
}

func parseTemplateAdventurePackDrop(rawDropValue string) api.DropSourceData {
	const prefix = "{{AdventurePackDrop|"
	const suffix = "}}"

	if !strings.HasPrefix(rawDropValue, prefix) || !strings.HasSuffix(rawDropValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawDropValue[len(prefix) : len(rawDropValue)-len(suffix)]
	parts := splitParams(paramList)

	drop := api.DropSourceData{SourceType: "AdventurePack"} // Set Type

	// Documentation: (Adventure pack)|(Which Chest/Person)|(Difficulty)|(Include as Quest Loot)

	if len(parts) >= 1 {
		drop.AdventurePack = stripWikitext(parts[0])
	} // Adventure pack
	if len(parts) >= 2 {
		drop.WhichChestPerson = stripWikitext(parts[1])
	} // Which Chest/Person
	if len(parts) >= 3 {
		drop.Difficulty = stripWikitext(parts[2])
	} // Difficulty
	if len(parts) >= 4 {
		drop.IncludeAsQuestLoot = stripWikitext(parts[3])
	}

	return drop
}

func parseTemplateStorePurchase(rawStoreValue string) api.DropSourceData {
	const prefix = "{{StorePurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawStoreValue, prefix) || !strings.HasSuffix(rawStoreValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawStoreValue[len(prefix) : len(rawStoreValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	store := api.DropSourceData{SourceType: "Store"} // Set Type

	// Documentation: (Which Store)|(Cost)|(Limited Time)|(Count)|(Content)

	if len(parts) >= 1 {
		store.StoreName = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		store.Cost = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		store.LimitedTime = strings.TrimSpace(parts[2])
	}
	if len(parts) >= 4 {
		store.Count = strings.TrimSpace(parts[3])
	}
	if len(parts) >= 5 {
		store.Content = strings.TrimSpace(parts[4])
	}

	return store
}

func parseTemplateItemIconicReceived(rawDropValue string) api.DropSourceData {
	const prefix = "{{ItemIconicReceived|"
	const suffix = "}}"

	if !strings.HasPrefix(rawDropValue, prefix) || !strings.HasSuffix(rawDropValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawDropValue[len(prefix) : len(rawDropValue)-len(suffix)]
	parts := splitParams(paramList)

	drop := api.DropSourceData{SourceType: "Iconic (Starter Gear)"} // Set Type

	// Documentation: (Iconic Race)|(Level)|(Count)

	if len(parts) >= 1 {
		drop.IconicRace = stripWikitext(parts[0])
	} // Iconic Race
	if len(parts) >= 2 {
		drop.Level = stripWikitext(parts[1])
	} // Level
	if len(parts) >= 3 {
		drop.ItemCount = stripWikitext(parts[2])
	} // Count (using ItemCount to avoid conflict with Count in StorePurchase)

	return drop
}

// ConvertItemToJSON (MODIFIED to use DropSourceData)
func ConvertItemToJSON(pageTitle string, fields map[string]string) api.ItemData {
	data := api.ItemData{
		PageTitle: pageTitle,
	}

	// --- NESTED PARSERS ---
	if val, ok := fields["basevalue"]; ok {
		data.BaseValue = parseTemplatePrice(val)
	}
	if val, ok := fields["droplocation"]; ok {
		allDrops := ParseMultiTemplateDropLocation(val)
		data.DropLocationRaw = val // Store raw for completeness/debug

		for _, loc := range allDrops {
			if loc.SourceType == "Ingredient" {
				data.IsCrafted = true
				qty := 1
				if loc.IngredientCount != "" {
					qty, _ = strconv.Atoi(loc.IngredientCount)
				}
				data.CraftingRequirements = append(data.CraftingRequirements, api.CraftingRequirement{
					Name:     loc.IngredientName,
					Quantity: new(qty),
				})
			} else if loc.SourceType == "SoraKatraCrafting" {
				data.IsCrafted = true
				if loc.SoraKatraItem1 != "" {
					data.CraftingRequirements = append(data.CraftingRequirements, api.CraftingRequirement{
						Name:     loc.SoraKatraItem1,
						Quantity: new(1),
					})
				}
				if loc.SoraKatraItem2 != "" {
					data.CraftingRequirements = append(data.CraftingRequirements, api.CraftingRequirement{
						Name:     loc.SoraKatraItem2,
						Quantity: new(1),
					})
				}
				if loc.SoraKatraMark1 != "" {
					data.CraftingRequirements = append(data.CraftingRequirements, api.CraftingRequirement{
						Name:     loc.SoraKatraMark1,
						Quantity: new(1),
					})
				}
				if loc.SoraKatraMark2 != "" {
					data.CraftingRequirements = append(data.CraftingRequirements, api.CraftingRequirement{
						Name:     loc.SoraKatraMark2,
						Quantity: new(1),
					})
				}
			} else if loc.SourceType == "TapestryPurchase" {
				data.IsCrafted = true
				data.CraftingRequirements = append(data.CraftingRequirements, api.CraftingRequirement{
					Name:     "Shred of Tapestry",
					Quantity: new(20),
				})
			} else {
				data.DropLocations = append(data.DropLocations, loc)
			}
		}
	}
	if val, ok := fields["type"]; ok {
		data.Type = val
	} else if _, ok := fields["capacity"]; ok {
		data.Type = "Quiver"
	}

	if val, ok := fields["enchantments"]; ok {
		data.Enchantments = ParseEnchantments(val, data.Type) // Call the function from parser/enchantments.go
		data.EnchantmentsRaw = val

		// Extract set bonuses from enchantments
		if len(data.Enchantments) > 0 {
			rest, sets := ExtractSetBonus(data.Enchantments)
			data.Enchantments = rest
			data.SetBonus = append(data.SetBonus, sets...)
		}

		// Check for Crystal Cove upgrades and add crafting information
		for _, ench := range data.Enchantments {
			if strings.HasPrefix(ench.Name, "Upgradeable - Tier") {
				// Avoid duplicate crafting sources if already present
				found := false
				for _, loc := range data.DropLocations {
					if loc.SourceType == "Crafting" && loc.CraftingLocation == "Smuggler's Rest" {
						found = true
						break
					}
				}
				if !found {
					data.DropLocations = append(data.DropLocations, api.DropSourceData{
						SourceType:       "Crafting",
						CraftingType:     "Event",
						CraftingLocation: "Smuggler's Rest",
					})
				}
				break
			}
		}
	}

	// --- DIRECT FIELD MAPPING (CamelCase conversion) ---
	// ... (Mapping logic for all other fields remains the same)
	if val, ok := fields["name"]; ok {
		data.Name = val
	}
	if val, ok := fields["description"]; ok {
		data.Description = val
	}
	if val, ok := fields["minlevel"]; ok {
		data.MinLevel = val
	}
	if val, ok := fields["absoluteminlevel"]; ok {
		data.AbsoluteMinLevel = val
	}
	if val, ok := fields["binding"]; ok {
		data.Binding = parseBinding(val)
	}
	if val, ok := fields["restriction"]; ok {
		data.Restriction = val
	}
	if val, ok := fields["material"]; ok {
		data.Material = val
	}
	if val, ok := fields["hardness"]; ok {
		data.Hardness = val
	}
	if val, ok := fields["durability"]; ok {
		data.Durability = val
	}
	if val, ok := fields["weight"]; ok {
		data.Weight = val
		if data.Weight != "" && !strings.Contains(strings.ToLower(data.Weight), "lbs") {
			data.Weight += " lbs"
		}
	}
	if val, ok := fields["capacity"]; ok {
		data.Capacity = val
	}
	if val, ok := fields["maxstacksize"]; ok {
		data.MaxStackSize = val
	}
	if val, ok := fields["artifacttype"]; ok {
		data.ArtifactType = val
	}
	if val, ok := fields["update"]; ok {
		data.Update = val
	}
	if val, ok := fields["details"]; ok {
		data.Details = val
	}
	if val, ok := fields["upgradeable"]; ok {
		data.Upgradeable = val
	}
	if val, ok := fields["upgradedfrom"]; ok {
		data.UpgradedFrom = val
	}
	if val, ok := fields["bug"]; ok {
		data.Bug = val
	}
	if val, ok := fields["replaced"]; ok {
		data.Replaced = val
	}
	if val, ok := fields["grouping"]; ok {
		data.Grouping = val
	}
	if val, ok := fields["link"]; ok {
		data.Link = val
	}
	if val, ok := fields["itemsets"]; ok {
		data.ItemSetsRaw = val
		data.SetBonus = append(data.SetBonus, extractSetBonusesFromText(val)...)
	}
	if val, ok := fields["icon"]; ok {
		data.Icon = val
	}
	if val, ok := fields["image"]; ok {
		data.Image = val
	}
	if val, ok := fields["options"]; ok {
		data.OptionsRaw = val
	}
	if val, ok := fields["emptyaugments"]; ok {
		data.AugmentsRaw = val
		if parsed := parseTemplateEmptyAugments(val); len(parsed) > 0 {
			data.Augments = parsed
		}
	}

	// Scan enchantments for PreslottedAugment
	if val, ok := fields["enchantments"]; ok {
		// Use a simple scanner to find {{PreslottedAugment...}}
		remaining := val
		for {
			start := strings.Index(strings.ToLower(remaining), "{{preslottedaugment")
			if start == -1 {
				break
			}
			// Find closing braces respecting nesting
			depth := 0
			end := -1
			for i := start; i < len(remaining); i++ {
				if i+1 < len(remaining) && remaining[i:i+2] == "{{" {
					depth++
					i++
				} else if i+1 < len(remaining) && remaining[i:i+2] == "}}" {
					depth--
					if depth == 0 {
						end = i + 2
						break
					}
					i++
				}
			}
			if end == -1 {
				break
			}

			tpl := remaining[start:end]
			aug := parseTemplatePreslottedAugment(tpl)
			if aug.AugmentType != "" {
				// Guard: only one augment type (color) can be present on an item at a time
				found := false
				for i, existing := range data.Augments {
					if existing.AugmentType == aug.AugmentType {
						// Overwrite or update? "adds an augment slot ... (if it doesn't already exist) and pre-slots the effect listed"
						// If it exists, we pre-slot it.
						data.Augments[i] = aug
						found = true
						break
					}
				}
				if !found {
					data.Augments = append(data.Augments, aug)
				}
			}
			remaining = remaining[end:]
		}

		// Scan enchantments for EmptyAugments as well
		remaining = val
		for {
			start := strings.Index(strings.ToLower(remaining), "{{emptyaugments")
			if start == -1 {
				break
			}
			// Find closing braces respecting nesting
			depth := 0
			end := -1
			for i := start; i < len(remaining); i++ {
				if i+1 < len(remaining) && remaining[i:i+2] == "{{" {
					depth++
					i++
				} else if i+1 < len(remaining) && remaining[i:i+2] == "}}" {
					depth--
					if depth == 0 {
						end = i + 2
						break
					}
					i++
				}
			}
			if end == -1 {
				break
			}

			tpl := remaining[start:end]
			augList := parseTemplateEmptyAugments(tpl)
			for _, aug := range augList {
				// Avoid duplicates if already added (e.g. from emptyaugments field)
				found := false
				for _, existing := range data.Augments {
					if existing.AugmentType == aug.AugmentType {
						found = true
						break
					}
				}
				if !found {
					data.Augments = append(data.Augments, aug)
				}
			}
			remaining = remaining[end:]
		}

		// Scan enchantments for CannithCraftingSlots as well
		remaining = val
		for {
			start := strings.Index(strings.ToLower(remaining), "{{cannithcraftingslots")
			if start == -1 {
				break
			}
			// Find closing braces respecting nesting
			depth := 0
			end := -1
			for i := start; i < len(remaining); i++ {
				if i+1 < len(remaining) && remaining[i:i+2] == "{{" {
					depth++
					i++
				} else if i+1 < len(remaining) && remaining[i:i+2] == "}}" {
					depth--
					if depth == 0 {
						end = i + 2
						break
					}
					i++
				}
			}
			if end == -1 {
				break
			}

			tpl := remaining[start:end]
			augList := parseTemplateCannithCraftingSlots(tpl)
			for _, aug := range augList {
				// Avoid duplicates if already added
				found := false
				for _, existing := range data.Augments {
					if existing.AugmentType == aug.AugmentType {
						found = true
						break
					}
				}
				if !found {
					data.Augments = append(data.Augments, aug)
				}
			}
			remaining = remaining[end:]
		}
	}
	if val, ok := fields["itemsets"]; ok {
		data.ItemSetsRaw = val
		data.SetBonus = append(data.SetBonus, extractSetBonusesFromText(val)...)
	}

	// Scan other potential fields for ItemSet template
	for _, f := range []string{"description", "details", "upgradeable", "notes"} {
		if val, ok := fields[f]; ok {
			data.SetBonus = append(data.SetBonus, extractSetBonusesFromText(val)...)
		}
	}

	// De-duplicate set bonuses by name
	if len(data.SetBonus) > 1 {
		seen := make(map[string]bool)
		unique := make([]api.SetBonusOut, 0, len(data.SetBonus))
		for _, s := range data.SetBonus {
			if s.Name != "" && !seen[s.Name] {
				seen[s.Name] = true
				unique = append(unique, s)
			}
		}
		data.SetBonus = unique
	}

	return data
}

var itemSetRegex = regexp.MustCompile(`(?i)\{\{(?:Template:)?FiligreeSetList\|([^}]+)\}\}`)
var itemSetListRegex = regexp.MustCompile(`(?i)\{\{ItemSet(?:List)?\|([^}]+)\}\}`)

func extractSetBonusesFromText(text string) []api.SetBonusOut {
	var sets []api.SetBonusOut
	seen := make(map[string]bool)

	// Process FiligreeSetList
	matches := itemSetRegex.FindAllStringSubmatch(text, -1)
	for _, m := range matches {
		paramList := m[1]
		parts := splitParams(paramList)
		for _, p := range parts {
			name := stripWikitext(p)
			if name != "" && !seen[name] {
				seen[name] = true
				sets = append(sets, api.SetBonusOut{Name: name})
			}
		}
	}

	// Process ItemSetList
	matches = itemSetListRegex.FindAllStringSubmatch(text, -1)
	for _, m := range matches {
		paramList := m[1]
		parts := splitParams(paramList)
		for _, p := range parts {
			name := stripWikitext(p)
			if name != "" && !seen[name] {
				seen[name] = true
				sets = append(sets, api.SetBonusOut{Name: name})
			}
		}
	}

	return sets
}

// ... (include the unchanged parseTemplatePrice function here)
func parseTemplatePrice(rawPriceValue string) api.PriceData {
	const prefix = "{{Price|"
	const suffix = "}}"

	if !strings.HasPrefix(rawPriceValue, prefix) || !strings.HasSuffix(rawPriceValue, suffix) {
		return api.PriceData{}
	}

	paramList := rawPriceValue[len(prefix) : len(rawPriceValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	price := api.PriceData{}

	// Positional parsing for {{Price|(P)|(G)|(S)|(C)}}
	if len(parts) == 1 && strings.TrimSpace(parts[0]) != "" {
		price.Platinum = strings.TrimSpace(parts[0])
	} else {
		if len(parts) >= 1 && strings.TrimSpace(parts[0]) != "" {
			price.Platinum = strings.TrimSpace(parts[0])
		}
		if len(parts) >= 2 && strings.TrimSpace(parts[1]) != "" {
			price.Gold = strings.TrimSpace(parts[1])
		}
		if len(parts) >= 3 && strings.TrimSpace(parts[2]) != "" {
			price.Silver = strings.TrimSpace(parts[2])
		}
		if len(parts) >= 4 && strings.TrimSpace(parts[3]) != "" {
			price.Copper = strings.TrimSpace(parts[3])
		}
	}

	return price
}

// NEW FUNCTION: parseTemplateVIPLoyalty extracts the positional values for {{VIPLoyalty|...}}
func parseTemplateVIPLoyalty(rawDropValue string) api.DropSourceData {
	const prefix = "{{VIPLoyalty"
	const suffix = "}}"

	// Helper function to strip brackets (just in case they appear here)
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawDropValue, prefix) || !strings.HasSuffix(rawDropValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	// Extract content between "{{" and "}}"
	// Examples: {{VIPLoyalty}} or {{VIPLoyalty|2,5,10}}
	paramContent := rawDropValue[len(prefix) : len(rawDropValue)-len(suffix)]
	paramContent = strings.TrimSpace(paramContent)

	drop := api.DropSourceData{SourceType: "VIP"} // Set Type

	// Check for parameter presence: if paramContent starts with "|", there is a parameter.
	if strings.HasPrefix(paramContent, "|") {
		// Parameter exists: {{VIPLoyalty|2,5,10}}
		monthParam := paramContent[1:] // Skip the leading '|'
		drop.VIPMonths = stripBrackets(monthParam)
	} else if paramContent == "" {
		// No parameter: {{VIPLoyalty}}
		drop.VIPBonus = "First Time Sign-up Bonus"
	} else {
		// Safety check for weird cases where it might be {{VIPLoyalty 2,5,10}} without a pipe
		drop.VIPMonths = stripBrackets(paramContent)
	}

	return drop
}

func parseTemplateCrateAcquired(rawDropValue string) api.DropSourceData {
	const prefix = "{{CrateAcquired|"
	const suffix = "}}"

	// Helper function to strip brackets
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawDropValue, prefix) || !strings.HasSuffix(rawDropValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawDropValue[len(prefix) : len(rawDropValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "Crate"} // Set Type

	// Documentation: (Location)|(Number)

	if len(parts) >= 1 {
		drop.CrateName = stripBrackets(parts[0])
	} // Location
	if len(parts) >= 2 {
		drop.Qty = stripBrackets(parts[1])
	} // Number

	return drop
}

func parseTemplateEventReceived(rawDropValue string) api.DropSourceData {
	const prefix = "{{EventReceived|"
	const suffix = "}}"

	// Helper function to strip brackets
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawDropValue, prefix) || !strings.HasSuffix(rawDropValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawDropValue[len(prefix) : len(rawDropValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "Event"} // Set Type

	// Documentation: (name)|(link)|(location)

	if len(parts) >= 1 {
		drop.EventName = stripBrackets(parts[0])
	} // name
	if len(parts) >= 3 {
		drop.EventLocation = stripBrackets(parts[2])
	} // location

	return drop
}

func parseTemplateViktraniumPurchase(rawVPValue string) api.DropSourceData {
	// Accept with or without immediate pipe after name; tolerate whitespace/newlines
	const name = "{{ViktraniumPurchase"
	const suffix = "}}"

	// Helper to clean wikilinks and trim
	stripBrackets := func(s string) string {
		s = strings.TrimSpace(s)
		// remove enclosing wikilinks [[...|...]] -> take after last '|', then remove brackets
		if strings.HasPrefix(s, "[[") && strings.HasSuffix(s, "]]") {
			inner := strings.TrimSuffix(strings.TrimPrefix(s, "[["), "]]")
			if parts := strings.Split(inner, "|"); len(parts) > 1 {
				s = parts[len(parts)-1]
			} else {
				s = inner
			}
		}
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	vp := strings.TrimSpace(rawVPValue)
	if !strings.HasPrefix(vp, name) || !strings.HasSuffix(vp, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	// Extract everything between the first top-level '|' after the name and the closing '}}'
	// Find the index right after the template name
	afterName := vp[len(name):]
	// It may start with spaces or a closing '}}' if no params
	// Ensure we start at the first '|' at top level
	// Scan maintaining brace depth for nested templates
	i := 0
	// Skip any spaces/newlines
	for i < len(afterName) && (afterName[i] == ' ' || afterName[i] == '\n' || afterName[i] == '\t' || afterName[i] == '\r') {
		i++
	}
	if i >= len(afterName) || afterName[i] != '|' {
		// No parameters
		return api.DropSourceData{SourceType: "Viktranium Crafting"}
	}
	// param section is between this '|' and the final '}}'
	paramSection := strings.TrimSuffix(afterName[i+1:], suffix)

	// Split by top-level pipes respecting nested braces/brackets
	var parts []string
	var cur strings.Builder
	depthBraces := 0
	depthBrackets := 0
	for _, r := range paramSection {
		switch r {
		case '{':
			depthBraces++
			cur.WriteRune(r)
		case '}':
			if depthBraces > 0 {
				depthBraces--
			}
			cur.WriteRune(r)
		case '[':
			depthBrackets++
			cur.WriteRune(r)
		case ']':
			if depthBrackets > 0 {
				depthBrackets--
			}
			cur.WriteRune(r)
		case '|':
			if depthBraces == 0 && depthBrackets == 0 {
				parts = append(parts, strings.TrimSpace(cur.String()))
				cur.Reset()
			} else {
				cur.WriteRune(r)
			}
		default:
			cur.WriteRune(r)
		}
	}
	if cur.Len() > 0 {
		parts = append(parts, strings.TrimSpace(cur.String()))
	}

	drop := api.DropSourceData{SourceType: "Viktranium Crafting"}

	// Map named or positional params
	// Positional order per template: (Device)|(Transformers)|(Mementos)|(Wires)|(Conductors)|(Insulators)|(Alternators)|(Resistors)
	// We ignore index 0 (Device) and start assigning from index 1.
	// Accepted named keys: T, M, W, C, I, A, R and full names.
	setByIndex := func(idx int, val string) {
		switch idx {
		case 0:
			// Device name; intentionally ignored for counts
		case 1:
			drop.ViktraniumTransformers = stripBrackets(val)
		case 2:
			drop.ViktraniumMementos = stripBrackets(val)
		case 3:
			drop.ViktraniumWires = stripBrackets(val)
		case 4:
			drop.ViktraniumConductors = stripBrackets(val)
		case 5:
			drop.ViktraniumInsulators = stripBrackets(val)
		case 6:
			drop.ViktraniumAlternators = stripBrackets(val)
		case 7:
			drop.ViktraniumResistors = stripBrackets(val)
		}
	}

	positional := 0
	for _, p := range parts {
		if p == "" {
			positional++
			continue
		}
		// Split on first '=' only if present at top level (safe because we split top-level earlier)
		if eq := strings.Index(p, "="); eq != -1 {
			key := strings.TrimSpace(p[:eq])
			val := stripBrackets(p[eq+1:])
			switch strings.ToLower(key) {
			case "t", "transformers":
				drop.ViktraniumTransformers = val
			case "m", "mementos":
				drop.ViktraniumMementos = val
			case "w", "wires":
				drop.ViktraniumWires = val
			case "c", "conductors":
				drop.ViktraniumConductors = val
			case "i", "insulators":
				drop.ViktraniumInsulators = val
			case "a", "alternators":
				drop.ViktraniumAlternators = val
			case "r", "resistors":
				drop.ViktraniumResistors = val
			default:
				// Unknown named param; ignore
			}
		} else {
			setByIndex(positional, p)
			positional++
		}
	}

	return drop
}

func parseTemplateDinosaurBonePurchase(rawDBPValue string) api.DropSourceData {
	// Make this parser robust like Viktranium: tolerate whitespace and support named/positional params
	const name = "{{DinosaurBonePurchase"
	const suffix = "}}"

	// Helper to clean wikilinks and trim
	stripBrackets := func(s string) string {
		s = strings.TrimSpace(s)
		if strings.HasPrefix(s, "[[") && strings.HasSuffix(s, "]] ") {
			// unlikely trailing space; normalize
			s = strings.TrimSpace(s)
		}
		if strings.HasPrefix(s, "[[") && strings.HasSuffix(s, "]] ") {
			s = strings.TrimSpace(s)
		}
		if strings.HasPrefix(s, "[[") && strings.HasSuffix(s, "]]") {
			inner := strings.TrimSuffix(strings.TrimPrefix(s, "[["), "]]")
			if parts := strings.Split(inner, "|"); len(parts) > 1 {
				s = parts[len(parts)-1]
			} else {
				s = inner
			}
		}
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	dbp := strings.TrimSpace(rawDBPValue)
	if !strings.HasPrefix(dbp, name) || !strings.HasSuffix(dbp, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	// Find first top-level '|', then split params respecting nesting
	afterName := dbp[len(name):]
	i := 0
	for i < len(afterName) && (afterName[i] == ' ' || afterName[i] == '\n' || afterName[i] == '\t' || afterName[i] == '\r') {
		i++
	}
	if i >= len(afterName) || afterName[i] != '|' {
		return api.DropSourceData{SourceType: "Dinosaur Bone Crafting"}
	}
	paramSection := strings.TrimSuffix(afterName[i+1:], suffix)

	var parts []string
	var cur strings.Builder
	depthBraces := 0
	depthBrackets := 0
	for _, r := range paramSection {
		switch r {
		case '{':
			depthBraces++
			cur.WriteRune(r)
		case '}':
			if depthBraces > 0 {
				depthBraces--
			}
			cur.WriteRune(r)
		case '[':
			depthBrackets++
			cur.WriteRune(r)
		case ']':
			if depthBrackets > 0 {
				depthBrackets--
			}
			cur.WriteRune(r)
		case '|':
			if depthBraces == 0 && depthBrackets == 0 {
				parts = append(parts, strings.TrimSpace(cur.String()))
				cur.Reset()
			} else {
				cur.WriteRune(r)
			}
		default:
			cur.WriteRune(r)
		}
	}
	if cur.Len() > 0 {
		parts = append(parts, strings.TrimSpace(cur.String()))
	}

	drop := api.DropSourceData{SourceType: "Dinosaur Bone Crafting"}

	setByIndex := func(idx int, val string) {
		switch idx {
		case 0:
			drop.BoneRaptor = stripBrackets(val)
		case 1:
			drop.BoneTriceratops = stripBrackets(val)
		case 2:
			drop.BonePteradon = stripBrackets(val)
		case 3:
			drop.BoneAnkylosaur = stripBrackets(val)
		case 4:
			drop.BoneTyrannosaurus = stripBrackets(val)
		case 5:
			drop.BlackPearls = stripBrackets(val)
		}
	}

	positional := 0
	for _, p := range parts {
		if p == "" {
			positional++
			continue
		}
		// named parameter?
		if kv := strings.SplitN(p, "=", 2); len(kv) == 2 {
			key := strings.ToLower(strings.TrimSpace(kv[0]))
			val := strings.TrimSpace(kv[1])
			switch key {
			case "raptor":
				drop.BoneRaptor = stripBrackets(val)
			case "triceratops":
				drop.BoneTriceratops = stripBrackets(val)
			case "pteradon", "pteranodon":
				drop.BonePteradon = stripBrackets(val)
			case "ankylosaur":
				drop.BoneAnkylosaur = stripBrackets(val)
			case "tyrannosaurus", "t-rex", "trex":
				drop.BoneTyrannosaurus = stripBrackets(val)
			case "blackpearls", "pearls", "black_pearls":
				drop.BlackPearls = stripBrackets(val)
			default:
				// ignore unknown keys
			}
		} else {
			setByIndex(positional, p)
			positional++
		}
	}

	return drop
}

func parseTemplateStoryArcDrop(rawDropValue string) api.DropSourceData {
	const prefix = "{{StoryArcDrop|"
	const suffix = "}}"

	// Helper function to strip brackets (just in case they appear here)
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawDropValue, prefix) || !strings.HasSuffix(rawDropValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawDropValue[len(prefix) : len(rawDropValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "StoryArc"} // Set Type

	// Documentation: (Story Arc)|(Which Chest/Person)|(Difficulty)|(Include as Quest Loot)

	if len(parts) >= 1 {
		drop.StoryArc = stripBrackets(parts[0])
	} // Story Arc
	if len(parts) >= 2 {
		drop.WhichChestPerson = stripBrackets(parts[1])
	} // Which Chest/Person
	if len(parts) >= 3 {
		drop.Difficulty = stripBrackets(parts[2])
	} // Difficulty
	if len(parts) >= 4 {
		drop.IncludeAsQuestLoot = stripBrackets(parts[3])
	} // Include as Quest Loot

	return drop
}

func parseTemplateSnowpeaksPurchase(rawSPPValue string) api.DropSourceData {
	const prefix = "{{SnowpeaksPurchase|"
	const suffix = "}}"

	// Helper function to strip brackets (just in case they appear here)
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawSPPValue, prefix) || !strings.HasSuffix(rawSPPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawSPPValue[len(prefix) : len(rawSPPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "Snowpeaks"} // Set Type

	// Docs/Examples: Assumed Positional Order: (Gold)|(Silver)|(Bronze)

	// 1. Gold Snowpeak Coin (Index 0)
	if len(parts) >= 1 {
		drop.SnowpeaksGold = stripBrackets(parts[0])
	}
	// 2. Silver Snowpeak Coin (Index 1)
	if len(parts) >= 2 {
		drop.SnowpeaksSilver = stripBrackets(parts[1])
	}
	// 3. Bronze Snowpeak Coin (Index 2)
	if len(parts) >= 3 {
		drop.SnowpeaksBronze = stripBrackets(parts[2])
	}

	return drop
}

func parseTemplateFeywildPurchase(rawValue string) api.DropSourceData {
	// Template:FeywildPurchase
	// Usage: {{FeywildPurchase}} or {{FeywildPurchase|True}}
	// Renders a purchase at The Hut from Beyond with cost in Feywild crystals.
	const prefix = "{{FeywildPurchase"
	const suffix = "}}"

	val := strings.TrimSpace(rawValue)
	if !strings.HasPrefix(val, prefix) || !strings.HasSuffix(val, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	// Extract parameters section (may be empty)
	params := strings.TrimSuffix(strings.TrimPrefix(val, prefix), suffix)
	params = strings.TrimSpace(params)
	legendary := false
	if strings.HasPrefix(params, "|") {
		params = strings.TrimSpace(params[1:])
	}
	if params != "" {
		p := splitParams(params)
		if len(p) > 0 {
			v := strings.ToLower(strings.TrimSpace(stripWikitext(p[0])))
			legendary = v == "true" || v == "yes" || v == "1"
		}
	}

	costName := "Chunk of Ferrocrystal"
	if legendary {
		costName = "Legendary " + costName
	}
	// Cost is fixed at 20x per wiki template examples
	ingredients := []api.CraftingRequirement{
		{Name: costName, Quantity: new(20)},
	}

	return api.DropSourceData{
		SourceType:  "Feywild",
		StoreName:   "The Hut from Beyond",
		Ingredients: ingredients,
	}
}

func parseTemplateIngotPurchase(rawValue string) []api.DropSourceData {
	// Template:IngotPurchase
	// Usage: {{IngotPurchase|Silver}} or {{IngotPurchase|Silver|True}} or {{IngotPurchase|All}}
	// Vendor: Morten Edgewright
	const prefix = "{{IngotPurchase"
	const suffix = "}}"

	val := strings.TrimSpace(rawValue)
	if !strings.HasPrefix(val, prefix) || !strings.HasSuffix(val, suffix) {
		return nil
	}

	params := strings.TrimSuffix(strings.TrimPrefix(val, prefix), suffix)
	params = strings.TrimSpace(params)
	if strings.HasPrefix(params, "|") {
		params = params[1:]
	}

	var ingot string
	isEpic := false
	if params != "" {
		p := splitParams(params)
		if len(p) > 0 {
			ingot = strings.TrimSpace(stripWikitext(p[0]))
		}
		if len(p) > 1 {
			v := strings.ToLower(strings.TrimSpace(stripWikitext(p[1])))
			isEpic = v == "true" || v == "yes" || v == "1"
		}
	}

	var results []api.DropSourceData
	ingots := []string{ingot}
	if strings.EqualFold(ingot, "All") {
		ingots = []string{"Arcane", "Ethereal", "Silver"}
	}

	for _, ing := range ingots {
		costIngot := ing
		if isEpic {
			costIngot = "Epic " + costIngot
		}
		costIngot = costIngot + " Ingot"

		results = append(results, api.DropSourceData{
			SourceType: "Ingot Purchase",
			StoreName:  "Morten Edgewright",
			Ingredients: []api.CraftingRequirement{
				{Name: costIngot, Quantity: new(1)},
			},
			IngotType:   ing,
			IsEpicIngot: isEpic,
		})
	}

	return results
}

func parseTemplateRayneCloudPurchase(rawValue string) api.DropSourceData {
	// Template:RayneCloudPurchase
	// Usage: {{RayneCloudPurchase}}
	// Fixed-cost ingredient turn-in at Rayne Cloud in Sharn - Cliffside Docks District
	const prefix = "{{RayneCloudPurchase"
	const suffix = "}}"

	val := strings.TrimSpace(rawValue)
	if !strings.HasPrefix(val, prefix) || !strings.HasSuffix(val, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	// Ingredients are fixed per template documentation
	ingredients := []api.CraftingRequirement{
		{Name: "Dampening Alloy", Quantity: new(1)},
		{Name: "Energizing Alloy", Quantity: new(1)},
		{Name: "Caustic Compound", Quantity: new(1)},
		{Name: "Stabilizing Compound", Quantity: new(1)},
	}

	return api.DropSourceData{
		SourceType:  "Rayne Cloud",
		StoreName:   "Rayne Cloud",
		Ingredients: ingredients,
	}
}

func parseTemplateSaltmarshPurchase(rawValue string) api.DropSourceData {
	// Template:SaltmarshPurchase
	// Usage: {{SaltmarshPurchase}} or {{SaltmarshPurchase|True}}
	// Renders a purchase at Captain Xendros with cost in Quartermaster's Chits.
	const prefix = "{{SaltmarshPurchase"
	const suffix = "}}"

	val := strings.TrimSpace(rawValue)
	if !strings.HasPrefix(val, prefix) || !strings.HasSuffix(val, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	// Extract parameters section (may be empty)
	params := strings.TrimSuffix(strings.TrimPrefix(val, prefix), suffix)
	params = strings.TrimSpace(params)
	legendary := false
	if strings.HasPrefix(params, "|") {
		params = strings.TrimSpace(params[1:])
	}
	if params != "" {
		p := splitParams(params)
		if len(p) > 0 {
			v := strings.ToLower(strings.TrimSpace(stripWikitext(p[0])))
			legendary = v == "true" || v == "yes" || v == "1"
		}
	}

	costName := "Quartermaster's Chit"
	if legendary {
		costName = "Legendary " + costName
	}
	// Cost is fixed at 5x per wiki template examples
	ingredients := []api.CraftingRequirement{
		{Name: costName, Quantity: new(5)},
	}

	return api.DropSourceData{
		SourceType:  "Saltmarsh",
		StoreName:   "Captain Xendros",
		Ingredients: ingredients,
	}
}

func parseTemplateRavenloftPurchase(rawValue string) api.DropSourceData {
	// Template:RavenloftPurchase
	// Usage: {{RavenloftPurchase|Type|Cost|BTA}}
	// Type values: Totem, Talisman, Ravenloft, Sentient
	// Cost only applies to Totem/Talisman; BTA flag is ignored for now (binding not modeled here)
	const prefix = "{{RavenloftPurchase"
	const suffix = "}}"

	val := strings.TrimSpace(rawValue)
	if !strings.HasPrefix(val, prefix) || !strings.HasSuffix(val, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	params := strings.TrimSuffix(strings.TrimPrefix(val, prefix), suffix)
	params = strings.TrimSpace(params)
	if strings.HasPrefix(params, "|") {
		params = params[1:]
	}

	var (
		typeParam string
		costParam string
	)
	if params != "" {
		p := splitParams(params)
		if len(p) > 0 {
			typeParam = strings.ToLower(strings.TrimSpace(stripWikitext(p[0])))
		}
		if len(p) > 1 {
			costParam = strings.TrimSpace(stripWikitext(p[1]))
		}
	}

	// Defaults
	store := "Ravenloft"
	var ingredients []api.CraftingRequirement

	switch typeParam {
	case "totem":
		store = "Osah Lukresh"
		if n, err := strconv.Atoi(costParam); err == nil && n > 0 {
			ingredients = []api.CraftingRequirement{{Name: "Vistani Totem", Quantity: new(n)}}
		}
	case "talisman":
		store = "Raam Lukresh"
		if n, err := strconv.Atoi(costParam); err == nil && n > 0 {
			ingredients = []api.CraftingRequirement{{Name: "Vistani Talisman", Quantity: new(n)}}
		}
	case "ravenloft":
		store = "Tobar the Smith" // Free weapon once per life
		// No ingredients
	case "sentient":
		store = "Tobar the Smith" // Free sentient jewel once per life (vendor attribution per wiki pages)
		// No ingredients
	default:
		// Unknown type; keep generic store and no ingredients
	}

	return api.DropSourceData{
		SourceType:  "Ravenloft",
		StoreName:   store,
		Ingredients: ingredients,
	}
}

func parseTemplateRemnantPurchase(rawRPValue string) api.DropSourceData {
	const prefix = "{{RemnantPurchase|"
	const suffix = "}}"

	// Helper function to strip brackets (just in case they appear here)
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawRPValue, prefix) || !strings.HasSuffix(rawRPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawRPValue[len(prefix) : len(rawRPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "Remnant"} // Set Type

	// Docs: (Cost)|(Upgrade Item)|(Limited Time)

	// 1. Cost (Index 0)
	if len(parts) >= 1 {
		drop.RemnantCost = stripBrackets(parts[0])
	}
	// 2. Upgrade Item (Index 1)
	if len(parts) >= 2 {
		drop.RemnantUpgradeItem = stripBrackets(parts[1])
	}
	// 3. Limited Time (Index 2)
	if len(parts) >= 3 {
		drop.RemnantLimitedTime = stripBrackets(parts[2])
	}

	return drop
}

func parseTemplateCraftedAugment(rawCAValue string) api.DropSourceData {
	const prefix = "{{CraftedAugment|"
	const suffix = "}}"

	// Helper function to strip brackets (just in case they appear here)
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawCAValue, prefix) || !strings.HasSuffix(rawCAValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawCAValue[len(prefix) : len(rawCAValue)-len(suffix)]
	// NOTE: Splitting by "|" will separate Location and all Raid Items.
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "CraftedAugment"} // Set Type
	drop.RaidItems = make([]string, 0)

	// Docs: (Location)|(Raid Item(s))

	// 1. Location (Required, Index 0)
	if len(parts) >= 1 {
		drop.CraftLocation = stripBrackets(parts[0])
	}

	// 2. Raid Items (Indices 1 to N, up to 5 items)
	for i := 1; i < len(parts) && i <= 5; i++ {
		item := stripBrackets(parts[i])
		if item != "" {
			drop.RaidItems = append(drop.RaidItems, item)
		}
	}

	// Clean up empty slice if no items were found
	if len(drop.RaidItems) == 0 {
		drop.RaidItems = nil
	}

	return drop
}

func parseTemplateCreatedViaCrafting(rawCVCValue string) api.DropSourceData {
	const prefix = "{{CreatedViaCrafting|"
	const suffix = "}}"

	// Helper function to strip brackets (just in case they appear here)
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawCVCValue, prefix) || !strings.HasSuffix(rawCVCValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawCVCValue[len(prefix) : len(rawCVCValue)-len(suffix)]

	// We can't use strings.Split(paramList, "|") because the Ingredients field (param 3) might contain raw wikitext
	// with item links that use pipes. We rely on the *position* of the pipes.

	// Find first two pipes to isolate the first two parameters.
	parts := strings.SplitN(paramList, "|", 3)

	drop := api.DropSourceData{SourceType: "Crafting"} // Set Type

	// Docs: (Where)|(Location)|(Ingredients)

	// 1. Where (Crafting Type) (Index 0)
	if len(parts) >= 1 {
		drop.CraftingType = stripBrackets(parts[0])
	}

	// 2. Location (Index 1)
	if len(parts) >= 2 {
		drop.CraftingLocation = stripBrackets(parts[1])
	}

	// 3. Ingredients (Raw wikitext, Index 2)
	if len(parts) >= 3 {
		drop.IngredientsRaw = strings.TrimSpace(parts[2])
	}

	return drop
}

func parseTemplateRandomDrop(rawRDValue string) api.DropSourceData {
	const prefix = "{{RandomDrop|"
	const suffix = "}}"

	// Helper function to strip brackets (just in case they appear here)
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawRDValue, prefix) || !strings.HasSuffix(rawRDValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawRDValue[len(prefix) : len(rawRDValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "Random"} // Set Type

	// Docs: (Highest Chance)|(Level Range)|(Random Only Type)|(Page Link)

	// 1. Highest Chance (Index 0)
	if len(parts) >= 1 {
		drop.RandomHighestChance = stripBrackets(parts[0])
	}
	// 2. Level Range (Index 1)
	if len(parts) >= 2 {
		drop.RandomLevelRange = stripBrackets(parts[1])
	}
	// 3. Random Only Type (Index 2)
	if len(parts) >= 3 {
		drop.RandomOnlyType = stripBrackets(parts[2])
	}
	// 4. Page Link (Index 3)
	if len(parts) >= 4 {
		drop.RandomPageLink = stripBrackets(parts[3])
	}

	return drop
}

// ParseMultiTemplateDropLocation finds and parses all known drop/store templates.
func ParseMultiTemplateDropLocation(rawContent string) []api.DropSourceData {
	var locations []api.DropSourceData
	remaining := rawContent

	const openingBraces = "{{"
	const closingBraces = "}}"

	for {
		start := strings.Index(remaining, openingBraces)
		if start == -1 {
			break
		}

		// 1. Identify the full template name (e.g., "DropLocation" or "StorePurchase")
		pipeIndexSearch := strings.Index(remaining[start+2:], "|")
		braceIndexSearch := strings.Index(remaining[start+2:], closingBraces)

		nameEnd := -1
		if pipeIndexSearch != -1 && (pipeIndexSearch < braceIndexSearch || braceIndexSearch == -1) {
			nameEnd = pipeIndexSearch
		} else if braceIndexSearch != -1 {
			nameEnd = braceIndexSearch
		}

		if nameEnd == -1 {
			remaining = remaining[start+2:]
			continue
		}

		// Template Name (e.g., "DropLocation" or "StorePurchase")
		templateName := strings.TrimSpace(remaining[start+2 : start+2+nameEnd])
		//fullTemplateNamePrefix := openingBraces + templateName + "|"

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
			break // Cannot find the closing brace, stop processing this string
		}

		// Extract the full template string, e.g., "{{Template|...}}"
		fullTemplate := remaining[start : endOfTemplate+1]

		dropData := api.DropSourceData{SourceType: "Unknown"}

		// --- Template Name Identification (Must be done carefully here) ---
		// Re-calculate templateName. The logic should be robust enough to extract the name
		// correctly based on finding the first '|' or '}}'.
		pipeIndex := strings.Index(fullTemplate[2:], "|")
		braceIndex := strings.Index(fullTemplate[2:], closingBraces)

		if pipeIndex != -1 && (pipeIndex < braceIndex || braceIndex == -1) {
			templateName = strings.TrimSpace(fullTemplate[2 : 2+pipeIndex])
		} else if braceIndex != -1 {
			templateName = strings.TrimSpace(fullTemplate[2 : 2+braceIndex])
		} else {
			templateName = strings.TrimSpace(fullTemplate[2:])
		}

		// 3. Dispatch to the correct parser or trigger a fatal error
		switch templateName {
		case "Discontinued":
			return []api.DropSourceData{{SourceType: "Discontinued"}}
		case "DropLocation":
			dropData = parseTemplateDropLocation(fullTemplate)
		case "StorePurchase":
			dropData = parseTemplateStorePurchase(fullTemplate)
		case "AdventurePackDrop":
			dropData = parseTemplateAdventurePackDrop(fullTemplate)
		case "ItemIconicReceived":
			dropData = parseTemplateItemIconicReceived(fullTemplate)
		case "VIPLoyalty":
			dropData = parseTemplateVIPLoyalty(fullTemplate)
		case "CrateAcquired":
			dropData = parseTemplateCrateAcquired(fullTemplate)
		case "EventReceived":
			dropData = parseTemplateEventReceived(fullTemplate)
		case "VendorPurchaseTable":
			dropData = parseTemplateVendorPurchaseTable(fullTemplate)
		case "ViktraniumPurchase":
			dropData = parseTemplateViktraniumPurchase(fullTemplate)
		case "ExpansionReceived":
			fallthrough
		case "SagaReceived":
			//logrus.Infof("Skipping %s template: %s", templateName, fullTemplate)
			break
		case "DinosaurBonePurchase":
			dropData = parseTemplateDinosaurBonePurchase(fullTemplate)
		case "RaidRunePurchase":
			dropData = parseTemplateRaidRunePurchase(fullTemplate)
		case "StoryArcDrop":
			dropData = parseTemplateStoryArcDrop(fullTemplate)
		case "SnowpeaksPurchase":
			dropData = parseTemplateSnowpeaksPurchase(fullTemplate)
		case "RemnantPurchase":
			dropData = parseTemplateRemnantPurchase(fullTemplate)
		case "CraftedAugment":
			dropData = parseTemplateCraftedAugment(fullTemplate)
		case "CreatedViaCrafting":
			dropData = parseTemplateCreatedViaCrafting(fullTemplate)
		case "RandomDrop":
			dropData = parseTemplateRandomDrop(fullTemplate)
		case "AnniversaryPurchase":
			dropData = parseTemplateAnniversaryPurchase(fullTemplate)
		case "TimelineFragmentPurchase":
			dropData = parseTemplateTimelineFragmentPurchase(fullTemplate)
		case "DraconicRunePurchase":
			dropData = parseTemplateDraconicRunePurchase(fullTemplate)
		case "PatronReceived":
			dropData = parseTemplatePatronReceived(fullTemplate)
		case "VendorPurchase":
			dropData = parseTemplateVendorPurchase(fullTemplate)
		case "AnniversaryFreebie":
			dropData = parseTemplateAnniversaryFreebie(fullTemplate)
		case "CommendationPurchase":
			dropData = parseTemplateCommendationPurchase(fullTemplate)
		case "RelicPurchase":
			dropData = parseTemplateRelicPurchase(fullTemplate)
		case "DragonScalePurchase":
			dropData = parseTemplateDragonScalePurchase(fullTemplate)
		case "VeteranReceived":
			dropData = parseTemplateVeteranReceived(fullTemplate)
		case "ThunderForgePurchase":
			dropData = parseTemplateThunderForgePurchase(fullTemplate)
		case "AdamantineOrePurchase":
			dropData = parseTemplateAdamantineOrePurchase(fullTemplate)
		case "OutsiderTokenPurchase":
			dropData = parseTemplateOutsiderTokenPurchase(fullTemplate)
		case "MimicTokenPurchase":
			dropData = parseTemplateMimicTokenPurchase(fullTemplate)
		case "Ingredient":
			dropData = parseTemplateIngredient(fullTemplate)
		case "CraftOnlyItem":
			dropData = parseTemplateCraftOnlyItem(fullTemplate)
		case "CommunityLootList":
			dropData = parseTemplateCommunityLootList(fullTemplate)
		case "SoraKatraCrafting":
			dropData = parseTemplateSoraKatraCrafting(fullTemplate)
		case "TapestryPurchase":
			dropData = parseTemplateTapestryPurchase(fullTemplate)
		case "FeywildPurchase":
			dropData = parseTemplateFeywildPurchase(fullTemplate)
		case "RavenloftPurchase":
			dropData = parseTemplateRavenloftPurchase(fullTemplate)
		case "IngotPurchase":
			ingotResults := parseTemplateIngotPurchase(fullTemplate)
			if len(ingotResults) > 0 {
				locations = append(locations, ingotResults...)
			}
		case "RayneCloudPurchase":
			dropData = parseTemplateRayneCloudPurchase(fullTemplate)
		case "SaltmarshPurchase":
			dropData = parseTemplateSaltmarshPurchase(fullTemplate)
		case "NightRevelsPurchase":
			dropData = parseTemplateNightRevelsPurchase(fullTemplate)
		case "ThreadsofFatePurchase":
			dropData = parseTemplateThreadsofFatePurchase(fullTemplate)
		default:
			// FATAL ERROR for unknown templates
			logrus.Fatalf("Found unexpected DropLocation template type: %s. Please update parsing logic. Raw string: %s", templateName, fullTemplate)
		}

		if dropData.SourceType != "Unknown" {
			locations = append(locations, dropData)
		}

		// Move the remaining string pointer past the found template
		remaining = remaining[endOfTemplate+1:]
	}

	return locations
}

func parseTemplateNightRevelsPurchase(raw string) api.DropSourceData {
	const prefix = "{{NightRevelsPurchase"
	const suffix = "}}"

	s := strings.TrimSpace(raw)
	if !strings.HasPrefix(s, prefix) || !strings.HasSuffix(s, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	inner := strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(s, prefix), suffix))
	if strings.HasPrefix(inner, "|") {
		inner = strings.TrimPrefix(inner, "|")
	}

	drop := api.DropSourceData{SourceType: "NightRevelsPurchase"}

	if inner != "" {
		parts := strings.Split(inner, "|")
		// Usage: {{NightRevelsPurchase|(Choco Count)|(Caramel Count)|(Almond Count)|(Cinn Count)|(Apple Count)|(Scale Count)|(Items)|(Wares)}}
		if len(parts) >= 1 {
			drop.NightRevelsChoco = strings.TrimSpace(parts[0])
		}
		if len(parts) >= 2 {
			drop.NightRevelsCaramel = strings.TrimSpace(parts[1])
		}
		if len(parts) >= 3 {
			drop.NightRevelsAlmond = strings.TrimSpace(parts[2])
		}
		if len(parts) >= 4 {
			drop.NightRevelsCinn = strings.TrimSpace(parts[3])
		}
		if len(parts) >= 5 {
			drop.NightRevelsApple = strings.TrimSpace(parts[4])
		}
		if len(parts) >= 6 {
			drop.NightRevelsScale = strings.TrimSpace(parts[5])
		}
		if len(parts) >= 7 {
			drop.NightRevelsItems = strings.TrimSpace(parts[6])
		}
		if len(parts) >= 8 {
			drop.NightRevelsWares = strings.TrimSpace(parts[7])
		}
	}

	return drop
}

func parseTemplateAnniversaryPurchase(rawAPValue string) api.DropSourceData {
	const prefix = "{{AnniversaryPurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawAPValue, prefix) || !strings.HasSuffix(rawAPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawAPValue[len(prefix) : len(rawAPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "AnniversaryPurchase"}

	// Docs: {{AnniversaryPurchase|(Anniversary)|(Count)}}
	if len(parts) >= 1 {
		drop.Anniversary = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		drop.AnniversaryCount = strings.TrimSpace(parts[1])
	}

	return drop
}

func parseTemplateTimelineFragmentPurchase(rawTFPValue string) api.DropSourceData {
	const prefix = "{{TimelineFragmentPurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawTFPValue, prefix) || !strings.HasSuffix(rawTFPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawTFPValue[len(prefix) : len(rawTFPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "TimelineFragmentPurchase"}

	// Docs: {{TimelineFragmentPurchase|(Anniversary)|(Count)}}
	if len(parts) >= 1 {
		drop.TimelineFragmentAnniversary = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		drop.TimelineFragmentCount = strings.TrimSpace(parts[1])
	}

	return drop
}

func parseTemplateDraconicRunePurchase(rawDRPValue string) api.DropSourceData {
	const prefix = "{{DraconicRunePurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawDRPValue, prefix) || !strings.HasSuffix(rawDRPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawDRPValue[len(prefix) : len(rawDRPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "DraconicRunePurchase"}

	// Docs: {{DraconicRunePurchase|(Count)|(Stealer of Souls)}}
	if len(parts) >= 1 {
		drop.DraconicRuneCount = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		drop.RequiresStealerOfSouls = strings.TrimSpace(parts[1])
	}

	return drop
}

func parseTemplateAdamantineOrePurchase(rawAOPValue string) api.DropSourceData {
	const prefix = "{{AdamantineOrePurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawAOPValue, prefix) || !strings.HasSuffix(rawAOPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawAOPValue[len(prefix) : len(rawAOPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "AdamantineOrePurchase"}

	// Docs: {{AdamantineOrePurchase|(Count)}}
	if len(parts) >= 1 {
		drop.AdamantineOreCount = strings.TrimSpace(parts[0])
	}

	return drop
}

func parseTemplateOutsiderTokenPurchase(rawOTPValue string) api.DropSourceData {
	const prefix = "{{OutsiderTokenPurchase"
	const suffix = "}}"

	if !strings.HasPrefix(rawOTPValue, prefix) || !strings.HasSuffix(rawOTPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	drop := api.DropSourceData{SourceType: "OutsiderTokenPurchase"}

	inner := rawOTPValue[len(prefix) : len(rawOTPValue)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			drop.OutsiderTokenCount = strings.TrimSpace(parts[0])
		}
	}

	return drop
}

func parseTemplateMimicTokenPurchase(rawMTPValue string) api.DropSourceData {
	const prefix = "{{MimicTokenPurchase"
	const suffix = "}}"

	if !strings.HasPrefix(rawMTPValue, prefix) || !strings.HasSuffix(rawMTPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	drop := api.DropSourceData{SourceType: "MimicTokenPurchase"}

	inner := rawMTPValue[len(prefix) : len(rawMTPValue)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			drop.MimicTokenCount = strings.TrimSpace(parts[0])
		}
	}

	return drop
}

func parseTemplateIngredient(rawDropValue string) api.DropSourceData {
	const templateName = "Ingredient"
	const prefix = "{{" + templateName
	const suffix = "}}"

	if !strings.HasPrefix(rawDropValue, prefix) || !strings.HasSuffix(rawDropValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	inner := rawDropValue[len(prefix) : len(rawDropValue)-len(suffix)]

	drop := api.DropSourceData{SourceType: "Ingredient"}

	if strings.HasPrefix(inner, "|") {
		inner = inner[1:]
		parts := strings.Split(inner, "|")
		if len(parts) >= 1 {
			name := strings.TrimSpace(parts[0])
			// Handle cases like "Lily Petal (Collectable)" -> "Lily Petal"
			if idx := strings.Index(name, " ("); idx != -1 {
				name = name[:idx]
			}
			drop.IngredientName = name
		}
		if len(parts) >= 2 {
			drop.IngredientCount = strings.TrimSpace(parts[1])
		} else {
			drop.IngredientCount = "1"
		}
	}

	return drop
}

func parseTemplateVendorPurchase(rawVPValue string) api.DropSourceData {
	const prefix = "{{VendorPurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawVPValue, prefix) || !strings.HasSuffix(rawVPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawVPValue[len(prefix) : len(rawVPValue)-len(suffix)]
	parts := splitParams(paramList)

	drop := api.DropSourceData{SourceType: "VendorPurchase"}

	// Docs: {{VendorPurchase|(Which Vendor)|(Cost)|(Location)|(Amount)|(Area)}}
	if len(parts) >= 1 {
		drop.VendorName = stripWikitext(parts[0])
	}
	if len(parts) >= 2 {
		drop.VendorCost = stripWikitext(parts[1])
	}
	if len(parts) >= 3 {
		drop.VendorLocation = stripWikitext(parts[2])
	}
	if len(parts) >= 4 {
		drop.VendorAmount = stripWikitext(parts[3])
	}
	if len(parts) >= 5 {
		drop.VendorArea = stripWikitext(parts[4])
	}

	return drop
}

func parseTemplateThreadsofFatePurchase(rawContent string) api.DropSourceData {
	// Support both {{ThreadsofFatePurchase|...}} and {{ThreadsofFatePurchase}}
	name := "ThreadsofFatePurchase"
	prefix := "{{" + name
	suffix := "}}"

	if !strings.HasPrefix(rawContent, prefix) || !strings.HasSuffix(rawContent, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	drop := api.DropSourceData{SourceType: name}

	// Handle case with no parameters: {{ThreadsofFatePurchase}}
	if rawContent == prefix+suffix {
		return drop
	}

	// Handle case with parameters: {{ThreadsofFatePurchase|...}}
	if !strings.HasPrefix(rawContent, prefix+"|") {
		return drop
	}

	paramList := rawContent[len(prefix)+1 : len(rawContent)-len(suffix)]
	parts := splitParams(paramList)

	// Usage: {{ThreadsofFatePurchase|(count)|(Additional Item)|(Additional Item Count)}}
	if len(parts) >= 1 {
		drop.ThreadsOfFateCount = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		drop.AdditionalItemName = stripWikitext(parts[1])
	}
	if len(parts) >= 3 {
		drop.AdditionalItemCount = strings.TrimSpace(parts[2])
	} else if len(parts) == 2 {
		drop.AdditionalItemCount = "1"
	}

	return drop
}

func parseTemplateAnniversaryFreebie(rawAFValue string) api.DropSourceData {
	const prefix = "{{AnniversaryFreebie|"
	const suffix = "}}"

	if !strings.HasPrefix(rawAFValue, prefix) || !strings.HasSuffix(rawAFValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawAFValue[len(prefix) : len(rawAFValue)-len(suffix)]
	parts := splitParams(paramList)

	drop := api.DropSourceData{SourceType: "AnniversaryFreebie"}

	// Docs: {{AnniversaryFreebie|(Which Anniversary)|(Date)|(Type)|(Value)|(All)}}
	if len(parts) >= 1 {
		drop.FreebieAnniversary = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		drop.FreebieDate = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		drop.FreebieType = strings.TrimSpace(parts[2])
	}
	if len(parts) >= 4 {
		drop.FreebieValue = strings.TrimSpace(parts[3])
	}
	if len(parts) >= 5 {
		drop.FreebieAll = strings.TrimSpace(parts[4])
	}

	return drop
}

func parseTemplatePatronReceived(rawPRValue string) api.DropSourceData {
	const prefix = "{{PatronReceived|"
	const suffix = "}}"

	if !strings.HasPrefix(rawPRValue, prefix) || !strings.HasSuffix(rawPRValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawPRValue[len(prefix) : len(rawPRValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "PatronReceived"}

	// Docs: (Patron)|(favor)|(Title)|(Location)
	if len(parts) >= 1 {
		drop.PatronName = stripWikitext(parts[0])
	}
	if len(parts) >= 2 {
		drop.PatronFavor = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		drop.PatronTitle = stripWikitext(parts[2])
	}
	if len(parts) >= 4 {
		drop.PatronLocation = stripWikitext(parts[3])
	}

	return drop
}

func parseTemplateCommendationPurchase(rawCPValue string) api.DropSourceData {
	const prefix = "{{CommendationPurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawCPValue, prefix) || !strings.HasSuffix(rawCPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawCPValue[len(prefix) : len(rawCPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "CommendationPurchase"}

	// Docs: {{CommendationPurchase|(Type)|(Cost)}}
	if len(parts) >= 1 {
		cType := strings.TrimSpace(parts[0])
		switch strings.ToLower(cType) {
		case "pdk":
			drop.CommendationType = "Purple Dragon Knights"
		case "wizards":
			drop.CommendationType = "War Wizards"
		case "villagers":
			drop.CommendationType = "Villagers of Eveningstar"
		case "clerics":
			drop.CommendationType = "Clerics of Amaunator"
		case "druids":
			drop.CommendationType = "Druids of the King's Forest"
		default:
			drop.CommendationType = cType
		}
	}
	if len(parts) >= 2 {
		drop.CommendationCount = strings.TrimSpace(parts[1])
	}

	return drop
}

func parseTemplateDragonScalePurchase(rawDSPValue string) api.DropSourceData {
	const prefix = "{{DragonScalePurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawDSPValue, prefix) || !strings.HasSuffix(rawDSPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawDSPValue[len(prefix) : len(rawDSPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "DragonScalePurchase"}

	// Docs: {{DragonScalePurchase|(Color)|(Flawless)}}
	if len(parts) >= 1 {
		drop.DragonScaleColor = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		drop.DragonScaleFlawless = strings.TrimSpace(parts[1])
	}

	return drop
}

func parseTemplateThunderForgePurchase(rawTFPValue string) api.DropSourceData {
	const prefix = "{{ThunderForgePurchase"
	const suffix = "}}"

	if !strings.HasPrefix(rawTFPValue, prefix) || !strings.HasSuffix(rawTFPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	drop := api.DropSourceData{SourceType: "ThunderForgePurchase"}

	// Handle both {{ThunderForgePurchase}} and {{ThunderForgePurchase|True}}
	inner := rawTFPValue[len(prefix) : len(rawTFPValue)-len(suffix)]
	if strings.HasPrefix(inner, "|") {
		parts := strings.Split(inner[1:], "|")
		if len(parts) >= 1 {
			drop.ThunderForgeArmor = strings.TrimSpace(parts[0])
		}
	}

	return drop
}

func parseTemplateVeteranReceived(rawVRValue string) api.DropSourceData {
	const prefix = "{{VeteranReceived|"
	const suffix = "}}"

	if !strings.HasPrefix(rawVRValue, prefix) || !strings.HasSuffix(rawVRValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawVRValue[len(prefix) : len(rawVRValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "VeteranReceived"}

	// Docs: {{VeteranReceived|(Veteran Status)|(Count)|(Class)}}
	if len(parts) >= 1 {
		drop.VeteranStatus = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		count := strings.TrimSpace(parts[1])
		if count == "" {
			count = "1"
		}
		drop.VeteranCount = count
	} else {
		drop.VeteranCount = "1"
	}

	classMap := map[string]string{
		"all":  "All Classes",
		"alc":  "Alchemist",
		"art":  "Artificer",
		"at":   "Arcane Trickster",
		"bbn":  "Barbarian",
		"brd":  "Bard",
		"ss":   "Stormsinger",
		"clr":  "Cleric",
		"da":   "Dark Apostate",
		"dd":   "Dragon Disciple",
		"dl":   "Dragon Lord",
		"drd":  "Druid",
		"bc":   "Blight Caster",
		"fvs":  "Favored Soul",
		"ftr":  "Fighter",
		"mnk":  "Monk",
		"pal":  "Paladin",
		"sf":   "Sacred Fist",
		"rgr":  "Ranger",
		"dh":   "Dark Hunter",
		"rog":  "Rogue",
		"sor":  "Sorcerer",
		"wm":   "Wild Mage",
		"wlk":  "Warlock",
		"aots": "Acolyte of the Skin",
		"wiz":  "Wizard",
	}

	if len(parts) >= 3 {
		for i := 2; i < len(parts); i++ {
			classCode := strings.ToLower(strings.TrimSpace(parts[i]))
			if classCode == "" {
				continue
			}
			if fullName, ok := classMap[classCode]; ok {
				drop.VeteranClasses = append(drop.VeteranClasses, fullName)
			} else {
				// Default to raw if not in map, but keep original casing for the name
				drop.VeteranClasses = append(drop.VeteranClasses, strings.TrimSpace(parts[i]))
			}
		}
	}

	return drop
}

func parseTemplateCraftOnlyItem(rawValue string) api.DropSourceData {
	return api.DropSourceData{
		SourceType:  "CraftOnlyItem",
		IsCraftOnly: true,
	}
}

func parseTemplateCommunityLootList(rawValue string) api.DropSourceData {
	return api.DropSourceData{
		SourceType:      "CommunityLootList",
		IsCommunityLoot: true,
	}
}

func parseTemplateRelicPurchase(rawRPValue string) api.DropSourceData {
	const prefix = "{{RelicPurchase|"
	const suffix = "}}"

	if !strings.HasPrefix(rawRPValue, prefix) || !strings.HasSuffix(rawRPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawRPValue[len(prefix) : len(rawRPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "RelicPurchase"}

	// Docs: {{RelicPurchase|(Type)|(Cost)|(Restored?)}}
	if len(parts) >= 1 {
		drop.RelicType = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		drop.RelicCost = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		drop.RelicRestored = strings.TrimSpace(parts[2])
	}

	return drop
}

func parseTemplateRaidRunePurchase(rawRRPValue string) api.DropSourceData {
	const prefix = "{{RaidRunePurchase|"
	const suffix = "}}"
	const defaultCount = "1"

	// Helper function to strip brackets (just in case they appear here)
	stripBrackets := func(s string) string {
		s = strings.ReplaceAll(s, "[", "")
		s = strings.ReplaceAll(s, "]", "")
		return strings.TrimSpace(s)
	}

	if !strings.HasPrefix(rawRRPValue, prefix) || !strings.HasSuffix(rawRRPValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawRRPValue[len(prefix) : len(rawRRPValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "RaidRune"} // Set Type

	// Docs: (Which Runes)|(Cost)|(Count)

	// 1. Which Runes (Required, Index 0)
	if len(parts) >= 1 {
		drop.RaidRuneStore = stripBrackets(parts[0])
	}
	// 2. Cost (Required, Index 1)
	if len(parts) >= 2 {
		drop.RaidRuneCost = stripBrackets(parts[1])
	}

	// 3. Count (Optional, Index 2 - defaults to 1)
	if len(parts) >= 3 {
		count := stripBrackets(parts[2])
		if count == "" {
			count = defaultCount
		}
		drop.RaidRuneCount = count
	} else {
		drop.RaidRuneCount = defaultCount
	}

	return drop
}

func parseTemplateSoraKatraCrafting(rawSKCValue string) api.DropSourceData {
	const prefix = "{{SoraKatraCrafting|"
	const suffix = "}}"

	if !strings.HasPrefix(rawSKCValue, prefix) || !strings.HasSuffix(rawSKCValue, suffix) {
		return api.DropSourceData{SourceType: "Unknown"}
	}

	paramList := rawSKCValue[len(prefix) : len(rawSKCValue)-len(suffix)]
	parts := strings.Split(paramList, "|")

	drop := api.DropSourceData{SourceType: "SoraKatraCrafting"}

	// Docs: {{SoraKatraCrafting|(Item 1)|(Item 2)|(Droaam Mark 1)|(Droaam Mark 2)}}
	if len(parts) >= 1 {
		drop.SoraKatraItem1 = strings.TrimSpace(parts[0])
	}
	if len(parts) >= 2 {
		drop.SoraKatraItem2 = strings.TrimSpace(parts[1])
	}
	if len(parts) >= 3 {
		drop.SoraKatraMark1 = strings.TrimSpace(parts[2])
	}
	if len(parts) >= 4 {
		drop.SoraKatraMark2 = strings.TrimSpace(parts[3])
	}

	return drop
}

func parseTemplateTapestryPurchase(raw string) api.DropSourceData {
	return api.DropSourceData{
		SourceType:         "TapestryPurchase",
		IsTapestryPurchase: true,
	}
}

func ParseTemplateDice(rawDiceValue string) api.DiceData {
	const prefix = "{{Dice|"
	const suffix = "}}"

	if !strings.HasPrefix(rawDiceValue, prefix) || !strings.HasSuffix(rawDiceValue, suffix) {
		// Return with Raw field populated if it's not a template call
		return api.DiceData{Raw: strings.TrimSpace(rawDiceValue)}
	}

	// Extract content between "{{Dice|" and "}}"
	paramList := rawDiceValue[len(prefix) : len(rawDiceValue)-len(suffix)]

	// Split parameters by pipe
	parts := strings.Split(paramList, "|")

	dice := api.DiceData{Raw: ""}

	// Documentation: (Multiplier)|(Die Count)|(Die Sides)|(Add Before Multiplier)|(Add After Multiplier)

	// Positional mapping
	if len(parts) >= 1 {
		dice.Multiplier = stripBrackets(parts[0])
	}
	if len(parts) >= 2 {
		dice.DieCount = stripBrackets(parts[1])
	}
	if len(parts) >= 3 {
		dice.DieSides = stripBrackets(parts[2])
	}
	if len(parts) >= 4 {
		dice.AddBeforeMultiplier = stripBrackets(parts[3])
	}
	if len(parts) >= 5 {
		dice.AddAfterMultiplier = stripBrackets(parts[4])
	}

	// Construct the raw string based on the docs:
	// 1.25[2d8+4]+6
	// {{Dice|(Multiplier)|(Die Count)|(Die Sides)|(Add Before Multiplier)|(Add After Multiplier)}}

	var res strings.Builder
	if dice.Multiplier != "" {
		res.WriteString(dice.Multiplier)
	}

	hasInner := dice.DieCount != "" || dice.DieSides != "" || dice.AddBeforeMultiplier != ""
	if hasInner {
		if dice.Multiplier != "" {
			res.WriteString("[")
		}
		if dice.DieCount != "" {
			res.WriteString(dice.DieCount)
		}
		if dice.DieSides != "" {
			res.WriteString("d")
			res.WriteString(dice.DieSides)
		}
		if dice.AddBeforeMultiplier != "" {
			if !strings.HasPrefix(dice.AddBeforeMultiplier, "-") && !strings.HasPrefix(dice.AddBeforeMultiplier, "+") {
				res.WriteString("+")
			}
			res.WriteString(dice.AddBeforeMultiplier)
		}
		if dice.Multiplier != "" {
			res.WriteString("]")
		}
	}

	if dice.AddAfterMultiplier != "" {
		if !strings.HasPrefix(dice.AddAfterMultiplier, "-") && !strings.HasPrefix(dice.AddAfterMultiplier, "+") {
			res.WriteString("+")
		}
		res.WriteString(dice.AddAfterMultiplier)
	}

	dice.Raw = res.String()

	return dice
}

// parseTemplateLamordiaSlot parses `{{LamordiaSlot|<Slot>|<Type>}}` and returns a
// normalized string like "Lamordia: Melancholic (Weapon)". It accepts both
// long names and short codes for Slot (M/Melancholic, D/Dolorous, I/Miserable,
// W/Woeful) and Type (W/Weapon, A/Armor, E/Accessory). Returns "" if the
// template is malformed or cannot be interpreted.
func parseTemplateLamordiaSlot(raw string) string {
	s := strings.TrimSpace(raw)
	if s == "" {
		return ""
	}
	lower := strings.ToLower(s)
	if !strings.HasPrefix(lower, "{{lamordiaslot") || !strings.HasSuffix(s, "}}") {
		return ""
	}

	// Find parameters after the template name
	after := s[len("{{LamordiaSlot"):]
	i := 0
	for i < len(after) && (after[i] == ' ' || after[i] == '\n' || after[i] == '\t' || after[i] == '\r') {
		i++
	}
	if i >= len(after) || after[i] != '|' {
		return ""
	}
	params := strings.TrimSuffix(after[i+1:], "}}")

	// Split on top-level '|' respecting nested constructs (unlikely here but safe)
	var parts []string
	var cur strings.Builder
	depthBraces := 0
	depthBrackets := 0
	for _, r := range params {
		switch r {
		case '{':
			depthBraces++
			cur.WriteRune(r)
		case '}':
			if depthBraces > 0 {
				depthBraces--
			}
			cur.WriteRune(r)
		case '[':
			depthBrackets++
			cur.WriteRune(r)
		case ']':
			if depthBrackets > 0 {
				depthBrackets--
			}
			cur.WriteRune(r)
		case '|':
			if depthBraces == 0 && depthBrackets == 0 {
				parts = append(parts, strings.TrimSpace(cur.String()))
				cur.Reset()
			} else {
				cur.WriteRune(r)
			}
		default:
			cur.WriteRune(r)
		}
	}
	parts = append(parts, strings.TrimSpace(cur.String()))

	// Expect at least two positional parameters: Slot and Type
	if len(parts) < 2 {
		return ""
	}
	slot := parts[0]
	typ := parts[1]

	// We can leverage augmentTypeFromColor which already supports Lamordia patterns
	// such as "MW", or long form like "Melancholic Weapon".
	combined := strings.TrimSpace(slot + " " + typ)

	// Try code form like MW if both single letters provided
	if len(strings.TrimSpace(slot)) == 1 && len(strings.TrimSpace(typ)) == 1 {
		combined = strings.ToUpper(slot + typ)
	}

	norm := augmentTypeFromColor(combined)
	if norm == "" {
		// Try long form second attempt explicitly
		norm = augmentTypeFromColor(slot + " " + typ)
	}
	return norm
}

// parseTemplateDinoSlot parses `{{DinoSlot|<Slot>|<Type>}}` and returns a
// normalized string like "Isle of Dread: Scale Slot (Weapon):". It accepts both
// long names and short codes for Slot (S/Scale, F/Fang, C/Claw, H/Horn, E/Set)
// and Type (W/Weapon, A/Armor, E/Accessory). Returns "" if the template is
// malformed or cannot be interpreted.
func parseTemplateDinoSlot(raw string) string {
	s := strings.TrimSpace(raw)
	if s == "" {
		return ""
	}
	lower := strings.ToLower(s)
	if !strings.HasPrefix(lower, "{{dinoslot") || !strings.HasSuffix(s, "}}") {
		return ""
	}

	// Find parameters after the template name
	after := s[len("{{DinoSlot"):]
	i := 0
	for i < len(after) && (after[i] == ' ' || after[i] == '\n' || after[i] == '\t' || after[i] == '\r') {
		i++
	}
	if i >= len(after) || after[i] != '|' {
		return ""
	}
	params := strings.TrimSuffix(after[i+1:], "}}")

	// Split on top-level '|' respecting nested constructs
	parts := splitParams(params)

	// Expect at least one parameter: Slot. Type is optional for 'Set' slots.
	if len(parts) < 1 {
		return ""
	}
	slot := strings.ToUpper(strings.TrimSpace(parts[0]))
	typ := ""
	if len(parts) >= 2 {
		typ = strings.ToUpper(strings.TrimSpace(parts[1]))
	}

	famMap := map[string]string{
		"S": "Scale", "SCALE": "Scale",
		"F": "Fang", "FANG": "Fang",
		"C": "Claw", "CLAW": "Claw",
		"H": "Horn", "HORN": "Horn",
		"E": "Set", "SET": "Set",
	}
	items := map[string]string{
		"W": "Weapon", "WEAPON": "Weapon",
		"A": "Armor", "ARMOR": "Armor",
		"E": "Accessory", "ACCESSORY": "Accessory",
	}

	slotName, ok1 := famMap[slot]
	if !ok1 {
		return ""
	}

	if typ != "" {
		if typeName, ok2 := items[typ]; ok2 {
			return fmt.Sprintf("Isle of Dread: %s Slot (%s):", slotName, typeName)
		}
	} else if slot == "E" || slot == "SET" {
		return "Isle of Dread: Set Bonus Slot"
	}

	return ""
}

// parseTemplatePreslottedAugment parses `{{PreslottedAugment|Color|Title|Description}}`
// and returns an AugmentItem.
func parseTemplatePreslottedAugment(raw string) api.AugmentItem {
	s := strings.TrimSpace(raw)
	lower := strings.ToLower(s)
	if !strings.HasPrefix(lower, "{{preslottedaugment") || !strings.HasSuffix(s, "}}") {
		return api.AugmentItem{}
	}

	after := s[len("{{PreslottedAugment"):]
	i := 0
	for i < len(after) && (after[i] == ' ' || after[i] == '\n' || after[i] == '\t' || after[i] == '\r') {
		i++
	}
	if i >= len(after) || after[i] != '|' {
		return api.AugmentItem{}
	}
	params := strings.TrimSuffix(after[i+1:], "}}")
	parts := splitParams(params)

	if len(parts) < 1 {
		return api.AugmentItem{}
	}

	color := strings.TrimSpace(parts[0])
	title := ""
	if len(parts) >= 2 {
		title = strings.TrimSpace(parts[1])
	}

	// Normalise color to what TS expects (e.g., Yellow, Colorless)
	normColor := augmentTypeFromColor(color)
	if normColor == "" {
		normColor = color
	}

	if title == "" {
		return api.AugmentItem{
			AugmentType: normColor,
		}
	}
	return api.AugmentItem{
		Name:        title,
		AugmentType: normColor,
	}
}

func ParseTemplateEmptyAugments(raw string) []api.AugmentItem {
	return parseTemplateEmptyAugments(raw)
}

// parseTemplateEmptyAugments parses `{{EmptyAugments|...}}` and returns a slice of
// up to 8 augment slot identifiers. Recognized simple values like core colors
// and Sun/Moon are normalized via augmentTypeFromColor. If any parameter is a
// nested template (e.g., `{{LamordiaSlot|...}}`), this function will logrus.Fatal
// with the template name so a dedicated parser can be implemented.
func parseTemplateEmptyAugments(raw string) []api.AugmentItem {
	s := strings.TrimSpace(raw)
	if s == "" {
		return nil
	}
	lower := strings.ToLower(s)
	if !strings.HasPrefix(lower, "{{emptyaugments") || !strings.HasSuffix(s, "}}") {
		return nil
	}

	// Locate the first top-level '|' after the template name
	after := s[len("{{EmptyAugments"):]
	i := 0
	for i < len(after) && (after[i] == ' ' || after[i] == '\n' || after[i] == '\t' || after[i] == '\r') {
		i++
	}
	if i >= len(after) || after[i] != '|' {
		return nil
	}
	params := strings.TrimSuffix(after[i+1:], "}}")

	parts := splitParams(params)

	// Process up to 8 parts
	out := make([]api.AugmentItem, 0, 8)
	for _, p := range parts {
		val := strings.TrimSpace(p)
		if val == "" {
			continue
		}
		if strings.HasPrefix(val, "{{") {
			// Handle known nested templates inside EmptyAugments
			lower := strings.ToLower(val)
			if strings.HasPrefix(lower, "{{dinoslot") {
				parsed := parseTemplateDinoSlot(val)
				if parsed != "" {
					out = append(out, api.AugmentItem{AugmentType: parsed})
					if len(out) == 8 {
						break
					}
					continue
				} else {
					// Fallback for DinoSlot that fails to parse fully
					// so we don't logrus.Fatal.
					out = append(out, api.AugmentItem{AugmentType: val})
					if len(out) == 8 {
						break
					}
					continue
				}
			}
			if strings.HasPrefix(lower, "{{lamordiaslot") {
				parsed := parseTemplateLamordiaSlot(val)
				if parsed != "" {
					out = append(out, api.AugmentItem{AugmentType: parsed})
					if len(out) == 8 {
						break
					}
					continue
				} else {
					// Fallback for LamordiaSlot
					out = append(out, api.AugmentItem{AugmentType: val})
					if len(out) == 8 {
						break
					}
					continue
				}
			}
			// Unknown template -> fail fast as agreed
			name := val[2:]
			if idx := strings.IndexAny(name, "|}"); idx != -1 {
				name = name[:idx]
			}
			name = strings.TrimSpace(name)
			logrus.Fatalf("Unhandled nested template in EmptyAugments: %s; full value: %s", name, raw)
		}
		norm := augmentTypeFromColor(val)
		if norm == "" {
			norm = val
		}
		out = append(out, api.AugmentItem{AugmentType: norm})
		if len(out) == 8 {
			break
		}
	}
	return out
}

func parseTemplateCannithCraftingSlots(raw string) []api.AugmentItem {
	s := strings.TrimSpace(raw)
	if s == "" {
		return nil
	}
	lower := strings.ToLower(s)
	if !strings.HasPrefix(lower, "{{cannithcraftingslots") || !strings.HasSuffix(s, "}}") {
		return nil
	}

	out := []api.AugmentItem{
		{AugmentType: "Essence Crafting - Prefix Slot"},
		{AugmentType: "Essence Crafting - Suffix Slot"},
	}

	// Check if there is a parameter
	// Locate the first top-level '|' after the template name
	after := s[len("{{EssenceCraftingSlots"):]
	i := 0
	for i < len(after) && (after[i] == ' ' || after[i] == '\n' || after[i] == '\t' || after[i] == '\r') {
		i++
	}

	if i < len(after) && after[i] == '|' {
		params := strings.TrimSuffix(after[i+1:], "}}")
		parts := splitParams(params)
		if len(parts) > 0 {
			aboveTen := strings.TrimSpace(parts[0])
			if strings.ToLower(aboveTen) == "true" {
				out = append(out, api.AugmentItem{AugmentType: "Essence Crafting - Mark of House Cannith Slot"})
			}
		}
	}

	return out
}
