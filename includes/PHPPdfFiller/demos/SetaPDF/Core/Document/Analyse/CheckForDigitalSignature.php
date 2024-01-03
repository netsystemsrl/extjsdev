<?php
/**
 * This demo checks if a document is digital signed
 */
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/tektown/*.pdf'));
$files = array_merge($files, glob('./*.pdf'));

foreach ($files AS $path) {

    $name = basename($path);
    $bold = (strpos($name, 'signed') !== false);

    echo '<a href="CheckForDigitalSignature.php?f=' . urlencode($path) . '">';
    echo ($bold ? '<b>' : '') . htmlspecialchars($name) . ($bold ? '</b>' : '') ;
    echo '</a><br />';
}

echo '<br />';
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

$document = SetaPDF_Core_Document::loadByFilename($_GET['f']);
$terminalFields = $document->getCatalog()->getAcroForm()->getTerminalFieldsObjects();

foreach ($terminalFields AS $fieldData) {
    $fieldData = $fieldData->ensure();

    $ft = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($fieldData, 'FT');
    if (!$ft || $ft->getValue() !== 'Sig') {
        continue;
    }

    echo 'Signature Field found! ';
    $v = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($fieldData, 'V');
    if (!$v || !$v->ensure() instanceof SetaPDF_Core_Type_Dictionary) {
        echo ' But not digital signed.<br /><br />';
        continue;
    }

    echo ' Including a digital signature.<br />';

    // Try to extract the certificates used for the digital signature
    if (class_exists('SetaPDF_Signer_Asn1_Element')) {
        $v = $v->ensure();
        $content = $v->offsetGet('Contents')->ensure()->getValue();
        $asn1 = SetaPDF_Signer_Asn1_Element::parse($content);
        $certificates = SetaPDF_Signer_Asn1_Element::findByPath('1/0/3', $asn1);
        $certificates = $certificates->getChildren();

        for ($no = 0; $no < count($certificates); $no++) {
            $certificate = $certificates[$no];
            $certificate = $certificate->__toString();
            $certificate = "-----BEGIN CERTIFICATE-----\n" . chunk_split(base64_encode($certificate)) . "-----END CERTIFICATE-----";

            $certificateInfo = openssl_x509_parse($certificate);

            echo '<br />Signature Certificate:';
            echo '<pre>';
            print_r($certificateInfo);
        }
    }

    echo '<br /><br />';

}