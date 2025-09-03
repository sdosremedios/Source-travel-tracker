option explicit
'==============================================================================
'	application
'==============================================================================
dim lib			: set lib		= new vbsLib
dim myObject	: set myObject	= new someObject

'==============================================================================
'	class definition
'==============================================================================
class someObject
	private letValue
	private objValue
	private propValue
	public args
	private sub class_Initialize()
		set args = wscript.arguments
	end sub
	private sub class_Terminate()
		set args = nothing
	end sub
	public property GET propertyValue()
		propValue = propValue
	end property
	public property SET setName(anObject)
		set objValue = anObject
	end property
	public property LET letName(aValue)
		letValue = aValue
	end property
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
	public args

	private sub class_Initialize()
		dim i
		debug = false
		set fs = createObject("scripting.fileSystemObject")
		if wscript.arguments.count = 0 then
			display "No arguments provided!"
			bail()
		end if
		for i = 0 to wscript.arguments.count - 1
			select case i
				case 0
					' Arg 1
				case 1
					' Arg 2
					end if
				case else
					display "Too many arguments provided!"
					bail()
			end select
		next
	end sub

	private sub class_Terminate()
		set fs = nothing
	end sub

    public sub createFolders(folderName)	'RECURSIVE!!
		dim d, f, e
		if fs.folderExists(folderName) then
			exit sub
		else 
			createFolders fs.GetParentFolderName (folderName)
		end if
		log "create folder", folderName
		fs.createFolder(folderName)
	end sub
	
	public function checkFolder(folderName, delete)
		if fs.folderExists(folderName) then
			if delete then 
				fs.deleteFolder(folderName)
			end if
		end if
		createFolders folderName
		set checkFolder = fs.getFolder(folderName)
	end function

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

	public sub getArgs()
		dim i, s
		if wscript.arguments.count = 0 then
			display "No arguments provided!"
			bail
		end if
		s = ""
        For i = 0 To WScript.Arguments.Count - 1
            Select Case i
                Case 0 ' Input folder
					display "Argument "& i & ": " & WScript.Arguments(i)
                Case 1 ' Watermark flag or file
					display "Argument "& i & ": " & WScript.Arguments(i)
                Case 2 ' Rotation
					display "Argument "& i & ": " & WScript.Arguments(i)
                Case 3 ' QR code option
                    If LCase(WScript.Arguments(i)) = "true" Then QRcode = True
					display "Argument "& i & ": " & WScript.Arguments(i)
                Case Else
                    display "Too many arguments provided."
                    bail()
            End Select
        Next
	end sub
			
	public function httpGet(URL)
		dim oXMLhttp : set oXMLhttp = CreateObject("msxml2.xmlhttp")
		oXMLhttp.Open "GET", URL, False 
		oXMLhttp.Send
		If (Err.Number <> 0) or (oXMLhttp.Status <> "200") Then 
			httpGet = "HTTP Error: " & err.number
		else
			httpGet = oXMLhttp.responseText
		end if 
	end function

    public function URLEncode(str)
		Dim i, ch, code
		Dim encoded : encoded = ""

		For i = 1 To Len(str)
			ch = Mid(str, i, 1)
			Select Case ch
				Case "A" To "Z", "a" To "z", "0" To "9", "-", "_", ".", "~"
						encoded = encoded & ch
				Case " "
						encoded = encoded & "+" ' use "%20" instead for strict RFC
				Case Else
						code = Hex(Asc(ch))
						If Len(code) = 1 Then code = "0" & code
						encoded = encoded & "%" & code
			End Select
		Next
		URLEncode = encoded
    End Function

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
	'--------------------------------------------------------------------------
	' Exit script gracefully
	'--------------------------------------------------------------------------
	Private Sub bail()
		WScript.Quit 1
	End Sub

end class
