<?php
/**
 * This demo checks a PDF document for usage rights and removes them to allow further processing.
 */
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../_files/*.pdf');
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");
    foreach ($files AS $path) {
        echo '<a href="RemoveUsageRights.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    die();
}

// load and register the autoload function
require_once('../../../../library/SetaPDF/Autoload.php');

// create a document
$document = SetaPDF_Core_Document::loadByFilename($_GET['f']);

$permissions = $document->getCatalog()->getPermissions();

// check for usage right
if ($permissions->hasUsageRights()) {
    // remove them
    $permissions->removeUsageRights();

    // save the document
    $document->setWriter(new SetaPDF_Core_Writer_Http('no-usage-rights.pdf'));
    $document->save()->finish();
} else {
    echo 'No usage rights found.';
}