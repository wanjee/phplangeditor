/**
 * Depending on quote context add slashes before single or double quote
 *
 * @author Fragile
 */
 
function addslashes(text,quote) 
{
	if( quote == "'" ) 	text = text.replace(/\'/g,'\\\'');
	else 				text = text.replace(/\"/g,'\\"');
	
	return text;
}

/**
 * Depending on quote context remove slashes before single or double quote
 *
 * @author Fragile
 */
 
function stripslashes(text,quote)
{
	if( quote == "'" ) 	text = text.replace(/\\'/g,'\'');
	else				text = text.replace(/\\"/g,'"');

	return text;
}

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
						fields[lastVar]['translation'] = '';
					}
					fields[lastVar]['original'] = fileContent.substr( lastOpenPos, i - lastOpenPos ); //string to translate						
					fields[lastVar]['stringDelimiter'] = openString;					
				}
				else
				{
					if( typeof(fields[lastVar]) != 'undefined' )
					{
						fields[lastVar]['translation'] = fileContent.substr( lastOpenPos, i - lastOpenPos );
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