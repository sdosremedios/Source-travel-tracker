Option Explicit

' This script processes images in a specified folder, resizes them, and applies a watermark.
' Usage: cscript "<path-to-this-script>\processOAA.vbs" "<inputFolder>"
' 
' Example: cscript "D:\Data\Nextcloud\Source\vbs\processOAA.vbs" "D:\Data\Nextcloud\Photos\OAA\Piedmont Arts\2024-04 Show"
'
' Note: Ensure ImageMagick is installed and added to the system PATH.
' D:\Data\Nextcloud\Source\vbs\processOAA.vbs .\

Dim objShell
Dim objArgs, i
Dim inputFolder : inputFolder = ""
Set objArgs = WScript.Arguments
Dim doWatermark : doWatermark = False

' Check if arguments exist
If objArgs.Count = 0 Then
    WScript.Echo "No arguments provided!"
    stop
Else
    for i = 0 To objArgs.Count - 1
        WScript.Echo "Argument " & i & ": " & objArgs(i)
        select case i
            case 0
                ' Input folder provided
                inputFolder = objArgs(0) & "\"
            case 1
                ' Input folder and watermark flag provided
                if LCase(objArgs(1)) = "true" then
                    doWatermark = True
                end if
            case else
                WScript.Echo "Too many arguments provided!"
                stop
        end select
    end for
End If
' Create Shell Object
Set objShell = CreateObject("WScript.Shell")

' Set file paths
const workingDrive = "D:"
const watermark = "D:\Data\Nextcloud\Photos\OAA\OAA-watermark.png"
'const inputImages = "\*.jpg"
const inputImages = "\*.jpeg \*.jpg \*.png \*.tif"
const outputFolder = ".\web"
const watermarkFolder = ".\watermark"

' Ensure output directory exists
objShell.Run "cmd /c " & workingDrive, 0, True

' Change to input directory
objShell.Run "cmd /c cd " & inputfolder, 0, True
objShell.Run "cmd /c cd"

' Ensure output directory exists
objShell.Run "cmd /c mkdir """ & outputFolder & """", 0, True

' Convert to 800x800
'objShell.Run "cmd /c magick convert """ & inputImages & """ -colorspace Gray """ & outputFolder & "gray.jpg""", 0, True
WScript.echo "magick mogrify -path """ & outputFolder & """ -resize 800x800 -quality 100 -format png " & inputImages
objShell.Run "cmd /c magick mogrify -path """ & outputFolder & """ -resize 800x800 -quality 100 -format png " & inputImages, 0, True

' Make transparent background
WScript.echo "magick mogrify -path .\web -gravity NorthWest -background transparent -extent 800x800 .\web\*.png"
objShell.Run "cmd /c magick mogrify -path .\web -gravity NorthWest -background transparent -extent 800x800 .\web\*.png", 0, True

' copy to watermark folder
if doWatermark then 
    objShell.Run "cmd /c mkdir """ & watermarkFolder & """", 0, True
    WScript.echo "cmd /c copy """ & outputFolder & "\*.png"" """ & watermarkFolder & """ /Y"
    objShell.Run "cmd /c copy """ & outputFolder & "\*.png"" """ & watermarkFolder & """ /Y", 0, True
    ' Add watermark
    WScript.echo "for %i in (watermark\*.png) do magick convert ""%i"" """ & watermark & """ -gravity NorthWest -composite ""%i"""
    objShell.Run "cmd /c for %i in (watermark\*.png) do magick convert ""%i"" """ & watermark & """ -gravity NorthWest -composite ""%i""", 0, True
end if


' Notify user
WScript.Echo "ImageMagick processing completed!"

' Clean up
Set objShell = Nothing
 