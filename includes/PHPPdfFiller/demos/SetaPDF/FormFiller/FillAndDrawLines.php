<?php
/**
 * This demo shows you how to fill in an existing PDF form,
 * remove fields and draw crossing lines on the positions of the deleted fields
 *
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// let's get access to the file
$reader = new SetaPDF_Core_Reader_File('../_files/pdfs/tektown/Subscription-tekMag.pdf');
// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('the-filled-form.pdf', true);
// let's get the document
$document = SetaPDF_Core_Document::load($reader, $writer);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// Get the form fields of the document
$fields = $formFiller->getFields();

// let's fill some fields with dummy data
$fields['Name']->setValue('John Walker');
$fields['Company Name']->setValue('lenstown Ltd.');

$fields['Adress']->setValue('Withaker Road 3');
$fields['Zip Code']->setValue('66237');
$fields['City']->setValue('Ingshire');
$fields['State']->setValue('Florida');
$fields['Country']->setValue('United States');

$fields['Phone']->setValue('+01 | LENSOWN (53678696)');
$fields['EMail']->setValue('post@lenstown-nonexist.com');
$fields['Reseller Number']->setValue('-');

// define some field to delete
$fieldsToDelete = array(
    'Name_2', 'Company Name_2', 'Adress_2', 'Phone_2', 'EMail_2',
    'City_2', 'Zip Code_2', 'State_2', 'Country_2'
);

$pages = $document->getCatalog()->getPages();
foreach ($fieldsToDelete AS $fieldName) {
    $field = $fields->get($fieldName);
    /**
     * Get the annotation objecct
     * @var SetaPDF_Core_Document_Page_Annotation_Widget $annotation
     */
    $annotation = $field->getAnnotation();
    // and get the rectangle of it
    $rect = $annotation->getRect();

    // get access to the page object
    $page = $pages->getPageByAnnotation($annotation->getIndirectObject());
    // ensure a new graphic state
    $page->getContents()->encapsulateExistingContentInGraphicState();

    // let's draw simple lines
    $page->getCanvas()->draw()
        ->line($rect->getLlx(), $rect->getUry(), $rect->getUrx(), $rect->getLly())
        ->line($rect->getLlx(), $rect->getLly(), $rect->getUrx(), $rect->getUry());

    // and delete the form fields
    $field->delete();
}

// Save and finish the document
$document->save()->finish();