package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateDisintegration(t *testing.T) {
	defaultNotes := "This weapon has a dark, insidious power deep within. Occasionally, this power lashes out violently at enemies and attempts to disintegrate them."
	utterNotes := defaultNotes + " This disintegrate is incredibly powerful, and will utterly destroy weaker foes."

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{Disintegration}}",
			want: &api.Enchantment{Name: "Disintegration", Notes: new(defaultNotes)},
		},
		{
			name: "utter",
			raw:  "{{Disintegration|Utter}}",
			want: &api.Enchantment{Name: "Utter Disintegration", Notes: new(utterNotes)},
		},
		{
			name: "damage",
			raw:  "{{Disintegration|damage|7}}",
			want: &api.Enchantment{
				Name:  "Disintigrate +7",
				Notes: new("Strikes with this weapon have a small chance to call forth a spike of entropic force, dealing 7d20+72 untyped damage."),
			},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{Disintegration|DaMaGe| 4 }}",
			want: &api.Enchantment{
				Name:  "Disintigrate +4",
				Notes: new("Strikes with this weapon have a small chance to call forth a spike of entropic force, dealing 4d20+45 untyped damage."),
			},
		},
		{
			name: "damage requires a numeric amount",
			raw:  "{{Disintegration|damage|unknown}}",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateDisintegration(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateDisintegration(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsDisintegrationDamage(t *testing.T) {
	want := []api.Enchantment{{
		Name:  "Disintigrate +7",
		Notes: new("Strikes with this weapon have a small chance to call forth a spike of entropic force, dealing 7d20+72 untyped damage."),
	}}

	got := ParseEnchantments("{{Disintegration|damage|7}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
