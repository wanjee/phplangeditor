/*
function useCurrent(){}
function goToNext(){}
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
				// test if the filename has an extension
				var re = /.+\..+$/;
				if( !re.test( filename ) )
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
	if( parseFile(loadFile(sourceFilePath, sourceCharsetString), 'source') )
	{
		fillStringCatalog( 'all' );
		
		// set work in progress flag
		translationInProgress = true;
		
		// enable interface elements
		enableOpenTranslation(true);
		enableSave(true);
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
	if( parseFile(loadFile(translationFilePath, translationCharsetString), 'translation') )
	{
		// refresh translation of selected field 
		useCurrent();
		// disable saveFilePath, 
		// to avoid the new translation to be saved on the previously saved file
		saveFilePath = null;
	}
}