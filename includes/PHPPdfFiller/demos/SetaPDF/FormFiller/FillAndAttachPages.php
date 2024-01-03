<?php
/**
 * This demo will fill in some fields of an existing PDF
 * and will attach pages of another doucment to the end of
 * the file.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('subscription.pdf', true);
// get the main document isntance
$document = SetaPDF_Core_Document::loadByFilename('../_files/pdfs/tektown/Order-Form-without-Signaturefield.pdf', $writer);

// get a form filler instance
$formFiller = new SetaPDF_FormFiller($document);
// get the fields
$fields = $formFiller->getFields();

// if you dont know the names of the fields you can use this command
//var_dump(array_keys($fields->getAll()));

// fill in some fields...
$fields['Name']->setValue('Mr. Cam Town');
$fields['Company Name']->setValue('Camtown');
$fields['Phone']->setValue('018358696');
$fields['Order Number']->setValue('321');
$fields['Date']->setValue(date('y-m-d'));
$fields['Adress']->setValue('Linger Road. 45');
$fields['City']->setValue('Campoda');
$fields['Zip Code']->setValue('1356');
$fields['Item-Number.0']->setValue('12345');
$fields['Description.0']->setValue('xPhone 3 with 16k Display');
$fields['Quantity.0']->setValue('2');
$fields['Unit-Price.0']->setValue('300.00');
$fields['Amount.0']->setValue('600.00');
$fields['Subtotal']->setValue('600.00');
$fields['Tax']->setValue('48.00');
$fields['Freight Cost']->setValue('2.50');
$fields['Total Amount']->setValue('650.50');
$fields['Date, Place']->setValue(date('y-m-d') . ', Campoda');
// ...

// get access to the pages of the document
$pages = $document->getCatalog()->getPages();

// load antother document
$document2 = SetaPDF_Core_Document::loadByFilename('../_files/pdfs/tektown/Terms-and-Conditions.pdf');
// get access to the pages
$pages2 = $document2->getCatalog()->getPages();
for ($pageNo = 1, $pageCount = $pages2->count(); $pageNo <= $pageCount; $pageNo++) {
    // extract the pages and add them to the main document
    $pages->append($pages2->extract($pageNo, $document));
}

// save and output the main document
$document->save()->finish();
