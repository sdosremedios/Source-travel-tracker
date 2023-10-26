option explicit
' find redundant files matching .dng files
'
' Delete duplicates of .dng files for .jpg, .nef, .tif, .arw and .cr2 
'

const	rootFolder	= "\\rt-n65r\data3tb\Backup\My Pictures\2014\"

const	sDBfile		= "D:\SdosRemedios\OneDrive\bin\data\cleanDNG.db"
const	sLogfile	= "D:\SdosRemedios\OneDrive\bin\data\cleanDNG.log"
const	insertFile	= "insert into `file` (`pathid`, `name`, `ext`, `size`) values ([PATHID], '[NAME]', '[EXT]', [SIZE])"

dim		sqlite		: set sqlite = new sqliteObject
sqlite.open sDBfile
sqlite.clearDB
sqlite.processFolder rootFolder

set sqlite = Nothing

'============================================================
class sqliteObject
	public	oConnection
	public  recordset
	
	private connString
	private fs
	private ts
	private nFiles
	private nFolders
	private nDeleted
    
	private sub class_initialize()
		set fs = createObject("scripting.filesystemObject")
		set ts = fs.createTextFile(sLogfile, true)
		set oConnection = createObject( "ADODB.Connection" )
		connString = "Driver={SQLite3 ODBC Driver};" _
			& "Database=[sDBfile];StepAPI=;Timeout=20"
		set recordset = nothing
		displaySection "Processing Folders"
		nfiles = 0
		nFolders = 0
		nDeleted = 0
	end sub
    
	private sub class_terminate()
		displaySection "Finished"
		display nFolders & " folders and  " & nFiles & " .dng files processed"
		display nDeleted & " redundant files deleted"
		ts.close
		
		set recordset = nothing
		set oConnection = nothing
		set ts = nothing
		set fs = nothing
	end sub
    
     public sub open(database)
		if oConnection.state = 1 then oConnection.close()
		dim cs : cs = replace(connString,"[sDBfile]",database)
		oConnection.open cs
     end sub
    
	public function execute(SQL)
		if oConnection.state = 1 then
			set execute = oConnection.execute(SQL)
		else
			set execute = nothing
		end if
	end function
 
	public sub clearDB
		execute "delete from `path` where `path`.id > 0"
		execute "delete from `file` where `file`.id > 0"
		execute "vacuum"
	end sub
	
	public sub processFolder (folderName)
		dim d, f, idPath, n, dngSet
		n = 0
		nFolders = nFolders + 1
		for each d in fs.getFolder(folderName).subFolders
			processFolder d
		next

		clearDB
		execute ("insert into `path` (`name`) values ('" & folderName & "\')")
		set recordset = execute ("select last_insert_rowid() from `path`")
		idPath = recordset.fields(0).value
		displaySection folderName

		for each f in fs.getFolder(folderName).files
			dim fileName	: fileName 	= lCase(replace(f.name,"'","''"))
			dim fileExt		: fileExt	= right(fileName,4)
			fileName		= replace(fileName,fileExt,"")
			dim sql			: sql = replace(insertFile,"[PATHID]",idPath)
			sql = replace(sql,"[NAME]",fileName)
			sql = replace(sql,"[EXT]",fileExt)
			sql = replace(sql,"[SIZE]",f.size)
			execute (sql)
			'display f.name
		next
		
		' look for redundant files 
		display "Searching ..."
		set dngSet = execute ("select * from file where `ext` = '.dng' order by pathid, name")
		
		if not dngSet.EOF then
			dngSet.moveFirst
			while not dngSet.EOF
				n = n + 1
				sql = "select `path` || `file` || `ext` from `full_name` where `file` = '" & dngSet("name") & "' and `ext` in ('.jpg','.nef','.rw2','.cr2','.arw')"
				set recordset = execute (sql)
				removeFiles(recordset)
				dngSet.moveNext
			wend
		end if

		nFiles = nFiles + n
		display n & " files"
	end sub
	
	private sub removeFiles(rs)
		if not rs.EOF then
			rs.moveFirst
			while not rs.EOF
				displayLog rs.Fields(0).value
				fs.deleteFile rs.Fields(0).value
				nDeleted = nDeleted + 1
				rs.moveNext
			wend
		end if
	end sub
    
	public function displayRecords(rs)
		dim oFld
		if rs is nothing or rs.EOF then
		   displayRecords = ""
		else
			dim buffer : buffer = ""
			rs.moveFirst
			while not rs.EOF
				dim line : line = ""
				For Each oFld In rs.Fields
					if line = "" then
						line = oFld.Value
					else
						line = line & ", " & oFld.Value
					end if
				Next
				buffer = buffer & line & vbcrlf
				rs.moveNext
			wend
			displayRecords = buffer
		end if
	end function

	public sub displaySection(text)
		display string(60,"=")
		display text
	end sub

	public sub displayLog(text)
		display " > " & text
	end sub

	public sub display(text)
		ts.writeLine text
		wscript.echo text
	end sub
end class
