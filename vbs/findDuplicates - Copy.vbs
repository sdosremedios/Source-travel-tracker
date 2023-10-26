' Search a specified directory and sub-directory for files with duplicate file sizes
' then check their checksums for identity, then list the pair

option explicit

'const	rootFolder	= "\\Rt-n65r\data3tb\Backup\My Pictures\2012"
const	rootFolder	= "\\192.168.3.100\home\CloudStation\Backup\BIGWOLF\D\SdosRemedios\My Pictures"

const	sDBfile		= "D:\SdosRemedios\Transporter\Docs\bin\data\duplicates.db"
const	sLogfile	= "D:\SdosRemedios\Transporter\Docs\bin\data\duplicates.log"

dim		sqlite		: set sqlite = new sqliteObject

sqlite.open sDBfile

if wscript.arguments.count > 0 then
	select case lcase(wscript.arguments(0))
	case "md5"
		sqlite.updateMD5()
	case "delete"
		sqlite.deleteDups()
	case else
		sqlite.clearDB
		sqlite.processFolder wscript.arguments(0)
	end select
else
	sqlite.clearDB
	sqlite.processFolder rootFolder
	'sqlite.updateMD5()
	'sqlite.deleteDups()
end if

set sqlite = Nothing

'============================================================
class sqliteObject
	public oConnection
	public recordset
	public MD5
	
	private connString
	private fs
	private ts
	private nFiles
	private nFolders
	private nDeleted
    
	private sub class_initialize()
		set fs = createObject("scripting.filesystemObject")
		set ts = fs.createTextFile(sLogfile, true)
		set MD5 = createObject( "XStandard.MD5" )
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
		display nFolders & " folders and  " & nFiles & " files processed"
		display nDeleted & " duplicate files deleted"
		ts.close
		
		set recordset = nothing
		set oConnection = nothing
		set MD5 = nothing
		set ts = nothing
		set fs = nothing
	end sub
    
     public sub open(database)
		if oConnection.state = 1 then oConnection.close()
		dim cs : cs = replace(connString,"[sDBfile]",database)
		oConnection.open cs
     end sub
    
	public sub execute(SQL)
		if oConnection.state = 1 then
			on error resume next
			set recordset = oConnection.execute(SQL)
			if err.number then 
				displayLog err.description
			end if
			on error goto 0
		else
			set recordset = nothing
		end if
	end sub
 
	public sub clearDB
		execute "delete from `path` where `path`.id > 0"
		execute "delete from `file` where `file`.id > 0"
		execute "vacuum"
	end sub
	
	public sub processFolder (folderName)
		dim d, f, idPath, n
		nFolders = nFolders + 1
		for each d in fs.getFolder(folderName).subFolders
			processFolder d
		next

		execute ("insert into `path` (`name`) values ('" & folderName & "\')")
		execute ("select last_insert_rowid() from `path`")
		idPath = recordset.fields(0).value
		display folderName

		for each f in fs.getFolder(folderName).files
			dim sql : sql = "insert into `file` (`pathid`, `name`, `size`) values (" & idPath+1 & ", '" & replace(f.name,"'","''") & "', " & f.size & ")"
			execute (sql)
		next
		n = fs.getFolder(folderName).files.count
		nFiles = nFiles + n
		display n & " files"
	end sub
   
	public function deleteDups()
		displaySection "Deleting Duplicate files"
		dim curMD5  : curMD5  = 0
		execute "select * from actual_duplicates order by md5, filepath desc"
		if recordset is nothing or recordset.eof then
			deleteDups = false
		else
			recordset.moveFirst
			while not recordset.EOF
				if curMD5 = recordset("md5") then
					dim fPath : fPath = recordset("filepath")
					displayLog fPath
					fs.deleteFile fPath
					oConnection.execute "delete from file where id = " & recordset("id")
					nDeleted = nDeleted + 1
				else	
					curMD5 = recordset("md5")
				end if
				recordset.moveNext
			wend
			deleteDups = true
		end if
	end function
    
	public function updateMD5()
		displaySection "Calculating MD5"
		execute "select count() from possible_duplicates"
		display recordset.fields(0) & " files to process"
		dim rs
		execute "select * from possible_duplicates where size > 8192"
		if recordset is nothing or recordset.EOF then
			updateMD5 = false
		else
			recordset.moveFirst
			while not recordset.EOF
				dim p		: p			= recordset("filepath")
				dim id		: id 		= recordset("id")
				dim fileMD5	: fileMD5 	= MD5.GetCheckSumFromFile(p)
				displayLog fileMD5 & " " & p
				oConnection.execute("update `file` set `md5` = '" & fileMD5 & "' where id = " & id)
				recordset.moveNext
			wend
			updateMD5 = true
		end if
	end function
    
     public function displayRecords()
		if recordset is nothing or recordset.recordCount < 0 then
               displayRecords = ""
          else
               dim buffer : buffer = ""
               recordset.moveFirst
               while not recordset.EOF
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
	 
	 public sub displaySection(text)
		display string(60,"=")
		display text
		display string(60,"=")
	 end sub
	 
	 public sub displayLog(text)
		display " > " & text
	 end sub
	 
	 public sub display(text)
		ts.writeLine text
		wscript.echo text
	 end sub
end class
