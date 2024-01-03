<?php
	session_start();
	error_reporting(E_ALL ^ E_DEPRECATED ^ E_WARNING);
	
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
	
	include('../includes/var.php');	
	WFSendLOG("Schedule:","START");
	//WFSetDebug(true);
	$debugmessage = 0;
	
	$formatOutput = 'JSON';
	$formatOutput = isset($_POST["format"]) ? $_POST["format"] : $formatOutput;
	$formatOutput = isset($_GET["format"])  ? $_GET["format"]  : $formatOutput;
	
	//LOGIN
	$output = array();
	$output['UserId'] = '0';
	$output['UserName'] = '';
	$output['UserGroup'] = '1';
	$output['UserDeveloper'] = 0;
	$output['UserAdmin'] = 0;
	$output['message'] = '';
	$output['success'] = false;
	$output['failure'] = false;
	
	$_SESSION['debug'] = 'false';
	$_SESSION['UserId'] = $output['UserId']; 
	$_SESSION['UserName'] = $output['UserName'];
	$_SESSION['UserGroup'] = $output['UserGroup'];
	$_SESSION['UserDeveloper'] = $output['UserDeveloper'];
	$_SESSION['UserAdmin'] = $output['UserAdmin'];
	
	$RegistrationId = time();
	$RegistrationId = isset($_POST["registrationid"]) ? $_POST["registrationid"] : $RegistrationId;
	$RegistrationId = isset($_GET["registrationid"]) ? $_GET["registrationid"] : $RegistrationId;
	$RegistrationId = isset($_SESSION["RegistrationId"]) ? $_SESSION["RegistrationId"] : $RegistrationId;
	$_SESSION["RegistrationId"] = $RegistrationId;
	
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "schedule ";
			//"WHERE STATUS < 1" ;
	$rs = $conn->Execute($sql);
	while (!$rs->EOF) {
		$now = new DateTime();
		$every = $rs->fields["EVERY"];
		$everyum = $rs->fields["EVERYUM"];
		$procid = $rs->fields["CT_AAAPROC"];
		$lastexec = new DateTime();
		if ($lastexec != NULL) $lastexec = new DateTime($rs->fields["LASTEXEC"]);
		
		echo( 'Find-> lastexec:' . $lastexec->format('Y-m-d H:i:s') . ' every:' . $every . ' everyum:' . $everyum . ' procid:' . $procid . BRCRLF);
		
		$proxexec = date_add($lastexec, date_interval_create_from_date_string($every . ' ' . $everyum));
		
		echo( 'IF proxexec:' . $proxexec->format('Y-m-d H:i:s') . ' > now:' . $now->format('Y-m-d H:i:s') . BRCRLF);
		if ($lastexec < $now ){
			echo( 'Exec-> procid:' . $procid. BRCRLF);
			
			//process in course
			echo( 'Exec-> procid:' . $procid. BRCRLF);
			WFSendLOG("Schedule:","Execute:" . $procid);
			$record = array();
			$record["STATUS"] = 1;
			$sqlC = $conn->GetUpdateSQL($rs, $record);
			$conn->Execute($sqlC);
			
			//EVAL PROCESS
			echo( 'Executed-> procid:' . $procid. BRCRLF);
			if (IsNOTNullOrEmptyString($procid)){
				$sql = "SELECT * FROM " . $ExtJSDevDB . "proc WHERE ID = " . $procid ;
				$rs = $conn->Execute($sql);
				if ($rs != false) { 
					if ($rs->RecordCount() == 1) {
						$ProcessId = $rs->fields['ID']; 
						$Source = $rs->fields['SOURCE']; 
						if ($conn->debug==1) echo('$Source:' . $Source);
						$rs->close();
					}else{
						$output["failure"] = true;
						$output["success"] = false;
						$output["message"] = "ProcessId Not Exist!!!!";
						echo Array2JSON($output);
						WFSendLOG("CallProcess:","ERROR ProcessId Not Exist STOP");	
						$conn->close();
						die();
					}
				}else{
					$output["failure"] = true;
					$output["success"] = false;
					$output["message"] = "ProcessId Not coerente!!!!";
					echo Array2JSON($output);
					WFSendLOG("CallProcess:","ERROR ProcessId Not coerente STOP");	
					$conn->close();
					die();
				}
				$output["id"] = $ProcessId;
			}
	
			//variabili e funzioni in SQL
			$Source = str_replace(',,',',NULL,',$Source);
	
			//DEBUG VISUAL EXTJSDEV
			if ($_SESSION['debug'] == 'true') WFSetDebug(true);
			if ((strpos($Source,'WFDEBUG(true)') == true) || (WFVALUESESSION('ForceDebug') == 'true')){
				$Source = str_replace('/*',"echo('<b>",$Source);
				$Source = str_replace('*/',"</b>' . BRCRLF);",$Source);
				WFSetDebug(true);
			}
			
			//EVAL PROCESS
			WFSendLOG("CallProcess:","**eseguo:" . $Source);
			$ProcessId = '0';
			try {
				eval($Source);
			}catch(Exception $e){
				$output["failure"] = true;
				$output["success"] = false;
				$output["message"] =  $output["message"] . '<BR> ERROR' . $e->getMessage() ;
				WFSendLOG("CallProcess:","error:" . get_class($e) . ", " . $e->getMessage() . ".");
			}
			
			//process executed
			echo( 'ReScheduled-> procid:' . $procid. BRCRLF);
			$record = array();
			$record["STATUS"] = 0;
			$record["LASTEXEC"] = $now->format('Y-m-d H:i:s');
			$sqlC = $conn->GetUpdateSQL($rs, $record);
			if ($sqlC != '') $conn->Execute($sqlC);
		}
		$rs->MoveNext();
	}	
	$rs->close();
	$conn->close();
?>