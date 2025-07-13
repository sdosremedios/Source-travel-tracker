option explicit
'==============================================================================
'	cscript D:\Data\Nextcloud\Source\vbs\normalizeOAA.vbs <inputFolder> [watermark] [rotation]
'
'	Position artwork in upper left of square 800x800 canvas
'
'	mogrify -gravity NorthWest -background transparent -extent 800x800 -format png *.jpg
'==============================================================================
dim oaa	: set oaa = new oaaLib

oaa.resize


'==============================================================================
'	oaaLib definition
'==============================================================================
class oaaLib
	public debug
	private objShell
	private inputFolder
	private doWatermark
	private rotate

	private workingDrive
	private watermarkFile 
	private inputImages 
	private outputFolder 
	private watermarkFolder  

	private sub class_Initialize()
		dim i, arg3
		debug = false
		rotate = " "
		workingDrive = "D:"
		watermarkFile = "D:\Data\Nextcloud\Photos\OAA\OAA-watermark.png"
		'const inputImages = "\*.jpg"
		inputImages = "\*.jpeg \*.jpg \*.png \*.tif"
		outputFolder = ".\web"
		watermarkFolder = ".\watermark"
		set objShell = createObject("WScript.Shell")
		' Check if arguments exist
		if wscript.arguments.count = 0 then
			display "No arguments provided! Usage: normalizeOAA.vbs <inputFolder> [watermark] [rotation]"
			bail()
			exit sub
		end if
		for i = 0 to wscript.arguments.count - 1
			select case i
				case 0
					' Path to images
					inputFolder = wscript.arguments(i)
				case 1
					' Watermark enable
					if LCase(wscript.arguments(i)) = "true" then
						doWatermark = True
					end if
				case 2
					' Rotation required
					arg3 = LCase(wscript.arguments(i))
					select case arg3
						case "left"
							' Rotate images
							rotate = " -rotate -90"
						case "right"
							' Rotate images
							rotate = " -rotate 90"
						case "180"
							' Rotate images
							rotate = " -rotate 180"
						case else
							display "Invalid rotation argument! Use 'left', 'right' or '180'."
							bail()
							exit sub
					end select 
				case else
					display "Too many arguments provided!"
					bail()
					exit sub
			end select
		next
	' Ensure output directory exists
	objShell.Run "cmd /c " & workingDrive, 0, True

	' Change to input directory
	objShell.Run "cmd /c cd " & inputfolder, 0, True
	objShell.Run "cmd /c cd"
	objShell.Run "cmd /c d:"	'fix for running from other drives

	' Ensure output directories exists
	objShell.Run "cmd /c mkdir """ & outputFolder & """", 0, True
	if doWatermark then objShell.Run "cmd /c mkdir """ & watermarkFolder & """", 0, True

	end sub
	private sub class_Terminate()
		set objShell = nothing
	end sub

	private sub bail()
		' Stop script execution
		WScript.Quit 1
	end sub

	public sub resize()
		' Convert to 800x800 transparent PNG
		WScript.echo "magick mogrify -path """ & outputFolder & """ -resize 800x800" & rotate  & " -quality 100 -format png " & inputImages
		objShell.Run "cmd /c magick mogrify -path """ & outputFolder & """ -resize 800x800" & rotate  & " -quality 100 -format png " & inputImages, 0, True

		' Make transparent background
		WScript.echo "magick mogrify -path .\web -gravity NorthWest -background transparent -extent 800x800 .\web\*.png"
		objShell.Run "cmd /c magick mogrify -path .\web -gravity NorthWest -background transparent -extent 800x800 .\web\*.png", 0, True
		if doWatermark then
			watermark()
		end if	
	end sub
	private sub watermark()
		' copy to watermark folder
		if doWatermark then 
			WScript.echo "cmd /c copy """ & outputFolder & "\*.png"" """ & watermarkFolder & """ /Y"
			objShell.Run "cmd /c copy """ & outputFolder & "\*.png"" """ & watermarkFolder & """ /Y", 0, True
			' Add watermark
			WScript.echo "for %i in (watermark\*.png) do magick convert ""%i"" """ & watermarkFile & """ -gravity NorthWest -composite ""%i"""
			objShell.Run "cmd /c for %i in (watermark\*.png) do magick convert ""%i"" """ & watermarkFile & """ -gravity NorthWest -composite ""%i""", 0, True
		end if
	end sub
	private sub Log(name, text)
		display right(space(20) & name, 20) & ": " & text
	end sub
	private sub display(text)
		wscript.echo text
	end sub
end class
