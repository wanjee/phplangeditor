# phplangeditor
Automatically exported from code.google.com/p/phplangeditor

This is legacy code, this version is not compatible anymore with latest Firefox versions, feel free to fork and request pulls.
#What is phpLangEditor ?

**phpLangEditor** is a tool made to help **php applications translators**.

A lot of PHP applications are translated using one or many files of lang vars

```php
<?php
$langHello = "Hello";
$langWorld = 'World';
$test['birthday'] = 'Birthday';
$test['birth']['day'] = 'day';
$test['birth']['month'] = 'month';
...
?>
```

It's not really easy for a translator to work in such a file. You have to open it in a text editor and navigate from string to string to replace them by your translation.

phpLangEditor has been made to make this job easier.
