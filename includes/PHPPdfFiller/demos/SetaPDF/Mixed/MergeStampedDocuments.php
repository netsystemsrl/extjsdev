<?php
/**
 * This demo shows you how you can stamp documents before you pass the to a merger instance.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

require_once('../../../library/SetaPDF/Autoload.php');

// let's create a document instance which we pass through the individual components
$writer = new SetaPDF_Core_Writer_Http('result.pdf', true);
$document = new SetaPDF_Core_Document($writer);

// let's create a merger instance
$merger = new SetaPDF_Merger($document);

// prepare a font instance
$font = new SetaPDF_Core_Font_TrueType_Subset(
    $document,
    __DIR__ . '/../_files/fonts/dejavu-fonts-ttf-2.37/ttf/DejaVuSans.ttf'
);

// prepare the stamp instance and its configuration
$stamp = new SetaPDF_Stamper_Stamp_Text($font, 8);
$stampConfigruation = [
    'position' => SetaPDF_Stamper::POSITION_LEFT_BOTTOM,
    'translateX' => 42,
    'translateY' => 10
];

// let's stamp the first document
$inDocument = SetaPDF_Core_Document::loadByFilename(__DIR__ . '/../_files/pdfs/camtown/products/Boombastic-Box.pdf');
$stamper = new SetaPDF_Stamper($inDocument);
$stamp->setText('Product-Id: 89736204');
$stamper->addStamp($stamp, $stampConfigruation);
$stamper->stamp();

// add it to the merger
$merger->addDocument($inDocument);

// let's stamp the second document
$inDocument = SetaPDF_Core_Document::loadByFilename(__DIR__ . '/../_files/pdfs/camtown/products/Fantastic-Speaker.pdf');
$stamper = new SetaPDF_Stamper($inDocument);
$stamp->setText('Product-Id: 66586852');
$stamper->addStamp($stamp, $stampConfigruation);
$stamper->stamp();

// add it to the merger
$merger->addDocument($inDocument);

// let's stamp the third document
$inDocument = SetaPDF_Core_Document::loadByFilename(__DIR__ . '/../_files/pdfs/camtown/products/Noisy-Tube.pdf');
$stamper = new SetaPDF_Stamper($inDocument);
$stamp->setText('Product-Id: 968215315');
$stamper->addStamp($stamp, $stampConfigruation);
$stamper->stamp();

// add it to the merger
$merger->addDocument($inDocument);

// let's merge them together
$merger->merge();

// save and finish the document instance
$document->save()->finish();

