<?php
/**
 * This demo shows you how to fill in an existing PDF form with
 * different field types with dummy data and flatten the fields
 * to the pages content.
 *
 * The source document is a string
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// let's get access to the file
$fileContent = file_get_contents('_files/Customizer-Example.pdf');
$reader = new SetaPDF_Core_Reader_String($fileContent);
// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('the-flattened-form.pdf', true);
// let's get the document
$document = SetaPDF_Core_Document::load($reader, $writer);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// Get the form fields of the document
$fields = $formFiller->getFields();

// Fill in the fields
foreach ($fields AS $field) {
    if ($field instanceof SetaPDF_FormFiller_Field_Text) {
        $field->setValue('SetaPDF 2');

    } elseif ($field instanceof SetaPDF_FormFiller_Field_Button) {
        $field->push();

    } elseif ($field instanceof SetaPDF_FormFiller_Field_ButtonGroup) {
        $buttons = $field->getButtons();
        // push a random button
        $button = array_rand($buttons);
        $buttons[$button]->push();

    } elseif ($field instanceof SetaPDF_FormFiller_Field_Combo) {
        $options = $field->getOptions();
        $option = array_rand($options);
        $field->setValue($option);
    }
}

// Now flatten all fields
$fields->flatten();

// Save and finish the document
$document->save()->finish();