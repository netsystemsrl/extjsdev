<?php
/**
 * This demo shows you how to fill in a form field
 * by using a separate font and an individual color/space.
 * The result is flattened to the pages content.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('OwnFontAndTextColor.pdf', false);
// get the main document instance
$document = SetaPDF_Core_Document::loadByFilename('../_files/pdfs/tektown/Order-Form-without-Signaturefield.pdf', $writer);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// Get the form fields of the document
$fields = $formFiller->getFields();

// create a spot color/space
$colorSpace = SetaPDF_Core_ColorSpace_Separation::createSpotColor($document, 'HKS 27 N', .3, 1, 0, 0);
$color = new SetaPDF_Core_DataStructure_Color_Special(1);

// Let's create a font instance DejaVu Sans Condensed as a true type font subset
$font = new SetaPDF_Core_Font_TrueType_Subset(
    $document,
    '../_files/fonts/dejavu-fonts-ttf-2.37/ttf/DejaVuSansCondensed-Oblique.ttf'
);

// Or as a CID font with true type outlines which allows you to use more than 255 characters
/*
$font = new SetaPDF_Core_Font_Type0_Subset(
    $document,
    '../_files/fonts/dejavu-fonts-ttf-2.37/ttf/DejaVuSansCondensed-Oblique.ttf'
);*/

/* NOT RECOMMENDED: alternatively you can create an instance with e.g. arial.ttf which will not be embedded.
$font = SetaPDF_Core_Font_TrueType::create(
    $document,
    'arial.ttf',
    SetaPDF_Core_Encoding::WIN_ANSI,
    'auto',
    false // <-- don't embedded
);*/

$field = $fields->get('Name');
$field->setAppearanceTextColorSpace($colorSpace);
$field->setAppearanceTextColor($color);
$field->setAppearanceFont($font);
$field->setValue('Mr. Úmśęnłasdí'); // Let's play with some unicode chars
$field->flatten();

$field = $fields->get('Company Name');
$field->setAppearanceTextColorSpace($colorSpace);
$field->setAppearanceTextColor($color);
$field->setAppearanceFont($font);
$field->setValue('Μεγάλη εταιρεία');
$field->flatten();

$field = $fields->get('Adress');
$field->setAppearanceTextColorSpace($colorSpace);
$field->setAppearanceTextColor($color);
$field->setAppearanceFont($font);
$field->setValue("Φανταστικό δρόμο ③");
$field->flatten();

// finish the document
$document->save()->finish();
