<?php
/**
 * Rotate all pages in a document
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../../_files/*.pdf');
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    foreach ($files AS $path) {
    	echo '<a href="Rotate.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a writer
$writer = new SetaPDF_Core_Writer_Http('Rotate.pdf', true);
// create a document
$document = SetaPDF_Core_Document::load($reader, $writer);

// Get the pages helper
$pages = $document->getCatalog()->getPages();

// Walk the document page by page and get some properties
for ($pageNo = 1, $pageCount = $pages->count(); $pageNo <= $pageCount; $pageNo++) {
    
    // Get the page object
    $page = $pages->getPage($pageNo);
    // rotate by 90°
    $page->rotateBy(90);
}

$document->save()->finish();