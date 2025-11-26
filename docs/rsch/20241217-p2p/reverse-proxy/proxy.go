/*
 * Copyright (c) 2024-present Sigma-Soft, Ltd.
 * @author Aleksei Ponomarev
 *
 */

package main

import (
	"hash/crc32"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync/atomic"
)

const (
	prometheusUser = "voedger"
	prometheusPass = "voedger"
)

var (
	prometheusUpstreams = []string{
		"http://prometheus1:9090/prometheus",
		"http://prometheus2:9090/prometheus",
		"http://prometheus3:9090/prometheus",
	}
	prometheusIndex int32

	// Regex to match:
	// /api/<owner>/<package>/<id>/...
	// <owner> - group 1
	// <package> - group 2
	// <id> - group 3
	apiRegex = regexp.MustCompile(`^/api/([^/]+)/([^/]+)/(\d+)(.*)$`)
)

func main() {
	http.HandleFunc("/grafana/", grafanaProxy)
	http.HandleFunc("/prometheus/", prometheusProxy)
	http.HandleFunc("/api/", appProxy)
	http.HandleFunc("/", badRequestHandler)

	log.Println("Starting reverse proxy on port 82")
	if err := http.ListenAndServe(":82", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func grafanaProxy(w http.ResponseWriter, r *http.Request) {
	log.Printf("[GRAFANA] Incoming request: %s %s", r.Method, r.URL.String())
	target, _ := url.Parse("http://grafana:3000") // ensure no trailing slash
	proxy := httputil.NewSingleHostReverseProxy(target)

	originalPath := r.URL.Path
	proxy.Director = func(req *http.Request) {
		req.Header = r.Header.Clone() // forward headers
		req.Header.Set("X-Forwarded-Host", r.Host)
		req.Header.Set("X-Forwarded-Proto", "http")

		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		trimmedPath := strings.TrimPrefix(r.URL.Path, "/grafana")
		req.URL.Path = singleJoiningSlash(target.Path, trimmedPath)
		log.Printf("[GRAFANA] Rewriting path from %q to %q", originalPath, req.URL.Path)
	}

	proxy.ModifyResponse = func(res *http.Response) error {
		log.Printf("[GRAFANA] Received response with status: %d %s", res.StatusCode, res.Status)
		rewriteLocationHeader(res, "/grafana", target, "GRAFANA")
		return nil
	}

	proxy.ErrorHandler = func(resp http.ResponseWriter, req *http.Request, err error) {
		log.Printf("[GRAFANA] Error: %v (URL: %s)", err, req.URL)
		http.Error(resp, "Bad Gateway", http.StatusBadGateway)
	}

	proxy.ServeHTTP(w, r)
}

func prometheusProxy(w http.ResponseWriter, r *http.Request) {
	log.Printf("[PROMETHEUS] Incoming request: %s %s", r.Method, r.URL.String())
	var upstream string
	// Check availability of upstreams
	for i := 0; i < len(prometheusUpstreams); i++ {
		index := atomic.AddInt32(&prometheusIndex, 1) % int32(len(prometheusUpstreams))
		candidate := prometheusUpstreams[index]
		log.Printf("[PROMETHEUS] Checking availability: %s", candidate)
		if isUpstreamAvailable(candidate) {
			log.Printf("[PROMETHEUS] Using upstream: %s", candidate)
			upstream = candidate
			break
		}
		log.Printf("[PROMETHEUS] Upstream %s not available. Trying next.", candidate)
	}

	if upstream == "" {
		log.Printf("[PROMETHEUS] No available upstream!")
		http.Error(w, "Service Unavailable", http.StatusServiceUnavailable)
		return
	}

	target, _ := url.Parse(upstream)
	proxy := httputil.NewSingleHostReverseProxy(target)

	originalPath := r.URL.Path
	proxy.Director = func(req *http.Request) {
		req.Header = r.Header.Clone()
		req.Header.Set("X-Forwarded-Host", r.Host)
		req.Header.Set("X-Forwarded-Proto", "http")

		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		trimmedPath := strings.TrimPrefix(r.URL.Path, "/prometheus")
		req.URL.Path = singleJoiningSlash(target.Path, trimmedPath)
		log.Printf("[PROMETHEUS] Rewriting path from %q to %q", originalPath, req.URL.Path)
	}

	proxy.ModifyResponse = func(res *http.Response) error {
		log.Printf("[PROMETHEUS] Received response with status: %d %s", res.StatusCode, res.Status)
		rewriteLocationHeader(res, "/prometheus", target, "PROMETHEUS")
		return nil
	}

	proxy.ErrorHandler = func(resp http.ResponseWriter, req *http.Request, err error) {
		log.Printf("[PROMETHEUS] Error: %v (URL: %s)", err, req.URL)
		http.Error(resp, "Bad Gateway", http.StatusBadGateway)
	}

	proxy.ServeHTTP(w, r)
}

func appProxy(w http.ResponseWriter, r *http.Request) {
	log.Printf("[DYNAMIC-API] Incoming request: %s %s", r.Method, r.URL.Path)

	matches := apiRegex.FindStringSubmatch(r.URL.Path)
	if matches == nil {
		// Doesn't match the expected pattern
		log.Printf("[DYNAMIC-API] No match for regex on path: %s", r.URL.Path)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	owner := matches[1]
	pkg := matches[2]
	idStr := matches[3]
	rest := matches[4] // may start with "/"

	// Parse the id
	if _, err := strconv.ParseUint(idStr, 10, 64); err != nil {
		log.Printf("[DYNAMIC-API] Failed to parse id: %s (%v)", idStr, err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Hash-based distribution
	crcValue := crc32.ChecksumIEEE([]byte(idStr))
	index := crcValue % 6 // 0..5
	upstreamHost := "vvm" + strconv.Itoa(int(index+1))
	log.Printf("[DYNAMIC-API] Owner=%s, Package=%s, ID=%s -> Upstream=%s", owner, pkg, idStr, upstreamHost)

	targetURL := "http://" + upstreamHost + ":80" // Adjust port as needed
	target, err := url.Parse(targetURL)
	if err != nil {
		log.Printf("[DYNAMIC-API] Failed to parse target URL %s: %v", targetURL, err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	originalPath := r.URL.Path

	proxy.Director = func(req *http.Request) {
		req.Header = r.Header.Clone()
		req.Header.Set("X-Forwarded-Host", r.Host)
		req.Header.Set("X-Forwarded-Proto", "http")

		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host

		// Rewrite path to pass only the rest after the id
		newPath := rest
		// Ensure we handle the case where rest might not have a starting slash
		if !strings.HasPrefix(newPath, "/") && newPath != "" {
			newPath = "/" + newPath
		}

		// req.URL.Path = singleJoiningSlash(target.Path, newPath)
		// req.URL.Path = originalPath
		req.URL.Path = "/static/sys/monitor/site/hello"

		log.Printf("[DYNAMIC-API] Rewriting path from %q to %q", originalPath, req.URL.Path)
	}

	proxy.ModifyResponse = func(res *http.Response) error {
		log.Printf("[DYNAMIC-API] Received response with status: %d %s", res.StatusCode, res.Status)
		return nil
	}

	proxy.ErrorHandler = func(resp http.ResponseWriter, req *http.Request, err error) {
		log.Printf("[DYNAMIC-API] Error: %v (URL: %s)", err, req.URL)
		http.Error(resp, "Bad Gateway", http.StatusBadGateway)
	}

	proxy.ServeHTTP(w, r)
}

func badRequestHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("[DEFAULT] Bad request handler triggered for: %s %s", r.Method, r.URL)
	http.Error(w, "Bad Request", http.StatusBadRequest)
}

func isUpstreamAvailable(upstream string) bool {
	checkURL := upstream + "/-/healthy"
	log.Printf("[CHECK] Testing upstream: %s", checkURL)

	req, err := http.NewRequest("GET", checkURL, nil)
	if err != nil {
		log.Printf("[CHECK] Failed to create request for upstream check: %v", err)
		return false
	}

	// Set basic auth credentials
	req.SetBasicAuth(prometheusUser, prometheusPass)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[CHECK] Upstream %s unavailable: %v", upstream, err)
		return false
	}
	defer resp.Body.Close()

	io.Copy(io.Discard, resp.Body) // discard response body

	available := resp.StatusCode >= 200 && resp.StatusCode < 400
	log.Printf("[CHECK] Upstream %s status: %d (available: %t)", upstream, resp.StatusCode, available)
	return available
}

func singleJoiningSlash(a, b string) string {
	aslash := len(a) > 0 && a[len(a)-1] == '/'
	bslash := len(b) > 0 && b[0] == '/'
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	}
	return a + b
}

// rewriteLocationHeader modifies the Location header to ensure redirects
// include the prefix. It logs all changes for debugging.
func rewriteLocationHeader(res *http.Response, prefix string, target *url.URL, tag string) {
	loc := res.Header.Get("Location")
	if loc == "" {
		return
	}

	log.Printf("[%s] Original Location: %s", tag, loc)
	u, err := url.Parse(loc)
	if err != nil {
		log.Printf("[%s] Failed to parse Location header: %v", tag, err)
		return
	}

	// If redirect is relative or matches the upstream host
	if (u.Scheme == "" && u.Host == "") || (u.Scheme == target.Scheme && u.Host == target.Host) {
		if !strings.HasPrefix(u.Path, prefix) {
			oldPath := u.Path
			u.Path = prefix + u.Path
			log.Printf("[%s] Rewriting redirect path %q -> %q", tag, oldPath, u.Path)
		} else {
			log.Printf("[%s] Redirect already has prefix: %s", tag, u.Path)
		}
		res.Header.Set("Location", u.String())
		log.Printf("[%s] Final Location: %s", tag, u.String())
	} else {
		log.Printf("[%s] Location points elsewhere (no rewrite): %s", tag, u.String())
	}
}
