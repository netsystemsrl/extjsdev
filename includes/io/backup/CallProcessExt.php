<?php
	$dbname   = '';
	$dbname   = isset($_POST["dbname"])   ? $_POST["dbname"]   : $dbname;
	$dbname   = isset($_GET["dbname"])    ? $_GET["dbname"]    : $dbname;
	
	$username = '';
	$username = isset($_POST["username"]) ? $_POST["username"] : $username;
	$username = isset($_GET["username"])  ? $_GET["username"]  : $username;
	
	$password = '';
	$password = isset($_POST["password"]) ? $_POST["password"] : $password;
	$password = isset($_GET["password"])  ? $_GET["password"]  : $password;
	
	$token = '';
	$token = isset($_POST["token"]) ? $_POST["token"] : $token;
	$token = isset($_GET["token"])  ? $_GET["token"]  : $token;
	
	$formatOutput = 'JSON';
	$formatOutput = isset($_POST["format"]) ? $_POST["format"] : $formatOutput;
	$formatOutput = isset($_GET["format"])  ? $_GET["format"]  : $formatOutput;
	
	$RegistrationId = '';
	$RegistrationId = isset($_POST["registrationid"]) ? $_POST["registrationid"] : $RegistrationId;
	$RegistrationId = isset($_GET["registrationid"])  ? $_GET["registrationid"]  : $RegistrationId;
	
	//AUTH
	if ((($username != '') && ($password != '' )) || ($token != '')){
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
			$token = "";
			require("LoginAuth.php");
		}
	}
	if ($output['failure'] == true) {
		echo Array2JSON($output);
		$conn->close(); 
		die();
	}	
	
	//WFSetDebug(true);
	
	//MAIN
	require('CallProcess.php');
?>