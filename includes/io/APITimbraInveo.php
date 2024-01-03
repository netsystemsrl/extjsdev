<?php

	session_start();
	//error_reporting(E_ALL ^ E_DEPRECATED ^ E_WARNING);
	ini_set('max_execution_time', 100);
	setlocale(LC_MONETARY, 'it_IT');
	date_default_timezone_set('europe/rome');
	$_SESSION['debug'] = 'false';
	
	$dbname   = 'manager';
	$dbname   = isset($_POST["dbname"])   ? $_POST["dbname"]   : $dbname;
	$dbname   = isset($_GET["dbname"])    ? $_GET["dbname"]    : $dbname;
	
	$username = 'pro';
	$username = isset($_POST["username"]) ? $_POST["username"] : $username;
	$username = isset($_GET["username"])  ? $_GET["username"]  : $username;
	
	$password = '135792468';
	$password = isset($_POST["password"]) ? $_POST["password"] : $password;
	$password = isset($_GET["password"])  ? $_GET["password"]  : $password;
	
	//die();
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
	
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
	$output = array();
	$output["metaData"]["idProperty"] = "ID";
	$output["metaData"]["totalProperty"] = "total";
	$output["metaData"]["successProperty"] = "success";
	$output["metaData"]["rootProperty"] = "data";
	$output["metaData"]["root"]="data";
	$output["message"] = "";
	$output["messagedebug"] = "";
	
	if ($UserId == 0) {
		$output["failure"]=true;
		$output["success"]=false;
		$Appo = Array2JSON($output,$debugmessage);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
		die();
	}
	WFSetDebug(false);
	$date = new DateTime();
	$debugmessage = 0;

	//MAIN
	$mac = '';
	$mac = isset($_POST["mac"]) ? $_POST["mac"] : $mac;
	$mac = isset($_GET["mac"]) ? $_GET["mac"] : $mac;
	$mac = isset($_POST["?mac"]) ? $_POST["?mac"] : $mac;
	$mac = isset($_GET["?mac"]) ? $_GET["?mac"] : $mac;
	
	$id = '';
	$id = isset($_POST["id"]) ? $_POST["id"] : $id;
	$id = isset($_GET["id"]) ? $_GET["id"] : $id;
	
	$in = '';
	$in = isset($_POST["in"]) ? $_POST["in"] : $in;
	$in = isset($_GET["in"]) ? $_GET["in"] : $in;
	
	//MANAGER
	$hr_timbratore = WFVALUEDLOOKUP('*','hr_timbratore',"MAC = '" . $mac . "'");
	if ($hr_timbratore == ''){
		$hr_timbratore = array();
		$hr_timbratore['DESCRIZIONE'] = $mac;
		$hr_timbratore['MAC'] = $mac;
		$hr_timbratore['CODICE'] = $mac;
		$hr_timbratore['SI'] = $date->getTimestamp(); 
		$hr_timbratore['SC'] = $date->getTimestamp(); 
		$hr_timbratore['DATAINSTALLAZIONE'] = $date->getTimestamp(); 
		$conn->AutoExecute("hr_timbratore", $hr_timbratore, 'INSERT' );
		$hr_timbratore['ID'] = $conn->Insert_ID();
	}
	//Aggiorna stato sensore
	$hr_timbratore['SR'] = $date->getTimestamp(); 
	$hr_timbratore = WFARRAYEPURE($hr_timbratore);
	$conn->AutoExecute("hr_timbratore", $hr_timbratore, 'UPDATE','ID = ' . $hr_timbratore['ID'] );
	
	
	//APPLICATION 
	WFSQLCONNECT($hr_timbratore['DBNAME']);
	$hr_timbratore = WFVALUEDLOOKUP('*','hr_timbratore',"MAC = '" . $mac . "'");
	if ($hr_timbratore == ''){
		$hr_timbratore = array();
		$hr_timbratore['DESCRIZIONE'] = $mac;
		$hr_timbratore['MAC'] = $mac;
		$hr_timbratore['CODICE'] = $mac;
		$hr_timbratore['SI'] = $date->getTimestamp(); 
		$hr_timbratore['SC'] = $date->getTimestamp(); 
		$hr_timbratore['DATAINSTALLAZIONE'] = $date->getTimestamp(); 
		$conn->AutoExecute("hr_timbratore", $hr_timbratore, 'INSERT' );
		$hr_timbratore['ID'] = $conn->Insert_ID();
	}
	//Aggiorna stato sensore
	$hr_timbratore['SR'] = $date->getTimestamp(); 
	$hr_timbratore = WFARRAYEPURE($hr_timbratore);
	$conn->AutoExecute("hr_timbratore", $hr_timbratore, 'UPDATE','ID = ' . $hr_timbratore['ID'] );
	
	$hr_timbrature = array();
	$hr_timbrature['BADGE'] = hexdec($id);
	$hr_timbrature['HR_CT_TIMBRATORE'] = $hr_timbratore['ID'];
	$hr_timbrature['DATA'] = $date->getTimestamp(); 
	$hr_timbrature['ORA'] = $date->getTimestamp(); 
	$hr_timbrature['SI'] = $date->getTimestamp(); 
	$hr_timbrature['SC'] = $date->getTimestamp(); 
	$hr_timbrature['ID'] =  null;
	$hr_timbrature = WFARRAYEPURE($hr_timbrature);
	$conn->AutoExecute("hr_timbrature", $hr_timbrature, 'INSERT' );

	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/xml');
	
	$user_allowed = 1; 
	if($user_allowed==1){
		echo "<buzz>10,0,1</buzz>";
		echo "<led>10,0,1</led>";
	}else {
		echo "<buzz>5,5,4</buzz>"; // different signal
		echo "<led>5,5,4</led>";
	}
?>