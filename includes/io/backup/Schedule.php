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
	
	require_once('../var.php');
	$output = array();
	$output["metaData"]["idProperty"] = "ID";
	$output["metaData"]["totalProperty"] = "total";
	$output["metaData"]["successProperty"] = "success";
	$output["metaData"]["rootProperty"] = "data";
	$output["metaData"]["root"]="data";
	$output["message"] = "";
	$output["messagedebug"] = "";
			
	WFSendLOG("Schedule:","START");
	//WFSetDebug(true);
	
	$now = new DateTime();
		
	$sql = "SELECT * 
			FROM " . $ExtJSDevDB . "schedule 
			WHERE STATUS = 1" ;
	$rsScheduler = $conn->Execute($sql);
	while (!$rsScheduler->EOF) {	
		$SchedID = $rsScheduler->fields["ID"];
		echo( 'Proc->  ' . $SchedID . BRCRLF);
		
		$every = $rsScheduler->fields["EVERY"];
		$everyum = $rsScheduler->fields["EVERYUM"];
		echo( '-every:' . $every . ' ' . $everyum . BRCRLF);
		
		$lastexec = new DateTime();
		if ($rsScheduler->fields["LASTEXEC"] != NULL) $lastexec = new DateTime($rsScheduler->fields["LASTEXEC"]);
		echo( '-last:' . $lastexec->format('Y-m-d H:i:s') . BRCRLF);
		
		$lastexec->modify('+' .$every . ' '. $everyum);
		echo( '-now:' . $now->format('Y-m-d H:i:s'). BRCRLF);
		echo( '-next:' . $lastexec->format('Y-m-d H:i:s'). BRCRLF);
		
		$intervaldate = $now->diff($lastexec);
		$interval = $intervaldate->format('%R%s');
		$interval = $interval + $intervaldate->format('%R%i') * 60;
		$interval = $interval + $intervaldate->format('%R%H') * 60 * 60;
		$interval = $interval + $intervaldate->format('%R%a') * 24 * 60 * 60;
		echo( '-toExecute:' . $interval .'s'. BRCRLF);
		
		if ($interval<0) {
			//exec current process
			$SchedProcID = $rsScheduler->fields["CT_AAAPROC"];
			echo( '-Exec-> procid:' . $SchedProcID. BRCRLF);
			WFSendLOG("Schedule:","Execute:" . $SchedProcID);
			$sqlC = " UPDATE " . $ExtJSDevDB . "schedule SET LASTEXEC = NOW() WHERE ID = " . $SchedID ;
			$conn->Execute($sqlC);
			try {  
				WFPROCESSFREE($SchedProcID);
			} catch (exception $e){
				echo('ERR WFPROCESSFREE '.  $SchedID .BRCRLF);
			}
			echo( '-ReScheduled-> procid:' . $SchedProcID. BRCRLF);
		}else{
			echo( '-no todo'. BRCRLF);
		}
		
		echo( BRCRLF);
		$rsScheduler->MoveNext();
	}	
	$rsScheduler->close();
	$conn->close();
	
	echo( 'END' . BRCRLF);
?>