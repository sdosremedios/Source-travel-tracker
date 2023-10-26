option explicit
const csvFilename = "c:\bin\xml\zipcode_salestax.csv"

dim ad : set ad = CreateObject("ADODB.Connection")      'create and open ODBC connection 
ad.ConnectionString= "DSN=salestax;UID=webuser;pwd=webuser" 
ad.Open 

dim rs : Set rs = ad.execute("select * from zipcode_salestax")        'execute query 
'TRANSFER DATA FROM RS TO XML 

dim c, i, j, tx : tx = ""
for i = 0 to rs.fields.count-2
	tx = tx & rs.fields.item(i).name & ","
next
tx = tx & rs.fields.item(rs.fields.count-1).name & vbCrLf

dim data : data = rs.getRows
for i = 0 to ubound(data,2)
	for j = 0 to ubound(data,1) -1
		tx = tx & data(j,i) & ","
	next
	tx = tx & data(ubound(data,1),i) & vbCrLf
next
rs.close

wscript.echo tx
createObject("scripting.fileSystemObject").OpenTextFile(csvfilename,2,true).writeLine tx
	