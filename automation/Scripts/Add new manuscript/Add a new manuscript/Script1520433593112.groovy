import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.checkpoint.CheckpointFactory as CheckpointFactory
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as MobileBuiltInKeywords
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testcase.TestCaseFactory as TestCaseFactory
import com.kms.katalon.core.testdata.InternalData
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testdata.TestDataFactory as TestDataFactory
import com.kms.katalon.core.testobject.ObjectRepository as ObjectRepository
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WSBuiltInKeywords
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUiBuiltInKeywords
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import internal.GlobalVariable as GlobalVariable
import org.junit.After as After
import org.openqa.selenium.Keys as Keys
import java.util.*

WebUI.openBrowser(null)

WebUI.navigateToUrl('https://xpub-faraday.now.sh')

username = findTestObject('SignIn/usernameField')

WebUI.click(username)

WebUI.setText(username, 'admin')

password = findTestObject('SignIn/passwordField')

WebUI.click(password)

WebUI.setText(password, 'admin123')

loginButton = findTestObject('SignIn/LoginButton')

WebUI.click(loginButton)

/*manuscriptBoard = findTestObject("Resume/manuscriptBoard")

def manuscriptIds = []
for(i= 0; i=manuscriptIds.size(); i++){
	
	manuscriptIds << newButton = findTestObject('NewManuscript/journalfFieldSelection/New')
	
	WebUI.click(newButton)
}*/

//GlobalVariable.G_manuscriptID = '1231234'

journal = findTestObject('NewManuscript/journalfFieldSelection/Journal')
WebUI.click(journal)

hindawiFaraday = findTestObject('NewManuscript/journalfFieldSelection/HindawiFaraday')
WebUI.click(hindawiFaraday)


issue = findTestObject('NewManuscript/journalfFieldSelection/Issue')

WebUI.click(issue)

regularIssues = findTestObject('NewManuscript/journalfFieldSelection/RegularIssues')

WebUI.click(regularIssues)

nextButton = findTestObject('NewManuscript/journalfFieldSelection/Next')

WebUI.click(nextButton)

hasEmail = findTestObject('NewManuscript/preSubmissionChecklist/hasEmail')
WebUI.check(hasEmail)

hasManuscript = findTestObject('NewManuscript/preSubmissionChecklist/hasManuscript')
WebUI.check(hasManuscript)

hasEfiles = findTestObject('NewManuscript/preSubmissionChecklist/hasEfiles')
WebUI.check(hasEfiles)

awareAndAccept = findTestObject('NewManuscript/preSubmissionChecklist/awareAndAccept')
WebUI.check(awareAndAccept)

hasOrcid = findTestObject('NewManuscript/preSubmissionChecklist/hasOrcid')
WebUI.check(hasOrcid)

submissionInstitutional = findTestObject('NewManuscript/preSubmissionChecklist/submissionInstitutional')
WebUI.check(submissionInstitutional)

Next = findTestObject('NewManuscript/preSubmissionChecklist/Next')
WebUI.click(Next)

manuscriptTitle = findTestObject('NewManuscript/manuscriptAuthorsDetails/manuscriptTitle')
WebUI.click(manuscriptTitle)

WebUI.sendKeys(manuscriptTitle, 'A new random title')

manuscriptType = findTestObject('NewManuscript/manuscriptAuthorsDetails/manuscriptType')
WebUI.click(manuscriptType)

research = findTestObject('NewManuscript/manuscriptAuthorsDetails/review')

WebUI.click(research)

abstractField = findTestObject('NewManuscript/manuscriptAuthorsDetails/abstractField')

WebUI.click(abstractField)

WebUI.sendKeys(abstractField, 'A new random abstract text')

addAuthor = findTestObject('NewManuscript/manuscriptAuthorsDetails/addAuthor')

WebUI.click(addAuthor)

firstName = findTestObject('NewManuscript/manuscriptAuthorsDetails/firstName')

WebUI.setText(firstName, 'Vlad')

lastName = findTestObject('NewManuscript/manuscriptAuthorsDetails/lastName')

WebUI.setText(lastName, 'Stegaru')

email = findTestObject('NewManuscript/manuscriptAuthorsDetails/email')

WebUI.setText(email, 'vlad.stegaru+newuser1@thinslices.com')

affiliation = findTestObject('NewManuscript/manuscriptAuthorsDetails/affiliation')

WebUI.setText(affiliation, 'University')

country = findTestObject('NewManuscript/manuscriptAuthorsDetails/country')

WebUI.click(country)

Canada = findTestObject('NewManuscript/manuscriptAuthorsDetails/countryOption')

WebUI.click(Canada)

SaveButton = findTestObject('NewManuscript/manuscriptAuthorsDetails/Save')

WebUI.click(SaveButton)

noButton = findTestObject('NewManuscript/manuscriptAuthorsDetails/no')

WebUI.click(noButton)

NextButton = findTestObject('NewManuscript/manuscriptAuthorsDetails/Next')

WebUI.click(NextButton)

//attachFile = findTestObject('NewManuscript/manuscriptFilesUpload/attachManuscript')

//WebUI.uploadFile(attachFile, '/Users/vladstegaru/Documents/Hindawi/attachements/document.pdf')

submitManuscript = findTestObject('NewManuscript/manuscriptFilesUpload/submitManuscript')

WebUI.click(submitManuscript)

goToDashboard = findTestObject('Resume/goToDashboard')

WebUI.click(goToDashboard)

WebUI.closeBrowser()

