<?php		
	require_once($_SERVER['DOCUMENT_ROOT'] . '/includes/var.php');
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
	
	WFSendLOG("APImenuapp:","START");
			
	$parent_id = 3000;
	$parent_id = isset($_POST["node"]) ? $_POST["node"] : $parent_id;
	$parent_id = isset($_GET["node"]) ? $_GET["node"] : $parent_id;
	if ($parent_id == '') $parent_id  = '0';
	
	$sql =  "SELECT * FROM " . $ExtJSDevDB . "menu " . 
			" WHERE PARENT_ID = " . $parent_id . 
			" ORDER BY ORDPRIORITY ASC, DESCNAME ASC";
	$rs = $conn->Execute($sql);
		
	//can pre-define
	$output["metaData"]["idProperty"]="ID";
	$output["metaData"]["totalProperty"]="total";
	$output["metaData"]["successProperty"]="success";
	$output["metaData"]["root"]="data"; 
				
	//field
	$output["fields"][]=array("name"=>"id","type"=>"int");
	$output["fields"][]=array("name"=>"text","type"=>"string");
	$output["fields"][]=array("name"=>"leaf","type"=>"string");
	$output["fields"][]=array("name"=>"iconCls","type"=>"string");
	$output["fields"][]=array("name"=>"cls","type"=>"string");
	$output["fields"][]=array("name"=>"draggable","type"=>"string");
	
	//Permission
	$PermissionOn = true;
	
	//data
	$RecordCountResult = 0;
	while (!$rs->EOF) {	
		//gruppo permessi
		$EnableMenu = true;
		if ($PermissionOn == true){
			$sql =  "SELECT * FROM " . $ExtJSDevDB . "menugroup " . 
					" WHERE CT_AAAGROUP = 0" .
					" AND CT_AAAMENU  = " . $rs->fields['ID'];
			$rsgroup = $conn->Execute($sql);
			if (!$rsgroup->EOF) {
				if ($rsgroup->fields['VISIBLE'] == 0) {
					$EnableMenu = false;
				}
			}
			$rsgroup->close();
			
			$sql =  "SELECT * FROM " . $ExtJSDevDB . "menugroup " . 
					" WHERE CT_AAAGROUP = " . 0 . 
					" AND CT_AAAMENU  = " . $rs->fields['ID'];
			$rsgroup = $conn->Execute($sql);
			if (!$rsgroup->EOF) {
				if ($rsgroup->fields['VISIBLE'] == 0) {
					$EnableMenu = false;
				}else{
					$EnableMenu = true;
				}
			}
			$rsgroup->close();
			
			$sql =  "SELECT * FROM " . $ExtJSDevDB . "menugroup " . 
					" WHERE CT_AAAUSER = " . $UserId . 
					" AND CT_AAAMENU  = " . $rs->fields['ID'];
			$rsgroup = $conn->Execute($sql);
			if (!$rsgroup->EOF) {
				if ($rsgroup->fields['VISIBLE'] == 0) {
					$EnableMenu = false;
				}else{
					$EnableMenu = true;
				}
			}
			$rsgroup->close();
		}
		
		//conta se ha figli per cambiare icona
		$sql =  "SELECT ID " .
				" FROM " . $ExtJSDevDB . "menu " . 
				" WHERE PARENT_ID = " . $rs->fields['ID'];
		$rscount = $conn->SelectLimit($sql,1,-1);
				
		//stampa menu
		if ($EnableMenu == true){
			$IconCLSAgular = $rs->fields['ICONCLS'];
			$IconCLSAgular = str_replace('-','_',$IconCLSAgular);
			$output["data"][]=array("id"=>$rs->fields['ID'],
									"text"=>$rs->fields['DESCNAME'],
									"leaf"=>($rscount->RecordCount()==0),
									"iconCls"=>$IconCLSAgular,
									"rowCls"=>$rs->fields['CLS'],
									"draggable"=>false,
									);
		}
		$rscount->close();
		$rs->MoveNext();
		$RecordCountResult++;
	}	
	$rs->close();

	// misc 
	$output["total"]=$RecordCountResult;
	$output["success"]=true;
	$output["message"]="success";
	
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
	$conn->close();
?>