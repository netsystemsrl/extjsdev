<?php
/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/
$dbname = $_REQUEST["dbname"];
require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
//var_dump($conn);
require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/io/CallProcessExt.php');

//$proc = $_REQUEST["processid"];
//WFPROCESS($proc);

echo json_encode($output);
