package parser

import (
	"compendium-crawler-go/api"
	"reflect"
	"testing"
)

func TestParseEnchantments(t *testing.T) {
	tests := []struct {
		name     string
		raw      string
		itemType string
		expected []api.Enchantment
	}{
		{
			name:     "Legendary Green Steel",
			raw:      "{{LegendaryGreenSteel}}",
			itemType: "Weapon",
			expected: []api.Enchantment{
				{
					Name: "Legendary Green Steel",
				},
			},
		},
		{
			name:     "LGSAugments",
			raw:      "{{LGSAugments}}",
			itemType: "Weapon",
			expected: nil,
		},
		{
			name:     "Enhancement Bonus Weapon (Light Hammer)",
			raw:      "{{EnhancementBonus|5}}",
			itemType: "Light Hammer",
			expected: []api.Enchantment{
				{Name: "Attack Rolls", Amount: "5", BonusType: "Enhancement"},
				{Name: "Damage Rolls", Amount: "5", BonusType: "Enhancement"},
			},
		},
		{
			name:     "Enhancement Bonus Armor (Docent)",
			raw:      "{{EnhancementBonus|15}}",
			itemType: "Docent",
			expected: []api.Enchantment{
				{Name: "Armor Class", Amount: "15", BonusType: "Enhancement"},
			},
		},
		{
			name:     "Enhancement Bonus Shield (Orb)",
			raw:      "{{EnhancementBonus|10}}",
			itemType: "Orb",
			expected: []api.Enchantment{
				{Name: "Armor Class", Amount: "10", BonusType: "Enhancement"},
				{Name: "Attack Rolls (Shield)", Amount: "10", BonusType: "Enhancement"},
				{Name: "Damage Rolls (Shield)", Amount: "10", BonusType: "Enhancement"},
			},
		},
		{
			name:     "Enhancement Bonus Shield (Tower Shield)",
			raw:      "{{EnhancementBonus|3}}",
			itemType: "Tower Shield",
			expected: []api.Enchantment{
				{Name: "Armor Class", Amount: "3", BonusType: "Enhancement"},
				{Name: "Attack Rolls (Shield)", Amount: "3", BonusType: "Enhancement"},
				{Name: "Damage Rolls (Shield)", Amount: "3", BonusType: "Enhancement"},
			},
		},
		{
			name:     "Enhancement Bonus Buckler",
			raw:      "{{EnhancementBonus|4}}",
			itemType: "Buckler",
			expected: []api.Enchantment{
				{Name: "Armor Class", Amount: "4", BonusType: "Enhancement"},
				{Name: "Attack Rolls (Shield)", Amount: "4", BonusType: "Enhancement"},
				{Name: "Damage Rolls (Shield)", Amount: "4", BonusType: "Enhancement"},
			},
		},
		{
			name:     "Enhancement Bonus Generic Weapon",
			raw:      "{{EnhancementBonus|2}}",
			itemType: "Weapon",
			expected: []api.Enchantment{
				{Name: "Attack Rolls", Amount: "2", BonusType: "Enhancement"},
				{Name: "Damage Rolls", Amount: "2", BonusType: "Enhancement"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ParseEnchantments(tt.raw, tt.itemType)
			if !reflect.DeepEqual(got, tt.expected) {
				t.Errorf("ParseEnchantments() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestParseEnchantmentsNearlyComplete(t *testing.T) {
	const notes = "This item isn't quite finished, but it's only a step away from completion. Bring it to the forges on the upper floor of Gravenhollow and combine it with melted materials to restore this item to its full potential."

	tests := []struct {
		raw  string
		name string
	}{
		{raw: "{{NearlyComplete|Ability}}", name: "Nearly Complete: Ability Score"},
		{raw: "{{NearlyComplete|HAMP}}", name: "Nearly Complete: Healing Amplification"},
		{raw: "{{NearlyComplete|InsAbility}}", name: "Nearly Complete: Insightful Ability Score"},
		{raw: "{{NearlyComplete|QualityAbility}}", name: "Nearly Complete: Quality Ability Score"},
		{raw: "{{NearlyComplete|Skill}}", name: "Nearly Complete: Skill"},
		{raw: "{{NearlyComplete|SpellFocus}}", name: "Nearly Complete: Spell Focus"},
		{raw: "{{NearlyComplete}}", name: "Nearly Complete"},
		{raw: "{{NearlyComplete|Any}}", name: "Nearly Complete"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ParseEnchantments(tt.raw, "Helmet")
			expected := []api.Enchantment{{Name: tt.name, Notes: new(notes)}}
			if !reflect.DeepEqual(got, expected) {
				t.Errorf("ParseEnchantments() = %#v, want %#v", got, expected)
			}
		})
	}
}
