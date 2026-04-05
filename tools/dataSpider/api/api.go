package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/sirupsen/logrus"
)

// Global constants
const (
	wikiBaseURL      = "https://ddocompendium.com"
	apiEndpoint      = "/api.php"
	apiQueryTemplate = "action=query&format=json&generator=categorymembers&gcmtitle=Category:%s&gcmlimit=50&prop=revisions&rvprop=content&rvslots=main&redirects=1&formatversion=2"
)

// FetchCategoryContent iteratively calls the MediaWiki API, handles pagination,
// and returns a map of {PageTitle: RawWikitext}.
func FetchCategoryContent(categoryName string) (map[string]string, error) {
	encodedCat := url.PathEscape(categoryName)
	initialQuery := fmt.Sprintf(apiQueryTemplate, encodedCat)
	initialURL := wikiBaseURL + apiEndpoint + "?" + initialQuery

	contentMap := make(map[string]string)
	currentURL := initialURL
	continueToken := ""
	requestCount := 1

	for {
		if continueToken != "" {
			currentURL = initialURL + "&gcmcontinue=" + continueToken
		} else {
			currentURL = initialURL
		}

		logrus.Debugf("API Request %d: %s", requestCount, strings.Split(currentURL, "?")[1])

		resp, err := http.Get(currentURL)
		if err != nil {
			return nil, fmt.Errorf("error fetching URL %s: %w", currentURL, err)
		}

		if resp.StatusCode != http.StatusOK {
			bodyBytes, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return nil, fmt.Errorf("received non-200 status code %d. Response: %s", resp.StatusCode, string(bodyBytes))
		}

		var apiResponse APISuccessResponse
		err = json.NewDecoder(resp.Body).Decode(&apiResponse)
		resp.Body.Close()
		if err != nil {
			return nil, fmt.Errorf("error decoding JSON response: %w", err)
		}

		for _, page := range apiResponse.Query.Pages {
			if len(page.Revisions) > 0 {
				rev := page.Revisions[0]

				// Safety check the pointer path to ensure content exists
				if rev.Slots != nil && rev.Slots.Main != nil && rev.Slots.Main.Content != nil {
					rawContent := *rev.Slots.Main.Content
					contentMap[page.Title] = rawContent
				} else {
					contentMap[page.Title] = ""
				}
			} else {
				contentMap[page.Title] = ""
			}
		}

		if cont, ok := apiResponse.Continue["gcmcontinue"]; ok {
			continueToken = cont
			requestCount++
		} else {
			break
		}
	}

	return contentMap, nil
}
