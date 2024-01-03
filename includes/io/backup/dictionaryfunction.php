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
	
	WFSendLOG("DictionaryFunction:","START");

	$CollectObjList = array();
	$RecordCountResult = 0;
	
	$CollectObjList = get_defined_functions('../generic.php');

	
	$output["data"] = $CollectObjList;
	$output["total"] = $RecordCountResult;
	$output["success"]=true;
	$output["message"]="success";
	
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>