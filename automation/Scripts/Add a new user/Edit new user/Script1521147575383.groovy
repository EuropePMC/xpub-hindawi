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
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testdata.TestDataFactory as TestDataFactory
import com.kms.katalon.core.testobject.ObjectRepository as ObjectRepository
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WSBuiltInKeywords
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUiBuiltInKeywords
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser(null)
WebUI.navigateToUrl('https://xpub-faraday.now.sh')

username = findTestObject("NewUser/username")
WebUI.click(username)
WebUI.setText(username, 'admin')

password = findTestObject("NewUser/password")
WebUI.click(password)
WebUI.setText(password, 'admin123')

login = findTestObject("NewUser/login")
WebUI.click(login)

admin = findTestObject("NewUser/admin")
WebUI.click(admin)

adminDashboard = findTestObject("NewUser/adminDashboard")
WebUI.click(adminDashboard)

users = findTestObject("NewUser/users")
WebUI.waitForElementVisible(users, 2)
WebUI.click(users)

editUserVlad = findTestObject("NuewUser/td_vlad.stegarunewuserthinslic")
WebUI.mouseOver(editUserVlad)
WebUI.waitForElementVisible(edit, 2)

edit = findTestObject("NewUSer/a_Edit")
WebUI.click(edit)

firstName = findTestObject("NewUser/firstName")
WebUI.click(firstName)
WebUI.setText(firstName, 'John')

lastName = findTestObject("NewUser/lastName")
WebUI.click(lastName)
WebUI.setText(lastName, 'Smith')

affiliation = findTestObject("NewUser/affiliation")
WebUI.click(affiliation)
WebUI.setText(affiliation, 'University')

title = findTestObject("NewUser/titleDropDown")
WebUI.click(title)

dr = findTestObject("NewUser/dr")
WebUI.click(dr)

editorInChief = findTestObject("NewUser/editorInChief")
WebUI.click(editorInChief)

save = findTestObject("NewUser/save")
WebUI.click(save)









