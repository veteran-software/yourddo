package api

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
)

// Global constants
const (
	wikiBaseURL       = "https://ddocompendium.com"
	apiEndpoint       = "/api.php"
	userAgent         = "YourDDO-DataSpider/1.0 (https://github.com/veteran-software/yourddo)"
	apiQueryTemplate  = "action=query&format=json&generator=categorymembers&gcmtitle=Category:%s&gcmlimit=50&prop=revisions&rvprop=content&rvslots=main&redirects=1&formatversion=2"
	pageQueryTemplate = "action=query&format=json&titles=%s&prop=revisions&rvprop=content&rvslots=main&redirects=1&formatversion=2"

	maxRetries    = 4
	baseRetryWait = 5 * time.Second
)

// jitteredSleep sleeps for base ± up to jitter milliseconds.
func jitteredSleep(base, jitter time.Duration) {
	d := base + time.Duration(rand.Int63n(int64(2*jitter))) - jitter
	if d < 0 {
		d = 0
	}
	time.Sleep(d)
}

// setCommonHeaders applies the standard request headers used by all API calls.
func setCommonHeaders(req *http.Request) {
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Connection", "keep-alive")
}

// isCFChallenge returns true when the response looks like a Cloudflare managed challenge.
// CF challenges arrive as 403 or 503 with an HTML body rather than JSON.
func isCFChallenge(statusCode int, body []byte) bool {
	if statusCode != 403 && statusCode != 503 {
		return false
	}
	lower := strings.ToLower(string(body))
	return strings.Contains(lower, "cloudflare") || strings.Contains(lower, "cf-") || strings.Contains(lower, "challenge")
}

// doWithRetry executes req, retrying with exponential backoff on Cloudflare challenge responses.
func doWithRetry(client *http.Client, req *http.Request) (*http.Response, []byte, error) {
	var (
		resp      *http.Response
		bodyBytes []byte
		err       error
	)

	for attempt := 0; attempt <= maxRetries; attempt++ {
		if attempt > 0 {
			wait := baseRetryWait * time.Duration(1<<uint(attempt-1))
			logrus.Warnf("Retry %d/%d after Cloudflare challenge — waiting %s", attempt, maxRetries, wait)
			time.Sleep(wait)

			// Must clone the request because the body has already been consumed.
			cloned, cloneErr := http.NewRequest(req.Method, req.URL.String(), nil)
			if cloneErr != nil {
				return nil, nil, fmt.Errorf("error cloning request for retry: %w", cloneErr)
			}
			for k, vv := range req.Header {
				cloned.Header[k] = vv
			}
			req = cloned
		}

		resp, err = client.Do(req)
		if err != nil {
			return nil, nil, fmt.Errorf("error fetching URL %s: %w", req.URL, err)
		}

		bodyBytes, err = io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			return nil, nil, fmt.Errorf("error reading response body: %w", err)
		}

		if resp.StatusCode == http.StatusOK {
			return resp, bodyBytes, nil
		}

		if isCFChallenge(resp.StatusCode, bodyBytes) {
			logrus.Warnf("Cloudflare challenge received (HTTP %d) for %s", resp.StatusCode, req.URL)
			if attempt == maxRetries {
				return nil, nil, fmt.Errorf("cloudflare challenge not resolved after %d retries (HTTP %d)", maxRetries, resp.StatusCode)
			}
			continue
		}

		// Non-challenge, non-200 — fail immediately.
		return nil, nil, fmt.Errorf("received non-200 status code %d. Response: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil, nil, fmt.Errorf("request failed after %d retries", maxRetries)
}

// FetchPageContent fetches a single page's wikitext content.
func FetchPageContent(pageTitle string) (string, error) {
	encodedTitle := url.QueryEscape(pageTitle)
	query := fmt.Sprintf(pageQueryTemplate, encodedTitle)
	u := wikiBaseURL + apiEndpoint + "?" + query

	client := &http.Client{Timeout: 30 * time.Second}

	req, err := http.NewRequest("GET", u, nil)
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}
	setCommonHeaders(req)

	_, bodyBytes, err := doWithRetry(client, req)
	if err != nil {
		return "", err
	}

	var apiResponse APISuccessResponse
	if err = json.Unmarshal(bodyBytes, &apiResponse); err != nil {
		return "", fmt.Errorf("error decoding JSON response: %w", err)
	}

	if len(apiResponse.Query.Pages) > 0 {
		page := apiResponse.Query.Pages[0]
		if len(page.Revisions) > 0 {
			rev := page.Revisions[0]
			if rev.Slots != nil && rev.Slots.Main != nil && rev.Slots.Main.Content != nil {
				return *rev.Slots.Main.Content, nil
			}
		}
	}

	return "", fmt.Errorf("no content found for page %s", pageTitle)
}

// FetchCategoryContent iteratively calls the MediaWiki API, handles pagination,
// and returns a map of {PageTitle: RawWikitext}.
func FetchCategoryContent(categoryName string) (map[string]string, error) {
	encodedCat := url.PathEscape(categoryName)
	initialQuery := fmt.Sprintf(apiQueryTemplate, encodedCat)
	initialURL := wikiBaseURL + apiEndpoint + "?" + initialQuery

	contentMap := make(map[string]string)
	continueToken := ""
	requestCount := 1

	client := &http.Client{Timeout: 30 * time.Second}

	for {
		currentURL := initialURL
		if continueToken != "" {
			currentURL = initialURL + "&gcmcontinue=" + continueToken
		}

		logrus.Debugf("API Request %d: %s", requestCount, strings.Split(currentURL, "?")[1])

		req, err := http.NewRequest("GET", currentURL, nil)
		if err != nil {
			return nil, fmt.Errorf("error creating request: %w", err)
		}
		setCommonHeaders(req)

		_, bodyBytes, err := doWithRetry(client, req)
		if err != nil {
			return nil, err
		}

		var apiResponse APISuccessResponse
		if err = json.Unmarshal(bodyBytes, &apiResponse); err != nil {
			return nil, fmt.Errorf("error decoding JSON response: %w", err)
		}

		for _, page := range apiResponse.Query.Pages {
			if len(page.Revisions) > 0 {
				rev := page.Revisions[0]
				if rev.Slots != nil && rev.Slots.Main != nil && rev.Slots.Main.Content != nil {
					contentMap[page.Title] = *rev.Slots.Main.Content
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

		// Jittered delay between paginated requests: 495ms ± 100ms
		jitteredSleep(495*time.Millisecond, 100*time.Millisecond)
	}

	return contentMap, nil
}
