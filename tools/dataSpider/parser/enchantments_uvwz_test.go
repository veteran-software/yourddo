package parser

import (
	"reflect"
	"strings"
	"testing"

	"compendium-crawler-go/api"
)

func TestParseTemplateVorpal(t *testing.T) {
	tests := []struct {
		name       string
		raw        string
		wantName   string
		wantAmount string
		wantNote   string
	}{
		{name: "default", raw: "{{Vorpal}}", wantName: "Vorpal", wantAmount: "0.5[W]", wantNote: "fewer than 1000 Hit Points"},
		{name: "improved", raw: "{{Vorpal|Improved}}", wantName: "Improved Vorpal", wantAmount: "0.5[W]", wantNote: "fewer than 1500 Hit Points"},
		{name: "sovereign", raw: "{{Vorpal|Sovereign}}", wantName: "Sovereign Vorpal", wantAmount: "0.5[W]", wantNote: "fewer than 3000 Hit Points"},
		{name: "greater", raw: "{{Vorpal|Greater}}", wantName: "Greater Vorpal", wantAmount: "0.5[W]", wantNote: "fewer than 2000 Hit Points"},
		{name: "superior", raw: "{{Vorpal|Superior}}", wantName: "Superior Vorpal", wantAmount: "0.5[W]", wantNote: "fewer than 2500 Hit Points"},
		{name: "sovereign nightmares alias", raw: "{{Vorpal|SovereignNightmares}}", wantName: "Sovereign Nightmares", wantNote: "below 5,000 Hit Points"},
		{name: "nightmares", raw: "{{Vorpal|Nightmares}}", wantName: "Nightmares", wantNote: "below 500 Hit Points"},
		{name: "greater nightmares alias", raw: "{{Vorpal|Greater Nightmares}}", wantName: "Greater Nightmares", wantNote: "below 1,000 Hit Points"},
		{name: "improved nightmares alias", raw: "{{Vorpal|ImprovedNightmares}}", wantName: "Improved Nightmares", wantNote: "below 1,500 Hit Points"},
		{name: "superior nightmares alias", raw: "{{Vorpal|Superior Nightmares}}", wantName: "Superior Nightmares", wantNote: "below 2,500 Hit Points"},
		{name: "light bringer alias", raw: "{{Vorpal|LightBringer}}", wantName: "Light Bringer", wantNote: "If the undead has above 1,000 Hit Points"},
		{name: "manslayer", raw: "{{Vorpal|Manslayer}}", wantName: "Manslayer", wantNote: "humanoid target will be killed"},
		{name: "legendary manslayer alias", raw: "{{Vorpal|Legendary Manslayer}}", wantName: "Legendary Manslayer", wantNote: "Unknown effect"},
		{name: "off with their heads", raw: "{{Vorpal|Off With Their Heads}}", wantName: "Off With Their Heads!", wantNote: "under your Diplomacy skills"},
		{name: "custom", raw: "{{Vorpal|Custom|Customized|3.5|1249|393}}", wantName: "Customized Vorpal", wantAmount: "3.5[W]", wantNote: "above 1249 Hit Points, they take 393 damage"},
		{name: "title override", raw: "{{Vorpal|Improved|||||Executioner}}", wantName: "Executioner", wantAmount: "0.5[W]", wantNote: "fewer than 1500 Hit Points"},
		{name: "wiki default branch", raw: "{{Vorpal|Legacy}}", wantName: "Legacy Vorpal", wantAmount: "0.5[W]", wantNote: "fewer than 1000 Hit Points"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateVorpal(tt.raw)
			if got == nil {
				t.Fatalf("parseTemplateVorpal(%q) = nil", tt.raw)
			}
			if got.Name != tt.wantName || got.Amount != tt.wantAmount || got.BonusType != "On-vorpal" {
				t.Fatalf("parseTemplateVorpal(%q) = %#v", tt.raw, got)
			}
			if got.Notes == nil || !strings.Contains(*got.Notes, tt.wantNote) {
				t.Fatalf("parseTemplateVorpal(%q) notes = %v, want text containing %q", tt.raw, got.Notes, tt.wantNote)
			}
		})
	}

	if got := parseTemplateVorpal("{{VorpalOther}}"); got != nil {
		t.Fatalf("parseTemplateVorpal() accepted another template: %#v", got)
	}
}

func TestParseTemplateWeaponEffect(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default d6 effect",
			raw:  "{{WeaponEffect|Force|9|Impactful}}",
			want: &api.Enchantment{Name: "Impactful", Amount: "9d6", Element: "Force", BlastType: "Force"},
		},
		{
			name: "custom die sides and title",
			raw:  "{{WeaponEffect|Sonic|9|Reverberating|Custom Reverberating|8}}",
			want: &api.Enchantment{Name: "Custom Reverberating", Amount: "9d8", Element: "Sonic", BlastType: "Sonic"},
		},
		{
			name: "die sides tolerate d prefix",
			raw:  "{{WeaponEffect|Slashing|4|Razor Sharp||d10}}",
			want: &api.Enchantment{Name: "Razor Sharp", Amount: "4d10", Element: "Slashing", BlastType: "Slashing"},
		},
		{
			name: "murderous edge fixed effect",
			raw:  "{{WeaponEffect|Murderous Edge}}",
			want: &api.Enchantment{
				Name:      "Murderous Edge",
				Amount:    "16d6",
				Element:   "Slashing",
				BlastType: "Murderous Edge",
				Notes:     new("On hit: Slashing damage. This item is considered Metalline, bypassing all kinds of material damage resistance."),
			},
		},
		{
			name: "fixed effect alias",
			raw:  "{{WeaponEffect|BonePaws}}",
			want: &api.Enchantment{
				Name:      "Bone Paws",
				BlastType: "BonePaws",
				Notes:     new("While in any Wild Shape, your weapons gain Piercing damage bypass and +1W."),
			},
		},
		{
			name: "fixed effect custom title",
			raw:  "{{WeaponEffect|Flameblade|||Fiery Blade}}",
			want: &api.Enchantment{
				Name:      "Fiery Blade",
				BlastType: "Flameblade",
				Notes:     new("This blade is made of pure fire and is surprisingly light to the touch. It innately bypasses the Incorporeal chances of Ethereal monsters."),
			},
		},
		{
			name: "disease alias",
			raw:  "{{WeaponEffect|DiseaseUnholyTear}}",
			want: &api.Enchantment{
				Name:      "Disease: Unholy Tear",
				Amount:    "10d6",
				Element:   "Evil",
				BlastType: "DiseaseUnholyTear",
				Notes:     new("Deals Evil damage on each hit to Good enemies and can spread a disease that reduces Armor Class and Positive Healing Amplification."),
			},
		},
		{
			name: "shield spikes dice",
			raw:  "{{WeaponEffect|Shield Spikes|3|||8}}",
			want: &api.Enchantment{
				Name:      "Shield Spikes",
				Amount:    "3d8",
				Element:   "Piercing",
				BlastType: "Shield Spikes",
				Notes:     new("Deals extra piercing damage when used to shield bash."),
			},
		},
		{
			name: "tidal burst uses its fixed dice",
			raw:  "{{WeaponEffect|Tidal Burst|9|Bursting Tide}}",
			want: &api.Enchantment{
				Name:      "Bursting Tide",
				Amount:    "1d4",
				BlastType: "Tidal Burst",
				Notes:     new("Deals extra damage on each hit. Critical hits also deal 1d8, 2d8, or 3d8 damage for weapons with a x2, x3, or x4 critical multiplier; creatures with the Fire trait take double damage."),
			},
		},
		{
			name: "generic effect requires die count",
			raw:  "{{WeaponEffect|Force}}",
			want: nil,
		},
		{
			name: "shield spikes requires die count",
			raw:  "{{WeaponEffect|Shield Spikes}}",
			want: nil,
		},
		{
			name: "rejects wrong template",
			raw:  "{{DamageEffect|Force|9|Impactful}}",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateWeaponEffect(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateWeaponEffect(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseTemplateWeaponEffectFixedTypes(t *testing.T) {
	tests := []struct {
		raw      string
		wantName string
	}{
		{raw: "{{WeaponEffect|Flameblade}}", wantName: "Flameblade"},
		{raw: "{{WeaponEffect|Frostblade}}", wantName: "Frostblade"},
		{raw: "{{WeaponEffect|Antipodal}}", wantName: "Antipodal"},
		{raw: "{{WeaponEffect|Bone Paws}}", wantName: "Bone Paws"},
		{raw: "{{WeaponEffect|Strength Sapping}}", wantName: "Strength Sapping"},
		{raw: "{{WeaponEffect|Life-Devouring}}", wantName: "Life-Devouring"},
		{raw: "{{WeaponEffect|Disease: Unholy Tear}}", wantName: "Disease: Unholy Tear"},
		{raw: "{{WeaponEffect|Murderous Edge}}", wantName: "Murderous Edge"},
	}

	for _, tt := range tests {
		t.Run(tt.wantName, func(t *testing.T) {
			got := parseTemplateWeaponEffect(tt.raw)
			if got == nil {
				t.Fatalf("parseTemplateWeaponEffect(%q) returned nil", tt.raw)
			}
			if got.Name != tt.wantName {
				t.Fatalf("parseTemplateWeaponEffect(%q).Name = %q, want %q", tt.raw, got.Name, tt.wantName)
			}
		})
	}
}

func TestParseTemplateWildFrenzy(t *testing.T) {
	const baseNotes = "This weapon has a tendency to drive those it strikes insane. On an attack roll of 20 which is confirmed as a critical hit the target will go wild and attack its own allies for 15 seconds if it fails a Will DC: 25 save. Enemies driven wild in this way, however, have a chance of coming to their senses if damaged."

	tests := []struct {
		name string
		raw  string
		want *api.Enchantment
	}{
		{
			name: "default",
			raw:  "{{WildFrenzy}}",
			want: &api.Enchantment{Name: "Wild Frenzy", Notes: new(baseNotes)},
		},
		{
			name: "explicit basic",
			raw:  "{{WildFrenzy|Basic}}",
			want: &api.Enchantment{Name: "Wild Frenzy", Notes: new(baseNotes)},
		},
		{
			name: "custom",
			raw:  "{{WildFrenzy|Custom|50}}",
			want: &api.Enchantment{
				Name:  "Wild Frenzy +50",
				Notes: new("This weapon has a tendency to drive those it strikes insane. On an attack roll of 20 which is confirmed as a critical hit the target will go wild and attack its own allies for 15 seconds if it fails a Will DC: 50 save. Enemies driven wild in this way, however, have a chance of coming to their senses if damaged."),
			},
		},
		{
			name: "custom is case insensitive",
			raw:  "{{WildFrenzy| custom | 42 }}",
			want: &api.Enchantment{
				Name:  "Wild Frenzy +42",
				Notes: new("This weapon has a tendency to drive those it strikes insane. On an attack roll of 20 which is confirmed as a critical hit the target will go wild and attack its own allies for 15 seconds if it fails a Will DC: 42 save. Enemies driven wild in this way, however, have a chance of coming to their senses if damaged."),
			},
		},
		{
			name: "unknown version uses wiki default",
			raw:  "{{WildFrenzy|Legacy}}",
			want: &api.Enchantment{Name: "Wild Frenzy", Notes: new(baseNotes)},
		},
		{
			name: "custom requires DC",
			raw:  "{{WildFrenzy|Custom}}",
			want: nil,
		},
		{
			name: "rejects similarly named template",
			raw:  "{{WildFrenzyOther}}",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateWildFrenzy(tt.raw)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("parseTemplateWildFrenzy(%q) = %#v, want %#v", tt.raw, got, tt.want)
			}
		})
	}
}

func TestParseEnchantmentsWildFrenzyCustom(t *testing.T) {
	want := []api.Enchantment{{
		Name:  "Wild Frenzy +50",
		Notes: new("This weapon has a tendency to drive those it strikes insane. On an attack roll of 20 which is confirmed as a critical hit the target will go wild and attack its own allies for 15 seconds if it fails a Will DC: 50 save. Enemies driven wild in this way, however, have a chance of coming to their senses if damaged."),
	}}

	got := ParseEnchantments("{{WildFrenzy|Custom|50}}", "")
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseEnchantments() = %#v, want %#v", got, want)
	}
}
