<?php
/**
 * This demo removes the value and appearance from signature fields.
 */
error_reporting(E_ALL | E_STRICT);

// list some files
$files = glob('../_files/*.pdf');
$files = array_merge($files, glob('../../_files/pdfs/tektown/*.pdf'));
$files = array_merge($files, glob('./*.pdf'));

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");

    foreach ($files AS $path) {
        $name = basename($path);
        $bold = (strpos($name, 'signed') !== false);

        echo '<a href="RemoveDigitalSignatures.php?f=' . urlencode($path) . '">';
        echo ($bold ? '<b>' : '') . htmlspecialchars($name) . ($bold ? '</b>' : '') ;
        echo '</a><br />';
    }

    die();
}

// load and register the autoload function
require_once('../../../../library/SetaPDF/Autoload.php');

$writer = new SetaPDF_Core_Writer_Http(basename($_GET['f']));
$document = SetaPDF_Core_Document::loadByFilename($_GET['f'], $writer);

// get all terminal fields
$terminalFields = $document->getCatalog()->getAcroForm()->getTerminalFieldsObjects();

// iterate over the fields
foreach ($terminalFields AS $fieldData) {
    $fieldData = $fieldData->ensure();

    // ensure that the field is a signature field
    $ft = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($fieldData, 'FT');
    if (!$ft || $ft->getValue() !== 'Sig') {
        continue;
    }

    // if no value is set (not signed) continue
    if (!$fieldData->offsetExists('V')) {
        continue;
    }

    // unset the value
    $fieldData->offsetUnset('V');

    // clear the appearance stream.
    $ap = $fieldData->getValue('AP')->ensure();
    $n = $ap->getValue('N');
    if ($n) {
        $n = $n->ensure();
        $n->setStream('%% Blank');
    }
}

// done
$document->save(false)->finish();