option explicit
'==============================================================================
' D:\Data\Nextcloud\Source\vbs\qrOAA.vbs
' This script is used to generate QR codes for OAA (Oakland Art Association) images
' Usage:
'   cscript qrOAA.vbs <showID> <outputFolder>
'==============================================================================
dim qrCode : set qrCode = new qrCodeObject

'qrCode.display qrCode.getLabelText() ' Generate label for the current record
'qrCode.display qrCode.sqlite.displayFields
qrCode.display qrCode.sqlite.displayRecords
qrCode.printLabels ' Print labels for all records in the current show
qrCode.generateQRCodes ' Create QRcodes for all records in the current show

set qrCode = Nothing
'==============================================================================
class qrCodeObject
     Public sqlite
     Public showID, labelURL

     Private sDBfile
     Private xmlhttp
     Private dbStream
     Private iStream
     Private rs
     Private fs, outputFolder

     private sub class_initialize()
          sDBfile = "D:\Data\Nextcloud\Documents\Datasets\OAA\OAA.db"
          Set sqlite = new sqliteObject
          Set dbStream = CreateObject("ADODB.Stream")
          Set xmlhttp = CreateObject("MSXML2.XMLHTTP")
          Set fs = CreateObject("Scripting.FileSystemObject")
          labelURL = "https://oaklandart.org/" ' Base URL for labels
          Dim i
          '-----------------------------
          ' Validate and assign arguments
          '-----------------------------
          If WScript.Arguments.Count <> 2 Then
               display "Usage: cscript qrOAA.vbs <showID> <outputFolder>"
               bail()
          End If

          For i = 0 To WScript.Arguments.Count - 1
               Select Case i
                    Case 0 ' Show ID
                         showID = WScript.Arguments(i)
                         display "Show ID: " & showID
                    case 1 ' Output folder
                         outputFolder = WScript.Arguments(i)
                         createFolder outputFolder
                         If Not fs.FolderExists(outputFolder) Then
                              display "Output folder does not exist: " & outputFolder
                              bail()
                         End If
                         display "Output folder: " & outputFolder
                    Case Else
                         display "Too many arguments provided."
                         bail()
               End Select
          Next

          sqlite.open sDBfile
          sqlite.execute("SELECT * FROM artWork where showID = '" & showID & "'")
          if sqlite.recordset is nothing then
               display "No records found for showID: " & showID
               bail()
          else
               set rs = sqlite.recordset
          end if
     end sub

     private sub class_terminate()
          Set xmlhttp = Nothing
          Set dbStream = Nothing
          Set sqlite = Nothing
          set xmlhttp = Nothing
		set iStream = Nothing
     end sub

     public sub printLabels()
          ' This subroutine prints labels for each artwork in the current recordset
          ' It generates a label for each record and saves it to the output folder
          if rs is nothing then
               display "No records to print labels for."
               exit sub
          end if

          createFolder outputFolder & "\LabelText" ' Ensure the output folder exists

          rs.moveFirst
          do while not rs.EOF
               dim labelText : labelText = getLabelText()
               if labelText <> "" then
                    dim fileName : fileName = outputFolder & "\LabelText\" & artworkName("txt")
                    dim ts : set ts = fs.openTextFile(fileName, 2, True) ' 2 = ForWriting, True = create if not exists
                    ts.writeLine labelText
                    ts.close
                    display "Label saved: " & fileName
               end if
               rs.moveNext
          loop
     end sub

     public function artworkName(ext)
          ' This function returns the name of the artwork at the current record
          ' If the recordset is empty, it returns an empty string
          dim fileName
          if rs is nothing or rs.BOF or rs.EOF then
               display = "artworkName: No current record"
               artworkName = ""
               exit function
          end if

          On Error Resume Next
          fileName = getField("artist") & "-" & getField("title") & "." & LCase(ext)
          If Err.Number <> 0 Then
               artworkName = ""
               Err.Clear
          End If
          artworkName = fileName
     end function

     public function getLabelText()
          ' This function generates a Label for the artwork at the current record

          ' Returns a formatted string with title, artist, medium, dimensions, and price
          ' If the recordset is empty, it returns an empty string
          if rs is nothing or rs.BOF or rs.EOF then
               display = "generateLabel: No current record"
               getLabelText = ""
               exit function
          end if

          getLabelText = getField("title") & " - " _
               & getField("artist") & Chr(10) _
               & getField("medium") & " - " _
               & getField("height") & """ x " & getField("width") & """" & Chr(10) & Chr(10) _
               & "$" & getField("price") _
               & Chr(10) & Chr(10) & labelURL
     end function

     Private function getField(fieldName)
          ' This function retrieves the value of a specified field from the current record
          ' Returns the field value or an empty string if the field does not exist
          if rs is nothing or rs.BOF or rs.EOF then
               getField = ""
               exit function
          end if

          On Error Resume Next
          getField = RTrim(LTrim(rs.Fields(fieldName).Value))
          If Err.Number <> 0 Then
               getField = ""
               Err.Clear
          End If
     end function

	public sub generateQRCodes()
          ' This subroutine generates a QR code for the current artwork
          ' It retrieves the label text and saves the QR code image to the output folder
          if rs is nothing then
               display "generateQRCodes: recordset"
               exit sub
          end if

          createFolder outputFolder & "\QRcode" ' Ensure the output folder exists

          rs.moveFirst
          do while not rs.EOF
               dim labelText : labelText = getLabelText()
               if labelText <> "" then
                    dim fileName : fileName = outputFolder & "\QRcode\" & artworkName("png")
                    saveQRCode labelText, fileName
               end if
               rs.moveNext
          loop
     end sub
     
     private sub saveQRCode(text, fileName)
          ' This subroutine downloads an image from a URL and saves it to a specified path
          ' Parameters are:
          '   text: content to encode in the QR code
          '   savePath: The local path where the image will be saved
          ' Ensure the savePath directory exists

          const urlPrefix = "https://api.qrserver.com/v1/create-qr-code/?size=512x512&data="
          dim URL : URL = urlPrefix & URLEncode(text) ' URL encode text

          xmlhttp.Open "GET", URL, False
          xmlhttp.Send

          ' Check if the request was successful
          If xmlhttp.Status = 200 Then
               ' Create a binary stream to write the data
               dbStream.Type = 1             ' Binary
               dbStream.Open
               dbStream.Write xmlhttp.ResponseBody
               dbStream.SaveToFile fileName, 2  ' 2 = overwrite if exists
               dbStream.Close
               display "QRcode saved: " & fileName
          Else
               display "Failed to download image. HTTP Status: " & xmlhttp.Status
          End If
	End Sub

     Private Function URLEncode(str)
          Dim i, ch, code
          Dim encoded : encoded = ""

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
     '--------------------------------------------------------------------------
     ' Recursive folder creation
     '--------------------------------------------------------------------------
     public sub createFolder(folderName)	'RECURSIVE!!
          dim d, f, e
          if fs.folderExists(folderName) then
               exit sub
          else 
               createFolder fs.GetParentFolderName (folderName)
          end if
          display "creating folder: " & folderName
          fs.createFolder(folderName)
     end sub
     '--------------------------------------------------------------------------
     ' Output text to console
     '--------------------------------------------------------------------------
     public Sub display(text)
          WScript.Echo text
     End Sub
     '--------------------------------------------------------------------------
     ' Exit script gracefully
     '--------------------------------------------------------------------------
     public Sub bail()
          WScript.Quit 1
     End Sub
end class
'==============================================================================
class sqliteObject
     public oConnection
     public recordset
     private connString
    
     private sub class_initialize()
          set oConnection = CreateObject( "ADODB.Connection" )
          connString = "Driver={SQLite3 ODBC Driver};" _
               & "Database=[sDBfile];StepAPI=;Timeout=20"
          set recordset = nothing
		  'display "database object created"
     end sub
    
     private sub class_terminate()
          set recordset = nothing
          set oConnection = nothing
		  'display "database closed"
     end sub
    
     public sub open(database)
          if oConnection.state = 1 then oConnection.close()
          dim cs : cs = replace(connString,"[sDBfile]",database)
          oConnection.open cs
		  'display "database opened"
     end sub
    
     public sub execute(SQL)
          if oConnection.state = 1 then
               set recordset = oConnection.execute(SQL)
          else
               set recordset = nothing
          end if
     end sub

     public function displayFields()
          ' This function returns a string representation of the fields in the recordset
          Dim oFld, buffer
          if recordset is nothing then
               displayFields = ""
          else
               buffer = ""
               For Each oFld In recordset.Fields
                    If buffer = "" Then
                         buffer = oFld.Name
                    Else
                         buffer = buffer & ", " & oFld.Name
                    End If
               Next
               displayFields = buffer
          end if
     end function   
    
     public function displayRecords()
          Dim oFld
          if recordset is nothing then
               displayRecords = ""
          else
               dim buffer : buffer = ""
               recordset.moveFirst
               while not recordset.EOF
                    dim line : line = ""
                    For Each oFld In recordset.Fields
                         if line = "" then
                              line = oFld.Value
                         else
                              line = line & ", " & oFld.Value
                         end if
                    Next
                    buffer = buffer & line & vbcrlf
                    recordset.moveNext
               wend
               displayRecords = buffer
          end if
     end function
end class
