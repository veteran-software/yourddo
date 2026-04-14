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

const lineDivider = "-------------------------------------------------------------------------"

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
		"Armor":     {"Docent", "Heavy Armor", "Medium Armor", "Light Armor", "Robe", "Outfit"},
		"Clothing":  {"Cloak", "Boots", "Gloves", "Helmet", "Belt"},
		"Exotic":    {"Bastard Sword", "Dwarven War Axe", "Great Crossbow", "Handwraps", "Kama", "Khopesh", "Repeating Heavy Crossbow", "Repeating Light Crossbow"},
		"Jewelry":   {"Goggles", "Ring", "Necklace", "Trinket", "Bracers"},
		"Martial":   {"Battle Axe", "Falchion", "Great Axe", "Great Club", "Great Sword", "Hand Axe", "Heavy Pick", "Kukri", "Light Hammer", "Light Pick", "Long Bow", "Long Sword", "Maul", "Rapier", "Scimitar", "Short Bow", "Short Sword", "Warhammer"},
		"Quiver":    {"Quiver"},
		"Shield":    {"Buckler", "Large Shield", "Orb", "Small Shield", "Tower Shield"},
		"Simple":    {"Club", "Dagger", "Light Crossbow", "Light Mace", "Heavy Crossbow", "Heavy Mace", "Morningstar", "Quarterstaff", "Sickle"},
		"Throwing":  {"Dart", "Shuriken", "Throwing Axe", "Throwing Dagger", "Throwing Hammer"},
		"Filigrees": {"Filigrees", "Filigree Sets"},
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
	logrus.Info(lineDivider)
	logrus.Infof("Starting ETL for %s...", categoryName)
	logrus.Info(lineDivider)

	var rawResults map[string]string
	var err error

	// Special case: Filigree Sets might be a specific page, not a category
	if strings.EqualFold(categoryName, "Filigree Sets") {
		content, err := api.FetchPageContent("Filigree_Item_Sets")
		if err != nil {
			logrus.Errorf("Error fetching page 'Filigree_Item_Sets': %v", err)
			return
		}
		rawResults = map[string]string{"Filigree_Item_Sets": content}
	} else {
		// 1. Fetch raw content from MediaWiki API
		rawResults, err = api.FetchCategoryContent(categoryName)
		if err != nil {
			logrus.Errorf("Error during API fetch for %s: %v", categoryName, err)
			return
		}
	}

	if len(rawResults) == 0 {
		logrus.Warnf("No results found for category: %s", categoryName)
		return
	}

	// 2. Determine processing path
	jsonData, done := processDataByCat(categoryName, rawResults)
	if done {
		return
	}

	// 3. Output to file
	projectRoot := findProjectRoot()
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

	logrus.Info(lineDivider)
	logrus.Infof("Processing complete for %s. Successfully parsed items. Output: %s", categoryName, outputPath)
	logrus.Info(lineDivider)
}

func findProjectRoot() string {
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
	return projectRoot
}

func processDataByCat(categoryName string, rawResults map[string]string) ([]byte, bool) {
	lowerCat := strings.ToLower(categoryName)
	var jsonData []byte
	var err error
	var done bool

	if lowerCat == "augment" || lowerCat == "augments" {
		jsonData, err, done = processAugmentCat(categoryName, rawResults, nil, nil)
	} else if lowerCat == "filigree sets" {
		jsonData, err, done = processFiligreeSetCat(categoryName, rawResults, nil, nil)
	} else {
		logrus.Debugf("Processing %s as item category", categoryName)
		jsonData, err, done = processItemCat(categoryName, rawResults, nil, nil)
	}

	if done || err != nil {
		return nil, true
	}
	return jsonData, false
}

func processItemCat(categoryName string, rawResults map[string]string, jsonData []byte, err error) ([]byte, error, bool) {
	// Default: process generic item pages
	processedItems := parser.ProcessContentMap(rawResults)
	// Sort output by name using natural order
	sort.Slice(processedItems, func(i, j int) bool {
		return naturalLess(processedItems[i].Name, processedItems[j].Name)
	})

	jsonData, err = json.Marshal(processedItems)
	if err != nil {
		logrus.Errorf("Error marshalling JSON for %s: %v", categoryName, err)
		return nil, nil, true
	}

	return jsonData, err, false
}

func processAugmentCat(categoryName string, rawResults map[string]string, jsonData []byte, err error) ([]byte, error, bool) {
	augmentItems := parser.ProcessAugmentMap(rawResults)
	// Sort output by name using natural order
	sort.Slice(augmentItems, func(i, j int) bool {
		return naturalLess(augmentItems[i].Name, augmentItems[j].Name)
	})

	jsonData, err = json.Marshal(augmentItems)
	if err != nil {
		logrus.Errorf("Error marshalling Augment JSON for %s: %v", categoryName, err)
		return nil, nil, true
	}

	return jsonData, err, false
}

func processFiligreeSetCat(categoryName string, rawResults map[string]string, jsonData []byte, err error) ([]byte, error, bool) {
	var allSets []api.FiligreeSet
	for _, content := range rawResults {
		allSets = append(allSets, parser.ParseFiligreeSets(content)...)
	}

	// Sort output by name using natural order
	sort.Slice(allSets, func(i, j int) bool {
		return naturalLess(allSets[i].Name, allSets[j].Name)
	})

	jsonData, err = json.Marshal(allSets)
	if err != nil {
		logrus.Errorf("Error marshalling Filigree Set JSON: %v", err)
		return nil, nil, true
	}

	return jsonData, err, false
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
