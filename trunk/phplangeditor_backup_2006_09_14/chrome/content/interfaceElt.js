
function interfaceSetFilterView( mode )
{
	if( mode == 'all' )
	{
		// active and checked
		viewAllMenu.setAttribute('disabled',false);
		viewAllBtn.disabled = false;
		viewAllBtn.checked = true;		
		// active and unchecked
		viewUntranslatedMenu.setAttribute('disabled',false);
		viewUntranslatedBtn.disabled = false;
		viewUntranslatedBtn.checked = false;
	}
	else if( mode == 'untranslated' )
	{
		// active and unchecked
		viewAllMenu.setAttribute('disabled',false);
		viewAllBtn.disabled = false;
		viewAllBtn.checked = false;	
		// active and checked
		viewUntranslatedMenu.setAttribute('disabled',false);
		viewUntranslatedBtn.disabled = false;
		viewUntranslatedBtn.checked = true;
	}
	else
	{
		// inactive and unchecked
		viewAllMenu.setAttribute('disabled',true);
		viewAllBtn.disabled = true;
		viewAllBtn.checked = false;
		// inactive and unchecked
		viewUntranslatedMenu.setAttribute('disabled',true);
		viewUntranslatedBtn.disabled = true;
		viewUntranslatedBtn.checked = false;
	}
}



/*********************************************************
	ENABLE/DISABLE FUNCTION FOR MAIN INTERFACE ELEMENTS

	these functions are a convenient way to activate
	or deactivate interface elements
 *********************************************************/


function openSourceDisable( disable )
{
	openSourceKey.disabled = disable;
	openSourceMenu.setAttribute('disabled',disable);
	openSourceBtn.disabled = disable;
}

function openTranslationDisable( disable )
{
	openTranslationKey.disabled = disable;
	openTranslationMenu.setAttribute('disabled',disable);
	openTranslationBtn.disabled = disable;
}

function saveDisable( disable )
{
	saveKey.disabled = disable;
	saveMenu.setAttribute('disabled',disable);
	saveAsMenu.setAttribute('disabled',disable);
	saveBtn.disabled = disable;
}


function goToNextDisable( disable )
{
	goToNextKey.disabled = disable;
	goToNextMenu.setAttribute('disabled',disable);
	goToNextBtn.disabled = disable;
}