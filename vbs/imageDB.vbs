option explicit
'
' Create a database of image files in a directory structure
' Version 1.0	December 2015
'
'
'
const rootFolder 	= "D:\SdosRemedios\My Pictures"
const	sDBfile		= "D:\SdosRemedios\My Pictures\imageDB.db"
const	sLogfile	= "D:\SdosRemedios\My Pictures\imageDB.log"
const	sSQLcmd		= "sqlCreateDB.cmd ""[FOLDER]"""
dim 	sqlite		: set sqlite = new sqliteObject

sqlite.open sDBfile
'sqlite.clearDB
sqlite.findFiles rootFolder
set sqlite = Nothing

class sqliteObject
	public	fs
	private	ts
	public 	oConnection
	public	recordset
	public	image
	
	private nFiles
	private nFolders
	private nDeleted

	private connString

	private sub class_initialize()
		set fs			= createObject("scripting.filesystemObject")
		set ts 			= fs.createTextFile(sLogfile, true)
		set oConnection	= CreateObject( "ADODB.Connection" )
		set recordset 	= nothing
		connString 		= "Driver={SQLite3 ODBC Driver};Database=[sDBfile];StepAPI=;Timeout="
		
		nFiles			= 0
		nFolders		= 0
		nDeleted		= 0
	end sub
    
	private sub class_terminate()
		set recordset 	= nothing
		set oConnection = nothing
		set ts 			= nothing
		set fs 			= nothing
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
	
	public sub refresh()
		execute "update `path` set `fresh` = 0 where `fresh` <> 0"
	end sub
	
	public sub processFolders (folderName)
		dim d, f, idPath, n
		nFolders = nFolders + 1
		for each d in fs.getFolder(folderName).subFolders
			processFolders d
		next

		n = 0
		idPath = insertPath (folderName)
		if idPath then
			display folderName

			for each f in fs.getFolder(folderName).files
				insertFile idPath, f , lcase(right(f.name,4))
				n = n + 1
			next
			nFiles = nFiles + n
			display n & " files"
			execute "update `path` set `fresh` = 1 where `id` = " & idPath
		end if
	end sub
	
	public sub findFiles (folder)
		dim d, f, idPath, n, sql
		for each d in fs.getFolder(folder).subFolders
			findFiles d
		next

		n = 0
		idPath = insertPath (folder)
		if idPath then
			display folder
			dim fldr : set fldr = fs.getFolder(folder)
			for each f in fldr.Files
				dim ext : ext = lcase(right(f.name,4))
				select case ext
				case ".dng", ".tif", ".nef", ".rw2", ".cr2", ".arw", ".jpg", ".png", ".gif", ".ico", ".psd"
					insertFile idPath, f , ext
					n = n + 1
				end select
			next
			nFiles = nFiles + n
			display n & " files"
			execute "update `path` set `fresh` = 1 where `id` = " & idPath
		end if

	end sub
	
	private sub insertFile(idPath, f, ext)
		dim sql : sql = "select `id` from `file` where `pathid` = " & idPath & " and `name` = '" & replace(f.name,"'","''") & "'"
		execute sql
		if recordset.eof then
			sql = "insert into `file` (`pathid`, `name`, `size`, `ext`) values (" & idPath & ", '" & replace(f.name,"'","''") & "', " & f.size & ", '" & ext & "')"
			displayLog sql
			execute (sql)
		else
'			sql = "update `file` set `size` = " & f.size & " where `file`.`id` = " & recordset.fields(0).value
		end if
	end sub
	
	private function insertPath(folder)
		dim sql : sql = "select `id`, `fresh` from `path` where `name` = """ & replace(folder,"'","''") & "\"""
		dim id  : id = 0
		displayLog sql
		execute (sql)
		if recordset.eof then
			sql = "insert into `path` (`name`) values (""" & replace(folder,"'","''") & "\"")"
			displayLog sql
			execute (sql)
			execute ("select last_insert_rowid() from `path`")
			insertPath = recordset.fields(0).value
		else
			if recordset("fresh") = 0 then
				insertPath = cint(recordset("id"))
			else
				insertPath = 0
			end if
		end if
	end function
    
	public function displayRecords()
		dim buffer : buffer = ""
		if recordset is nothing or recordset.eof then
			displayRecords = ""
		else
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
		end if
		displayRecords = buffer
	end function
	 
	public sub displaySection(text)
		display string(60,"=")
		display text
		displayLog text
		display string(60,"=")
	end sub

	public sub displayLog(text)
		ts.writeLine " > " & text
	end sub

	public sub display(text)
		wscript.echo text
	end sub
end class
