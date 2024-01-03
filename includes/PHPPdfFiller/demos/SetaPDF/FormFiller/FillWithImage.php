<?php
/**
 * This demo shows you how to place images into form fields.
 * There are two modes available:
 *   "fit": fits the image into the available field size.
 *   "cover": scales the image so that the whole field is covered.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

$files = glob('../_files/images/fuchslocher/*.{png,jpg,jpeg}', GLOB_BRACE);

if (!isset($_GET['file']) || !in_array($_GET['file'], $files)) {
    echo '<ul>';

    foreach ($files as $file) {
        $basename = pathinfo($file);
        $basename = $basename['basename'];
        $path = urlencode($file);

        echo '<li><a href="?file=' . $path . '">' . $basename . '</a></li>';
    }

    echo '</ul>';
    die();
}

// Load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// The path to the image
$imageFile = $_GET['file'];

// The mode that should be used to fill the field
$mode = 'cover';
// $mode = 'fit';


// Create a file writer
$writer = new SetaPDF_Core_Writer_Http('filledWithImage.pdf', true);
// Get the main document instance
$document = SetaPDF_Core_Document::loadByFilename('_files/image-tile-form.pdf', $writer);

// Now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// Get the form fields of the document
$fields = $formFiller->getFields();

// Let's create an image XObject
$image = SetaPDF_Core_Image::getByPath($imageFile)->toXObject($document);

foreach ($fields as $key => $field) {
    // First of all let's get the annotation of the form field
    $annotation = $field->getAnnotation();

    // Remember the width and height for further calculations
    $width = $annotation->getWidth();
    $height = $annotation->getHeight();

    // Create a form XObject to which we are going to write the image
    // This form XObject will be the resulting appearance of our form field
    $xobject = SetaPDF_Core_XObject_Form::create($document, array(0, 0, $width, $height));

    // Get the canvas for this XObject
    $canvas = $xobject->getCanvas();

    if ($mode === 'fit') {
        // Scale image into available space and center it
        if ($image->getHeight($width) >= $height) {
            $image->draw($canvas, $width / 2 - $image->getWidth($height) / 2, 0, null, $height);
        } else {
            $image->draw($canvas, 0, $height / 2 - $image->getHeight($width) / 2, $width);
        }
    } elseif ($mode === 'cover') {
        // Scale image so that it covers the whole field size and center it
        $scaledWidth = $image->getWidth($height);
        if ($scaledWidth >= $width) {
            $image->draw($canvas, ($width / 2) - ($scaledWidth / 2), 0,  $scaledWidth, $height);
        } else {
            $image->draw($canvas, 0, ($height / 2) - ($image->getHeight($width) / 2), $width, null);
        }
    }

    // Now add the appearance to the annotation
    $annotation->setAppearance($xobject);
}

// Flatten all appearances to the pages content stream
$fields->flatten();

// Finish the document
$document->save()->finish();
