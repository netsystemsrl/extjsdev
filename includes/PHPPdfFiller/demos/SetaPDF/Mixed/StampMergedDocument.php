<?php
/**
 * This demo stampes the result after mergin several document.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

require_once('../../../library/SetaPDF/Autoload.php');

// let's create a document instance which we pass through the individual components
$writer = new SetaPDF_Core_Writer_Http('result.pdf', true);
$document = new SetaPDF_Core_Document($writer);

// let's merge 3 documents
$merger = new SetaPDF_Merger($document);
$merger->addFile(__DIR__ . '/../_files/pdfs/camtown/products/Boombastic-Box.pdf');
$merger->addFile(__DIR__ . '/../_files/pdfs/camtown/products/Fantastic-Speaker.pdf');
$merger->addFile(__DIR__ . '/../_files/pdfs/camtown/products/Noisy-Tube.pdf');
$merger->merge();

// pass the instance to a stamper instance
$stamper = new SetaPDF_Stamper($document);

// create the stamp instance
$font = new SetaPDF_Core_Font_TrueType_Subset(
    $document,
    __DIR__ . '/../_files/fonts/dejavu-fonts-ttf-2.37/ttf/DejaVuSans.ttf'
);

$stamp = new SetaPDF_Stamper_Stamp_Text($font, 120);
$stamp->setAlign(SetaPDF_Core_Text::ALIGN_CENTER);
$stamp->setText('CONFIDENTIAL');
$stamp->setTextColor([80, 0, 0]);
$stamp->setRenderingMode(2);
$stamp->setOutlineWidth(0.5);
$stamp->setOutlineColor(0);
$stamp->setOpacity(.5);

// add the instance to the stamper
$stamper->addStamp($stamp, ['rotation' => 60]);

// execute all stamps
$stamper->stamp();

// save and finish the document
$document->save()->finish();
