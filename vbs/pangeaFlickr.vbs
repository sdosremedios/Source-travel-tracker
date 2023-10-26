option explicit

dim xmlPath, xslPath, xslDoc, pangeaPath, pangeaSet, flickr, fs, f

xmlPath = "..\images\pangea\pangea.xml"
xslPath = "..\xml\pangeaFlickr.xsl"
pangeaPath = "..\images\pangea\"
pangeaSet = "72157614618392678"

set fs = createObject("scripting.filesystemobject")

set flickr = new flickrObject
flickr.loadSet pangeaSet

set xslDoc = createObject("MSXML2.DomDocument")
xslDoc.Load(xslPath)

set f = fs.OpenTextFile(xmlPath,2,0)
f.writeLine flickr.photos.transformNode(xslDoc)
f.close

class flickrObject
	
	public	vars, _
			xmlDoc, _
			photos, _
			root

	private sub Class_Initialize
		set xmlDoc = createObject("MSXML2.DomDocument")
		set photos = createObject("MSXML2.DomDocument")
		set vars = createObject("Scripting.Dictionary")
		with vars
			.Add "flickrUrl", "http://api.flickr.com/services/rest/?method=flickr.photos.search"
			.Add "api_key", "&api_key=772c5fca6645ee984791fa46957a67c0"
			.Add "sort", "&sort=relevance"
			.Add "per_page","&per_page=100"
			.Add "search", ""
		end with
		set root = photos.AppendChild(photos.CreateElement("photos"))
		root.setAttribute "description","Steven dosRemedios' Panoramas!"
	end sub
	
	private sub Class_Terminate
		set photos = nothing
		set xmlDoc = nothing
		set vars = nothing
		set root = nothing
	end sub
	
	public sub loadSet(setID)
		vars("flickrUrl") = "http://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos"
		vars("search") = "&photoset_id=" & setID
		loadPhotos()
	end sub
	
	'populate photos dictionary with interesting photos
	public sub loadInterestingPhotos(aSearch)
		vars("flickrUrl") = "http://api.flickr.com/services/rest/?method=flickr.photos.search"
		vars("sort") = "&sort=interestingness-desc"
		vars("search") = "&text=%22" & aSearch & "%22"
		loadPhotos()
	end sub
	
	'populate photos dictionary with recent photos
	public sub loadRecentPhotos(aSearch)
		vars("flickrUrl") = "http://api.flickr.com/services/rest/?method=flickr.photos.search"
		vars("sort") = "&sort=date-posted-desc"
		vars("search") = "&text=%22" & aSearch & "%22"
		loadPhotos()
	end sub

	'populate the photos dictionary with photoObjects 
	public sub loadPhotos()
		dim xmlPhotos, i, p
		getXML 
		set xmlPhotos = xmlDoc.getElementsByTagName("photo")
		for i = 0 to xmlPhotos.length-1
			getInfo(xmlPhotos(i))
		next
	end sub
	
	'get a random image from photos dictionary
	public function randomImg(cssClass, size)
		dim p
		p = photos.Items
		i = CInt(second(now) * (UBound(p) / 60))
		'response.write "i=" & i & "<br/>"
		randomImg = p(i).link(cssClass, size)
	end function
	
	'load xmlDoc with flickr xml response
	public sub getXML()
	    xmlDoc.loadXML(httpGet(searchUrl))
	end sub
	
	'generate a flickr search url
	public function searchUrl()
		dim t
		t = vars("flickrUrl")
		t = t & vars("api_key")
		t = t & vars("sort")
		t = t & vars("per_page")
		t = t & vars("search")
		searchUrl = t
	end function

	'request flickr data
	public function httpGet(URL)
		dim web
	    set web = CreateObject("MSXML2.ServerXMLHTTP") 
	    web.Open "GET", URL, False 
	    web.Send
	    If (Err.Number <> 0) or (web.Status <> "200") Then 
	    	httpGet = "HTTP Error: " & err.number
	    else
		    httpGet = web.responseText
	    end If 
	    set web = Nothing
	end function
	
	public function getInfo(byval photoElement)
		dim reqURL, msXML, sResponse, results, p, i
		reqURL =  "http://www.flickr.com/services/rest/?method=flickr.photos.getInfo" _
			& "&api_key=" & vars("api_key") _
			& "&photo_id=" & photoElement.getAttribute("id") _
			& "&secret=" & photoElement.getAttribute("secret")
		'wscript.echo reqURL
		set msXML = CreateObject("MSXML2.DOMDocument")
		msXML.async = false
		sResponse = msXML.Load(reqURL)
		if msXML.parseError.errorCode <> 0 then _
			Wscript.Echo("Error! " & msXML.parseError.reason)
		set p = msXML.getElementsByTagName("photo")
		'photoElement.AppendChild(p(0))
		photos.DocumentElement.AppendChild(p(0))
	end function
end class
