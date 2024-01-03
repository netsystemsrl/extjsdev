<?php
/**
 * Resize the page to a specific boundary/area
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

$data = array(
    'red' => 'ul',
    'blue' => 'ur',
    'yellow' => 'll',
    'green' => 'lr',
);

if (!isset($_GET['location']) || !isset($data[$_GET['location']])) {
    foreach (array_keys($data) AS $name) {
    	echo '<a href="Crop.php?location=' . urlencode($name) . '">' . $name . '</a><br />';
    }
    
    die();
}

$file = '../../../_files/pdfs/misc/4-rects.pdf';

// create a reader
$reader = new SetaPDF_Core_Reader_File($file);
// create a writer
$writer = new SetaPDF_Core_Writer_Http('Cropped.pdf', true);
// create a document
$document = SetaPDF_Core_Document::load($reader, $writer);

// Get the pages helper
$pages = $document->getCatalog()->getPages();
$page = $pages->getPage(1);

$margin = 36;
$format = $page->getWidthAndHeight();
$position = array(
    'ul' => array($margin, $format[1] / 2, $format[0] / 2, $format[1] - $margin),
    'ur' => array($format[0] / 2 + $margin, $format[1] / 2, $format[0] - $margin, $format[1] - $margin),
    'll' => array($margin, $margin, $format[0] / 2, $format[1] / 2),
    'lr' => array($format[0] / 2, $margin, $format[0] - $margin, $format[1]  / 2),
);

// resize all available page boxes
foreach (SetaPDF_Core_PageBoundaries::$all AS $boxName) {
    $box = $page->getBoundary($boxName, false);
    if (false === $box)
        continue;

    // reset the box
    $page->setBoundary($position[$data[$_GET['location']]], $boxName, false);
}

$document->save()->finish();