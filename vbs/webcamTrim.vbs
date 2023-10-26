''' webcamTrim v2.0 25-Jan-2018 
''' (c) Steven dosRemedios
'''
option explicit 
'const rootVDir = "\\rt-n65r\media\webcam\FI9805W_00626E52B984\record"
'const rootPDir = "\\rt-n65r\media\webcam\FI9805W_00626E52B984\snap"
const rootVDir = "\\192.168.3.101\webcam\FI9805W_00626E52B984\record"
const rootPDir = "\\192.168.3.101\webcam\FI9805W_00626E52B984\snap"

'	"alarm_20150105_132637.mkv"
'   "MDAlarm_20141211-162244.jpg"
'	"123456789012345678901234567890"

dim fileDate : set fileDate = new fileDateObject
wscript.echo "    today = " & fileDate.today
wscript.echo "   oldest = " & fileDate.oldest
wscript.echo "  cut Off = " & fileDate.cutOff

fileDate.processVideos rootVDir
set fileDate = nothing

set fileDate = new fileDateObject
wscript.echo "    today = " & fileDate.today
wscript.echo "   oldest = " & fileDate.oldest
wscript.echo "  cut Off = " & fileDate.cutOff

fileDate.processPhotos rootPDir
set fileDate = nothing

class fileDateObject
	public today
	public oldest
	public curWDay
	public cutOff
	
	private fs
	private fExpr
	private rootDir
	private interval
	
	private sub class_Initialize()
		set fs 		= createObject("scripting.filesystemObject")	
		set fExpr	= new regexp 
		interval	= 28
		today 		= date
		curWDay		= datePart("w", today)-1
		oldest		= dateAdd("d",-interval, today)
		cutOff		= datePart("yyyy",oldest) _
					& right("0" & datePart("m",oldest),2) _
					& right("0" & datePart("d",oldest),2)
		rootDir		= ""
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

	private sub processFiles (sourceDir, pattern, offset)
		dim d, f, folderName
		dim folder	: set folder = fs.getFolder(sourceDir)

		fExpr.pattern = pattern
		for each f in folder.files
			if fExpr.test(f.name) then	'move the file to its day folder
				folderName = rootDir & "\" & getFolderName(f.name, offset)
				checkFolder folderName	'create folder if it doesn't exist
				on error resume next
				wscript.echo "move " & f.name 
				fs.moveFile f.path, folderName & "\" & f.name
			end if
		next
		
		for each d in folder.subFolders
			if d.name < cutOff then
				wscript.echo "delete folder " & d.path
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
