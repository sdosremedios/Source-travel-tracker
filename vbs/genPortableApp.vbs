' genPortableApp
'
' build files needed to make an installer
'
' 21-Nov-2020 Steven dosRemedios
'
option explicit
const newLoc        = "D:\SdosRemedios\Desktop\"
const tmplDir       = "D:\SdosRemedios\nextcloud\Source\data\portableAppTemplate\"

dim pApp : set pApp     = new generator

pApp.appID              = "ZimPortable"
pApp.applicationName    = "ZimPortable 0.73.5"
pApp.shortName 			= "Zim"
pApp.publisher          = "Steven dosRemedios"
pApp.category           = "Office"	'Development, Graphics and Pictures, Internet
									'Music and Video, Office,Other, Security, Utilities
pApp.description        = "https://www.zim-wiki.org"
pApp.description        = "Wiki Application"
pApp.version            = "0.73.5.0"
pApp.executablePath     = "Zim"
pApp.executableFile     = "Zim"

pApp.templateDir        = tmplDir
pApp.targetDir          = newLoc
pApp.generate

class generator
    public  rootDir
    public  newDir
    public  appName
	public	shortName
    public  appID
    public  pubName
    public  category
    public  descript
    public  ver
    public  executable
    public	execPath
    private fs
'   private newFolder

	private sub Class_Initialize
		set fs      = CreateObject("Scripting.FileSystemObject")
		execFolder	= ""
    end sub

    private sub Class_Terminate
        set fs      = nothing
    end sub

    public sub generate
        dim folderName 		: folderName = newLoc & appID
'       log "Create", folderName
'       dim newFolder    	: set newFolder    = checkFolder(folderName, true)
'       dim appFolder    	: set appFolder    = fs.createFolder(folderName & "\App")
'       dim infoFolder   	: set infoFolder   = fs.createFolder(folderName & "\App\AppInfo")
'       dim launchFolder 	: set launchFolder = fs.createFolder(folderName & "\App\AppInfo\Launcher")

        checkFolder folderName, true
        checkFolder folderName & "\App\AppInfo\Launcher", false
        checkFolder folderName & "\Other\Help\images", false

        buildLauncher folderName
        buildApp folderName
        buildHTML folderName
    end sub

'   D:\bin\data\portableAppTemplate\App\AppInfo\Launcher
    private sub buildLauncher(folderName)
        dim ts   : set ts = fs.OpenTextFile(rootDir & "App\AppInfo\Launcher\appID.txt")
        dim text : text = ts.readAll
        ts.close

        text = replace(text,"{shortName}",shortName)
        text = replace(text,"{execPath}",execPath)
        text = replace(text,"{executableFile}",executable)

        dim fileName : fileName = folderName & "\App\AppInfo\Launcher\" & appID & ".ini"
        log "Write", fileName
        set ts = fs.openTextFile(fileName, 2, true)
        ts.writeLine(text)
        ts.close
        set ts = nothing
    end sub

'   D:\bin\data\portableAppTemplate\
    private sub buildHTML(folderName)
        dim ts   : set ts = fs.OpenTextFile(rootDir & "\help.html")
        dim text : text = ts.readAll
        ts.close

        text = replace(text,"{shortName}",appName)
        text = replace(text,"{description}",descript)

        dim fileName : fileName = folderName & "\help.html"
        log "Write", fileName
        set ts = fs.openTextFile(fileName, 2, true)
        ts.writeLine(text)
        ts.close
        set ts = nothing
    end sub

'   D:\bin\data\portableAppTemplate\App\AppInfo
    private sub buildApp(folderName)
        dim fileName : fileName = rootDir & "App\AppInfo\appinfo.txt"
        log "Read", filename
        dim text : text = fs.OpenTextFile(fileName).readAll 
        text = replace(text,"{appName}",appName)
        text = replace(text,"{appID}",appID)
        text = replace(text,"{publisher}",pubName)
        text = replace(text,"{category}",category)
        text = replace(text,"{description}",descript)
        text = replace(text,"{version}",ver)

        fileName = folderName & "\App\AppInfo\appinfo.ini"
        log "Write", filename
        fs.openTextFile(fileName, 2, true).writeLine(text)
		
'		log "create folder", folderName & "\App\" & execPath
		createFolders folderName & "\App\" & execPath

        fs.copyFile 	rootDir & "help.html", folderName & "\help.html" 
'       fs.copyFile 	rootDir & "App\AppInfo\appicon.ico", folderName & "\App\AppInfo\appicon.ico" 
'       fs.copyFile 	rootDir & "App\AppInfo\appicon_16.png", folderName & "\App\AppInfo\appicon_16.png" 
'       fs.copyFile 	rootDir & "App\AppInfo\appicon_32.png", folderName & "\App\AppInfo\appicon_32.png" 
		
		dim fld
		set fld = fs.getFolder(rootDir & "App\AppInfo")
		fld.copy folderName & "\App\AppInfo"
		set fld = fs.getFolder(rootDir & "\Other\Help\images")
		fld.copy folderName & "\Other\Help\images"
        
	end sub

    private sub createFolders(folderName)	'RECURSIVE!!
		dim d, f, e
		if fs.folderExists(folderName) then
			exit sub
		else 
			createFolders fs.GetParentFolderName (folderName)
		end if
		log "create folder", folderName
		fs.createFolder(folderName)
	end sub
	
	private function checkFolder(folderName, delete)
		if fs.folderExists(folderName) then
			if delete then 
				fs.deleteFolder(folderName)
			end if
		end if
		createFolders folderName
		set checkFolder = fs.getFolder(folderName)
	end function

	public property let templateDir(text)
        rootDir = text
    end property

    public property let targetDir(text)
        newDir = text
    end property

    public property let applicationName(text)
        appName = text
    end property

    public property let publisher(text)
        pubName = text
    end property

    public property let categoryName(text)
        category = text
    end property

    public property let description(text)
        descript = text
    end property

    public property let version(text)
        ver = text
    end property

    public property let executablePath(text)
        execPath = text
    end property

    public property let executableFile(text)
        executable = text
    end property

    private sub log(label,text)
        wscript.echo right(space(20) & label,20) & ": " & text
    end sub
end class
