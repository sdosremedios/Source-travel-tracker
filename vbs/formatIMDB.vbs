option explicit
'==============================================================================
'	formatIMDB
'
'   03-Jan-2021 Steven dosRemedios
'==============================================================================
const sDBfile   = "M:\Videos\watchList.db"
dim lib    		: set lib       = new vbsLib
dim sqlite      : set sqlite    = new sqliteObject
dim text		: text = ""

sqlite.open sDBfile
sqlite.execute("SELECT * FROM watchList")
text = sqlite.report
lib.display(text)
lib.writeTextFile "D:\sdosremedios\downloads\imdb.md", text

set sqlite = Nothing

'==============================================================================
'	sqliteObject class definition
'==============================================================================
class sqliteObject
     public oConnection
     public recordset
     private connString
     private sub class_initialize()
          set oConnection = CreateObject( "ADODB.Connection" )
          connString = "Driver=SQLite3 ODBC Driver;" _
               & "Database=[sDBfile];LongNames=0;" _
			   & "Timeout=1000;NoTXN=0;SyncPragma=NORMAL;StepAPI=0;"
          set recordset = nothing
		  'wscript.echo "database object created"
     end sub
    
     private sub class_terminate()
          set recordset = nothing
          set oConnection = nothing
		  'wscript.echo "database closed"
     end sub
	 
	 public function report()
		report = ""
		if recordset is nothing then return

		recordset.moveFirst
		while not recordset.EOF
			dim line : line = "* "
			dim tail : tail = "" & recordset("note").value
			dim newline
			if tail = "" then 
				newline = vbCrLf 
			else 
				newline = "\" & vbCrLf
				tail = tail & vbCrLf
			end if
			
			line = line & "[" & recordset("title").Value & " " & recordset("year").Value & "]"
			line = line & "(" & recordset("url").Value & "), "
			line = line & "IMDb " & recordset("rating").Value & newline & tail
			report = report & line
			'lib.display(line)
			recordset.moveNext
		wend
	 end function
    
     public sub open(database)
          if oConnection.state = 1 then oConnection.close()
          dim cs : cs = replace(connString,"[sDBfile]",database)
          oConnection.open cs
		  'wscript.echo "database opened"
     end sub
    
     public sub execute(SQL)
          if oConnection.state = 1 then
               set recordset = oConnection.execute(SQL)
          else
               set recordset = nothing
          end if
     end sub
    
     public function displayRecords()
          if recordset is nothing then
               displayRecords = ""
          else
               dim buffer : buffer = ""
               recordset.moveFirst
               while not recordset.EOF
					dim oFld
                    dim line : line = ""
                    For Each oFld In recordset.Fields
                         if line = "" then
                              line = oFld.Value
                         else
                              line = line & ", " & oFld.Value
                         end if
                    Next
                    buffer = buffer & line & vbcrlf
                    recordset.moveNext
               wend
               displayRecords = buffer
          end if
     end function
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
	
	public sub writeTextFile(fileName,Text)
		dim ts : set ts = fs.openTextFile(fileName,2, true)
		ts.writeLine(Text)
		ts.close
		set ts = nothing
	end sub

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
