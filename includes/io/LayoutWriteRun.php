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
	
	WFSendLOG("LayoutWriteRun:","START");

	$record = array();
	$LayoutId  = 0;
	if (isset($_POST["layoutid"])) { $LayoutId = $_POST["layoutid"]; $record["ID"] = $LayoutId; }
	if (isset($_GET["layoutid"])) { $LayoutId = $_GET["layoutid"]; $record["ID"] = $LayoutId; }
	
	$LayoutAggregate = '';
	$LayoutAggregate = isset($_POST["aggregate"]) ? $_POST["aggregate"] : $LayoutAggregate;
	$LayoutAggregate = isset($_GET["aggregate"])  ? $_GET["aggregate"]	: $LayoutAggregate;
	if ($LayoutAggregate 	!= '')	{
		$LayoutAggregateArray = Array2JSON($LayoutAggregate,true);	
		$LayoutAggregate = json_decode($LayoutAggregateArray ,true);
	}
	
	$LayoutLeftAxis = '';
	$LayoutLeftAxis = isset($_POST["leftAxis"]) ? $_POST["leftAxis"]	: $LayoutLeftAxis;
	$LayoutLeftAxis = isset($_GET["leftAxis"]) ? $_GET["leftAxis"]		: $LayoutLeftAxis;
	if ($LayoutLeftAxis 	!= '')	{
		$LayoutLeftAxisArray  = Array2JSON($LayoutLeftAxis,true);	
		$LayoutLeftAxis = json_decode($LayoutLeftAxisArray ,true);
	}
	
	$LayoutTopAxis = '';
	$LayoutTopAxis = isset($_POST["topAxis"]) ? $_POST["topAxis"]	: $LayoutTopAxis;
	$LayoutTopAxis = isset($_GET["topAxis"]) ? $_GET["topAxis"] 	: $LayoutTopAxis;
	if ($LayoutTopAxis 		!= '')	{
		$LayoutTopAxisArray  = Array2JSON($LayoutTopAxis,true);		
		$LayoutTopAxis = json_decode($LayoutTopAxisArray ,true);
	}
	
	$LayoutColumnWidth = '';
	$LayoutColumnWidth = isset($_POST["columnwidthsplit"]) ? $_POST["columnwidthsplit"] 	: $LayoutColumnWidth;
	$LayoutColumnWidth = isset($_GET["columnwidthsplit"]) ? $_GET["columnwidthsplit"] 	: $LayoutColumnWidth;
	
	$LayoutOverride = '';
	$LayoutOverride = isset($_POST["override"]) ? $_POST["override"] 	: $LayoutOverride;
	$LayoutOverride = isset($_GET["override"]) ? $_GET["override"] 	: $LayoutOverride;
	
	if (($LayoutId != '') && ($LayoutId != '0')){			
		if ($LayoutAggregate 	!= '')	$sqlC = $conn->UpdateClob($ExtJSDevDB . "layoutoverride",'AGGREGATEJSON',	$LayoutAggregate,"ID = " . $LayoutId);
		if ($LayoutLeftAxis 	!= '')	$sqlC = $conn->UpdateClob($ExtJSDevDB . "layoutoverride",'LEFTAXISJSON',	$LayoutLeftAxis,"ID = " . $LayoutId);
		if ($LayoutTopAxis 		!= '')	$sqlC = $conn->UpdateClob($ExtJSDevDB . "layoutoverride",'TOPAXISJSON',		$LayoutTopAxis,"ID = " . $LayoutId);
		if ($LayoutColumnWidth 	!= '')	$sqlC = $conn->UpdateClob($ExtJSDevDB . "layoutoverride",'COLUMNWIDTH',		$LayoutColumnWidth,"ID = " . $LayoutId);$output["success"] = true; 
		
		if ($LayoutOverride 	!= '')	{
			$sql = "SELECT * FROM " . $ExtJSDevDB . "userlayout WHERE CT_AAALAYOUT = " . $LayoutId . " AND  CT_AAAUSER = " . $UserId;
			$rs = $conn->Execute($sql);
			if ($rs->RecordCount()==0) {
				$record = array();
				$record['CT_AAALAYOUT'] = $LayoutId;
				$record['CT_AAAUSER'] = $UserId;
				$date = new DateTime();
				$record['SI'] = $date->getTimestamp(); 
				$record['SR'] = $date->getTimestamp(); 
				$record['SA'] = $UserId; 
				$sqlC = $conn->GetInsertSQL($rs, $record);
				if ($sqlC <> '') $conn->Execute($sqlC);
			}
			$rs->close();
			$sqlC = $conn->UpdateClob($ExtJSDevDB . "userlayout",'LAYOUTOVERRIDE',	$LayoutOverride,"CT_AAAUSER = " . $UserId . " AND CT_AAALAYOUT = " .$LayoutId);
			WFLOGUSER($UserId,$ExtJSDevDB . "userlayout",$LayoutId,$LayoutOverride,'UPD');
		}
		
		$output["message"] = 'Layout Updated!'; 
	}
		
	$conn->close();
	
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>