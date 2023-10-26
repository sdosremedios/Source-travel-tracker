option explicit
' backupPhotos	6 Jan 2013
'
' Copy files for raw images .nef, .dng, .tif and .cr2 
'

'const rootDir		= "c:\users\public\pictures\"
const rootDir 		= "d:\my pictures\"

const targetDir 	= "p:\backup\my pictures\" 

dim fs		: set fs = createObject("scripting.filesystemObject")
dim root	: set root = fs.getFolder(rootDir)
processFolder root

sub processFolder (folderName)
	dim d, f, p, e
	for each d in fs.getFolder(folderName).subFolders
		'if lCase(left(d,24)) = skipFolder then exit for
		wscript.echo d
		processFolder d
	next
	for each f in fs.getFolder(folderName).files
		p = lCase(f.path)
		e = lCase("." & fs.getExtensionName(p))
		select case e
		'case ".jpg", ".arw", ".psd", ".cr2", ".nef", ".rw2", ".tif", ".dng"	' all file types
		case ".arw", ".psd", ".cr2", ".nef", ".rw2", ".tif", ".dng"				' no .jpg files
		'case ".tif", ".psd"											' only work product
			copyFile p, e
		end select
	next
end sub

sub copyFile(p,ext)
	dim n : n = replace(p,rootDir,targetDir,1,1,1)
	'wscript.echo n
	
	if not fs.fileExists(n) then
		on error resume next
		err.number = 0
		createDir fs.getParentFolderName(n)
		wscript.echo "  > " & n
		fs.copyFile p, n
		if err.number > 0 then
			wscript.echo "  *** Copy Error " & err.number & ". " & err.description & ". File " & n
		end if
		on error goto 0
	end if
end sub

sub createDir (d)
	'wscript.echo " Checking " & d
	if d = "" or fs.folderExists(d) then exit sub

	createDir fs.getParentFolderName(d)
	wscript.echo " Creating " & d
	fs.createFolder(d)
end sub