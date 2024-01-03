<?php
/**
 * This demo shows you how to remove the XFA package of a PDF document.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('normal-acro-form.pdf', true);
// get the main document isntance
$document = SetaPDF_Core_Document::loadByFilename('_files/xfa/CheckRequest.pdf', $writer);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// get the XFA helper
$xfa = $formFiller->getXfa();
if ($xfa) {
    // if this is not a dynamic XFA form
    if (!$xfa->isDynamic()) {
        // remove the XFA package
        $document->getCatalog()->getAcroForm()->removeXfaInformation();
    } else {
        throw new Exception(
            'Removing the XFA package from a dynamic XFA form will result in a single PDF page showing only a ' .
            'compatibility error or loading message.'
        );
    }
}

// save the new document
$document->save()->finish();