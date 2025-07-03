option explicit
const rootFolder 	= "D:\SdosRemedios\My Pictures\2015"
'const	sDBfile		= "D:\SdosRemedios\OneDrive\bin\data\cleanDNG.db"
const	sDBsql		= "D:\SdosRemedios\OneDrive\bin\data\cleanDNG.sql"
const	sLogfile	= "D:\SdosRemedios\OneDrive\bin\data\cleanDNG.log"
const	sSQLcmd		= "sqlCreateDB.cmd ""[FOLDER]\\cleanDNG.db"""
dim sqlite	: set sqlite = new sqliteObject : sqlite.findFiles rootFolder
set sqlite = Nothing

class sqliteObject
	private ts
	private nFiles
	private nFolders
	private nDeleted

	public fs
	public files
	public oConnection
	public recordset
	public shell
	private connString

	private sub class_initialize()
		set shell		= createObject("wscript.shell")
		set files		= createObject("scripting.Dictionary")
		set fs			= createObject("scripting.filesystemObject")
		set ts 			= fs.createTextFile(sLogfile, true)
		set oConnection	= CreateObject( "ADODB.Connection" )
		connString = "Driver={SQLite3 ODBC Driver};" _
			& "Database=[sDBfile];StepAPI=;Timeout="
		set recordset = nothing
		nFiles			= 0
		nFolders		= 0
		nDeleted		= 0
	end sub
    
	private sub class_terminate()
		set fs = nothing
		set ts = nothing
		set recordset = nothing
		set oConnection = nothing
		set shell = nothing
	end sub
    
     public sub open(database)
          me.closeDB
          dim cs : cs = replace(connString,"[sDBfile]",database)
          oConnection.open cs
     end sub
    
     public sub closeDB()
          if oConnection.state = 1 then oConnection.close()
     end sub
    
     public sub execute(SQL)
          if oConnection.state = 1 then
               set recordset = oConnection.execute(SQL)
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

	public sub findFiles (folder)
		dim d, f, idPath, n, sql
		for each d in fs.getFolder(folder).subFolders
			findFiles d
		next

		display folder
		sql = replace(sSQLcmd,"[FOLDER]",replace(folder,"\","\\"))
		'display sql
		shell.run sql, 1, true
		me.open folder & "\cleanDNG.db"
		
		execute ("insert into `path` (`name`) values ('" & folder & "\')")
		execute ("select last_insert_rowid() from `path`")
		idPath = recordset.fields(0).value

		dim fldr : set fldr = fs.getFolder(folder)
		for each f in fldr.Files
			dim ext : ext = lcase(right(f.name,4))
			select case ext
			case ".dng", ".tif", ".nef", "rw2", "cr2", "arw"
				sql = "insert into `file` (`pathid`, `name`, `size`, `ext`) values (" & idPath & ", '" & replace(f.name,"'","''") & "', " & f.size & ", '" & ext & "')"
				execute (sql)
				files.add files.count, f.path
			end select
		next
		n = fs.getFolder(folder).files.count
		nFiles = nFiles + n
		display n & " files"
	end sub
    
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
