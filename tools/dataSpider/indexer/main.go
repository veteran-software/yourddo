package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/sirupsen/logrus"
)

// ItemInfo represents the minimal data for an item in a set
type ItemInfo struct {
	Name     string `json:"name"`
	MinLevel int    `json:"minLevel"`
}

// SetBonusIndex maps set bonus names to the list of items in that set
type SetBonusIndex map[string][]ItemInfo

// RawItem represents the structure we expect in the runtime JSON files
type RawItem struct {
	Name         string `json:"name"`
	MinLevel     string `json:"minLevel,omitempty"`     // For regular items
	MinimumLevel *int   `json:"minimumLevel,omitempty"` // For augments
	SetBonus     []struct {
		Name string `json:"name"`
	} `json:"setBonus,omitempty"`
}

func main() {
	logrus.SetLevel(logrus.InfoLevel)
	logrus.Info("Starting Set Bonus Indexer...")

	execDir, _ := os.Getwd()
	projectRoot := findProjectRoot(execDir)
	runtimeDir := filepath.Join(projectRoot, "src", "data", "loot", "runtime")

	index := make(SetBonusIndex)

	files, err := os.ReadDir(runtimeDir)
	if err != nil {
		logrus.Fatalf("Failed to read runtime directory: %v", err)
	}

	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".json") || file.Name() == "setBonusIndex.json" {
			continue
		}

		filePath := filepath.Join(runtimeDir, file.Name())
		processFile(filePath, index)
	}

	// Sort items within each set by name
	for setName := range index {
		sort.Slice(index[setName], func(i, j int) bool {
			if index[setName][i].MinLevel != index[setName][j].MinLevel {
				return index[setName][i].MinLevel < index[setName][j].MinLevel
			}
			return index[setName][i].Name < index[setName][j].Name
		})
	}

	// Output the index
	outputPath := filepath.Join(projectRoot, "src", "data", "loot", "runtime", "setBonusIndex.json")
	outputData, err := json.Marshal(index)
	if err != nil {
		logrus.Fatalf("Failed to marshal index: %v", err)
	}

	if err := os.WriteFile(outputPath, append(outputData, '\n'), 0644); err != nil {
		logrus.Fatalf("Failed to write index to %s: %v", outputPath, err)
	}

	logrus.Infof("Successfully generated set bonus index with %d sets at %s", len(index), outputPath)
}

func processFile(path string, index SetBonusIndex) {
	data, err := os.ReadFile(path)
	if err != nil {
		logrus.Errorf("Failed to read file %s: %v", path, err)
		return
	}

	var items []RawItem
	if err := json.Unmarshal(data, &items); err != nil {
		logrus.Errorf("Failed to unmarshal JSON in %s: %v", path, err)
		return
	}

	for _, item := range items {
		if len(item.SetBonus) == 0 {
			continue
		}

		minLevel := 0
		if item.MinimumLevel != nil {
			minLevel = *item.MinimumLevel
		} else if item.MinLevel != "" {
			// Extract first number from minLevel (e.g. "29" or "1 / 20")
			minLevel = parseMinLevel(item.MinLevel)
		}

		for _, sb := range item.SetBonus {
			setName := strings.TrimSpace(sb.Name)
			if setName == "" {
				continue
			}

			index[setName] = append(index[setName], ItemInfo{
				Name:     item.Name,
				MinLevel: minLevel,
			})
		}
	}
}

func parseMinLevel(s string) int {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0
	}
	// Take the first sequence of digits
	var sb strings.Builder
	for _, r := range s {
		if r >= '0' && r <= '9' {
			sb.WriteRune(r)
		} else if sb.Len() > 0 {
			break
		}
	}
	if sb.Len() == 0 {
		return 0
	}
	val, _ := strconv.Atoi(sb.String())
	return val
}

func findProjectRoot(startDir string) string {
	curr := startDir
	for {
		if _, err := os.Stat(filepath.Join(curr, "package.json")); err == nil {
			return curr
		}
		parent := filepath.Dir(curr)
		if parent == curr {
			return startDir
		}
		curr = parent
	}
}
