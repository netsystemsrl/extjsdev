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
	
	WFSendLOG("DictionaryDB:","START");

	$id = null;
	$type  = "textfield";
	
	$datasourcedbname = '';
	$datasourcedbname = isset($_POST["datasourcedbname"]) ? $_POST["datasourcedbname"] : $datasourcedbname;
	$datasourcedbname = isset($_GET["datasourcedbname"]) ? $_GET["datasourcedbname"] : $datasourcedbname;
	
	//CONNECTION
	if (!IsNullOrEmptyString($datasourcedbname)) {
		WFSQLCONNECT($datasourcedbname);
	}
	
	//tables 
	if( is_array( $tables = $conn->MetaTables( 'TABLES' , '') ) ) {
		foreach( $tables as $table ) {
			$type= "source";
			$output[]= array(	"objname"=> $table,
								"objfieldLabel"=> $table,
								"objxtype"=> $type,
								"objregex"=> "",
								"objmaxlength"=> "",
								"objmaxlengthtext"=> "",
								"objminlength"=> "",
								"objminlengthtext"=> "",
								"objinputtype"=> "",
								"objdatasource"=> $table,
								"objdatasourcetype"=> "TABLE",
								"objdatasourcefield"=> $table,
								"objvaluefield"=> "",
								"objdisplayfield"=> "",
								"objonclick"=> "",
								"objformat"=> "",
								"id"=> $table,
								"text"=> $table,
								"cls"=> $type,
								"leaf"=> false,
								"draggable"=> false,
								);	
		}		
	}		
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>