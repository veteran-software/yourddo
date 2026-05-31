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
