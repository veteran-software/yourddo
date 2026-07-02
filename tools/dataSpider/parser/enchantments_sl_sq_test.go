package parser

import (
	"compendium-crawler-go/api"
	"fmt"
	"reflect"
	"testing"
)

func TestParseTemplateSpellFocus(t *testing.T) {
	tests := []struct {
		name     string
		raw      string
		expected []*api.Enchantment
	}{
		{
			name: "Single School",
			raw:  "{{SpellFocus|Necromancy|2|Insight}}",
			expected: []*api.Enchantment{
				{Name: "Spell DC: Necromancy", Amount: "2", BonusType: "Insight"},
			},
		},
		{
			name: "Mastery",
			raw:  "{{SpellFocus|Mastery|3}}",
			expected: func() []*api.Enchantment {
				out := make([]*api.Enchantment, 0, len(spellSchools))
				for _, school := range spellSchools {
					out = append(out, &api.Enchantment{
						Name:      fmt.Sprintf("Spell DC: %s", school),
						Amount:    "3",
						BonusType: "Equipment",
					})
				}
				return out
			}(),
		},
		{
			name: "Rune Arm",
			raw:  "{{SpellFocus|Rune Arm|1|Artifact}}",
			expected: []*api.Enchantment{
				{Name: "Rune Arm: DC", Amount: "1", BonusType: "Artifact"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateSpellFocus(tt.raw)
			if !reflect.DeepEqual(got, tt.expected) {
				t.Errorf("parseTemplateSpellFocus() = %#v, want %#v", got, tt.expected)
			}
		})
	}
}
