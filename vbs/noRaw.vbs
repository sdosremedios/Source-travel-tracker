option explicit
' noSidecar	6 Jan 2013
'
' Remove raw files matching .dng names
'
dim fList 		: fList 	= Array("C:\Users\Public\Pictures","D:\My Pictures","V:\Backup\Pictures","W:\Backup\My Pictures")
dim rawList		: rawList	= Array(".nef",".rw2",".cr2",".arw")

dim fs			: set fs	= createObject("scripting.filesystemObject")
dim rootFolder

for each rootFolder in fList
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
		e = fs.getExtensionName(p)
		select case e
		case "dng"
			removeRaw lCase(f.path), e
		end select
	next
end sub

sub removeRaw(p,ext)
	dim n, e, other
	e = "." & ext
	for each other in rawList
		n = replace(p,e,other)
		'wscript.echo "Checking for > " & n
		if fs.fileExists(n) then
			wscript.echo "> " & n
			fs.deleteFile n
		end if
	next
end sub