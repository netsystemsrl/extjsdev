<?php
/**
 * This demo merge 3 PDF documents (2 of them with forms).
 * Same form field names will be kept, so that only a single value has to be passed to a field,
 * while updating all other same named fields.
 *
 * The merged document will be passed to a form filler instance and the fields will get filled.
 *
 * It uses following components:
 *
 *   SetaPDF_Merger
 *   - merge both forms and the other pdf
 *
 *   SetaPDF_FormFiller
 *   - fill in the PDF forms
 *
 *   SetaPDF_Core
 *   - Define the initial page mode view
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

require_once('../../../library/SetaPDF/Autoload.php');

$writer = new SetaPDF_Core_Writer_Http('FilledMergeForms.pdf', true);
$document = new SetaPDF_Core_Document($writer);

// initiate a merger instance
$merger = new SetaPDF_Merger($document);
$merger->addFile('../_files/pdfs/tektown/Order-Form-without-Signaturefield.pdf', SetaPDF_Merger::PAGES_ALL, null, 'Order');
$merger->addFile('../_files/pdfs/tektown/Subscription-tekMag.pdf', SetaPDF_Merger::PAGES_ALL, null, 'Subscription');
$merger->addFile('../_files/pdfs/tektown/Terms-and-Conditions.pdf', SetaPDF_Merger::PAGES_ALL, null, 'Terms and Conditions');

$merger->setRenameSameNamedFormFields(false);
$merger->merge();


$formFiller = new SetaPDF_FormFiller($document);
$fields = $formFiller->getFields();
$fields['Name']->setValue('Mr. Cam Town');
$fields['Company Name']->setValue('Camtown');
$fields['Phone']->setValue('018358696');
$fields['Order Number']->setValue('321');
$fields['Date']->setValue(date('y-m-d'));
$fields['Adress']->setValue('Linger Road. 45');
$fields['City']->setValue('Campoda');
$fields['Zip Code']->setValue('1356');
$fields['Item-Number.0']->setValue('12345');
$fields['Description.0']->setValue('Subscription tekMag 2 years; paperback only');
$fields['Quantity.0']->setValue('1');
$fields['Unit-Price.0']->setValue('600.00');
$fields['Amount.0']->setValue('600.00');
$fields['Item-Number.1']->setValue('23456');
$fields['Description.1']->setValue('Additional Premium Content');
$fields['Quantity.1']->setValue('1');
$fields['Unit-Price.1']->setValue('100.00');
$fields['Amount.1']->setValue('100.00');
$fields['Subtotal']->setValue('700.00');
$fields['Tax']->setValue('56.00');
$fields['Freight Cost']->setValue('0.00');
$fields['Total Amount']->setValue('756.00');
$fields['Date, Place']->setValue(date('y-m-d') . ', Campoda');

$fields['EMail']->setValue('mr.cam-town@cam-town.com');
$fields['Reseller Number']->setValue('123');

if (isset($fields['Subscription'])) { // only available in FormFiller Full version
    $fields['Subscription']->setValue('2 years, 24 issues (perback only)');
}

if (isset($fields['Additional Premium Content'])) { // only available in FormFiller Full version
    $fields['Additional Premium Content']->check();
}

// let's view the bookmark outlines at opening time
$document->getCatalog()->setPageMode(SetaPDF_Core_Document_PageMode::USE_OUTLINES);

$document->save()->finish();