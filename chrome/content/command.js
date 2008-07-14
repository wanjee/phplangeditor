/*
function useCurrent(){}
function setSourceCharset(){}
function setTranslationCharset(){}
*/

/**
 * Used to choose and open the reference file
 *
 * @author Fragile
 */
 
function rqOpenSource()
{
	if( translationInProgress ) 
	{
		if( dialogConfirmNewTranslation() )
		{
			// re-initialise application
			exNewTranslation();
		}
		else
		{
			return false;
		}
	}

	// let's choose the file
	if( dialogPickSourcefile() )
	{
		// if a file has been choosen the source file path is set
		// load the new source file
		exOpenSourceFile();
		return true;
	}
	else
	{
		return false;
	}
}

/**
 * Used to choose and open the translation file
 *
 * @author Fragile
 */

function rqOpenTranslation()
{
	// let's choose the file
	if( dialogPickTranslationfile() )
	{
		// if a file has been choosen the translation file path is set
		// load the new translation file
		exOpenTranslationFile();
		return true;
	}
	else
	{
		return false;
	}
}

/**
 * Save the file, will show a file picker if file is not known
 *
 * @author Fragile
 */
 
function rqSave()
{
	try
	{
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserWrite");
	}
	catch(e)
	{
		alert("Permission to save file was denied.");
		return false;
	}
	
	if( !saveFilePath )
	{
		// saveFileAs will call saveFile if successfull
		var pickedFile = dialogPickSaveFile();
		
		if( pickedFile )
		{
			var path = pickedFile.path;  // complete path of the file : path/filename
			var filename = pickedFile.leafName; // name of the file
			
			if( path )
			{
				if( getFileExtension(filename) == '' )
				{
					// if the filename doesn't have an extension add '.php'
					path = path + '.php';
				}
				saveFilePath = path;
			}
		}
		else
		{
			return false;
		}
	}

	saveFile();
}

/**
 * Save as is a save operation with target file not known
 *
 * @author Fragile
 */
function rqSaveAs()
{
	saveFilePath = null;
	
	rqSave();
}


/**
 * User has selected the source charset
 *
 * @author Fragile
 */

function setSourceCharset()
{	
	if( !translationInProgress || showConfirmChangeCharsetDialog() )
	{
		sourceCharsetString = sourceCharsetList.value;
		// reopen the reference file to read it with the choosen charset
		if( sourceFilePath ) exOpenSourceFile();
	}
	else
	{
		// user has cancelled charset change so display the previously selected charset
		sourceCharsetList.value = sourceCharsetString;
		
	}
}
 
/**
 * User has selected the translation charset
 *
 * @author Fragile
 */
 
function setTranslationCharset()
{
	translationCharsetString = translationCharsetList.value;
	// reopen the translation file to read it with the choosen charset
	if( translationFilePath ) exOpenTranslationFile();
}

/**
 * Set filter to view all strings
 *
 * @author Fragile
 */
 
function filterViewAll()
{
	fillStringCatalog('all');
}

/**
 * Set filter to view only unstranslated strings
 *
 * @author Fragile
 */
 
function filterViewUnstranslated()
{
	fillStringCatalog('empty');
}

/**
 * Jump to previous string to translate
 *
 * @author Yannick Warnier
 */
function goToPrevious()
{
    // get index of previous element, or last if the current item is the first one
	if ( stringCatalog.currentIndex > 0 )
		var previousItemIndex = stringCatalog.currentIndex - 1;
	else
		var previousItemIndex = collection.size()-1;

	// select previous item
	stringCatalog.view.selection.select( previousItemIndex );
	// ensure the selected row will be displayed
	stringCatalog.treeBoxObject.ensureRowIsVisible( previousItemIndex );
	// select all the text in the translation textbox
	translationBox.select();
	// give focus back to the translation textbox
	translationBox.focus();	
}


/**
 * Jump to next string to translate
 *
 * @author Fragile
 */
function goToNext()
{
    // get index of next element, or 0 if the current item is the last one
	if ( stringCatalog.currentIndex < collection.size()-1 )
		var nextItemIndex = stringCatalog.currentIndex + 1;
	else
		var nextItemIndex = 0;

	// select next item
	stringCatalog.view.selection.select( nextItemIndex );
	// ensure the selected row will be displayed
	stringCatalog.treeBoxObject.ensureRowIsVisible( nextItemIndex );
	// select all the text in the translation textbox
	translationBox.select();
	// give focus back to the translation textbox
	translationBox.focus();	
}


/**
 * If the current has been modified and not saved ask a confirmation to user
 *
 * @author Fragile
 */
 
function doQuit()
{
	if( needSaveFlag )
	{
		var quitAction = showConfirmExitDialog();
		
		if( quitAction == 0 ) // Save
		{
			if( saveFile() ) 	return true;		
			else				return false;
		}
		else if( quitAction == 2 ) // don't save
		{
			return true;
		}	
		else //( quitAction == 1 )	 // cancel
		{
			return false;
		}
	}
	else
	{
		return true;
	}
}

/**
 * Close the window after a doQuit
 *
 * @author Fragile
 */
 
function closeWindow()
{
	if( doQuit() )
	{
		window.close();
	}
	return true;
}

/**
 * Open the open and about window
 *
 * @author Fragile
 */
 
function showAbout()
{
	window.open('chrome://phplangeditor/content/aboutdialog.xul','','chrome,centerscreen');
}	
/*********************************************************
				SOURCE FILE HANDLING
 *********************************************************/
/**
 *
 */
function exOpenSourceFile()
{
	var data = loadFile(sourceFilePath, sourceCharsetString);
	
	if( getFileFormat(sourceFilePath) == 'ini' )
	{
		var isParsingOk = parseIni(data, 'source');
	}
	else
	{
		var isParsingOk = parsePhp(data, 'source');
	}
	
	if( isParsingOk )
	{
		fillStringCatalog( 'all' );
		
		// set work in progress flag
		translationInProgress = true;
		
		// enable interface elements
		enableOpenTranslation(true);
		enableSave(true);
		enableGoToPrevious(true);
		enableGoToNext(true);

		enableFilterView(true);
		
		// adapt description
		statusbarContent.label = sourceFileName;
		
		// disable saveFilePath, 
		// to avoid the new translation to be saved on the previously saved file
		saveFilePath = null;
	}
}


/*********************************************************
				TRANSLATION FILE HANDLING
 *********************************************************/
/**
 *
 */ 
function exOpenTranslationFile()
{
	var data = loadFile(translationFilePath, translationCharsetString);
	
	if( getFileExtension(translationFilePath) == 'ini' )
	{
		var isParsingOk = parseIni(data, 'translation');
	}
	else
	{
		var isParsingOk = parsePhp(data, 'translation');
	}

	
	if( isParsingOk )
	{
		// refresh translation of selected field 
		useCurrent();
		// disable saveFilePath, 
		// to avoid the new translation to be saved on the previously saved file
		saveFilePath = null;
	}
}