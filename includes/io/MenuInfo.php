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
	
	WFSendLOG("MenuInfo:","START");
	
//definizioni
	$output["metaData"]["idProperty"]="ctid";
	$output["total"]=1;
	$output["ctid"] = 0;
	
// recupera dati del menu e di cosa eseguire

	//$PROC OVERRIDE
	$sqlSTD = "SELECT " . $ExtJSDevDB . "menu.*
				FROM " . $ExtJSDevDB . "menu 
				WHERE ID = " . $MenuId ;
														 
	$sqlOVER = "SELECT " . $ExtJSDevDB . "menuoverride.*
				FROM " . $ExtJSDevDB . "menuoverride 
				WHERE ID = " . $MenuId ;
	
	$sql = $sqlOVER . " " . " UNION " . $sqlSTD . " " ;
	$rs = $conn->Execute($sql);
	if ($rs == true) {
		$output["total"] = '1';
		$output["id"] = $rs->fields['ID'];
		$output["text"] = $rs->fields['DESCNAME'];
		if ($rs->fields['CT_AAAPROC'] >0 ) {
			$output["ctid"] = $rs->fields['CT_AAAPROC'];
			$output["type"] = 'proc';
		}
		$output["viewtype"] = '';
		$output["success"] = true;
		$output["message"] = '';
	}else{ 
		$output["id"] = 0;
		$output["failure"] = true; 
		$output["message"] = $output["message"] . $conn->ErrorMsg();
	}
	$rs->Close();
	
//salvo il tutto
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
	WFSendLOG("MenuInfo:","STOP");
	$conn->close();
?>