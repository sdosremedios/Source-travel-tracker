option explicit

const begNum	= 1
const endNum	= 105

function rPad(n,z)
	rPad = right(string(z,"0") & n, z)
end function

dim codeBase : codeBase	= "<a href=""docs/images/event/{1}-{2}.jpg"" class=""highslide"" title=""{3}""><img src=""docs/images/event/{1}-{2}-t.jpg"" alt=""{3}"" style=""height:200px"" /></a>"
dim i, t : t = ""
dim fs : set fs = createObject("scripting.filesystemObject")
dim ts : set ts = fs.createTextFile("code.txt", true)

''' make static changes
t = replace(codeBase,"{1}","Fandango-2017")
codeBase = replace(t,"{3}","Fandango 2017")

for i = begNum to endNum
	' add sequence number
	t = replace(codeBase,"{2}",rPad(i,3))
	ts.writeLine t
next

ts.close
