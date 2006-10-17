const gName		= "phpLangEditor";
const gAuthor		= "Fragile";
const gRegKey		= "/Fragile/phplangeditor";
const gVersion		= "2.2";
const gJar			= "phplangeditor.jar";

var	error 			= null;
var oFolder			= getFolder("Current User", "chrome");
var iContentFlag	= CONTENT | PROFILE_CHROME;

//Install Existance?
var existsInApplication = File.exists(getFolder(getFolder("chrome"), gJar));
var existsInProfile     = File.exists(getFolder(oFolder, gJar));

//Install in App or Profile?
if(existsInApplication || (!existsInProfile && !confirm("Do you want to install the extension into your profile folder?\n(Cancel will install into the application folder)")))
{
    iContentFlag = CONTENT | DELAYED_CHROME;
    oFolder      = getFolder("chrome");
}

//Uninstall Current
if(existsInApplication || existsInProfile)
	uninstall(gRegKey);

//Init Install
initInstall(gName, gRegKey, gVersion);


setPackageFolder(oFolder);
error = addFile(gAuthor, gVersion, "chrome/"+ gJar, oFolder, null);

//Register
if(error == SUCCESS){
	registerChrome(iContentFlag, getFolder(oFolder, gJar), "content/");
	
	error = performInstall(); //Install
	
	if(error != SUCCESS && error != 999){
		switch(error){
			case -215:
	    	    alert("The installation of the extension failed.\nOne of the files being overwritten is read-only.");
				break;
			case -235:
    	   		alert("The installation of the extension failed.\nThere is insufficient disk space.");
				break;
			default: 
				alert("The installation of the extension failed.\nThe error code is: " + error);
		}
    	cancelInstall(error);
	}
}
else{
	alert("The installation failed.\n" + error);
	cancelInstall(error);
}