option explicit

dim dateExpr : set dateExpr = new filePatternObject
dateExpr.site = "Chabot1"
wscript.echo dateExpr.yesterday()
wscript.echo dateExpr.month
wscript.echo dateExpr.curWDay
wscript.echo dateExpr.sourcePath ("N:\", "Chabot1")


class filePatternObject
	public rExpression
	Private siteName
	Private rootDate		'root date for calculations
	Private curDate
	Private curYear
	Private curMonth
	Private curDay
	Public curWDay

	private sub class_Initialize
		rExpression = ""
		siteName = ""
		rootDate = Date
		curDate	 = rootDate
		upDate
	end sub
	private sub class_Terminate

	end sub
	
	private sub upDate()
		curYear		= datePart("yyyy", curDate)
		curMonth 	= right("0" & datePart("m", curDate),2)
		curDay 		= right("0" & datePart("d", curDate),2)
		curWDay		= datePart("w", curDate)-1
	end sub
	
	Public Property let site(value)
		siteName = value
	end property
	
	property get month()
		month = curYear & "_" & curMonth
	end property
	
	property get sourcePath(drive, site)
		'N:\LBNL\data\2014_12
		siteName = site
		sourcePath = drive & siteName & "\data\" & me.month
	end property
	
	property get yesterday()
		curDate = dateAdd("d",-1,rootDate)
		upDate
		rExpression = siteName & "-" & curYear & "_" & curMonth & "_" & curDay & "-\d{2}"
		yesterday = rExpression
	end property
	
	property get thisMonth()
		curDate = dateAdd("d",-curDay+1,rootDate)
		upDate
		rExpression = siteName & "-" & curYear & "_" & curMonth & "_\d{2}-\d{2}"
		thisMonth = rExpression
	end property
	
	property get lastMonth()
		curDate = dateAdd("m",-1,rootDate)
		curDate = dateAdd("d",-curDay+1,curDate)
		upDate
		rExpression = siteName & "-" & curYear & "_" & curMonth & "_\d{2}-\d{2}"
		lastMonth = rExpression
	end property
end class