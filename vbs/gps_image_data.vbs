
'PAULGRANT.CA 2011

Option Explicit
'On Error Resume Next

Const	ForWriting			= 2
Const	FileCreate			= True
Const	TristateTrue		= -1	'Unicode
Const	SecondsToWait		= 10
Const	YesNo				= 4
Const	IconQuestion		= 32

Dim WshShell, iCode, sCurrentFolderName, sOutputFileName
Dim oFS, oFolder, oTS, oImg, oFile
Dim iPos, sExt, sString

Set WshShell = WScript.CreateObject("WScript.Shell")
iCode = WshShell.Popup("Continue?", SecondsToWait, "Run This Script?", YesNo + IconQuestion)
If (iCode <> 6) Then
	WScript.Quit 1
End If

sCurrentFolderName		= WshShell.CurrentDirectory
sOutputFileName			= sCurrentFolderName & "\output.txt"

Set oFS			= WScript.CreateObject("Scripting.FileSystemObject")
Set oFolder		= oFS.GetFolder(sCurrentFolderName)
Set oTS			= oFS.OpenTextFile(sOutputFileName, ForWriting, FileCreate, TristateTrue)
Set oImg		= WScript.CreateObject("WIA.ImageFile")

For Each oFile In oFolder.Files
	iPos	= InStrRev(oFile.Name, ".")
	sExt	= Mid(oFile.Name, iPos)
	If (LCase(sExt) = ".jpg") Then
		sString = DoImage(oFile.Name)
		If (sString <> "") Then
			oTS.WriteLine sString
		End If
	End If
Next

oTS.Close

WScript.Echo "Done"

'FUNCTIONS

Function DoImage(sFileName)

	Dim i, j, v, s, sOutput, sPropertyName
	sOutput = ""
	oImg.LoadFile sFileName
	For i = 1 to oImg.Properties.Count
		sPropertyName = oImg.Properties(i).Name
		If InStr(sPropertyName, "Gps") > 0 Then
			s = sPropertyName & "(" & oImg.Properties(i).PropertyID & ") = "
			If oImg.Properties(i).IsVector Then
				s = s & "[vector]"
				Set v = oImg.Properties(i).Value
				If sPropertyName = "GpsLatitude" Then
					s = s & FormatCoords(v, oImg.Properties("GpsLatitudeRef").Value)
				ElseIf sPropertyName = "GpsLongitude" Then
					s = s & FormatCoords(v, oImg.Properties("GpsLongitudeRef").Value)
				Else
					For j = 1 To v.Count
						s = s & v(j) & " "
					Next
				End If
			Else
				s = s & oImg.Properties(i).Value
			End If
			sOutput = sOutput & s & vbCrLf
		End If
	Next
	DoImage = sOutput
End Function

Function FormatCoords(v,sRef)
	'On Error Resume Next
	Dim sCoords
	sCoords = v(1) & Chr(176) & v(2) & Chr(39) & v(3) & Chr(34) & sRef
	FormatCoords = sCoords
End Function
'End.

' Dim Img 'As ImageFile
' Dim p 'As Property

' Set Img = CommonDialog1.ShowAcquireImage

' For Each p In Img.Properties
'     Dim s 'As String

'     s = p.Name & "(" & p.PropertyID & ") = "
'     If p.IsVector Then
'         s = s & "[vector data not emitted]"
'     ElseIf p.Type = RationalImagePropertyType Then '1006
'         s = s & p.Value.Numerator & "/" & p.Value.Denominator
'     ElseIf p.Type = StringImagePropertyType Then    '1002
'         s = s & """" & p.Value & """"
'     Else
'         s = s & p.Value
'     End If

'     MsgBox s
' Next