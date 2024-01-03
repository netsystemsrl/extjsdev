<?php 
/**
 * This demo adds a simple document level JavaScript to an existing document
 * which opens an alert window.
 */
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../_files/*.pdf');
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");
    foreach ($files AS $path) {
    	echo '<a href="GetJavaScript.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    die();
}

// load and register the autoload function
require_once('../../../../library/SetaPDF/Autoload.php');

// create a document
$document = SetaPDF_Core_Document::loadByFilename($_GET['f']);

// get names
$names = $document->getCatalog()->getNames();
// get the JavaScript name tree
$javaScriptTree = $names->getTree(SetaPDF_Core_Document_Catalog_Names::JAVA_SCRIPT);

if ($javaScriptTree) {
    $allJavaScripts = $javaScriptTree->getAll(false, 'SetaPDF_Core_Document_Action_JavaScript');
    
    foreach ($allJavaScripts AS $name => $jsAction) {
        echo $name . '<br />------------------';
        echo '<pre>';
        echo htmlspecialchars($jsAction->getJavaScript());
        echo '</pre>';
    }
}

if (!isset($allJavaScripts) || count($allJavaScripts) === 0) {
    echo 'No document level JavaScript found!';
}