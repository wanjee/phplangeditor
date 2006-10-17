/*
commandes : 

- open reférence
- open translation
- save ( 
- save as ( select a file )
- select a var
- go to next var
- change source charset
- change translation charset
- view all
- view untranslated
- close 

function rqOpenSource(){}
function rqOpenTranslation(){}
function rqSave(){}
function rqSaveAs(){}
function useCurrent(){}
function goToNext(){}
function setSourceCharset(){}
function setTranslationCharset(){}
function viewAll(){}
function viewUnstranslated(){}
function showAbout
function rqQuit(){}
}
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
 * Set filter to view all strings
 *
 * @author Fragile
 */
 
function filterViewAll()
{
	fillStringCatalog('all');
	interfaceSetFilterView( 'all' );
}

/**
 * Set filter to view only unstranslated strings
 *
 * @author Fragile
 */
 
function filterViewUnstranslated()
{
	fillStringCatalog('empty');
	interfaceSetFilterView( 'untranslated' );
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
		openTranslationDisable(false);
		saveDisable(false);
		goToNextDisable(false);

		interfaceSetFilterView( 'all' );
		
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




/*********************************************************
					LOAD A FILE 
 *********************************************************/
/**
 *
 */
  
function loadFile( filePath, aCharset ) 
{
	try 
	{
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} 
	catch (e) 
	{
		alert("Permission to read file was denied.");
		return false;
	}
	
	var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( filePath );

	if ( file.exists() == false ) 
	{
		alert("File does not exist");
		return false;
	}

	// see http://developer.mozilla.org/en/docs/Reading_textual_data
	// read file content
	const replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
	
	var fis = Components.classes["@mozilla.org/network/file-input-stream;1"]
				.createInstance( Components.interfaces.nsIFileInputStream );

	fis.init( file, 0x01, 00004, null);	
				
	var is = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
				.createInstance( Components.interfaces.nsIConverterInputStream );
				
	is.init(fis, aCharset, 1024, replacementChar);

	var lis = is.QueryInterface(Components.interfaces.nsIUnicharLineInputStream);

	var data = '';
	var line = {};
	var cont;
		
	do 
	{
		cont = lis.readLine(line);
		data += line.value + "\n";
	}
	while( cont ) 
	
	is.close();
	

	return data;
}


/*********************************************************
							SAVE
 *********************************************************/
/**
 *
 */
function saveFile()
{
	var file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( saveFilePath );
	if ( file.exists() == false ) 
	{
		file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
	}
	
	var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
					.createInstance( Components.interfaces.nsIFileOutputStream );

	fos.init( file, 0x04 | 0x08 | 0x20, 420, 0 );
	
	var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
					.createInstance(Components.interfaces.nsIConverterOutputStream);

	cos.init( fos, translationCharsetString, 0, 0x0000 );

	var output = "<?php\n";

	for ( key in fields )
	{
		output += "$" + key + ' = \'' + fields[key][1] + '\';\n';
	}
	
	output += "?>";
	
	cos.writeString( output );
	cos.flush();
	cos.close();
	
	// change saving state
	needSaveFlag = false;
	
	return true;
}

/*********************************************************
				PARSE PHP FILE
 *********************************************************/
/**
 *
 */
function parseFile( fileContent, type )
{
	if( type == 'source' ) 
		var typeIsSource = true;
	else
		var typeIsSource = false;
		
	//-- file definition
	var commentsDelimiters = new Array();
	commentsDelimiters['//'] 	= "\n";
	commentsDelimiters['#'] 	= "\n";
	commentsDelimiters['/*']	= "*/";	

	var escapeChar = "\\";

    // used when in a a var but not between some [ ]
	var re = /[\w]/;  // \w == [a-zA-Z0-9_]
	// used when between [ and ] in an array var because there we may have a space or quotes  or dot (.) or hyphen (-)
	var reInArray = /[^\[\]]/;
	
	var contentLength = fileContent.length;

	var thisChar;
	
	var openString = ''; // quotemark use to open last string we met
	var inVar = false; // true if we are in a normal var $varname, or in an array var after a ]
	var inArrayVar = false; // true if we are in a array var $array['varname'], when between [ and ]
	var lastOpenPos = 0; // position of the last string/variable opening (first char right after the quotemark)
	
	var lastVar; // keep the name of the last var
	
	var isEscaped = false;
	
	for( var i = 0; i < contentLength; i++ )
	{
		thisChar = fileContent.substr(i, 1);
		
		if( inVar )
		{
			// if we detect a [ in the varname it means this is an array var
			if( thisChar =='[' )
			{
				inVar = false;
				inArrayVar = true;
			}
			else if( !re.test(thisChar) )
			{
				lastVar = fileContent.substr( lastOpenPos, i - lastOpenPos );
				inVar = false;
			}
		}
		else if( inArrayVar )
		{
			// when we are in a array type var, between the [ ] we can have some other chars like space, quotes, dot, hyphens
			// so the regex has to be different
			// if we meet a ] go back to normal use of
    		if( thisChar == ']' )
			{
				inVar = true;
				inArrayVar = false;
			}
			else if( !reInArray.test(thisChar) )
			{
				lastVar = fileContent.substr( lastOpenPos, i - lastOpenPos );
				inVar = false;
				inArrayVar = false;
			}
		}
		else if( isEscaped )
		{
			// thisChar is escaped
			isEscaped = false;
		}
		// if we match the escape char
		else if( thisChar == escapeChar )
		{
			// set the escape flag to escape the next char
			isEscaped = true;
		}
		// if we match the end of a string
		else if( thisChar == openString )
		{
			// end of the last string
			//alert(lastOpenPos + " " + (i - lastOpenPos) + " " + fileContent.substr( lastOpenPos, i - lastOpenPos ));
			
			if( lastVar != '' && isDefined(lastVar) )
			{
				if( typeIsSource )
				{
					if( typeof(fields[lastVar]) == 'undefined' )
					{					
						fields[lastVar] = new Array();
						fields[lastVar][1] = ''; // translation
					}
					fields[lastVar][0] = fileContent.substr( lastOpenPos, i - lastOpenPos ); //string to translate						
				}
				else
				{
					if( typeof(fields[lastVar]) != 'undefined' )
					{
						fields[lastVar][1] = fileContent.substr( lastOpenPos, i - lastOpenPos );
					}
				}
			}
			openString = '';
		}
		// if we are not in a string
		else if( openString == '' ) 
		{
			// check for string delimiters
			if( thisChar == '"' || thisChar == '\'' )
			{
				// beginnning of a string
				openString = thisChar;	
				lastOpenPos = i + 1;
			}
			// check for a variable delimiter
			else if( thisChar == '$' )
			{
				inVar = true;
				lastOpenPos = i + 1;			
				lastVar = '';
			}
			// check for a comment
			else if( thisChar == '#' || thisChar == '/' )
			{
				// check if we match the start of a comment
				for ( openTag in commentsDelimiters )
				{
					// take the next chars according to the length of the opening tag
					var testStr = fileContent.substr( i , openTag.length);
					
					if( testStr == openTag )
					{
						// find position of closing tag
						//var restOfContent = fileContent.substr(i, contentLength - i);
						//var closePos = restOfContent.indexOf(commentsDelimiters[openTag]);
						var closePos = fileContent.indexOf(commentsDelimiters[openTag], i);

						var openPos = i;
						// increment iterator to continue parsing from the end of the comment line
						i = closePos + commentsDelimiters[openTag].length - 1;
						//alert("-" + fileContent.substr(openPos-5,10) + "." + "\ncomment : \n" + fileContent.substr(openPos,i - openPos) + "\n" + fileContent.substr(i,1) + "\nopenPos : " + openPos + "\ni - openPos : " + (i - openPos) + "\nclosePos : " + closePos +  "\ncommentsDelimiters[openTag].length : " + commentsDelimiters[openTag].length);
						break; // exist from the opentag loop, we have found what we were looking for
					}
				}
			} // else do nothing, it's a 'we don't care'-char
		}
	}
	return true;
}
