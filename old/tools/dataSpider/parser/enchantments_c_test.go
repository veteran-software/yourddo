package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateConcealment(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "blurry",
			raw:  "{{Concealment|Blurry}}",
			want: &api.Enchantment{Name: "Blurry", Amount: "20%"},
		},
		{
			name: "dusk is case insensitive",
			raw:  "{{Concealment|DUSK}}",
			want: &api.Enchantment{Name: "Dusk", Amount: "10%"},
		},
		{
			name: "lesser displacement without a space",
			raw:  "{{Concealment|LesserDisplacement}}",
			want: &api.Enchantment{Name: "Lesser Displacement", Amount: "25%"},
		},
		{
			name: "lesser displacement with a space",
			raw:  "{{Concealment|Lesser Displacement}}",
			want: &api.Enchantment{Name: "Lesser Displacement", Amount: "25%"},
		},
		{
			name: "smoke screen without a space",
			raw:  "{{Concealment|SmokeScreen}}",
			want: &api.Enchantment{Name: "Smoke Screen", Amount: "20%"},
		},
		{
			name: "smoke screen with a space",
			raw:  "{{Concealment|Smoke Screen}}",
			want: &api.Enchantment{Name: "Smoke Screen", Amount: "20%"},
		},
		{
			name: "custom defaults to enhancement",
			raw:  "{{Concealment|Custom|5}}",
			want: &api.Enchantment{Name: "Concealment", Amount: "5%", BonusType: "Enhancement"},
		},
		{
			name: "custom negative penalty",
			raw:  "{{Concealment|Custom|-5|Quality}}",
			want: &api.Enchantment{Name: "Concealment", Amount: "-5%", BonusType: "Quality"},
		},
		{
			name: "custom title",
			raw:  "{{Concealment|Custom|5||Smoke Screen +5%}}",
			want: &api.Enchantment{Name: "Smoke Screen +5%", Amount: "5%", BonusType: "Enhancement"},
		},
		{
			name: "fixed type custom title",
			raw:  "{{Concealment|Dusk|||Twilight Shroud}}",
			want: &api.Enchantment{Name: "Twilight Shroud", Amount: "10%"},
		},
		{
			name: "custom requires amount",
			raw:  "{{Concealment|Custom}}",
			want: nil,
		},
		{
			name: "empty custom amount is rejected",
			raw:  "{{Concealment|Custom|}}",
			want: nil,
		},
		{
			name: "missing type is rejected",
			raw:  "{{Concealment}}",
			want: nil,
		},
		{
			name: "unknown type is rejected",
			raw:  "{{Concealment|Unknown}}",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateConcealment(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseTemplateConcealment() = %#v, want %#v", got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsConcealment(t *testing.T) {
	want := []api.Enchantment{
		{Name: "Smoke Screen +5%", Amount: "5%", BonusType: "Enhancement"},
	}

	got := ParseEnchantments("{{Concealment|Custom|5||Smoke Screen +5%}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Errorf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
