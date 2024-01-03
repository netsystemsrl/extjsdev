<?php
/**
 * Check a documents encryption
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../_files/*.pdf');

foreach ($files AS $path) {
    echo '<a href="CheckForEncryption.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
}

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

// load and register the autoload function
require_once('../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a document
$document = SetaPDF_Core_Document::load($reader);

// If the document has a security handler attached, it is encrpyted
if ($document->hasSecurityHandler()) {
    printf('This document (%s) is encrypted!<br />', basename($_GET['f']));
    
    // Get the security handler object
    $secHandler = $document->getSecHandler();
    
    // Standard security handler
    if ($secHandler instanceof SetaPDF_Core_SecHandler_Standard) {
        echo "Standard PDF security handler.<br />";

    // Actually only standard security handlers are supported
    } else {
        echo "Unsupported security handler.";
    }
    
} else {
    printf('This document (%s) is NOT encrypted!<br />', basename($_GET['f']));
}
