' Generate portrait xml data from images in a folder
' 
' cscript D:\Data\Nextcloud\Source\vbs\genPortraits.vbs <ImageFolderPath> "W:\travelshot\docs\data\portraits.xml"

' "C:\Data\portableApps\exiftool\exiftool.exe" -X -XMP:Title -XMP:Description -FileName "W:\travelshot\docs\images\portraits" > "W:\travelshot\docs\data\portraits.xml"
'
' Example:  
'   cscript D:\Data\Nextcloud\Source\vbs\genPortraits.vbs "W:\travelshot\docs\images\portraits" "W:\travelshot\docs\data\portraits.xml"
' Requires exiftool: 
'   "C:\Program Files\PhotomatixPro6\exiftool.exe"
'==============================================================================
Option Explicit

dim exifObj
set exifObj = new exifObject
exifObj.runExiftool()
wscript.quit 0

'==============================================================================
'	exifObject definition
'==============================================================================
class exifObject
    private objFSO, objFolder, objXMLDoc, objRoot
	private letValue
	private objValue
	private propValue
	public args
    Dim strFolderPath, strXMLPath, strExifTool, strExifOverride
	private sub class_Initialize()
        strExifTool = "C:\Program Files\PhotomatixPro6\exiftool.exe"
		set args = wscript.arguments
        if args.count < 2 then
            display "Usage: cscript genPortraits.vbs <ImageFolderPath> <OutputXMLPath> [ExifOverrideParameters]"
            wscript.quit 1
        end if
        strFolderPath = args(0)
        strXMLPath = args(1)
        if args.count >= 3 then
            strExifOverride = args(2)
        else
            strExifOverride = ""
        end if

        Set objFSO = CreateObject("Scripting.FileSystemObject")
        Set objFolder = objFSO.GetFolder(strFolderPath)
        Set objXMLDoc = CreateObject("Msxml2.DOMDocument.6.0") 

        objXMLDoc.AppendChild objXMLDoc.CreateProcessingInstruction("xml", "version='1.0' encoding='UTF-8'")
        Set objRoot = objXMLDoc.CreateElement("Portraits")
        objXMLDoc.AppendChild objRoot   
	end sub
	private sub class_Terminate()
		set args = nothing
        Set objRoot = Nothing
        Set objXMLDoc = Nothing
        Set objFolder = Nothing
        Set objFSO = Nothing
	end sub
    public sub runExiftool()
        Dim shell, command, output, exec, template
'       template = "-X -XMP:Title -XMP:Description -FileName -DateTimeOriginal" ' XML parameters
        if strExifOverride <> "" then
            template = strExifOverride
        else
            template = "-X -ImageDataHash -imageHashType MD5 -XMP:Title -XMP:Description -FileName -DateTimeOriginal" ' XML parameters
        end if
        Set shell = CreateObject("WScript.Shell")
        command = "cmd.exe /c exiftool.exe " & template & " """ & strFolderPath & """ > """ & strXMLPath & """"
        display "Running command: " & command
        shell.Run command, 0, True
        WScript.Echo "Portrait XML data generated at: " & strXMLPath
        Set shell = Nothing
    end sub
	private sub Log(name, text)
		display right(space(20) & name, 20) & ": " & text
	end sub
	private sub display(text)
		wscript.echo text
	end sub
end class
