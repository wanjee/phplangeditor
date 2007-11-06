// global vars

//-- INTERFACE ----------------------
//-- descriptions
var statusbarContent;

//-- textbox
var originalStringBox;
var translationBox;
	
//-- list
var stringCatalog;

//-- charset
// used for source file opening
var sourceCharsetList;
// used for translation file opening and saving of translation
var translationCharsetList;

var sourceCharsetListPopup;
var translationCharsetListPopup;

// End of Interface elements


// array of id, varname, original translation, new translation, string delimiter
var fields = new Array();

// name of the currently selected var
var currentItem = '';

// collection is a 'collection' of items that will be in the view (in the tree)
var collection = null;

//-- FILES ----------------------
// path of the source
var sourceFilePath = null;
// name of the source 
var sourceFileName = null;

// path of a "work in progress" file (translation file)
var translationFilePath = null;

// path of the file to save to - saveFile will write into this
var saveFilePath = null; 

//-- STATE ----------------------
// state of application : if true there is a file opened
var translationInProgress = false;
// true if there is new changes since last save
var needSaveFlag = false;
// true if the charset confirmation has not to be shown again
var dontShowAgain = false;

//-- CHARSET ----------------------
// UTF-8 will be use as default if prefs cannot be read
var defaultCharset = 'UTF-8';
var sourceCharsetString;
var translationCharsetString;

/*********************************************************
						STARTUP
 *********************************************************/
/**
 * Function used to init the application at launch
 *
 * @author Piraux Sebastien <pir@cerdecam.be>
 * @desc 	- init all 'element' vars
 *			- handle charset menu
 *          - start a new session of work
 */
function startup()
{
	//-- descriptions
	statusbarContent			= document.getElementById('statusbarContent');

	//-- textbox
	originalStringBox			= document.getElementById('originalString-box');
	translationBox				= document.getElementById('translatedString-box');
	
	//-- list
	stringCatalog				= document.getElementById('fieldsList');
	
	//-- charset
	sourceCharsetList			= document.getElementById('sourceCharsetList');
	translationCharsetList		= document.getElementById('translationCharsetList');
	
	sourceCharsetListPopup		= document.getElementById('sourceCharsetListPopup');
	translationCharsetListPopup	= document.getElementById('translationCharsetListPopup');

	//--------
	
	//-- set default charset
	sourceCharsetString = defaultCharset;
	translationCharsetString = defaultCharset;
	
	//-- fill charset lists
	fillCharsetLists();
	
	// start a new translation
	exNewTranslation();
}

/*********************************************************
					NEW TRANSLATION
 *********************************************************/
/**
 * Function used to start a new session
 *
 * @author Piraux Sebastien <pir@cerdecam.be>
 * @desc 	- disable some interface elements
 *          - empty the 2 textzones
 *          - (re)init array of all vars and translations
 *          - empty the list of vars in interface
 */
function exNewTranslation()
{
	// disable some interface elements
	enableOpenTranslation(false);
	enableSave(false);
	enableGoToNext(false);
	enableGoToPrevious(false);

	enableFilterView(false);
	
    // adapt description
	statusbarContent.label = "";
	
	// empty text zones
	originalStringBox.value = "";
	translationBox.value = "";
	
	// will be set the true when the source file will be opened
	translationInProgress = false;
	
	// reset paths
	sourceFilePath = null;
	translationFilePath = null;
	saveFilePath = null;
	
	// (re)init array of all vars and translations
	fields = new Array();

 	// empty the list of vars in interface
	emptyStringCatalog();
}





/*********************************************************
						MODEL
 *********************************************************/
function treeModel()
{
  	this.rowCount = collection.size();

	this.getCellText = function(row,col)
	{
		return collection.get(row);
 	}
	this.setTree = function(treebox){ this.treebox = treebox; }
	this.isContainer = function(row){ return false; }
	this.isSeparator = function(row){ return false; }
	this.isSorted = function(row){ return false; }
	this.getLevel = function(row){ return 0; }
	this.getImageSrc = function(row,col){ return null;}
	this.getRowProperties = function(row,props) {}
	this.getCellProperties = function(row,col,props){}
	this.getColumnProperties = function(colid,col,props) {}
}
/*********************************************************
				COLLECTIONS
 *********************************************************/
function completeCollection()
{
	var items = new Array();
	
	for ( key in fields )
	{
        // display all vars
		items.push(key);
	}

	this.get  = function(index) { return items[index]; }
	this.size = function() { return items.length; }
	this.getArray = function() { return items; }
}

function untranslatedCollection()
{
	var items = new Array();

	for ( key in fields )
	{
        // display only vars without translation
		if ( fields[key]['translation'] == "" ) items.push(key);
	}

	this.get  = function(index) { return items[index]; }
	this.size = function() { return items.length; }
	this.getArray = function() { return items; }
}

function emptyCollection()
{
	var items = new Array();

	// empty collection so ... the items remains empty

	this.get  = function(index) { return items[index]; }
	this.size = function() { return 0; }
	this.getArray = function() { return items; }
}


/*********************************************************
						OTHERS
 *********************************************************/
 
/**
 * Use selected item
 *
 * @author Fragile
 */
 
function useCurrent()
{
	// value of selected element in view
    currentItem = collection.get(stringCatalog.currentIndex);

	if( isDefined(fields[currentItem]['original']) )
	{
		originalStringBox.value = fields[currentItem]['original'];
	}
	else
	{
		originalStringBox.value = "";
	}

	if( isDefined(fields[currentItem]['translation']) )
	{
		translationBox.value = fields[currentItem]['translation'];
	}
	else
	{
		translationBox.value = "";
	}
}

function saveCurrentItem()
{
	// handle the double quotes problem
	// replace possible \" by " and then replace all " by \"
	var translated = translationBox.value.replace(/\\\"/g, '"');
	translated = translated.replace(/\"/g, '\\"');
	
	// memorise new translation
	fields[currentItem]['translation'] = translated;
	
	// change saving state
	needSaveFlag = true;
}

function fillStringCatalog( mode )
{
	// empty listbox to avoid duplicate entries
	emptyStringCatalog();

	// empty text zones
	originalStringBox.value = "";
	translationBox.value = "";

	if ( mode == 'empty' )
		collection = new untranslatedCollection();
	else
		collection = new completeCollection();

	// refresh the view
	stringCatalog.view = new treeModel();

	// select first item 
	stringCatalog.view.selection.select( 0 );
}


function emptyStringCatalog()
{
	// reset the collection, so the view will be empty
	collection = new emptyCollection();

 	stringCatalog.view = new treeModel();
}



/*********************************************************
						CHARSET
 *********************************************************/
var sourceCharsetListListener = {
	item: null,
	willRebuild : function(builder) {
		// do nothing
	},
	didRebuild : function(builder) {
    	sourceCharsetList.value = sourceCharsetString;
	}
};

var translationCharsetListListener = {
	item: null,
	willRebuild : function(builder) {
		// do nothing
	},
	didRebuild : function(builder) {
    	translationCharsetList.value = translationCharsetString;
  	}
};

function fillCharsetLists()
{	
	var RDF = Components.classes["@mozilla.org/rdf/rdf-service;1"].
            getService(Components.interfaces.nsIRDFService);
	
	var ds = RDF.GetDataSourceBlocking("chrome://phplangeditor/content/charsets.rdf");
	
	sourceCharsetListPopup.builder.addListener(sourceCharsetListListener);
	sourceCharsetListPopup.database.AddDataSource(ds);
	sourceCharsetListPopup.builder.rebuild();
	
	translationCharsetListPopup.builder.addListener(translationCharsetListListener);
	translationCharsetListPopup.database.AddDataSource(ds);
	translationCharsetListPopup.builder.rebuild();
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

	// get output depending on file type
	if( getFileExtension(saveFilePath) == 'ini' )
	{
		var output = getIniStream();
	}
	else
	{
		var output = getPhpStream();
	}

	
	cos.writeString( output );
	cos.flush();
	cos.close();
	
	// change saving state
	needSaveFlag = false;
	
	return true;
}

function getPhpStream()
{
	var output = "<?php\n";

	var translationString = '';
	for ( key in fields )
	{
		translationString = addslashes(fields[key]['translation'],fields[key]['stringDelimiter']);
		output += "$" + key + ' = ' + fields[key]['stringDelimiter'] + translationString + fields[key]['stringDelimiter'] + ';\n';
	}
	
	output += "?>";
	
	return output;
}

function getIniStream()
{
	var output = "";
	
	for ( key in fields )
	{
		output += "" + key + ' = ' + fields[key]['translation'] + '\n';
	}
		
	output += "";
	
	return output;
}

function getFileExtension(filename)
{
	var lastPoint = filename.lastIndexOf(".");
	
	if ( lastPoint == -1 || lastPoint == filename.length - 1)
	{
		return "";
	}
	else
	{
		return filename.substring(lastPoint+1,filename.length).toLowerCase();
	}
}