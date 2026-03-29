package main

import (
	"sort"
	"strings"
)

type CannithIndexes struct {
	PlannerEntryIDsByEffectID        map[string][]string `json:"plannerEntryIdsByEffectId"`
	PlannerEntryIDsBySlotID          map[string][]string `json:"plannerEntryIdsBySlotId"`
	PlannerEntryIDsByAffixType       map[string][]string `json:"plannerEntryIdsByAffixType"`
	PlannerEntryIDsByGroup           map[string][]string `json:"plannerEntryIdsByGroup"`
	PlannerEntryIDsByEnchantmentName map[string][]string `json:"plannerEntryIdsByEnchantmentName"`
	PlannerEntryIDsByBonusType       map[string][]string `json:"plannerEntryIdsByBonusType"`
	EffectIDsBySlotID                map[string][]string `json:"effectIdsBySlotId"`
	EffectIDsByGroup                 map[string][]string `json:"effectIdsByGroup"`
	EffectIDsByEnchantmentName       map[string][]string `json:"effectIdsByEnchantmentName"`
}

func buildIndexes(plannerEntries []PlannerEntry) CannithIndexes {
	indexes := CannithIndexes{
		PlannerEntryIDsByEffectID:        map[string][]string{},
		PlannerEntryIDsBySlotID:          map[string][]string{},
		PlannerEntryIDsByAffixType:       map[string][]string{},
		PlannerEntryIDsByGroup:           map[string][]string{},
		PlannerEntryIDsByEnchantmentName: map[string][]string{},
		PlannerEntryIDsByBonusType:       map[string][]string{},
		EffectIDsBySlotID:                map[string][]string{},
		EffectIDsByGroup:                 map[string][]string{},
		EffectIDsByEnchantmentName:       map[string][]string{},
	}

	for _, entry := range plannerEntries {
		addUnique(indexes.PlannerEntryIDsByEffectID, entry.EffectID, entry.ID)
		addUnique(indexes.PlannerEntryIDsBySlotID, entry.SlotID, entry.ID)
		addUnique(indexes.PlannerEntryIDsByAffixType, entry.AffixType, entry.ID)

		if entry.Group != "" {
			addUnique(indexes.PlannerEntryIDsByGroup, entry.Group, entry.ID)
			addUnique(indexes.EffectIDsByGroup, entry.Group, entry.EffectID)
		}

		if entry.EnchantmentName != "" {
			nameKey := slugify(entry.EnchantmentName)
			addUnique(indexes.PlannerEntryIDsByEnchantmentName, nameKey, entry.ID)
			addUnique(indexes.EffectIDsByEnchantmentName, nameKey, entry.EffectID)
		}

		if entry.BonusType != "" {
			addUnique(indexes.PlannerEntryIDsByBonusType, entry.BonusType, entry.ID)
		}

		addUnique(indexes.EffectIDsBySlotID, entry.SlotID, entry.EffectID)
	}

	sortMapValues(indexes.PlannerEntryIDsByEffectID)
	sortMapValues(indexes.PlannerEntryIDsBySlotID)
	sortMapValues(indexes.PlannerEntryIDsByAffixType)
	sortMapValues(indexes.PlannerEntryIDsByGroup)
	sortMapValues(indexes.PlannerEntryIDsByEnchantmentName)
	sortMapValues(indexes.PlannerEntryIDsByBonusType)
	sortMapValues(indexes.EffectIDsBySlotID)
	sortMapValues(indexes.EffectIDsByGroup)
	sortMapValues(indexes.EffectIDsByEnchantmentName)

	return indexes
}

func addUnique(m map[string][]string, key string, value string) {
	key = strings.TrimSpace(key)
	value = strings.TrimSpace(value)
	if key == "" || value == "" {
		return
	}

	existing := m[key]
	for _, v := range existing {
		if v == value {
			return
		}
	}

	m[key] = append(m[key], value)
}

func sortMapValues(m map[string][]string) {
	for key := range m {
		sort.Strings(m[key])
	}
}
