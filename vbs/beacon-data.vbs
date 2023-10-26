option explicit
' consolidate .csv files
const rootDir = "C:\Users\Public\Documents\BEACON\sensor_data\"
const dataFile = "sensor.csv"

dim fs : set fs = createObject("scripting.filesystemobject")

dim root : set root = fs.GetFolder(rootDir)
dim d, f, site
dim outFile : set outFile = fs.OpenTextFile(rootDir & dataFile,2,true)
for each d in root.subFolders
	wscript.echo d.path
	site = d.name
	for each f in d.files
		wscript.echo f.path
		outFile.write getSiteData (site, f.path)
	next
next
outFile.close()

'==============================================================================
function getSiteData (site, filename)
	dim fields
	dim buffer : buffer = ""
	dim inFile : set inFile = fs.openTextFile(filename,1)
	while not inFile.atEndOfStream
		dim text : text = inFile.readLine
		fields = split(text,",")
		'wscript.echo "field count = " & ubound(fields)
		if ubound(fields) = 9 then buffer = buffer & buildRow(site,fields)
	wend
	inFile.close()
	getSiteData = buffer
end function

'==============================================================================
function buildRow(site,fields)
	dim text : text = site & ","
	dim i
	for i = 0 to ubound(fields)
		select case i
		case 0,1,2,3,4,5,6,7,8
			text = text & fields(i) & ","
		case 9
			dim d : d = fields(i)
			text = text & mid(d,7,4) & "-" & mid(d,1,5) & mid(d,11)
		end select
		buildRow = text & vbcrlf
	next
end function