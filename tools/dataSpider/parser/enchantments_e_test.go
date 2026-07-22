package parser

import (
	"reflect"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateElementalAbsorb(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want []*api.Enchantment
	}{
		{
			name: "standard element",
			raw:  "{{ElementalAbsorb|Fire|5}}",
			want: []*api.Enchantment{{Name: "Fire Absorption", Amount: "5%", BonusType: "Enhancement", Element: "Fire"}},
		},
		{
			name: "electricity is normalized",
			raw:  "{{ElementalAbsorb|Electricity|20||Quality}}",
			want: []*api.Enchantment{{Name: "Electric Absorption", Amount: "20%", BonusType: "Quality", Element: "Electric"}},
		},
		{
			name: "custom title",
			raw:  "{{ElementalAbsorb|Negative Energy|20|Negative Ward|Insight}}",
			want: []*api.Enchantment{{Name: "Negative Ward", Amount: "20%", BonusType: "Insight", Element: "Negative Energy"}},
		},
		{
			name: "all standard elements",
			raw:  "{{ElementalAbsorb|All|10}}",
			want: []*api.Enchantment{
				{Name: "Acid Absorption", Amount: "10%", BonusType: "Enhancement", Element: "Acid"},
				{Name: "Cold Absorption", Amount: "10%", BonusType: "Enhancement", Element: "Cold"},
				{Name: "Fire Absorption", Amount: "10%", BonusType: "Enhancement", Element: "Fire"},
				{Name: "Electric Absorption", Amount: "10%", BonusType: "Enhancement", Element: "Electric"},
			},
		},
		{
			name: "all elements including sonic",
			raw:  "{{ElementalAbsorb|Alls|12||Artifact}}",
			want: []*api.Enchantment{
				{Name: "Acid Absorption", Amount: "12%", BonusType: "Artifact", Element: "Acid"},
				{Name: "Cold Absorption", Amount: "12%", BonusType: "Artifact", Element: "Cold"},
				{Name: "Electric Absorption", Amount: "12%", BonusType: "Artifact", Element: "Electric"},
				{Name: "Fire Absorption", Amount: "12%", BonusType: "Artifact", Element: "Fire"},
				{Name: "Sonic Absorption", Amount: "12%", BonusType: "Artifact", Element: "Sonic"},
			},
		},
		{
			name: "chitinous has a fixed amount",
			raw:  "{{ElementalAbsorb|Chitinous}}",
			want: []*api.Enchantment{{Name: "Fire Absorption", Amount: "19%", BonusType: "Enhancement", Element: "Fire"}},
		},
		{
			name: "legendary chitinous has a fixed amount",
			raw:  "{{ElementalAbsorb|Legendary Chitinous|||Quality}}",
			want: []*api.Enchantment{{Name: "Fire Absorption", Amount: "34%", BonusType: "Quality", Element: "Fire"}},
		},
		{
			name: "hound's bones",
			raw:  "{{ElementalAbsorb|Hound's Bones|15}}",
			want: []*api.Enchantment{
				{Name: "Acid Absorption", Amount: "15%", BonusType: "Enhancement", Element: "Acid"},
				{Name: "Evil Absorption", Amount: "15%", BonusType: "Enhancement", Element: "Evil"},
			},
		},
		{
			name: "devil's bones",
			raw:  "{{ElementalAbsorb|Devil's Bones|15||Insight}}",
			want: []*api.Enchantment{
				{Name: "Fire Absorption", Amount: "15%", BonusType: "Insight", Element: "Fire"},
				{Name: "Evil Absorption", Amount: "15%", BonusType: "Insight", Element: "Evil"},
			},
		},
		{
			name: "fire and cold",
			raw:  "{{ElementalAbsorb|FireCold|8}}",
			want: []*api.Enchantment{
				{Name: "Fire Absorption", Amount: "8%", BonusType: "Enhancement", Element: "Fire"},
				{Name: "Cold Absorption", Amount: "8%", BonusType: "Enhancement", Element: "Cold"},
			},
		},
		{
			name: "electricity and acid",
			raw:  "{{ElementalAbsorb|ElectricityAcid|9|Storm Ward|Quality}}",
			want: []*api.Enchantment{
				{Name: "Electric Absorption", Amount: "9%", BonusType: "Quality", Element: "Electric"},
				{Name: "Acid Absorption", Amount: "9%", BonusType: "Quality", Element: "Acid"},
			},
		},
		{
			name: "missing amount is rejected",
			raw:  "{{ElementalAbsorb|Fire}}",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateElementalAbsorb(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseTemplateElementalAbsorb() = %#v, want %#v", got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsElementalAbsorbCompound(t *testing.T) {
	want := []api.Enchantment{
		{Name: "Fire Absorption", Amount: "8%", BonusType: "Enhancement", Element: "Fire"},
		{Name: "Cold Absorption", Amount: "8%", BonusType: "Enhancement", Element: "Cold"},
	}

	got := ParseEnchantments("{{ElementalAbsorb|FireCold|8}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Errorf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
