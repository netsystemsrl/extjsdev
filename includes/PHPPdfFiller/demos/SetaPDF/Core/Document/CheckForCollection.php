<?php 
/**
 * This demo checks if a document is a portable collection
 */
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../_files/*.pdf');
$files = array_merge($files, glob('../../_files/pdfs/tektown/products/*.pdf'));
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");
    foreach ($files AS $path) {
    	echo '<a href="CheckForCollection.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    die();
}

// load and register the autoload function
require_once('../../../../library/SetaPDF/Autoload.php');

// create a document
$document = SetaPDF_Core_Document::loadByFilename($_GET['f']);

$catalog = $document->getCatalog();
$dictionary = $catalog->getDictionary();
if ($dictionary && $dictionary->offsetExists('Collection')) {
    echo 'This document IS a portable collection.';
} else {
    echo 'This document is NOT a portable collection.';
}