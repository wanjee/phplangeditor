// global vars

//-- INTERFACE ----------------------
//-- keys
var openSourceKey;
var openTranslationKey;
var saveKey;
var goToNextKey;
	
//-- menuitems
var openSourceMenu;
var openTranslationMenu;
var saveMenu;
var saveAsMenu;
var goToNextMenu;
	
var viewAllMenu;
var viewUntranslatedMenu;
	
//-- buttons
var openSourceBtn;
var saveBtn;
var openTranslationBtn;
var viewAllBtn;
var viewUntranslatedBtn;
var goToNextBtn;

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

// array of id, varname, original translation, new translation
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
	// object references 
    
	//-- keys
	openSourceKey				= document.getElementById('openSourceKey');
	openTranslationKey			= document.getElementById('openTransKey');
	saveKey						= document.getElementById('saveKey');
	goToNextKey					= document.getElementById('goToNextKey');
	
	//-- menuitems
	openSourceMenu				= document.getElementById('openSourceMenu');
	openTranslationMenu			= document.getElementById('openTransMenu');
	saveMenu					= document.getElementById('saveMenu');
	saveAsMenu					= document.getElementById('saveAsMenu');
	goToNextMenu				= document.getElementById('goToNextMenu');
	
	viewAllMenu					= document.getElementById('viewAllMenu');
	viewUntranslatedMenu		= document.getElementById('viewUntranslatedMenu');
	
	//-- buttons
	goToNextBtn					= document.getElementById('goToNextBtn');
	openSourceBtn				= document.getElementById('openSourceBtn');
	saveBtn 					= document.getElementById('saveBtn');	
	openTranslationBtn 			= document.getElementById('openTransBtn');

	viewAllBtn					= document.getElementById('viewAllBtn');
	viewUntranslatedBtn			= document.getElementById('viewUntranslatedBtn');

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
	setDefaultCharset();
	
	//-- fill charset lists
	fillCharsetLists();
	
	// start a new translation
	exNewTranslation();
}

/*********************************************************
						QUIT
 *********************************************************/
 
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

function closeWindow()
{
	if( doQuit() )
	{
		window.close();
	}
	return true;
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
	openTranslationDisable(true);
	saveDisable(true);
	goToNextDisable(true);

	interfaceSetFilterView( 'none' );
	
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
		if ( fields[key][1] == "" ) items.push(key);
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
	this.size = function() { return items.length; }
	this.getArray = function() { return items; }
}


/*********************************************************
						OTHERS
 *********************************************************/
 
function useCurrent()
{
	// value of selected element in view
    currentItem = collection.get(stringCatalog.currentIndex);

	if( isDefined(fields[currentItem][0]) )
	{
		originalStringBox.value = fields[currentItem][0];
	}
	else
	{
		originalStringBox.value = "";
	}

	if( isDefined(fields[currentItem][1]) )
	{
		translationBox.value = fields[currentItem][1];
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
	var translated = translationBox.value.replace(/\\\'/g, "'");
	translated = translated.replace(/\'/g, "\\'");
	
	// memorise new translation
	fields[currentItem][1] = translated;
	
	// change saving state
	needSaveFlag = true;
}

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
 
function setDefaultCharset()
{
	sourceCharsetString = defaultCharset;
	translationCharsetString = defaultCharset;
}

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


function setSourceCharset()
{	
	if( !translationInProgress || showConfirmChangeCharsetDialog() )
	{
		sourceCharsetString = sourceCharsetList.value;
		// reopen the reference file to read it with the choosen charset
		if(sourceFilePath)	exOpenSourceFile();
	}
	else
	{
		// user has cancelled charset change so display the previously selected charset
		sourceCharsetList.value = sourceCharsetString;
		
	}
}
 
function setTranslationCharset()
{
	translationCharsetString = translationCharsetList.value;
	// reopen the translation file to read it with the choosen charset
	if(translationFilePath) exOpenTranslationFile();
}

