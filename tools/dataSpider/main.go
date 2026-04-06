package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/sirupsen/logrus"

	"compendium-crawler-go/api"
	"compendium-crawler-go/parser"
)

func main() {
	if len(os.Args) < 2 {
		logrus.Info("Usage: go run main.go <Category_Name_Without_Prefix>")
		logrus.Info("Example: go run main.go Items")
		os.Exit(1)
	}

	logrus.SetLevel(logrus.InfoLevel)

	categoryInput := os.Args[1]

	// Define aggregate categories mapping
	aggregates := map[string][]string{
		"Armor":    {"Docent", "Heavy Armor", "Medium Armor", "Light Armor", "Robe", "Outfit"},
		"Clothing": {"Cloak", "Boots", "Gloves", "Helmet", "Belt"},
		"Jewelry":  {"Goggles", "Ring", "Necklace", "Trinket", "Bracers"},
		// Add more aggregate categories as needed
	}

	var categoriesToProcess []string
	if subs, ok := aggregates[categoryInput]; ok {
		categoriesToProcess = subs
	} else {
		categoriesToProcess = []string{categoryInput}
	}

	for _, categoryName := range categoriesToProcess {
		processCategory(categoryName)
	}
}

func processCategory(categoryName string) {
	logrus.Info("-------------------------------------------------------------------------")
	logrus.Infof("Starting ETL for Category:%s...", categoryName)
	logrus.Info("-------------------------------------------------------------------------")

	// 1. Fetch raw content from MediaWiki API
	rawResults, err := api.FetchCategoryContent(categoryName)
	if err != nil {
		logrus.Errorf("Error during API fetch for %s: %v", categoryName, err)
		return
	}

	if len(rawResults) == 0 {
		logrus.Warnf("No results found for category: %s", categoryName)
		return
	}

	// 2. Determine processing path
	lowerCat := strings.ToLower(categoryName)
	var jsonData []byte

	if lowerCat == "augment" || lowerCat == "augments" {
		augmentItems := parser.ProcessAugmentMap(rawResults)
		// Sort output by name using natural order
		sort.Slice(augmentItems, func(i, j int) bool {
			return naturalLess(augmentItems[i].Name, augmentItems[j].Name)
		})
		jsonData, err = json.Marshal(augmentItems)
		if err != nil {
			logrus.Errorf("Error marshalling Augment JSON for %s: %v", categoryName, err)
			return
		}
	} else {
		// Default: process generic item pages
		processedItems := parser.ProcessContentMap(rawResults)
		// Sort output by name using natural order
		sort.Slice(processedItems, func(i, j int) bool {
			return naturalLess(processedItems[i].Name, processedItems[j].Name)
		})
		jsonData, err = json.Marshal(processedItems)
		if err != nil {
			logrus.Errorf("Error marshalling JSON for %s: %v", categoryName, err)
			return
		}
	}

	// 3. Output to file
	// Locate project root by looking for package.json starting from the executable's directory
	execDir, _ := os.Getwd()
	projectRoot := execDir
	for {
		if _, err := os.Stat(filepath.Join(projectRoot, "package.json")); err == nil {
			break
		}
		parent := filepath.Dir(projectRoot)
		if parent == projectRoot {
			projectRoot = execDir // Fallback
			break
		}
		projectRoot = parent
	}

	outputDir := filepath.Join(projectRoot, "src", "data", "loot", "runtime")
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		logrus.Errorf("Error creating output directory %s: %v", outputDir, err)
		return
	}

	fileName := toCamelCase(categoryName) + ".json"
	outputPath := filepath.Join(outputDir, fileName)
	err = os.WriteFile(outputPath, append(jsonData, '\n'), 0644)
	if err != nil {
		logrus.Errorf("Error writing to file %s: %v", outputPath, err)
		return
	}

	logrus.Info("-------------------------------------------------------------------------")
	logrus.Infof("Processing complete for %s. Successfully parsed items. Output: %s", categoryName, outputPath)
	logrus.Info("-------------------------------------------------------------------------")
}

func toCamelCase(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}

	words := strings.FieldsFunc(s, func(r rune) bool {
		return r == ' ' || r == '_' || r == '-'
	})

	if len(words) == 0 {
		return ""
	}

	for i := range words {
		words[i] = strings.ToLower(words[i])
		if i > 0 {
			// Title case the subsequent words
			runes := []rune(words[i])
			if len(runes) > 0 {
				runes[0] = []rune(strings.ToUpper(string(runes[0])))[0]
				words[i] = string(runes)
			}
		}
	}

	return strings.Join(words, "")
}

// naturalLess compares two strings using case-insensitive, number-aware natural ordering.
// Examples: "1" < "2" < "10"; "Item 2" < "Item 10" < "Item 11".
func naturalLess(a, b string) bool {
	sa := strings.TrimSpace(a)
	sb := strings.TrimSpace(b)
	la := strings.ToLower(sa)
	lb := strings.ToLower(sb)

	ia, ib := 0, 0
	for ia < len(la) && ib < len(lb) {
		ca := la[ia]
		cb := lb[ib]

		if isDigitByte(ca) && isDigitByte(cb) {
			na, naNext := parseNumber(la, ia)
			nb, nbNext := parseNumber(lb, ib)
			if na != nb {
				return na < nb
			}
			ia, ib = naNext, nbNext
			continue
		}

		if ca != cb {
			return ca < cb
		}
		ia++
		ib++
	}

	if ia != ib {
		return ia == len(la)
	}

	// As a deterministic tie-breaker when lowercased content is equivalent,
	// fall back to original case-sensitive comparison.
	if la == lb {
		return sa < sb
	}
	return la < lb
}

func isDigitByte(b byte) bool { return b >= '0' && b <= '9' }

// parseNumber parses a contiguous run of ASCII digits starting at index i in s (lowercased input is fine).
// Returns the numeric value and the index immediately after the digit run.
func parseNumber(s string, i int) (int, int) {
	j := i
	for j < len(s) && isDigitByte(s[j]) {
		j++
	}
	// Avoid strconv.Atoi on empty substring; j>i is guaranteed here
	n, err := strconv.Atoi(s[i:j])
	if err != nil {
		// Fallback: treat malformed number as 0 and move on
		return 0, j
	}
	return n, j
}
