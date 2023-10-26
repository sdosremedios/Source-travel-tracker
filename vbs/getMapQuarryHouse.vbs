' fetch Google map
option explicit

const	adModeRead = 1
const	adModeWrite = 2
const	adModeReadWrite = 3
const	adSaveCreateNotExist = 1
const	adSaveCreateOverWrite = 2
const	adTypeBinary = 1
const	adTypeText = 2

const	FileAccess_Read = 1  '&H1
const	FileAccess_Write = 2  '&H2
const	FileAccess_ReadWrite = 3  '&H3

const	FileMode_CreateNew = 1  '&H1
const	FileMode_Create = 2  '&H2
const	FileMode_Open = 3  '&H3
const	FileMode_OpenOrCreate = 4  '&H4
const	FileMode_Truncate = 5  '&H5
const	FileMode_Append = 6  '&H6

dim oLocations	: set oLocations = new locationListObject

wscript.echo
wscript.echo "Map count = " & oLocations.count
dim i
for i = 0 to oLocations.count
	oLocations.saveMap(i)
next

'=====================================================================================
'
'	Class to fetch Google map based on location data and file name
'
class locationListObject
	dim oXMLhttp
	dim oFS
	dim oStream
	dim xmlDoc
	
	dim locationXML
	dim imageFolder
	dim baseURL
	dim mapList
	
	dim m_overwrite
	dim m_size
	dim m_zoom
	
	sub Class_Initialize()
		set oXMLhttp	= CreateObject("msxml2.xmlhttp")
		set oFS 		= createObject("scripting.filesystemObject")
		set oStream		= createObject("adodb.stream")
		set xmlDoc 		= CreateObject("Msxml.DOMDocument")
		
		imageFolder = "C:\Users\SdosRemedios\OneDrive\Pictures\maps\"
		baseURL = "maps.googleapis.com/maps/api/staticmap?sensor=false"
		locationXML = "http://www.fandango.from-ca.com/portals/2/xml/locations.xml"
		m_overwrite = true
		m_size = "640x640"
		m_zoom = 13
		
		xmlDoc.loadXML(httpGet(locationXML))
		'wscript.echo xmlDoc.outerXML
		set mapList = xmlDoc.selectNodes("//location")
	end sub
	
	sub Class_Terminate()
		set xmlDoc = nothing
		set oStream = nothing
		set mapList = nothing
		set oFS = nothing
		set oXMLhttp = nothing
	end sub
	
	public sub saveMap(n)
		if inRange(n) then
			if me.gps(n) = "" then
				wscript.echo "    No GPS: " & me.name(n)
				exit sub
			end if
			if oFS.fileExists(me.imageFile(n)) and not m_overwrite then
				wscript.echo "Map exists: " & me.name(n)
			else
				wscript.echo "Create map: " & me.name(n)
				me.saveImage me.googleUrl(n), imageFile(n)
			end if
		end if
	end sub
	
	public property get count
		count = mapList.length
	end property
	
	public property get name(n)
		if inRange(n) then
			name = mapValue(n,"name")
		else
			name=""
		end if
	end property
	
	public property get googleUrl(n)
		if inRange(n) then
			dim gps : gps = mapValue(n,"gps")
			googleUrl=baseURL & "&center=" & gps & "&markers=" & gps & "&size=" & m_size & "&zoom=" & m_zoom
		else
			googleUrl=""
		end if
	end property
	
	public property get imageFile(n)
		if inRange(n) then
			imageFile = imageFolder & "map-" & oFS.getBaseName(mapValue(n,"image")) & ".jpg"
		else
			imageFile = ""
		end if
	end property
	
	public property get gps(n)
		if inRange(n) then
			gps = mapValue(n,"gps")
		else
			gps=""
		end if
	end property
	
	public property Get overwrite
			overwrite = me.m_overwrite
	end property
	
	public property Let overwrite(n)
			m_overwrite = n
	end property
	
	public property Let size(n)
			m_size = n
	end property
	
	public property Get size
			size = me.m_size
	end property
	
	public property Let zoom(n)
			m_zoom = n
	end property
	
	public property Get zoom
			zoom = me.m_zoom
	end property
	
	private function inRange(n)
		inRange = ((n < me.count) and (n >= 0))
	end function
	
	private function mapValue(n,attrName)
		mapValue = mapList(n).getAttribute(attrName)
	end function
	
	private function httpGet(URL)
		oXMLhttp.Open "GET", URL, False 
		oXMLhttp.Send
		If (Err.Number <> 0) or (oXMLhttp.Status <> "200") Then 
			httpGet = "HTTP Error: " & err.number
		else
			httpGet = oXMLhttp.responseText
		end if 
	end function
	
	sub saveImage(URL, fileName)
		oXMLhttp.open "GET", "http://" & URL, false
		oXMLhttp.send
		If (Err.Number <> 0) or (oXMLhttp.Status <> "200") Then 
			wscript.echo "Resource unavailable for varied reasons. Operation aborted. " & oXMLhttp.Status
		end if
		
		with oStream
			.mode = 3
			.type = 1
			.open
			.write oXMLhttp.responseBody
			.saveToFile fileName, adSaveCreateOverWrite
			.close
		end with

		if err.number<>0 then
			wscript.echo "You need ado2.5 up. Operation aborted. " & err.number & " " & err.description
		end if
	end sub
	
end class
