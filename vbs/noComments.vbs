Dim fso, folder, file, inputFile, outputFile, content, updatedContent
Dim sourceFolder

' Set the folder containing GPX files
sourceFolder = "D:\Data\Nextcloud\Maps\2024-09 Southern Italy"

' Create FileSystemObject
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the folder object
Set folder = fso.GetFolder(sourceFolder)

' Loop through each file in the folder
For Each file In folder.Files
    wscript.echo file.Name
    If LCase(fso.GetExtensionName(file.Name)) = "gpx" Then
        ' Read the file
        Set inputFile = fso.OpenTextFile(file.Path, 1) ' 1 = ForReading
        content = inputFile.ReadAll
        inputFile.Close

        ' Remove XML comments
        updatedContent = RemoveComments(content)

        ' Write updated content back to the file
        Set outputFile = fso.OpenTextFile(file.Path, 2) ' 2 = ForWriting
        outputFile.Write updatedContent
        outputFile.Close
    End If
Next

WScript.Echo "Comments removed from all GPX files in the folder."

' Function to remove XML comments
Function RemoveComments(inputText)
    Dim regEx
    Set regEx = CreateObject("VBScript.RegExp")
    regEx.Pattern = "<!--[\s\S]*?-->"
    regEx.Global = True
    RemoveComments = regEx.Replace(inputText, "")
End Function
