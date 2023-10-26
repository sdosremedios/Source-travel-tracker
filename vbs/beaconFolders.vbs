option explicit
'	beaconFolders.vbs
'
'	20 Feb 2017
'
'	© Steven dosRemedios
'	steven@meetthere.com
'
'	Detect modified files in the node folders, queue them, then process them into BeACO2N database
'
'	C:\bin\beaconFolders.vbs
'	C:\Users\SdosRemedios\SkyDrive\Public\BeACON\beaconFolders.vbs
'
'	cscript beaconFolders.vbs
'
dim beacon : set beacon = new beaconObject
set beacon = Nothing

class beaconObject
	public fs
	public dbLite
	public dbBeacon
	public recordset
	public siteFile
	public sDBfile

	private connString
	private xmlDoc
	private nodes
	private mySQLexe	
	private mySQLargs	
	private logFileName
	private beginTime
	private debug

	private sub class_initialize()	'setup objects and variables
		debug = false
		displayText "beaconFolders " & dbDateTime(Now())
		logBar
		sDBfile = "C:\bin\beaconFolders.db"
		siteFile = "C:\bin\xml\beaco2n.xml"

		set fs = createObject("scripting.filesystemObject")
		set dbLite = CreateObject( "ADODB.Connection" )
		set dbBeacon = CreateObject( "ADODB.Connection" )
		set recordset = nothing
		set xmlDoc = createObject("Msxml.DOMDocument")
		xmlDoc.load siteFile
		set nodes = xmlDoc.selectNodes("//site")
		connString 		= "Driver={SQLite3 ODBC Driver}; Database={0}"
		mySQLexe		= xmlDoc.selectSingleNode("//setting[@name='mySQLexe']").getAttribute("value")
		mySQLargs		= xmlDoc.selectSingleNode("//setting[@name='mySQLargs']").getAttribute("value")
		logFileName		= xmlDoc.selectSingleNode("//setting[@name='logFileName']").getAttribute("value")

		me.open sDBfile
		beginTime = Now()
		
		'me.clearQueue
		me.listSites
		me.processNodes
		me.processQueue
	end sub

	private sub class_terminate()	'cleanup memory
		dbBeacon.close
		dbLite.close
		
		logBar
		displayText dbDateTime(Now()) & " - " & dateDiff("s",beginTime,Now()) & " seconds"
		set xmlDoc = nothing
		set recordset = nothing
		set dbLite = nothing
		set dbBeacon = nothing
		set fs = nothing
	end sub
	
	public sub listSites()	'display beaco2n.sites
		dim rs
		logBar
		displayText "Sites"
		if dbBeacon.state = 1 then
			'displayText "execute = " & SQL
			set rs = dbBeacon.execute("SELECT * from sites")
			if rs is nothing then displayText "No recordset returned"
		else
			set rs = nothing
		end if
		
		if rs.EOF then exit sub
		
		rs.moveFirst
		do until rs.EOF
			displayText "  " & zPad(rs.fields.item("siteid"),3) & " " & rs.fields.item("Site")
			rs.moveNext
		loop
	end sub
	
	public function beaconEx(SQL)	'execute SQL on beaco2n MySQL database
		dim rs
		if dbBeacon.state = 1 then
			ASSERT SQL
			set rs = dbBeacon.execute(SQL)
			if rs is nothing then displayText "No recordset returned"
		else
			set rs = nothing
		end if
		beaconEx = rs
	end function
	
	public sub open(database)	'open database
		if dbLite.state = 1 then dbLite.close()
		dbLite.open substitute(connString,ARRAY(sDBfile))
		
		if dbBeacon.state = 1 then dbBeacon.close()
		dbBeacon.open "Driver={MySQL ODBC 5.1 Driver}; DSN=beaconUpdate;USER=root;PWD=Beacon426; database=beaco2n"
		
		displayText "Open database " & sDBfile & " BeACO2N"
	end sub

	public function execute(SQL)	'execute a query
		if dbLite.state = 1 then
			ASSERT "execute = " & SQL
			set recordset = dbLite.execute(SQL)
			if recordset is nothing then displayText "No recordset returned"
		else
			set recordset = nothing
		end if
		set execute = recordset
	end function

	public sub clearDB()	'empty database
		me.execute("DELETE FROM folder WHERE id > 0")
		me.execute("DELETE FROM file WHERE id > 0")
		me.clearQueue
	end sub

	public sub clearQueue()	'discard current queue
		me.execute("DELETE FROM queue WHERE fileID > 0")
		me.execute("VACUUM")
	end sub

	public sub processNodes()	'check folders and files for each node
		dim i
		logBar
		displayText "Process " & nodes.length & " nodes"
		for i = 0 to nodes.length -1
			''' build site specific vasriables
			dim site		: set site		= nodes(i)
			dim siteID		: siteID		= site.getAttribute("id")
			dim siteName	: siteName		= site.getAttribute("name")
			dim siteFoldername : siteFoldername = "N:\" & siteName & "\data"

			ASSERT "Site " & siteName
			if fs.folderExists(siteFoldername) then findFiles siteFoldername, siteID
		next
	end sub

	public sub processQueue()	'process raw data into MySQL database
		const sqlInsert = "INSERT INTO temp (`siteid`, `t1`, `p`, `t2`, `rh`, `dp`, `o3`, `co`, `no2`, `em1_o3`, `em2_o3`, `em3_co`, `em4_co`, `em5_no`, `em6_no`, `em7_no2`, `em8_no2`, `pc_h`, `pc_t`, `pc_p`, `co2`, `t3`, `date`) VALUES "
		logBar
		displayText "Queue " & dbDateTime(now())
		dim rs : set rs = me.execute("SELECT * FROM queued ORDER BY siteID, path")
		dim curFolder : curFolder = 0
		dim sql : sql = sqlInsert
		if rs.EOF then exit sub

		rs.moveFirst
		curFolder = rs.fields.item("folderID")
		do until rs.EOF
			dim fileID   : fileID   = rs.fields.item("fileID")
			dim folderID : folderID = rs.fields.item("folderID")
			dim filePath : filePath = rs.fields.item("path")
			dim siteID   : siteID   = rs.fields.item("siteID")
			if curFolder = folderID then
				log "Processing", filePath
				sql = sql & processFile(fileID, siteID, filePath)
			else
				insertTemp sql, curFolder
				log "Processing", filePath
				sql = sqlInsert & processFile(fileID, siteID, filePath)
				curFolder = folderID
			end if
			rs.moveNext
		loop
		insertTemp sql, folderID
	end sub
	
	private function processFile(fileID, siteID, fName)	'build SQL insert statement for BeACO2N temp table
		const 	fieldFormat	= "^([-+]?\d*\.?\d+,){21}\d{4}(-\d{2}){2} \d{2}(:\d{2}){2}$"
		dim 	iFile		: set iFile = fs.openTextFile(fName,1)
		dim		insertSQL	: insertSQL = ""
		dim 	newLine 	: newLine = "," & vbCrLf
		dim 	pattern 	: set pattern = new Regexp
		pattern.pattern 	= fieldFormat

		while not iFile.atEndOfStream
			dim r : r = iFile.readLine
			if pattern.test(r) Then
				insertSQL = insertSQL  & parseRow(siteID, r) & newLine
			else
				log "Invalid data", r
			end if
		wend
		
		iFile.close

		set iFile 	= nothing
		set pattern = nothing
		processFile = insertSQL
	end function

	private sub insertTemp(SQL, folderID)
		dim i, insertSQL : insertSQL = ""
		' remove last comma
		for i = len(SQL) to 1 step -1
			if mid(SQL,i,1) = "," then
				insertSQL = mid(SQL,1,i-1)
				exit for
			end if
		next
		'log "insertSQL", insertSQL
		me.beaconEx("DELETE FROM temp WHERE siteid > 0")
		me.beaconEx(insertSQL)
		me.beaconEx("CALL importTemp")
		me.execute(substitute("DELETE FROM queue WHERE folderID = {0}",ARRAY(folderID)))
	end sub
	
	private function parseRow(siteID, CSVrow)	'parse rows into VALUES sub-expression
		const sqlData   = "({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15},{16},{17},{18},{19},{20},{21},'{22}')"
		parseRow = substitute(sqlData, split(siteId & "," & CSVrow,","))
	end function

	public sub findFiles (sFolder, siteID)	'find files and subFolders
		const sqlUpdate = "UPDATE folder SET modified = '{1}', `count` = {2} WHERE id = {0}"
		dim f : set f = fs.getFolder(sFolder)

		dim rs : set rs = checkFolder(f)
		dim idFolder : idFolder = rs.fields.item(0)

		dim s
		for each s in f.subFolders
			findFiles s.path, siteID
		next

		dim dbDate 		: dbDate = dateValue(rs.fields.item("modified"))
		dim dbTime 		: dbTime = timeValue(rs.fields.item("modified"))
		dim drDateTime 	: drDateTime = f.dateLastModified
		dim drDate 		: drDate = dateValue(drDateTime)
		dim drTime 		: drTime = timeValue(drDateTime)
		dim drCount		: drCount = f.files.count

		if (drDate > dbDate) or (drDate = dbDate and drTime > dbTime) then
			dim idFile 
			set s = f.files
			for each f in s
				if lcase(right(f.name,4)) = ".csv" then _
					idFile = checkFile(idFolder, f, siteID).fields.item(0)
			next
			'update folder time and fileCount
			'displayText "Folder = "
			me.execute(substitute(sqlUpdate,ARRAY(rs.fields.item("id"),dbDateTime(drDateTime),drCount)))
		end if
	end sub

	public function checkFolder(oFolder)	' check if folder is newer
		const sqlSelect = "SELECT * FROM folder WHERE name = '{0}'"
		const sqlInsert = "INSERT INTO folder (name, modified,count) VALUES ('{0}','{1}','{2}')"

		dim rs : set rs = me.execute(substitute(sqlSelect,ARRAY(LCase(oFolder.path))))
		'displayText "Folder = " & oFolder.path
		'displayText "EOF = " & rs.EOF
		if rs.EOF then
			me.execute(substitute(sqlInsert,ARRAY(LCase(oFolder.path),dbDateTime(oFolder.dateLastModified),oFolder.files.count)))
			set rs = me.execute(substitute(sqlSelect,ARRAY(LCase(oFolder.path))))
		end if
		set checkFolder = rs
	end function

	public function checkFile(idFolder, oFile, siteID) 'check if file is newer
		const sqlSelect = "SELECT * FROM file WHERE idFolder = {0} and name = '{1}'"
		const sqlInsert = "INSERT INTO file (idFolder,name,modified,size,hash) VALUES ({0},'{1}','{2}',{3},{4})"
		dim rs : set rs = me.execute(substitute(sqlSelect,ARRAY(idFolder, LCase(oFile.name))))
		if rs.EOF then
			me.execute(substitute(sqlInsert,ARRAY(idFolder,LCase(oFile.name),dbDateTime(oFile.dateLastModified),oFile.size,0)))
			set rs = me.execute(substitute(sqlSelect,ARRAY(idFolder, LCase(oFile.name))))
			queueFile rs, oFile, siteID, idFolder
		else
			dim dbDate : dbDate = dateValue(rs.fields.item("modified"))
			dim dbTime : dbTime = timeValue(rs.fields.item("modified"))
			dim drDate : drDate = dateValue(oFile.dateLastModified)
			dim drTime : drTime = timeValue(oFile.dateLastModified)

			'displayText drTime & " " & dbTime
			if (drDate > dbDate) or (drDate = dbDate and drTime > dbTime) then
				queueFile rs, oFile, siteID, idFolder
			end if
		end if
		set checkFile = rs
	end function

	private function queueFile(rs, oFile, siteID, folderID) 'insert fileID into queue
		const sqlSelQueue   = "SELECT action FROM queue WHERE fileId = {0}"
		const sqlInsQueue   = "INSERT INTO queue (fileID, folderID, siteID, action) VALUES ({0},{1},'{2}','{3}')"
		const sqlUpdate  = "UPDATE file SET modified = '{1}', size = {2}, hash = '{3}' WHERE id = {0}"
		dim fileID : fileID = rs.fields.item("id")
		log "Queued", oFile.name
		if me.execute(substitute(sqlSelQueue,ARRAY(fileID))).EOF then
			set queueFile = me.execute(substitute(sqlInsQueue,ARRAY(fileID, folderID, siteID, "processFile")))
		end if
		me.execute(substitute(sqlUpdate,ARRAY(fileID,dbDateTime(oFile.dateLastModified),oFile.size,0)))
	end function

	public function dbDateTime(dt)	'format to yyyy-mm-dd hh:mm:ss
		dim d : d = dateValue(dt)
		dim t : t = timeValue(dt)
		dbDateTime = datePart("yyyy", d) & "-" _
		& datePad("m", d) & "-" _
		& datePad("d", d) & " " _
		& datePad("h", t) & ":" _
		& datePad("n", t) & ":" _
		& datePad("s", t)
	end function

	public function substitute(aString,paramsArray)	'replace text in aString with values from paramsArray
		dim i, s : s = aString
		for i = 0 to ubound(paramsArray)
		dim token : token = "{" & CStr(i) & "}"
		s = replace(s,token,paramsArray(i))
		next
		substitute = s
	end function

	public function lastInsert()	'return the id of the last insert
		dim rs : set rs = me.execute("select last_insert_rowid()")
		lastInsert = CInt(rs.fields.item(0))
	end function

	public function displayQueue()	'list the current queue
		me.execute("select * from queued order by siteID")
		if (recordset is nothing) or recordset.EOF then
			displayRecords = ""
		else
			dim insertSQL : insertSQL = ""
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
				insertSQL = insertSQL & line & vbcrlf
				recordset.moveNext
			wend
			displayQueue = insertSQL
		end if
	end function

	public function displayRecords()	'display the contents of recordset
		dim i : i = 0
		if (recordset is nothing) or recordset.EOF then
			displayRecords = ""
		else
			dim header : header = ""
			for i = 0 to recordset.fields.count - 1
				if i = 0 then
					header = recordset.fields.item(0).name
				else
					header = header & ", " & recordset.fields.item(0).name
				end if
			next
			
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
			displayRecords = header & vbcrlf & buffer
		end if
	end function

	private sub Log(title,value)	'log some text
		displayText right(space(18) & title & ": ", 20) & value
	end Sub

	private sub logBar()	'display bars
		displayText string(70,"=")
	end sub
	
	private Sub Assert(text)	'conditionally display text
		if debug then displayText "ASSERT: " & text
	end Sub
	
	private sub displayText(text) 'display text
		wscript.echo text
	end sub

	private function datePad(fmt,dt)	'pad to two digits
		datePad = zPad(datePart(fmt,dt),2)
	end function

	private function zPad(x,n)	'left pad zeros to n digits
		zPad = right(string(n,"0") & CStr(x),n)
	end function
end class