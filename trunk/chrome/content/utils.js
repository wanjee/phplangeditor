function isDefined(a) 
{ 
	return typeof a != 'undefined';
}

function isNull(a) 
{
    return typeof a == 'object' && !a;
}


function getLocaleString(strName)
{
	var strbundle = document.getElementById("phplangeditor-strings");
	try
	{
		return strbundle.getString(strName);
	}
	catch( e )
	{
		return strName;
	}
}



// Loads the extension home page in a new tab
function openUrlInTab(url)
{
    var parentWindow = window;
    
	// search ancestor window
    while(parentWindow.opener)
    {
        parentWindow = parentWindow.opener;
    }

    // If a parent window was found
    if(parentWindow != window )
    {
		try
		{
			const newTab = parentWindow.getBrowser().addTab(url);
		
			parentWindow.getBrowser().selectedTab = newTab;
		}
		catch(err)
		{
			window.open(url);
		}
        window.close();
    }
}