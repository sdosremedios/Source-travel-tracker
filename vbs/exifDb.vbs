'   exifDB - Steven dosRemedios
'
'   02-Feb-2019
'
'   Scan folder(s) of image files and extract EXIF data
'   and store in SQLite database
'
Option Explicit

const imageFolder	= "G:\Pictures\2019\2019-01\2019-01-07"
const sqlFile 		= "D:\SdosRemedios\Documents\Source\sql\exifDB.sql"
const sDBfile 		= "D:\bin\data\exifDB.db"
const sLogfile 		= "D:\bin\logs\exifDB.log"

dim log			: set log = new logObject
dim sqlite		: set sqlite = new sqliteObject
dim dir 		: set dir = new exifFolder
dim image		: set image = new exifImage

dim nFiles		: nFiles = 0
dim nFolders	: nFolders = 0

sqlite.open sDBfile
sqlite.clearDB
dir.processFolder imageFolder

class exifImage
	dim oImg
	dim exif
	private sub class_initialize()
		set oImg = WScript.CreateObject("WIA.ImageFile")
	end sub
    
	private sub class_terminate()
		set oImg = nothing
	end sub

	public sub extractExif(sFileName, exif)
		dim i, value, sPropertyName
		exif.removeAll
		oImg.LoadFile sFileName
		For i = 1 to oImg.Properties.Count
			sPropertyName = oImg.Properties(i).Name
			if not exif.exists(sPropertyName) then 
				select case oImg.Properties(i).Type
				case 1001, 1003
					value = CStr(CInt(oImg.Properties(i).Value))
				case 1002
					value = oImg.Properties(i).Value
				case 106, 1007
					value = CStr(CDbl(oImg.Properties(i).Value.Numerator)) & "/"
					value = value & CStr(CDbl(oImg.Properties(i).Value.Denominator)) & " : "
					value = value & CStr(CDbl(oImg.Properties(i).Value.Value))
				case else
					value = ""
				end select
				exif.add sPropertyName, value
			end if
		next
	end sub

	public function listGPS(sFileName)

		Dim i, j, v, s, sOutput, sPropertyName
		listGPS = ""
		oImg.LoadFile sFileName
		For i = 1 to oImg.Properties.Count
			'log.assert "oImg.Properties(i).Name", oImg.Properties(i).Name
			'log.assert "oImg.Properties(i).Type", oImg.Properties(i).Type
			sPropertyName = oImg.Properties(i).Name
			If InStr(sPropertyName, "Gps") > 0 Then
				s = sPropertyName & "(" & oImg.Properties(i).PropertyID & ") = "
				If oImg.Properties(i).IsVector Then
					s = s & "[vector]"
					Set v = oImg.Properties(i).Value
					If sPropertyName = "GpsLatitude" Then
						s = s & FormatCoords(v, oImg.Properties("GpsLatitudeRef").Value)
					ElseIf sPropertyName = "GpsLongitude" Then
						s = s & FormatCoords(v, oImg.Properties("GpsLongitudeRef").Value)
					Else
						For j = 1 To v.Count
							s = s & v(j) & " "
						Next
					End If
				Else
					s = s & oImg.Properties(i).Value
				End If
				listGPS = listGPS & s & vbCrLf
			else
				select case oImg.Properties(i).Type
				case 1002	'Text
					'log.assert sPropertyName, oImg.Properties(i).Value
				case 1001,1003	'Integer ?
					'log.assert sPropertyName, CInt(oImg.Properties(i).Value)
				case 1004, 1005	'Long ?
					'log.assert sPropertyName, cLng(oImg.Properties(i).Value)
				case 1006, 1007	'Rational
					'log.assert sPropertyName, CDbl(oImg.Properties(i).Value.Numerator)
					'log.assert sPropertyName, CDbl(oImg.Properties(i).Value.Denominator)
					'log.assert sPropertyName, CDbl(oImg.Properties(i).Value.Value)
				case 1100
					'log.assert sPropertyName, formatVector(oImg.Properties(i).Value)
				end select
			End If
		Next
	end function

	function formatVector(v)
		dim i
		formatVector = ""
		log.assert "v.count", v.count
		for i = 1 to v.count
			formatVector = formatVector & Cstr(v(i)) & " "
		next
	end function

	Function FormatCoords(v, sRef)
		'On Error Resume Next
		Dim sCoords
		sCoords = v(1) & Chr(176) & v(2) & Chr(39) & v(3) & Chr(34) & sRef
		FormatCoords = sCoords
	End Function

end class

class exifFolder
	dim fs, recordset, exif
	private sub class_initialize
		set fs = createObject("scripting.filesystemObject")
		set exif = createObject("Scripting.Dictionary")
	end sub

	private sub class_terminate
		set exif = nothing
		set fs = nothing
	end sub

	public sub processFolder (folderName)
		dim d, f, idPath, idFile, n
		nFolders = nFolders + 1
		for each d in fs.getFolder(folderName).subFolders
			processFolder d
		next

		sqlite.execute ("insert into `path` (`name`) values ('" & folderName & "\')")
		set recordset = sqlite.execute ("select last_insert_rowid() from `path`")
		idPath = recordset.fields(0).value
		'log.assert "idPath",idPath
		log.displayLog folderName

		for each f in fs.getFolder(folderName).files
			if ucase(f.type) = "JPG FILE" then 
				dim i, v
				dim sql : sql = "insert into `file` (`pathid`, `name`, `size`) values (" & idPath & ", '" & replace(f.name,"'","''") & "', " & f.size & ")"
				log.displayLog f.path
				sqlite.execute (sql)
				set recordset = sqlite.execute ("select last_insert_rowid() from `file`")
				idFile = recordset.fields(0).value

				image.extractExif f.path, exif
				dim k : k = exif.keys
				for i = 0 to exif.count-1
					v = CStr(exif(k(i)))
					'log.assert k(i), v
					sql = "insert into `exif` (`fileid`, `name`, `value`) values (" & idFile & ", '" & k(i) & "', '" & v & "')"
					sqlite.execute (sql)
				next
			end if
		next
		n = fs.getFolder(folderName).files.count
		nFiles = nFiles + n
		log.display n & " files"
	end sub
end class

class sqliteObject
	dim oConnection
	dim connString

	private sub class_initialize
 		set oConnection = createObject( "ADODB.Connection" )
		connString = "Driver={SQLite3 ODBC Driver};" _
			& "Database=[sDBfile];StepAPI=;Timeout=20"
	end sub

	private sub class_terminate
		set oConnection = nothing
	end sub

	public sub clearDB
		execute ("delete from `path` where `path`.id > 0")
		execute ("delete from `file` where `file`.id > 0")
		execute ("delete from `exif` where `exif`.id > 0")
		execute ("vacuum")
		log.displayLog "Cleared database"
	end sub
    
     public sub open(database)
		if oConnection.state = 1 then oConnection.close()
		dim cs : cs = replace(connString,"[sDBfile]",database)
		oConnection.open cs
     end sub
    
	public function execute(SQL)
		if oConnection.state = 1 then
			on error resume next
			'log.assert "sql", SQL
			set execute = oConnection.execute(SQL)
			if err.number then 
				log.displayLog err.description
			end if
			on error goto 0
		else
			set execute = nothing
		end if
	end function
end class

class logObject
	dim fs, ts
	 private sub class_initialize
		'set fs = createObject("scripting.filesystemObject")
		set ts = createObject("scripting.filesystemObject").createTextFile(sLogfile, true)
	 end sub

	 private sub class_terminate
	 	ts.close
	 	set ts = nothing
	 end sub
	 
	 public sub displayLog(text)
		ts.writeLine text
		display text
	 end sub

	 public sub displaySection(text)
		displayLog string(60,"=")
		displayLog text
		displayLog string(60,"=")
	 end sub

	 public sub assert(name,value)
		displayLog right(space(20) & name,30) & " :: " & value
	 end sub

	public sub display(text)
		wscript.echo text
	end sub
end class

