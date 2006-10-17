//-- FILEPICKER ----------------------
// used for filter of open/save file dialogs
var filterExt = "*.php;*.php2;*.php3;*.php4;*.php5;*.phpx;*.phtml;*.inc;*.phps";
var filterName = "PHP files (" + filterExt + ")";

//-- DIALOGS ----------------------
// get a reference to the prompt service component.
var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);

function getFilePicker()
{

}
/**
 *
 */

function dialogPickSourcefile()
{
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.appendFilter(filterName,filterExt);
	fp.init(window, getLocaleString("openReferenceFilepickerTitle"), nsIFilePicker.modeOpen);
	
	var res = fp.show();
	if (res == nsIFilePicker.returnOK)
	{
		sourceFilePath = fp.file.path;
		sourceFileName = fp.file.leafName;
		return true;
	}
	else
	{
		return false;
	}
}
		
		
/**
 *
 */
function dialogPickTranslationfile()
{
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.appendFilter(filterName,filterExt);
	fp.init(window, getLocaleString("openTranslationFilepickerTitle"), nsIFilePicker.modeOpen);	
	
	var res = fp.show();
	if (res == nsIFilePicker.returnOK)
	{
		translationFilePath = fp.file.path;
		return true;
	}
	else
	{
		return false;
	}
}		

/**
 *
 */
function dialogPickSaveFile()
{
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.appendFilter(filterName,filterExt);
	fp.init(window, getLocaleString("saveAsFilepickerTitle"), nsIFilePicker.modeSave);	
	
	var res = fp.show();
	if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace )
	{
		return fp.file;
	}
	else
	{
		return false;
	}
}
/**
 *
 */
 
function dialogConfirmNewTranslation()
{
	// show a confirm dialog with a checkbox
	return promptService.confirm(window,getLocaleString("newTranslationDialogTitle"),
	  getLocaleString("newTranslationDialog"));
}

/**
 *
 */
 
function showConfirmExitDialog()
{
	// set the buttons that will appear on the dialog
	var flags=promptService.BUTTON_TITLE_SAVE * promptService.BUTTON_POS_0 +
			  promptService.BUTTON_TITLE_CANCEL * promptService.BUTTON_POS_1 +
			  promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_2;
	
	// display the dialog
	return promptService.confirmEx(window,getLocaleString("saveTranslationDialogTitle"),
		  getLocaleString("saveTranslationDialog"),
		  flags, null, null, getLocaleString("saveTranslationDialogDontSaveButton"), null, {});
}

/**
 *
 */

function showConfirmChangeCharsetDialog()
{
	if( !dontShowAgain )
	{
		// checkResult will store the state of the check box
		var checkResult = {};
		
		// show a confirm dialog with a checkbox
		var returnValue = promptService.confirmCheck(window,getLocaleString("modifyCharsetDialogTitle"),
		  getLocaleString("modifyCharsetDialog"),
		  getLocaleString("modifyCharsetDialogCheckBox"),
		  checkResult);
		
		// if the check box was checked keep the state to not display it next time
		if (checkResult.value) dontShowAgain = true;
		
		return returnValue;
	}
	else
	{
		return true;
	}
}