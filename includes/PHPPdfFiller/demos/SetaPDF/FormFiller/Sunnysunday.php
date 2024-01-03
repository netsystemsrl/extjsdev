<?php
/**
 * This demo shows you how to fill in an existing PDF form with
 * different field types.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// let's get access to the file
$reader = new SetaPDF_Core_Reader_File('_files/Sunnysunday-Example.pdf');
// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('the-filled-form.pdf', true);
// let's get the document
$document = SetaPDF_Core_Document::load($reader, $writer);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// Get the form fields of the document
$fields = $formFiller->getFields();

// Check for Full version
if (!class_exists('SetaPDF_FormFiller_Field_Button')) {
    echo 'This demo only woks with the Full version of the SetaPDF-FormFiller component.';
    die();
}

// $fields['Balloons']->setValue('Yes');
// or
$fields['Balloons']->setValue('No');
// or
// $buttons = $fields['Balloons']->getButtons();
// $button = current($buttons);
// $fields['Balloons']->setValue($button);


// Fill in Textfields
$fields['How many balloons']->setValue('10');

// Choose a random color in the select field
$colors = $fields['Balloon color']->getOptions();
$colorKey = array_rand($colors);
$fields['Balloon color']->setValue($colorKey);


// Multiline Textfield
$fields['Favorite Cake']->setValue(
	'I like every kind of cake! Just make sure it is enough! Like ' .
    'this text in the multiline textfield. ;-)'
);

$fields['Pets']->setValue('No');

$fields['Pet kind']->setValue('...nothing?');
$fields['Pet name']->setValue('...aehm?');

// We are going to arrive at 3pm
$fields['Arrival']->setValue(2); // by index
// and we are going to leave at 9pm
$fields['Departure']->setValue('9pm'); // by export value

// Save and finish the document
$document->save()->finish();