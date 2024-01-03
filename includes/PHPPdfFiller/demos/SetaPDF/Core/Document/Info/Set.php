<?php
/**
 * Set the title and keywords of a document
 */ 
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');


$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/tektown/*.pdf'));

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
	header("Content-Type: text/html; charset=utf-8");
    // list some files
    foreach ($files AS $path) {
        echo '<a href="Set.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a writer
$writer = new SetaPDF_Core_Writer_Http('NewTitle.pdf', true);
// create a document
$document = SetaPDF_Core_Document::load($reader, $writer);

// get the info helper object
$info = $document->getInfo();

// We want to update the XMP metadata package automatically
$info->setSyncMetadata();

// Set some info properties
$info->setTitle('Changed by SetaPDF');
$info->setSubject('Demo / Testing');
$info->setAuthor('www.setasign.com');
$info->setProducer('SetaPDF-Producer');
$info->setCreator('SetaPDF-Creator');
$info->setKeywords('KeywordA, KeywordB, KeywordC, KeywordD, KeywordE');

// Set a custom property
$info->setCustomMetadata('Data1', 'Document-Id: 1234');
$info->setCustomMetadata('Valid-Until', '2020-05-12');

// Update this as well, to ignore possible xmp-metadata
$info->setModDate(new SetaPDF_Core_DataStructure_Date());

// Sync XML-Metadata
$info->syncMetadata();

// Output and finish the document
$document->save()->finish();
