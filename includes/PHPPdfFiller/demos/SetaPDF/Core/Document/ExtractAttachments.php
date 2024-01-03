<?php
/**
 * This demo lists and extracts attachments in a PDF document
 */
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// load and register the autoload function
require_once('../../../../library/SetaPDF/Autoload.php');

// create a document
$document = SetaPDF_Core_Document::loadByFilename('../../_files/pdfs/tektown/products/All-Portfolio.pdf');

// get names
$names = $document->getCatalog()->getNames();
// get the "embedded files" name tree
$embeddedFiles = $names->getEmbeddedFiles();

// extract the file
if (isset($_GET['f'])) {
    $file = $embeddedFiles->get($_GET['f']);
    if ($file instanceof SetaPDF_Core_FileSpecification) {
        // resolve the filename
        $filename = $file->getFileSpecification();
        // resolve the file stream
        $embeddedFileStream = $file->getEmbeddedFileStream();

        // get the content type
        $contentType = $embeddedFileStream->getMimeType();
        // or set a default content type
        if ($contentType === null) {
            $contentType = 'application/force-download';
        }

        // pass the file to the client
        $stream = $embeddedFileStream->getStream();
        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename="' . $filename . '";');
        header('Content-Transfer-Encoding: binary');
        header('Content-Length: ' . strlen($stream));
        echo $stream;
        die();
    }
}

$files = $embeddedFiles->getAll();

foreach ($files AS $name => $file) {
    $filename = $file->getFileSpecification();
    echo '<a href="?f=' . urlencode($name) . '">' . htmlspecialchars($filename) . '</a><br />';
}


