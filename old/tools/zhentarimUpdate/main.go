package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// Enhancement represents a single enchantment with a specific field order for JSON output.
type Enhancement struct {
	Name         string      `json:"name,omitempty"`
	Modifier     interface{} `json:"modifier,omitempty"`
	Bonus        string      `json:"bonus,omitempty"`
	Notes        string      `json:"notes,omitempty"`
	Charges      interface{} `json:"charges,omitempty"`
	RechargeRate interface{} `json:"rechargeRate,omitempty"`
}

// ZhentarimUpgrade represents an entry in the zhentarimAttuned.json file.
type ZhentarimUpgrade struct {
	Name         string        `json:"name"`
	EffectsLost  []Enhancement `json:"effectsRemoved"`
	EffectsAdded []Enhancement `json:"effectsAdded"`
}

// RuntimeItem represents an item in the runtime loot files.
type RuntimeItem struct {
	PageTitle    string                   `json:"pageTitle"`
	Name         string                   `json:"name"`
	Enchantments []map[string]interface{} `json:"enchantments"`
}

func getCleanEnchantments(enchants []map[string]interface{}) []Enhancement {
	var cleaned []Enhancement
	for _, e := range enchants {
		nameRaw, ok := e["name"]
		if !ok {
			continue
		}
		name, ok := nameRaw.(string)
		if !ok {
			continue
		}

		lowerName := strings.ToLower(name)
		// Filter out wiki metadata but KEEP "Zhentarim Attuned"
		if strings.Contains(lowerName, "upgradeable item") || strings.HasPrefix(lowerName, "upgrade:") {
			continue
		}

		// Also check for 'upgradeable' key if it exists in the enchantment object
		if _, exists := e["upgradeable"]; exists {
			continue
		}

		// Map to our struct to ensure order
		ench := Enhancement{
			Name: name,
		}
		if val, ok := e["modifier"]; ok {
			ench.Modifier = val
		}
		if val, ok := e["bonus"]; ok {
			ench.Bonus = val.(string)
		}
		if val, ok := e["notes"]; ok {
			ench.Notes = val.(string)
		}
		if val, ok := e["charges"]; ok {
			ench.Charges = val
		}
		if val, ok := e["rechargeRate"]; ok {
			ench.RechargeRate = val
		}

		cleaned = append(cleaned, ench)
	}

	return cleaned
}

func main() {
	outputPath := "src/data/zhentarimAttuned.json"
	runtimeDir := "src/data/loot/runtime/"

	fmt.Println("Generating Zhentarim Attuned upgrade data...")

	// Read all runtime files
	itemMap := make(map[string][]RuntimeItem)
	files, err := filepath.Glob(filepath.Join(runtimeDir, "*.json"))
	if err != nil {
		fmt.Printf("Error globbing runtime files: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Reading %d runtime loot files...\n", len(files))
	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			continue
		}

		var items []RuntimeItem
		if err := json.Unmarshal(content, &items); err != nil {
			// Some files might have a different structure, skip them
			continue
		}

		for _, item := range items {
			if item.Name == "" {
				continue
			}
			itemMap[item.Name] = append(itemMap[item.Name], item)
		}
	}

	var zhentarimUpgrades []ZhentarimUpgrade
	processedItems := make(map[string]bool)

	// Iterate through all items to find those with "Zhentarim Attuned"
	for itemName, variants := range itemMap {
		var baseItem *RuntimeItem
		var upgradedItem *RuntimeItem
		hasZhentarim := false

		for i := range variants {
			v := &variants[i]

			// Check if this variant has "Zhentarim Attuned"
			isBaseCandidate := false
			for _, ench := range v.Enchantments {
				if name, ok := ench["name"].(string); ok && name == "Zhentarim Attuned" {
					hasZhentarim = true
					isBaseCandidate = true
					break
				}
			}

			if isBaseCandidate {
				// Base version is the one with "Zhentarim Attuned"
				// If there are multiple, we take the one with the shortest PageTitle (standard practice in this project)
				if baseItem == nil || len(v.PageTitle) < len(baseItem.PageTitle) {
					baseItem = v
				}
			}

			if strings.Contains(v.PageTitle, "(Upgraded)") {
				upgradedItem = v
			}
		}

		if hasZhentarim && !processedItems[itemName] {
			if baseItem != nil && upgradedItem != nil {
				zhentarimUpgrades = append(zhentarimUpgrades, ZhentarimUpgrade{
					Name:         itemName,
					EffectsLost:  getCleanEnchantments(baseItem.Enchantments),
					EffectsAdded: getCleanEnchantments(upgradedItem.Enchantments),
				})
				processedItems[itemName] = true
			} else if baseItem != nil {
				fmt.Printf("Warning: Upgraded version of '%s' not found\n", itemName)
			}
		}
	}

	// Defined sorting order
	desiredOrder := map[string]int{
		"Necklace of Mystic Eidolons":  1,
		"Libram of Silver Magic":       2,
		"Lantern Ring":                 3,
		"Purple Dragon Shield":         4,
		"Magestar":                     5,
		"Manual of Stealthy Pilfering": 6,
	}

	sort.Slice(zhentarimUpgrades, func(i, j int) bool {
		orderI, okI := desiredOrder[zhentarimUpgrades[i].Name]
		orderJ, okJ := desiredOrder[zhentarimUpgrades[j].Name]
		if okI && okJ {
			return orderI < orderJ
		}
		if okI {
			return true
		}
		if okJ {
			return false
		}
		return zhentarimUpgrades[i].Name < zhentarimUpgrades[j].Name
	})

	// Marshal with indentation
	outputData, err := json.Marshal(zhentarimUpgrades)
	if err != nil {
		fmt.Printf("Error marshalling output data: %v\n", err)
		os.Exit(1)
	}

	// Ensure newline at end
	outputData = append(outputData, '\n')

	if err := os.WriteFile(outputPath, outputData, 0644); err != nil {
		fmt.Printf("Error writing output file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Successfully generated %d items in %s\n", len(zhentarimUpgrades), outputPath)
}
