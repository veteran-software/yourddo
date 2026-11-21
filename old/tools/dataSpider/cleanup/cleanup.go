package cleanup

import (
	"regexp"
	"strings"
	"unicode"
)

// --- Regular Expressions ---

var (
	// ReEqualsCleanup Matches zero or more spaces, '=', then zero or more spaces. Replaces with '='.
	ReEqualsCleanup = regexp.MustCompile(` *= *`)
	// ReAsteriskCleanup Matches zero or more spaces, '*', then zero or more spaces. Replaces with ''.
	ReAsteriskCleanup = regexp.MustCompile(` *\* *`)
)

// IsWikitextChar checks if a rune is a character that should be preserved in wikitext.
func IsWikitextChar(r rune) bool {
	return unicode.IsLetter(r) ||
		unicode.IsNumber(r) ||
		unicode.IsPunct(r) ||
		unicode.IsSymbol(r) ||
		r == '=' || r == '|' || r == '*' || r == '{' || r == '}' || r == '[' || r == ']' || r == ' ' || r == '\n' || r == '\t'
}

// CleanRawContent applies all necessary trimming and regex transformations.
func CleanRawContent(rawContent string) string {
	// 1. Filter out non-essential/hidden control characters
	filtered := strings.Builder{}
	for _, r := range rawContent {
		if IsWikitextChar(r) {
			filtered.WriteRune(r)
		}
	}
	cleaned := filtered.String()

	// 2. Newline/Tab/Space Cleanup
	cleaned = strings.TrimFunc(cleaned, unicode.IsSpace)
	cleaned = strings.ReplaceAll(cleaned, "\n", "")
	cleaned = strings.ReplaceAll(cleaned, "\r", "")
	cleaned = strings.ReplaceAll(cleaned, "\t", " ")

	// 3. Regex Cleanup
	cleaned = ReEqualsCleanup.ReplaceAllString(cleaned, "=")
	cleaned = ReAsteriskCleanup.ReplaceAllString(cleaned, "")

	return cleaned
}
