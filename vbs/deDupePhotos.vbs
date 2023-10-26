option explicit
' deDupePhotos	25 Sep 2016
'
' Delete duplicate files for raw images .nef, .dng, .tif, .arw and .cr2 
'
const backupFolder 	= "T:\smdr\Drive\Backup"
const localFolder	= "G:\Pictures"
const testFolder	= "D:\SdosRemedios\My Pictures\2015"
dim obj : set obj = new decimateObject

'obj.rootFolder	= testFolder
'obj.rootFolder	= localFolder
obj.rootFolder	= backupFolder

class decimateObject
	private fs
	private ts
	private sLogfile
	private nFiles
	private nFolders
	private nDeleted
	private nBytes
	private	DEBUG

	sub class_Initialize()
		DEBUG		= false
		set fs 		= createObject("scripting.filesystemObject")
		set ts 		= fs.createTextFile(".\deDupePhotos.log", true)
		nfiles 		= 0
		nFolders 	= 0
		nDeleted 	= 0
		nBytes		= 0
		sLogfile	= ""
		displaySection "Decimating"
		displayLog "Start " & Now()
	end sub

	sub class_Terminate()
		displayLog "Stop " & Now()
		displaySection "Finished"
		displayLog nFolders & " folders and  " & nFiles & " files processed"
		displayLog nDeleted & " duplicate files deleted"
		displayLog nBytes   & " bytes recovered"
		ts.close
		
		set ts = nothing
		set fs = nothing
	end sub
	
	public property let rootFolder (folderName)
		processFolder folderName
	end property

	private sub processFolder (folderName)
		dim d, f, e
		nFolders = nFolders + 1
		for each d in fs.getFolder(folderName).subFolders
			'wscript.echo fs.getBaseName(d)
			if UCase(fs.getBaseName(d)) <> "LIGHTROOM" then processFolder d
		next
		set d = fs.getFolder(folderName)	' get folder object
		nFiles = nfiles + d.files.count
		display d.path
		
		''' if this is a panorama folder, remove .jpg files
'		if lCase(d.name) = "panorama" then
'			for each f in d.files
'				if lCase(fs.getExtensionName(f.path)) = "jpg" then
'					deleteFile f
'				end if
'			next
'		else
			for each f in d.files
				e = lCase("." & fs.getExtensionName(f.path))
'				select case e
'				case ".dng", ".tif", ".arw", ".nef", ".rw2", ".cr2", ".psd", ".jpg"
'					checkFile f, e
'				end select
				select case e
				case ".arw", ".nef", ".rw2", ".cr2"	' raw files ONLY no .dng
					checkRAW f, e	'check for redundant .jpg and if .dng exists, remove the raw file
				end select
			next
'		end if
	end sub
	
	private sub deleteFile(oFile)
		nDeleted 	= nDeleted + 1
		nBytes		= nBytes + oFile.size
		displayLog oFile.path
		if not DEBUG then fs.deleteFile oFile.path
	end sub

	private sub checkRAW(f, ext)
		' assumes that the extension appears only once in the entire path
		dim n : n = replace(lCase(f.path), ext, ".jpg")	' replace extension with .jpg
		if fs.fileExists(n) then
			deleteFile fs.getFile(n)					' remove redundant .jpg file
		end if
'		n = replace(lCase(f.path), ext, ".dng") 		' replace extension with .dng
'		if fs.fileExists(n) then
'			deleteFile f								' have a .dng, remove this file
'		end if
	end sub

	private sub checkFile(f,ext)
		dim n : n = replace(f.path, ext, "") ' remove extension
		dim d : d = n & "-2" & ext
		if fs.fileExists(d) then
			set d = fs.getFile(d)
			if f.size = d.size then
				deleteFile d
			end if
		end if
	end sub

	private sub displaySection(text)
		displayLog string(60,"=")
		displayLog text
		displayLog string(60,"=")
	end sub

	private sub displayLog(text)
		ts.writeLine text
		display text
	end sub

	private sub display(text)
		wscript.echo text
	end sub
end class
