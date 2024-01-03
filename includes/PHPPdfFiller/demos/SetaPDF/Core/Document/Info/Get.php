<?php
/**
 * Get all information of a document
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/tektown/*.pdf'));
foreach ($files AS $path) {
    echo '<a href="Get.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
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

$info = $document->getInfo();

echo '<pre>';
// get all data
print_r($info->getAll());

// get the modification date as a DateTime object
$modDate = $info->getModDate(false);
if ($modDate) {
    $modDateTime = $modDate->getAsDateTime();
    echo 'ModDate: ' . $modDateTime->format('d.m.Y H:m');
}