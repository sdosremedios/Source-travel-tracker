const sDBfile = _
     "C:\Users\SdosRemedios\OneDrive\OneDrive Documents\Websites\open_Oakland\OPD_140403_5.db"
dim sqlite : set sqlite = new sqliteObject
sqlite.open sDBfile
sqlite.execute("SELECT * FROM incident where addr like '%KINGWOOD%'")
wscript.echo sqlite.displayRecords
set sqlite = Nothing

class sqliteObject
     public oConnection
     public recordset
     private connString
    
     private sub class_initialize()
          set oConnection = CreateObject( "ADODB.Connection" )
          connString = "Driver={SQLite3 ODBC Driver};" _
               & "Database=[sDBfile];StepAPI=;Timeout=20"
          set recordset = nothing
		  'wscript.echo "database object created"
     end sub
    
     private sub class_terminate()
          set recordset = nothing
          set oConnection = nothing
		  'wscript.echo "database closed"
     end sub
    
     public sub open(database)
          if oConnection.state = 1 then oConnection.close()
          dim cs : cs = replace(connString,"[sDBfile]",database)
          oConnection.open cs
		  'wscript.echo "database opened"
     end sub
    
     public sub execute(SQL)
          if oConnection.state = 1 then
               set recordset = oConnection.execute(SQL)
          else
               set recordset = nothing
          end if
     end sub
    
     public function displayRecords()
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
