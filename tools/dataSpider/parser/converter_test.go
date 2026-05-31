package parser

import (
	"compendium-crawler-go/api"
	"reflect"
	"testing"
)

func TestLGSAugments(t *testing.T) {
	tests := []struct {
		name     string
		fields   map[string]string
		expected []api.AugmentItem
	}{
		{
			name: "LGSAugments No Params",
			fields: map[string]string{
				"emptyaugments": "{{LGSAugments}}",
			},
			expected: []api.AugmentItem{
				{AugmentType: "Green Steel Epic Tier 1"},
				{AugmentType: "Green Steel Epic Tier 2"},
				{AugmentType: "Green Steel Epic Tier 3"},
				{AugmentType: "Green Steel Epic Tier Active"},
			},
		},
		{
			name: "LGSAugments With Param",
			fields: map[string]string{
				"emptyaugments": "{{LGSAugments|1}}",
			},
			expected: []api.AugmentItem{
				{AugmentType: "Green Steel Epic Tier 1"},
				{AugmentType: "Green Steel Epic Tier 2"},
				{AugmentType: "Green Steel Epic Tier 3"},
				{AugmentType: "Green Steel Epic Tier Active"},
				{AugmentType: "Fangs of Shavarath"},
			},
		},
		{
			name: "LGSAugments Singular Field",
			fields: map[string]string{
				"emptyaugment": "{{LGSAugments|(Clothing)}}",
			},
			expected: []api.AugmentItem{
				{AugmentType: "Green Steel Epic Tier 1"},
				{AugmentType: "Green Steel Epic Tier 2"},
				{AugmentType: "Green Steel Epic Tier 3"},
				{AugmentType: "Green Steel Epic Tier Active"},
				{AugmentType: "Fangs of Shavarath"},
			},
		},
		{
			name: "LGSAugments in Enchantments",
			fields: map[string]string{
				"enchantments": "{{LGSAugments}}",
			},
			expected: []api.AugmentItem{
				{AugmentType: "Green Steel Epic Tier 1"},
				{AugmentType: "Green Steel Epic Tier 2"},
				{AugmentType: "Green Steel Epic Tier 3"},
				{AugmentType: "Green Steel Epic Tier Active"},
			},
		},
		{
			name: "LGSAugments Nested in EmptyAugments",
			fields: map[string]string{
				"emptyaugments": "{{EmptyAugments|{{LGSAugments}}}}",
			},
			expected: []api.AugmentItem{
				{AugmentType: "Green Steel Epic Tier 1"},
				{AugmentType: "Green Steel Epic Tier 2"},
				{AugmentType: "Green Steel Epic Tier 3"},
				{AugmentType: "Green Steel Epic Tier Active"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			item := ConvertItemToJSON(tt.name, tt.fields)
			if !reflect.DeepEqual(item.Augments, tt.expected) {
				t.Errorf("ConvertItemToJSON() Augments = %v, want %v", item.Augments, tt.expected)
			}
		})
	}
}

func TestLGSAugmentDrop(t *testing.T) {
	tests := []struct {
		name     string
		raw      string
		expected api.DropSourceData
	}{
		{
			name: "LGSAugment Named Params",
			raw:  "{{LGSAugment |altar = Invasion |pFocus = Air |sFocus = Earth |gem = Opposition |essence = Material }}",
			expected: api.DropSourceData{
				SourceType:        "LGSAugment",
				LGSAugmentAltar:   "Invasion",
				LGSAugmentPFocus:  "Air",
				LGSAugmentSFocus:  "Earth",
				LGSAugmentGem:     "Opposition",
				LGSAugmentEssence: "Material",
			},
		},
		{
			name: "LGSAugment Positional Params",
			raw:  "{{LGSAugment|Invasion|Air|Earth|Opposition|Material}}",
			expected: api.DropSourceData{
				SourceType:        "LGSAugment",
				LGSAugmentAltar:   "Invasion",
				LGSAugmentPFocus:  "Air",
				LGSAugmentSFocus:  "Earth",
				LGSAugmentGem:     "Opposition",
				LGSAugmentEssence: "Material",
			},
		},
		{
			name: "LGSAugment Mixed/Missing Params",
			raw:  "{{LGSAugment|altar=Invasion|pFocus=Air|essence=Material}}",
			expected: api.DropSourceData{
				SourceType:        "LGSAugment",
				LGSAugmentAltar:   "Invasion",
				LGSAugmentPFocus:  "Air",
				LGSAugmentEssence: "Material",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateLGSAugment(tt.raw)
			if !reflect.DeepEqual(got, tt.expected) {
				t.Errorf("parseTemplateLGSAugment() = %+v, want %+v", got, tt.expected)
			}
		})
	}
}

func TestGreenSteelCraftingPurchaseDrop(t *testing.T) {
	tests := []struct {
		name     string
		raw      string
		expected api.DropSourceData
	}{
		{
			name: "GSC Named Params",
			raw:  "{{GreenSteelCraftingPurchase |altar = Devastation |arrow = 1 |bone = 1 |shrapnel = 1 |stone = 1 |comms = 100 |legendary = 1 }}",
			expected: api.DropSourceData{
				SourceType:   "GreenSteelCraftingPurchase",
				GSCAltar:     "Devastation",
				GSCArrow:     "1",
				GSCBone:      "1",
				GSCShrapnel:  "1",
				GSCStone:     "1",
				GSCComms:     "100",
				GSCLegendary: "1",
			},
		},
		{
			name: "GSC Positional Params",
			raw:  "{{GreenSteelCraftingPurchase|Devastation|1|2|3|4|5|6|100|10|1}}",
			expected: api.DropSourceData{
				SourceType:   "GreenSteelCraftingPurchase",
				GSCAltar:     "Devastation",
				GSCArrow:     "1",
				GSCBone:      "2",
				GSCShrapnel:  "3",
				GSCChain:     "4",
				GSCStone:     "5",
				GSCScales:    "6",
				GSCComms:     "100",
				GSCRunes:     "10",
				GSCLegendary: "1",
			},
		},
		{
			name: "GSC Mixed/Missing Params",
			raw:  "{{GreenSteelCraftingPurchase|altar=Devastation|comms=100}}",
			expected: api.DropSourceData{
				SourceType: "GreenSteelCraftingPurchase",
				GSCAltar:   "Devastation",
				GSCComms:   "100",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTemplateGreenSteelCraftingPurchase(tt.raw)
			if !reflect.DeepEqual(got, tt.expected) {
				t.Errorf("parseTemplateGreenSteelCraftingPurchase() = %+v, want %+v", got, tt.expected)
			}
		})
	}
}
