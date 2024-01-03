<?php
	
	session_start();
	error_reporting(E_ALL ^ E_DEPRECATED ^ E_WARNING);
	
	ini_set('max_execution_time', 100);
	setlocale(LC_MONETARY, 'it_IT');
	date_default_timezone_set('europe/rome');
	$_SESSION['debug'] = 'false';
	
	$dbname   = '';
	$dbname   = isset($_POST["dbname"])   ? $_POST["dbname"]   : $dbname;
	$dbname   = isset($_GET["dbname"])    ? $_GET["dbname"]    : $dbname;
	
	$username = '';
	$username = isset($_POST["username"]) ? $_POST["username"] : $username;
	$username = isset($_GET["username"])  ? $_GET["username"]  : $username;
	
	$password = '';
	$password = isset($_POST["password"]) ? $_POST["password"] : $password;
	$password = isset($_GET["password"])  ? $_GET["password"]  : $password;
	
	$formatOutput = 'JSON';
	$formatOutput = isset($_POST["format"]) ? $_POST["format"] : $formatOutput;
	$formatOutput = isset($_GET["format"])  ? $_GET["format"]  : $formatOutput;
	
	//AUTH
	if (($username != '') && ($password != '' )){
		//login da url
		require("LoginAuth.php");
	}else{
		//basic auth
		$authorization =  '';
		if (!isset($_SERVER['PHP_AUTH_USER']) && !isset($_SERVER['PHP_AUTH_PW'])) {
			header('WWW-Authenticate: Basic realm="ExtJSDEVDB interface"');
			header('HTTP/1.0 401 Unauthorized');
			echo _('Access denied');
			exit();
		}else{
			$username = $_SERVER['PHP_AUTH_USER'];
			$password = $_SERVER['PHP_AUTH_PW'];
			require("LoginAuth.php");
		}
	}
		
	if ($output['failure'] == true) {
		echo Array2JSON($output);
		$conn->close(); 
		die();
	}
	
	//MAIN
	$latitude = '';
	$latitude = isset($_POST["latitude"]) ? $_POST["latitude"] : $latitude;
	$latitude = isset($_GET["latitude"]) ? $_GET["latitude"] : $latitude;
	
	$longitude = '';
	$longitude = isset($_POST["longitude"]) ? $_POST["longitude"] : $longitude;
	$longitude = isset($_GET["longitude"]) ? $_GET["longitude"] : $longitude;
	
	$sqlC = "INSERT INTO aaalogsuser (CT_AAAUSER, CT_TABLE, CT_ID, TYPE) 
			VALUES ('" . $UserId . "', 'GPS', '" . $latitude . "," . $longitude . "', 'GPS')";
	$conn->Execute($sqlC);
	$conn->close();
	
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>