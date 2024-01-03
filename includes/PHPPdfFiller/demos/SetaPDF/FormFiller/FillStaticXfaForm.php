<?php
/**
 * This demo shows you how to fill in a static XFA form.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// create a HTTP writer
$writer = new SetaPDF_Core_Writer_Http('static-xfa-form.pdf', true);
// get the main document isntance
$document = SetaPDF_Core_Document::loadByFilename('_files/xfa/CheckRequest.pdf', $writer);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// solution A:
$xfa = $formFiller->getXfa();
if ($xfa === false) {
    echo "No XFA data found.";
}

// pass the data packet to the setData() method:
$xfa->setData('
<form1>
    <Name>Test Person</Name>
    <Title>Dr.</Title>
    <Deptartment>Sales</Deptartment>
</form1>
');
// sync the AcroForm fields
$xfa->syncAcroFormFields();

// solution B: Same as normal AcroForm fields
$fields = $formFiller->getFields();
// will overwrite the Title
$fields['form1[0].#subform[0].Header[0].Title[0]']->setValue('Prof.');
// ...

$document->save()->finish();