'	fMonitor.vbs
'
'	17 Jan 2017
'
'	© Steven dosRemedios
'	steven@meetthere.com
'
'
const sDBfile = "M:\Library\bin\data\fMonitor.db"
dim sqlite : set sqlite = new sqliteObject
sqlite.open sDBfile
sqlite.execute("delete FROM folder where id > 0")
sqlite.execute("delete FROM file where id > 0")
sqlite.execute("vacuum")
sqlite.findFiles "M:\Library\bin"
'wscript.echo sqlite.displayRecords
set sqlite = Nothing

class sqliteObject
     public fs
     public oConnection
     public recordset
     private connString

     private sub class_initialize()
          set fs = createObject("scripting.filesystemObject")
          set oConnection = CreateObject( "ADODB.Connection" )
          connString = "Driver={SQLite3 ODBC Driver};" _
               & "Database=[sDBfile];StepAPI=;Timeout="
          set recordset = nothing
     end sub

     private sub class_terminate()
          set fs = nothing
          set recordset = nothing
          set oConnection = nothing
     end sub

     public sub open(database)
          if oConnection.state = 1 then oConnection.close()
          dim cs : cs = replace(connString,"[sDBfile]",database)
          oConnection.open cs
     end sub

	public function execute(SQL)
		if oConnection.state = 1 then
			wscript.echo "execute = " & SQL
			set recordset = oConnection.execute(SQL)
			if recordset is nothing then wscript.echo "No recordset returned"
		else
			set recordset = nothing
		end if
		set execute = recordset
	end function

	public function displayRecords()
		if (recordset is nothing) or recordset.EOF then
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

	public function findFiles (sFolder)
		dim f, s, sql, idFolder, idFile : set f = fs.getFolder(sFolder)
		
		idFolder = checkFolder(f).fields.item(0)
		
		for each s in f.subFolders
			findFiles s.path
		next
		
		set s = f.files
		for each f in s
			idFile = checkFile(idFolder,f).fields.item(0)
		next
	end function
	
	public function checkFolder(oFolder)
		const sqlSelect = "select * from folder where name = '{0}'"
		const sqlInsert = "insert into folder (name, modified,count) values ('{0}','{1}','{2}')"
		
		dim rs : set rs = me.execute(substitute(sqlSelect,ARRAY(LCase(oFolder.path))))
		wscript.echo "Folder = " & oFolder.path
		wscript.echo "EOF = " & rs.EOF
		if rs.EOF then
			me.execute(substitute(sqlInsert,ARRAY(LCase(oFolder.path),oFolder.dateLastModified,oFolder.files.count)))
			set rs = me.execute(substitute(sqlSelect,ARRAY(LCase(oFolder.path))))
		end if
		set checkFolder = rs
	end function
	
	public function checkFile(idFolder, oFile)
		const sqlSelect = "select * from file where idFolder = {0} and name = '{1}'"
		const sqlInsert = "insert into file (idFolder,name,modified,size,hash) values ({0},'{1}','{2}',{3},{4})"
		dim rs : set rs = me.execute(substitute(sqlSelect,ARRAY(idFolder, LCase(oFile.name))))
		wscript.echo "File = " & oFile.name
		wscript.echo "EOF = " & rs.EOF
		if rs.EOF then
			me.execute(substitute(sqlInsert,ARRAY(idFolder,LCase(oFile.name),oFile.dateLastModified,oFile.size,0)))
			set rs = me.execute(substitute(sqlSelect,ARRAY(idFolder, LCase(oFile.name))))
		end if
		set checkFile = rs
	end function
	
	public function substitute(aString,paramsArray)
		dim i, s
		s = aString
		for i = 0 to ubound(paramsArray)
			dim token : token = "{" & CStr(i) & "}"
			s = replace(s,token,paramsArray(i))
		next
		substitute = s
	end function
	
	public function lastInsert()
		dim rs : set rs = me.execute("select last_insert_rowid()")
		lastInsert = CInt(rs.fields.item(0))
	end function
end class