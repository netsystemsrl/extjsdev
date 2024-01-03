<?php

require_once('PrintIPP.php');

$ipp = new PrintIPP();
$ipp->setHost("192.168.0.108");
$ipp->setPrinterURI("/printers/Zebra_TLP2844");

$ipp->debug_level = 3; // Debugging very verbose
$ipp->setLog('printipp','file',3); // logging very verbose
$ipp->setUserName("foo bar"); // setting user name for server
$ipp->setDocumentName("testfile with UTF-8 characters");


//$ipp->setMimeMediaType("text/plain");
$ipp->setMimeMediaType("application/vnd.cups-raw");
$ipp->setData("test.prn"); // Path to file.

$ipp->printJob();

/*
$ipp->setHost("192.168.0.108");
$ipp->setPrinterURI("/printers/Zebra_TLP2844");
$ipp->setMimeMediaType();
$ipp->setJobName("PHP Test: PDF",true); 
$ipp->setData("test.pdf"); // Path to file.
$ipp->printJob();
*/
?>
