<?php		
	require_once('../var.php');
	global $chiamataEsterna;
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
	
	WFSendLOG("MenuRead:","START");
	$scaledim = ''; //large medium little

	//FILTER IN MENU
	$gridwhere = '';
	$gridwhere = isset($_POST["filter"]) ? $_POST["filter"] : $gridwhere;
	$gridwhere = isset($_GET["filter"]) ? $_GET["filter"] : $gridwhere;
	$gridwhere = isset($_POST["query"]) ? $_POST["query"] : $gridwhere;
	$gridwhere = isset($_GET["query"]) ? $_GET["query"] : $gridwhere;
	
	$parent_id = 0;
	$parent_id = isset($_POST["node"]) ? $_POST["node"] : $parent_id;
	$parent_id = isset($_GET["node"]) ? $_GET["node"] : $parent_id;
	if ($parent_id == '')  $parent_id  = '0';
	if  ($UserDeveloper == true){
		if ($parent_id == 'root')  $parent_id  = '0';
	}else{
		if ($parent_id == 'root') $parent_id  = '2000';
	}
	
	if ($conn->debug==1) echo('<b>gridwhere</b>:' . $gridwhere . BRCRLF);
	if ( ($UserDeveloper == false) && (IsNullOrEmptyString($gridwhere)) ) {
		$gridwhere = '';
	}
		
	$sqlwhere = "";
	if (!IsNullOrEmptyString($gridwhere)){
		$appoggio = json_decode($gridwhere,true);
		if ($appoggio){
			foreach ($appoggio as $sub) {
				$sqlwhere = " DESCNAME LIKE '%" . $sub["value"] . "%'";
			}
		}else{
			$sqlwhere = " DESCNAME LIKE '%" . $gridwhere . "%'";
		}
	}
	

	//$PROC OVERRIDE
	$sqlSTD = "SELECT " . $ExtJSDevDB . "menu.*
				FROM " . $ExtJSDevDB . "menu 
				WHERE " ;
														 
	$sqlOVER = "SELECT " . $ExtJSDevDB . "menuoverride.*
				FROM " . $ExtJSDevDB . "menuoverride 
				WHERE ";
					
	if ($sqlwhere != '') { 
		$sqlWhereSTD =  $sqlwhere;
		$sqlWhereOVER =  $sqlwhere;
	}else{ 
		$sqlWhereSTD =  " PARENT_ID = " . $parent_id;
		$sqlWhereOVER = " PARENT_ID = " . $parent_id;
	}
			
	//if ((!IsNullOrEmptyString($UserAnagrafiche)) || ($chiamataEsterna)){
	if ($chiamataEsterna){
		$sqlWhereSTD = $sqlWhereSTD . " AND PARENT_ID < 2000 ";
		$sqlWhereOVER = $sqlWhereOVER . " AND PARENT_ID < 2000 ";
	}
	else{
		if ($UserDeveloper == false){
			$sqlWhereSTD = $sqlWhereSTD .   " AND (ID <> 10000 AND PARENT_ID <> 10000) AND (ID <> 11021 AND PARENT_ID <> 11021) AND (PARENT_ID <> 10013) ";
		}
		if ($UserAdmin == false){
			$sqlWhereSTD = $sqlWhereSTD .   " AND (ID <> 11000 AND PARENT_ID <> 11000) AND (ID <> 11021 AND PARENT_ID <> 11021) AND (PARENT_ID <> 10013) ";
		}
	}
	$sql = $sqlOVER . " " . $sqlWhereOVER. 
			" UNION " . 
			$sqlSTD . " " . $sqlWhereSTD ;
	$sql = $sql . " ORDER BY ORDPRIORITY ASC, DESCNAME ASC";
	$output["messagedebug"] = $sql;
	$rs = $conn->Execute($sql);
				
	//field
	$output["fields"][]=array("name"=>"id","type"=>"int");
	$output["fields"][]=array("name"=>"text","type"=>"string");
	$output["fields"][]=array("name"=>"leaf","type"=>"string");
	$output["fields"][]=array("name"=>"iconCls","type"=>"string");
	$output["fields"][]=array("name"=>"cls","type"=>"string");
	$output["fields"][]=array("name"=>"scale","type"=>"string");
	$output["fields"][]=array("name"=>"ctid","type"=>"int");
	$output["fields"][]=array("name"=>"draggable","type"=>"string");
	$output["fields"][]=array("name"=>"disabled","type"=>"string");
	
	//Permission
	$PermissionOn = true;
	if (($UserDeveloper == true) || ($UserAdmin == true)){
		$PermissionOn = false;
	}
	
	//data
	$RecordCountResult = 0;
	$RecordLastID = 0;
	while (!$rs->EOF) {	
		if ($RecordLastID == $rs->fields['ID']) goto AvanzaMenu;
		$RecordLastID = $rs->fields['ID'];
		//gruppo permessi
		$EnableMenu = true;
		if ($PermissionOn == true){
			
			/* PER TUTTI GLI USER */
			$sql =  "SELECT VISIBLE FROM " . $ExtJSDevDB . "menugroup " . 
					" WHERE CT_AAAGROUP is null AND CT_AAAUSER is null" .
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
			
			
			/* PER TUTTI I GRUPPI APPARTENENTI ALLO USER */
			$sql =  "SELECT " . $ExtJSDevDB . "menugroup.VISIBLE " .
					" FROM " . $ExtJSDevDB . "menugroup " . 
						" INNER JOIN " . $ExtJSDevDB . "usergroup ON " . $ExtJSDevDB . "usergroup.CT_AAAGROUP = " . $ExtJSDevDB . "menugroup.CT_AAAGROUP" .
					" WHERE " . $ExtJSDevDB . "usergroup.CT_AAAUSER = " . $UserId .
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
			
			
			/* PER TUTTI I USER  */
			$sql =  "SELECT " . $ExtJSDevDB . "menugroup.VISIBLE " .
					" FROM " . $ExtJSDevDB . "menugroup " . 
					" WHERE " . $ExtJSDevDB . "menugroup.CT_AAAUSER = " . $UserId .
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
		$rscount = $conn->SelectLimit($sql);
		$CounterLeaf = $rscount->RecordCount();
		
		if ($CounterLeaf == 0 ){
			$sql =  "SELECT ID " .
					" FROM " . $ExtJSDevDB . "menuoverride " . 
					" WHERE PARENT_ID = " . $rs->fields['ID'];
			$rscount = $conn->SelectLimit($sql);
			$CounterLeaf = $rscount->RecordCount();
		}
		
		$ModuleDisabled = false;
		if (!IsNullOrEmptyString($rs->fields['CT_AAAMODULES'])){
			$RsModule = DLookup($conn,'*', $ExtJSDevDB . "modules ", "ID = '" . $rs->fields['CT_AAAMODULES'] . "'");
			if ($RsModule ==''){
				$ModuleDisabled = false;
			}
			else{
				if ($RsModule['VISIBLE'] == 0){
					$ModuleDisabled = true;
				}else{
					$ModuleDisabled = false;
				}
			}
		}
		/*
		'menu-red'
			'menu-blue'
			'menu-green'
			'menu-black'
			'menu-orange'
			*/
		//stampa menu

		if ($EnableMenu == true){
			$output["data"][]=array("id"=>$rs->fields['ID'],
									"text"=>$rs->fields['DESCNAME'],
									"leaf"=>($CounterLeaf==0),
									//"iconCls"=>'x-' . $rs->fields['ICONCLS'] . ' '. $rs->fields['CLS'],
									"iconCls"=>'x-' . $rs->fields['ICONCLS'] . ' toolBarIcon',
									"scale"=> $scaledim,
									"rowCls"=>$rs->fields['CLS'],
									"componentCls"=>'mgcomponentcls',
									"ctid"=>$rs->fields['CT_AAAPROC'],
									"draggable"=>false,
									"disabled"=>$ModuleDisabled
									);
		} else {
			$output['enableMenu'] = false;
		}
		$rscount->close();
		$RecordCountResult++;
		AvanzaMenu:
		$rs->MoveNext();
	}	
	$rs->close();

	// misc 
	$output["total"] = $RecordCountResult;
	$output["success"] = true;
	$output["message"] = "success";
	
	if ($conn->debug!=1) header('Content-Type: application/json');
	$Appo =  Array2JSON($output, $debugmessage);
	
	echo $Appo;
?>