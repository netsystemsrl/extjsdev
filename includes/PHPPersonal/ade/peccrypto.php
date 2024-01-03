<?php
/**
 * stripP7MData
 *
 * removes the PKCS#7 header and the signature info footer from a digitally-signed .xml.p7m file using CAdES format.
 *
 * @param ($string, string) the CAdES .xml.p7m file content (in string format).
 * @return (string) an arguably-valid XML string with the .p7m header and footer stripped away.
 */
function stripP7MData($string) {
    
    // skip everything before the XML content
    $string = substr($string, strpos($string, '<?xml '));
 
    // skip everything after the XML content
    preg_match_all('/<\/.+?>/', $string, $matches, PREG_OFFSET_CAPTURE);
    $lastMatch = end($matches[0]);
 
    return substr($string, 0, $lastMatch[1]);
}
/**
 * Removes invalid characters from a UTF-8 XML string
 *
 * @access public
 * @param string a XML string potentially containing invalid characters
 * @return string
 */
function sanitizeXML($string)
{
    if (!empty($string)) 
    {
        $regex = '/(
            [\xC0-\xC1] # Invalid UTF-8 Bytes
            | [\xF5-\xFF] # Invalid UTF-8 Bytes
            | \xE0[\x80-\x9F] # Overlong encoding of prior code point
            | \xF0[\x80-\x8F] # Overlong encoding of prior code point
            | [\xC2-\xDF](?![\x80-\xBF]) # Invalid UTF-8 Sequence Start
            | [\xE0-\xEF](?![\x80-\xBF]{2}) # Invalid UTF-8 Sequence Start
            | [\xF0-\xF4](?![\x80-\xBF]{3}) # Invalid UTF-8 Sequence Start
            | (?<=[\x0-\x7F\xF5-\xFF])[\x80-\xBF] # Invalid UTF-8 Sequence Middle
            | (?<![\xC2-\xDF]|[\xE0-\xEF]|[\xE0-\xEF][\x80-\xBF]|[\xF0-\xF4]|[\xF0-\xF4][\x80-\xBF]|[\xF0-\xF4][\x80-\xBF]{2})[\x80-\xBF] # Overlong Sequence
            | (?<=[\xE0-\xEF])[\x80-\xBF](?![\x80-\xBF]) # Short 3 byte sequence
            | (?<=[\xF0-\xF4])[\x80-\xBF](?![\x80-\xBF]{2}) # Short 4 byte sequence
            | (?<=[\xF0-\xF4][\x80-\xBF])[\x80-\xBF](?![\x80-\xBF]) # Short 4 byte sequence (2)
        )/x';
        $string = preg_replace($regex, '', $string);
 
        $result = "";
        $current;
        $length = strlen($string);
        for ($i=0; $i < $length; $i++)
        {
            $current = ord($string{$i});
            if (($current == 0x9) ||
                ($current == 0xA) ||
                ($current == 0xD) ||
                (($current >= 0x20) && ($current <= 0xD7FF)) ||
                (($current >= 0xE000) && ($current <= 0xFFFD)) ||
                (($current >= 0x10000) && ($current <= 0x10FFFF)))
            {
                $result .= chr($current);
            }
            else
            {
                $ret;    // use this to strip invalid character(s)
                // $ret .= " ";    // use this to replace them with spaces
            }
        }
        $string = $result;
    }
    return $string;
}


openssl cms -nosmimecap -md sha256 -binary -nodetach -cades -outform DER -sign -signer miocertificato.pem -inkey miachiaveprivata.key -in filedafirmare.pdf -out fileformato.pdf.p7m

openssl smime -verify -noverify -in documento.pdf.p7m -inform DER -out documento.pdf


openssl pkcs7 -inform DER -in documento.pdf.p7m -print_certs -out cert.pem



https://www.example-code.com/phpExt/crypt_create_p7m_using_pfx.asp
// The version number (9_5_0) should match version of the Chilkat extension used, omitting the micro-version number.
// For example, if using Chilkat v9.5.0.48, then include as shown here:
include("chilkat_9_5_0.php");

$crypt = new CkCrypt2();

//  Any string argument automatically begins the 30-day trial.
$success = $crypt->UnlockComponent('30-day trial');
if ($success != true) {
    print $crypt->lastErrorText() . "\n";
    exit;
}

//  Use a digital certificate and private key from a PFX file (.pfx or .p12).
$signingCertSubject = 'Acme Inc';
$pfxFilename = '/Users/chilkat/testData/pfx/acme.pfx';
$pfxPassword = 'test123';

$certStore = new CkCertStore();
$success = $certStore->LoadPfxFile($pfxFilename,$pfxPassword);
if ($success != true) {
    print $certStore->lastErrorText() . "\n";
    exit;
}

// cert is a CkCert
$cert = $certStore->FindCertBySubjectCN($signingCertSubject);
if (is_null($cert)) {
    print 'Failed to find certificate by subject common name.' . "\n";
    exit;
}

//  Tell the crypt component to use this cert.
$success = $crypt->SetSigningCert($cert);

//  We can sign any type of file, creating a .p7m as output:
$inFile = '/Users/chilkat/testData/pdf/sample.pdf';
$outputFile = '/Users/chilkat/testData/p7m/sample.pdf.p7m';
$success = $crypt->CreateP7M($inFile,$outputFile);
if ($success == false) {
    print $crypt->lastErrorText() . "\n";

    exit;
}

//  Verify and restore the original file:
$success = $crypt->SetVerifyCert($cert);

$inFile = $outputFile;
$outputFile = '/Users/chilkat/testData/pdf/restored.pdf';

$success = $crypt->VerifyP7M($inFile,$outputFile);
if ($success == false) {
    print $crypt->lastErrorText() . "\n";

    exit;
}

print 'Success!' . "\n";


//  Any string argument automatically begins the 30-day trial.
$success = $crypt->UnlockComponent('30-day trial');
if ($success != true) {
    print $crypt->lastErrorText() . "\n";
    exit;
}

$certStore = new CkCertStore();

//  Load a PFX file into a certificate store object.
$success = $certStore->LoadPfxFile('myPfx.pfx','pfxPassword');
if ($success != true) {
    print $certStore->lastErrorText() . "\n";
    exit;
}

//  Get the certificate by subject common name.
//  This should be the cert within the PFX that also
//  has a private key (also stored within the PFX).
// cert is a CkCert
$cert = $certStore->FindCertBySubjectCN('myCert');
if (is_null($cert)) {
    print $certStore->lastErrorText() . "\n";
    exit;
}

//  Tell the crypt object to use the certificate for signing:
$success = $crypt->SetSigningCert($cert);

//  Sign a file, producing a .p7m as output.
//  The input file is unchanged, the test.p7m contains the
//  contents of the input file and the signature.
$inFile = 'test.txt';
$outFile = 'testp7m';
$success = $crypt->CreateP7M($inFile,$outFile);
if ($success != true) {
    print $crypt->lastErrorText() . "\n";
    exit;
}

print 'Success!' . "\n";
