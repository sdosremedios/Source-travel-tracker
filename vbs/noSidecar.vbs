option explicit
' noSidecar	6 Jan 2013
'
' Remove sidecar .jpg files for raw images .nef and .cr2
'
dim folderList 		: folderList	= Array("C:\Users\Public\Pictures","D:\My Pictures","V:\Backup\Pictures","W:\Backup\My Pictures")
dim fs				: set fs		= createObject("scripting.filesystemObject")
dim rootFolder

for each rootFolder in folderList
	processFolder fs.getFolder(rootFolder)
next

sub processFolder (folderName)
	dim d, f, p, e
	for each d in fs.getFolder(folderName).subFolders
		wscript.echo d
		processFolder d
	next
	for each f in fs.getFolder(folderName).files
		p = lCase(f.path)
		e = "." & fs.getExtensionName(p)
		select case e
		case ".dng", ".tif", ".arw", ".nef", ".cr2", ".rw2", ".psd"
			removeSidecar lCase(f.path), e
		end select
	next
end sub

sub removeSidecar(p,ext)
	dim n
	n = replace(p,ext,".jpg")
	if fs.fileExists(n) then
		wscript.echo "> " & n
		fs.deleteFile n
	end if

	exit sub
	
	n = replace(p,ext,".hdr")
	if fs.fileExists(n) then
		wscript.echo "> " & n
		fs.deleteFile n
	end if
end sub