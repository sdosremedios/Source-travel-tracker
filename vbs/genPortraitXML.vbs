' Generate portrait xml data from images in a folder
' 
' cscript D:\Data\Nextcloud\Source\vbs\genPortraitXML.vbs <ImageFolderPath> "W:\travelshot\docs\data\portraits.xslt" "W:\travelshot\docs\data\portraits.xml"

' "C:\Data\portableApps\exiftool\exiftool.exe" -X -XMP:Title -XMP:Description -FileName "W:\travelshot\docs\images\portraits" > "W:\travelshot\docs\data\portraits.xml"
'
' Example:  
'   cscript D:\Data\Nextcloud\Source\vbs\genPortraitXML.vbs "W:\travelshot\docs\images\portraits" "W:\travelshot\docs\data\portraits.xslt" "W:\travelshot\docs\data\portraits.xml"
' Requires exiftool: 
'   "C:\Program Files\PhotomatixPro6\exiftool.exe"
'==============================================================================
Option Explicit

Dim exifObj
Set exifObj = New exifObject
exifObj.getXML()
wscript.quit 0

'==============================================================================
'	exifObject definition
'==============================================================================
Class exifObject
	Private objFSO, objFolder, objXMLDoc, objRoot
	Private letValue
	Private objValue
	Private propValue
	Public args
	Dim strFolderPath, strXMLPath, strXSLPath, strExifTool, strExifOverride
	Private Sub class_Initialize()
		strExifTool = "C:\Program Files\PhotomatixPro6\exiftool.exe"
		Set args = wscript.arguments
		If args.count < 1 Then
			display "Usage: cscript genPortraitXML.vbs <ImageFolderPath> [OutputXSLPath] [OutputXMLPath] [ExiftoolOverrideParameters]"
			wscript.quit 1
		End If
		strFolderPath = args(0)
		set objFSO = CreateObject("Scripting.FileSystemObject")
		If Not objFSO.FolderExists(strFolderPath) Then
			display "Error: Folder does not exist: " & strFolderPath
			wscript.quit 1
		End If
		If args.count > 1 Then
			strXSLPath = args(1)
		Else
			strXSLPath = "D:\Data\Nextcloud\Source\vbs\xml\keywords.xslt"
		End If
		if not objFSO.FileExists(strXSLPath) then
			display "Error: XSL file does not exist: " & strXSLPath
			wscript.quit 1
		End If
		If args.count > 2 Then
			strXMLPath = args(2)
		Else
			strXMLPath = "W:\travelshot\docs\data\portraits.xml"
		End If
		if not objFSO.FileExists(strXMLPath) then
			display "Error: Output file does not exist: " & strXMLPath
			wscript.quit 1
		End If
		If args.count > 3 Then
			strExifOverride = args(3)
		Else
			strExifOverride = ""
		End If

	End Sub
	Private Sub class_Terminate()
		Set args = Nothing
	End Sub

	Public Sub getXML()
        Dim fso, sh, execObj, xmlOutput, xmlDoc, xslDoc, xmlRoot, template, command, result, outfile

        '--- Create XML Output document ---
		Set xmlOutput = CreateObject("Msxml2.DOMDocument.6.0")
		xmlOutput.AppendChild xmlOutput.CreateProcessingInstruction("xml", "version='1.0' encoding='UTF-8'")
		Set xmlRoot = xmlOutput.CreateElement("Images")
		xmlOutput.AppendChild xmlRoot

		If strExifOverride <> "" Then
			template = strExifOverride
		Else
			template = "-X -ImageDataHash -imageHashType MD5 -XMP:Title -XMP:Description -XMP:Subject -FileName -DateTimeOriginal" ' XML parameters
		End If
		command = "cmd.exe /c exiftool.exe " & template & " """ & strFolderPath & """"

		'--- Run ExifTool and capture XML output ---
		display "Running command: " & command
		Set sh = CreateObject("WScript.Shell")
		Set execObj = sh.Exec(command)

		'xmlText = execObj.StdOut.ReadAll()

		'--- Load into MSXML DOMDocument ---
		Set xmlDoc = CreateObject("MSXML2.DOMDocument.6.0")
		xmlDoc.async = False
		xmlDoc.validateOnParse = False

		If Not xmlDoc.loadXML(execObj.StdOut.ReadAll()) Then
			WScript.Echo "XML Parse Error: " & xmlDoc.parseError.reason
			WScript.Quit 1
		End If
		'--- Load XSL stylesheet ---
		Set xslDoc = CreateObject("MSXML2.DOMDocument.6.0")
		xslDoc.async = False
		xslDoc.validateOnParse = False

		If Not xslDoc.load(strXSLPath) Then
			WScript.Echo "XSL Parse Error: " & xslDoc.parseError.reason
			WScript.Quit 1
		End If
		'--- Apply the transform ---
		result = xmlDoc.transformNode(xslDoc)

		'--- Write output to a file ---
		Set fso = CreateObject("Scripting.FileSystemObject")
		Set outFile = fso.CreateTextFile(strXMLPath, True, True)
		outFile.Write result
		outFile.Close
		Set fso = Nothing
		Set outFile = Nothing
		Set sh = Nothing
		Set execObj = Nothing
		set xslDoc = Nothing
		set xmlDoc = Nothing
		WScript.Echo "Portrait XML data generated at: " & strXMLPath
	End Sub
	Public Sub runExiftool()
		Dim shell, command, output, exec, template
		'       template = "-X -XMP:Title -XMP:Description -FileName -DateTimeOriginal" ' XML parameters
		If strExifOverride <> "" Then
			template = strExifOverride
		Else
			template = "-X -ImageDataHash -imageHashType MD5 -XMP:Title -XMP:Description -XMP:Subject -FileName -DateTimeOriginal" ' XML parameters
		End If
		Set shell = CreateObject("WScript.Shell")
		command = "cmd.exe /c exiftool.exe " & template & " """ & strFolderPath & """ > """ & strXMLPath & """"
		display "Running command: " & command
		shell.Run command, 0, True
		WScript.Echo "Portrait XML data generated at: " & strXMLPath
		Set shell = Nothing
	End Sub
	Private Sub Log(name, text)
		display Right(Space(20) & name, 20) & ": " & text
	End Sub
	Private Sub display(text)
		wscript.echo text
	End Sub
End Class