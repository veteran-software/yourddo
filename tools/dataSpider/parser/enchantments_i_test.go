package parser

import (
	"compendium-crawler-go/api"
	"reflect"
	"testing"
)

func TestParseTemplateIncite(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want []*api.Enchantment
	}{
		{
			name: "default melee attack",
			raw:  "{{Incite|10}}",
			want: []*api.Enchantment{
				{Name: "Melee Threat Generation", Amount: "10%"},
			},
		},
		{
			name: "spell attack with custom title",
			raw:  "{{Incite|-10|spell||Anathema}}",
			want: []*api.Enchantment{
				{Name: "Anathema", Amount: "-10%"},
			},
		},
		{
			name: "spell and ranged attacks with custom title",
			raw:  "{{Incite|-15|spellranged||Stealth Strike}}",
			want: []*api.Enchantment{
				{Name: "Stealth Strike", Amount: "-15%"},
				{Name: "Stealth Strike", Amount: "-15%"},
			},
		},
		{
			name: "spell attack without custom title",
			raw:  "{{Incite|-15|spell}}",
			want: []*api.Enchantment{
				{Name: "Spell Threat Generation", Amount: "-15%"},
			},
		},
		{
			name: "bonus type is the third parameter",
			raw:  "{{Incite|9|melee|Quality}}",
			want: []*api.Enchantment{
				{Name: "Melee Threat Generation", Amount: "9%", BonusType: "Quality"},
			},
		},
		{
			name: "spell and melee attacks",
			raw:  "{{Incite|20|SpellMelee|Insight}}",
			want: []*api.Enchantment{
				{Name: "Melee Threat Generation", Amount: "20%", BonusType: "Insight"},
				{Name: "Spell Threat Generation", Amount: "20%", BonusType: "Insight"},
			},
		},
		{
			name: "all attack types",
			raw:  "{{Incite|25|All|Artifact}}",
			want: []*api.Enchantment{
				{Name: "Melee Threat Generation", Amount: "25%", BonusType: "Artifact"},
				{Name: "Ranged Threat Generation", Amount: "25%", BonusType: "Artifact"},
				{Name: "Spell Threat Generation", Amount: "25%", BonusType: "Artifact"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateIncite(tt.raw, "")
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseTemplateIncite() = %#v, want %#v", got, tt.want)
			}
		})
	}
}
