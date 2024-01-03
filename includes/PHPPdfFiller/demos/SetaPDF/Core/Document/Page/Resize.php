<?php
/**
 * Resize the page boundaries of all pages in a document
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../../_files/*.pdf');
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    foreach ($files AS $path) {
    	echo '<a href="Resize.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a writer
$writer = new SetaPDF_Core_Writer_Http('Resize.pdf', true);
// create a document
$document = SetaPDF_Core_Document::load($reader, $writer);

// Get the pages helper
$pages = $document->getCatalog()->getPages();

// Walk the document page by page and get some properties
for ($pageNo = 1, $pageCount = $pages->count(); $pageNo <= $pageCount; $pageNo++) {
    
    // Get the page object
    $page = $pages->getPage($pageNo);
    
    // resize all available page boxes
    foreach (SetaPDF_Core_PageBoundaries::$all AS $boxName) {
    	$box = $page->getBoundary($boxName, false);
        if (false === $box)
            continue;
        
        $box->setLlx($box->getLlx() - 100);
        $box->setLly($box->getLly() - 100);
        $box->setUrx($box->getUrx() + 100);
        $box->setUry($box->getUry() + 100);
        
        // reset the box
        $page->setBoundary($box, $boxName);
    }
}

$document->save()->finish();