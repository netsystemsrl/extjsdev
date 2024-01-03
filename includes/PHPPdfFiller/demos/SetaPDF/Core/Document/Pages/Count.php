<?php
/**
 * Count pages of a document
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/*.pdf'));
$files = array_merge($files, glob('../../../_files/pdfs/camtown/*.pdf'));
foreach ($files AS $path) {
    echo '<a href="Count.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
}

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a document
$document = SetaPDF_Core_Document::load($reader);

// Get the pages helper
$pages = $document->getCatalog()->getPages();
// or
// $pages = $document->getPages();

echo '<br />';
echo 'Page Count: ' . $pages->count();

// or via Countable implementation

echo '<br />';
echo 'Page Count: ' . count($pages);
