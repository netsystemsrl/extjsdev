<?php
/**
 * This demo shows you how to fill in a dynamic XFA form.
 * The form represents a name badge including a barcode.
 * The demo adds 100 dummy badges to the document.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('dynamic-xfa-form.pdf', true);
// get the main document isntance
$document = SetaPDF_Core_Document::loadByFilename('_files/xfa/Badge.pdf', $writer);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// generate some dummy data:
$firstNames = array('Peter', 'Carl', 'Dan', 'Stan', 'Roger', 'Martin', 'Paul', 'Rick', 'Chris', 'Burton');
$lastNames = array('Walker', 'Bent', 'Stuckle', 'Willow', 'Williams', 'Müller', 'Meyer', 'Schulze', 'Cell');
$companyNames = array('tektown Ltd.', 'camtown Ltd.', 'lenstown Ltd.', 'etown Ltd.');

$xml = '<badges>';

for ($i = 100; $i > 0; $i--) {
    $xml .= '<badge>'
          . '<name>'
          . $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)]
          . '</name>'
          . '<company>'
          . $companyNames[array_rand($companyNames)]
          . '</company>'
          . '<barcode>'
          . rand(1, 9) . rand(0, 9) . rand(1, 9) . rand(1, 9)
          . rand(1, 9) . rand(1, 9) . rand(1, 9) . rand(1, 9)
          . '</barcode>'
          . '</badge>';
}

$xml .= '</badges>';

// get the XFA helper
$xfa = $formFiller->getXfa();
if ($xfa === false) {
    echo "No XFA data found.";
}

// pass the XML data
$xfa->setData($xml);

// save and finish
$document->save()->finish();