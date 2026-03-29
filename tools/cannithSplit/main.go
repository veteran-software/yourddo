package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintf(os.Stderr, "usage: %s <input.json> <output-dir>\n", os.Args[0])
		os.Exit(1)
	}

	inputPath := os.Args[1]
	outputDir := os.Args[2]

	raw, err := loadRawEnhancements(inputPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load input: %v\n", err)
		os.Exit(1)
	}

	effects, enchantments, placements, tiers, recipes, display, plannerEntries := transform(raw)
	indexes := buildIndexes(plannerEntries)

	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		fmt.Fprintf(os.Stderr, "failed to create output dir: %v\n", err)
		os.Exit(1)
	}

	mustWriteJSON(filepath.Join(outputDir, "effects.json"), effects)
	mustWriteJSON(filepath.Join(outputDir, "enchantments.json"), enchantments)
	mustWriteJSON(filepath.Join(outputDir, "placements.json"), placements)
	mustWriteJSON(filepath.Join(outputDir, "tiers.json"), tiers)
	mustWriteJSON(filepath.Join(outputDir, "recipes.json"), recipes)
	mustWriteJSON(filepath.Join(outputDir, "display.json"), display)
	mustWriteJSON(filepath.Join(outputDir, "planner_entries.json"), plannerEntries)
	mustWriteJSON(filepath.Join(outputDir, "indexes.json"), indexes)

	const format = "  %s\n"

	fmt.Printf("Wrote:\n")
	fmt.Printf(format, filepath.Join(outputDir, "effects.json"))
	fmt.Printf(format, filepath.Join(outputDir, "enchantments.json"))
	fmt.Printf(format, filepath.Join(outputDir, "placements.json"))
	fmt.Printf(format, filepath.Join(outputDir, "tiers.json"))
	fmt.Printf(format, filepath.Join(outputDir, "recipes.json"))
	fmt.Printf(format, filepath.Join(outputDir, "display.json"))
	fmt.Printf(format, filepath.Join(outputDir, "planner_entries.json"))
	fmt.Printf(format, filepath.Join(outputDir, "indexes.json"))
}

func loadRawEnhancements(path string) ([]RawEnhancement, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var rawItems []json.RawMessage
	if err := json.Unmarshal(data, &rawItems); err != nil {
		return nil, fmt.Errorf("expected top-level JSON array: %w", err)
	}

	out := make([]RawEnhancement, 0, len(rawItems))
	for i, raw := range rawItems {
		var item RawEnhancement
		if err := json.Unmarshal(raw, &item); err != nil {
			return nil, fmt.Errorf("failed to decode enhancement at index %d: %w\nraw: %s", i, err, string(raw))
		}
		out = append(out, item)
	}

	return out, nil
}

func mustWriteJSON(path string, v any) {
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to marshal %s: %v\n", path, err)
		os.Exit(1)
	}

	if err := os.WriteFile(path, data, 0o644); err != nil {
		fmt.Fprintf(os.Stderr, "failed to write %s: %v\n", path, err)
		os.Exit(1)
	}
}
