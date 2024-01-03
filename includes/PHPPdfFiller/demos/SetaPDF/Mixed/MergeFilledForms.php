<?php
/**
 * This demo merge 3 PDF documents (2 of them with forms).
 * The item list of the first pdf will be flatten.
 * The second pdf with forms will be flatten.
 *
 * It uses following components:
 *
 *   SetaPDF_FormFiller
 *   - fill in the PDF forms
 *
 *   SetaPDF_Merger
 *   - merge both forms and the other pdf
 *
 *   SetaPDF_Core
 *   - Define the initial page mode view
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

require_once('../../../library/SetaPDF/Autoload.php');

// initiate a merger instance
$merger = new SetaPDF_Merger();

// fill in a form
$documentFormA = SetaPDF_Core_Document::loadByFilename('../_files/pdfs/tektown/Order-Form-without-Signaturefield.pdf');

$formFillerA = new SetaPDF_FormFiller($documentFormA);
$fieldsA = $formFillerA->getFields();
$fieldsA['Name']->setValue('Mr. Cam Town');
$fieldsA['Company Name']->setValue('Camtown');
$fieldsA['Phone']->setValue('018358696');
$fieldsA['Order Number']->setValue('321');
$fieldsA['Date']->setValue(date('y-m-d'));
$fieldsA['Adress']->setValue('Linger Road. 45');
$fieldsA['City']->setValue('Campoda');
$fieldsA['Zip Code']->setValue('1356');
$fieldsA['Item-Number.0']->setValue('12345');
$fieldsA['Description.0']->setValue('Subscription tekMag 2 years; paperback only');
$fieldsA['Quantity.0']->setValue('1');
$fieldsA['Unit-Price.0']->setValue('600.00');
$fieldsA['Amount.0']->setValue('600.00');
$fieldsA['Item-Number.1']->setValue('23456');
$fieldsA['Description.1']->setValue('Additional Premium Content');
$fieldsA['Quantity.1']->setValue('1');
$fieldsA['Unit-Price.1']->setValue('100.00');
$fieldsA['Amount.1']->setValue('100.00');
$fieldsA['Subtotal']->setValue('700.00');
$fieldsA['Tax']->setValue('56.00');
$fieldsA['Freight Cost']->setValue('0.00');
$fieldsA['Total Amount']->setValue('756.00');
$fieldsA['Date, Place']->setValue(date('y-m-d') . ', Campoda');

// Now flatten just the item fields
foreach ($fieldsA->getNames() as $name) {
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
            $fieldsA->get($name)->flatten();
            break;
        default:
            //dont flatten
            break;
    }
}

// add this filled form to the merger 
$merger->addDocument($documentFormA, SetaPDF_Merger::PAGES_ALL, null, 'Order');

// fill in another form
$documentFormB = SetaPDF_Core_Document::loadByFilename('../_files/pdfs/tektown/Subscription-tekMag.pdf');

$formFillerB = new SetaPDF_FormFiller($documentFormB);
$fieldsB = $formFillerB->getFields();

$fieldsB['Name']->setValue('Mr. Cam Town');
$fieldsB['Company Name']->setValue('Camtown');
$fieldsB['Phone']->setValue('018358696');
$fieldsB['Adress']->setValue('Linger Road. 45');
$fieldsB['City']->setValue('Campoda');
$fieldsB['Zip Code']->setValue('1356');
$fieldsB['EMail']->setValue('mr.cam-town@cam-town.com');
$fieldsB['Reseller Number']->setValue('123');

if (isset($fieldsB['Subscription'])) { // only available in FormFiller Full version
    $fieldsB['Subscription']->setValue('2 years, 24 issues (perback only)');
}

if (isset($fieldsB['Additional Premium Content'])) { // only available in FormFiller Full version
    $fieldsB['Additional Premium Content']->check();
}

// let's flatten this form
$fieldsB->flatten();

// add this filled form to the merger
$merger->addDocument($documentFormB, SetaPDF_Merger::PAGES_ALL, null, 'Subscription');

$merger->addFile('../_files/pdfs/tektown/Terms-and-Conditions.pdf', SetaPDF_Merger::PAGES_ALL, null, 'Terms and Conditions');

// let's append both to the initial document
$merger->merge();

//get the document
$document = $merger->getDocument();
// Create a http writer object
$writer = new SetaPDF_Core_Writer_Http('MergeFilledForms.pdf', true);

// Pass the writer to the document object
$document->setWriter($writer);
// let's view the bookmark outlines at opening time
$document->getCatalog()->setPageMode(SetaPDF_Core_Document_PageMode::USE_OUTLINES);

$document->save()->finish();