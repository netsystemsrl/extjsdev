<?php		
	require_once('../var.php');
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
	//WFSetDebug(true);
	$debugmessage = 0;
	
	$output['UserId'] = $UserId;
	$output['success'] = false;
	
	//heartbeat user connected
	$sql = "UPDATE aaausersession 
			SET  LASTACTIVITY = NOW() 
			WHERE CT_AAAUSER = " . $UserId . " 
				AND NUMREG = " . $RegistrationId ;
	$conn->Execute($sql);		
	
	//find user message
	$sql = "SELECT * 
				FROM aaaactivity 
				WHERE CT_AAAUSER = " . $UserId . " 
					AND DATE(ALERTDATE) <= CURDATE()
					AND ALERTTIME <= NOW()
					AND ALERTED = 0 
				LIMIT 1";
		
	$rs = $conn->Execute($sql);	
	if ($rs && $rs->RecordCount()>0) {
		$output['success'] = true;
		$output["data"][] = array(	"ID"=> $rs->fields['ID'],
									"TITLE"=> $rs->fields['DESCNAME'],
									"MESSAGE"=> $rs->fields['NOTA'],
									"MENUID"=> '10017',
									"ICON"=> ''
								);
		$rs->close();
		$sql = "UPDATE aaaactivity SET ALERTED = 1 WHERE ID = " . $rs->fields['ID'];
		$conn->Execute($sql);
	}	
	
	//RESULT
	$Appo = Array2JSON($output);
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo $Appo;
?>