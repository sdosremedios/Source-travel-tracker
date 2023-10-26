option explicit

const Chicago	= "6147706215218826737"
const BronxZoo	= "5892898225257301841"

dim picasa : set picasa = new picasaObject
		
'picasa.loadAlbums picasa.userID
picasa.loadPhotos picasa.userID, BronxZoo
picasa.listPhotos

class picasaObject
	public	Albums,		Photos,		userID
	private	albumsURL,	photosURL
	private	xmlDoc,		xmlAlbums,	xmlPhotos
	
	private sub class_initialize
		albumsURL		= "https://picasaweb.google.com/data/feed/api/user/{user}"
		photosURL 		= "https://picasaweb.google.com/data/feed/api/user/{user}/albumid/{album}"
		userID			= "117117820065448002124"
		set Albums		= createObject("scripting.Dictionary")
		set Photos		= createObject("scripting.Dictionary")
'		set xmlDoc		= CreateObject("MSXML2.DomDocument")
		set xmlDoc		= CreateObject("Microsoft.XMLDOM")
		set xmlAlbums	= CreateObject("Microsoft.XMLDOM")
		set xmlPhotos	= CreateObject("Microsoft.XMLDOM")
		xmlDoc.async	= false
	end sub
	
	private sub class_terminate
		set xmlPhotos	= nothing
		set xmlAlbums	= nothing
		set xmlDoc		= nothing
		set Photos		= nothing
		set Albums		= nothing
	end sub
	
	public sub loadAlbums(uID)
		dim node, i, album, title
		xmlDoc.load replace(albumsURL,"{user}",user)
		set xmlAlbums = xmlDoc.selectNodes("//entry")
		for each node in xmlAlbums
			set title = node.selectSingleNode("title")
			set album = node.selectSingleNode("gphoto:id")
			Albums.add album.text, title.text
		next
	end sub
	
	public sub loadPhotos(uID, aID)
		dim node, photo, title
		xmlDoc.load replace(replace(photosURL,"{user}",uID),"{album}",aID)
		set xmlPhotos = xmlDoc.selectNodes("//entry")
		for each node in xmlPhotos
			set title = node.selectSingleNode("title")
			set photo = node.selectSingleNode("content")
			Photos.add photo.getAttribute("src"), title.text
		next
	end sub
	
	public sub listAlbums()
		dim key
		for each key in list
			wscript.echo key & " " & Albums.item(key)
		next
	end sub
	
	public sub listPhotos()
		dim key
		for each key in Photos.keys
			wscript.echo Photos.item(key) & " " & key
		next
	end sub
	
end class
