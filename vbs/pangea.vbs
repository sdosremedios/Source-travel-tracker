option explicit
dim fs, folder, xslDoc, xmlText, xmlDoc, pangea
set fs = createObject("scripting.filesystemobject")
set folder = fs.getFolder("F:\Inetpub\wwwroot\wiredEye\xml")
set xslDoc = createObject("MSXML.DOMDOCUMENT")
xslDoc.Load("C:\bin\pangea.xsl")
xmlText = "<portfolio><header>Steven dosRemedios Panoramas</header>"
for each name in folder.files
	if name.type = "XML Document" then
		if mid(name.name,2,1) = "t" then
			wscript.echo name.path
			set xmlDoc = createObject("MSXML.DOMDOCUMENT")
			xmlDoc.Load(name.path)
			set pangea = createObject("MSXML.DOMDOCUMENT")
			pangea.LoadXML xmlDoc.transformNode(xslDoc)
			set nodes = pangea.getElementsByTagName("panorama")
			for each node in nodes
				xmlText = xmlText & node.XML
			next
			set xmlDoc = nothing
			set pangea = nothing
		end if
	end if
next
xmlText = xmlText & "</portfolio>"
wscript.echo xmlText
