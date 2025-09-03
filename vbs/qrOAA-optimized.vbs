Option Explicit
'==========================================================================
' qrOAA.vbs — Generate labels and QR codes for OAA (Oakland Art Association)
' (c) 2025 Steven dos Remedios
'
' Usage:
'   cscript qrOAA.vbs <showID> <outputFolder>
'==========================================================================
Dim qrCode : Set qrCode = New qrCodeObject

qrCode.display qrCode.displayRecords
' Print label text files
qrCode.printLabels

' Generate QR codes for each artwork
qrCode.generateQRCodes

Set qrCode = Nothing

'==========================================================================
' qrCodeObject — handles SQLite access, label generation, and QR codes
'==========================================================================
Class qrCodeObject
    Public sqlite, showID, labelURL

    Private dbPath, fs, xmlhttp, dbStream, outputFolder, rs

    '=======================
    ' Initialize
    '=======================
    Private Sub Class_Initialize()
        dbPath = "D:\Data\Nextcloud\Documents\Datasets\OAA\OAA.db"
        Set fs = CreateObject("Scripting.FileSystemObject")
        Set xmlhttp = CreateObject("MSXML2.XMLHTTP")
        Set dbStream = CreateObject("ADODB.Stream")
        Set sqlite = New sqliteObject
        labelURL = "https://oaklandart.org/"

        If WScript.Arguments.Count <> 2 Then
            display "Usage: cscript qrOAA.vbs <showID> <outputFolder>"
            bail()
        End If

        showID = WScript.Arguments(0)
        outputFolder = WScript.Arguments(1)
        createFolder outputFolder

        If Not fs.FolderExists(outputFolder) Then
            display "Output folder does not exist: " & outputFolder
            bail()
        End If

        display "Show ID: " & showID
        display "Output folder: " & outputFolder

        sqlite.open dbPath
        sqlite.execute "SELECT * FROM artWork WHERE showID = '" & showID & "'"

        If sqlite.recordset Is Nothing Then
            display "No records found for showID: " & showID
            bail()
        End If

        Set rs = sqlite.recordset
    End Sub

    Private Sub Class_Terminate()
        Set rs = Nothing
        Set sqlite = Nothing
        Set xmlhttp = Nothing
        Set dbStream = Nothing
    End Sub

    '=======================
    ' Display ShowID records
    '=======================
    Public Function displayRecords()
        If rs Is Nothing Then
            display "No records to display."
            Exit Function
        End If

        displayRecords = sqlite.displayRecords
    End Function
 
    '=======================
    ' Generate label text files
    '=======================
    Public Sub printLabels()
        If rs Is Nothing Then
            display "No records to print."
            Exit Sub
        End If

        createFolder outputFolder & "\LabelText"

        rs.MoveFirst
        Do Until rs.EOF
            Dim label : label = getLabelText()
            If label <> "" Then
                Dim filePath : filePath = outputFolder & "\LabelText\" & artworkName("txt")
                Dim ts : Set ts = fs.OpenTextFile(filePath, 2, True)
                ts.WriteLine label
                ts.Close
                display "Label saved: " & filePath
            End If
            rs.MoveNext
        Loop
    End Sub

    '=======================
    ' Generate QR code images
    '=======================
    Public Sub generateQRCodes()
        If rs Is Nothing Then
            display "No records to generate QR codes for."
            Exit Sub
        End If

        createFolder outputFolder & "\QRcode"

        rs.MoveFirst
        Do Until rs.EOF
            Dim label : label = getLabelText()
            If label <> "" Then
                Dim filePath : filePath = outputFolder & "\QRcode\" & artworkName("png")
                saveQRCode label, filePath
            End If
            rs.MoveNext
        Loop
    End Sub

    '=======================
    ' Get artwork file name
    '=======================
    Public Function artworkName(ext)
        If rs Is Nothing Or rs.BOF Or rs.EOF Then
            artworkName = ""
            Exit Function
        End If

        On Error Resume Next
        artworkName = getField("artist") & "-" & getField("title") & "." & LCase(ext)
        If Err.Number <> 0 Then
            artworkName = ""
            Err.Clear
        End If
    End Function

    '=======================
    ' Create label string
    '=======================
    Public Function getLabelText()
        If rs Is Nothing Or rs.BOF Or rs.EOF Then
            getLabelText = ""
            Exit Function
        End If

        getLabelText = getField("title") & " - " & getField("artist") & vbCrLf & _
                       getField("medium") & " - " & getField("height") & """ x " & getField("width") & """" & vbCrLf & vbCrLf & _
                       "$" & getField("price") & vbCrLf & vbCrLf & labelURL
    End Function

    '=======================
    ' Fetch field from current record
    '=======================
    Private Function getField(fieldName)
        On Error Resume Next
        If rs Is Nothing Or rs.BOF Or rs.EOF Then
            getField = ""
        Else
            getField = Trim(rs.Fields(fieldName).Value)
        End If
        If Err.Number <> 0 Then Err.Clear
    End Function

    '=======================
    ' Save QR image via HTTP request
    '=======================
    Private Sub saveQRCode(text, fileName)
        Const qrAPI = "https://api.qrserver.com/v1/create-qr-code/?size=512x512&data="
        Dim url : url = qrAPI & URLEncode(text)

        xmlhttp.Open "GET", url, False
        xmlhttp.Send

        If xmlhttp.Status = 200 Then
            dbStream.Type = 1 ' Binary
            dbStream.Open
            dbStream.Write xmlhttp.ResponseBody
            dbStream.SaveToFile fileName, 2 ' Overwrite
            dbStream.Close
            display "QR code saved: " & fileName
        Else
            display "Failed to download QR. HTTP Status: " & xmlhttp.Status
        End If
    End Sub

    '=======================
    ' Encode URL-safe text
    '=======================
    Private Function URLEncode(str)
        Dim i, ch, code, encoded : encoded = ""
          For i = 1 To Len(str)
               ch = Mid(str, i, 1)
               select case ch
                    case "A","B","C","D","E","F","G","H","I","J","K","L","M", _
                         "M","O","P","Q","R","S","T","U","V","W","X","Y","Z", _
                         "a","b","c","d","e","f","g","h","i","j","k","l", _
                         "m","n","o","p","q","r","s","t","u","v","w","x","y","z", _
                         "0","1","2","3","4","5","6","7","8","9", _
                         "-", "_", ".", "~"
                         encoded = encoded & ch
                         'display "Normal letter or digit: " & ch
                    case " "
                         encoded = encoded & "+" ' use "%20" instead for strict RFC
                         'display "Space character encoded as: +"
                    case else
                         'display "Special character found: " & ch
                         ' Encode special characters
                         code = Hex(Asc(ch))
                         If Len(code) = 1 Then code = "0" & code
                         encoded = encoded & "%" & code     
                         'display "Encoded as: %" & code
               end select
          next
          URLEncode = encoded
    End Function

    '=======================
    ' Recursively create folder
    '=======================
    Public Sub createFolder(folderName)
        If Not fs.FolderExists(folderName) Then
            createFolder fs.GetParentFolderName(folderName)
            fs.CreateFolder folderName
            display "Created folder: " & folderName
        End If
    End Sub

    '=======================
    ' Output text
    '=======================
    Public Sub display(text)
        WScript.Echo text
    End Sub

    '=======================
    ' Exit
    '=======================
    Public Sub bail()
        WScript.Quit 1
    End Sub
End Class

'==========================================================================
' sqliteObject — wrapper for SQLite via ODBC
'==========================================================================
Class sqliteObject
    Public oConnection, recordset
    Private connString

    Private Sub Class_Initialize()
        Set oConnection = CreateObject("ADODB.Connection")
        connString = "Driver={SQLite3 ODBC Driver};Database=[sDBfile];StepAPI=;Timeout=20"
    End Sub

    Private Sub Class_Terminate()
        If Not recordset Is Nothing Then Set recordset = Nothing
        If Not oConnection Is Nothing Then Set oConnection = Nothing
    End Sub

    Public Sub open(database)
        If oConnection.State = 1 Then oConnection.Close
        oConnection.Open Replace(connString, "[sDBfile]", database)
    End Sub

    Public Sub execute(SQL)
        If oConnection.State = 1 Then
            Set recordset = oConnection.Execute(SQL)
        Else
            Set recordset = Nothing
        End If
    End Sub

    Public Function displayFields()
        Dim oFld, buffer
        If recordset Is Nothing Then Exit Function
        For Each oFld In recordset.Fields
            buffer = buffer & oFld.Name & ", "
        Next
        displayFields = Left(buffer, Len(buffer) - 2)
    End Function

    Public Function displayRecords()
        Dim oFld, buffer, line
        If recordset Is Nothing Then Exit Function

        recordset.MoveFirst
        Do Until recordset.EOF
            line = ""
            For Each oFld In recordset.Fields
                line = line & oFld.Value & ", "
            Next
            buffer = buffer & Left(line, Len(line) - 2) & vbCrLf
            recordset.MoveNext
        Loop
        displayRecords = buffer
    End Function
End Class
