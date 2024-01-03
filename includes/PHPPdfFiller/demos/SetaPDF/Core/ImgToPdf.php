<?php
/**
 * This demo converts an image to a PDF document
 */
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Europe/Berlin');

// list some files
$files = glob('../_files/images/*/*.{png,jpg,jpeg}', GLOB_BRACE);
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");
    foreach ($files AS $path) {
        echo '<a href="ImgToPdf.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }
    die();
}

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// create a writer
$writer = new SetaPDF_Core_Writer_Http('ImgToPdf.pdf', true);
// create a document
$document = new SetaPDF_Core_Document($writer);

$img = SetaPDF_Core_Image::getByPath($_GET['f']);
$xObject = $img->toXObject($document);

$pages = $document->getCatalog()->getPages();
$page = $pages->create(
    array($xObject->getWidth(), $xObject->getHeight()),
    SetaPDF_Core_PageFormats::ORIENTATION_AUTO
);

$canvas = $page->getCanvas();
$xObject->draw($canvas);

$document->save()->finish();