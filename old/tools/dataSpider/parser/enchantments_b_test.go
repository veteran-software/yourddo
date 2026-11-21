package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateBanishing(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "basic",
			raw:  "{{Banishing}}",
			want: &api.Enchantment{Name: "Banishing", Amount: "100", BonusType: "On-vorpal"},
		},
		{
			name: "improved",
			raw:  "{{Banishing|improved}}",
			want: &api.Enchantment{Name: "Improved Banishing", Amount: "150", BonusType: "On-vorpal"},
		},
		{
			name: "sovereign",
			raw:  "{{Banishing|sovereign}}",
			want: &api.Enchantment{Name: "Sovereign Banishing", Amount: "300", BonusType: "On-vorpal"},
		},
		{
			name: "weapons",
			raw:  "{{Banishing|weapons}}",
			want: &api.Enchantment{Name: "Banishing Weapons", Amount: "150", BonusType: "On-vorpal"},
		},
		{
			name: "fists",
			raw:  "{{Banishing|fists}}",
			want: &api.Enchantment{Name: "Banishing Fists", Amount: "100", BonusType: "On-vorpal"},
		},
		{
			name: "custom",
			raw:  "{{Banishing|Custom|45|3|1880}}",
			want: &api.Enchantment{Name: "Banishing +45", Amount: "3d20", BonusType: "On-vorpal"},
		},
		{
			name: "unknown type uses basic",
			raw:  "{{Banishing|other}}",
			want: &api.Enchantment{Name: "Banishing", Amount: "100", BonusType: "On-vorpal"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateBanishing(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseTemplateBanishing() = %#v, want %#v", got, tt.want)
			}
		})
	}
}
