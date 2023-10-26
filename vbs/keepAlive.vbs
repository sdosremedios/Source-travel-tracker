'	keepAlive.vbs - read a page from a website to keep it loaded in memory
'
'
	option explicit
	
	const logFilename = "c:\bin\log\keepAlive.log"
	const xmlFilename = "c:\bin\xml\dnnSites.xml"
	
	const ForReading = 1, ForWriting = 2, ForAppending = 8
	
	dim s : set s = new serversObject
	s.Log "** Starting " & Date()
	do
		s.query
		'wscript.sleep 10000
		wscript.sleep s.seconds * 1000
		s.Load
	loop
	'set s = nothing

class serversObject
	dim stdErr
	dim xmlDoc
	dim delay
	public servers
	
	sub Class_Initialize()
		set stdErr = createObject("Scripting.FileSystemObject").openTextFile(logFilename, ForWriting, true)
		set xmlDoc = CreateObject("Msxml.DOMDocument")
		me.Load
		delay = xmlDoc.documentElement.getAttribute("seconds")
	end sub
	
	sub Class_Terminate()
		s.Log "** Ending " & Date()
		stdErr.close
		set stdErr = nothing
		set servers = nothing
		set xmlDoc = nothing
	end sub
	
	public sub Load()
		dim server
		xmlDoc.Load(xmlFilename)
		set servers = xmlDoc.selectNodes("//site")
		exit sub
		me.Log "Monitoring " & servers.length & " sites."
		for each server in servers
			me.Log server.getAttribute("name") & chr(9) & server.getAttribute("url")
		next
	end sub
	
	public sub query()
		dim i
		for i = 0 to servers.length-1
			if httpGet(servers(i).getAttribute("url")) then
				me.Log me.name(i) & " OK"
			else
				me.Log me.name(i) & " error = " & err.number
			end if
		next
		me.Log ""
	end sub
	
	public sub Log(text)
		if text <> "" then
			stdErr.writeLine time() & chr(9) & text
		else
			stdErr.writeLine
		end if
	end sub
	
	property get count()
		count = servers.length
	end property
	
	property get seconds()
		seconds = me.delay
	end property
	
	property get name(n)
		name = servers(n).getAttribute("name")
	end property
	
	property get url(n)
		url = servers(n).getAttribute("url")
	end property

	function httpGet(URL)
		on error resume next
		dim web : set web = CreateObject("MSXML2.ServerXMLHTTP") 
		web.Open "GET", URL, False 
		web.Send
		If (Err.Number <> 0) or (web.Status <> "200") Then 
			httpGet = false
		else
			httpGet = true
		end If 
		set web = Nothing
		on error goto 0
	end function
end class
	