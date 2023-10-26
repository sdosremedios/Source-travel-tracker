option explicit
' airNow	29 Sep 2020
'
' Query AirNow.gov for PM2.5 air quality 
'

const rootDir	= "D:\SdosRemedios\Documents\Source\vbs\"
'==============================================================================
'	application
'==============================================================================
dim lib			: set lib		= new vbsLib
dim airNow	    : set airNow	= new airNowObject
'dim xmlDoc     : set xmlDoc    = airNow.fetchData
wscript.echo airNow.dataText

'==============================================================================
'	class definition
'==============================================================================
class airNowObject
	public args
    private urlParams
    public  xmlDoc
    public  dataText
	private sub class_Initialize()
		set args = wscript.arguments
        set urlParams = createObject("scripting.Dictionary")
        dataText = ""
'       urlParams.add "url", "https://airnowapi.org/aq/observation/latLong/current?"
        urlParams.add "url", "https://airnowapi.org/aq/observation/zipCode/current?"
        urlParams.add "api", "api_key=929F6260-F920-4860-AEF8-C4094D1078B7"
        urlParams.add "fmt", "&format=application/xml"
        urlParams.add "zip", "&zipCode=94619"
'       urlParams.add "fmt", "&format=application/json"
'       urlParams.add "lat", "&latitude=37.7958"
'       urlParams.add "lon", "&longitude=-122.1947"

        set xmlDoc = fetchData

'       wscript.echo xmlElements.length
'       wscript.echo xmlElements(1).text
        if xmlDoc is nothing then 
			wscript.echo "Nothing returned"
		else
			wscript.echo xmlDoc.xml
		end if
	end sub
	private sub class_Terminate()
		set args = nothing
		set urlParams = nothing
	end sub

    public function displayData(xmlDoc)
    end function

    public function fetchData()
        dim URL : URL = urlParams("url")
        URL = URL & urlParams("api")
        URL = URL & urlParams("fmt")
        URL = URL & urlParams("zip")
'       URL = URL & urlParams("lat")
'       URL = URL & urlParams("lon")
        wscript.echo "URL=" & URL
        set fetchData = httpGet(URL)
    end function

	private function httpGet(URL)
		'on error resume next
		dim web : set web = CreateObject("MSXML2.ServerXMLHTTP")
		web.Open "GET", URL, False 
		web.Send
		If (Err.Number <> 0) or (web.Status <> "200") Then 
			set httpGet = nothing
            wscript.echo "Web Request Failed " & Err.Description
		else
			set httpGet = web.responseXML
		end If 
		set web = Nothing
		on error goto 0
	end function

'	public property GET propValue()
'		propValue = "property value"
'	end property
'	public property SET setName(anObject)
'		set objValue = anObject
'	end property
'	public property LET letName(aValue)
'		letValue = aValue
'	end property

	private sub Log(name, text)
		display right(space(20) & name, 20) & ": " & text
	end sub
	private sub display(text)
		wscript.echo text
	end sub
end class
'==============================================================================
'	vbsLib class definition
'==============================================================================
class vbsLib
	public debug
	public fs
	private sub class_Initialize()
		debug = false
		set fs = createObject("scripting.fileSystemObject")
	end sub

	private sub class_Terminate()
		set fs = nothing
	end sub

	public function getFileText(fileName)
		dim ts : set ts = fs.openTextFile(fileName)
		getFileText = ts.readAll
		ts.close
		set ts = nothing
	end function

	public function substitute(aString,paramsArray)	'replace text in aString with values from paramsArray
		dim i, s : s = aString
		for i = 0 to ubound(paramsArray)
		dim token : token = "{" & CStr(i) & "}"
		s = replace(s,token,paramsArray(i))
		next
		substitute = s
	end function

	public function Z2(n)
		Z2 = right("00" & CStr(n),2)
	end function
	
	public function Z4(n)
		Z4 = right("0000" & CStr(n),4)
	end function

	public sub displayHeader(text)
		displayBars
		display text
		displayBars
	end sub

	public sub displayBars()
		display string(80,"=")
	end sub

	public sub displayLog(name, text)
		display right(space(20) & name, 20) & ": " & text
	end sub
	
	public sub ASSERT(name, text)
		if debug then displayLog name, text
	end sub
	
	public sub display(text)
		wscript.echo text
	end sub
end class
