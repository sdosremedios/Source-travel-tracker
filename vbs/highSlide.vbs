' Generate Highslide links from files
option explicit
const templateFilename = "C:\bin\highSlide-Template.txt"
const imageFolder = "C:\inetpub\meetThere\Portals\0\Images"
'const fileExpr = "^2013-?\d{2}-?\d{2}.*\.jpg$"
const fileExpr = "^2013\d{2}\d{2}-\d{2}\.jpg$"

dim obj, f, html : set obj = new imagesObject
for each f in obj.files
	if obj.regEx.test(f.name) then 
		html = replace(obj.text,"{0}",f.name)
		wscript.echo html
	end if
next

class imagesObject
	dim fs
	public regEx
	public files
	public text
	sub Class_Initialize
		set fs = CreateObject("Scripting.FileSystemObject")
		set regEx = new regExp
		regEx.pattern = fileExpr
		set files = fs.getFolder(imageFolder).files
		text = fs.openTextFile(templateFilename).readAll()
	end sub
	
	sub Class_Terminate
		set regEx = nothing
		set fs = nothing
	end sub

end class