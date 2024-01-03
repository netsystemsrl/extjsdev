<?php 
/**
 * This demo let you remove document level JavaScript of an existing document
 */
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../_files/*.pdf');
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");
    foreach ($files AS $path) {
    	echo '<a href="DeleteJavaScript.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
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

$shouldSave = false;
if ($javaScriptTree) {
    // Walk through all java scripts
    foreach ($javaScriptTree->getAll(true) AS $name) {
        echo 'Remove: <a href="DeleteJavaScript.php?f=' . urlencode($_GET['f']) . '&name=' . urlencode($name) .'">' . htmlspecialchars($name) . "</a>";
        if (isset($_GET['name']) && $_GET['name'] == $name) {
            $javaScriptTree->remove($name);
            echo '  - removed!';
            
            $shouldSave = true;
        }
        echo '<br />';
    }
    
    
    if ($shouldSave) {
        $writer = new SetaPDF_Core_Writer_File('DeleteJavaScript.pdf');
        $document->setWriter($writer);
        $document->save()->finish();
        echo '<br />Document saved!';
    }
    
} else {
    
    echo 'No document level JavaScript found!';
}