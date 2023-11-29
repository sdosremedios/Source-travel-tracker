option explicit
'==============================================================================
'	listTree.vbs
'
'   Version 1.0                                             25 November 2023
'==============================================================================
dim lib			: set lib		= new vbsLib
dim myObject	: set myObject	= new dataObject

'==============================================================================
'	class definition
'==============================================================================
class dataObject
	private letValue
	private rootFolder
    private folderName
	public args
 	private sub class_Initialize()
		folderName = wscript.arguments(0)
        set rootFolder = lib.fs.getFolder(folderName)
        processFolder rootFolder.Path
	end sub

	private sub class_Terminate()
		set rootFolder = nothing
	end sub
    	
	public sub processFolder (folderName)
		dim d, f
		for each d in lib.fs.getFolder(folderName).subFolders
			processFolder d
		next

        dim fld : set fld = lib.fs.getFolder(folderName)
        if fld.files.count > 0 then
            dim kb
            display vbcrlf & folderName
            for each f in lib.fs.getFolder(folderName).files
                kb = lib.GB(f.Size)
                display space(2) & lib.Pn(f.Name,55) & lib.Zn(formatDateTime(f.dateLastModified,2),12) & lib.Zn(kb,10) & "  " & f.Type 
            Next
        end if
	end sub

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

	public function Pn(t,n)
		Pn = left(t & space(n),n)
	end function
	
	public function Z2(n)
		Z2 = right("00" & CStr(n),2)
	end function
	
	public function Z4(n)
		Z4 = right("0000" & CStr(n),4)
	end function
	
	public function Zn(n,w)
		Zn = right(space(w) & CStr(n),w)
	end function

    public function GB(n)
        dim i : i = n
        if i < 1024 then
            GB = Cint(n) & "   "
        elseif i < 1024000 then
            GB = Cint(n/1024) & " KB"
        else 
            GB = Cint(n/1024000) & " MB"
        end if
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
