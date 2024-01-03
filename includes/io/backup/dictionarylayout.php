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
	$output = array();	   
	//WFSetDebug(true);
	$debugmessage = 0;
	
	WFSendLOG("DictionaryLayout:","START");

	$sql =  "SELECT * 
			FROM " . $ExtJSDevDB . "layout 
			WHERE DESCNAME IS NOT NULL 
			ORDER BY DESCNAME";
	$rs = $conn->Execute($sql);
	while (!$rs->EOF) 
	{
		$output[]= array(	"id"=> $rs->fields['ID'],
							"text"=> $rs->fields['DESCNAME']
							);	
		$rs->MoveNext();
	}
	
	$rs->close();
	
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>