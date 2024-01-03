<?php
	session_start();
	error_reporting(E_ALL ^ E_DEPRECATED ^ E_WARNING);
	
	ini_set('max_execution_time', 100);
	setlocale(LC_MONETARY, 'it_IT');
	date_default_timezone_set('europe/rome');
	$_SESSION['debug'] = 'false';
	
	$username = '';
	$username = isset($_POST["login"]) ? $_POST["login"] : $username;
	$username = isset($_GET["login"])  ? $_GET["login"]  : $username;
	$_SESSION["username"] = $username;
	
	$password = '';
	$password = isset($_POST["password"]) ? $_POST["password"] : $password;
	$password = isset($_GET["password"])  ? $_GET["password"]  : $password;
	$_SESSION["password"] = $password;
	
	$dbname   = '';
	$dbname   = isset($_POST["dbname"])   ? $_POST["dbname"]   : $dbname;
	$dbname   = isset($_GET["dbname"])    ? $_GET["dbname"]    : $dbname;
	$_SESSION["dbname"] = $dbname;
	
	include_once('../var.php');
	
	$RegistrationId = isset($_POST["registrationid"]) ? $_POST["registrationid"] : $RegistrationId;
	$RegistrationId = isset($_GET["registrationid"]) ? $_GET["registrationid"] : $RegistrationId;
	$_SESSION["RegistrationId"] = $RegistrationId;
	
	WFSendLOG("DataReadExt:","START");
//	error_reporting(E_ALL);
//	ini_set('display_errors', 1);
//	$conn->debug=1; 
	
	$formatOutput = 'JSON';
	$formatOutput = isset($_POST["format"]) ? $_POST["format"] : $formatOutput;
	$formatOutput = isset($_GET["format"])  ? $_GET["format"]  : $formatOutput;
	
	$output = array();
	$output['UserId'] = '0';
	$output['UserName'] = '';
	$output['UserGroup'] = '';
	$output['UserDeveloper'] = 0;
	$output['UserAdmin'] = 0;
	$output['message'] = '';
	
	$sql =  "SELECT * FROM " . $ExtJSDevDB . "user WHERE LOGIN = '" . $username . "' AND PASSWORD = '" . $password . "'";
	$rs = $conn->Execute($sql);
	
	if ($rs !== false) {
		$output['UserId']        = $rs->fields['ID']; 
		$output['UserName']      = $rs->fields["DESCNAME"];
		$output['UserGroup']     = $rs->fields["CT_AAAGROUP"];
		$output['UserDeveloper'] = $rs->fields["DEVELOPER"];
		$output['UserAdmin']     = $rs->fields["ADMIN"];
		$output['success']       = true;	
		$rs->close();
		
	}else{
		$output['failure'] 		 = true; 			
		echo Array2JSON($output);
		$conn->close();
		die();
	}
	
	$_SESSION['debug'] = 'false';
	$_SESSION['UserId'] = $output['UserId']; 
	$_SESSION['UserName'] = $output['UserName'];
	$_SESSION['UserGroup'] = $output['UserGroup'];
	$_SESSION['UserDeveloper'] = $output['UserDeveloper'];
	$_SESSION['UserAdmin'] = $output['UserAdmin'];
	
	$output = array();
	include('LayoutReadRun.php');
?>