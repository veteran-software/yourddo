package parser

import (
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"compendium-crawler-go/api"
	"compendium-crawler-go/cleanup"
)

const (
	viktranium           = "Viktranium"
	viktraniumCrafting   = viktranium + " Crafting"
	dinosaurBone         = "Dinosaur Bone"
	dinosaurBoneCrafting = dinosaurBone + " Crafting"
)

// ProcessAugmentMap parses raw wikitext pages into AugmentItem outputs.
func ProcessAugmentMap(rawContentMap map[string]string) []api.AugmentItem {
	results := make([]api.AugmentItem, 0, len(rawContentMap))
	for title, raw := range rawContentMap {
		if preUSuffixRegex.MatchString(title) {
			continue
		}
		if strings.Contains(strings.ToLower(raw), "{{discontinued}}") || strings.Contains(strings.ToLower(raw), "{{discontinued|") {
			continue
		}
		if strings.Contains(strings.ToLower(raw), "{{starter}}") {
			continue
		}
		cleaned := cleanup.CleanRawContent(raw)
		fields, err := parseTemplateFields(cleaned)
		if err != nil {
			// Skip redirects/empty and non-template pages quietly
			continue
		}
		// Basic sanity: this should be an Augment template
		// Many pages have type set; not required here.
		if len(fields) > 0 {
			out := ConvertAugmentToJSON(title, fields)

			// Check if the augment is marked as discontinued via its drop locations
			isDiscontinued := false
			if val, ok := fields["droplocation"]; ok {
				drops := ParseMultiTemplateDropLocation(val)
				for _, d := range drops {
					if d.SourceType == "Discontinued" {
						isDiscontinued = true
						break
					}
				}
			}
			if isDiscontinued {
				continue
			}

			results = append(results, out)
		}
	}

	// Manually inject temporary Diamond skill augments (Colorless) until
	// Compendium pages exist. Avoid duplicates by name.
	existing := map[string]bool{}
	for _, it := range results {
		existing[strings.ToLower(strings.TrimSpace(it.Name))] = true
	}
	manual := buildManualDiamondSkillAugments(existing)
	if len(manual) > 0 {
		results = append(results, manual...)
	}

	// Alphabetize by item name using natural order (case-insensitive, number-aware)
	sort.SliceStable(results, func(i, j int) bool {
		return naturalLess(results[i].Name, results[j].Name)
	})
	return results
}

// naturalLess compares two strings using case-insensitive, number-aware natural ordering.
// Examples: "1" < "2" < "10"; "Item 2" < "Item 10" < "Item 11".
func naturalLess(a, b string) bool {
	sa := strings.TrimSpace(a)
	sb := strings.TrimSpace(b)
	la := strings.ToLower(sa)
	lb := strings.ToLower(sb)

	ia, ib := 0, 0
	for ia < len(la) && ib < len(lb) {
		ca := la[ia]
		cb := lb[ib]

		if isDigitByte(ca) && isDigitByte(cb) {
			na, naNext := parseNumber(la, ia)
			nb, nbNext := parseNumber(lb, ib)
			if na != nb {
				return na < nb
			}
			ia, ib = naNext, nbNext
			continue
		}

		if ca != cb {
			return ca < cb
		}
		ia++
		ib++
	}

	if ia != ib {
		return ia == len(la)
	}

	if la == lb {
		return sa < sb
	}
	return la < lb
}

func isDigitByte(b byte) bool { return b >= '0' && b <= '9' }

func parseNumber(s string, i int) (int, int) {
	j := i
	for j < len(s) && isDigitByte(s[j]) {
		j++
	}
	n, err := strconv.Atoi(s[i:j])
	if err != nil {
		return 0, j
	}
	return n, j
}

func ConvertAugmentToJSON(pageTitle string, fields map[string]string) api.AugmentItem {
	var out api.AugmentItem

	parseBasicFields(&out, fields, pageTitle)
	parseDropAndCrafting(&out, fields, pageTitle)
	determineAugmentTypeAndImage(&out, fields, pageTitle)
	parseEffects(&out, fields)

	return out
}

func parseBasicFields(out *api.AugmentItem, fields map[string]string, pageTitle string) {
	out.Name = firstNonEmpty(fields["name"], pageTitle)
	out.Description = fields["description"]

	if mv := strings.TrimSpace(fields["minlevel"]); mv != "" {
		if i, err := strconv.Atoi(mv); err == nil {
			out.MinimumLevel = &i
		}
	}

	if amv := strings.TrimSpace(fields["absoluteminlevel"]); amv != "" {
		if i, err := strconv.Atoi(amv); err == nil {
			out.AbsoluteMinLevel = &i
		}
	}

	if b := strings.TrimSpace(fields["binding"]); b != "" {
		out.Binding = parseBinding(b)
	}

	out.Material = fields["material"]
	if h := strings.TrimSpace(fields["hardness"]); h != "" {
		if i, err := strconv.Atoi(h); err == nil {
			out.Hardness = &i
		}
	}
	if d := strings.TrimSpace(fields["durability"]); d != "" {
		if i, err := strconv.Atoi(d); err == nil {
			out.Durability = &i
		}
	}
	if w := strings.TrimSpace(fields["weight"]); w != "" {
		if f, err := strconv.ParseFloat(w, 64); err == nil {
			out.Weight = &f
		}
	}
	if u := strings.TrimSpace(fields["update"]); u != "" {
		uStr := strings.TrimPrefix(strings.ToLower(u), "update")
		uStr = strings.TrimSpace(uStr)
		if i, err := strconv.Atoi(uStr); err == nil {
			out.Update = &i
		}
	}
}

func parseDropAndCrafting(out *api.AugmentItem, fields map[string]string, pageTitle string) {
	if val, ok := fields["droplocation"]; ok {
		drops := ParseMultiTemplateDropLocation(val)

		if out.CraftedIn == "" {
			for _, d := range drops {
				switch d.SourceType {
				case viktraniumCrafting:
					out.CraftedIn = viktraniumCrafting
				case dinosaurBoneCrafting:
					out.CraftedIn = dinosaurBoneCrafting
				case "CraftedAugment":
					out.CraftedIn = firstNonEmpty(d.CraftLocation, "Crafted Augment")
				case "Crafting":
					ci := strings.TrimSpace(strings.Join(filterNonEmpty([]string{d.CraftingType, d.CraftingLocation}), " - "))
					out.CraftedIn = firstNonEmpty(ci, d.CraftingType, d.CraftingLocation, "Crafting")
				}
				if out.CraftedIn != "" {
					break
				}
			}
		}

		vikPrefix := ""
		if out.MinimumLevel != nil && *out.MinimumLevel >= 31 {
			vikPrefix = "Legendary Bleak "
		} else {
			nameLower := strings.ToLower(firstNonEmpty(out.Name, pageTitle))
			if strings.Contains(nameLower, "(legendary)") {
				vikPrefix = "Legendary Bleak "
			} else if strings.Contains(nameLower, "(heroic)") {
				vikPrefix = "Bleak "
			} else if out.MinimumLevel != nil {
				vikPrefix = "Bleak "
			}
		}

		var reqItems []api.AugmentItem
		for _, d := range drops {
			switch d.SourceType {
			case viktraniumCrafting:
				for _, r := range buildCraftRequirements(d, vikPrefix) {
					reqItems = append(reqItems, api.AugmentItem{
						Title:          r.Title,
						Quantity:       r.Quantity,
						IngredientType: r.IngredientType,
					})
				}
			case dinosaurBoneCrafting:
				for _, r := range buildCraftRequirements(d, "") {
					reqItems = append(reqItems, api.AugmentItem{
						Name:           r.Title,
						Quantity:       r.Quantity,
						IngredientType: r.IngredientType,
					})
				}
			}
		}
		if len(reqItems) > 0 {
			out.Requirements = reqItems
		}

		nonCraftDrops := make([]api.DropSourceData, 0, len(drops))
		for _, d := range drops {
			switch d.SourceType {
			case viktraniumCrafting, dinosaurBoneCrafting, "CraftedAugment", "Crafting":
			default:
				nonCraftDrops = append(nonCraftDrops, d)
			}
		}
		out.FoundIn = summarizeDropSources(nonCraftDrops)
	}

	if ci := strings.TrimSpace(fields["craftedIn"]); ci != "" {
		out.CraftedIn = ci
	} else if out.CraftedIn == "" {
		for k, v := range fields {
			if craftedInKeyRegex.MatchString(k) {
				out.CraftedIn = strings.TrimSpace(v)
				break
			}
		}
	}
}

func determineAugmentTypeAndImage(out *api.AugmentItem, fields map[string]string, pageTitle string) {
	if col := strings.TrimSpace(fields["color"]); col != "" {
		if at := augmentTypeFromColor(col); at != "" {
			out.AugmentType = at
		}
	}

	if out.AugmentType == "" {
		if u := strings.TrimSpace(fields["use"]); u != "" {
			if colorFromUse := extractAugmentColorFromUse(u); colorFromUse != "" {
				if at := augmentTypeFromColor(colorFromUse); at != "" {
					out.AugmentType = at
				}
			}
		}
	}

	if out.AugmentType == "" {
		icon := strings.TrimSpace(fields["icon"])
		if icon == "" {
			icon = strings.TrimSpace(fields["image"])
		}
		if icon != "" {
			if at := augmentTypeFromIcon(icon); at != "" {
				out.AugmentType = at
			}
		}
	}

	if out.AugmentType == "" {
		if at := inferAugmentTypeFromName(firstNonEmpty(out.Name, pageTitle)); at != "" {
			out.AugmentType = at
		}
	}

	{
		nameLower := strings.ToLower(firstNonEmpty(out.Name, pageTitle))
		nameLowerTrim := strings.TrimSpace(nameLower)
		if strings.Contains(nameLowerTrim, "solar gem of") {
			out.AugmentType = "Sun"
		} else if strings.HasPrefix(nameLowerTrim, "lunar gem of") {
			out.AugmentType = "Moon"
		}
	}

	iconVal := strings.TrimSpace(fields["icon"])
	if mappedImg := mapIconToImage(iconVal); mappedImg != "" {
		out.Image = mappedImg
	} else if mappedAtImg := mapAugmentTypeToImage(out.AugmentType); mappedAtImg != "" {
		out.Image = mappedAtImg
	} else {
		out.Image = fields["image"]
	}
}

func parseEffects(out *api.AugmentItem, fields map[string]string) {
	if rawE, ok := fields["enchantments"]; ok {
		ench := ParseEnchantments(rawE, strings.ToLower(fields["type"]))
		normal, sets := ExtractSetBonus(ench)
		if len(sets) > 0 {
			out.SetBonus = []api.SetBonusOut{sets[0]}
		}
		out.EffectsAdded = mapEnchantmentsToPartial(normal)
	}

	if len(out.EffectsAdded) == 0 && strings.Contains(strings.ToLower(out.Description), "sneak attack") {
		desc := out.Description
		reSneak := regexp.MustCompile(`(?i)\+?\s*(\d+)\s*%?\s*(?:[A-Za-z ]*?)\bSneak Attack\b`)
		reSneakDmg := regexp.MustCompile(`(?i)\+?\s*(\d+)\s*%?\s*(?:[A-Za-z ]*?)\bSneak Attack Damage\b`)

		var effects []api.PartialEnhancementOut
		if m := reSneak.FindStringSubmatch(desc); len(m) == 2 {
			if val, err := strconv.Atoi(m[1]); err == nil {
				effects = append(effects, api.PartialEnhancementOut{
					Name:     "Sneak Attack Rolls",
					Modifier: val,
					Bonus:    "Enhancement",
				})
			}
		}
		if m := reSneakDmg.FindStringSubmatch(desc); len(m) == 2 {
			if val, err := strconv.Atoi(m[1]); err == nil {
				effects = append(effects, api.PartialEnhancementOut{
					Name:     "Sneak Attack Damage Rolls",
					Modifier: val,
					Bonus:    "Enhancement",
				})
			}
		}
		if len(effects) > 0 {
			out.EffectsAdded = effects
		}
	}

	if rawR := strings.TrimSpace(fields["effectsremoved"]); rawR != "" {
		ench := ParseEnchantments(rawR, strings.ToLower(fields["type"]))
		out.EffectsRemoved = mapEnchantmentsToPartial(ench)
	}

	if strings.EqualFold(out.Name, "The Master's Gift") {
		out.EffectsAdded = []api.PartialEnhancementOut{
			{
				Name:     "Experience Point Gain",
				Bonus:    "Enhancement",
				Modifier: "5%",
			},
		}
	}
}

// inferAugmentTypeFromName maps well-known gem names to augment types when
// color metadata is missing from the page.
func inferAugmentTypeFromName(name string) string {
	n := strings.ToLower(strings.TrimSpace(name))
	if n == "" {
		return ""
	}
	// Normalize whitespace and remove some common punctuation
	n = strings.ReplaceAll(n, "  ", " ")

	// Check Solar/Lunar first to avoid accidental matches
	if strings.HasPrefix(n, "solar gem") || strings.Contains(n, " solar gem") || strings.HasPrefix(n, "solar ") {
		return "Sun"
	}
	if strings.HasPrefix(n, "lunar gem") || strings.Contains(n, " lunar gem") || strings.HasPrefix(n, "lunar ") {
		return "Moon"
	}

	// Core color gems
	if strings.HasPrefix(n, "diamond") || strings.Contains(n, " diamond of") {
		return "Colorless"
	}
	if strings.HasPrefix(n, "topaz") || strings.Contains(n, " topaz of") {
		return "Yellow"
	}
	if strings.HasPrefix(n, "sapphire") || strings.Contains(n, " sapphire of") {
		return "Blue"
	}

	// Ruby family
	if strings.HasPrefix(n, "ruby") || strings.Contains(n, " ruby of") {
		return "Red"
	}

	// Emerald family
	if strings.HasPrefix(n, "emerald") || strings.Contains(n, " emerald of") {
		return "Green"
	}

	return ""
}

// mapIconToImage maps an icon field value to a specific image field value (for frontend use).
func mapIconToImage(icon string) string {
	if icon == "" {
		return ""
	}

	switch strings.TrimSpace(icon) {
	case "Augment Blue 3":
		return "blueAugmentGreenBorder"

	case "Augment Colorless 1":
		return "colorlessAugmentBlueBorder"
	case "Augment Colorless 3":
		return "colorlessAugmentGreenBorder"

	case "Augment Green 1":
		return "greenAugmentBlueBorder"

	case "Augment Orange 1":
		return "orangeAugmentBlueBorder"

	case "Augment Red 1":
		return "redAugmentBlueBorder"
	case "Augment Red 5":
		return "augmentRedBookBlueBorder"

	case "Augment Yellow 1":
		return "yellowAugmentBlueBorder"

	case "Raid Augment Orange 1":
		return "orangeAugmentOrangeBorder"
	case "Raid Augment Orange 2":
		return "augmentOrangeBookOrangeBorder"

	case "Raid Augment Yellow 1":
		return "yellowAugmentOrangeBorder"
	}

	return ""
}

// mapAugmentTypeToImage maps a normalized augmentType to a frontend image identifier.
func mapAugmentTypeToImage(at string) string {
	if at == "" {
		return ""
	}

	// Case-insensitive mapping for safety, though at is usually normalized.
	low := strings.ToLower(at)

	// Lamordia: Dolorous (Weapon/Accessory/Armor) -> dolorousAugment
	if strings.Contains(low, "lamordia: dolorous") {
		return "dolorousAugment"
	}

	return ""
}

// augmentTypeFromIcon attempts to derive the augment color/type from an icon or image filename/path.
// It detects tokens like "red", "blue", "green", "yellow", "orange", "purple", "colorless",
// as well as "sun"/"solar" and "moon"/"lunar". Returns a normalized augmentType string or empty string.
func augmentTypeFromIcon(icon string) string {
	if strings.TrimSpace(icon) == "" {
		return ""
	}
	lower := strings.ToLower(icon)

	// Quick helpers to check token presence in filenames/paths
	has := func(token string) bool {
		return strings.Contains(lower, token)
	}

	switch {
	case has("colorless") || has("clr"):
		return "Colorless"
	case has("yellow") || has("ylw"):
		return "Yellow"
	case has("red"):
		return "Red"
	case has("blue"):
		return "Blue"
	case has("green"):
		return "Green"
	case has("purple") || has("violet"):
		return "Purple"
	case has("orange"):
		return "Orange"
	case has("sun") || has("solar"):
		return "Sun"
	case has("moon") || has("lunar"):
		return "Moon"
	}
	// No obvious token
	return ""
}

func mapEnchantmentsToPartial(in []api.Enchantment) []api.PartialEnhancementOut {
	out := make([]api.PartialEnhancementOut, 0, len(in))
	for _, e := range in {
		var mod interface{}
		if e.Amount != "" {
			// try parse number, otherwise keep string
			if i, err := strconv.Atoi(e.Amount); err == nil {
				mod = i
			} else {
				mod = e.Amount
			}
		}
		p := api.PartialEnhancementOut{
			Name:     e.Name,
			Modifier: mod,
			Bonus:    e.BonusType,
		}
		if e.Notes != nil {
			p.Notes = *e.Notes
		}
		out = append(out, p)
	}
	return out
}

func parseBinding(s string) *api.BindingOut {
	lower := strings.ToLower(strings.TrimSpace(s))

	// Handle shorthand codes first
	switch lower {
	case "btaoa": // bound to account on acquire
		return &api.BindingOut{Type: "Bound", To: "Account", From: "Acquisition"}
	case "btaoe": // bound to account on equip
		return &api.BindingOut{Type: "Bound", To: "Account", From: "Equip"}
	case "btcoa": // bound to character on acquire
		return &api.BindingOut{Type: "Bound", To: "Character", From: "Acquisition"}
	case "btcoe": // bound to character on equip
		return &api.BindingOut{Type: "Bound", To: "Character", From: "Equip"}
	}

	// Fallback: parse descriptive text
	b := &api.BindingOut{}
	if strings.Contains(lower, "bound") {
		b.Type = "Bound"
	} else if strings.Contains(lower, "unbound") {
		b.Type = "Unbound"
	}
	if strings.Contains(lower, "account") {
		b.To = "Account"
	} else if strings.Contains(lower, "character") {
		b.To = "Character"
	}
	if strings.Contains(lower, "acquisition") || strings.Contains(lower, "acquire") {
		b.From = "Acquisition"
	} else if strings.Contains(lower, "equip") {
		b.From = "Equip"
	}

	// If nothing parsed, return nil to omit field
	if b.Type == "" && b.To == "" && b.From == "" {
		return nil
	}
	// Default to Unbound if type not specified but there is some content
	if b.Type == "" {
		b.Type = "Unbound"
	}
	return b
}

func summarizeDropSources(drops []api.DropSourceData) []string {
	var result []string
	for _, d := range drops {
		if s := formatDropSource(d); s != "" {
			result = append(result, s)
		}
	}
	return uniqueStrings(result)
}

func formatDropSource(d api.DropSourceData) string {
	switch d.SourceType {
	case "Quest":
		title := firstNonEmpty(d.TitleForLink, d.QuestWildernessChain)
		if d.WhichChestPerson != "" {
			return fmt.Sprintf("%s (%s)", title, d.WhichChestPerson)
		}
		return title
	case "Store":
		if d.StoreName != "" {
			return "Store: " + d.StoreName
		}
	case "AdventurePack":
		if d.AdventurePack != "" {
			return "Adventure Pack: " + d.AdventurePack
		}
	case "MimicTokenPurchase":
		if d.MimicTokenCount != "" {
			return fmt.Sprintf("Glynereth: Purchase for %sx Mimic Token. This is only available during the Mimic Hunt.", d.MimicTokenCount)
		}
		return "Glynereth: Purchase for Mimic Tokens. This is only available during the Mimic Hunt."
	case "Ingredient":
		if d.IngredientCount != "" && d.IngredientCount != "1" {
			return fmt.Sprintf("Crafted: Requires %sx %s", d.IngredientCount, d.IngredientName)
		}
		return fmt.Sprintf("Crafted: Requires %s", d.IngredientName)
	default:
		joinedFields := filterNonEmpty([]string{d.QuestWildernessChain, d.StoreName, d.AdventurePack, d.EventName})
		return strings.TrimSpace(strings.Join(joinedFields, ", "))
	}
	return ""
}

func uniqueStrings(in []string) []string {
	seen := make(map[string]bool)
	var out []string
	for _, v := range in {
		v = strings.TrimSpace(v)
		if v == "" || seen[v] {
			continue
		}
		seen[v] = true
		out = append(out, v)
	}
	return out
}

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

var craftedInKeyRegex = regexp.MustCompile(`(?i)crafted\s*in`)

// filterNonEmpty returns a new slice containing only non-empty, trimmed strings
func filterNonEmpty(in []string) []string {
	out := make([]string, 0, len(in))
	for _, s := range in {
		s = strings.TrimSpace(s)
		if s != "" {
			out = append(out, s)
		}
	}
	return out
}

// buildCraftRequirements converts crafting-specific DropSourceData into a list of
// CraftingIngredientOut with parsed quantities.
func buildCraftRequirements(d api.DropSourceData, vikPrefix string) []api.CraftingIngredientOut {
	toQty := func(s string) *int {
		s = strings.TrimSpace(s)
		if s == "" {
			return nil
		}
		// remove commas and any non-digit suffix/prefix
		cleaned := make([]rune, 0, len(s))
		for _, r := range s {
			if r >= '0' && r <= '9' {
				cleaned = append(cleaned, r)
			}
		}
		if len(cleaned) == 0 {
			return nil
		}
		if n, err := strconv.Atoi(string(cleaned)); err == nil {
			return &n
		}
		return nil
	}

	add := func(list []api.CraftingIngredientOut, title, ingredientType, qtyStr string) []api.CraftingIngredientOut {
		q := toQty(qtyStr)
		if q == nil {
			return list
		}
		// Apply Viktranium prefix when requested
		if vikPrefix != "" && ingredientType == "Viktranium" {
			title = strings.TrimSpace(vikPrefix + title)
		}
		list = append(list, api.CraftingIngredientOut{
			Title:          title,
			Quantity:       q,
			IngredientType: ingredientType,
		})
		return list
	}

	var out []api.CraftingIngredientOut
	switch d.SourceType {
	case viktraniumCrafting:
		// Use singular titles for Viktranium-crafted augment requirements
		out = add(out, "Transformer", viktranium, d.ViktraniumTransformers)
		out = add(out, "Memento", viktranium, d.ViktraniumMementos)
		out = add(out, "Wire", viktranium, d.ViktraniumWires)
		out = add(out, "Conductor", viktranium, d.ViktraniumConductors)
		out = add(out, "Insulator", viktranium, d.ViktraniumInsulators)
		out = add(out, "Alternator", viktranium, d.ViktraniumAlternators)
		out = add(out, "Resistor", viktranium, d.ViktraniumResistors)
	case dinosaurBoneCrafting:
		// Use in-game singular names for each Dinosaur Bone ingredient
		out = add(out, "Fossilized Raptor Claw", dinosaurBone, d.BoneRaptor)
		out = add(out, "Fossilized Triceratops Horn", dinosaurBone, d.BoneTriceratops)
		out = add(out, "Fossilized Pteranodon Vertebra", dinosaurBone, d.BonePteradon)
		out = add(out, "Fossilized Ankylosaur Rib", dinosaurBone, d.BoneAnkylosaur)
		out = add(out, "Fossilized Tyrannosaurus Tooth", dinosaurBone, d.BoneTyrannosaurus)
		out = add(out, "Black Pearl", "Black Pearls", d.BlackPearls)
	}
	return out
}

// augmentTypeFromColor maps the Augment template `color` field into a TAugmentType string
// covering Core colors, Isle of Dread families, and Lamordia moods. Accepts both
// long names and short codes shown in Template:Augment reference.
func augmentTypeFromColor(color string) string {
	s := strings.TrimSpace(color)
	if s == "" {
		return ""
	}
	upper := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(s, "-", " "), "_", " "))
	upper = strings.Join(filterNonEmpty(strings.Fields(upper)), " ")

	// 1) Core color wheel (single letter or full word)
	coreMap := map[string]string{
		"C": "Colorless", "COLORLESS": "Colorless",
		"Y": "Yellow", "YELLOW": "Yellow",
		"R": "Red", "RED": "Red",
		"B": "Blue", "BLUE": "Blue",
		"G": "Green", "GREEN": "Green",
		"P": "Purple", "PURPLE": "Purple",
		"O": "Orange", "ORANGE": "Orange",
	}
	if v, ok := coreMap[upper]; ok {
		return v
	}

	// 1b) Special core slots: Sun/Moon (a.k.a Solar/Lunar)
	if upper == "SUN" || upper == "SOLAR" {
		return "Sun"
	}
	if upper == "MOON" || upper == "LUNAR" {
		return "Moon"
	}

	// 2) Isle of Dread Set Bonus special token
	if upper == "IOD SET BONUS" || upper == "IODSET" || upper == "ISLE OF DREAD SET BONUS" {
		return "Isle of Dread: Set Bonus"
	}

	// 3) Isle of Dread family + item mappings
	iodFamilies := map[string]string{
		"SCALE": "Scale",
		"FANG":  "Fang",
		"CLAW":  "Claw",
		"HORN":  "Horn",
		"SET":   "Set",
	}
	items := map[string]string{
		"WEAPON":    "Weapon",
		"ARMOR":     "Armor",
		"ACCESSORY": "Accessory",
		"W":         "Weapon",
		"A":         "Armor",
		"E":         "Accessory",
	}
	// Try two-letter IoD codes like SA, SW, SE, FA, FW, FE, CA, CW, CE, HA, HW, HE, EA, EW, EE
	if len(upper) == 2 {
		famCode := string(upper[0])
		itemCode := string(upper[1])
		famMap := map[string]string{"S": "Scale", "F": "Fang", "C": "Claw", "H": "Horn", "E": "Set"}
		if fam, ok := famMap[famCode]; ok {
			if it, ok2 := items[itemCode]; ok2 {
				return fmt.Sprintf("Isle of Dread: %s (%s)", fam, it)
			}
		}
	}
	// Try long form like "Scale Armor"
	for famKey, famName := range iodFamilies {
		if strings.HasPrefix(upper, famKey+" ") {
			rest := strings.TrimSpace(strings.TrimPrefix(upper, famKey+" "))
			if it, ok := items[rest]; ok {
				return fmt.Sprintf("Isle of Dread: %s (%s)", famName, it)
			}
		}
	}

	// 4) Lamordia moods (codes like MW/MA/ME etc or words)
	moodMap := map[string]string{
		"MELANCHOLIC": "Melancholic",
		"MISERABLE":   "Miserable",
		"DOLOROUS":    "Dolorous",
		"WOEFUL":      "Woeful",
		"M":           "Melancholic",
		"I":           "Miserable",
		"D":           "Dolorous",
		"W":           "Woeful",
	}
	if len(upper) == 2 { // ex: MW, MA, ME, DW, DE, etc.
		mood := moodMap[string(upper[0])]
		it := items[string(upper[1])]
		if mood != "" && it != "" {
			return fmt.Sprintf("Lamordia: %s (%s)", mood, it)
		}
	}
	// Long form like "Melancholic Weapon" / "Miserable Accessory"
	for mk, mv := range moodMap {
		if len(mk) == 1 { // skip single-letter here
			continue
		}
		if strings.HasPrefix(upper, mk+" ") {
			rest := strings.TrimSpace(strings.TrimPrefix(upper, mk+" "))
			if it, ok := items[rest]; ok {
				return fmt.Sprintf("Lamordia: %s (%s)", mv, it)
			}
		}
	}

	// Nothing matched
	return ""
}

// extractAugmentColorFromUse attempts to find an embedded {{Augment ...}} template
// inside the `use` field (common on pages authored with Template:Material) and
// returns the best-effort value of its color parameter. It supports both
// positional color (first param) and named keys like color= / c=, tolerating
// nested templates/links within the parameter list.
func extractAugmentColorFromUse(useVal string) string {
	if strings.TrimSpace(useVal) == "" {
		return ""
	}

	// Work on copies for case-insensitive search
	raw := useVal
	lower := strings.ToLower(raw)
	needle := "{{augment"

	start := 0
	for {
		idx := strings.Index(lower[start:], needle)
		if idx == -1 {
			break
		}
		idx += start // absolute index in raw

		// From idx, walk forward to find the matching closing '}}' while
		// tracking nested braces depth.
		depth := 0
		end := -1
		for i := idx; i < len(raw); i++ {
			// Look ahead safely for two-char tokens
			if i+1 < len(raw) {
				pair := raw[i : i+2]
				if pair == "{{" {
					depth++
					i++
					continue
				}
				if pair == "}}" {
					depth--
					i++
					if depth == 0 {
						end = i + 1 // inclusive end index
						break
					}
					continue
				}
			}
		}

		if end != -1 {
			tpl := raw[idx:end]
			if c := parseAugmentTemplateColorParam(tpl); c != "" {
				return c
			}
			// Continue searching after this template
			start = end
		} else {
			// Unbalanced braces; stop to avoid infinite loop
			break
		}
	}
	return ""
}

// parseAugmentTemplateColorParam parses a substring that starts with
// "{{Augment" and ends with the matching "}}". It extracts the color value
// either from a named parameter (color= or c=) or from the first positional
// argument.
func parseAugmentTemplateColorParam(tpl string) string {
	// Normalize leading/trailing whitespace
	s := strings.TrimSpace(tpl)
	if !strings.HasPrefix(strings.ToLower(s), "{{augment") || !strings.HasSuffix(s, "}}") {
		return ""
	}
	// Find the first top-level '|' following the name; if none, there are no params
	after := s[len("{{Augment"):]
	// Skip whitespace/newlines
	i := 0
	for i < len(after) && (after[i] == ' ' || after[i] == '\n' || after[i] == '\t' || after[i] == '\r') {
		i++
	}
	if i >= len(after) || after[i] != '|' {
		return ""
	}
	params := strings.TrimSuffix(after[i+1:], "}}")

	// Split on top-level pipes, respecting nested templates and links
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
	if cur.Len() > 0 {
		parts = append(parts, strings.TrimSpace(cur.String()))
	}

	strip := func(v string) string {
		v = strings.TrimSpace(v)
		if strings.HasPrefix(v, "[[") && strings.HasSuffix(v, "]]") {
			inner := strings.TrimSuffix(strings.TrimPrefix(v, "[["), "]]")
			if segs := strings.Split(inner, "|"); len(segs) > 1 {
				v = segs[len(segs)-1]
			} else {
				v = inner
			}
		}
		return strings.TrimSpace(v)
	}

	// Look for named parameter first
	for _, p := range parts {
		if p == "" {
			continue
		}
		if kv := strings.SplitN(p, "=", 2); len(kv) == 2 {
			key := strings.ToLower(strings.TrimSpace(kv[0]))
			val := strip(kv[1])
			if key == "color" || key == "c" {
				return val
			}
		}
	}
	// Fallback: first positional argument
	if len(parts) > 0 {
		return strip(parts[0])
	}
	return ""
}

// buildManualDiamondSkillAugments generates a temporary set of Colorless Diamond
// skill augments that are currently missing from the API. These should be
// injected on every run until the Compendium pages are created.
//
// Naming pattern: "Diamond of <Skill> +<N>"
// EffectsAdded: { name: "<Skill> Skill", modifier: N, bonus: "Enhancement" }
// MinimumLevels and values:
//
//	ML 4 : +5; ML 8 : +10; ML 12 : +13; ML 16 : +15;
//	ML 20: +17; ML 24: +18; ML 28: +19; ML 32: +20
//
// FoundIn: ["Random chests throughout the game"]
// AugmentType: "Colorless"
func buildManualDiamondSkillAugments(existing map[string]bool) []api.AugmentItem {
	// Skills to generate
	skills := []string{
		"Balance",
		"Bluff",
		"Concentration",
		"Diplomacy",
		"Disable Device",
		"Haggle",
		"Heal",
		"Hide",
		"Intimidate",
		"Jump",
		"Listen",
		"Move Silently",
		"Open Lock",
		"Perform",
		"Repair",
		"Search",
		"Spellcraft",
		"Spot",
		"Swim",
	}

	// Level/value pairs in ascending order
	type lvlVal struct{ lvl, val int }
	levels := []lvlVal{
		{4, 5},
		{8, 10},
		{12, 13},
		{16, 15},
		{20, 17},
		{24, 18},
		{28, 19},
		{32, 20},
	}

	out := make([]api.AugmentItem, 0, len(skills)*len(levels))
	for _, skill := range skills {
		for _, lv := range levels {
			name := fmt.Sprintf("Diamond of %s +%d", skill, lv.val)
			key := strings.ToLower(strings.TrimSpace(name))
			if existing != nil && existing[key] {
				// Skip if an item with this name already exists from API
				continue
			}
			// Build EffectsAdded entry
			effect := api.PartialEnhancementOut{
				Name:     fmt.Sprintf("%s Skill", skill),
				Modifier: lv.val,
				Bonus:    "Enhancement",
			}
			// MinimumLevel pointer
			out = append(out, api.AugmentItem{
				Name:         name,
				MinimumLevel: new(lv.lvl),
				FoundIn:      []string{"Random chests"},
				AugmentType:  "Colorless",
				EffectsAdded: []api.PartialEnhancementOut{effect},
			})
		}
	}
	return out
}
