<?php
/**
 * This demo shows you how to fill in soem text fields
 * and replace another one with an image.
 *
 * The result will be flattened.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// Load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// Create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('Fact-Sheet.pdf', false);
// Get the main document isntance
$document = SetaPDF_Core_Document::loadByFilename('../_files/pdfs/Fact-Sheet-form.pdf', $writer);

// Now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// Get the form fields of the document
$fields = $formFiller->getFields();

// Let's fill in the contact fields
$fields['Contact 1']->setValue(
    "tektown Ltd.\n" .
    "Parker Av. 214\n" .
    "4456 Motorcity"
);

$fields['Contact 2']->setValue(
    "Phone: +01 | TEKTOWN (8358696)\n" .
    "E-Mail: post@tektown-nonexist.com\n" .
    "Web: www.tektown-nonexist.com"
);

// Now prepare an appearance for the Logo field
// First of all let's get the annotation of the form field
$annotation = $fields['Logo']->getAnnotation();
// Remember the width and height for further calculations
$width = $annotation->getWidth();
$height = $annotation->getHeight();

// Create a form xobject to which we are going to write the image.
// This form xobject will be the resulting appearance of our form field.
$xobject = SetaPDF_Core_XObject_Form::create($document, array(0, 0, $width, $height));
// Get the canvas for this xobject
$canvas = $xobject->getCanvas();

// Change this for demonstration purpose
$solution = 'A';

// Solution A: Image
if ($solution == 'A') {
    // Let's create an image xobject
    $image = SetaPDF_Core_Image::getByPath('../_files/pdfs/tektown/Logo.png')->toXObject($document);

} else {
// Solution B: A PDF Page
    // Let's use an existing PDF page as the logo appearance
    $logoDoc = SetaPDF_Core_Document::loadByFilename('../_files/pdfs/tektown/Logo.pdf');
    $image = $logoDoc->getCatalog()->getPages()->getPage(1)->toXObject($document, SetaPDF_Core_PageBoundaries::ART_BOX);
}

// Let's define a fixed width
$imageWidth = 100;
// Draw the image onto the canvas with a width of 100 and align it to the middle of the height
$image->draw($canvas, 0, $height/2 - $image->getHeight($imageWidth)/2, $imageWidth);

// Now add the appearance to the annotation
$annotation->setAppearance($xobject);

// Flatten the result
$fields->flatten();

// Save and finish the document
$document->save()->finish();