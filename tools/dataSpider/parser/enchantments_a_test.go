package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateAntimagicSpike(t *testing.T) {
	defaultNotes := "This item was made from powerful antimagic materials. When scoring a critical hit on an enemy with your ranged or melee weapons, the target must make a Fortitude DC: 28 save or be unable to cast spells for a brief duration."
	customNotes := "This item was made from powerful antimagic materials. When scoring a critical hit on an enemy, it must make a Fortitude DC: 45 save or be unable to cast spells for a brief duration."

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{AntimagicSpike}}",
			want: &api.Enchantment{Name: "Antimagic Spike", Notes: new(defaultNotes)},
		},
		{
			name: "custom DC",
			raw:  "{{AntimagicSpike|custom|45}}",
			want: &api.Enchantment{Name: "Antimagic Spike +45", Notes: new(customNotes)},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{AntimagicSpike|Custom| 45 }}",
			want: &api.Enchantment{Name: "Antimagic Spike +45", Notes: new(customNotes)},
		},
		{
			name: "other type uses default effect",
			raw:  "{{AntimagicSpike|regular|45}}",
			want: &api.Enchantment{Name: "Antimagic Spike", Notes: new(defaultNotes)},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateAntimagicSpike(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateAntimagicSpike(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsAntimagicSpikeCustom(t *testing.T) {
	want := []api.Enchantment{{
		Name:  "Antimagic Spike +45",
		Notes: new("This item was made from powerful antimagic materials. When scoring a critical hit on an enemy, it must make a Fortitude DC: 45 save or be unable to cast spells for a brief duration."),
	}}

	got := ParseEnchantments("{{AntimagicSpike|custom|45}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
