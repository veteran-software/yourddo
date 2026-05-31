package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Enhancement represents a single enchantment with arbitrary fields.
type Enhancement map[string]interface{}

// CraftingIngredient represents an entry in the fountainOfNecroticMight.json file.
type CraftingIngredient struct {
	Name           string        `json:"name"`
	EffectsRemoved []Enhancement `json:"effectsRemoved,omitempty"`
	EffectsAdded   []Enhancement `json:"effectsAdded,omitempty"`
}

// RuntimeItem represents an item in the runtime loot files.
type RuntimeItem struct {
	PageTitle    string        `json:"pageTitle"`
	Name         string        `json:"name"`
	Enchantments []Enhancement `json:"enchantments"`
}

func getCleanEnchantments(enchants []Enhancement) []Enhancement {
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
		// Filter out upgrade markers and wiki metadata
		if strings.Contains(lowerName, "upgradeable item") || strings.HasPrefix(lowerName, "upgrade:") {
			continue
		}

		// Also check for 'upgradeable' key if it exists in the enchantment object
		if _, exists := e["upgradeable"]; exists {
			continue
		}

		cleaned = append(cleaned, e)
	}

	return cleaned
}

func main() {
	fountainPath := "src/data/fountainOfNecroticMight.json"
	runtimeDir := "src/data/loot/runtime/"

	fmt.Println("Updating Fountain of Necrotic Might upgrade data...")

	// Read fountain data
	data, err := os.ReadFile(fountainPath)
	if err != nil {
		fmt.Printf("Error reading fountain file: %v\n", err)
		os.Exit(1)
	}

	var fountainItems []CraftingIngredient
	if err := json.Unmarshal(data, &fountainItems); err != nil {
		fmt.Printf("Error unmarshalling fountain data: %v\n", err)
		os.Exit(1)
	}

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

	updatedCount := 0
	for i := range fountainItems {
		itemName := fountainItems[i].Name
		variants, ok := itemMap[itemName]
		if !ok {
			fmt.Printf("Warning: Item '%s' not found in any runtime file\n", itemName)
			continue
		}

		var baseItem *RuntimeItem
		var upgradedItem *RuntimeItem

		for _, v := range variants {
			if strings.Contains(v.PageTitle, "(Upgraded)") {
				upgradedItem = &v
			} else {
				// Base version is the one without "(Upgraded)"
				// We take the one with the shortest PageTitle as the base (to avoid suffixes like "Pre U50")
				if baseItem == nil || len(v.PageTitle) < len(baseItem.PageTitle) {
					baseItem = &v
				}
			}
		}

		if baseItem != nil {
			fountainItems[i].EffectsRemoved = getCleanEnchantments(baseItem.Enchantments)
		}
		if upgradedItem != nil {
			fountainItems[i].EffectsAdded = getCleanEnchantments(upgradedItem.Enchantments)
		} else {
			fmt.Printf("Warning: Upgraded version of '%s' not found\n", itemName)
		}
		updatedCount++
	}

	// Write back
	updatedData, err := json.Marshal(fountainItems)
	if err != nil {
		fmt.Printf("Error marshalling updated data: %v\n", err)
		os.Exit(1)
	}

	// Ensure newline at end to match project style
	updatedData = append(updatedData, '\n')

	if err := os.WriteFile(fountainPath, updatedData, 0644); err != nil {
		fmt.Printf("Error writing updated fountain file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Successfully updated %d items in %s\n", updatedCount, fountainPath)
}
