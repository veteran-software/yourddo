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

func TestParseTemplateTaintOfShavarath(t *testing.T) {
	const (
		defaultNotes   = "Green Steel items thirst for pain and suffering. While weapons can sate their bloodlust on opponents, accessories and clothing cannot. Wearing multiple items that bear the taint of Shavarath creates dangerous imbalances of energy as the items feed upon the wearer. Perhaps there is a way to cleanse this item..."
		legendaryNotes = "Green Steel items thirst for pain and suffering. While weapons feed their bloodlust on enemies, accessories and clothing cannot. Wearing multiple items that bear Legendary Taint of Shavarath creates dangerous imbalances of energy as the items feed more and more upon the wielder. Perhaps there is a way to appease them..."
	)

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{TaintOfShavarath}}",
			want: &api.Enchantment{Name: "Taint of Shavarath", Notes: new(defaultNotes)},
		},
		{
			name: "legendary",
			raw:  "{{TaintOfShavarath|Legendary}}",
			want: &api.Enchantment{Name: "Legendary Taint of Shavarath", Notes: new(legendaryNotes)},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{TaintOfShavarath|legendary}}",
			want: &api.Enchantment{Name: "Legendary Taint of Shavarath", Notes: new(legendaryNotes)},
		},
		{
			name: "unknown value uses default",
			raw:  "{{TaintOfShavarath|Heroic}}",
			want: &api.Enchantment{Name: "Taint of Shavarath", Notes: new(defaultNotes)},
		},
		{
			name: "invalid template",
			raw:  "TaintOfShavarath",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateTaintOfShavarath(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateTaintOfShavarath(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsTaintOfShavarath(t *testing.T) {
	const legendaryNotes = "Green Steel items thirst for pain and suffering. While weapons feed their bloodlust on enemies, accessories and clothing cannot. Wearing multiple items that bear Legendary Taint of Shavarath creates dangerous imbalances of energy as the items feed more and more upon the wielder. Perhaps there is a way to appease them..."
	want := []api.Enchantment{{
		Name:  "Legendary Taint of Shavarath",
		Notes: new(legendaryNotes),
	}}

	got := ParseEnchantments("{{TaintOfShavarath|Legendary}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
