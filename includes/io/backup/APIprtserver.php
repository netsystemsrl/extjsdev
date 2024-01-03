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
	
	//MANAGER PRINT    FILE QUEUE  
	$prtname   = '';
	$prtname   = isset($_POST["prtname"])   ? $_POST["prtname"]   : $prtname;
	$prtname   = isset($_GET["prtname"])    ? $_GET["prtname"]    : $prtname;
	chdir($ExtJSDevExportRAW . "prt/" . $prtname . "/");
	$path = $ExtJSDevExportRAW . "prt/" . $prtname . "/" ;
	
	$filename   = '';
	$filename   = isset($_POST["filename"])   ? $_POST["filename"]   : $filename;
	$filename   = isset($_GET["filename"])    ? $_GET["filename"]    : $filename;
	$file_path = $path . $filename;
	
	$filenamedelete   = '';
	$filenamedelete   = isset($_POST["filenamedelete"])   ? $_POST["filenamedelete"]   : $filenamedelete;
	$filenamedelete   = isset($_GET["filenamedelete"])    ? $_GET["filenamedelete"]    : $filenamedelete;
	$filedelete_path = $path . $filenamedelete;
	
	if ($filenamedelete != ''){
	//DELETE FILE
		unlink($filedelete_path);
	}
	elseif ($filename != ''){	
	//RESULT FILE
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename="'.$filename.'"');
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file_path));
		readfile($file_path);
	}elseif ($prtname != ''){	
	//RESULT LIST FILE
		$fileToPrint = glob($path. '*.*', GLOB_BRACE);
		$i = 0;
		$output["data"]= null;
		foreach ($fileToPrint as $key => $FileINName){
			$output["data"][] = array(	"ID"=> iconv("ISO-8859-1", "UTF-8", WFFileNameExt($FileINName)),
										"FILENAME"=> iconv("ISO-8859-1", "UTF-8", WFFileNameExt($FileINName)),
										"PRTNAME"=> iconv("ISO-8859-1", "UTF-8", $prtname)
									);
		}	
		$output['success'] = true;
		
		//RESULT
		$Appo = Array2JSON($output);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
	}
?>