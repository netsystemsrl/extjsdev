<?php
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
	WFSendLOG("PositionExtract:","START");
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	$conn->debug=1; 
	
	// load and register the autoload function
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/PHPPdfExtractor/library/SetaPDF/Autoload.php');

	$filename = 'default.pdf';
	$filename = isset($_POST["file"]) ? $_POST["file"] : $filename;
	$filename = isset($_GET["file"]) ? $_GET["file"] : $filename;
	
	$data = array();
	$data = isset($_POST["data"]) ? $_POST["data"] : $data;
	$data = isset($_GET["data"]) ? $_GET["data"] : $data;

	$output["php"] = "";
	$output["output"] = WFPDFParserExtract($data, $filename);

	$Appo = json_encode($output);

	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo $Appo;
		