Option Explicit
'==============================================================================
' normalizeOAA.vbs
'
' Normalizes images for Oakland Art Association:
'   - Resizes to 800x800 with transparent background
'   - Optionally rotates and watermarks
'   - Optionally prepares for QR code integration (stub)
'
' Usage:
'   cscript normalizeOAA.vbs <inputFolder> <watermarkFile|True> [left|right|180|none] [QRcode=True]
'
' Dependencies:
'   - Requires ImageMagick in system PATH
'
' (c) 2025 Steven dos Remedios
'==============================================================================

Dim oaa : Set oaa = New oaaLib
oaa.process()

'==============================================================================
' oaaLib Class
'==============================================================================
Class oaaLib
    Public debug
    Private objShell, fso, folder, files, file
    Private inputFolder, doWatermark, rotate, QRcode
    Private watermarkFile, inputImages
    Private outputFolder, watermarkFolder, qrFolder
    Private workingDrive

    '--------------------------------------------------------------------------
    ' Initialize and parse script arguments
    '--------------------------------------------------------------------------
    Private Sub Class_Initialize()
        Dim i, arg3
        debug = False
        rotate = ""
        QRcode = False
        doWatermark = False

        ' Defaults
        workingDrive = "D:"
        watermarkFile = "D:\Data\Nextcloud\Photos\OAA\OAA-watermark.png"
        inputImages = "\*.jpeg \*.jpg \*.png \*.tif"

        ' Set up shell and file system objects
        Set objShell = CreateObject("WScript.Shell")
        Set fso = CreateObject("Scripting.FileSystemObject")

        '-----------------------------
        ' Validate and assign arguments
        '-----------------------------
        If WScript.Arguments.Count = 0 Then
            display "Usage: normalizeOAA.vbs <inputFolder> <watermarkFile|True> [rotation] [QRcode=True]"
            bail()
        End If

        For i = 0 To WScript.Arguments.Count - 1
            Select Case i
                Case 0 ' Input folder
                    inputFolder = WScript.Arguments(i)
                    outputFolder = inputFolder & "\web"
                    watermarkFolder = inputFolder & "\watermark"
                    qrFolder = inputFolder & "\qrcode"

                Case 1 ' Watermark flag or file
                    Select Case LCase(WScript.Arguments(i))
                        Case "true"
                            doWatermark = True
                        Case "false"
                            doWatermark = False
                        Case Else
                            doWatermark = True
                            watermarkFile = WScript.Arguments(i)
                    End Select

                Case 2 ' Rotation
                    Select Case LCase(WScript.Arguments(i))
                        Case "left"  : rotate = " -rotate -90"
                        Case "right" : rotate = " -rotate 90"
                        Case "180"   : rotate = " -rotate 180"
                        Case "none"  : rotate = ""
                        Case Else
                            display "Invalid rotation. Use 'left', 'right', '180', or 'none'."
                            bail()
                    End Select

                Case 3 ' QR code option
                    If LCase(WScript.Arguments(i)) = "true" Then QRcode = True

                Case Else
                    display "Too many arguments provided."
                    bail()
            End Select
        Next

        '-----------------------------
        ' Create output directories
        '-----------------------------
        CreateFolder outputFolder
        If doWatermark Then CreateFolder watermarkFolder
        If QRcode Then CreateFolder qrFolder

        ' Output debug info
        display "Input folder:       " & inputFolder
        display "Output folder:      " & outputFolder    
        display "Watermark folder:   " & watermarkFolder
        display "Watermark file:     " & watermarkFile
        display "QR code folder:     " & qrFolder
        display "Rotation:           " & rotate
    End Sub

    '--------------------------------------------------------------------------
    ' Clean up on object termination
    '--------------------------------------------------------------------------
    Private Sub Class_Terminate()
        Set objShell = Nothing
        Set fso = Nothing
    End Sub

    '--------------------------------------------------------------------------
    ' Core process: Resize, Canvas, Optional Watermark and QR
    '--------------------------------------------------------------------------
    Public Sub process()
        display "Resizing and converting images..."
        runCommand "magick mogrify -path """ & outputFolder & """ -resize 800x800" & rotate & " -quality 100 -format png " & inputImages

        display "Applying transparent 800x800 canvas..."
        runCommand "magick mogrify -path """ & outputFolder & """ -gravity NorthWest -background transparent -extent 800x800 """ & outputFolder & "\*.png"""

        If QRcode Then generateQRcodes()
        If doWatermark Then applyWatermark()
    End Sub

    '--------------------------------------------------------------------------
    ' Create folder if it does not exist
    '--------------------------------------------------------------------------
    Private Sub CreateFolder(path)
        If Not fso.FolderExists(path) Then fso.CreateFolder path
    End Sub

    '--------------------------------------------------------------------------
    ' Placeholder QR code logic
    '--------------------------------------------------------------------------
    Private Sub generateQRcodes()
        display "QR code generation"
        Set folder = fso.GetFolder(inputFolder)
        Set files = folder.Files

        For Each file In files
            Select Case LCase(fso.GetExtensionName(file.Name))
                Case "jpeg", "jpg", "png", "tif", "tiff"
                    display "Generating QR code for: " & file.Name
					getImage "https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=" & file.Name, qrFolder & "\" & fso.GetBaseName(file.Name) & ".png"
            End Select
        Next
    End Sub

    '--------------------------------------------------------------------------
    ' Apply watermark to each PNG in watermark folder
    '--------------------------------------------------------------------------
    Private Sub applyWatermark()
        ' Copy PNGs to watermark folder
        runCommand "copy """ & outputFolder & "\*.png"" """ & watermarkFolder & """ /Y"

        Set folder = fso.GetFolder(watermarkFolder)
        Set files = folder.Files

        display "Applying watermark..."
        For Each file In files
            If LCase(fso.GetExtensionName(file.Name)) = "png" Then
                display "Watermarking: " & file.Name
                runCommand "magick convert """ & watermarkFolder & "\" & file.Name & """ """ & watermarkFile & """ -gravity NorthWest -composite """ & watermarkFolder & "\" & file.Name & """"
            End If
        Next
    End Sub

	private sub getImage(url, savePath)
		' This subroutine downloads an image from a URL and saves it to a specified path
		' Parameters are:
		'   url: The URL of the image to download
		'   savePath: The local path where the image will be saved
		' Ensure the savePath directory exists

		' Create XMLHTTP and ADODB.Stream objects
		Dim xmlhttp, stream

		' Create XMLHTTP object to fetch the image
		Set xmlhttp = CreateObject("MSXML2.XMLHTTP")
		xmlhttp.Open "GET", url, False
		xmlhttp.Send

		' Check if the request was successful
		If xmlhttp.Status = 200 Then
			' Create a binary stream to write the data
			Set stream = CreateObject("ADODB.Stream")
			stream.Type = 1             ' Binary
			stream.Open
			stream.Write xmlhttp.ResponseBody
			stream.SaveToFile savePath, 2  ' 2 = overwrite if exists
			stream.Close
			display "Image saved to: " & savePath
		Else
			display "Failed to download image. HTTP Status: " & xmlhttp.Status
		End If
		set xmlhttp = Nothing
		set stream = Nothing
	End Sub

	'--------------------------------------------------------------------------
	' Exit script gracefully
	'--------------------------------------------------------------------------
	Private Sub bail()
		WScript.Quit 1
	End Sub

    '--------------------------------------------------------------------------
    ' Execute a shell command
    '--------------------------------------------------------------------------
    Private Sub runCommand(cmd)
        display "CMD: " & cmd
        objShell.Run "cmd /c cd /d """ & inputFolder & """ && " & cmd, 0, True
    End Sub

    '--------------------------------------------------------------------------
    ' Output text to console
    '--------------------------------------------------------------------------
    Private Sub display(text)
        WScript.Echo text
    End Sub

End Class
