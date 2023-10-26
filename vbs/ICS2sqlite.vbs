option explicit
'==============================================================================
'	ICS2sqlite	2017-02-19 Steven dosRemedios
'
'	Usage:
'		ICS2sqlite /ics:ics_filename /table:table_name
'==============================================================================
dim lib : set lib = new vbsLib
	lib.debug = false

dim ics : set ics = new icsObject

'==============================================================================
'	icsObject class definition
'==============================================================================
class icsObject
	private re, tz
	private connString, table
	public dbLite
	public args
	private sub class_Initialize()
		lib.displayHeader "ICS2sqlite - v0.0.1 - 08 Feb 2017"

		set args = wscript.arguments.named
		set dbLite = CreateObject( "ADODB.Connection" )
		set re = new regExp
		re.pattern = "^([A-Z\-]+)[:;]"
		connString = "Driver={SQLite3 ODBC Driver}; Database={0}"
		me.openDB "D:\bin\data\ICS2sqlite.db"
		table = me.tableName
		clearTable
		readICS
	end sub
	private sub class_Terminate()
		dbLite.close
		set dbLite = nothing
		set args = nothing
	end sub
	
	public sub openDB(database)	'open database
		if dbLite.state = 1 then dbLite.close()
		dbLite.open lib.substitute(connString,ARRAY(database))
		
		lib.displayLog "Open database ", database
	end sub

	public function execute(SQL)	'execute a query
		if dbLite.state = 1 then
			lib.ASSERT "Execute", SQL
			dim rs : set rs = dbLite.execute(SQL)
			if rs is nothing then displayLog "SQL execute error", "No recordset returned"
		else
			set rs = nothing
		end if
		set execute = rs
	end function
	
	public sub clearTable()
		execute lib.substitute("DROP TABLE `{0}`",ARRAY(table))
		execute "vacuum"
		execute lib.substitute(lib.getFileText("ICS2sqlite.sql"),ARRAY(table))
	end sub

	private sub readICS()
		dim buffer
		dim tf : set tf = lib.fs.openTextFile(me.icsFile)
		lib.ASSERT "atEndOfStream", tf.atEndOfStream
		do until tf.atEndOfStream
			buffer = tf.readLine
			if buffer = "BEGIN:VEVENT" then doEvent tf
		loop
	end sub
	private sub doEvent(tf)
		dim matches, match, text
		dim calEvent : set calEvent = new eventObject
		calEvent.tableName = table
		dim buffer : buffer = tf.readLine
		if lib.debug then lib.displayBars
		match = ""
		do until buffer = "END:VEVENT" or tf.atEndOfStream
			set matches = re.execute(buffer)
			if matches.count > 0 then
				match = matches(0).subMatches(0)
				'lib.displayLog "subMatch", match
				text = mid(buffer,len(match)+2)
				select case match
				case "DTSTART"
					calEvent.DTSTART = text
				case "DTEND"
					calEvent.DTEND = text
				case "LOCATION"
					calEvent.LOCATION = text
				case "DESCRIPTION"
					calEvent.DESCRIPTION = text
				case "SUMMARY"
					calEvent.SUMMARY = text
				case "ORGANIZER"
					calEvent.ORGANIZER = text
				case "ATTENDEE"
					calEvent.ATTENDEE = text
				case "BEGIN"
					do until left(buffer,4) = "END:"
						buffer = tf.readLine
					loop
				end select
			else
				select case match
				case "DESCRIPTION"
					calEvent.DESCRIPTION = buffer
				case "ORGANIZER"
					calEvent.ORGANIZER = buffer
				case "ATTENDEE"
					calEvent.ATTENDEE = buffer
				end select
			end if
			buffer = tf.readLine
		loop
		lib.displayLog calEvent.DTSTART, calEvent.SUMMARY
		lib.ASSERT "SQL INSERT", calEvent.insertSQL
		execute calEvent.insertSQL	'insert an event record
	end sub

	public property GET arg(i)
		arg = me.args(i)
	end property

	public property GET icsFile()
		const fileName = "M:\LimaDocs\Personal\eMail\sdosremedios@gmail.com.ics"
		lib.ASSERT "args.length", args.length
		if args.length = 0 then
			icsFile = fileName
		else
			icsFile = me.args("ics")
		end if
		if icsFile = "" then err.raise 1,"Missing .ics file","Usage: ICS2sqlite /ics:filename"
		lib.displayLog "icsFile",icsFile
	end property

	public property GET tableName()
		const table = "event"
		if args.length = 0 then
			tableName = table
		else
			tableName = me.args("table")
		end if
		lib.displayLog "tableName",tableName
	end property
end class
'==============================================================================
'	eventObject class definition
'==============================================================================
class eventObject
	public m_DTSTART
	public m_TZSTART
	public m_DTEND
	public m_TZEND
	public m_SUMMARY
	public m_LOCATION
	public m_ORGANIZER
	public m_ATTENDEE
	public m_DESCRIPTION
	public tz, tableName
	
	private sub class_Initialize()
		m_DTSTART	= ""
		m_TZSTART	= ""
		m_DTEND		= ""
		m_TZEND		= ""
		m_SUMMARY	= ""
		m_LOCATION	= ""
		m_ORGANIZER	= ""
		m_ATTENDEE	= ""
		m_DESCRIPTION= ""
		tz 			= -8
		tableName	= "event"
	end sub
	
	private sub class_Terminate()
	
	end sub
	
	public property LET DTSTART(aValue)
		m_DTSTART = aValue
		dim re : set re = new regExp
		re.pattern = "((^\d{8}T\d{6})Z$)|(^TZID=([A-z_/]+):(\d{8}T\d{6}$))|(^VALUE=DATE:(\d{8}$))"
		dim matches : set matches = re.execute(aValue)
		if matches.count > 0 then
			m_TZSTART = matches(0).subMatches(3)
		end if
	end property
	
	public property GET DTSTART()
		DTSTART = dbTime(m_DTSTART, tz)
	end property
	
	public property LET TZSTART(aValue)
		m_TZSTART = aValue
	end property
	
	public property GET TZSTART()
		TZSTART = unQuote(m_TZSTART)
	end property
	
	public property LET DTEND(aValue)
		m_DTEND = aValue
		dim re : set re = new regExp
		re.pattern = "((^\d{8}T\d{6})Z$)|(^TZID=([A-z_/]+):(\d{8}T\d{6}$))|(^VALUE=DATE:(\d{8}$))"
		dim matches : set matches = re.execute(aValue)
		if matches.count > 0 then
			m_TZEND = matches(0).subMatches(3)
		end if
	end property
	
	public property GET DTEND()
		DTEND = dbTime(m_DTEND, tz)
	end property
	
	public property LET TZEND(aValue)
		m_TZEND = aValue
	end property
	
	public property GET TZEND()
		TZEND = unQuote(m_TZEND)
	end property
	
	public property LET SUMMARY(aValue)
		m_SUMMARY = aValue
	end property
	
	public property GET SUMMARY()
		SUMMARY = unQuote(m_SUMMARY)
	end property
	
	public property LET LOCATION(aValue)
		m_LOCATION = aValue
	end property
	
	public property GET LOCATION()
		LOCATION = unQuote(m_LOCATION)
	end property
	
	public property LET ORGANIZER(aValue)
		m_ORGANIZER = aValue
	end property
	
	public property GET ORGANIZER()
		ORGANIZER = unQuote(eMail(m_ORGANIZER))
	end property
	
	public property LET ATTENDEE(aValue)
		if m_ATTENDEE = "" then
			m_ATTENDEE = aValue
		else
			m_ATTENDEE = m_ATTENDEE & ";" & mid(aValue,2)
		end if
	end property
	
	public property GET ATTENDEE()
		ATTENDEE = unQuote(eMail(m_ATTENDEE))
	end property
	
	public property LET DESCRIPTION(aValue)
		if m_DESCRIPTION = "" then
			m_DESCRIPTION = aValue
		else
			m_DESCRIPTION = m_DESCRIPTION & mid(aValue,2)
		end if
	end property
	
	public property GET DESCRIPTION()
		DESCRIPTION = unQuote(m_DESCRIPTION)
	end property
	
	public property GET calEvent()
		lib.displayLog "DTSTART", DTSTART
		lib.displayLog "TZSTART", TZSTART
		lib.displayLog "DTEND", DTEND
		lib.displayLog "TZEND", TZEND
		lib.displayLog "SUMMARY", SUMMARY
		lib.displayLog "LOCATION", LOCATION
		lib.displayLog "ORGANIZER", ORGANIZER
		lib.displayLog "ATTENDEE", ATTENDEE
		lib.displayLog "DESCRIPTION", DESCRIPTION
		set calEvent = me
	end property
	
	public property GET insertSQL()
		const sql = "INSERT INTO `{0}` (evStart, tzStart, evEnd, tzEnd, Summary, Location, Organizer, Attendee, Description) VALUES ('{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}', '{9}')"
		insertSQL = lib.substitute(sql,ARRAY(tableName, DTSTART, TZSTART, DTEND, TZEND, SUMMARY, LOCATION, ORGANIZER, ATTENDEE, DESCRIPTION))
	end property

	private function dbTime(Z,offset)
		dim d : d = zulu(Z, offset)
		dim t : t = lib.Z2(hour(d)) & ":" & lib.Z2(minute(d)) & ":" & lib.Z2(second(d))
		dbTime = lib.Z4(year(d)) & "-" & lib.Z2(month(d)) & "-" & lib.Z2(Day(d)) & " " & t
	end function
	
	private function zulu(X, offset)
	'	lib.displayLog "zulu Z", X
	'	20170205T152456Z
	'	TZID=America/Los_Angeles:20170204T093000
	'	VALUE=DATE:20111216
		dim i, Z : Z = X
		dim add : add = 0
		dim re : set re = new regExp
		re.pattern = "((^\d{8}T\d{6})Z$)|(^TZID=([A-z_/]+):(\d{8}T\d{6}$))|(^VALUE=DATE:(\d{8}$))"
		dim matches : set matches = re.execute(Z)
		if matches.count > 0 then
			with matches(0)
				for i = 0 to .subMatches.count - 1
					select case i
						case 0	'Zulu time
						case 1	'Zulu time (short)
							if .subMatches(i) > "" then
								Z = .subMatches(i)
								add = offset
								exit for
							end if
						case 3	'Timezone text
						case 4	'Timezone time
							if .subMatches(i) > "" then
								Z = .subMatches(i)
								exit for
							end if
						case 5	'VALUE=...
						case 6	'VALUE date
							if .subMatches(i) > "" then
								Z = .subMatches(i) & "T000000"
								exit for
							end if
					end select
				next
			end with
		'	Z = matches(0).subMatches(0)
		'	if len(Z) = 0 then Z = matches(0).subMatches(4)
		'	if len(Z) = 0 then Z = matches(0).subMatches(6)
		'	if len(Z) = 8 then Z = Z & "T000000"
			if lib.debug then
				lib.displayLog "zulu date subMatch 0", matches(0).subMatches(0)
				lib.displayLog "zulu date subMatch 1", matches(0).subMatches(1)
				lib.displayLog "zulu date subMatch 2", matches(0).subMatches(2)
				lib.displayLog "zulu date subMatch 3", matches(0).subMatches(3)
				lib.displayLog "zulu date subMatch 4", matches(0).subMatches(4)
				lib.displayLog "zulu date subMatch 5", matches(0).subMatches(5)
				lib.displayLog "zulu date subMatch 6", matches(0).subMatches(6)
				lib.displayLog "zulu", Z
			end if
		else
			zulu = now
			exit function
		end if
		
		dim m : m = mid(Z,5,2)
		dim d : d = mid(Z,7,2)
		dim y : y = mid(Z,1,4)
		dim h : h = mid(Z,10,2)
		dim n : n = mid(Z,12,2)
		dim s : s = mid(Z,14,2)
		dim a
		
		select case CInt(h)
		case 12
			a = " PM"
		case 13,14,15,16,17,18,19,20,21,22,23
			a = " PM"
			h = h - 12
		case else
			a = " AM"
		end select
		
		zulu = dateAdd("h",add,CDate(m & "/" & d & "/" & y & " " & h & ":" & n & ":" & s & a))
		
	end function
	
	private function eMail(X)
		dim re : set re = new regExp
		re.pattern = "mailto:(([\w-]+\.)*[\w-]+@([\w-]+\.)+[a-z]{2,4})[;:]?"
		re.global = true
		dim matches : set matches = re.execute(X)
		dim m
		eMail = ""
		if matches.count > 0 then
			for each m in matches
				if eMail = "" then eMail = m.subMatches(0) else eMail = eMail & "; " & m.subMatches(0)
			next
		end if
	end function
		
	private function unQuote(text)
		dim t
		t = replace(text,"\,",",")
		t = replace(t,"\;",";")
		unQuote = replace(t,"'","''")
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