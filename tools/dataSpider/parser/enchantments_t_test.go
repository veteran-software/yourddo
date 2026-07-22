package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateTelekinetic(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{Telekinetic}}",
			want: &api.Enchantment{Name: "Telekinetic", Notes: new("Targets that suffer a critical hit from a telekinetic weapon must make a Balance DC: 17 check or be knocked down.")},
		},
		{
			name: "greater",
			raw:  "{{Telekinetic|Greater}}",
			want: &api.Enchantment{Name: "Greater Telekinetic", Notes: new("Targets that suffer a critical hit from a telekinetic weapon must make a Strength or Dexterity DC: 28 check or be knocked down. The target will then be force to make Balance DC: 16 checks to recover from the effect.")},
		},
		{
			name: "epic",
			raw:  "{{Telekinetic|Epic}}",
			want: &api.Enchantment{Name: "Epic Telekinetic", Notes: new("Targets that suffer a critical hit from a telekinetic weapon must make a DC Strength or Dexterity DC: 35. The target will then be force to make Balance DC: 16 checks to recover from the effect.")},
		},
		{
			name: "legendary",
			raw:  "{{Telekinetic|Legendary}}",
			want: &api.Enchantment{Name: "Legendary Telekinetic", Notes: new("On hit, this has a chance of knocking your enemies off their feet. Struck enemies must make a Reflex DC: 100 save or be knocked down.")},
		},
		{
			name: "custom DC",
			raw:  "{{Telekinetic|Custom|45}}",
			want: &api.Enchantment{Name: "Telekinetic +45", Notes: new("Targets that suffer a critical hit from a Telekinetic weapons must make a Reflex DC: 45 saving throw or be knocked down.")},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{Telekinetic|custom| 50 }}",
			want: &api.Enchantment{Name: "Telekinetic +50", Notes: new("Targets that suffer a critical hit from a Telekinetic weapons must make a Reflex DC: 50 saving throw or be knocked down.")},
		},
		{
			name: "other type uses default effect",
			raw:  "{{Telekinetic|Base}}",
			want: &api.Enchantment{Name: "Base Telekinetic", Notes: new("Targets that suffer a critical hit from a telekinetic weapon must make a Balance DC: 17 check or be knocked down.")},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateTelekinetic(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateTelekinetic(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsTelekineticCustom(t *testing.T) {
	want := []api.Enchantment{{
		Name:  "Telekinetic +45",
		Notes: new("Targets that suffer a critical hit from a Telekinetic weapons must make a Reflex DC: 45 saving throw or be knocked down."),
	}}

	got := ParseEnchantments("{{Telekinetic|Custom|45}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
