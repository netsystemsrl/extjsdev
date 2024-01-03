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
	WFSetDebug(false);
	$debugmessage = 0;
	
	WFSendLOG("Dictionarycmd:","START");

	$sql =  "SELECT ID,DESCNAME ".
			" FROM " . $ExtJSDevDB . "proc ".
			" ORDER BY DESCNAME";
	$rs = $conn->Execute($sql);
	while (!$rs->EOF) 
	{
		$output[]= array(	"objname"=> $rs->fields['ID'],
							"objxtype"=> "button",
							"objregex"=> "",
							"objmaxlength"=> "",
							"objmaxlengthtext"=> "",
							"objminlength"=> "",
							"objminlengthtext"=> "",
							"objinputtype"=> "",
							"objdatasource"=> "",
							"objdatasourcetype"=> "",
							"objdatasourcefield"=> $rs->fields['ID'],
							"objvaluefield"=> "",
							"objdisplayfield"=> "",
							"objonclick"=> "",
							"objformat"=> "",
							"id"=> $rs->fields['ID'] ,
							"objprocremoteonclick" => $rs->fields['ID'] ,
							"text"=>  "" . $rs->fields['DESCNAME'],
							"cls"=> "button",
							"leaf"=> true,
							"draggable"=> true,
							);	
		$rs->MoveNext();
	}
	
	$rs->close();
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');

	echo Array2JSON($output);
?>