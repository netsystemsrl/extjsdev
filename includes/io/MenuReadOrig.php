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
	//WFSetDebug(true);
	$debugmessage = 0;
	
	WFSendLOG("MenuRead:","START");
	
	//FILTER IN MENU
	$gridwhere = '';
	$gridwhere = isset($_POST["filter"]) ? $_POST["filter"] : $gridwhere;
	$gridwhere = isset($_GET["filter"]) ? $_GET["filter"] : $gridwhere;
	$gridwhere = isset($_POST["query"]) ? $_POST["query"] : $gridwhere;
	$gridwhere = isset($_GET["query"]) ? $_GET["query"] : $gridwhere;
	if ($conn->debug==1) echo('<b>gridwhere</b>:' . $gridwhere . BRCRLF);
	
	$sqlwhere = "";
	if (IsNOTNullOrEmptyString($gridwhere)){
		$appoggio = json_decode($gridwhere,true);
		if ($appoggio){
			foreach ($appoggio as $sub) {
				$sqlwhere = " DESCNAME LIKE '%" . $sub["value"] . "%'";
			}
		}else{
			$sqlwhere = " DESCNAME LIKE '%" . $gridwhere . "%'";
		}
	}
	
	$parent_id = 0;
	$parent_id = isset($_POST["node"]) ? $_POST["node"] : $parent_id;
	$parent_id = isset($_GET["node"]) ? $_GET["node"] : $parent_id;
	if ($parent_id == '')  $parent_id  = '0';
	if ($parent_id == 'root')  $parent_id  = '0';
	
	$sql =  "SELECT ID, DESCNAME, ICONCLS, CLS, CT_AAAPROC FROM " . $ExtJSDevDB . "menu " . 
			" WHERE ";
	if ($sqlwhere != '') { $sql =  $sql . $sqlwhere;}else{ $sql = $sql .	" PARENT_ID = " . $parent_id;}
			
	if ($UserDeveloper == false){
		$sql = $sql . " AND ID <> 10000 ";
	}
	if ($UserAdmin == false){
		$sql = $sql . " AND ID <> 11000 ";
	}
	//if ((!IsNullOrEmptyString($UserAnagrafiche)) || ($chiamataEsterna)){
	if ($chiamataEsterna){
		$sql = $sql . " AND ID < 2000 ";
	}
		
	$sql = $sql . " ORDER BY ORDPRIORITY ASC, DESCNAME ASC";
	$rs = $conn->Execute($sql);
				
	//field
	$output["fields"][]=array("name"=>"id","type"=>"int");
	$output["fields"][]=array("name"=>"text","type"=>"string");
	$output["fields"][]=array("name"=>"leaf","type"=>"string");
	$output["fields"][]=array("name"=>"iconCls","type"=>"string");
	$output["fields"][]=array("name"=>"cls","type"=>"string");
	$output["fields"][]=array("name"=>"ctid","type"=>"int");
	$output["fields"][]=array("name"=>"draggable","type"=>"string");
	
	//Permission
	$PermissionOn = true;
	if (($UserDeveloper == true) || ($UserAdmin == true)){
		$PermissionOn = false;
	}
	
	//data
	$RecordCountResult = 0;
	while (!$rs->EOF) {	
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
									"text"=>$rs->fields['DESCNAME'] ,
									"leaf"=>($rscount->RecordCount()==0),
									//"iconCls"=>'x-' . $rs->fields['ICONCLS'] . ' '. $rs->fields['CLS'],
									"iconCls"=>'x-' . $rs->fields['ICONCLS'],
									"rowCls"=>$rs->fields['CLS'],
									"componentCls"=>'mgcomponentcls',
									"ctid"=>$rs->fields['CT_AAAPROC'],
									"draggable"=>false,
									);
		}
		$rscount->close();
		$rs->MoveNext();
		$RecordCountResult++;
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