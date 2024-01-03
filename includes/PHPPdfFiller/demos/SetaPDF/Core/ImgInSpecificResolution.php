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
        foreach (array(72, 96, 150, 300) AS $dpi) {
            echo '<a href="ImgInSpecificResolution.php?f=' . urlencode($path) . '&dpi=' . $dpi . '">' . htmlspecialchars(basename($path)) . ' (' . $dpi . ' DPI)</a><br />';
        }
    }
    die();
}

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// create a writer
$writer = new SetaPDF_Core_Writer_Http('ImgInSpecificResolution.pdf', true);
// create a document
$document = new SetaPDF_Core_Document($writer);

$img = SetaPDF_Core_Image::getByPath($_GET['f']);
$xObject = $img->toXObject($document);
$width = $xObject->getWidth();
$height = $xObject->getHeight();

// calculate the width by the given DPI value
$dpi = isset($_GET['dpi']) ? abs($_GET['dpi']) : 72;
$dpi = $dpi == 0 ? 72 : $dpi;

$width = $width * 72 / $dpi;
$height = $height * 72 / $dpi;

$pages = $document->getCatalog()->getPages();
$page = $pages->create(
    array($width, $height),
    SetaPDF_Core_PageFormats::ORIENTATION_AUTO
);
$canvas = $page->getCanvas();
$xObject->draw($canvas, 0, 0, $width, $height);

$document->save()->finish();