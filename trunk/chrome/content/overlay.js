function loadPhpLangEditor() {
    // TODO : do that properly, if dialog already exists only add focus to it without reloading everything
    window.openDialog('chrome://phplangeditor/content/phplangeditor.xul','phplangeditor','chrome,centerscreen,resizable=yes,dialog=no').focus()
}