<?php 

$website_to_crawl= "https://travelshot.photography";

// Create an array called all_links. It will store all the links that our crawler finds.
$all_links= array();

// Get the links from each page that the website crawl
function get_links($url)
{
	global $all_links;
	// $contents gets the contents of each page (each link) that the crawler finds
	$contents= @file_get_contents($url);
	$regexp= "<a\s[^>]*href=(\"??)([^\" >]*?)\\1[^>]*>(.*)<\/a>";
	preg_match_all("/$regexp/siU", $contents, $matches);

	// $path_of_url parse the URL to give us the path to the page on the website
	$path_of_url= parse_url($url, PHP_URL_HOST);
	
	if (strpos($website_to_crawl, "https://") == true)
	{
		$type= "https://";
	}
	else
	{
		$type= "http://";
	}
	
	// $links_in_array stores all the hyperlinks stored in the matches array
	$links_in_array= $matches[2];
	
	foreach ($links_in_array as $link)
	
	{
		// If a hyperlink contains a hashtag, we don't want to have the link with the hashtag
		if (strpos($link, "#") !== false)
		{
			// Remove the hashtag portion
			$link= substr($link,0, strpos($link, "#"));
		}
		
		// Remove any leading "."
		if (substr($link, 0, 1) == ".")
		{
			$link= substr($link,1);
		}
		
		// Allow http and https links
		if (substr($link, 0, 7) == "http://") {
			$link= $link;
		}
		else if (substr($link, 0, 8) == "https://") {
			$link= $link;
		} // Remove leading "//"
		else if (substr($link, 0, 2) == "//") {
			$link= substr($link,2);
		} // Leading "#" means we have an anchor
		else if (substr($link, 0, 1) == "#") {
			$link= $url;
		} // Mark any "mailto:" links for later
		else if (substr($link, 0, 7) == "mailto:") {
			$link= "[" . $link . "]";
		} // Root urls need the path prepended
		else if (substr($link, 0, 1) != "/") {
			$link= "$type" .$path_of_url. "/" . $link;
		}
		else 
		{
			$link= "$type" .$path_of_url.$link;
		}
		
		// Add the link to all_links if it's new
		if (!in_array($link,$all_links))
		{
			array_push($all_links, $link);
		}
	}//ends foreach 
	
}//ends function get_links

// A function to verify a live link
function urlExists($url) {
	$headers = @get_headers($url);
	  
	// Use condition to check the existence of URL
	if($headers && strpos( $headers[0], '200')) {
		return true;
	}
	else {
		return false;
	}
};

// Call get_links with the root url
get_links($website_to_crawl);

// Now scan all the links
foreach ($all_links as $currentlink)
{
	get_links($currentlink);
}

/*
foreach ($all_links as $currentlink)
{
	get_links($currentlink);
}
*/

foreach ($all_links as $currentlink)
{
	$live = urlExists($currentlink) ? "live:   " : "broken: "; 
	echo $live . $currentlink . "<br>";
	$linkscount[] += $currentlink;
}

$count= count($linkscount);
echo "<br><br>There are $count links found by the crawler";
?>