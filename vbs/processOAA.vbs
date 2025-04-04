Option Explicit

Dim objShell
Dim objArgs, i
Dim inputFolder : inputFolder = ""
Set objArgs = WScript.Arguments

' Check if arguments exist
If objArgs.Count = 0 Then
    WScript.Echo "No arguments provided!"
Else
    inputFolder = objArgs(0) & "\"
End If
' Create Shell Object
Set objShell = CreateObject("WScript.Shell")

' Set file paths
const workingDrive = "D:"
const watermark = "D:\Data\Nextcloud\Photos\OAA\OAA-watermark.png"
const inputImages = "\*.jpg"
const outputFolder = ".\web"
const watermarkFolder = ".\watermark"

' Ensure output directory exists
objShell.Run "cmd /c " & workingDrive, 0, True

' Ensure output directory exists
objShell.Run "cmd /c cd " & inputfolder, 0, True
objShell.Run "cmd /c cd"

' Ensure output directory exists
objShell.Run "cmd /c mkdir """ & outputFolder & """", 0, True
'objShell.Run "cmd /c mkdir """ & watermarkFolder & """", 0, True

' Convert to 800x800
'objShell.Run "cmd /c magick convert """ & inputImages & """ -colorspace Gray """ & outputFolder & "gray.jpg""", 0, True
WScript.echo "magick mogrify -path """ & outputFolder & """ -resize 800x800 -rotate 0 -format png """ & inputImages
objShell.Run "cmd /c magick mogrify -path """ & outputFolder & """ -resize 800x800 -rotate 0 -format png """ & inputImages, 0, True

' Make transparent background
WScript.echo "magick mogrify -path .\web -gravity NorthWest -background transparent -extent 800x800 .\web\*.png"
objShell.Run "cmd /c magick mogrify -path .\web -gravity NorthWest -background transparent -extent 800x800 .\web\*.png", 0, True

' Add watermark
WScript.echo "for %i in (web\*.png) do magick convert ""%i"" """ & watermark & """ -gravity NorthWest -composite ""%i"""
objShell.Run "cmd /c for %i in (web\*.png) do magick convert ""%i"" """ & watermark & """ -gravity NorthWest -composite ""%i""", 0, True

' Notify user
WScript.Echo "ImageMagick processing completed!"

' Clean up
Set objShell = Nothing
 