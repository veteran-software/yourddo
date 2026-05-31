package parser

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/sirupsen/logrus"

	"compendium-crawler-go/api"
	"compendium-crawler-go/cleanup"
)

// List of core template names (mirrored from the context for quick reference)
var coreTemplateNames = []string{
	"{{Template:Item|", "{{Template:Shield|", "{{Template:Material|", "{{Template:Augment|", "{{Template:Weapon|",
	"{{Template:Armor|", "{{Template:Consumable|", "{{Template:Cosmetic|", "{{Template:RuneArm|", "{{Template:SpellCaster|", "{{Template:VIPLoyalty|",
	"{{Template:Quiver|", "{{Template:Filigree|",
	"{{Template:Trick|", "{{Item|", "{{Shield|", "{{Material|", "{{Augment|", "{{Armor|", "{{VIPLoyalty|",
	"{{Consumable|", "{{Cosmetic|", "{{RuneArm|", "{{Trick|", "{{Weapon|", "{{SpellCaster|", "{{Quiver|", "{{Filigree|",
}

func romanToInt(s string) int {
	romanMap := map[byte]int{
		'I': 1,
		'V': 5,
		'X': 10,
		'L': 50,
		'C': 100,
		'D': 500,
		'M': 1000,
	}

	result := 0
	n := len(s)

	for i := 0; i < n; i++ {
		currentVal := romanMap[s[i]]

		// Check for subtractive cases
		if i+1 < n && currentVal < romanMap[s[i+1]] {
			result -= currentVal
		} else {
			result += currentVal
		}
	}
	return result
}

func intToRoman(n int) string {
	if n <= 0 {
		return ""
	}

	values := []int{1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1}
	symbols := []string{"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"}

	var result strings.Builder
	for i := 0; i < len(values); i++ {
		for n >= values[i] {
			n -= values[i]
			result.WriteString(symbols[i])
		}
	}

	return result.String()
}

var preUSuffixRegex = regexp.MustCompile(`\(Pre U\d+\)$`)

// ProcessContentMap orchestrates the parsing of all raw pages.
func ProcessContentMap(rawContentMap map[string]string) []api.ItemData {
	var processedItems []api.ItemData

	for title, rawContent := range rawContentMap {
		if preUSuffixRegex.MatchString(title) {
			logrus.Debugf("Skipping %s (Pre-Update item)\n", title)
			continue
		}

		if strings.Contains(strings.ToLower(rawContent), "{{discontinued}}") || strings.Contains(strings.ToLower(rawContent), "{{discontinued|") {
			logrus.Debugf("Skipping %s (Discontinued item)\n", title)
			continue
		}

		if strings.Contains(strings.ToLower(rawContent), "{{starter}}") {
			logrus.Debugf("Skipping %s (Starter item)\n", title)
			continue
		}

		cleanedContent := cleanup.CleanRawContent(rawContent)
		fields, err := parseTemplateFields(cleanedContent)

		if err != nil {
			if !strings.Contains(err.Error(), "redirect or empty") {
				logrus.Debugf("Skipping %s (Error parsing core template): %v\n", title, err)
			}
			continue
		}

		// Only convert to ItemData if parsing was successful and it looks like an item
		if fields["type"] != "" ||
			strings.Contains(strings.ToLower(cleanedContent), "{{item|") ||
			strings.Contains(strings.ToLower(cleanedContent), "{{quiver|") ||
			strings.Contains(strings.ToLower(cleanedContent), "{{template:quiver|") {
			item := ConvertItemToJSON(title, fields) // Calls the converter in parser/converter.go

			// Check if the item is marked as discontinued via its drop locations
			isDiscontinued := false
			for _, loc := range item.DropLocations {
				if loc.SourceType == "Discontinued" {
					isDiscontinued = true
					break
				}
			}
			if isDiscontinued {
				logrus.Debugf("Skipping %s (Discontinued via DropLocation)\n", title)
				continue
			}

			processedItems = append(processedItems, item)
		}
	}

	return processedItems
}

// parseTemplateFields extracts and parses the core template using a brace-counting parser.
func parseTemplateFields(rawContent string) (map[string]string, error) {
	if strings.Contains(rawContent, "#REDIRECT") || strings.TrimSpace(rawContent) == "" {
		return nil, fmt.Errorf("page is a redirect or empty")
	}

	aggressiveContent := strings.ToLower(rawContent)
	var templateStart = -1
	var templatePrefix string
	var prefixLength int

	// 1. Find the start of the core template
	for _, name := range coreTemplateNames {
		start := strings.Index(aggressiveContent, strings.ToLower(name))
		if start != -1 {
			templateStart = start
			templatePrefix = name
			prefixLength = len(name)
			break
		}
	}

	if templateStart == -1 {
		return nil, fmt.Errorf("could not find a matching core template in the content")
	}

	// Get the index in the original, full content string
	rawTemplateStart := strings.Index(rawContent, templatePrefix)
	if rawTemplateStart == -1 {
		// Fallback search in case of a slight casing mismatch (shouldn't happen post-cleanup)
		rawTemplateStart = strings.Index(strings.ToLower(rawContent), strings.ToLower(templatePrefix))
		if rawTemplateStart == -1 {
			return nil, fmt.Errorf("could not locate clean prefix in raw content")
		}
	}

	// 2. Find the end of the template (the final closing braces)
	templateEnd := strings.LastIndex(rawContent, "}}")

	if templateEnd == -1 || templateEnd < rawTemplateStart {
		return nil, fmt.Errorf("found template start but no matching closing '}}'")
	}

	// 3. Extract the parameter list string
	paramListStart := rawTemplateStart + prefixLength
	paramList := rawContent[paramListStart:templateEnd]

	fields := make(map[string]string)

	// 4. CORE: Brace-counting loop
	var currentKey string
	var currentVal strings.Builder
	var braceCount = 0
	var valueStarted = false

	for i, char := range paramList {
		if char == '{' {
			braceCount++
		} else if char == '}' {
			braceCount--
		}

		if char == '|' && braceCount == 0 {
			if valueStarted {
				value := strings.TrimSpace(currentVal.String())

				if currentKey != "" {
					fields[currentKey] = value
				}

				currentKey = ""
				currentVal.Reset()
				valueStarted = false
				continue
			}
		}

		if char == '=' && braceCount == 0 && !valueStarted {
			currentKey = strings.TrimSpace(currentVal.String())
			currentVal.Reset()
			valueStarted = true
			continue
		}

		currentVal.WriteRune(char)

		if i == len(paramList)-1 {
			value := strings.TrimSpace(currentVal.String())
			if currentKey != "" && valueStarted {
				fields[currentKey] = value
			}
		}
	}

	if len(fields) == 0 && strings.TrimSpace(paramList) != "" && !strings.Contains(strings.ToLower(paramList), "category") {
		return nil, fmt.Errorf("failed to parse fields with brace counter")
	}

	return fields, nil
}
