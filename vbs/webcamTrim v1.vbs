option explicit

const rootVDir = "O:\webcam\FI9805W_00626E52B984\record"
const rootPDir = "O:\webcam\FI9805W_00626E52B984\snap"
'	"alarm_20150105_132637.mkv"
'   "MDAlarm_20141211-162244.jpg"
'	"123456789012345678901234567890"
const vPattern	= "^alarm_\d{8}_\d{6}.mkv$"
const pPattern	= "^MDAlarm_\d{8}-\d{6}.jpg$"

dim fs		: set fs 	= createObject("scripting.filesystemObject")
dim fExpr	: set fExpr	= new regexp 
dim fDate	: set fDate = new fileDateObject
dim level	: level = 0

wscript.echo "    today = " & fDate.today
wscript.echo "  curWDay = " & fDate.curWDay
wscript.echo "last week = " & fDate.lastWeek
wscript.echo "  cut Off = " & fDate.cutOff

fExpr.pattern = vPattern
processVFiles rootVDir

fExpr.pattern = pPattern
processPFiles rootPDir

wscript.echo "Done"


private sub processPFiles (sourceDir)
	dim f, folderName
	dim folder	: set folder = fs.getFolder(sourceDir)

	for each f in folder.files
		if fExpr.test(f.name) then
			folderName = getFolderName(f.name, 9)
			if folderName <= fDate.cutOff then
				wscript.echo "delete file " & f.path
				fs.deleteFile f.path
			end if
		end if
	next
end sub

private sub processVFiles (sourceDir)
	dim d, f, folderName
	dim folder	: set folder = fs.getFolder(sourceDir)
	
	level = level + 1
	for each d in folder.subFolders
		processVFiles d
	next

	if folder.files.count = 0 then
		if level > 1 then
			wscript.echo "delete folder " & folder.path
			fs.deleteFolder folder.path
		end if
	else
		for each f in folder.files
			if fExpr.test(f.name) then
				folderName = getFolderName(f.name, 7)
				if folderName <= fDate.cutOff then
					wscript.echo "delete file " & f.path
					fs.deleteFile f.path
				elseIf level = 1 then
					folderName = rootVDir & "\" & folderName
					checkFolder folderName
					wscript.echo "move to " & folderName 
					fs.moveFile f.path, folderName & "\" & f.name
				end if
			end if
		next
	end if
	level = level - 1
end sub

class fileDateObject
	public today
	public lastWeek
	public curWDay
	public cutOff
	
	private sub class_Initialize()
		today 		= date
		curWDay		= datePart("w", today)-1
		'lastWeek 	= dateAdd("d",-28 -curWDay,today)
		lastWeek 	= dateAdd("d",-28, today)
		cutOff		= datePart("yyyy",lastWeek) _
					& right("0" & datePart("m",lastWeek),2) _
					& right("0" & datePart("d",lastWeek),2)
	end sub
	
	private sub class_Terminate()

	end sub
end class

''' create sub-folders if necessary
private sub checkFolder (folderName)
	if not fs.folderExists(folderName) then
		checkFolder fs.getParentFolderName(folderName)
		wscript.echo "CREATE DIRECTORY " & folderName
		fs.createFolder(folderName)
	end if
end sub

private function getFolderName(filename,s)
	getFolderName = mid(filename,s,8)
end function