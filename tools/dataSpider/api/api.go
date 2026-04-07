package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
)

// Global constants
const (
	wikiBaseURL      = "https://ddocompendium.com"
	apiEndpoint      = "/api.php"
	userAgent        = "YourDDO-DataSpider/1.0 (https://github.com/veteran-software/yourddo)"
	apiQueryTemplate = "action=query&format=json&generator=categorymembers&gcmtitle=Category:%s&gcmlimit=50&prop=revisions&rvprop=content&rvslots=main&redirects=1&formatversion=2"
)

// FetchCategoryContent iteratively calls the MediaWiki API, handles pagination,
// and returns a map of {PageTitle: RawWikitext}.
func FetchCategoryContent(categoryName string) (map[string]string, error) {
	initialURL := buildInitialURL(categoryName)
	contentMap := make(map[string]string)
	currentURL := initialURL
	continueToken := ""
	requestCount := 1

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	for {
		if continueToken != "" {
			currentURL = initialURL + "&gcmcontinue=" + continueToken
		} else {
			currentURL = initialURL
		}

		logrus.Debugf("API Request %d: %s", requestCount, strings.Split(currentURL, "?")[1])

		req, err := http.NewRequest("GET", currentURL, nil)
		if err != nil {
			return nil, fmt.Errorf("error creating request: %w", err)
		}

		req.Header.Set("User-Agent", userAgent)
		req.Header.Set("Accept", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			return nil, fmt.Errorf("error fetching URL %s: %w", currentURL, err)
		}

		if resp.StatusCode != http.StatusOK {
			bodyBytes, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return nil, fmt.Errorf("received non-200 status code %d. Response: %s", resp.StatusCode, string(bodyBytes))
		}

		apiResponse, err := fetchAndDecodeResponse(currentURL)
		if err != nil {
			return nil, err
		}

		processPages(apiResponse, contentMap)

		if cont, ok := apiResponse.Continue["gcmcontinue"]; ok {
			continueToken = cont
			requestCount++
		} else {
			break
		}
	}

	return contentMap, nil
}

func buildInitialURL(categoryName string) string {
	encodedCat := url.PathEscape(categoryName)
	query := fmt.Sprintf(apiQueryTemplate, encodedCat)
	return wikiBaseURL + apiEndpoint + "?" + query
}

func fetchAndDecodeResponse(currentURL string) (*APISuccessResponse, error) {
	resp, err := http.Get(currentURL)
	if err != nil {
		return nil, fmt.Errorf("error fetching URL %s: %w", currentURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("received non-200 status code %d. Response: %s", resp.StatusCode, string(bodyBytes))
	}

	var apiResponse APISuccessResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		return nil, fmt.Errorf("error decoding JSON response: %w", err)
	}
	return &apiResponse, nil
}

func processPages(apiResponse *APISuccessResponse, contentMap map[string]string) {
	for _, page := range apiResponse.Query.Pages {
		content := ""
		if len(page.Revisions) > 0 {
			rev := page.Revisions[0]
			// Safety check the pointer path to ensure content exists
			if rev.Slots != nil && rev.Slots.Main != nil && rev.Slots.Main.Content != nil {
				content = *rev.Slots.Main.Content
			}
		}
		contentMap[page.Title] = content
	}
}
