option explicit

const rootVDir = "O:\webcam\FI9805W_00626E52B984\record"
const rootPDir = "O:\webcam\FI9805W_00626E52B984\snap"

'	"alarm_20150105_132637.mkv"
'   "MDAlarm_20141211-162244.jpg"
'	"123456789012345678901234567890"

dim fileDate : set fileDate = new fileDateObject
fileDate.interval = 28

wscript.echo "    today = " & fileDate.today
wscript.echo "  curWDay = " & fileDate.curWDay
wscript.echo "last week = " & fileDate.lastWeek
wscript.echo "  cut Off = " & fileDate.cutOff

fileDate.processVideos rootVDir
fileDate.processPhotos rootPDir


class fileDateObject
	public today
	public lastWeek
	public curWDay
	public cutOff
	public interval
	
	private fs
	private fExpr
	private rootDir
	
	private sub class_Initialize()
		set fs 		= createObject("scripting.filesystemObject")	
		set fExpr	= new regexp 
		today 		= date
		curWDay		= datePart("w", today)-1
		'lastWeek 	= dateAdd("d",-interval -curWDay,today)
		lastWeek 	= dateAdd("d",-interval, today)
		cutOff		= datePart("yyyy",lastWeek) _
					& right("0" & datePart("m",lastWeek),2) _
					& right("0" & datePart("d",lastWeek),2)
		rootDir		= ""
		interval	= 7
	end sub
	
	private sub class_Terminate()
		set fExpr	= nothing
		set fs		= nothing
		wscript.echo "Done"
	end sub

	public sub processVideos (sourceDir)
		rootDir = sourceDir
		processFiles sourceDir, "^alarm_\d{8}_\d{6}.mkv$", 7
	end sub

	public sub processPhotos (sourceDir)
		rootDir = sourceDir
		processFiles sourceDir, "^MDAlarm_\d{8}-\d{6}.jpg$", 9
	end sub

	public sub processFiles (sourceDir, pattern, offset)
		dim d, f, folderName
		dim folder	: set folder = fs.getFolder(sourceDir)

		fExpr.pattern = pattern
		for each f in folder.files
			if fExpr.test(f.name) then
				folderName = rootDir & "\" & getFolderName(f.name, offset)
				checkFolder folderName
				wscript.echo "move to " & folderName 
				fs.moveFile f.path, folderName & "\" & f.name
			end if
		next
		
		for each d in folder.subFolders
			if d.name < cutOff then
				wscript.echo "delete folder " & f.path
				fs.deleteFolder d.path
			end if
		next
		set folder = nothing
	end sub

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
end class
