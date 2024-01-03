<?php
/**
 * Append and prepend empty pages to an existing document 
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../../_files/*.pdf');
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");
    
    foreach ($files AS $path) {
        echo '<a href="Add.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a writer
$writer = new SetaPDF_Core_Writer_Http('Add.pdf', true);
// create a document
$document = SetaPDF_Core_Document::load($reader, $writer);

// Get the pages helper
$pages = $document->getCatalog()->getPages();

// create a new blank last page and automatically append it
$newLastPage = $pages->create(SetaPDF_Core_PageFormats::A4);

/* create a new blank page in landscape format and pass
 * false to the $append parameter so we can prepend it afterwards.
 */ 
$newFirstPage = $pages->create(SetaPDF_Core_PageFormats::A4, SetaPDF_Core_PageFormats::ORIENTATION_LANDSCAPE, false);
$pages->prepend($newFirstPage);

// save the complete document
$document->save(true)->finish();