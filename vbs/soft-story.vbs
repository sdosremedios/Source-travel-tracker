option explicit

dim address : set address = new addressObject
address.geoLocate

' C:\Users\Steven\SkyDrive\bin\data
class addressObject
	public URL
	public PARAM
	public xmlDoc
	public fs
	private csvFilePath
	private sub class_Initialize()
		URL = "https://maps.googleapis.com/maps/api/geocode/xml?sensor=false"
		set xmlDoc	= createObject("Msxml.DOMDocument")
		set fs		= createObject("Scripting.FileSystemObject")
		set PARAM 	= createObject("Scripting.Dictionary")
		PARAM.add "key", "AIzaSyDrIP6IdCEhQtLxSrLlWqssruEOxuB8giU"
		PARAM.add "region", "us"
		PARAM.add "bounds", "37.735,-122.314|37.853,-122.100"
		loadXML
		wscript.echo "Hello"
	end sub
	private sub class_Terminate() 
		set xmlDoc 	= nothing
		set fs 		= nothing
		set PARAM 	= nothing
		wscript.echo "World"
	end sub
	
	public sub geoLocate
		dim nodeList, node
		set node = xmlDoc.selectSingleNode("//item")
		wscript.echo node.xml
	end sub
	
	public property get xml()
		'wscript.echo xmlDoc.xml
		dim nodeList, node
		set node = xmlDoc.selectSingleNode("//item")
		wscript.echo node.xml
		exit property
		
		set nodeList = xmlDoc.SelectNodes("//item")
		for each node in nodeList
			wscript.echo node.xml
		next
	end property
	
	private function loadXML()
		Dim Connection
		Dim rs
		Dim SQL
		dim root
		dim row

		'declare the SQL statement that will query the database
		SQL = "SELECT * FROM item"

		'create an instance of the ADO connection and rs objects
		Set Connection = CreateObject("ADODB.Connection")
		Set rs = CreateObject("ADODB.Recordset")

		'open the connection to the database
		Connection.Open "DSN=soft-story"

		'Open the rs object executing the SQL statement and return records 
		rs.Open SQL,Connection

		'first of all determine whether there are any records 
		If rs.EOF Then 
			wscript.echo("No records returned.") 
		Else 
			set xmlDoc	= createObject("Msxml.DOMDocument")
			set root = xmlDoc.appendChild(xmlDoc.createElement("items"))

			'if there are records then loop through the fields 
			Do While NOT rs.Eof   
				set row = root.appendChild(xmlDoc.createElement("item"))
				xmlRow rs, row
				'wscript.echo rs(3) & " " &  rs(4) & " " & rs(5)
				rs.MoveNext     
			Loop
		End If
		rs.close
	end function

	private function xmlRow(rs, row)
		const tag = "<{0}>{1}</{0}>"
		dim i, f
		for i = 0 to rs.fields.count -1
			dim element
			set f = row.appendChild(xmlDoc.createElement(rs(i).name))
			select case lcase(rs(i).name)
			case "description"
				f.text = "<![CDATA[" & rs(i).value & "]]>"
			case else
				f.text = rs(i).value
			end select
			'wscript.echo rs(i).name & " = " & rs(i).value
		next
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
end class