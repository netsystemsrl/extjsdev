<?php

	error_reporting(E_ALL); 
	ini_set('display_startup_errors', 1);
	ini_set('display_errors', 1);
	error_reporting(-1);
	
require "PHPAnviz.php";
//third parameter is optional, if not set class uses default config.ini we've created earlier
$anviz = new PHPAnviz(1, 5010, "config.ini");

//format is optional, by default method getDateTime returns datetime in Y-m-d H:i:s format
echo $anviz->getDateTime("Y/m/d H:i:s");
var_dump($anviz->getInfo1()); //array
var_dump($anviz->getInfo2()); //array
var_dump($anviz->getTCPIPParameters()); //array
var_dump($anviz->getRecordInformation()); //array
var_dump($anviz->downloadStaffInfo());//array of users
var_dump($anviz->downloadTARecords(PHPAnviz::DOWNLOAD_ALL)); //array 
//DOWNLOAD_NEW

/*DELETE ALL DATA
//$result = $anviz->clearRecords(PHPAnviz::CLEAR_NEW_PARTIALY, 24);
PHPAnviz::CLEAR_ALL -> if you want to delete all records

PHPAnviz::CLEAR_NEW -> remove all "new record" signs

PHPAnviz::CLEAR_NEW_PARTIALY, int $n -> remove first $n "new records" signs
*/