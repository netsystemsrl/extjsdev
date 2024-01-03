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
	
	$record = array();
			
	WFSendLOG("LayoutWriteRun:","START");

	$LayoutId  = 0;
	if (isset($_POST["layoutid"])) { $LayoutId = $_POST["layoutid"]; $record["ID"] = $LayoutId; }
	if (isset($_GET["layoutid"])) { $LayoutId = $_GET["layoutid"]; $record["ID"] = $LayoutId; }
	
	$name = '';
	$name = isset($_POST["name"]) ? $_POST["name"] 	: $name;
	$name = isset($_GET["name"])  ? $_GET["name"]	: $name;
	
	$property = '';
	$property = isset($_POST["property"]) ? $_POST["property"]	: $property;
	$property = isset($_GET["property"]) ? $_GET["property"]	: $property;
	
	if (($LayoutId != '') && ($LayoutId != '0') && ($LayoutOverride != '')){
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutcss WHERE CT_AAALAYOUT = " . $LayoutId ;
		$rs = $conn->Execute($sql);
		if ($rs) {
			if ($rs->RecordCount()==1)  {
				$sqlC = $conn->UpdateClob($ExtJSDevDB . "layoutcss",'LAYOUTOVERRIDE',	$LayoutOverride,"CT_AAALAYOUT = " . $LayoutId);
			}else{
				$sqlC = $conn->InsertClob($ExtJSDevDB . "layoutcss",'LAYOUTOVERRIDE',	$LayoutOverride,"CT_AAALAYOUT = " . $LayoutId);
			}
			if ($conn->debug==1) var_dump($sqlC);
			$appo = $conn->Execute($sqlC); 
		}
		if ($appo == true) {
			$output["success"] = true; 
		}else{ 
			$output["failure"] = true; 
			$output["message"] = $output["message"]  . "--"  . $sql . "--". $sqlC  . "--". $conn->ErrorMsg();
		}
		$output["total"] = $conn->Affected_Rows();
	}
	
	$conn->close();
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>