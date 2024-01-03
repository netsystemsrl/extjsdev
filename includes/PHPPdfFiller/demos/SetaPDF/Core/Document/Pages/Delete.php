<?php
/**
 * Delete all but the first page and save the complete document
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../../_files/*.pdf');
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");
    
    foreach ($files AS $path) {
        echo '<a href="Delete.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a writer
$writer = new SetaPDF_Core_Writer_Http('Delete.pdf', true);
// create a document
$document = SetaPDF_Core_Document::load($reader, $writer);

if ($document->hasSecurityHandler()) {
    $secHandler = $document->getSecHandler();
    // Let's try follwing owner passwords:
    foreach (array('setasign', 'setapdf') AS $password) {
        if (true === $secHandler->authByOwnerPassword($password))
            break;
    }
}

// Get the pages helper
$pages = $document->getCatalog()->getPages();
// or
// $pages = $document->getPages();

// Delete all but the first page
while ($pages->count() > 1) {
    $pages->deletePage($pages->count());
}

// save the complete document
$document->save(false)->finish();