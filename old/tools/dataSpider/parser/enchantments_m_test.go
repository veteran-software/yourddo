package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateMagmaSurge(t *testing.T) {
	defaultNotes := "This weapon stores the immeasurable heat of the planet's molten mantle. When this weapon is used, superheated magma occasionally surges to the surface, slowing an enemy down and inflicting massive fire damage over time."

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{MagmaSurge}}",
			want: &api.Enchantment{Name: "Magma Surge", Notes: new(defaultNotes)},
		},
		{
			name: "legendary",
			raw:  "{{MagmaSurge|Legendary}}",
			want: &api.Enchantment{Name: "Legendary Magma Surge", Notes: new(defaultNotes)},
		},
		{
			name: "damage",
			raw:  "{{MagmaSurge|damage|10}}",
			want: &api.Enchantment{
				Name:  "Magma Surge +10",
				Notes: new("Strikes with this weapon have a small chance to call forth a surge of superheated magma, dealing 10d20+99 fire damage."),
			},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{MagmaSurge|DaMaGe| 4 }}",
			want: &api.Enchantment{
				Name:  "Magma Surge +4",
				Notes: new("Strikes with this weapon have a small chance to call forth a surge of superheated magma, dealing 4d20+45 fire damage."),
			},
		},
		{
			name: "damage requires a numeric amount",
			raw:  "{{MagmaSurge|damage|unknown}}",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateMagmaSurge(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateMagmaSurge(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsMagmaSurgeDamage(t *testing.T) {
	want := []api.Enchantment{{
		Name:  "Magma Surge +10",
		Notes: new("Strikes with this weapon have a small chance to call forth a surge of superheated magma, dealing 10d20+99 fire damage."),
	}}

	got := ParseEnchantments("{{MagmaSurge|damage|10}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
