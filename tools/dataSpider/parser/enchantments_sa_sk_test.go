package parser

import (
	"compendium-crawler-go/api"
	"reflect"
	"testing"
)

func TestParseTemplateSirocco(t *testing.T) {
	defaultNotes := "A critical hit with this weapon causes a whirlwind of desert sand to swirl about the target, temporarily blinding it. A successful Reflex DC: 20 save prevents the effect."

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{Sirocco}}",
			want: &api.Enchantment{Name: "Sirocco", Notes: new(defaultNotes)},
		},
		{
			name: "greater",
			raw:  "{{Sirocco|Greater}}",
			want: &api.Enchantment{Name: "Greater Sirocco", Notes: new("A critical hit with this weapon causes a whirlwind of desert sand to swirl about the target, temporarily blinding it. A successful Reflex DC: 38 save prevents the effect.")},
		},
		{
			name: "legendary",
			raw:  "{{Sirocco|Legendary}}",
			want: &api.Enchantment{Name: "Legendary Sirocco", Notes: new("On hit, this has a chance of blinding your enemies with whirling sand. Struck enemies must make a Fortitude DC: 100 save or be blinded.")},
		},
		{
			name: "custom DC",
			raw:  "{{Sirocco|Custom|50}}",
			want: &api.Enchantment{Name: "Sirocco +50", Notes: new("On a critical hit, a creature struck by this weapon must succeed on a Reflex DC: 50 save or be blinded for 6 seconds.")},
		},
		{
			name: "switch is case insensitive",
			raw:  "{{Sirocco|custom| 42 }}",
			want: &api.Enchantment{Name: "Sirocco +42", Notes: new("On a critical hit, a creature struck by this weapon must succeed on a Reflex DC: 42 save or be blinded for 6 seconds.")},
		},
		{
			name: "other type uses default effect",
			raw:  "{{Sirocco|Lesser}}",
			want: &api.Enchantment{Name: "Lesser Sirocco", Notes: new(defaultNotes)},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateSirocco(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseTemplateSirocco() = %#v, want %#v", got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsSiroccoCustom(t *testing.T) {
	want := []api.Enchantment{{
		Name:  "Sirocco +50",
		Notes: new("On a critical hit, a creature struck by this weapon must succeed on a Reflex DC: 50 save or be blinded for 6 seconds."),
	}}

	got := ParseEnchantments("{{Sirocco|Custom|50}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Errorf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
