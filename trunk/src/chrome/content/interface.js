/*********************************************************
	ENABLE/DISABLE FUNCTION FOR MAIN INTERFACE ELEMENTS

	these functions are a convenient way to activate
	or deactivate interface elements
 *********************************************************/

/**
 * Enable or disable the open translation command (and related elements)
 *
 * @param enable boolean true if the command must be enabled
 * @author Fragile
 */
 
function enableOpenTranslation( enable ) 
{
	if( enable ) 	document.getElementById('cmd_ple_openTranslation').removeAttribute('disabled');
	else 			document.getElementById('cmd_ple_openTranslation').setAttribute('disabled','true');
}

/**
 * Enable or disable the save command(s) (and related elements)
 *
 * @param enable boolean true if the command must be enabled
 * @author Fragile
 */
 
function enableSave( enable )
{
	if( enable )
	{
		document.getElementById('cmd_ple_save').removeAttribute('disabled');
		document.getElementById('cmd_ple_saveAs').removeAttribute('disabled');
	}
	else
	{
		document.getElementById('cmd_ple_save').setAttribute('disabled','true');
		document.getElementById('cmd_ple_saveAs').setAttribute('disabled','true');
	}
}

/**
 * Enable or disable the go to next command (and related elements)
 *
 * @param enable boolean true if the command must be enabled
 * @author Fragile
 */

function enableGoToNext( enable )
{
	if( enable ) 	document.getElementById('cmd_ple_goToNext').removeAttribute('disabled');
	else 			document.getElementById('cmd_ple_goToNext').setAttribute('disabled','true');
}

/**
 * Enable or disable the filter view command(s) (and related elements)
 *
 * @param enable boolean true if the command must be enabled
 * @author Fragile
 */
 
function enableFilterView( enable )
{
	if( enable )
	{
		document.getElementById('cmd_ple_filterViewAll').removeAttribute('disabled');
		document.getElementById('cmd_ple_filterViewUnstranslated').removeAttribute('disabled');
	}
	else
	{
		document.getElementById('cmd_ple_filterViewAll').setAttribute('disabled','true');
		document.getElementById('cmd_ple_filterViewUnstranslated').setAttribute('disabled','true');
	}
}
