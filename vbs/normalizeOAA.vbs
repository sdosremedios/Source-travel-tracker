Option Explicit
'==============================================================================
' This script normalizes images for OAA (Oakland Art Association) by resizing them to 500x500 pixels
'
' (c) 2025 Steven dos Remedios
' 
' It supports optional watermarking and rotation of images.
'
' Usage:
' cscript D:\Data\Nextcloud\Source\vbs\normalizeOAA.vbs <inputFolder> <watermarkFile|True> [left|right|180]
'
' Arguments:
'   <inputFolder>    - Path to the folder containing images to process
'   <watermarkFile>  - Path to the watermark image or "True" to enable default watermark
'   [rotation]       - Optional rotation direction: "left", "right", or "180"
'
' The script will:
'   - Resize images to fit in a 800x800 transparent square  
'   - Position the image in the upper left corner
'   - Convert images to PNG format  
'   - Optionally apply a watermark
'   - Optionally rotate images based on the specified argument  
'
' Requirements:
'   - ImageMagick must be installed and accessible in the system PATH
'
' Note:
'   - The script assumes the working drive is D: and uses specific subfolders for watermark and web folders.
'==============================================================================

Dim oaa : Set oaa = New oaaLib
oaa.resize()

'==============================================================================
' oaaLib Class Definition
'==============================================================================
Class oaaLib
    Public debug
    Private objShell, inputFolder, doWatermark, rotate
    Private workingDrive, watermarkFile, inputImages, outputFolder, watermarkFolder

    ' Initialize configuration and arguments
    Private Sub Class_Initialize()
        Dim i, arg3
        debug = False
        rotate = ""
        workingDrive = "D:"
        watermarkFile = "D:\Data\Nextcloud\Photos\OAA\OAA-watermark.png"
        inputImages = "\*.jpeg \*.jpg \*.png \*.tif"
        outputFolder = ".\web"
        watermarkFolder = ".\watermark"
        doWatermark = False
        Set objShell = CreateObject("WScript.Shell")

        ' Argument validation
        If WScript.Arguments.Count = 0 Then
            display "Usage: normalizeOAA.vbs <inputFolder> <watermarkFile|True> [rotation]"
            bail()
        End If

        For i = 0 To WScript.Arguments.Count - 1
            Select Case i
                Case 0
                    inputFolder = WScript.Arguments(i)
                    outputFolder = inputFolder & "\web"
                    watermarkFolder = inputFolder & "\watermark"
                Case 1
                    ' Watermark enable
                    If LCase(WScript.Arguments(i)) <> "true" Then
                        watermarkFile = WScript.Arguments(i)
                    End If
                    doWatermark = True  
                Case 2
                    arg3 = LCase(WScript.Arguments(i))
                    Select Case arg3
                        Case "left"  : rotate = " -rotate -90"
                        Case "right" : rotate = " -rotate 90"
                        Case "180"   : rotate = " -rotate 180"
                        Case Else
                            display "Invalid rotation. Use 'left', 'right', or '180'."
                            bail()
                    End Select
                Case Else
                    display "Too many arguments provided."
                    bail()
            End Select
        Next

        ' Ensure working drive context and output folders exist
        objShell.Run "cmd /c cd " & workingDrive, 0, True
        objShell.Run "cmd /c cd " & inputFolder, 0, True
        objShell.Run "cmd /c mkdir """ & outputFolder & """", 0, True
        If doWatermark Then objShell.Run "cmd /c mkdir """ & watermarkFolder & """", 0, True

        display "Input folder: " & inputFolder
        display "Output folder: " & outputFolder    
        display "Watermark folder: " & watermarkFolder
        display "Watermark file: " & watermarkFile
        display "Rotation: " & rotate

    End Sub

    ' Cleanup
    Private Sub Class_Terminate()
        Set objShell = Nothing
    End Sub

    ' Exit script
    Private Sub bail()
        WScript.Quit 1
    End Sub

    ' Main processing method
    Public Sub resize()
        ' Resize and convert to 800x800 transparent PNG
        display "Resizing and converting images..."
        runCommand "magick mogrify -path """ & outputFolder & """ -resize 800x800" & rotate & " -quality 100 -format png " & inputImages

        ' Set transparent canvas with top-left gravity
        display "Applying transparent 800x800 canvas..."
        runCommand "magick mogrify -path """ & outputFolder & """ -gravity NorthWest -background transparent -extent 800x800 """ & outputFolder & "\*.png"""

        If doWatermark Then watermark()
    End Sub

    ' Apply watermark if requested
    Private Sub watermark()
        Dim fso : Set fso = CreateObject("Scripting.FileSystemObject")
        Dim folder :  Set folder = fso.GetFolder(watermarkFolder)
        Dim files : Set files = folder.Files
        Dim file

        display "Copying files to watermark folder..."
        runCommand "copy """ & outputFolder & "\*.png"" """ & watermarkFolder & """ /Y"

        display "Applying watermark..."
        For Each file In files
            If LCase(fso.GetExtensionName(file.Name)) = "png" Then
                display "Applying watermark to: " & file.Name
                'magick convert ""%i"" """ & watermarkFile & """ -gravity NorthWest -composite ""%i"""
                runCommand "magick convert """ & watermarkFolder & "\" & file.Name & """ """ & watermarkFile & """ -gravity NorthWest -composite """ & watermarkFolder & "\" & file.Name & """"
            End If  
        Next
        set fso = Nothing
        set folder = Nothing
        set files = Nothing
    End Sub

    ' Execute a shell command and optionally log
    Private Sub runCommand(cmd)
        If debug Then display "Running: " & "cmd /c cd /d """ & inputFolder & """ && " & cmd
        objShell.Run "cmd /c cd /d """ & inputFolder & """ && " & cmd, 0, True
    End Sub

    ' Display text to console
    Private Sub display(text)
        WScript.Echo text
    End Sub

    ' Assert condition and display message if failed
    Private Sub Assert(condition, message)
        If Not condition Then
            WScript.Echo "Assertion failed: " & message
            bail()
        End If
    End Sub
End Class
