' panohead.vbs - 30 May 2016 - Steven dosRemedios
'
' 1) scan media folder and retrieve userdata from GardenGnome packages and store in .csv and .xml files
'
' 2) optionally generate terrain/satellite map pairs (set doMap = true)
'
' 3) generate html snippets to display maps
'
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

'const 	rootDir 	= "D:\SdosRemedios\Transporter\Transporter Library\Shared-Images\Panoramas\Round.Me\joomla"
'const 	dataDir 	= "D:\SdosRemedios\Transporter\Websites\panohead.net\docs\data\"

dim		ph			: set ph 	= new panoheadObject

if false then
	dim map : set map = new mapObject
	map.doMap = false
	map.loadLocationXML(ph.xml.xml)
	map.saveAll 10, "terrain"
	map.saveAll 17, "satellite"
end if

class panoheadObject
	public fs
	public xml
	public pano
	public csv
	private xmlFile, csvFile, rootDir, dataDir

	private sub class_initialize()
		set fs 		= createObject("scripting.filesystemObject")
		set xml		= createObject("MSXML2.DomDocument") : xml.appendChild(xml.createElement("panoHead"))
		set pano 	= createObject("MSXML2.DomDocument")
		rootDir 	= "D:\SdosRemedios\Transporter\Transporter Library\Shared-Images\Panoramas\Round.Me\joomla"
		dataDir 	= "D:\SdosRemedios\Transporter\Websites\panohead.net\docs\data\"
		csv			= ""
		csvFile		= dataDir & "panoHead.csv"
		xmlFile		= dataDir & "panoHead.xml"
		
		dim f : for each f in fs.getFolder(rootDir).subFolders
			if right(f.name,6) = ".ggpkg" then
				dim n : n = f.path & "\pano.xml"
				if fs.fileExists(n) then
					pano.load n
					dim list : set list = pano.selectNodes("//tour/panorama/userdata")
					if list.length > 0 then
						dim p
						for each p in list
							xml.documentElement.appendChild(p)
							buildCSV f.name, p
						next
					end if
					set list = nothing
				end if
			end if
		next
		fs.createTextFile(xmlFile, true).writeLine xml.xml
		fs.createTextFile(csvFile, true).write csv
	end sub
	
	private sub class_terminate()
		set pano 	= nothing
		set xml 	= nothing
		set fs		= nothing
	end sub
	
	private sub buildCSV(folder, userdata)
		with userdata
			csv = csv _
				& quote(folder) & "," _
				& quote(.getAttribute("title")) & "," _
				& quote(.getAttribute("description")) & "," _
				& .getAttribute("latitude")  & "," _
				& .getAttribute("longitude") & "," _ 
				& quote(.getAttribute("datetime")) _
				& vbCrlf
		end with
	end sub
	
	private function quote(text)
		quote = chr(34) & text & chr(34)
	end function

end class

class mapObject
	private	XMLhttp, fs, ts
	private imgFolder, baseURL, imgHTML, dataDir, snippets
	private m_overwrite, m_size
	public	mapList, xmlDoc, doMap
	
	private sub class_initialize()
		set XMLhttp	= CreateObject("msxml2.xmlhttp")
		set fs 		= createObject("scripting.filesystemObject")
		set ts		= createObject("adodb.stream")
		set xmlDoc 	= CreateObject("Msxml.DOMDocument")
		set mapList = nothing
		imgFolder	= "D:\SdosRemedios\Transporter\Websites\panohead.net\docs\images\maps\"
		dataDir		= "D:\SdosRemedios\Transporter\Websites\panohead.net\docs\data\"
		baseURL 	= "maps.googleapis.com/maps/api/staticmap?sensor=false"
		imgHTML		= "<p style=""display:inline-block; font-size: 12px"">" & vbCrLf & "<a class=""highslide"" href=""docs/images/maps/[1]-[2].png"" title=""Click to enlarge"">" _
			& vbCrLf & "<img src=""docs/images/maps/[1]-[2].png"" alt=""[1]"" style=""width: 200px"" />" & vbCrLf _
			& "</a><br />[3]</p>" & vbCrLf
		m_overwrite = true
		m_size = "800x800"
		snippets = ""
		doMap = true
	end sub
	
	private sub class_terminate()
		set mapList = nothing
		set xmlDoc	= nothing
		set ts		= nothing
		set	fs		= nothing
		set XMLhttp	= nothing
	end sub
	
	public sub loadLocationFile(xmlFile)
		xmlDoc.load xmlFile
		set mapList = xmlDoc.selectNodes("//userdata")
	end sub
	
	public sub loadLocationXML(xmlText)
		xmlDoc.loadXML xmlText
		set mapList = xmlDoc.selectNodes("//userdata")
	end sub
	
	public sub saveAll(zoom, mapType)
		dim i, url
		dim markers : markers = ""
		saveMap 0, zoom, mapType 
		markers = maplist(0).getAttribute("latitude") & ", " & maplist(0).getAttribute("longitude")
		for i = 1 to mapList.length - 1
			saveMap i, zoom, mapType
			markers = markers & "|" & mapList(i).getAttribute("latitude") & ", " _
				& mapList(i).getAttribute("longitude")
		next
		' build overview map url
		url = baseURL & "&center=0,0&markers=" & markers & "&size=640x320" _
			& "&zoom=1&maptype=" & mapType
		saveImage url, imageFile("panohead", mapType)
		fs.createTextFile(dataDir & "snippets.html", true).write snippets 
	end sub
	
	public sub saveMap(n, zoom, mapType)
		dim userdata, title, desc, gps
		if n < mapList.length and n >= 0 then
			set userdata = mapList(n)
			with userdata
				title 	= .getAttribute("title")
				desc	= .getAttribute("description")
				gps		= .getAttribute("latitude") & ", " & .getAttribute("longitude")
			end with
			if doMap then _
				saveImage googleUrl(n, gps, zoom, mapType), imageFile(fileName(title, desc), mapType)
			buildHTML title, desc, mapType
		end if
	end sub
	
	public property get googleUrl(n, gps, zoom, mapType)
		googleUrl = baseURL & "&center=" & gps & "&markers=" & gps _
			& "&size=" & m_size & "&zoom=" & zoom & "&maptype=" & mapType
	end property
	
	private function mapValue(n,attrName)
		mapValue = mapList(n).getAttribute(attrName)
	end function
	
	private function imageFile(name, mapType)
		imageFile = imgFolder & name & "-" & mapType & ".png"
	end function
	
	private function fileName(title, desc)
		fileName = title & ", " & desc
	end function
	
	private sub saveImage(URL, fileName)
		XMLhttp.open "GET", "http://" & URL, false
		XMLhttp.send
		If (Err.Number <> 0) or (XMLhttp.Status <> "200") Then 
			wscript.echo "Resource unavailable for varied reasons. Operation aborted. " & XMLhttp.Status
		end if
		
		with ts
			.mode = adModeReadWrite
			.type = adTypeBinary
			.open
			.write XMLhttp.responseBody
			.saveToFile fileName, adSaveCreateOverWrite
			.close
		end with

		if err.number<>0 then
			wscript.echo "You need ado2.5 up. Operation aborted. " & err.number & " " & err.description
		end if
	end sub
	
	private sub buildHTML(title, desc, mapType)
		dim html : html = replace(imgHTML,"[1]", fileName(title, desc))
		html = replace(html,"[2]",mapType)
		html = replace(html,"[3]", title & "<br />" & desc)
		snippets = snippets & html & vbCrLf
	end sub
	
end class
