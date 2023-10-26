' Portfolio - retrieve photo data from flickr sets and generate database file

option explicit
const apiKey = "772c5fca6645ee984791fa46957a67c0"
const csvFilename = "data\portfolio.csv"

dim photos: set photos = createObject("Scripting.Dictionary")
dim fs: set fs = CreateObject("Scripting.FileSystemObject")
dim flickr: set flickr = new flickrGalleryObject

flickr.loadCollection "72157625198512858"	'wiredEye
dim node: set node = flickr.photoCollection.selectSingleNode("//collection").cloneNode(true)
dim flickrSets: set flickrSets = node.childNodes
wscript.echo "Count = " & flickrSets.length

dim flickrSet
for each flickrSet in flickrSets
	wscript.echo "Set " & flickrSet.getAttribute("title")
	flickr.loadSet flickrSet.getAttribute("id")
	set node = flickr.photoSet.selectSingleNode("//photoset").cloneNode(true)
	dim photoSet: set photoSet = node.childNodes
	dim p
	for each p in photoSet
		dim id: id = p.getAttribute("id")
		if not photos.exists(id) then
			flickr.loadPhoto id
			set node = flickr.photoInfo.selectSingleNode("//description")
			dim img: set img = new imageObject
			img.id = id
			img.title = encode(p.getAttribute("title"))
			img.description = encode(node.text)
			img.aspect = flickr.size
			photos.add id, img
			wscript.echo "  photo " & img.title
		end if
	next
next

dim t: set t = fs.openTextFile(csvFilename,2,true,0)
for each p in photos.keys
	t.writeLine """" & photos.Item(p).id & """,""" & replace(photos.Item(p).title,"""","""""") & """,""" & replace(photos.Item(p).description,"""","""""") & """,""" & photos.Item(p).aspect & """" 
next
t.close
set t = nothing

class imageObject
	Public m_ID
	Public m_Title
	Public m_Description
	Public m_Aspect
	
	sub Class_Initialize
		m_ID = ""
		m_Title = ""
		m_Description = ""
		m_Aspect = ""
	end sub
	
	public sub initialize(aID, aTitle)
		m_Title = aTitle
		m_ID = aID
	end sub
	
	public property get id
		id = m_ID
	end property
	
	public property let id(value)
		m_ID = value
	end property
	
	public property get title
		title = m_Title
	end property
	
	public property let title(value)
		m_Title = value
	end property
	
	public property get description
		description = m_description
	end property
	
	public property let description(value)
		m_description = value
	end property
	
	public property get aspect
		aspect = m_aspect
	end property
	
	public property let aspect(value)
		m_aspect = value
	end property
end class

Class flickrGalleryObject

	Dim API_KEY
	Dim API_SECRET
	Dim API_USER
	Dim COLLECTION_ID

	Dim COLLECTION_URL
	Dim SET_URL
	Dim PHOTO_URL 
	Dim SIZES_URL
	Private URL

	Public photoCollection 'As XmlDocument = New XmlDocument
	Public photoSet 'As XmlDocument = New XmlDocument
	Public photoSize 'As XmlDocument = New XmlDocument
	Public photoInfo 'As XmlDocument = New XmlDocument
	Public photoTags 'As string
	Public Size 'As string

	Dim Status 

	sub Class_Initialize()

		API_KEY = "86d91ec55710b0881239fffa542e6e42"
		API_SECRET = "b5fa117d3b660eed"
		API_USER = "88827093@N00"
		COLLECTION_ID = "72157625198512858"	'wiredEye

		COLLECTION_URL = "http://api.flickr.com/services/rest/?method=flickr.collections.getTree&api_key={0}&user_id={1}&collection_id={2}"
		SET_URL = "http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key={0}&photoset_id={1}"
		PHOTO_URL = "http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key={0}&photo_id={1}"
		SIZES_URL = "http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key={0}&photo_id={1}"

		photoTags = ""
		Size = ""
	end sub

	public property get collectionXML(CollectionID)
		me.loadCollection CollectionID
		collectionXML = me.photoCollection.xml
	end property

	public property get setXML()
		setXML = me.photoSet.xml
	end property

	public property get photoURL(photoID, Size)
		set me.photoSize = CreateObject("Msxml.DOMDocument")

		'get the collection tree
		URL = replace(SIZES_URL,"{0}",API_KEY)
		URL = replace(URL,"{1}",photoID)
		me.photoSize.LoadXml(httpGet(URL))

		dim nodes, node
		set nodes = me.photoSize.selectNodes("//size")
		for each node in nodes
			if lcase(node.getAttribute("label")) = lcase(Size) then
				photoURL = node.getAttribute("source")
				exit Property
			end if
		next
		photoURL = ""
	end property
	
	public property get photoXML(photoID)
		me.loadPhoto photoID
		photoXML = me.photoInfo.xml
	end property

	public sub loadCollection(CollectionID)
		set me.photoCollection = CreateObject("Msxml.DOMDocument")

		'get the collection tree
		URL = replace(COLLECTION_URL,"{0}",API_KEY)
		URL = replace(URL,"{1}",API_USER)
		URL = replace(URL,"{2}",CollectionID)
		me.photoCollection.LoadXml(httpGet(URL))
	end sub

	public sub loadSet(setID)
		set me.photoSet = CreateObject("Msxml.DOMDocument")

		'get the collection tree
		URL = replace(SET_URL,"{0}",API_KEY)
		URL = replace(URL,"{1}",setID)
		me.photoSet.LoadXml(httpGet(URL))
	end sub

	public sub loadPhoto(photoID)
		set me.photoInfo = nothing
		set me.photoInfo = CreateObject("Msxml.DOMDocument")

		'get the collection tree
		URL = replace(PHOTO_URL,"{0}",API_KEY)
		URL = replace(URL,"{1}",photoID)
		me.photoInfo.LoadXml(httpGet(URL))
		photoTags = ""
		Size = ""
		dim tTags, tTag, t
		set tTags = me.photoInfo.selectSingleNode("//tags").childNodes

		for each tTag in tTags
			if me.photoTags <> "" then	me.photoTags = me.photoTags & ","
			me.photoTags = me.photoTags & tTag.getAttribute("raw")
		next

		for each t in split(me.photoTags,",")
			if left(t,5) = "size:" then
				me.Size = mid(t,6)
				exit for
			end if
		next

		set tTags = nothing
		set tTag = nothing
	end sub

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

	sub Class_Terminate()
		set photoCollection = nothing
		set photoSet = nothing
		set photoSize = nothing
		set photoInfo = nothing
	end sub

End Class

function encode(text)
	dim t, x
	x = split(text,"<")	'remove any html
	if ubound(x) > 0 then
		t = x(0)
	else
		t = text
	end if
	t = replace(t,"& ","&#38; ")
	t = replace(t,"©","&#169;")
	t = replace(t,"°","&#176;")
	t = replace(t,"&deg;","&#176;")
	t = replace(t,chr(10),"\n")
	t = replace(t,chr(13),"\r")
	t = replace(t,chr(9),"\t")
	encode = t
end function

function wrap (text, width)
	dim s, e, output
	s = 1
	do
		if Len(text)-s+1 <= width then
			output = output & mid(text,s)
			exit do
		end if
		e = InstrRev(mid(text,s,width)," ")
		if e < 1 then e = width
		output = output & mid(text,s,e) & "\n"
		s = s+e
		if s >= len(text) then exit do
	loop
	wrap = output
end function

