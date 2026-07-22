package parser

import (
	"compendium-crawler-go/api"
	"reflect"
	"testing"
)

func TestParseTemplateStaggeringBlow(t *testing.T) {
	defaultNotes := "This item is enchanted to make your attacks send enemies reeling. When you roll a natural 20 on an attack with a melee weapon you will knock the target down unless it makes a DC 17 Balance check."
	customNotes := "This item is enchanted to make your attacks send enemies realing. On an attack roll of 20 which is confirmed as a critical hit you will knock the target down unless it makes a Reflex DC: 45 saving throw."

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{StaggeringBlow}}",
			want: &api.Enchantment{Name: "Staggering Blow", Notes: new(defaultNotes)},
		},
		{
			name: "unstoppable",
			raw:  "{{StaggeringBlow|Unstoppable}}",
			want: &api.Enchantment{Name: "Unstoppable Staggering Blow", Notes: new("On a natural 20 that is confirmed as a critical hit, this weapon will trip your opponent, forcing them to fall prone. There is no save against this effect.")},
		},
		{
			name: "custom DC",
			raw:  "{{StaggeringBlow|Custom|45}}",
			want: &api.Enchantment{Name: "Staggering +45", Notes: new(customNotes)},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{StaggeringBlow|custom| 45 }}",
			want: &api.Enchantment{Name: "Staggering +45", Notes: new(customNotes)},
		},
		{
			name: "other type uses default effect",
			raw:  "{{StaggeringBlow|Lesser}}",
			want: &api.Enchantment{Name: "Lesser Staggering Blow", Notes: new(defaultNotes)},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateStaggeringBlow(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseTemplateStaggeringBlow() = %#v, want %#v", got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsStaggeringBlowCustom(t *testing.T) {
	want := []api.Enchantment{{
		Name:  "Staggering +45",
		Notes: new("This item is enchanted to make your attacks send enemies realing. On an attack roll of 20 which is confirmed as a critical hit you will knock the target down unless it makes a Reflex DC: 45 saving throw."),
	}}

	got := ParseEnchantments("{{StaggeringBlow|Custom|45}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Errorf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}

func TestParseTemplateSunBurst(t *testing.T) {
	defaultNotes := "This weapon flashes an intense burst of sunlight on any critical hit. The target is blasted for 6d6 of light damage and is blinded as well. Oozes and Undead take 12d6 light damage. A successful Reflex DC: 22 save reduces the damage by half and negates the blindness."
	greaterLesserNotes := "This weapon/shield blazes with the eternal fury at the heart of a sun. Occasionally, this power comes to the surface, unleashing a nova of light which will blind the struck enemy, dealing severe light damage to it and any other nearby foes."

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{SunBurst}}",
			want: &api.Enchantment{Name: "Sun Burst", Notes: new(defaultNotes)},
		},
		{
			name: "greater",
			raw:  "{{SunBurst|Greater}}",
			want: &api.Enchantment{Name: "Greater Sun Burst", Notes: new(greaterLesserNotes)},
		},
		{
			name: "lesser",
			raw:  "{{SunBurst|Lesser}}",
			want: &api.Enchantment{Name: "Lesser Sun Burst", Notes: new(greaterLesserNotes)},
		},
		{
			name: "custom DC",
			raw:  "{{SunBurst|Custom|45}}",
			want: &api.Enchantment{Name: "Sun Burst +45", Notes: new("This weapon blazes with the eternal fury at the heart of a sun. Occassionally, this power comes to the surface, unleashing a nova of light which will blind the struck enemey for 6 seconds unless it succeeds on a Reflex DC: 45 saving throw.")},
		},
		{
			name: "custom title",
			raw:  "{{SunBurst|Custom|45|Solar Flare}}",
			want: &api.Enchantment{Name: "Solar Flare", Notes: new("This weapon blazes with the eternal fury at the heart of a sun. Occassionally, this power comes to the surface, unleashing a nova of light which will blind the struck enemey for 6 seconds unless it succeeds on a Reflex DC: 45 saving throw.")},
		},
		{
			name: "default title is the third parameter",
			raw:  "{{SunBurst|Base||Solar Flare}}",
			want: &api.Enchantment{Name: "Solar Flare", Notes: new(defaultNotes)},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{SunBurst|custom| 50 }}",
			want: &api.Enchantment{Name: "Sun Burst +50", Notes: new("This weapon blazes with the eternal fury at the heart of a sun. Occassionally, this power comes to the surface, unleashing a nova of light which will blind the struck enemey for 6 seconds unless it succeeds on a Reflex DC: 50 saving throw.")},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateSunBurst(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseTemplateSunBurst() = %#v, want %#v", got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsSunBurstCustom(t *testing.T) {
	want := []api.Enchantment{{
		Name:  "Sun Burst +45",
		Notes: new("This weapon blazes with the eternal fury at the heart of a sun. Occassionally, this power comes to the surface, unleashing a nova of light which will blind the struck enemey for 6 seconds unless it succeeds on a Reflex DC: 45 saving throw."),
	}}

	got := ParseEnchantments("{{SunBurst|Custom|45}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Errorf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
