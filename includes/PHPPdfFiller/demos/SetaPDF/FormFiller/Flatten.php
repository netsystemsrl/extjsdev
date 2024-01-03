<?php
/**
 * This demo shows you how to fill in an existing PDF form
 * and flatten some fields to the pages content.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('subscription_flatten.pdf', true);
// get the main document isntance
$document = SetaPDF_Core_Document::loadByFilename('../_files/pdfs/tektown/Order-Form-without-Signaturefield.pdf', $writer);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// Get the form fields of the document
$fields = $formFiller->getFields();

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


// Now flatten just the item fields
foreach ($fields->getNames() as $name) {
    switch ($name) {
        case 'Subtotal':
        case 'Tax':
        case 'Freight Cost':
        case 'Total Amount':
        case (strpos($name, 'Item-Number') === 0):
        case (strpos($name, 'Description') === 0):
        case (strpos($name, 'Quantity') === 0):
        case (strpos($name, 'Unit-Price') === 0):
        case (strpos($name, 'Amount') === 0):
            $fields->get($name)->flatten();
            break;
    }
}

// Save and finish the document
$document->save()->finish();