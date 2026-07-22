package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateParalyzing(t *testing.T) {
	notes := func(saveType, dc string) *string {
		return new("Any creature struck by this weapon must succeed on a " + saveType + " DC: " + dc + " save or be paralyzed. The target may attempt a new save to end the effect every several seconds; otherwise the paralysis lasts for 1 minute. Certain creatures, such as the Undead and Constructs, cannot be paralyzed.")
	}

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{Paralyzing}}",
			want: &api.Enchantment{Name: "Paralyzing", Amount: "17", BonusType: "On-hit", Notes: notes("Will", "17")},
		},
		{
			name: "regular",
			raw:  "{{Paralyzing|Regular}}",
			want: &api.Enchantment{Name: "Regular Paralyzing", Amount: "17", BonusType: "On-hit", Notes: notes("Will", "17")},
		},
		{
			name: "improved",
			raw:  "{{Paralyzing|Improved}}",
			want: &api.Enchantment{Name: "Improved Paralyzing", Amount: "25", BonusType: "On-hit", Notes: notes("Will", "25")},
		},
		{
			name: "legendary",
			raw:  "{{Paralyzing|Legendary}}",
			want: &api.Enchantment{Name: "Legendary Paralyzing", Amount: "100", BonusType: "On-hit", Notes: notes("Fortitude", "100")},
		},
		{
			name: "default with custom DC",
			raw:  "{{Paralyzing||117}}",
			want: &api.Enchantment{Name: "Paralyzing +117", Amount: "117", BonusType: "On-hit", Notes: notes("Will", "117")},
		},
		{
			name: "improved with custom DC",
			raw:  "{{Paralyzing|Improved|45}}",
			want: &api.Enchantment{Name: "Improved Paralyzing +45", Amount: "45", BonusType: "On-hit", Notes: notes("Will", "45")},
		},
		{
			name: "legendary with custom DC",
			raw:  "{{Paralyzing|Legendary|150}}",
			want: &api.Enchantment{Name: "Legendary Paralyzing +150", Amount: "150", BonusType: "On-hit", Notes: notes("Fortitude", "150")},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{Paralyzing|legendary| 125 }}",
			want: &api.Enchantment{Name: "legendary Paralyzing +125", Amount: "125", BonusType: "On-hit", Notes: notes("Fortitude", "125")},
		},
		{
			name: "unknown version uses default save",
			raw:  "{{Paralyzing|Other}}",
			want: &api.Enchantment{Name: "Other Paralyzing", Amount: "17", BonusType: "On-hit", Notes: notes("Will", "17")},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateParalyzing(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateParalyzing(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsParalyzingCustomDC(t *testing.T) {
	want := []api.Enchantment{{
		Name:      "Paralyzing +117",
		Amount:    "117",
		BonusType: "On-hit",
		Notes:     new("Any creature struck by this weapon must succeed on a Will DC: 117 save or be paralyzed. The target may attempt a new save to end the effect every several seconds; otherwise the paralysis lasts for 1 minute. Certain creatures, such as the Undead and Constructs, cannot be paralyzed."),
	}}

	got := ParseEnchantments("{{Paralyzing||117}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
