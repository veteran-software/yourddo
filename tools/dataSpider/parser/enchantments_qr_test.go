package parser

import (
	"compendium-crawler-go/api"
	"reflect"
	"testing"
)

func TestParseTemplateResistance(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want []*api.Enchantment
	}{
		{
			name: "documented default resistance",
			raw:  "{{Resistance|3|Insightful}}",
			want: resistanceEnchantments("3", "Insight", ""),
		},
		{
			name: "documented curse resistance",
			raw:  "{{Resistance|4||Curse}}",
			want: resistanceEnchantments("4", "Enhancement", "Curse"),
		},
		{
			name: "enchantment resistance",
			raw:  "{{Resistance|5|Quality|Enchantment}}",
			want: resistanceEnchantments("5", "Quality", "Enchantment"),
		},
		{
			name: "illusion resistance is case insensitive",
			raw:  "{{Resistance|6||illusion}}",
			want: resistanceEnchantments("6", "Resistance", "Illusion"),
		},
		{
			name: "unknown resistance type uses default branch",
			raw:  "{{Resistance|7||Poison}}",
			want: resistanceEnchantments("7", "Resistance", ""),
		},
		{
			name: "missing amount is rejected",
			raw:  "{{Resistance|||Curse}}",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateResistance(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseTemplateResistance() = %#v, want %#v", got, tt.want)
			}
		})
	}
}

func resistanceEnchantments(amount, bonusType, resistanceType string) []*api.Enchantment {
	names := []string{
		"Fortitude Saving Throws",
		"Reflex Saving Throws",
		"Will Saving Throws",
	}
	if resistanceType != "" {
		names = []string{
			"Fortitude (" + resistanceType + ") Saving Throws",
			"Reflex (" + resistanceType + ") Saving Throws",
			"Will (" + resistanceType + ") Saving Throws",
		}
	}

	result := make([]*api.Enchantment, 0, len(names))
	for _, name := range names {
		result = append(result, &api.Enchantment{
			Name:      name,
			Amount:    amount,
			BonusType: bonusType,
		})
	}
	return result
}
