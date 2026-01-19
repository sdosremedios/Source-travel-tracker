Option Explicit

Dim xml, xsl, result, fso, outFile

' cscript "D:\Data\Nextcloud\Source\vbs\getMetadata.vbs"

'--- Load the XML ---
Set xml = CreateObject("MSXML2.DOMDocument.6.0")
xml.async = False
xml.validateOnParse = False
xml.load "W:\travelshot\docs\data\portraits.xml"

If xml.parseError.errorCode <> 0 Then
    WScript.Echo "XML Error: " & xml.parseError.reason
    WScript.Quit 1
End If

'--- Load the XSL ---
Set xsl = CreateObject("MSXML2.DOMDocument.6.0")
xsl.async = False
xsl.validateOnParse = False
xsl.load "D:\Data\Nextcloud\Source\vbs\xml\keywords.xslt"

If xsl.parseError.errorCode <> 0 Then
    WScript.Echo "XSL Error: " & xsl.parseError.reason
    WScript.Quit 1
End If

'--- Perform the transform ---
result = xml.transformNode(xsl)

'--- Write output to a file ---
WScript.Echo result

Set fso = CreateObject("Scripting.FileSystemObject")
Set outFile = fso.CreateTextFile("W:\travelshot\docs\data\portrait_keywords.xml", True, True)  ' True = overwrite, True = Unicode
outFile.Write result
outFile.Close

WScript.Echo "Transformation complete."