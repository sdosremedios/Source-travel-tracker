option explicit
dim objArgs, i
Set objArgs = WScript.Arguments

if objArgs.count < 2 then stop

dim lat : lat = cDbl(objArgs(0))
dim lon : lon = cDbl(objArgs(1))

dim oX : oX = 122.3470386266094 '122.348018
dim oY : oY = 37.88341926729986

wscript.echo
wscript.echo "lat = " & lat & ", lon = " & lon

display

sub display
	dim dx : dx = lon + oX
	dim dy : dy = oY  - lat

	dim x : x = dx * 11635 '11650
	dim y : y = dy * 14740

	wscript.echo "oX  = " &  oX  & ", oY  = " & oY
	wscript.echo "dX  = " & dx   & ", dY  = " & dy
	wscript.echo "X   = " &  x   & ", Y   = " & y
end sub