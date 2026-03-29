package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

var nonAlphaNum = regexp.MustCompile(`[^a-z0-9]+`)
var trimDash = regexp.MustCompile(`(^-+|-+$)`)

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = nonAlphaNum.ReplaceAllString(s, "-")
	s = trimDash.ReplaceAllString(s, "")
	return s
}

func normalizeSlot(slot string) string {
	return slugify(slot)
}

func normalizeGroup(group string) string {
	return slugify(group)
}

func normalizeBonus(bonus string) string {
	return slugify(bonus)
}

func uniqueSortedNormalized(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	out := make([]string, 0, len(values))
	for _, v := range values {
		v = normalizeSlot(v)
		if v == "" {
			continue
		}
		if _, ok := seen[v]; ok {
			continue
		}
		seen[v] = struct{}{}
		out = append(out, v)
	}
	sort.Strings(out)
	return out
}

func intFromAny(v any) int {
	switch t := v.(type) {
	case nil:
		return 0
	case float64:
		return int(t)
	case int:
		return t
	case string:
		n, _ := strconv.Atoi(strings.TrimSpace(t))
		return n
	default:
		return 0
	}
}

func stringifyValue(v any) string {
	switch t := v.(type) {
	case nil:
		return ""
	case string:
		return strings.TrimSpace(t)
	case float64:
		if t == float64(int(t)) {
			return strconv.Itoa(int(t))
		}
		return fmt.Sprintf("%v", t)
	case int:
		return strconv.Itoa(t)
	case []any:
		parts := make([]string, 0, len(t))
		for _, p := range t {
			s := stringifyValue(p)
			if s != "" {
				parts = append(parts, s)
			}
		}
		return strings.Join(parts, ", ")
	case map[string]any:
		keys := make([]string, 0, len(t))
		for k := range t {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		parts := make([]string, 0, len(keys))
		for _, k := range keys {
			s := stringifyValue(t[k])
			if s != "" {
				parts = append(parts, fmt.Sprintf("%s: %s", k, s))
			}
		}
		return strings.Join(parts, "; ")
	default:
		b, _ := json.Marshal(t)
		return string(b)
	}
}

func buildEffectTiers(raw RawEnhancement, effectID string) EffectTiers {
	out := EffectTiers{
		EffectID: effectID,
		Tiers:    []EffectTier{},
	}

	switch stat := raw.Stat.(type) {
	case nil:
		return out
	case []any:
		for i, entry := range stat {
			out.Tiers = append(out.Tiers, EffectTier{
				Tier:  i + 1,
				Value: stringifyValue(entry),
			})
		}
	case []int:
		for i, entry := range stat {
			out.Tiers = append(out.Tiers, EffectTier{
				Tier:  i + 1,
				Value: strconv.Itoa(entry),
			})
		}
	case []float64:
		for i, entry := range stat {
			out.Tiers = append(out.Tiers, EffectTier{
				Tier:  i + 1,
				Value: stringifyValue(entry),
			})
		}
	case map[string]any:
		keys := make([]string, 0, len(stat))
		for k := range stat {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		tierNum := 1
		for _, k := range keys {
			out.Tiers = append(out.Tiers, EffectTier{
				Tier:  tierNum,
				Value: stringifyValue(stat[k]),
			})
			tierNum++
		}
	default:
		out.Tiers = append(out.Tiers, EffectTier{
			Tier:  1,
			Value: stringifyValue(stat),
		})
	}

	applyMinLevelIncrease(&out, raw.MinLevelIncrease)
	out.Tiers = compressEffectTiers(out.Tiers)

	return out
}

func applyMinLevelIncrease(effectTiers *EffectTiers, minLevelIncrease any) {
	if len(effectTiers.Tiers) == 0 || minLevelIncrease == nil {
		return
	}

	processMinimumLevelType(effectTiers, minLevelIncrease)
}

func processMinimumLevelType(effectTiers *EffectTiers, minLevelIncrease any) {
	switch t := minLevelIncrease.(type) {
	case float64, int, string:
		val := intFromAny(t)
		for i := range effectTiers.Tiers {
			effectTiers.Tiers[i].MinLevelIncrease = val
		}
	case []any:
		for i := range effectTiers.Tiers {
			if i < len(t) {
				effectTiers.Tiers[i].MinLevelIncrease = intFromAny(t[i])
			}
		}
	case map[string]any:
		keys := make([]string, 0, len(t))
		for k := range t {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		for i, k := range keys {
			if i < len(effectTiers.Tiers) {
				effectTiers.Tiers[i].MinLevelIncrease = intFromAny(t[k])
			}
		}
	}
}

func compressEffectTiers(tiers []EffectTier) []EffectTier {
	if len(tiers) == 0 {
		return tiers
	}

	compressed := make([]EffectTier, 0, len(tiers))
	var previous *EffectTier

	for _, tier := range tiers {
		if previous == nil {
			t := tier
			compressed = append(compressed, t)
			previous = &compressed[len(compressed)-1]
			continue
		}

		sameValue := tier.Value == previous.Value
		sameMLIncrease := tier.MinLevelIncrease == previous.MinLevelIncrease

		if sameValue && sameMLIncrease {
			continue
		}

		t := tier
		compressed = append(compressed, t)
		previous = &compressed[len(compressed)-1]
	}

	return compressed
}

func buildPlannerEntries(raw RawEnhancement, effectID string) []PlannerEntry {
	out := make([]PlannerEntry, 0)

	enchantmentName := raw.Name
	bonusType := ""
	if len(raw.Enchantments) > 0 {
		if strings.TrimSpace(raw.Enchantments[0].Name) != "" {
			enchantmentName = raw.Enchantments[0].Name
		}
		bonusType = normalizeBonus(raw.Enchantments[0].Bonus)
	}

	group := normalizeGroup(raw.Group)

	appendEntries := func(affixType string, slots []string) {
		for _, slot := range uniqueSortedNormalized(slots) {
			out = append(out, PlannerEntry{
				ID:              fmt.Sprintf("cannith-%s-%s-%s", effectID, affixType, slot),
				SourceType:      "cannith",
				EffectID:        effectID,
				EnchantmentName: enchantmentName,
				BonusType:       bonusType,
				SlotID:          slot,
				AffixType:       affixType,
				Group:           group,
			})
		}
	}

	appendEntries("prefix", raw.Prefix)
	appendEntries("suffix", raw.Suffix)
	appendEntries("extra", raw.Extra)

	sort.Slice(out, func(i, j int) bool {
		return out[i].ID < out[j].ID
	})

	return out
}

func transform(raw []RawEnhancement) (
	[]EffectDefinition,
	[]EffectEnchantment,
	[]EffectPlacement,
	[]EffectTiers,
	[]EffectRecipe,
	[]EffectDisplay,
	[]PlannerEntry,
) {
	effects := make([]EffectDefinition, 0, len(raw))
	enchantments := make([]EffectEnchantment, 0)
	placements := make([]EffectPlacement, 0, len(raw))
	tiers := make([]EffectTiers, 0, len(raw))
	recipes := make([]EffectRecipe, 0, len(raw))
	display := make([]EffectDisplay, 0, len(raw))
	plannerEntries := make([]PlannerEntry, 0)

	effects, enchantments, placements, tiers, recipes, display, plannerEntries = processRawEnchantments(raw)

	sort.Slice(effects, func(i, j int) bool {
		return effects[i].ID < effects[j].ID
	})

	sort.Slice(enchantments, func(i, j int) bool {
		if enchantments[i].EffectID == enchantments[j].EffectID {
			if enchantments[i].Name == enchantments[j].Name {
				return enchantments[i].Bonus < enchantments[j].Bonus
			}
			return enchantments[i].Name < enchantments[j].Name
		}
		return enchantments[i].EffectID < enchantments[j].EffectID
	})

	sort.Slice(placements, func(i, j int) bool {
		return placements[i].EffectID < placements[j].EffectID
	})

	sort.Slice(tiers, func(i, j int) bool {
		return tiers[i].EffectID < tiers[j].EffectID
	})

	sort.Slice(recipes, func(i, j int) bool {
		return recipes[i].EffectID < recipes[j].EffectID
	})

	sort.Slice(display, func(i, j int) bool {
		return display[i].EffectID < display[j].EffectID
	})

	sort.Slice(plannerEntries, func(i, j int) bool {
		return plannerEntries[i].ID < plannerEntries[j].ID
	})

	return effects, enchantments, placements, tiers, recipes, display, plannerEntries
}

func processRawEnchantments(raw []RawEnhancement) ([]EffectDefinition, []EffectEnchantment, []EffectPlacement, []EffectTiers, []EffectRecipe, []EffectDisplay, []PlannerEntry) {
	effects := make([]EffectDefinition, 0, len(raw))
	enchantments := make([]EffectEnchantment, 0)
	placements := make([]EffectPlacement, 0, len(raw))
	tiers := make([]EffectTiers, 0, len(raw))
	recipes := make([]EffectRecipe, 0, len(raw))
	display := make([]EffectDisplay, 0, len(raw))
	plannerEntries := make([]PlannerEntry, 0)

	for _, r := range raw {
		if strings.TrimSpace(r.Name) == "" {
			continue
		}

		effectID := slugify(r.Name)

		effects = append(effects, EffectDefinition{
			ID:    effectID,
			Name:  r.Name,
			Group: normalizeGroup(r.Group),
		})

		enchantments = processEnchantments(r, enchantments, effectID)

		placements = append(placements, EffectPlacement{
			EffectID:    effectID,
			PrefixSlots: uniqueSortedNormalized(r.Prefix),
			SuffixSlots: uniqueSortedNormalized(r.Suffix),
			ExtraSlots:  uniqueSortedNormalized(r.Extra),
		})

		effectTiers := buildEffectTiers(r, effectID)
		if len(effectTiers.Tiers) > 0 {
			tiers = append(tiers, effectTiers)
		}

		if r.Bound != nil || r.Unbound != nil {
			recipes = append(recipes, EffectRecipe{
				EffectID: effectID,
				Bound:    r.Bound,
				Unbound:  r.Unbound,
			})
		}

		if r.PrefixTitle != "" || r.SuffixTitle != "" {
			display = append(display, EffectDisplay{
				EffectID:    effectID,
				PrefixTitle: r.PrefixTitle,
				SuffixTitle: r.SuffixTitle,
			})
		}

		plannerEntries = append(plannerEntries, buildPlannerEntries(r, effectID)...)
	}
	return effects, enchantments, placements, tiers, recipes, display, plannerEntries
}

func processEnchantments(r RawEnhancement, enchantments []EffectEnchantment, effectID string) []EffectEnchantment {
	for _, ench := range r.Enchantments {
		if strings.TrimSpace(ench.Name) == "" {
			continue
		}
		enchantments = append(enchantments, EffectEnchantment{
			EffectID: effectID,
			Name:     ench.Name,
			Bonus:    normalizeBonus(ench.Bonus),
		})
	}
	return enchantments
}
