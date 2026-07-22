package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateFreezingIce(t *testing.T) {
	defaultNotes := "While you are wearing this item, your melee, ranged, and unarmed attacks gain the Freezing Ice ability. (When the weapon is used, an icy power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice.)"
	weaponNotes := "Your weapon stores the pitiless, immovable power of the ice deep within. When this weapon is used, this power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice."

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{FreezingIce}}",
			want: &api.Enchantment{Name: "Freezing Ice", Element: "Cold", Notes: new(defaultNotes)},
		},
		{
			name: "regular uses default",
			raw:  "{{FreezingIce|Regular}}",
			want: &api.Enchantment{Name: "Freezing Ice", Element: "Cold", Notes: new(defaultNotes)},
		},
		{
			name: "minor",
			raw:  "{{FreezingIce|Minor}}",
			want: &api.Enchantment{Name: "Minor Freezing Ice", Element: "Cold", Notes: new("While you are wearing this item, your melee, ranged, and unarmed attacks gain the Minor Freezing Ice ability. (When the weapon is used, an icy power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice.)")},
		},
		{
			name: "lesser",
			raw:  "{{FreezingIce|Lesser}}",
			want: &api.Enchantment{Name: "Lesser Freezing Ice", Element: "Cold", Notes: new("While you are wearing this item, your melee, ranged, and unarmed attacks gain the Lesser Freezing Ice ability. (When the weapon is used, an icy power occasionally comes to the surface, attempting to freeze an enemy solid and encase them in ice.)")},
		},
		{
			name: "weapon",
			raw:  "{{FreezingIce|Weapon}}",
			want: &api.Enchantment{Name: "Freezing Ice", Element: "Cold", Notes: new(weaponNotes)},
		},
		{
			name: "legendary weapon",
			raw:  "{{FreezingIce|Legendary Weapon}}",
			want: &api.Enchantment{Name: "Legendary Freezing Ice", Element: "Cold", Notes: new("On hit, this has a chance of freezing your enemies in solid ice. Struck enemies must make a Fortitude DC: 100 save for be frozen solid.")},
		},
		{
			name: "legendary ice",
			raw:  "{{FreezingIce|Legendary Ice}}",
			want: &api.Enchantment{Name: "Legendary Ice", Element: "Cold", Notes: new("Your attacks and offensive spells have a chance to freeze an enemy in a block of ice.")},
		},
		{
			name: "new DC",
			raw:  "{{FreezingIce|New|45}}",
			want: &api.Enchantment{Name: "Freezing Ice +45", Element: "Cold", Notes: new("Strikes with this weapon have a small chance to force the enemy to succeed against a Fortitude DC: 45 save or be frozen in ice.")},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{FreezingIce|NEW| 50 }}",
			want: &api.Enchantment{Name: "Freezing Ice +50", Element: "Cold", Notes: new("Strikes with this weapon have a small chance to force the enemy to succeed against a Fortitude DC: 50 save or be frozen in ice.")},
		},
		{
			name: "unknown version uses default",
			raw:  "{{FreezingIce|Other}}",
			want: &api.Enchantment{Name: "Freezing Ice", Element: "Cold", Notes: new(defaultNotes)},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateFreezingIce(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateFreezingIce(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsFreezingIceNew(t *testing.T) {
	want := []api.Enchantment{{
		Name:    "Freezing Ice +45",
		Element: "Cold",
		Notes:   new("Strikes with this weapon have a small chance to force the enemy to succeed against a Fortitude DC: 45 save or be frozen in ice."),
	}}

	got := ParseEnchantments("{{FreezingIce|New|45}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
