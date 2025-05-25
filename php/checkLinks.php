<?php

class AdvancedWebCrawler {
    private $baseUrl;
    private $visitedUrls = [];
    private $brokenLinks = [];
    private $brokenImages = [];
    private $brokenVideos = [];
    private $brokenAudios = [];
    private $maxDepth = 3;

    public function __construct($url, $depth = 3) {
        $this->baseUrl = rtrim($url, '/');
        $this->maxDepth = $depth;
    }

    private function getStatusCode($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $httpCode;
    }

    private function getElements($html, $tag, $attribute) {
        $elements = [];
        $dom = new DOMDocument;
        @$dom->loadHTML($html);

        foreach ($dom->getElementsByTagName($tag) as $element) {
            $attrValue = $element->getAttribute($attribute);
            if (!empty($attrValue) && strpos($attrValue, 'data:') === false) {
                $elements[] = $attrValue;
            }
        }

        return array_unique($elements);
    }

    private function getHTML($url) {
        $ch = curl_init($url);  // Set the target URL

        // Configure cURL options
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL verification (if needed)
        // curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Follow redirects
        
        $html = curl_exec($ch); // Execute cURL
        curl_close($ch); // Close the cURL session

        // echo "Fetched HTML: $html\n";
        if ($html === false) {
            return null;
        }
        return $html;
    }

    private function getCSSBackgroundImages($html) {
        preg_match_all('/background-image:\s*url\((\'|")?(.*?)\1?\)/', $html, $matches);
        return array_unique($matches[2]);
    }

    private function normalizeUrl($url) {
        if (strpos($url, 'http') === false) {
            return $this->baseUrl . '/' . ltrim($url, '/');}
        else {
                $parsed = parse_url($url);
                $protocol = $parsed['scheme'];  // Extracts "https"
                $host = $parsed['host'];        // Extracts "example.com"
                $path = $parsed['path'];        // Extracts "/path/to/resource"
                $base = $protocol . '://' . $host;
                if(!array_key_exists($base, $this->visitedUrls)) {
                    $this->baseUrl = $base; // Updates base URL);
                }
            return $url; // Return the full URL as is
        }
    }

    private function checkPage($url, $depth) {
//      if ($depth > $this->maxDepth || isset($this->visitedUrls[$url])) {
        if ($depth > $this->maxDepth || array_key_exists($url, $this->visitedUrls)) {
                return;
        }

        echo "Checking: $url\n";

        $this->visitedUrls[$url] = true;
        // $html = @file_get_contents($url);
        $html = $this->getHTML($url);
        // echo "Fetched: $html\n";

        if ($html === false) {
            $this->brokenLinks[$url] = 'Failed to fetch content';
            return;
        }

        // Check links
        foreach ($this->getElements($html, 'a', 'href') as $link) {
            
            $fullUrl = $this->normalizeUrl($link);
            $statusCode = $this->getStatusCode($fullUrl);
            echo "Link: $fullUrl - Status: $statusCode\n";

            if ($statusCode >= 400) {
                $this->brokenLinks[$fullUrl] = "HTTP $statusCode";
            } else {
                $this->checkPage($fullUrl, $depth + 1);
            }
        }

        // Check images
        foreach ($this->getElements($html, 'img', 'src') as $imgSrc) {
            $fullUrl = $this->normalizeUrl($imgSrc);
            $statusCode = $this->getStatusCode($fullUrl);

            if ($statusCode >= 400) {
                $this->brokenImages[$fullUrl] = "HTTP $statusCode";
            }
        }

        // Check CSS background images
        foreach ($this->getCSSBackgroundImages($html) as $bgImgSrc) {
            $fullUrl = $this->normalizeUrl($bgImgSrc);
            $statusCode = $this->getStatusCode($fullUrl);

            if ($statusCode >= 400) {
                $this->brokenImages[$fullUrl] = "HTTP $statusCode (CSS)";
            }
        }

        // Check videos
        foreach ($this->getElements($html, 'video', 'src') as $videoSrc) {
            $fullUrl = $this->normalizeUrl($videoSrc);
            $statusCode = $this->getStatusCode($fullUrl);

            if ($statusCode >= 400) {
                $this->brokenVideos[$fullUrl] = "HTTP $statusCode";
            }
        }

        // Check embedded videos (iframe)
        foreach ($this->getElements($html, 'iframe', 'src') as $iframeSrc) {
            $fullUrl = $this->normalizeUrl($iframeSrc);
            $statusCode = $this->getStatusCode($fullUrl);

            if ($statusCode >= 400) {
                $this->brokenVideos[$fullUrl] = "HTTP $statusCode (iframe)";
            }
        }

        // Check audio sources
        foreach ($this->getElements($html, 'audio', 'src') as $audioSrc) {
            $fullUrl = $this->normalizeUrl($audioSrc);
            $statusCode = $this->getStatusCode($fullUrl);

            if ($statusCode >= 400) {
                $this->brokenAudios[$fullUrl] = "HTTP $statusCode";
            }
        }
    }

    public function run() {
        $this->checkPage($this->baseUrl, 0);

        echo "\nBroken Links Report:\n";
        foreach ($this->brokenLinks as $link => $status) {
            echo "$link - Status: $status\n";
        }
/*
        echo "\nBroken Image Sources Report:\n";
        foreach ($this->brokenImages as $img => $status) {
            echo "$img - Status: $status\n";
        }

        echo "\nBroken Video Sources Report:\n";
        foreach ($this->brokenVideos as $vid => $status) {
            echo "$vid - Status: $status\n";
        }

        echo "\nBroken Audio Sources Report:\n";
        foreach ($this->brokenAudios as $aud => $status) {
            echo "$aud - Status: $status\n";
        }
*/
        echo "\nLinks Checked Report:\n";
        foreach ($this->visitedUrls as $key => $value) {
            echo "URL: $key\n";
        }        
    }
}

// Example Usage
$website = 'https://meetthere.com/'; // Replace with your target website
$crawler = new AdvancedWebCrawler($website, 2);
$crawler->run();

?>