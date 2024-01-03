<?php
/**
 * Get page data 
 */ 
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
foreach ($files AS $path) {
    echo '<a href="GetData.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
}

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

echo '<br />';

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a document
$document = SetaPDF_Core_Document::load($reader);

// Get the pages helper
$pages = $document->getCatalog()->getPages();

// Walk the document page by page and get some properties
for ($pageNo = 1, $pageCount = $pages->count(); $pageNo <= $pageCount; $pageNo++) {
    echo 'Page No.: ' . $pageNo . '<br >';
    
    // Get the page object
    $page = $pages->getPage($pageNo);
    
    // print all page boundaries
    foreach (SetaPDF_Core_PageBoundaries::$all AS $boxName) {
        $box = $page->getBoundary($boxName);
        echo $boxName;
        vprintf(' = [llx: %.3F, lly: %.3F, urx: %.3F, ury: %.3F]<br />', $box->toPhp());
    }
    
    // print the page rotation value
    echo 'Rotated: ' . $page->getRotation() . '<br />';
    
    echo '<br /><br />';
}