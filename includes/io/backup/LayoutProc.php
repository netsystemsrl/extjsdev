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
	WFSetDebug(false);
	$debugmessage = 0;
	
	WFSendLOG("LayoutProc:","START");

	$LAYOUTJSON = "";
	$DATASOURCE = "";
	$DATASOURCETYPE = "";
	$DATASOURCEFIELD = "";
	$VIEWTYPE = "";

	$LayoutId = 0;
	$LayoutId = isset($_POST["layoutid"]) ? $_POST["layoutid"] : $LayoutId;
	$LayoutId = isset($_GET["layoutid"]) ? $_GET["layoutid"] : $LayoutId;
	if ($LayoutId == '') $LayoutId = 0;
		
	
	$RecordCountResult = 0;
	$LastICONCLS ='';
	$GROUP=false;
	$ICONCLS ='';
	
	if (($LayoutId != '') && ($LayoutId != '0')){
		
		//$LAYOUT OVERRIDE
		$sqlSTD = "SELECT " . $ExtJSDevDB . "layoutproc.*
					FROM " . $ExtJSDevDB . "layoutproc " ;
															 
		$sqlOVER = "SELECT " . $ExtJSDevDB . "layoutprocoverride.*
					FROM " . $ExtJSDevDB . "layoutprocoverride ";
		if (is_numeric($LayoutId) == true){
			$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layoutproc.CT_AAALAYOUT = " . $LayoutId;
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutprocoverride.CT_AAALAYOUT = " . $LayoutId; 
		} else {
			$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layoutproc.CT_AAALAYOUT = '" . $LayoutId ."'";
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutprocoverride.CT_AAALAYOUT = '" . $LayoutId ."'"; 
		}
		$sql = $sqlOVER  . " " . $sqlWhereOVER . " UNION " . $sqlSTD . " " . $sqlWhereSTD;
		
		
		
		
		$sql = $sql . " ORDER BY ICONCLS, ORDPRIORITY, DESCNAME";
		if ($conn->debug==1){	echo('sql:' . $sql . "<BR>\n");}
		$rs = $conn->Execute($sql);

		//field
		$output["fields"][]=array("name"=>"ID","type"=>"int");
		$output["fields"][]=array("name"=>"DESCNAME","type"=>"string");
		$output["fields"][]=array("name"=>"CT_AAALAYOUT","type"=>"string");
		$output["fields"][]=array("name"=>"CT_AAAPROC","type"=>"string");
		$output["fields"][]=array("name"=>"ICONCLS","type"=>"string");
		$output["fields"][]=array("name"=>"DEVICETYPE","type"=>"string");
		$output["fields"][]=array("name"=>"ALERT","type"=>"string");
		$output["fields"][]=array("name"=>"TOOLTIP","type"=>"string");
		
		//data
		if ($rs !== false) {
			while (!$rs->EOF) {
				$GROUP = false;
				if ($rs->fields['ICONCLS'] == $ICONCLS){
					$GROUP = true;
				}
				$ID = $rs->fields['ID'];
				$DESCNAME = $rs->fields['DESCNAME'];
				$CT_AAALAYOUT = $rs->fields['CT_AAALAYOUT'];
				$CT_AAAPROC = $rs->fields['CT_AAAPROC'];
				$ICONCLS = $rs->fields['ICONCLS'];
				$DEVICETYPE = $rs->fields['DEVICETYPE'];
				$ALERT = $rs->fields['ALERT'];
				$TOOLTIP = $rs->fields['TOOLTIP'];
				
				
				$rs->MoveNext();
				
				if ((!$rs->EOF) && ($GROUP == false)){
					if ($rs->fields['ICONCLS'] != $ICONCLS){
						$GROUP = false;
					}else{
						$GROUP = true;
					}
				}
				
				$output["data"][]=array("ID" => $ID,
										"DESCNAME" => $DESCNAME,
										"CT_AAALAYOUT" => $CT_AAALAYOUT,
										"CT_AAAPROC" => $CT_AAAPROC,
										"ICONCLS" => $ICONCLS,
										"DEVICETYPE" => $DEVICETYPE,
										"ALERT" => $ALERT,
										"TOOLTIP" => '' . $TOOLTIP,
										"GROUP" => $GROUP
										);
				$RecordCountResult++;
			}
			$rs->close();
		}
		$conn->close();
	}
	
	$output["data"][]=array("ID"=>0,
							"DESCNAME"=>'',
							"CT_AAALAYOUT"=>0,
							"CT_AAAPROC"=>0,
							"ICONCLS"=>'',
							"DEVICETYPE" => '',
							"ALERT" => '',
							"TOOLTIP" => ''
							);
	// misc 
	$output["total"]=$RecordCountResult;
	$output["success"]=true;
	$output["message"]="success";

	if ($conn->debug!=1) header('Content-Type: application/json');
	$Appo =  Array2JSON($output, $debugmessage);
	
	echo $Appo;
?>