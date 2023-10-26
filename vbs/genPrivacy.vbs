option explicit
'
' Generate a Privacy Policy for a website
'
'
'const templateFilename = "D:\SdosRemedios\Documents\Source\html\privacy-template.html"
const templateFilename  = "D:\SdosRemedios\Documents\Source\html\privacy-nouser-template.html"
const newPolciyFilename = "D:\SdosRemedios\Documents\Source\html\new-privacy-policy.html"

const varCompanyName    = "[company-name]"
const varCompanyEmail   = "[company-email]"
const varWebsiteName    = "[website-name]"
const varPrivacyURL     = "[privacy-url]"

const companyName       = "Steven dos Remedios"
const companyEmail      = "steven@meetthere.com"
const websiteName       = "meetthere.com"
'const privacyURL        = "https://meetthere.com/privacy"

dim fs : set fs = createObject("scripting.filesystemObject")
dim ts : set ts = fs.createTextFile(newPolciyFilename, true)

dim template : template = fs.openTextFile(templateFilename).readAll()

template = replace(template,varCompanyName, companyName)
template = replace(template,varCompanyEmail,companyEmail)
template = replace(template,varWebsiteName, websiteName)
'template = replace(template,varPrivacyURL, privacyURL)

ts.writeLine(template)
ts.close

wscript.echo template
