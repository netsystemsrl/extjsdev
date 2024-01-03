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
	$output["registrationid"] = $RegistrationId;
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
	$debugmessage = 1;
	if ($conn->debug==1) {
		var_dump($_SERVER['REQUEST_URI']);
		var_dump($_GET);
		var_dump($_POST);
	}
	$start_timeDatRead = microtime(true);
	WFSendLOG("DataRead:","START");
	if($debugmessage) file_put_contents($ExtJSDevLOG . "DataRead.txt", 'START' . microtime_float() . CRLF, FILE_APPEND);
	
	//definizioni
	$formatOutput = 'JSON';
	$formatOutput = isset($_POST["format"]) ? $_POST["format"] : $formatOutput;
	$formatOutput = isset($_GET["format"])  ? $_GET["format"]  : $formatOutput;
	
	$LayoutId = 0;
	$LayoutId = isset($_POST["layoutid"]) ? $_POST["layoutid"] : $LayoutId;
	$LayoutId = isset($_GET["layoutid"]) ? $_GET["layoutid"] : $LayoutId;
	
	$LayoutEditorId = 0;
	$LayoutEditorId = isset($_POST["layouteditorid"]) ? $_POST["layouteditorid"] : $LayoutEditorId;
	$LayoutEditorId = isset($_GET["layouteditorid"]) ? $_GET["layouteditorid"] : $LayoutEditorId;
	
	$objname = '';
	$objname = isset($_POST["objname"]) ? $_POST["objname"] : $objname;
	$objname = isset($_GET["objname"]) ? $_GET["objname"] : $objname;
	
	$objnamesub = '';
	$objnamesub = isset($_POST["objnamesub"]) ? $_POST["objnamesub"] : $objnamesub;
	$objnamesub = isset($_GET["objnamesub"]) ? $_GET["objnamesub"] : $objnamesub;
	
	$objid = '';
	$objid = isset($_POST["objid"]) ? $_POST["objid"] : $objid;
	$objid = isset($_GET["objid"]) ? $_GET["objid"] : $objid;
	if ($objid == 'defaultds') $objid = '';
	
	$datasourcetype = '';
	$datasourcetype = isset($_POST["datasourcetype"]) ? $_POST["datasourcetype"] : $datasourcetype;
	$datasourcetype = isset($_GET["datasourcetype"]) ? $_GET["datasourcetype"] : $datasourcetype;
	
	$datasource = '';
	$datasource = isset($_POST["datasource"]) ? $_POST["datasource"] : $datasource;
	$datasource = isset($_GET["datasource"]) ? $_GET["datasource"] : $datasource;
	
	$datasourcedbname = '';
	$datasourcedbname = isset($_POST["datasourcedbname"]) ? $_POST["datasourcedbname"] : $datasourcedbname;
	$datasourcedbname = isset($_GET["datasourcedbname"]) ? $_GET["datasourcedbname"] : $datasourcedbname;
	
	$datasourcefield = '';
	$datasourcefield = isset($_POST["datasourcefield"]) ? $_POST["datasourcefield"] : $datasourcefield;
	$datasourcefield = isset($_GET["datasourcefield"]) ? $_GET["datasourcefield"] : $datasourcefield;
	
	$modeldef = false;
	$modeldef = isset($_POST["modeldef"]) ? $_POST["modeldef"] : $modeldef;
	$modeldef = isset($_GET["modeldef"]) ? $_GET["modeldef"] : $modeldef;
	if ($modeldef == 'true' ) $modeldef = true; else $modeldef = false;
	
	$onlydata = false;
	$onlydata = isset($_POST["onlydata"]) ? $_POST["onlydata"] : $onlydata;
	$onlydata = isset($_GET["onlydata"])  ? $_GET["onlydata"]  : $onlydata;
	if ($onlydata == 'true' ) {$onlydata = true; } else {$onlydata = false;}
	
	$pivot = false;
	$pivot = isset($_POST["pivot"]) ? $_POST["pivot"] : $pivot;
	$pivot = isset($_GET["pivot"])  ? $_GET["pivot"]  : $pivot;
	if ($pivot == 'true' ) {$pivot = true; } else {$pivot = false;}
	
	$calendardef = '';
	$calendardef = isset($_POST["calendardef"]) ? $_POST["calendardef"] : $calendardef;
	$calendardef = isset($_GET["calendardef"])  ? $_GET["calendardef"]  : $calendardef;
	
	$RecordStart = 0;
	$RecordStart = isset($_POST["start"]) ? $_POST["start"] : $RecordStart;
	$RecordStart = isset($_GET["start"])  ? $_GET["start"] : $RecordStart;
	
	$RecordLimit = 1000;
	$RecordLimit = isset($_POST["limit"]) ? $_POST["limit"] : $RecordLimit;
	$RecordLimit = isset($_GET["limit"])  ? $_GET["limit"]  : $RecordLimit;
	if ($RecordLimit. '' == '') $RecordLimit = 1000;
	if ($RecordLimit == -1 ) {ini_set('memory_limit', '-1');  @set_time_limit(200);}
	if ($modeldef == true ) { $RecordLimit = 1; }
	
	$datamode = '';
	$datamode = isset($_POST["datamode"]) ? $_POST["datamode"] : $datamode;
	$datamode = isset($_GET["datamode"])  ? $_GET["datamode"]  : $datamode;
	if ($conn->debug==1) echo('<b>datamode</b>:' . $datamode . BRCRLF);
	
	
	//ARRAY BASED (GRID HEAD)
	$gridorder = '';
	$gridorder = isset($_POST["sort"]) ? $_POST["sort"] : $gridorder;
	$gridorder = isset($_GET["sort"]) ? $_GET["sort"] : $gridorder;
	if ($gridorder != ''){
		if(substr($gridorder, 0, 1) != '[') $gridorder = '[' . $gridorder . ']';
	}
	if ($conn->debug==1) echo('<b>gridorder</b>:' . $gridorder . BRCRLF);
	
	//ARRAY BASED (GRID HEAD)
	$gridwhere = '';
	$gridwhere = isset($_POST["filter"]) ? $_POST["filter"] : $gridwhere;
	$gridwhere = isset($_GET["filter"]) ? $_GET["filter"] : $gridwhere;
	$gridwhere = isset($_POST["query"]) ? $_POST["query"] : $gridwhere;
	$gridwhere = isset($_GET["query"]) ? $_GET["query"] : $gridwhere;
	if ($conn->debug==1) echo('<b>gridwhere</b>:' . $gridwhere . BRCRLF);
	
	//COMBO BASED LIKE
	$combowhere = '';
	$combowhere = isset($_POST["searchStr"]) ? $_POST["searchStr"] : $combowhere;
	$combowhere = isset($_GET["searchStr"])  ? $_GET["searchStr"]  : $combowhere;
	if ($conn->debug==1) echo('<b>combowhere</b>:' . $combowhere . BRCRLF);
	
	$queryField = 'displayField';
	
	//STRING BASED OBENOBJ
	$datawhere = '';
	$datawhere = isset($_POST["datawhere"]) ? $_POST["datawhere"] : $datawhere;
	$datawhere = isset($_GET["datawhere"])  ? $_GET["datawhere"]  : $datawhere;
	$datawhere = str_replace("undefined", "null", $datawhere);   
	$datawhere = str_replace("%20", " ", $datawhere);   
	if ($conn->debug==1) echo('<b>datawhere</b>:' . $datawhere . BRCRLF);
	
	//COMBO FILTER
	$combofilterActive = false;
	$combofilterActive = isset($_POST["combofilter"]) ? $_POST["combofilter"] : $combofilterActive;
	$combofilterActive = isset($_GET["combofilter"])  ? $_GET["combofilter"]  : $combofilterActive;
	//OVERRIDE nel caso passino filtri sulle colonne allora blocca filtro iniziale
	if ($gridwhere != '') $combofilterActive = false;
	if ($conn->debug==1) echo('<b>combofilter</b>:' . $combofilterActive . BRCRLF);
	
	//STRING BASED OBENOBJ
	$dataorder = '';
	$dataorder = isset($_POST["dataorder"]) ? $_POST["dataorder"] : $dataorder;
	$dataorder = isset($_GET["dataorder"])  ? $_GET["dataorder"]  : $dataorder;
	$dataorder = str_replace("undefined", "null", $dataorder);   
	if ($conn->debug==1) echo('<b>dataorder</b>:' . $dataorder . BRCRLF);
	
	//$combowhere = '';
	//$gridwhere ='[{"property":"innerSearch","type":"strings","operator":"like","value":"800900700"}]';
	//$LayoutId = 30072;
	//$objname = 'Form00';
	
	//definition for tree
	$ParentIdName = "ID_PARENT";
	$ParentIdStart = "";
	$ChildrenIdName = "ID";
	$WayToExpand = "TOP";
	$RootNode = "";
	
	//general var definition
	$sql = "";
	$sqlorder = array();
	$sqlwhere = array();
	$sqlAppo = array();
	$ObjJson = array();
	
	//object var definition
	$valueField = "ID";
	$keyField = "ID";
	$displayField = "DESCRIZIONE";
	$xtypeField = "";
	$datasourcefield = "";
	$VIEWTYPE = "";
	
	//parameters
	$RecordCountResult = 0;
	$ColumnCountResult = 0;
		
	//Recupero LAYOUT 
	//Definizione datasource e datasourcetype e datasourcedbname
	$LayoutJson = array();
	$LayoutType = '';
	$LayoutObjList = array();
	if (IsNOTNullOrEmptyOrZeroString($LayoutId)){
		if ($conn->debug==1) echo('<b>FindLayoutId</b>:' . $LayoutId . BRCRLF);
		if (is_numeric($LayoutId) == true){
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE ID = " . $LayoutId . " 
					union 
					SELECT * FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutId ;
		} else {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE DESCNAME = '" . $LayoutId ."' 
					union 
					SELECT * FROM " . $ExtJSDevDB . "layout WHERE DESCNAME = '" . $LayoutId ."'";
		}
		$rs = $conn->Execute($sql);
		if ($rs !== false) {
			$LayoutId = $rs->fields['ID']; 
			$LayoutType = $rs->fields["LAYOUTTYPE"];
			$FormName = $rs->fields['DESCNAME'];
			$JsonAppo = $rs->fields['LAYOUTJSON']; 
			$datasource = $rs->fields['DATASOURCE'];
			$datasourcefield = $rs->fields['DATASOURCEFIELD'];
			$datasourcetype = $rs->fields['DATASOURCETYPE'];
			$datasourcedbname = $rs->fields['DATASOURCEDBNAME'];
			if ($rs->fields['CHILDRENIDNAME'] != '') $ChildrenIdName = $rs->fields['CHILDRENIDNAME']; 
			if ($rs->fields['PARENTIDNAME'] != '') $ParentIdName = $rs->fields['PARENTIDNAME']; 
			if ($rs->fields['DISPLAYFIELD'] != '') $displayField = $rs->fields['DISPLAYFIELD']; 
			if ($rs->fields['PARENTIDSTART'] != '') $ParentIdStart = $rs->fields['PARENTIDSTART']; 
			
			//DEFAULT ORDER
			if (($objname == 'Form00') && (stripos($datasource,'ORDER') == false) && ($dataorder == '') && ($datasourcefield != '')) $dataorder = $datasourcefield . ' DESC';
			
			if ($LayoutType == 'CODE') {
				$CollectEchoString = '';
				eval($JsonAppo);
				$JsonAppo =  $CollectEchoString;
				if ($conn->debug==1) echo('<b>CODE LAYOUT JsonLAYOUT:</b>:' . $JsonAppo . BRCRLF);
			}
			$rs->close();
			$LayoutJson = JSON2Array($JsonAppo, true);
			$CollectObjList = array();
			CollectOnObjectPropertyExist($LayoutJson,'datasourcefield');
			//HA SOLO IL NOME MANCANO IL RESTO DEGLI OGGETTI
			$LayoutObjList = object_clone($CollectObjList);
		}
	}
	
	//Recupero OBJNAME nel LAYOUT FORM
	//Definizione datasource e datasourcetype
	if (IsNOTNullOrEmptyOrZeroString($objname) && IsNOTNullOrEmptyOrZeroString($LayoutId) && ($objname != 'Form00') ) {
		if ($conn->debug==1) echo('<b>FindOBJECT</b>:' . $objname . BRCRLF);
		
		$ObjJson = array();
		$ObjJson = ReturnOnObjectPropertyValue($LayoutJson, 'name', $objname);
		$LayoutObjList = array();
		
		if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' LayoutId' . $LayoutId . BRCRLF;
		if ($conn->debug==1) {echo('<b>obj->name</b>:' . $objname . BRCRLF); var_dump($ObjJson); echo(BRCRLF); }
		
		if ($ObjJson == null) { 
			$output['failure'] = true;  
			$output['success'] = false; 
			$output['message'] = "ERRORE, OGGETTO NON TROVATO NEL LAYOUT" . BRCRLF; 
			$datasource = ''; $datasourcetype = '';
			header('Content-Type: application/json');
			$Appo = Array2JSON($output,$debugmessage);
			echo $Appo;
			$conn->close();
			WFSendLOG("DataRead:","ERROR OGGETTO NON TROVATO NEL LAYOUT");
			die();
		}
		
		$datasourcetype = '';
		$datasource = '';
		$datasourcedbname = '';
		$datasourcefield = '';
		$displayField = '';
		$valueField = '';
		$keyField = '';
		
		//definizioni
		$xtypeField = $ObjJson["xtype"];
		
		if (isset($ObjJson["layouteditorid"])	|| array_key_exists("layouteditorid", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->LayoutEditorId</b>:' . $LayoutEditorId . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["layouteditorid"])) $LayoutEditorId = $ObjJson["layouteditorid"];
		}
		
		//db
		if (isset($ObjJson["displayField"])		|| array_key_exists("displayField", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->displayField</b>:' . $displayField . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["displayField"])) $displayField = $ObjJson["displayField"];
		}
		if (isset($ObjJson["valueField"])		|| array_key_exists("valueField", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->valueField</b>:' . $valueField . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["valueField"])) $valueField = $ObjJson["valueField"];
		}
		if (isset($ObjJson["keyField"])			|| array_key_exists("keyField", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->keyField</b>:' . $keyField . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["keyField"])) $keyField = $ObjJson["keyField"];
		}
		if (isset($ObjJson["datasourcefield"])	|| array_key_exists("datasourcefield", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->datasourcefield</b>:' . $datasourcefield . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["datasourcefield"])) $datasourcefield = $ObjJson["datasourcefield"];
		}
		if (isset($ObjJson["datasource"])		|| array_key_exists("datasource", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->datasource</b>:' . $datasource . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["datasource"])) $datasource = $ObjJson["datasource"];
		}
		if (isset($ObjJson["datasourcetype"])	|| array_key_exists("datasourcetype", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->datasourcetype</b>:' . $datasourcetype . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["datasourcetype"])) $datasourcetype = $ObjJson["datasourcetype"];
		}
		if (isset($ObjJson["datasourcedbname"]) || array_key_exists("datasourcedbname", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->datasourcedbname</b>:' . $datasourcedbname . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["datasourcedbname"])) $datasourcedbname = $ObjJson["datasourcedbname"];
		}
		
		//OVERRIDE SUB OBJ gantt
		if ($objnamesub != ''){
			if (isset($ObjJson["datasource" . '_' . $objnamesub])		|| array_key_exists("datasource" .  '_' . $objnamesub, $ObjJson)) {
				if ($conn->debug==1) echo('<b>obj->datasource objnamesub </b>:' . $datasource  .  '_' . $objnamesub . BRCRLF);
				if (!IsNullOrEmptyString($ObjJson["datasource" . '_' . $objnamesub])) $datasource = $ObjJson["datasource" . '_' . $objnamesub];
			}
			if (isset($ObjJson["datasourcetype" . '_' . $objnamesub])		|| array_key_exists("datasourcetype" .  '_' . $objnamesub, $ObjJson)) {
				if ($conn->debug==1) echo('<b>obj->datasourcetype objnamesub </b>:' . $datasourcetype  .  '_' . $objnamesub . BRCRLF);
				if (!IsNullOrEmptyString($ObjJson["datasourcetype" . '_' . $objnamesub])) $datasourcetype = $ObjJson["datasourcetype". '_' . $objnamesub] ;
			}
			if (isset($ObjJson["datasourcedbname" . '_' . $objnamesub])		|| array_key_exists("datasourcedbname" .  '_' . $objnamesub, $ObjJson)) {
				if ($conn->debug==1) echo('<b>obj->datasourcedbname objnamesub </b>:' . $datasourcedbname  .  '_' . $objnamesub . BRCRLF);
				if (!IsNullOrEmptyString($ObjJson["datasourcedbname" . '_' . $objnamesub])) $datasourcedbname = $ObjJson["datasourcedbname" . '_' . $objnamesub];
			}
		}
		
		if (($xtypeField == 'combobox') || ($xtypeField == 'dynamiccombo')){
			if ( $datawhere == $ObjJson["valueField"] . '=null'){
				$datawhere = '';
				$ObjJson["datawhere"] = '';
			}
			if (isset($ObjJson["queryField"]) || array_key_exists("queryField", $ObjJson)) {
				$queryField = $ObjJson["queryField"];
			}
		}	
		
		//OVVERIDE LOAD ALL
		if (isset($ObjJson["loadAll"])		|| array_key_exists("loadAll", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->loadAll</b>:' . $loadAll . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["loadAll"])) $loadAll = $ObjJson["loadAll"];
			$datawhere = '';
		}
		
		//tree
		if (isset($ObjJson["parentidname"]) 	|| array_key_exists("parentidname", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->ParentIdName</b>:' . $ParentIdName . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["parentidname"])) $ParentIdName = $ObjJson["parentidname"];
		}
		if (isset($ObjJson["childrenidname"]) 	|| array_key_exists("childrenidname", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->ChildrenIdName</b>:' . $ChildrenIdName . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["childrenidname"])) $ChildrenIdName = $ObjJson["childrenidname"];
		}
		if (isset($ObjJson["parentidstart"]) 	|| array_key_exists("parentidstart", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->ParentIdStart</b>:' . $ParentIdStart . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["parentidstart"])) $ParentIdStart = $ObjJson["parentidstart"];
		}		
		if (isset($ObjJson["waytoexpand"]) 		|| array_key_exists("waytoexpand", $ObjJson)) {
			if ($conn->debug==1) echo('<b>obj->WayToExpand</b>:' . $WayToExpand . BRCRLF);
			if (!IsNullOrEmptyString($ObjJson["waytoexpand"])) $WayToExpand = $ObjJson["waytoexpand"];
		}
		
		//dynamicgrid
		if (($xtypeField == 'dynamicgrid') && ($datasourcefield != '') && ($datawhere == '')){
			if ($conn->debug==1) echo('<b>obj->dynamicgrid</b>:' . $ObjJson["valueField"] .' IS NULL'. BRCRLF);
			//$datawhere = $datasourcefield  . " = null";
			$datawhere =  $ObjJson["valueField"] . " IS NULL";
		}
	}
	
	//Recupero OBJID nel LAYOUT REPORT
	//Definizione datasource e datasourcetype
	if (IsNOTNullOrEmptyOrZeroString($objid) && IsNOTNullOrEmptyOrZeroString($LayoutId) && ($objid != 'defaultds') ) {
		if ($conn->debug==1) echo('<b>FindOBJECTID</b>:' . $objid . BRCRLF);
		
		$ObjJson = array();
		$ObjJson = ReturnOnObjectPropertyValue($LayoutJson, 'data_source', $objid);
		$LayoutObjList = array();
		if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' LayoutId' . $LayoutId . BRCRLF;
			
		if ($conn->debug==1) echo('<b>obj->name</b>:' . $objid . BRCRLF);
		if ($conn->debug==1) var_dump($ObjJson);
		
		if ($ObjJson == null) {
			$output['failure'] = true;  
			$output['success'] = false; 
			$output['message'] = "ERRORE, OGGETTOID NON TROVATO NEL LAYOUT" . BRCRLF; 
			$datasource = ''; $datasourcetype = '';
		}else{
			if ($conn->debug==1) echo('<b>obj->datasource</b>:' . $ObjJson["datasourcesql"] . BRCRLF);
			if (array_key_exists("datasourcesql",$ObjJson)) {
				$datasourcetype = "SELECT";
				$datasource = $ObjJson["datasourcesql"];
			}
			if (array_key_exists("datasourcetype",$ObjJson)) {
				$datasourcetype = $ObjJson["datasourcetype"];
			}
			$ObjJson = null;
			$LayoutEditorId = null;
			//$ObjJson["xtype"] = 'report';
		}
	}

	//OVERRIDE Param TREE
	$ParentIdName = ((isset($_POST["parentidname"])) && ($_POST["parentidname"] != '')) ? $_POST["parentidname"] : $ParentIdName;
	$ParentIdName = ((isset($_GET["parentidname"]))  && ($_GET["parentidname"] != ''))  ? $_GET["parentidname"]  : $ParentIdName;
	
	$RootNode = isset($_POST["node"]) 	? $_POST["node"] : $RootNode;
	$RootNode = isset($_GET["node"]) 	? $_GET["node"]  : $RootNode;
	if ($RootNode == 'root') $RootNode  = '';
	if ($RootNode == '0') $RootNode  = '';
	
	$ParentIdValue = $ParentIdStart;
	$ParentIdValue = isset($_POST[$ParentIdName]) 	? $_POST[$ParentIdName] : $ParentIdValue;
	$ParentIdValue = isset($_GET[$ParentIdName]) 	? $_GET[$ParentIdName] : $ParentIdValue;
	if ($ParentIdValue == '') $ParentIdValue  = '';
	if ($ParentIdValue == 'root') $ParentIdValue  = '';

	$ChildrenIdName = isset($_POST["childrenidname"]) ? $_POST["childrenidname"] : $ChildrenIdName;
	$ChildrenIdName = isset($_GET["childrenidname"])  ? $_GET["childrenidname"]  : $ChildrenIdName;
	
	//Recupero LAYOUTEDITORID
	//oggetto passato è una grid quindi campi aggiuntivi foreign in chiaro
	$LayoutEditorJson = array();
	$LayoutEditorDataSourceField = 'ID';
	if (IsNOTNullOrEmptyOrZeroString($LayoutEditorId)){ 
		if ($conn->debug==1) echo('<b>FindLayoutEditorId</b>:' . $LayoutEditorId . BRCRLF);
		$sql = "SELECT * FROM " . $ExtJSDevDB . "layout WHERE ";
		if (is_numeric($LayoutEditorId) == true){
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE ID = " . $LayoutEditorId . " 
					union 
					SELECT * FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutEditorId ;
		} else {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutoverride WHERE DESCNAME = '" . $LayoutEditorId ."' 
					union 
					SELECT * FROM " . $ExtJSDevDB . "layout WHERE DESCNAME = '" . $LayoutEditorId ."'";
		}
		$rs = $conn->Execute($sql);
		if ($rs !== false) {
			$LayoutEditorId = $rs->fields['ID']; 
			$LayoutType = $rs->fields["LAYOUTTYPE"];
			$JsonAppo = $rs->fields['LAYOUTJSON']; 
			$VIEWTYPE = $rs->fields['VIEWTYPE'];
			$LayoutEditorDataSourceField = $rs->fields['DATASOURCEFIELD']; 
			//$appo = 'LayoutReadRun.php?LayoutId=' . LayoutEditorId;
			//$JsonAppo = do_post_get($appo);
			if ($LayoutType == 'CODE') {
				$CollectEchoString = '';
				eval($JsonAppo);
				$JsonAppo =  $CollectEchoString;
			}
			$LayoutEditorJson = json_decode($JsonAppo,true);
			$rs->close();
			
			
			/* LAYOUT OVERRIDE */
			$sql =  "SELECT * " .
					" FROM  " . $ExtJSDevDB . "userlayout " .
					" WHERE (CT_AAAUSER = " . $UserId . " OR CT_AAAUSER is null)" . 
							" AND (CT_AAALAYOUT = " . $LayoutId .")";
			$rsuserlayout = $conn->Execute($sql);
			while (!$rsuserlayout->EOF) {
				$LAYOUTJSONOVERRIDE = JSON2Array($rsuserlayout->fields['LAYOUTOVERRIDE'],true);
				for ($i = 0; $i < count($LAYOUTJSONOVERRIDE); $i++) {
					if (isset($LAYOUTJSONOVERRIDE[$i]["name"]) == true) {
						$result = & getSubItemFromName($LayoutEditorJson, $LAYOUTJSONOVERRIDE[$i]["name"]);
						foreach ($LAYOUTJSONOVERRIDE[$i] as $key => &$val) {
							$result[$key] = & $val;
						}
					}
				}
				$rsuserlayout->MoveNext();
			}
			$rsuserlayout->close();				

	
			/* FIND OBJECT WITH DATASOURCE */
			$CollectObjList = array();
			CollectOnObjectPropertyExist($LayoutEditorJson,'datasourcefield');
			//HA SOLO IL NOME MANCANO IL RESTO DEGLI OGGETTI
			$LayoutObjList = object_clone($CollectObjList);
		}
	}
	
	//compilo la datasource con funzioni in parametri 
	if ($conn->debug==1) echo("<b>BOOKMARK</b>:CODE" . BRCRLF);
	if ($datasourcetype != 'CODE'){
		if ($conn->debug==1) echo('<b>datasource</b>:' . $datasource . BRCRLF);
		$datasource = ExecFuncInStringSQL($datasource);

		if ((Left($datasource, 1) == '"') && (Right($datasource, 1) == '"')) $datasource = Mid($datasource,1,Len($datasource)-2);
		if ((Left($datasource, 1) == "'") && (Right($datasource, 1) == "'")) $datasource = Mid($datasource,1,Len($datasource)-2);
		
		if ($conn->debug==1) echo('<b>datasource</b>:' . $datasource . "<br>" . BRCRLF);
	} 
	
	if ($conn->debug==1) echo("<b>BOOKMARK</b>:ExecFuncInStringSQL" . BRCRLF);
	if ($conn->debug==1) echo('<b>datasourcefield</b>:' . $datasourcefield . BRCRLF);
	$datasourcefield = ExecFuncInStringSQL($datasourcefield);
	if ((Left($datasourcefield, 1) == '"') && (Right($datasourcefield, 1) == '"')) $datasourcefield = Mid($datasourcefield,1,Len($datasourcefield)-2);
	if ((Left($datasourcefield, 1) == "'") && (Right($datasourcefield, 1) == "'")) $datasourcefield = Mid($datasourcefield,1,Len($datasourcefield)-2);
	if ($conn->debug==1) echo('<b>datasourcefield</b>:' . $datasourcefield . "<br>" . BRCRLF);
	
	if ($conn->debug==1) echo('<b>valueField</b>:' . $valueField . BRCRLF);
	$valueField = ExecFuncInStringSQL($valueField);
	if ((Left($valueField, 1) == '"') && (Right($valueField, 1) == '"')) $valueField = Mid($valueField,1,Len($valueField)-2);
	if ((Left($valueField, 1) == "'") && (Right($valueField, 1) == "'")) $valueField = Mid($valueField,1,Len($valueField)-2);
	if ($conn->debug==1) echo('<b>valueField</b>:' . $valueField . "<br>" . BRCRLF);
	
	if ($conn->debug==1) echo('<b>displayField</b>:' . $displayField . BRCRLF);
	$displayField = ExecFuncInStringSQL($displayField);
	if ((Left($displayField, 1) == '"') && (Right($displayField, 1) == '"')) $displayField = Mid($displayField,1,Len($displayField)-2);
	if ((Left($displayField, 1) == "'") && (Right($displayField, 1) == "'")) $displayField = Mid($displayField,1,Len($displayField)-2);
	if ($conn->debug==1) echo('<b>displayField</b>:' . $displayField . "<br>" . BRCRLF);
	
	if ($conn->debug==1) echo('<b>ParentIdName</b>:' . $ParentIdName . BRCRLF);
	$ParentIdName = ExecFuncInStringSQL($ParentIdName);
	if ((Left($ParentIdName, 1) == '"') && (Right($ParentIdName, 1) == '"')) $ParentIdName = Mid($ParentIdName,1,Len($ParentIdName)-2);
	if ((Left($ParentIdName, 1) == "'") && (Right($ParentIdName, 1) == "'")) $ParentIdName = Mid($ParentIdName,1,Len($ParentIdName)-2);
	if ($conn->debug==1) echo('<b>ParentIdName</b>:' . $ParentIdName . "<br>" . BRCRLF);
	
	if ($conn->debug==1) echo('<b>ChildrenIdName</b>:' . $ChildrenIdName . BRCRLF);
	$ChildrenIdName = ExecFuncInStringSQL($ChildrenIdName);
	if ((Left($ChildrenIdName, 1) == '"') && (Right($ChildrenIdName, 1) == '"')) $ChildrenIdName = Mid($ChildrenIdName,1,Len($ChildrenIdName)-2);
	if ((Left($ChildrenIdName, 1) == "'") && (Right($ChildrenIdName, 1) == "'")) $ChildrenIdName = Mid($ChildrenIdName,1,Len($ChildrenIdName)-2);
	if ($conn->debug==1) echo('<b>ChildrenIdName</b>:' . $ChildrenIdName . "<br>" . BRCRLF);
	
	if ($conn->debug==1) echo('<b>datawhere</b>:' . $datawhere . BRCRLF);
	$datawhere = ExecFuncInStringSQL($datawhere);
	if ((Left($datawhere, 1) == '"') && (Right($datawhere, 1) == '"')) $datawhere = Mid($datawhere,1,Len($datawhere)-2);
	if ((Left($datawhere, 1) == "'") && (Right($datawhere, 1) == "'")) $datawhere = Mid($datawhere,1,Len($datawhere)-2);
	if ($conn->debug==1) echo('<b>datawhere</b>:' . $datawhere . "<br>" . BRCRLF);
	
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datasourcetype:' . $datasourcetype . BRCRLF;
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datasource:' . $datasource . BRCRLF;
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datasourcedbnamedef:' . $dbname . BRCRLF;
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datasourcedbname:' . $datasourcedbname . BRCRLF;
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datawhere:' . $datawhere . BRCRLF;
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datasourcefield:' . $datasourcefield . BRCRLF;
	
	//CONNECTION
	if (!IsNullOrEmptyString($datasourcedbname)) {
		$connOrigdbname = $dbname;
		WFSQLCONNECT($datasourcedbname);
	}else{
		$connOrigdbname =  '';
	}
	
	//FETCH DATA Esecuzione datasource in base al datasourcetype
	if ($conn->debug==1) echo("<b>BOOKMARK</b>:PREPARE DATA datasourcetype" . BRCRLF);
	if ($conn->debug==1) echo('<b>datasourcetype</b>:' . $datasourcetype . BRCRLF);
	
	if ($datamode == 'add'){
		$output["data"] = array();
		$MyRecord = array();
		if ($datawhere != ''){
			if (strpos ($datawhere, ' AND ' ) > 0){
				$datawherearray = explode(' AND ', $datawhere);
				foreach ($datawherearray as $datawherecondstr) {
					$datawherecond = explode('=', $datawherecondstr);
					if(count($datawherecond)>1){
						//$MyRecord = array(trim($datawherecond[0])=>trim(str_replace("'", "", $datawherecond[1])));
						$MyRecord += [ trim($datawherecond[0]) => trim(str_replace("'", "", $datawherecond[1]))];
					}
				}
			}else{
				$datawherecond = explode('=', $datawhere);
				//$MyRecord => array(trim($datawherecond[0])=>trim($datawherecond[1]));
				$valuecond = ''; 
				if (count($datawherecond) > 1){ $valuecond = $datawherecond[1];}
				$MyRecord += [ trim($datawherecond[0]) => trim(str_replace("'", "", $valuecond))];	
				
			}
		}
		//DAFARE
		$MyRecord += ['CT_PIANOCONTI'=> null];
		$output["data"][] = $MyRecord;
		//DAFARE leggere i default da ogni campo e passarli insieme al record nuovo
		//defaultValue
		$CollectObjList = array();
		CollectOnObjectPropertyExist($LayoutJson,'defaultValue');
		
		//gestione defaultValue
		foreach($CollectObjList as $sub) {
			if (isset($sub["defaultValue"])		|| array_key_exists("defaultValue", $sub)) {
				if ($sub["defaultValue"] != ''){
					$keyvalue = null;
					$Source = '$keyvalue = ' . $sub["defaultValue"] . ';';
					if ($conn->debug==1) echo("DEFAULT VALUE:" . $Source. "<BR>\n"); 
					try {
						eval($Source);
					} catch (Exception $e) {
						WFSendLOG("DEfaultValue", "Error:" . $sub["defaultValue"] . " " . get_class($e) . ', ' . $e->getMessage() . '.');
					}
					$output["data"][]= array( $sub["name"]=>$keyvalue	);				
				}
			}
		}
	}
	else{
		switch ($datasourcetype) {
			case '':
			case 'NONE':{	
				//field
				$output["fields"][]=array("name"=>"ID","type"=>"int");
				
				//column 
				$output["columns"][]=array("dataIndex"=>"ID",
											"header"=>"ID",  
											"text"=>"ID"  , 
											"format"=>"" ,
											"hidden"=>false,
											"flex"=>1,
											"width"=>10, 
											"editor"=>array(), 
											"filter"=>array('type'=>'number'),
											"exportStyle"=>array('format'=>'number')
											);
				
				//data
				$output["data"][]= array( "ID"=>1 );
				
				// misc 
				$output["total"]=1;
				$output["success"]=true;
			}
			break;
			case 'ESEMPIO':{
						
				//field
				$output["fields"][]=array("name"=>"ID","type"=>"int");
				$output["fields"][]=array("name"=>"NOME","type"=>"string");
				$output["fields"][]=array("name"=>"COGNOME","type"=>"string");
				$output["fields"][]=array("name"=>"NATOIL","type"=>"date");
				
				//column 
				$output["columns"][]=array("dataIndex"=>"ID",
											"header"=>"ID",  
											"text"=>"ID"  , 
											"format"=>"" ,
											"hidden"=>false,
											"flex"=>1,
											"width"=>10, 
											"editor"=>array(), 
											"filter"=>array('type'=>'number'),
											"exportStyle"=>array('format'=>'number')
											);
				$output["columns"][]=array("dataIndex"=>"NOME",
											"header"=>"User Name",
											"text"=>"User Name" , 
											"format"=>"" ,
											"hidden"=>false,
											"flex"=>1,
											"width"=>20, 
											"editor"=>array(), 
											"filter"=>array('type'=>'string'),
											"exportStyle"=>array('format'=>'string')
											);
				$output["columns"][]=array("dataIndex"=>"COGNOME",
											"header"=>"First Name", 
											"text"=>"User Name" , 
											"format"=>"" ,
											"hidden"=>false,
											"flex"=>1,
											"editor"=>array(), 
											"filter"=>array('type'=>'string'),
											"exportStyle"=>array('format'=>'string')
											);
				$output["columns"][]=array("dataIndex"=>"NATOIL",
											"header"=>"Last Name", 
											"text"=>"User Name" , 
											"format"=>"" ,
											"hidden"=>false,
											"flex"=>1,
											"xtype"=>"datecolumn", 
											"editor"=>array("xtype"=>"datefield", "allowBlank"=> "false"), 
											"filter"=>array('type'=>'date'),
											"exportStyle"=>array('format'=>'string')
											);
				
				//data
				$RecordCountResult = 0;
				$RecordLimit = 10;
				for($i = 0; $i <= $RecordLimit; $i++ ){
					$output["data"][]= array(
											"ID"=>$i + 100,
											"NOME"=>"Name No. ". $i,
											"COGNOME"=>"SurName No. ". $i,
											"NATOIL"=>date("Y-m-d",rand(1262055681,1262055681))
											);
					$RecordCountResult++;
				}
				
				// misc 
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'CALENDAR':{
				// you can parse field values via your database schema
				$output["fields"][]=array("name"=>"ID","type"=>"string");
				$output["fields"][]=array("name"=>"DESCNAME","type"=>"string");
				
				// you can parse column values via your database schema
				$output["columns"][]=array("dataIndex"=>"ID","header"=>"ID","width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"DESCNAME","header"=>"DESCNAME","width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				
				
				$RecordCountResult = 0;
				if (($datasource == 'SETTIMANA') || ($datasource == 'WEEK')){
					if ($conn->debug==1) echo('<b>CALENDAR WEEK</b>:'  . BRCRLF);
					$output["data"][]= array(
											"ID"=> '1',
											"DESCNAME"=> 'LUN'
											);
					$output["data"][]= array(
											"ID"=> '2',
											"DESCNAME"=> 'MAR'
											);
					$output["data"][]= array(
											"ID"=> '3',
											"DESCNAME"=> 'MER'
											);
					$output["data"][]= array(
											"ID"=> '4',
											"DESCNAME"=> 'GIO'
											);
					$output["data"][]= array(
											"ID"=> '5',
											"DESCNAME"=> 'VEN'
											);
					$output["data"][]= array(
											"ID"=> '6',
											"DESCNAME"=> 'SAB'
											);
							
					$output["data"][]= array(
											"ID"=> '7',
											"DESCNAME"=> 'DOM'
											);
					$RecordCountResult = 7;
				}
				elseif (($datasource == 'SETTIMANAMESI') || ($datasource == 'WEEKMONTH')){
					if ($conn->debug==1) echo('<b>CALENDAR WEEKMONTH</b>:'  . BRCRLF);
					$PrimoMese = date_create()->format('Y-m') . '-01';
					
					for($i = -12; $i <= 3; $i++ ){
						$AppoData = WFVALUEDATEADD($PrimoMese,$i,'w' );
						$WeekFirst = clone $AppoData->modify(('Sunday' == $AppoData->format('l')) ? 'Monday last week' : 'Monday this week');
						$WeekLast = clone $AppoData->modify('Sunday this week');  
						$output["data"][]= array(
												"ID"=> $AppoData->format('w') ,
												"DESCNAME"=> $AppoData->format('w'), 
												"DATESTART"=> $WeekFirst->format('Y-m-d'),
												"DATEEND"=> $WeekLast->format('Y-m-d')
												);
						$RecordCountResult++;
					}
					$output["columns"][]=array("dataIndex"=>"DATESTART","header"=>"DATESTART","width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
					$output["columns"][]=array("dataIndex"=>"DATEEND","header"=>"DATEEND","width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				}
				elseif (($datasource == 'SETTIMANAMESI6') || ($datasource == 'WEEKMONTH6')){
					if ($conn->debug==1) echo('<b>CALENDAR WEEKMONTH6</b>:'  . BRCRLF);
					$PrimoMese = date_create()->format('Y-m') . '-01';
					
					for($i = -12; $i <= 7; $i++ ){
						$AppoData = WFVALUEDATEADD($PrimoMese,$i,'w' );
						if ($i == 0) {
							$output["data"][]= array(
													"ID"=> $AppoData->format('Y-m') . '-01',
													"DESCNAME"=> $AppoData->format('Y-m') . ' ' . WFVALUEDATELOCAL( $AppoData,'M', 'it')
													);
						}else{
							$output["data"][]= array(
													"ID"=> $AppoData->format('Y-m') . '-01',
													"DESCNAME"=> $AppoData->format('Y-m') . ' ' . WFVALUEDATELOCAL( $AppoData,'M', 'it')
													);
						}
						$RecordCountResult++;
					}
					$output["columns"][]=array("dataIndex"=>"DATESTART","header"=>"DATESTART","width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
					$output["columns"][]=array("dataIndex"=>"DATEEND","header"=>"DATEEND","width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				}
				elseif (($datasource == 'MESI') || ($datasource == 'MONTH')){
					if ($conn->debug==1) echo('<b>CALENDAR MONTH</b>:'  . BRCRLF);
					$PrimoMese = date_create()->format('Y-m') . '-01';
					for($i = 2; $i >= -12; $i-- ){
						$AppoData = WFVALUEDATEADD($PrimoMese,$i,'m' );
						if ($i == 0) {
							$output["data"][]= array(
													"ID"=> $AppoData->format('Y-m') . '-01',
													"DESCNAME"=> '<b>'. $AppoData->format('Y-m') . ' ' . WFVALUEDATELOCAL( $AppoData,'M', 'it') .'</b>'
													);
						}else{
							$output["data"][]= array(
													"ID"=> $AppoData->format('Y-m') . '-01',
													"DESCNAME"=> $AppoData->format('Y-m') . ' ' . WFVALUEDATELOCAL( $AppoData,'M', 'it')
													);
						}
						$RecordCountResult++;
					}
				}
				elseif (($datasource == 'ANNIMESI6') || ($datasource == 'YEARMONTH6')){
					if ($conn->debug==1) echo('<b>CALENDAR YEARMONTH</b>:'  . BRCRLF);
					$PrimoMese = date_create()->format('Y-m') . '-01';
					
					for($i = 6; $i >= -24; $i-- ){
						$AppoData = WFVALUEDATEADD($PrimoMese,$i,'m' );
						if ($i == 0) {
							$output["data"][]= array(
													"ID"=> $AppoData->format('Y-m') . '-01',
													"DESCNAME"=> '<b>'. $AppoData->format('Y-m') . ' ' . WFVALUEDATELOCAL( $AppoData,'M', 'it') .'</b>'
													);
						} else if($i < 0){
							$output["data"][]= array(
													"ID"=> $AppoData->format('Y-m') . '-01',
													"DESCNAME"=> $AppoData->format('Y-m') . ' ' . WFVALUEDATELOCAL( $AppoData,'M', 'it')
													);
						} else{
							$output["data"][]= array(
													"ID"=> $AppoData->format('Y-m') . '-01',
													"DESCNAME"=> $AppoData->format('Y-m') . ' ' . WFVALUEDATELOCAL( $AppoData,'M', 'it')
													);
						}
						$RecordCountResult++;
					}
				}
				elseif (($datasource == 'ANNIMESI12') || ($datasource == 'YEARMONTH12')){
					if ($conn->debug==1) echo('<b>CALENDAR YEARMONTH</b>:'  . BRCRLF);
					$PrimoMese = date_create()->format('Y-m') . '-01';
					for($i = 12; $i >= -24; $i-- ){
						$AppoData = WFVALUEDATEADD($PrimoMese,$i,'m' );
						$output["data"][]= array(
												"ID"=> $AppoData->format('Y-m') . '-01',
												"DESCNAME"=> $AppoData->format('Y-m') .  ' ' . WFVALUEDATELOCAL( $AppoData,'M', 'it')
												);
						$RecordCountResult++;
					}
				}
				elseif (($datasource == 'ANNITRIM12') || ($datasource == 'YEARTRIM12')){
					if ($conn->debug==1) echo('<b>CALENDAR YEARMONTH</b>:'  . BRCRLF);
					$PrimoMese = date_create()->format('Y-m') . '-01';
					for($i = 12; $i >= -28; $i-- ){
						$AppoData = WFVALUEDATEADD($PrimoMese,$i,'m' );
						$mese = $AppoData->format('m');
						if($mese==1||$mese==4||$mese==7||$mese==10){
							
							if( $mese == 1){
								$trimestre = 1;
							}elseif( $mese == 4){
								$trimestre = 2;
							}elseif( $mese == 7){
								$trimestre = 3;
							}elseif( $mese == 10){
								$trimestre = 4;
							}
							$output["data"][]= array(
													"IDMESE"=> $AppoData->format('Y-m') . '-01',
													"ID"=> $AppoData->format('Y-') . $trimestre,
													"DESCNAME"=> $AppoData->format('Y') .  '-Trim' . $trimestre 
													);
						}
						$RecordCountResult++;
					}
				}
				elseif (($datasource == 'ANNITRIM6') || ($datasource == 'YEARTRIM6')){
					if ($conn->debug==1) echo('<b>CALENDAR YEARMONTH</b>:'  . BRCRLF);
					$PrimoMese = date_create()->format('Y-m') . '-01';
					for($i = 12; $i >= -12; $i-- ){
						$AppoData = WFVALUEDATEADD($PrimoMese,$i,'m' );
						$mese = $AppoData->format('m');
						if($mese==1||$mese==4||$mese==7||$mese==10){
							
							if( $mese == 1){
								$trimestre = 1;
							}elseif( $mese == 4){
								$trimestre = 2;
							}elseif( $mese == 7){
								$trimestre = 3;
							}elseif( $mese == 10){
								$trimestre = 4;
							}
							$output["data"][]= array(
													"IDMESE"=> $AppoData->format('Y-m') . '-01',
													"ID"=> $AppoData->format('Y-') . $trimestre,
													"DESCNAME"=> $AppoData->format('Y') .  '-Trim' . $trimestre 
													);
						}
						$RecordCountResult++;
					}
				}
				elseif (($datasource == 'ANNI') || ($datasource == 'YEAR')){
					if ($conn->debug==1) echo('<b>CALENDAR YEAR</b>:'  . BRCRLF);
					$Anno = WFVALUEYEAR() -10;
					for($i = 0 ; $i <= 20; $i++ ){
						$output["data"][]= array(
												"ID"=> $Anno + $i,
												"DESCNAME"=> $Anno + $i
												);
						$RecordCountResult++;
					}
				}else{
					if ($conn->debug==1) echo('<b>CALENDAR NOT FOUND TYPE</b>:' . $datasource . BRCRLF);
				}
				
				// the misc properties
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
			}
			break;
			case 'TABLE' :
			case 'GANTTSELECT':
			case 'GANTTDEPENCY':
			case 'PIVOT':
			case 'SELECT':{
				if ($datasourcetype == 'PIVOT') {$pivot = true; $datasourcetype = 'SELECT';}
				//sql di recupero dati
				//DAFARE max record da restituire con progressivo pagina
				//DAFARE Descrione campo filtro (non è detto che si chiami descrizione)
				//if ($datasourcetype == 'TABLE'){  $sql = 'SELECT a.* FROM (SELECT * FROM '. $datasource . ') a WHERE ROWNUM <= ' . $RecordLimit;	}
				//if ($datasourcetype == 'SELECT'){ $sql = 'SELECT a.* FROM ('. $datasource . ') a WHERE ROWNUM <= ' . $RecordLimit;	}
				
				//$conn->SetFetchMode(ADODB_FETCH_NUM);
				$conn->SetFetchMode(ADODB_FETCH_BOTH);
				//$conn->SetFetchMode(ADODB_FETCH_ASSOC);
					
				$datasource = str_replace("\t", ' ', $datasource); // remove tabs
				$datasource = str_replace("\n", ' ', $datasource); // remove new lines
				$datasource = str_replace("\r", ' ', $datasource); // remove carriage returns
				$datasource = str_replace(";", '', $datasource); // remove carriage returns
				// GESTIONE OVERRIDE 
				if (  ( ($datasource == $ExtJSDevDB .'proc') || ($datasource == $ExtJSDevDB . 'layout') || ($datasource == $ExtJSDevDB . 'menu'))
				   && ( (left($datawhere,3) == 'ID=')  || (left($datawhere,4) == 'ID =') )
					){
					//sono nel case
					$sqlSTD  = "SELECT " . $datasource . ".* 			FROM " . $datasource . " " ;
					$sqlOVER = "SELECT " . $datasource . "override.* 	FROM " . $datasource . "override ";
					$sql = $sqlOVER  ." UNION " . $sqlSTD ;
					$datasourcetype = 'SELECT';
					$datasource = $sql;
				}
				else{
					//sono in normale					
					if (strrpos(" " . strtoupper($datasource),"SELECT") > 0){
						$sql = $datasource;
						//$datasourcetable = $datasource;
					}else{
						$sql = 'SELECT * FROM  ' . $datasource;
						$parsed = $parser->parse($datasource);
						//$datasourcetable = $parsed["FROM"][0]["table"];
					}
					$datasourcetype = 'SELECT';
					$datasource = $sql;
				}
				
				$sql = "SELECT * FROM (" . $sql .") a ";
				
				//gestione filtro su Calendar
				if ($ObjJson != null){
					if ($ObjJson["xtype"] == 'dynamiccalendar'){
						if ($calendardef == "type"){
							$sql = "SELECT DISTINCT " . $ObjJson['groupField'] . "," . $ObjJson['groupDisplayField'] . " FROM (" . $sql .") a ";	
						}
					}
				}
				
				//gestione filtro su combobox
				
				//WHERE
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:WHERE" . BRCRLF);
				if (!IsNullOrEmptyString($combowhere)){
					if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' combowhere:' . $combowhere . BRCRLF;
					$combowhere = strtoupper($combowhere);
					$combowhere = str_replace("'","''",$combowhere);
					
					$NameFieldWhere = $displayField;
					if (strrpos($NameFieldWhere,".") > 0){
						$NameFieldWhere = explode("[.]",$NameFieldWhere)[1];	
					}
					
					if(($queryField == false) || ($queryField == 'displayField')){
						//fieldSearch Find in displayField  field of select
						if ($conn->debug==1) echo('fieldSearch');
						if (($combowhere[0] != "%") && (substr($combowhere, -1, 1) != "%") ) {
							$sqlwhere[] = "( " .  $NameFieldWhere . " LIKE '%" . $combowhere . "%')";
						}else{
							$sqlwhere[] = "( " .  $NameFieldWhere . " LIKE '" . $combowhere . "')";
						}
						if (array_key_exists("insertwhere",$ObjJson) == true){
							$sqlwhere[] = "( " . $ObjJson["insertwhere"] . ")";
						}
					}
					else if($queryField == 'innerSearch'){
						//innerSearch field of derivated datasources
						if ($conn->debug==1) echo('InnerSearch');
						
						if ($conn->debug==1) {
							$start_time = microtime(true);
							$rs = $conn->Execute($sql . " WHERE 1=2"); 
							$end_time = microtime(true);
							$elapsed_time = $end_time - $start_time;
							echo 'Timer' . $elapsed_time . BRCRLF;
						}else{
							$rs = $conn->Execute($sql . " WHERE 1=2"); 
						}
						$ColumnCountResult = $rs->FieldCount();
						$sqlAppo = array();
						for ($i=0; $i < $ColumnCountResult; $i++) {
							$fld = $rs->FetchField($i);
							$field = $fld->name;
							$fldType = $rs->MetaType($fld->type);
							if (($fldType != 'T') && ($fldType != 'D') && ($fldType != 'B') && ($fldType != 'L') && ($fldType != 'R') && ($fldType != 'N') && ($fldType != 'I')) {
								if (($combowhere[0] != "%") && (substr($combowhere, -1, 1) != "%") ) {
									$sqlAppo[] =  "( " . $field . " LIKE '%" . $combowhere . "%')";
								}else{
									$sqlAppo[] =  "( " . $field . " LIKE '" . $combowhere . "')";
								}
							}
						}
						
						//Find obj connected   (dynamicgrid con property displayField impostata)
						$CollectObjList = array();
						CollectOnObjectPropertyExist($LayoutEditorJson, 'displayField');
						foreach($CollectObjList as $subObj) {
							$obj = ReturnOnObjectPropertyValue($LayoutEditorJson, "name", $subObj["name"]);
							
							if ($obj['datasourcefield'] == $LayoutEditorDataSourceField){
								if (array_key_exists("datasourcetype",$obj) == true){
									if ($obj["datasourcetype"] == 'SELECT'){
										$sqlSubGrid = "SELECT a." . $obj["valueField"] . " 
														FROM (" . ExecFuncInStringSQL($obj["datasource"]) . ") a 
														WHERE a." . $obj["displayField"] .  " LIKE '%" . $combowhere . "%'";
										if ($conn->debug==1) {
											$start_time = microtime(true);
											$rs = $conn->Execute( $sqlSubGrid);  
											$end_time = microtime(true);
											$elapsed_time = $end_time - $start_time;
											echo 'Timer' . $elapsed_time . BRCRLF;
										}else{
											$rs = $conn->Execute( $sqlSubGrid); 
										}
										
										while (!$rs->EOF) {
											$val = $rs->fields[$obj["valueField"]];
											$sqlAppo[] =  "(" . $obj['datasourcefield'] . " = '" . $val . "')";
											$rs->moveNext();
										}
									}
								}
							}
							
							
							
						}
						$sqlwhere[] = "(" . implode (" OR ", $sqlAppo) . ")";
						if (array_key_exists("insertwhere",$ObjJson) == true){
							$sqlwhere[] = "( " . $ObjJson["insertwhere"] . ")";
						}
					}	
					else if ($queryField == 'fieldsSearch'){
						//fieldsSearch  field of SELECT
						if ($conn->debug==1) echo('fieldsSearch');
						
						//Find in all field of select
						if ($conn->debug==1) {
							$start_time = microtime(true);
							$rs = $conn->Execute($sql . " WHERE 1=2");  
							$end_time = microtime(true);
							$elapsed_time = $end_time - $start_time;
							echo 'Timer' . $elapsed_time . BRCRLF;
						}else{
							$rs = $conn->Execute($sql . " WHERE 1=2"); 
						}
						$ColumnCountResult = $rs->FieldCount();
						
						//Find in all foreign field
						$CollectObjList = array();
						CollectOnObjectPropertyExist($LayoutEditorJson, 'displayField');
						
						$sqlAppo = array();
						for ($i=0; $i < $ColumnCountResult; $i++) {
							$fld = $rs->FetchField($i);
							$field = $fld->name;
							
							//Find obj connected   (dynamicgrid con property displayField impostata)
							foreach($CollectObjList as $subObj) {
								$obj = ReturnOnObjectPropertyValue($LayoutEditorJson, "name", $subObj["name"]);
								if (($obj["datasourcetype"] == 'SELECT') && ($field == $obj['datasourcefield'])) {
									$sqlSubGrid = "SELECT a." . $obj["valueField"] . " 
													FROM (" . ExecFuncInStringSQL($obj["datasource"]) . ") a 
													WHERE a." . $obj["displayField"] .  " LIKE '%" . $combowhere . "%'";
									if ($conn->debug==1) {
										$start_time = microtime(true);
										$rsForeign = $conn->Execute( $sqlSubGrid); 
										$end_time = microtime(true);
										$elapsed_time = $end_time - $start_time;
										echo 'Timer' . $elapsed_time . BRCRLF;
									}else{
										$rsForeign = $conn->Execute( $sqlSubGrid); 
									}
									
									while (!$rsForeign->EOF) {
										$val = $rsForeign->fields[$obj["valueField"]];
										$sqlAppo[] =  "(" . $obj['datasourcefield'] . " = '" . $val . "')";
										$rsForeign->moveNext();
									}
								}else{
									$sqlAppo[] =  "( " . $field . " LIKE '%" . $combowhere . "%')";
								}
							}
						}
						$sqlwhere[] = "(" . implode (" OR ", $sqlAppo) . ")";
						$sqlwhere[] = " AND (1=1)";
						if (array_key_exists("insertwhere",$ObjJson) == true){
							$sqlwhere[] = "( " . $ObjJson["insertwhere"] . ")";
						}
					}
				}
				if ($conn->debug==1) {echo("<b>combowhere</b>"); var_dump($sqlwhere); echo(BRCRLF);}
				
				$combofilterField = ''; $combofilterValue = '';
				if ($combofilterActive){ 
					//$datawhere  ='';
					$combofilterField = trim(explode("=",$ObjJson["filterwhere"])[0]);
					$combofilterValue = trim(explode("=",$ObjJson["filterwhere"])[1]);
					$output['filterdebug'] = 'bla' . $combofilterField .'bla';
				}
				if ((!IsNullOrEmptyString($datawhere)) && ($combowhere == '')){
					if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datawhere:' . $datawhere . BRCRLF;
					$sqlwhere[] = "(" .  $datawhere . ")";
				}
				if (IsNullOrEmptyString($datawhere)) { 
					if (array_key_exists("insertwhere",$ObjJson) == true){
						$sqlwhere[] = "( " . $ObjJson["insertwhere"] . ")";
					}
				}
				if ($combofilterActive){ 
					if (array_key_exists("filterwhere",$ObjJson) == true){
						$sqlwhere[] = "( " . $ObjJson["filterwhere"] . ")";
					}
				}
				
				$startDate = '';
				$startDate = isset($_POST["startDate"]) ? $_POST["startDate"] : $startDate;
				$startDate = isset($_GET["startDate"])  ? $_GET["startDate"]  : $startDate;
				$startDate = str_replace("undefined", "null", $startDate);   
				$startDate = str_replace("%20", " ", $startDate); 
				
				$endDate = '';
				$endDate = isset($_POST["endDate"]) ? $_POST["endDate"] : $endDate;
				$endDate = isset($_GET["endDate"])  ? $_GET["endDate"]  : $endDate;
				$endDate = str_replace("undefined", "null", $endDate);   
				$endDate = str_replace("%20", " ", $endDate);   
				
				$calendar = '';
				$calendar = isset($_POST["calendar"]) ? $_POST["calendar"] : $calendar;
				$calendar = isset($_GET["calendar"])  ? $_GET["calendar"]  : $calendar;
				$calendar = str_replace("undefined", "null", $calendar);   
				$calendar = str_replace("%20", " ", $calendar);   
				
				if (!IsNullOrEmptyString($startDate)){  
					$sqlwhere[] = "(" . $ObjJson['eventStartDateField'] . " >= '" . $startDate . "')";
				}
				if (!IsNullOrEmptyString($endDate)){ 
					$sqlwhere[] = "(" . $ObjJson['eventEndDateField']   . " <= '" . $endDate . "')";
				}
				if (!IsNullOrEmptyString($calendar)){ 
					$sqlwhere[] = "(" . $ObjJson['groupField']   . " = '" . $calendar . "')";
				}
				
				if ($conn->debug==1) {echo("<b>datawhere</b>"); var_dump($sqlwhere); echo(BRCRLF);}
				
				if (!IsNullOrEmptyString($gridwhere)){
					if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' filter:' . $gridwhere . BRCRLF;
					//[{"property":"name","type":"string","operator":"like","value":"admin"}]
					//[{"operator":"lt","value":"2016-01-21","property":"DataIns"}]
					$appoggio = json_decode($gridwhere,true);
					foreach ($appoggio as $sub) {
						if ($sub["property"] == 'innerSearch'){
							//innerSearch
							if ($conn->debug==1) echo('InnerSearch');
							
							/* MARIADB ERROR SCOPE FIELD OF SUBQUERY */
							if ($conn->debug==1) {
								$start_time = microtime(true); 
								$rs = $conn->Execute($sql . " WHERE 1=2");
								$end_time = microtime(true);
								$elapsed_time = $end_time - $start_time;
								echo 'Timer' . $elapsed_time . BRCRLF;
							}else{
								$rs = $conn->Execute($sql . " WHERE 1=2"); 
							}
							$ColumnCountResult = $rs->FieldCount();
							$sqlAppo = array();
							for ($i=0; $i < $ColumnCountResult; $i++) {
								$fld = $rs->FetchField($i);
								$field = $fld->name;
								$fldType = $rs->MetaType($fld->type);
								if (($fldType != 'T') && ($fldType != 'D') && ($fldType != 'B') && ($fldType != 'L') && ($fldType != 'R') && ($fldType != 'N') && ($fldType != 'I')) {
									if (($sub["value"][0] != "%") && (substr($sub["value"], -1, 1) != "%") ) {
										$sqlAppo[] =  "( " . $field . " LIKE '%" .$sub["value"]  . "%')";
									}else{
										$sqlAppo[] =  "( " . $field . " LIKE '" .$sub["value"]  . "')";
									}
								}
							}
							
							//Find obj connected   (dynamicgrid con property displayField impostata)
							$CollectObjList = array();
							//CollectOnObjectPropertyValue($LayoutEditorJson, "xtype", 'dynamicgrid');
							
							CollectOnObjectPropertyExist($LayoutEditorJson, 'displayField');
							foreach($CollectObjList as $subObj) {
								$obj = ReturnOnObjectPropertyValue($LayoutEditorJson, "name", $subObj["name"]);
								if (array_key_exists("datasourcetype",$obj) == true){
									if ($obj["datasourcetype"] == 'SELECT'){
										$sqlSubGrid = "SELECT a." . $obj["valueField"] . " 
														FROM (" . ExecFuncInStringSQL($obj["datasource"]) . ") a 
														WHERE a." . $obj["displayField"] .  " LIKE '%" . $sub["value"] . "%'";
										if ($conn->debug==1) {
											$start_time = microtime(true); 
											$rs = $conn->Execute( $sqlSubGrid); 
											$end_time = microtime(true);
											$elapsed_time = $end_time - $start_time;
											echo 'Timer' . $elapsed_time . BRCRLF;
										}else{
											$rs = $conn->Execute( $sqlSubGrid); 
										}
										
										while (!$rs->EOF) {
											$val = $rs->fields[$obj["valueField"]];
											$sqlAppo[] =  "(" . $obj['datasourcefield'] . " = '" . $val . "')";
											$rs->moveNext();
										}
									}
								}
							}
							$sqlwhere[] = "(" . implode (" OR ", $sqlAppo) . ")";
						} else {
							//normalSearch
							if ($conn->debug==1) echo('normalSearch');
							$FilterForeignisNull = false;
							$FilterForeignArray = array();
							
							$FieldValue = "";
							if (array_key_exists("value",$sub) == true) $FieldValue = $sub["value"];
							
							$FieldType = "string";
							if (array_key_exists("type",$sub) == true) $FieldType = $sub["type"];
							if ( strpos($sub["value"],'/') == true) $FieldType = "date";
							
							$FieldOperator = "like";
							if (array_key_exists("operator",$sub) == true) $FieldOperator = $sub["operator"];
							if ( $FieldOperator == 'lt') $FieldOperator = "<=";
							elseif ( $FieldOperator == 'gt') $FieldOperator = ">=";
							elseif ( $FieldOperator == 'eq') $FieldOperator = "=";
							elseif ( $FieldOperator == '==') $FieldOperator = "=";
							elseif ( $FieldOperator == 'like') $FieldType = "string";
							
							$FieldCondition = $sub["property"];
							if (strrpos($FieldCondition,"decoded") == true){
								//ricerca in una combobox
								$FieldCondition = str_replace("decoded","",$FieldCondition);
								$subLayoutObj = ReturnOnObjectPropertyValue($LayoutEditorJson, "name", $FieldCondition);
								$FilterForeigndatasourceType = $subLayoutObj['datasourcetype'];
								if (!is_array($FieldValue)){
									$FieldValue = array();
									$FieldValue[0] = $sub["value"];
								}
								
								//ricerca serie di valori o uno solo
								foreach ($FieldValue as &$value) {
									if (substr($value, 0, 8) == 'extModel') {
										$FilterForeignisNull = true;
									}else{
										if (($FilterForeigndatasourceType == 'SELECT') || ($FilterForeigndatasourceType == 'TABLE') || ($FilterForeigndatasourceType == 'TREE')){
											if ($FieldOperator == "like"){ $value =  "%" . $value . "%"; }
											if ($conn->debug==1) echo('normalSearchgetRows');
											$subLayoutObj['datasource'] = ExecFuncInStringSQL ($subLayoutObj['datasource']);
											$FilterForeignId = getRows($conn,
																		$subLayoutObj['valueField'],
																		$subLayoutObj['datasource'],
																		$subLayoutObj['displayField'] . " " . $FieldOperator . " '" . $value . "'" );
										}elseif ($FilterForeigndatasourceType == 'CSV2') {
											if ($FieldOperator == "like"){ $value =  "%" . $value . "%"; }
											if ($conn->debug==1) echo('normalSearchgetCSV2Array');
											$FilterForeigndatasource = str_replace(';',',',$subLayoutObj['datasource']);
											$FilterForeigndatasource = CSV2Array($FilterForeigndatasource, ",");
											$FilterForeignId = ALookup(0, $FilterForeigndatasource, 2, 1, $value);
										}elseif ($FilterForeigndatasourceType == 'PSV2') {
											if ($conn->debug==1) echo('normalSearchgetPSV2');
											if ($FieldOperator == "like"){ $value =  "%" . $value . "%"; }
											$FilterForeigndatasource = CSV2Array($subLayoutObj['datasource'], "|");
											$FilterForeignId = ALookup(0, $FilterForeigndatasource, 2, 1, $value);
										}elseif ($FilterForeigndatasourceType == 'CSV') {
											if ($conn->debug==1) echo('normalSearchgetCSV');
											$FilterForeignId = $value;
										}elseif ($FilterForeigndatasourceType == 'PSV') {
											if ($conn->debug==1) echo('normalSearchgetPSV');
											$FilterForeignId = $value;
										}
										if	(is_array($FilterForeignId) == true){
											$FilterForeignArray = $FilterForeignId;
										}else{
											$FilterForeignArray[] = $FilterForeignId;
										}
									}
								}
								if ($conn->debug==1) {echo("<b>FilterForeignId</b>"); var_dump($FilterForeignId); echo(BRCRLF);}
								//ricerca per posto preciso
								$FieldOperator = "in";
							}
							
							//costruisco where
							if ($FieldType == "string"){
								if ($FieldOperator == "like"){
								if ($FieldValue != ""){
								if (($FieldValue[0] != "%") && (substr($FieldValue, -1, 1) != "%") ) {
										$sqlwhere[] = "( " .  $FieldCondition . " " . $FieldOperator ." '%" . $FieldValue . "%')";	
									}else{
										$sqlwhere[] = "( " .  $FieldCondition . " " . $FieldOperator ." '" . $FieldValue . "')";	
									}									
								}else{
									$sqlwhere[] = "( " .  $FieldCondition . " is null)";	
								}
								}elseif ($FieldOperator == "in"){
									if($FilterForeignisNull == true){
										$sqlwhere[] = "( " . $FieldCondition . " ". $FieldOperator ." ('" . implode("','", $FilterForeignArray) . "') 
														OR (" .  $FieldCondition . " IS NULL)" .
														")";	
									}else{
										$sqlwhere[] = "( " . $FieldCondition . " ". $FieldOperator ." ('" . implode("','", $FilterForeignArray) . "')" . ")";	
									}
								}else{
									$sqlwhere[] = "( " .  $FieldCondition . " ". $FieldOperator ." '" . $FieldValue . "')";
								}
							} elseif ($FieldType == "date"){
								//"2016-01-21" 
								$sqlwhere[] = "( " .  $FieldCondition . " ". $FieldOperator ." '" . $FieldValue . "')";
							} else {
								//numeric
								$sqlwhere[] = "( " .  $FieldCondition . " ". $FieldOperator ." " . $FieldValue . ")";
							}
						}
					}
				}
				if ($conn->debug==1) {echo("<b>datawhere</b>"); var_dump($sqlwhere); echo(BRCRLF);}
				
				//ORDER
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:ORDER" . BRCRLF);
				$ToOrderField = '';
				$ToOrderDirection = '';
				if (!IsNullOrEmptyString($gridorder)){
					//[{"property":"CT_ORDMOVIMENTI","direction":"ASC"}]
					$appoggio = json_decode($gridorder,true);
					if ($conn->debug==1) {echo("<b>gridorder</b>"); var_dump($appoggio); echo(BRCRLF);}
					foreach($appoggio as $sub) {
						$obj = ReturnOnObjectPropertyValue($LayoutEditorJson, "datasourcefield", $sub["property"]);
						if (($obj["xtype"] == 'combobox') || ($obj["xtype"] == "dynamiccombo")){
							$FieldCondition = $sub["name"];
							$ToOrderField = $FieldCondition;
							if ($sub["direction"] == 'DESC'){
								$ToOrderDirection = SORT_DESC;
							}else{
								$ToOrderDirection = SORT_ASC;
							}
							$FieldCondition = str_replace("decoded", "", $FieldCondition);
							$sqlorder[] =  $FieldCondition . " " . $sub["direction"];
						}else{
							$FieldCondition = $sub["property"];
							$ToOrderField = $FieldCondition;
							if ($sub["direction"] == 'DESC'){
								$ToOrderDirection = false;
							}else{
								$ToOrderDirection = true;
							}
							
							/**/
							$FieldCondition = str_replace("decoded", "", $FieldCondition);
							$sqlorder[] =  $FieldCondition . " " . $sub["direction"];
						}
					}
				}
				if (!IsNullOrEmptyString($dataorder)){
					if ($conn->debug==1) {echo("<b>ORDER dataorder</b>"); var_dump($dataorder); echo(BRCRLF);}
					$sqlorder[] =  $dataorder;
				}
				//ORDER IF OBJECT IS COMBO
				if (($ObjJson != null) && ($datasourcetype != 'SELECT')){
					if ($conn->debug==1) echo("ORDER COMBO" . BRCRLF);
					if (($ObjJson["xtype"] == 'combobox') || ($ObjJson["xtype"] == "dynamiccombo")){
						$displayField = str_replace("decoded", "", $displayField);
						$sqlorder[] = $displayField;
					}
				}
				
				//COSTRUZIONE SQL
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:COSTRUZIONE SQL" . BRCRLF);
				if ($conn->debug==1) {echo("<b>ORDER BY ARRAY</b>"); var_dump($sqlorder); echo(BRCRLF);}
				if(count($sqlwhere)>0) {
					$sql = $sql . " WHERE " . implode (" AND ", $sqlwhere);
				}
				if(count($sqlorder)>0) {
					if (implode (", ", $sqlorder) != ''){
						$sql = $sql . " ORDER BY " . implode (", ", $sqlorder);
					}
				}
				
				//DEBUG SQL
				if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " SQL: " . $sql;
				
				//LANCIO SQL
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:LANCIO SQL" . BRCRLF);
				try {   
					//$rs = $conn->Execute($sql);
					if ($conn->debug==1) {
						$start_time = microtime(true); 
						$rs = $conn->selectLimit($sql,$RecordLimit,$RecordStart);
						echo 'Timer' . (microtime(true) - $start_time) . BRCRLF;
					}else{
						$rs = $conn->selectLimit($sql,$RecordLimit,$RecordStart);
					}
				} catch (exception $e){
					$output["failure"] = true; 
					$output["success"] = false;
					$output["message"] = 'select ' . $e->getMessage();
					echo  Array2JSON($output);
					die();
				}
				$RecordCountResult = $rs->RecordCount();
				$ColumnCountResult = $rs->FieldCount();
				
				//definition field and columns
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:definition field and columns" . BRCRLF);
				for ($i = 0; $i < $ColumnCountResult; $i++) {
					$fld = $rs->FetchField($i);
					$name = $fld->name;
					$header = $fld->name;
					$fldType = $rs->MetaType($fld->type);
					$max_length = $fld->max_length;
					$rendered = '';
					$xtype = '';
					$flex = 1;
					$width = 70;
					$hiddenInGrid = false;
					$flexInGrid = '';
					$lockedInGrid = false;
					$editableInGrid = false;
					$renderInGridIcon = '';
					$renderInGridColor = '';
					$renderInGridButton = '';
					$renderInGridSummaryType = '';
					if ($conn->debug==1) echo("PREIMPOSTAZIONE COLONNE". BRCRLF);
					if (($LayoutEditorId != 0) && ($LayoutObjList != null)) {$hiddenInGrid = 'nd'; if ($conn->debug==1) echo("PREIMPOSTAZIONE A COLONNE TUTTE NASCOSTE". BRCRLF);}
					$filteroptions = '';		
					
					
					/*
					C: Character fields that should be shown in a <input type="text"> tag.
					X: Clob (character large objects), or large text fields that should be shown in a <textarea>
					D: Date field
					T: Timestamp field
					L: Logical field (boolean or bit-field)
					N: Numeric field. Includes decimal, numeric, floating point, and real.
					I: Integer field.
					R: Counter or Autoincrement field. Must be numeric.
					B: Blob, or binary large objects.
					*/
					$fieldphptype = 'string';
					if     ($fldType == 'C') { $type = '';				$editortype = 'textfield';	$filtertype = 'string';	$formattype ='';			$formattypefilter = '';				$fieldtype = 'string';	$fieldphptype = 'string';	$width = 150;	$flex = 1;} //VCHR
					elseif ($fldType == 'X') { $type = '';				$editortype = 'textarea';	$filtertype = 'string';	$formattype ='';			$formattypefilter = '';				$fieldtype = 'string';	$fieldphptype = 'string';	$width = 600;	$flex = 2;} //CLOB
					elseif ($fldType == 'B') { $type = '';				$editortype = 'textarea';	$filtertype = 'string';	$formattype ='';			$formattypefilter = '';				$fieldtype = 'string';	$fieldphptype = 'string';	$width = 600;	$flex = 2;} //BLOB
					elseif ($fldType == 'I') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ='';			$formattypefilter = '';				$fieldtype = 'number';	$fieldphptype = 'int';		$width = 70;	$flex = 1;} //INT
					elseif ($fldType == 'N') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ='';			$formattypefilter = '';				$fieldtype = 'number';	$fieldphptype = 'float';	$width = 70;	$flex = 1;}	//NUM (DEC)
					elseif ($fldType == 'D') { $type = 'datecolumn';	$editortype = 'datefield';	$filtertype = 'date';	$formattype ='d-m-Y';		$formattypefilter = 'Y-m-d';		$fieldtype = 'date';	$fieldphptype = 'string';	$width = 100;	$flex = 1;}	//DATE
					elseif ($fldType == 'L') { $type = 'checkcolumn';	$editortype = 'checkbox';	$filtertype = 'boolean';$formattype ='';			$formattypefilter = '';				$fieldtype = 'boolean';	$fieldphptype = 'string';	$width = 50;	$flex = 1;} //BIT
					elseif ($fldType == 'R') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ="000.00";		$formattypefilter = '';				$fieldtype = 'number';	$fieldphptype = 'int';		$width = 70;	$flex = 1;} //COUNT
					elseif ($fldType == 'T') { $type = 'datecolumn';	$editortype = 'datefield';	$filtertype = 'date';	$formattype ='d-m-Y H:i:s';	$formattypefilter = 'Y-m-d  H:i:s'; $fieldtype = 'date';	$fieldphptype = 'datetime';	$width = 120;	$flex = 1;} //TIMESTAMP
					elseif ($fldType == 'S') { $type = '';				$editortype = 'textarea';	$filtertype = 'string';	$formattype ='H:i:s';		$formattypefilter = 'H:i:s'; 		$fieldtype = 'string';	$fieldphptype = 'string';	$width = 120;	$flex = 1;} //TIME
					else					 { $type = '';				$editortype = 'textfield';	$filtertype = 'string';	$formattype ='';									$fieldtype = 'string';	$fieldphptype = 'string';	$width = 150;	$flex = 1;} //VCHR
					//if ($max_length > 1000) { $type = '';$editortype = 'textarea';	$filtertype = 'string'; $formattype ='';	$width = 600;	$flex = 2;}  //CLOB
					
					$column = array();
					$fields = array();
					
					//gestione foreign (Editor)
					$editor = array();
					$editor["xtype"] = $editortype;
					$editor["allowBlank"] = "true";
					if (!IsNullOrEmptyString($formattype)) $editor['format'] = $formattype ;
					foreach($LayoutObjList as $sub) {
						if ($sub["datasourcefield"] == $name){
							$obj = ReturnOnObjectPropertyValue($LayoutEditorJson,"datasourcefield",$name);
							
							if (is_array($obj) && array_key_exists('fieldLabel', $obj)){ $header = $obj["fieldLabel"]; }
							
							if (is_array($obj) && array_key_exists ('xtype', $obj)) {
								if(($obj["xtype"] == "combobox") || ($obj["xtype"] == "dynamiccombo") || ($obj["xtype"] == "dynamictreecombo")){
									$xtype = $obj["xtype"];
									$editor = array();
									$editor = object_clone($obj);
									$editor["store"] = "DS_" . $name;
									$editor["name"] = $name;
									$editor["fieldLabel"] = '';
								}elseif ($obj["xtype"] == "dynamicimage"){
									$xtype = $obj["xtype"];
									$editor = array();
									$editor = object_clone($obj);
									$editor["name"] = $name;
									$editor["fieldLabel"] = '';
								}elseif ($obj["xtype"] == "numberfield"){
									if (is_array($obj) && (array_key_exists('decimalPrecision', $obj))){
										if ($obj['decimalPrecision'] == 0) $formattype ="0,000";
										if ($obj['decimalPrecision'] == 1) $formattype ="0,000.0";
										if ($obj['decimalPrecision'] == 2) $formattype ="0,000.00";
										if ($obj['decimalPrecision'] == 3) $formattype ="0,000.000";
										if ($obj['decimalPrecision'] == 4) $formattype ="0,000.0000";
									}
								}elseif($obj["xtype"] == "currencyfield"){
									$formattype ="0,000.00";
									if (is_array($obj) && (array_key_exists('decimalPrecision', $obj))){
										if ($obj['decimalPrecision'] == 0) $formattype ="0,000";
										if ($obj['decimalPrecision'] == 1) $formattype ="0,000.0";
										if ($obj['decimalPrecision'] == 2) $formattype ="0,000.00";
										if ($obj['decimalPrecision'] == 3) $formattype ="0,000.000";
										if ($obj['decimalPrecision'] == 4) $formattype ="0,000.0000";
									}
								}elseif($obj["xtype"] == "checkbox"){
									$type = 'checkcolumn';	$editortype = 'checkbox';	$filtertype = 'boolean';
									$formattype ='';		$formattypefilter = '';		$fieldtype = 'boolean';		$fieldphptype = 'string';
									$editor["xtype"] = $type;
								}
							}
						}
					}
					
					//OVERRIDE GRID BY FORM LAYOUTGROUPACL
					if (($UserDeveloper == false) && ($UserAdmin == false) && (($VIEWTYPE != 'raw') && ($VIEWTYPE != 'label') && ($VIEWTYPE != 'report'))){
						$ResultVisible = True;
						$ResultDisable = False;
						$output["messageacl"] = "testing";
						$sql = "SELECT * FROM " . $ExtJSDevDB . "layoutgroup 
								WHERE CT_AAALAYOUT = " . $LayoutId .
								" ORDER BY NAME, CT_AAAGROUP, VISIBLE, READONLY";
						$LayoutGrouprs = $conn->Execute($sql);
						$layoutgroup = "";
						while (!$LayoutGrouprs->EOF) {
							$layoutgroup = $layoutgroup . $LayoutGrouprs->fields['NAME'];
							$nameOld = $LayoutGrouprs->fields['NAME'];
							
							//gestione utente
							if (IsNullOrEmptyOrZeroString($LayoutGrouprs->fields['CT_AAAGROUP'])){		
								/*		da fare			
								if ($UserId == $LayoutGrouprs->fields['CT_AAAUSER']){
									if ($LayoutGrouprs->fields['VISIBLE'] == 0) {
										$ResultVisible = False;
										$layoutgroup = $layoutgroup . "GroupG Removed V" . ' || ';
									}
									if ($LayoutGrouprs->fields['READONLY'] == 1) {
										$layoutgroup = $layoutgroup . "GroupG Added R" . ' || ';
										$ResultDisable = True;
									}
								}
								*/
							}
							//gestione gruppo
							else{
								//verifica utente che appartiene a quel gruppo
								$sql = "SELECT * 
										FROM  " . $ExtJSDevDB . "usergroup 
										WHERE CT_AAAUSER = " . $UserId . " 
											AND CT_AAAGROUP = " . $LayoutGrouprs->fields['CT_AAAGROUP'] ;
								$rsgroup = $conn->Execute($sql);
								if ($rsgroup->RecordCount()>0){
									if ($LayoutGrouprs->fields['VISIBLE'] == 0) {
										$layoutgroup = $layoutgroup . "VISIBLE -" . ' || ';
										$ResultVisible = False;
									}else{
										$layoutgroup = $layoutgroup . "VISIBLE +" . ' || ';
										$ResultVisible = True;
									}
									if ($LayoutGrouprs->fields['READONLY'] == 1) {
										$layoutgroup = $layoutgroup . "READ +" . ' || ';
										$ResultDisable = True;
									}else{
										$layoutgroup = $layoutgroup . "READ +" . ' || ';
										$ResultDisable = False;
									}
								}
								$rsgroup->Close();
							}
							
							$objTochange = & getSubItemFromName($LayoutEditorJson, $nameOld);
							if ($ResultVisible == False){
								//$objTochange['hidden'] = True;
								$objTochange['hiddenInGrid'] = True;
								$objTochange['hiddenInForm'] = True;
							}
							if ($ResultDisable == True){
								$objTochange['disabled'] = True;
							}
							
							$nameOld = $LayoutGrouprs->fields['NAME'];
							$ResultVisible = True;
							$ResultDisable = False;
							
							
							$LayoutGrouprs->MoveNext();
							
						}
						$LayoutGrouprs->close();
					}else{
						$layoutgroup = "NOT TO DO " . '-' . $UserDeveloper . '-' . $UserAdmin  . '-' . $VIEWTYPE ;
					}
					
					//LANGUAGE
					if (('IT' != $UserLocale) && ('' != $UserLocale) ){
						
					}
					
					//OVERRIDE GRID BY FORM LAYOUT
					//hidden in grid     editable in grid   flex in grid   ...
					$hidden = false;
					foreach($LayoutObjList as $sub) {
						if ($sub["name"] == $name){
							$hiddenInGrid = false;
							$hidden = false;
							$flexInGrid = '';
							$lockedInGrid = false;
							$renderInGridIcon = '';
							$renderInGridColor = '';
							$renderInGridButton = '';
							$renderInGridSummaryType = '';
							$obj = ReturnOnObjectPropertyValue($LayoutEditorJson,"name",$name);
							if ($obj != null){
								if (array_key_exists("hiddenInGrid", $obj)){
									if ($obj["hiddenInGrid"] === true) $hiddenInGrid = true;
									if ($obj["hiddenInGrid"] === false) $hiddenInGrid = false;
								}
								if (array_key_exists("hidden", $obj)){
									if ($obj["hidden"] === true) $hidden = true;
									if ($obj["hidden"] === false) $hidden = false;
								}
								if (array_key_exists("flexInGrid", $obj)){
									$flexInGrid = $obj["flexInGrid"];
								}
								if (array_key_exists("lockedInGrid", $obj)){
									if ($obj["lockedInGrid"] === true) $lockedInGrid = true;
									if ($obj["lockedInGrid"] === false) $lockedInGrid = false;
								}
								if (array_key_exists("editableInGrid", $obj)){
									if ($obj["editableInGrid"] === true) $editableInGrid = true;
									if ($obj["editableInGrid"] === false) $editableInGrid = false;
								}
								if (array_key_exists("renderInGridIcon", $obj)){
									$renderInGridIcon = $obj["renderInGridIcon"];
								}
								if (array_key_exists("renderInGridColor", $obj)){
									$renderInGridColor = $obj["renderInGridColor"];
								}
								if (array_key_exists("renderInGridButton", $obj)){
									$renderInGridButton = $obj["renderInGridButton"];
								}
								if (array_key_exists("renderInGridSummaryType", $obj)){
									$renderInGridSummaryType = $obj["renderInGridSummaryType"];
								}
								
								//reset type 
								if(($obj["xtype"] == "combobox") || ($obj["xtype"] == "dynamiccombo") || ($obj["xtype"] == "dynamictreecombo")){
									if ($editableInGrid == false){
										//FieldDecoded
										$name = $name . 'decoded';
										$type = '';	$editortype = 'textfield';	$filtertype = 'list';	$formattype ='';	$width = 150;	$flex = 1;
										//list option
										if ($RecordCountResult = $RecordLimit ) $filtertype = 'string';
										 //options: ['extra small', 'small', 'medium', 'large', 'extra large']
										 //$filteroptions = getRows($conn, $editor["displayField"], $editor["datasource"], '1=1');
									}	
								}
								elseif($obj["xtype"] == "checkbox"){
									$type = 'checkcolumn';	$editortype = 'checkbox';	$filtertype = 'boolean';
									$formattype ='';		$formattypefilter = '';		$fieldtype = 'boolean';		$fieldphptype = 'string';
								}
							}
						}
					}
					
					if (($combofilterActive) && ($name == $combofilterField)){
						$filter = array(
									"type" => $filtertype,  
									"dateFormat" => $formattypefilter,
									"record" => $RecordCountResult,
									"value" => $combofilterValue, 
									//"options" => $filteroptions
								);
					}else{						
						$filter = array(
									"type" => $filtertype,  
									"dateFormat" => $formattypefilter,
									"record" => $RecordCountResult,
									//"value" => $filtervalue, 
									//"options" => $filteroptions
								);
					}
					$exportStyle = array(
								"format" => $filtertype
							);
					$column = array(
								"dataIndex"=> $name,
								"xtype"=> $type,
								"header" => $header, 
								"hiddenInGrid" => $hiddenInGrid, 	//column hidden
								"hidden" => $hidden,   				//ACL lock field
								"lock" => $lockedInGrid,
								"editableInGrid" => $editableInGrid,
								"renderInGridIcon" => $renderInGridIcon,
								"renderInGridColor" => $renderInGridColor,
								"renderInGridButton" => $renderInGridButton,
								"align" => (($type == 'numbercolumn') && ($formattype != '')) ?  'right':null,
								"summaryType" => $renderInGridSummaryType,
								//"summaryRenderer" => ($type == 'numbercolumn') ? "<source>function(value){return Ext.util.Format.currency(value,'',2,true);}</source>":null,
								//"renderer" => $type == 'numbercolumn' ? "<source>Ext.util.Format.numberRenderer('0.00')</source>" : null,
								"flex" => $flexInGrid != '' ? $flexInGrid : $flex,
								"format" => $formattype,
								"editor" => $editor, 
								"filter" => $filter,
								"exportStyle"=>$exportStyle,
								//"disabled" => true,
								//"disabledCls" => ''
							);
							
					$field = array(
								"name" => $name,
								"type"=>$fieldtype,
								"typephp"=>$fieldphptype,
								"dateFormat"=> $formattype,
								"xtype"=> $editortype 
							);
							
					$output["fields"][]= $field;
					$output["columns"][]= $column;
					
				}
				
				// DATA
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:data" . BRCRLF);
				$RecordCountResult = 0;
				if ($modeldef === true){
					//nel caso si vuole solo le definizioni
					$output["metaData"]["rootProperty"]="columns"; 
				}else{
					$camponome  = "";
					$campoxtype = "";
					if ($rs){
						//campi della select 
						$keys = array();
						$RecordCountResult = $rs->RecordCount();
						$RecordReaded = 0;
						if ($RecordStart == -1) { $RecordStart = $RecordCountResult-1;}
						
						//estraggo i dati
						//while ($RecordStart < $RecordCountResult){
							
						$output["messagedebug"] = $output["messagedebug"] . ' AAAAA ';
						
						while (!$rs->EOF){							
							//campi normali e override foreign for combo (limit <> 1 quindi escluso le form)
							if ($conn->debug==1) echo("<b>BOOKMARK</b>:campi Normali" . BRCRLF);
							$keys = array();
							for ($i=0; $i < $ColumnCountResult; $i++) {
								$camponome  = $output["columns"][$i]["dataIndex"];
								$campoxtype = $output["columns"][$i]["editor"]["xtype"];
								$campohidden  = $output["columns"][$i]["hidden"];
								$camponome  = str_replace('decoded','',$camponome);
								
								//controllo tipo campo e restituisco il valore nel miglior modo possibile 
								if (($rs->fields[$camponome] == '') || ($rs->fields[$camponome] == null)){
									$keys[$camponome] = null;
								}
								elseif ($output["fields"][$i]["typephp"] == 'datetime'){
									$keys[$camponome] = $rs->fields[$camponome];
								}
								elseif (($RecordLimit != 1) && (($campoxtype == "combobox") || ($campoxtype == "dynamiccombo") || ($campoxtype == "dynamictreecombo"))) {
									$keys[$camponome] = null;
									$keys[$camponome. 'decoded'] = null;
									if (array_key_exists("displayField", $output["columns"][$i]["editor"])){
										//mette in chiaro la foreign
										$keys[$camponome] = $rs->fields[$i];
										$camponome = $camponome . 'decoded';
										switch ($output["columns"][$i]["editor"]["datasourcetype"]) {
											case 'TABLE' :
											case 'TREE' :
											case 'SELECT':{
												if (!IsNullOrEmptyString($rs->fields[$i])){ 
													if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datasourcetypeCOMBO:' . $output["columns"][$i]["editor"]["datasourcetype"] . BRCRLF;
													$output["columns"][$i]["editor"]["datasource"] = ExecFuncInStringSQL($output["columns"][$i]["editor"]["datasource"]);
													if (IsNumeric($rs->fields[$i])){
														$keys[$camponome] = DLookup($conn,
																				$output["columns"][$i]["editor"]["displayField"],
																				$output["columns"][$i]["editor"]["datasource"],
																				$output["columns"][$i]["editor"]["valueField"] . " = " . $rs->fields[$i] . "" );
													} else {
														$keys[$camponome] = DLookup($conn,
																				$output["columns"][$i]["editor"]["displayField"],
																				$output["columns"][$i]["editor"]["datasource"],
																				$output["columns"][$i]["editor"]["valueField"] . " = '" . $rs->fields[$i] . "'" );
													}
												}
											}
											break;
											case 'PSV':{
												$output["columns"][$i]["editor"]["datasource"] = str_replace('|',';',$output["columns"][$i]["editor"]["datasource"]);
											}
											case 'CSV':{
												if (IsNOTNullOrEmptyOrZeroString($rs->fields[$i])){ 
													$output["columns"][$i]["editor"]["datasource"] = str_replace(',',';',$output["columns"][$i]["editor"]["datasource"]);
													$keys[$camponome] = ALookup(0,
																				CSV2Array($output["columns"][$i]["editor"]["datasource"],";"),
																				1,
																				0,
																				$rs->fields[$i]
																				);
												}
											}
											break;
											case 'PSV2':{
												$output["columns"][$i]["editor"]["datasource"] = str_replace('|',';',$output["columns"][$i]["editor"]["datasource"]);
											}
											case 'CSV2':{
												if (IsNOTNullOrEmptyOrZeroString($rs->fields[$i])){ 
													$output["columns"][$i]["editor"]["datasource"] = str_replace(',',';',$output["columns"][$i]["editor"]["datasource"]);
													$keys[$camponome] = ALookup(1,
																				CSV2Array($output["columns"][$i]["editor"]["datasource"],";"),
																				2,
																				0,
																				$rs->fields[$i]
																				);													
												}
											}
											break;
											default:{
												$keys[$camponome] =  $rs->fields[$i];
											}
											break;
										}
									}						
								}
								elseif ((stripos($camponome, 'JSON') == true) && ( $RecordLimit == 1 )){
									$keys[$camponome] = $rs->fields[$camponome];
									//$keys[$camponome] = JsonPrettyPrint($rs->fields[$camponome]);
									//$keys[$camponome] = iconv("ISO-8859-1", "UTF-8", $keys[$camponome]);
								}
								elseif (($campoxtype == 'textarea') && ($RecordLimit != 1)) {
									$keys[$camponome] = strip_tags($rs->fields[$camponome]);
									if ($LayoutType == 'RPT') {
										$keys[$camponome] = $rs->fields[$camponome];
										$keys[$camponome] = str_replace("\r", "", $keys[$camponome]);
									}
									//$keys[$camponome] = substr($keys[$camponome],0,60) . '...';
									//$keys[$camponome] = iconv("ISO-8859-1", "UTF-8", $keys[$camponome]);
								}
								elseif (($campoxtype == 'dynamicimage')){
									$keys[$camponome] = $rs->fields[$camponome];
								}
								elseif ($campoxtype == 'checkcolumn'){
									$keys[$camponome] = $rs->fields[$camponome];
									//settype($keys[$camponome], $output["fields"][$i]["typephp"]);
									if ($keys[$camponome] == null) $keys[$camponome] = 0;
									settype($keys[$camponome], 'int');
								}
								else{
									//$keys[$camponome] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$i]);
									//var_dump($rs->fields[$camponome]);
									//$keys[$camponome] = ($rs->fields[$i]);
									$keys[$camponome] = $rs->fields[$camponome];
									settype($keys[$camponome], $output["fields"][$i]["typephp"]);
									
									/* DAFARE meglio forzatura date per report il jsreport legge le date in formato americano non jap e fa casino con il cast */
									if (($LayoutType == 'RPT') && ($objname != 'Form00')){
										if ($output["fields"][$i]["type"] == 'date'){
											if (WFVALUEGLOBAL('LINGUA') == 'IT'){
												$appo = strtotime($keys[$camponome]);
												$keys[$camponome] = date('d-m-Y',$appo);
											}
										}
										if ($output["fields"][$i]["type"] == 'datetime'){
											if (WFVALUEGLOBAL('LINGUA') == 'IT'){
												$appo = strtotime($keys[$camponome]);
												$keys[$camponome] = date('d-m-Y H:i:s',$appo);
											}
										}
									}
									
									//echo 'Caught exception: ' . $keys[$camponome] . 'Z' . $output["fields"][$i]["typephp"] . 'ZZ';
									
								}
								
								//ACL lock field
								if ($campohidden){
									unset($keys[$camponome]);
								}
							}
							
							//campi CALCOLATI da layoutform(aggiungi) Formule
							if ($conn->debug==1) echo("<b>BOOKMARK</b>:campi Formule" . BRCRLF);
							foreach($LayoutObjList as $sub) {
								if (($sub["name"] != $sub["datasourcefield"]) && !IsNullOrEmptyString($sub["datasourcefield"])){
									//se campo diverso dal proprio nome allora ha dei calcoli da fare
									$camponome = $sub["name"];
									$datasourcefield = $sub["datasourcefield"];
									
									//sostituisci variabili con i valori 
									//Es valori IN
									// = WFVALUE('campoA')
									// = [campoA] + [CampoB]
									// = [campoAZ] . [CampoBZ]
									// = 2 + 5
									for ($i=0; $i < $ColumnCountResult; $i++) {
										$Appo = str_replace("'", "\'", $rs->fields[$i]);
										$datasourcefield = str_ireplace('[' . $output["fields"][$i]['name'] . ']',"'" . $Appo . "'",$datasourcefield );
									}							
									for ($i=0; $i < $ColumnCountResult; $i++) {
										if ($datasourcefield == $output["fields"][$i]['name']) {
											$datasourcefield = $rs->fields[$i];
										}
									}
									if ($conn->debug==1) echo("<b>datasourcefield</b>:" . $datasourcefield . BRCRLF);
									// = WFVALUE('campoA')
									// = 6 + 10    
									// = 'ca' . 'sa'
									// = 2 + 5
									
									$datasourcefield = ExecFuncInStringSQL($datasourcefield);
									// = 890
									// = 6 + 10    
									// = 'ca' . 'sa'
									// = 2 + 5
									
									if (substr($datasourcefield,0,1) == "=") {
										if (substr($datasourcefield,-1,1) != ";") $datasourcefield = $datasourcefield . ';';
										WFSendLOG("DataRead", 'Eval ($datasourcefield = '. $datasourcefield . ");");
										$datasourcefield = str_replace(',,',',NULL,',$datasourcefield);
										$datasourcefield = str_replace('=;','= NULL;',$datasourcefield);
										
										$orig = error_reporting(); // capture original error level
										error_reporting(0);        // suppress all errors
										try {
 											eval('$datasourcefield '. $datasourcefield);
										}catch(Exception $e){
											$datasourcefield = '';
											//WFSendLOG("DataRead", "Error:" . get_class($e) . ', ' . $e->getMessage() . '.');
										}
										error_reporting($orig);
									}
									// 890
									// 16    
									// 'casa'
									// 7
									$keys[$camponome] = iconv("ISO-8859-1", "UTF-8", $datasourcefield);
								}
							}
							
							
							//campi Calendar (aggiungi)
							if ($conn->debug==1) echo("<b>BOOKMARK</b>:Calendar" . BRCRLF);
							if ($ObjJson != null){
								if ($ObjJson["xtype"] == 'dynamiccalendar'){
									if ($calendardef == "type"){
										//$keys['calendarId'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['groupField']]);	
										$keys['id'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['groupField']]);	
										$keys['title'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['groupDisplayField']]);	
									}
									if ($calendardef == "event"){
										$keys['calendarId'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['groupField']]);	
										$keys['id'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['valueField']]);	
										$keys['title'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['displayField']]);
										
										$jsDateString = str_replace(' ', 'T', $rs->fields[$ObjJson['eventStartDateField']]) . 'Z';
										$appDate = new DateTime($jsDateString,  new DateTimeZone("Europe/Amsterdam"));
										$keys['startDate'] = $appDate->format(DateTime::W3C);
										
										$jsDateString = str_replace(' ', 'T', $rs->fields[$ObjJson['eventEndDateField']]) . 'Z';
										$appDate = new DateTime($jsDateString,  new DateTimeZone("Europe/Amsterdam"));
										$keys['endDate'] = $appDate->format(DateTime::W3C);
									}
								}
							}
							
							
							//INTERO record ADD TO array data
							$output["data"][] =  $keys;	
							
							//record counter limit
							$RecordStart++;
							$RecordReaded++;
							//if ($RecordLimit > 0) {
							//	if ($RecordReaded >= $RecordLimit) break;
							//}
							$rs->MoveNext();
						}
						$rs->close();
					}
					if ($RecordCountResult == 0) {
						$output["data"][] = '';	
					}
				}
				
				/*ORDER IF OBJECT IS COMBO (ON DECODED)	*/
				if (!IsNullOrEmptyString($ToOrderField)){
					$output["ordered"] = $ToOrderField;
					if ($conn->debug==1) echo("<b>ORDER IF OBJECT IS COMBO (ON DECODED)</b>" . BRCRLF .
												'ordeData' . $ToOrderData . BRCRLF .
												'ordeDir' . $ToOrderDirection . BRCRLF);
					$ToOrderData = object_clone($output["data"]);
					$output["ordreddir"]  =  $ToOrderDirection;
					$output["ordredfield"]  =  $ToOrderField;
					unset($output["data"]);
					//$dataToOrder = array_sort($ToOrderData, $ToOrderField, $ToOrderDirection);
					$dataToOrder = sortArrayByKey($ToOrderData, $ToOrderField,false,$ToOrderDirection);
					$output["data"] = $ToOrderData;
				}
				
				// misc 
				$output["total"] = $RecordCountResult;
				$output["success"] = true;
				$output["message"] = "success";
			}
			break;
			case 'TREE':{
				//sql di recupero dati
				//DAFARE max record da restituire con progressivo pagina
				//DAFARE Descrione campo filtro (non è detto che si chiami descrizione)
				//if ($datasourcetype == 'TABLE'){  $sql = 'SELECT a.* FROM (SELECT * FROM '. $datasource . ') a WHERE ROWNUM <= ' . $RecordLimit;	}
				//if ($datasourcetype == 'SELECT'){ $sql = 'SELECT a.* FROM ('. $datasource . ') a WHERE ROWNUM <= ' . $RecordLimit;	}
				
				//$conn->SetFetchMode(ADODB_FETCH_NUM);
				$conn->SetFetchMode(ADODB_FETCH_BOTH);
				//$conn->SetFetchMode(ADODB_FETCH_ASSOC);
				
				if (strrpos(" " . strtoupper($datasource),"SELECT") > 0){
					$sql = $datasource;
				}else{
					$sql = 'SELECT * FROM  ' . $datasource;
				}
				$datasourcetype = 'SELECT';
				$datasource = $sql;
				$sql = "SELECT * FROM (" . $sql .") a ";
				
				if ( (!IsNullOrEmptyString($datawhere)) && (IsNullOrEmptyString($combowhere)) ){
					if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datawhere:' . $datawhere . BRCRLF;
					$datawhereArray = explode('=', $datawhere);
					$datawhereParam = trim($datawhereArray[0]);
					$datawhereValue = trim($datawhereArray[1]);
					if ($datawhereParam != $ParentIdName){
						$sqlwhere[] = "(" .  $datawhere . ")";
					}
				}
				//COSTRUZIONE SQL
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:COSTRUZIONE SQL" . BRCRLF);
				if(count($sqlwhere)>0) {
					$sql = $sql . " WHERE " . implode (" AND ", $sqlwhere);
				}
				
				//LANCIO SQL
				if ($conn->debug==1) $output["messagedebugsql"] = $sql . BRCRLF;
				try { 
					$rs = $conn->SelectLimit($sql,1,-1);
				} catch (exception $e){ 
					$output["failure"] = true; 
					$output["success"] = false;
					$output["message"] = 'insert ' . $e->getMessage();
					$output = array_map('utf8_encode',$output);
					echo  Array2JSON($output);
					die();
				} 
				if (!$rs || $rs->EOF) {
					$RecordCountResult = 0;
					$ColumnCountResult = 0;
				}else{
					$RecordCountResult = $rs->RecordCount();
					$ColumnCountResult = $rs->FieldCount();
				}
				
				//definition field and columns
				for ($i = 0; $i < $ColumnCountResult; $i++) {
					$fld = $rs->FetchField($i);
					$name = $fld->name;
					$header = $fld->name;
					$fldType = $rs->MetaType($fld->type);
					$max_length = $fld->max_length;
					$rendered = '';
					$xtype = '';
					$flex = 1;
					$width = 70;
					$hiddenInGrid = false;
					$flexInGrid = '';
					$lockedInGrid = false;
					$editableInGrid = false;
					$renderInGridIcon = '';
					$renderInGridColor = '';
					$renderInGridButton = '';
					$renderInGridSummaryType = '';
					if ($conn->debug==1) echo("PREIMPOSTAZIONE COLONNE". BRCRLF);
					if ($LayoutEditorId != 0) {$hiddenInGrid = 'nd'; if ($conn->debug==1) echo("PREIMPOSTAZIONE A COLONNE TUTTE NASCOSTE". BRCRLF);}
					$filteroptions = '';		
					
					
					$fieldphptype = 'string';
					if     ($fldType == 'C') { $type = '';				$editortype = 'textfield';	$filtertype = 'string';	$formattype ='';		$formattypefilter = '';		$fieldtype = 'string';	$fieldphptype = 'string';	$width = 150;	$flex = 1;} //VCHR
					elseif ($fldType == 'X') { $type = '';				$editortype = 'textarea';	$filtertype = 'string';	$formattype ='';		$formattypefilter = '';		$fieldtype = 'string';	$fieldphptype = 'string';	$width = 600;	$flex = 2;} //CLOB
					elseif ($fldType == 'B') { $type = '';				$editortype = 'textarea';	$filtertype = 'string';	$formattype ='';		$formattypefilter = '';		$fieldtype = 'string';	$fieldphptype = 'string';	$width = 600;	$flex = 2;} //BLOB
					elseif ($fldType == 'I') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ='';		$formattypefilter = '';		$fieldtype = 'number';	$fieldphptype = 'int';		$width = 70;	$flex = 1;} //INT
					elseif ($fldType == 'N') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ='';		$formattypefilter = '';		$fieldtype = 'number';	$fieldphptype = 'float';	$width = 70;	$flex = 1;}	//NUM (DEC)
					elseif ($fldType == 'D') { $type = 'datecolumn';	$editortype = 'datefield';	$filtertype = 'date';	$formattype ='d-m-Y';	$formattypefilter = 'Y-m-d';$fieldtype = 'date';	$fieldphptype = 'string';	$width = 100;	$flex = 1;}	//DATE
					elseif ($fldType == 'L') { $type = 'checkcolumn';	$editortype = 'checkbox';	$filtertype = 'boolean';$formattype ='';		$formattypefilter = '';		$fieldtype = 'boolean';	$fieldphptype = 'string';	$width = 50;	$flex = 1;} //BIT
					elseif ($fldType == 'R') { $type = 'numbercolumn';	$editortype = 'numberfield';$filtertype = 'number';	$formattype ="000.00";	$formattypefilter = '';		$fieldtype = 'number';	$fieldphptype = 'int';		$width = 70;	$flex = 1;} //COUNT
					elseif ($fldType == 'T') { $type = '';				$editortype = 'textfield';	$filtertype = 'string';	$formattype ='';									$fieldtype = 'string';	$fieldphptype = 'string';	$width = 120;	$flex = 1;} //TIMESTAMP
					elseif ($fldType == 'S') { $type = 'timecolumn';	$editortype = 'timefield';	$filtertype = 'date';	$formattype ='H:i:s';	$formattypefilter = 'Y-m-d  H:i:s'; 	$fieldtype = 'time';	$fieldphptype = 'time';		$width = 120;	$flex = 1;} //TIME
					else					 { $type = '';				$editortype = 'textfield';	$filtertype = 'string';	$formattype ='';									$fieldtype = 'string';	$fieldphptype = 'string';	$width = 150;	$flex = 1;} //VCHR
					//if ($max_length > 1000) { $type = '';$editortype = 'textarea';	$filtertype = 'string'; $formattype ='';	$width = 600;	$flex = 2;}  //CLOB
					
					//if ($conn->debug==1) var_dump($fld);
					
					$column = array();
					$fields = array();
					$editor = array();
					
					$editor["xtype"] = $editortype;
					$editor["allowBlank"] = "true";
					if (!IsNullOrEmptyString($formattype)) 	$editor['format'] = $formattype ;
					
					//gestione foreign
					foreach($LayoutObjList as $sub) {
						if ($sub["datasourcefield"] == $name){
							$obj = ReturnOnObjectPropertyValue($LayoutEditorJson,"datasourcefield",$name);
							
							if (is_array($obj) && array_key_exists('fieldLabel', $obj)){ $header = $obj["fieldLabel"]; }
							
							if(($obj["xtype"] == "combobox") || ($obj["xtype"] == "dynamiccombo") || ($obj["xtype"] == "dynamictreecombo")){
								$xtype = $obj["xtype"];
								$editor = array();
								$editor = object_clone($obj);
								$editor["store"] = "DS_" . $name;
								$editor["name"] = $name;
								$editor["fieldLabel"] = '';
							}elseif ($obj["xtype"] == "dynamicimage"){
								$xtype = $obj["xtype"];
								$editor = array();
								$editor = object_clone($obj);
								$editor["name"] = $name;
								$editor["fieldLabel"] = '';
							}elseif ($obj["xtype"] == "numberfield"){
								if (is_array($obj) && (array_key_exists('decimalPrecision', $obj))){
									if ($obj['decimalPrecision'] == 0) $formattype ="0,000";
									if ($obj['decimalPrecision'] == 1) $formattype ="0,000.0";
									if ($obj['decimalPrecision'] == 2) $formattype ="0,000.00";
									if ($obj['decimalPrecision'] == 3) $formattype ="0,000.000";
									if ($obj['decimalPrecision'] == 4) $formattype ="0,000.0000";
								}
							}elseif($obj["xtype"] == "checkbox"){
								$type = 'checkcolumn';	$editortype = 'checkbox';	$filtertype = 'boolean';
								$formattype ='';		$formattypefilter = '';		$fieldtype = 'boolean';		$fieldphptype = 'string';
								$editor["xtype"] = $type;
							}
						}
					}
					
					
					//OVERRIDE GRID BY FORM LAYOUT
					//hidden in grid     editable in grid   flex in grid   ...
					foreach($LayoutObjList as $sub) {
						if ($sub["name"] == $name){
							$hiddenInGrid = false;
							$flexInGrid = '';
							$lockedInGrid = false;
							$renderInGridIcon = '';
							$renderInGridColor = '';
							$renderInGridButton = '';
							$renderInGridSummaryType = '';
							$obj = ReturnOnObjectPropertyValue($LayoutEditorJson,"name",$name);
							if ($obj != null){
								if (array_key_exists("hiddenInGrid", $obj)){
									if ($obj["hiddenInGrid"] === true) $hiddenInGrid = true;
									if ($obj["hiddenInGrid"] === false) $hiddenInGrid = false;
								}
								if (array_key_exists("flexInGrid", $obj)){
									$flexInGrid = $obj["flexInGrid"];
								}
								if (array_key_exists("lockedInGrid", $obj)){
									if ($obj["lockedInGrid"] === true) $lockedInGrid = true;
									if ($obj["lockedInGrid"] === false) $lockedInGrid = false;
								}
								if (array_key_exists("editableInGrid", $obj)){
									if ($obj["editableInGrid"] === true) $editableInGrid = true;
									if ($obj["editableInGrid"] === false) $editableInGrid = false;
								}
								if (array_key_exists("renderInGridIcon", $obj)){
									$renderInGridIcon = $obj["renderInGridIcon"];
								}
								if (array_key_exists("renderInGridColor", $obj)){
									$renderInGridColor = $obj["renderInGridColor"];
								}
								if (array_key_exists("renderInGridButton", $obj)){
									$renderInGridButton = $obj["renderInGridButton"];
								}
								if (array_key_exists("renderInGridSummaryType", $obj)){
									$renderInGridSummaryType = $obj["renderInGridSummaryType"];
								}
								
								//reset type 
								if(($obj["xtype"] == "combobox") || ($obj["xtype"] == "dynamiccombo") || ($obj["xtype"] == "dynamictreecombo")){
									if ($editableInGrid == false){
										//FieldDecoded
										$name = $name . 'decoded';
										$type = '';	$editortype = 'textfield';	$filtertype = 'list';	$formattype ='';	$width = 150;	$flex = 1;
										//list option
										if ($RecordCountResult = $RecordLimit ) $filtertype = 'string';
										 //options: ['extra small', 'small', 'medium', 'large', 'extra large']
										 //$filteroptions = getRows($conn, $editor["displayField"], $editor["datasource"], '1=1');
									}	
								}
								elseif($obj["xtype"] == "checkbox"){
									$type = 'checkcolumn';	$editortype = 'checkbox';	$filtertype = 'boolean';
									$formattype ='';		$formattypefilter = '';		$fieldtype = 'boolean';		$fieldphptype = 'string';
								}
							}
						}
					}
					
					
					$filter = array(
								"type" => $filtertype,  
								"dateFormat" => $formattypefilter,
								"record" => $RecordCountResult,
								//"options" => $filteroptions
							);
					$column = array(
								"dataIndex"=> $name,
								"xtype"=> $type,
								"header" => $header, 
								"hiddenInGrid" => $hiddenInGrid,
								"lock" => $lockedInGrid,
								"editableInGrid" => $editableInGrid,
								"renderInGridIcon" => $renderInGridIcon,
								"renderInGridColor" => $renderInGridColor,
								"renderInGridButton" => $renderInGridButton,
								"align" => (($type == 'numbercolumn') && ($formattype != '')) ?  'right':null,
								"summaryType" => $renderInGridSummaryType,
								//"summaryRenderer" => ($type == 'numbercolumn') ? "<source>function(value){return Ext.util.Format.currency(value,'',2,true);}</source>":null,
								//"renderer" => $type == 'numbercolumn' ? "<source>Ext.util.Format.numberRenderer('0.00')</source>" : null,
								"flex" => $flexInGrid != '' ? $flexInGrid : $flex,
								"format" => $formattype,
								"editor" => $editor, 
								"filter" => $filter,
							);
					$field = array(
								"name" => $name,
								"type"=>$fieldtype,
								"typephp"=>$fieldphptype,
								"dateFormat"=> $formattype,
								"xtype"=> $editortype 
							);
							
					$output["fields"][]= $field;
					$output["columns"][]= $column;
				}
				
				//data
				$RecordCountResult = 0;
				if ($modeldef === true){
					//nel caso si vuole solo le definizioni
					$output["metaData"]["rootProperty"]="columns"; 
				}else{
					//DATA + WHERE
					$result = array();
					if (!IsNullOrEmptyString($combowhere)){
						//filtra su descrizione
						if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " . 'WFVALUETREEGETALLFILTER WHERE';
						if ($conn->debug==1) echo('<b>TREE Strada</b>: combowhere ' . 'WFVALUETREEGETALLFILTER' . BRCRLF);
						$result = WFVALUETREEGETALLFILTER($sql, $ChildrenIdName, $ParentIdName, $displayField . " LIKE '%" . $combowhere . "%'");
						//var_dump($result);
						$result = WFARRAYTOHIERARCHY($result, $ChildrenIdName, $ParentIdName, 'data');
						//$onlydata = true;
						$output["data"] =  $result;
					}
					else if (!IsNullOrEmptyString($gridwhere)){
						//filtra su tutto
						if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " . 'WFVALUETREEGETALLFILTER FILTER';
						if ($conn->debug==1) echo('<b>TREE Strada</b>: filter ' . 'WFVALUETREEGETALLFILTER' . BRCRLF);
						//creo where di di ricerca
						//es: [{"property":"name","type":"string","operator":"like","value":"ammin"}]
						$appoggio = json_decode($gridwhere,true);
						foreach ($appoggio as $sub) {
							if ($sub["property"] != 'innerSearch'){
								//normalSearch
								if ($conn->debug==1) echo('NormalSearch');
								if (array_key_exists("type", $sub) == false) $sub["type"] = "string";
								if (array_key_exists("operator", $sub) == false) $sub["operator"] = "like";
								//if (property_exists($sub,"value") == false) $sub["value"] = "";
								if ($sub["type"] == "string"){
									if ($sub["operator"] == "like"){
										$sqlwhere = "( " .  $sub["property"] . " ". $sub["operator"] ." '%" . $sub["value"] . "%')";
									}else{
										$sqlwhere = "( " .  $sub["property"] . " ". $sub["operator"] ." '" . $sub["value"] . "')";
									}
								} else{
									$sqlwhere = "( " .  $sub["property"] . " ". $sub["operator"] ." " . $sub["value"] . ")";
								}
							} else {
								//InnerSearch
								if ($conn->debug==1) echo('InnerSearch');
								$rs = $conn->SelectLimit($sql,1,-1);
								$ColumnCountResult = $rs->FieldCount();
								$sqlAppo = array();
								for ($i=0; $i < $ColumnCountResult; $i++) {
									$fld = $rs->FetchField($i);
									$field = $fld->name;
									$sqlAppo[] =  "( " . $field . " like '%" . $sub["value"] . "%')";
								}
								$sqlwhere = "(" . implode (" OR ", $sqlAppo) . ")";
								$rs->close();
							}
						}
						
						if ($conn->debug==1){ echo('<b>sqlwhere</b>:'); var_dump($sqlwhere);  echo(BRCRLF);}
						
						$result = WFVALUETREEGETALLFILTER($sql,$ChildrenIdName, $ParentIdName, $sqlwhere);
						$result = WFARRAYTOHIERARCHY($result,$ChildrenIdName, $ParentIdName, 'data');
						//$onlydata = true;
						$output["data"] =  $result;
					}
					else if (!IsNullOrEmptyString($datawhere)){
						//cerca data la where = xxx
						$datawhereArray = explode('=', $datawhere);
						$datawhereParam = trim($datawhereArray[0]);
						$datawhereValue = trim($datawhereArray[1]);
						
						if ($conn->debug==1) echo('<b>TREE Strada</b>: datawhere ' . '' . BRCRLF);	
							
						if ($WayToExpand == 'down') {
							//down figli
							if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " .'WFVALUETREEGETCHILDREN' . 
																										" ParentIdName:" . $ParentIdName .
																										" ChildrenIdName:" . $ChildrenIdName .
																										" datawhere:" . $datawhere ;
							if ($datawhereParam == $ParentIdName){
								$result = WFVALUETREEGETCHILDREN($sql, $ChildrenIdName, $ParentIdName, $datawhereValue);
							}else{
								$result = WFVALUETREEGETROOT($sql, $ChildrenIdName, $ParentIdName);
							}
						}
						else if ($WayToExpand == 'mix') { 
							if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " . 'WFVALUETREEGETALLFILTER'. 
																										" ParentIdName:" . $ParentIdName .
																										" ChildrenIdName:" . $ChildrenIdName .
																										" datawhere:" . $datawhere ;
							//ovunque
							$result = WFVALUETREEGETALLFILTER($sql,$ChildrenIdName, $ParentIdName, $datasourcefield . " = " . $datawhereValue . "");
						}
						else {
							//up padri	
							if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " . 'WFVALUETREEGETPARENTS'. 
																										" ParentIdName:" . $ParentIdName .
																										" ChildrenIdName:" . $ChildrenIdName .
																										" datawhere:" . $datawhere ;
							$result = WFVALUETREEGETPARENTS($sql, $ChildrenIdName, $ParentIdName, $datawhereValue);
						}
						$result = WFARRAYTOHIERARCHY($result,$ChildrenIdName, $ParentIdName, 'data');
						//$onlydata = true;
						$output["data"] =  $result;
					}
					else if (!IsNullOrEmptyString($RootNode)){
						//Expand node
						if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " .'WFVALUETREEGETCHILDREN';
						if ($conn->debug==1) echo('<b>TREE Strada</b>: RootNode ' . 'WFVALUETREEGETCHILDREN' . BRCRLF);
						$result = WFVALUETREEGETCHILDREN($sql,$ChildrenIdName, $ParentIdName, $RootNode);
						$output["data"] =  $result;
					}
					else if (!IsNullOrEmptyString($ParentIdValue)){
						//dammi i figli da radice definita
						if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " . 'WFVALUETREEGETCHILDREN';
						if ($conn->debug==1) echo('<b>TREE Strada</b>: ParentIdValue ' . 'WFVALUETREEGETCHILDREN' . BRCRLF);
						$result = WFVALUETREEGETCHILDREN($sql, $ChildrenIdName, $ParentIdName, $ParentIdValue);	
						$output["data"] =  $result;
					}
					else {
						//cerca radice
						if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " WFVALUETREEGETROOT";
						$appo = WFVALUETREEGETROOT($sql, $ChildrenIdName, $ParentIdName);
						$result = object_clone($appo);
						$output["data"] =  $result;
					}
				}				
				
				/* DAFARE */
				/*GESTIONE FORZATURA CAST TYPE CAMPO*/
				/*
				$keys[$camponome] = $rs->fields[$camponome];
				settype($keys[$camponome], $output["fields"][$i]["typephp"]);
				
				*/
									
									
				// misc 
				$output["total"] = $RecordCountResult;
				$output["success"] = true;
				$output["message"] = "success";
			}
			break;
			case 'CSV':{
				// you can parse field values via your database schema
				$output["fields"][]=array("name"=>"ID","type"=>"string");
				$output["fields"][]=array("name"=>"DESCRIZIONE","type"=>"string");
				
				// you can parse column values via your database schema
				$output["columns"][]=array("dataIndex"=>"ID","header"=>"ID", "width"=>10, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"DESCRIZIONE", "header"=>"User Name", "width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				
				$datasource = str_replace(',',';',$datasource);
				$sourcecsv = CSV2Array($datasource,';');
				
				$RecordCountResult =0;
				foreach( $sourcecsv as $value ){
					$output["data"][]= array("ID"=> $value,"DESCRIZIONE" =>$value);
					$RecordCountResult++;
				}
				
				// the misc properties
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'PSV':{										
				// you can parse field values via your database schema
				$output["fields"][]=array("name"=>"ID","type"=>"string");
				$output["fields"][]=array("name"=>"DESCRIZIONE","type"=>"string");
				
				// you can parse column values via your database schema
				$output["columns"][]=array("dataIndex"=>"ID","header"=>"ID", "width"=>10, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"DESCRIZIONE", "header"=>"User Name", "width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				
				$sourcecsv = CSV2Array($datasource,'|');
				
				$RecordCountResult =0;
				foreach( $sourcecsv as $value ){
					$output["data"][]= array("ID"=> $value,"DESCRIZIONE" =>$value);
					$RecordCountResult++;
				}
				
				// the misc properties
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'CSV2':{										
				// you can parse field values via your database schema
				$output["fields"][] = array("name"=>"ID","type"=>"string");
				$output["fields"][] = array("name"=>"DESCRIZIONE","type"=>"string");
				
				// you can parse column values via your database schema
				$output["columns"][] = array("dataIndex"=>"ID","header"=>"ID", "width"=>10, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][] = array("dataIndex"=>"DESCRIZIONE", "header"=>"User Name", "width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				$datasource = str_replace(';',',',$datasource);
				$sourcecsv = CSV2Array($datasource,",");
				
				//var_dump($sourcecsv);
				
				$RecordCountResult = 0;
				$valueid = '';
				$valuenome = '';
				foreach( $sourcecsv as $value ){
					if ($valueid == '') {$valueid = $value; } else {$valuenome = $value;}
					if (!IsNullOrEmptyString($valueid) && !IsNullOrEmptyString($valuenome)){
						$output["data"][] = array("ID"=> $valueid,"DESCRIZIONE" =>$valuenome);
						$valueid = '';
						$valuenome = '';
						$RecordCountResult++;
					}
				}
				
				// the misc properties
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'PSV2':{										
				// you can parse field values via your database schema
				$output["fields"][]=array("name"=>"ID","type"=>"string");
				$output["fields"][]=array("name"=>"DESCRIZIONE","type"=>"string");
				
				// you can parse column values via your database schema
				$output["columns"][]=array("dataIndex"=>"ID","header"=>"ID", "width"=>10, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"DESCRIZIONE", "header"=>"User Name", "width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				
				$datasource = str_replace('|',',',$datasource);
				$sourcecsv = CSV2Array($datasource,"|");
				
				$RecordCountResult = 0;
				$valueid = '';
				$valuenome = '';
				foreach( $sourcecsv as $value ){
					if ($valueid == '') {$valueid = $value; } else {$valuenome = $value;}
					if (!IsNullOrEmptyString($valueid) && !IsNullOrEmptyString($valuenome)){
						$output["data"][] = array("ID"=> $valueid,"DESCRIZIONE" =>$valuenome);
						$valueid = '';
						$valuenome = '';
						$RecordCountResult++;
					}
				}
				
				// the misc properties
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'PROCEDURE':{
				if ($conn->debug==1) echo('PROC');
				//imposta sql di chiamata
				$sql =  "begin " . $datasource . " end;";
				$stmt = $conn->Prepare($sql); 
				$conn->InParameter($stmt,$UserId,'UserId');
				$conn->InParameter($stmt,$LayoutId,'LayoutId');
				$conn->InParameter($stmt,$RegistrationId,'RegistrationId');
				$conn->InParameter($stmt,$combowhere, 'combowhere');
				$conn->OutParameter($stmt,$result,'result', -1, OCI_B_CLOB);
				try {   
					if ($conn->debug==1) {
						$start_time = microtime(true); 
						$conn->Execute($stmt);
						echo 'Timer' . (microtime(true) - $start_time) . BRCRLF;
					}else{
						$conn->Execute($stmt);
					}
				} catch (exception $e){
					$output["failure"] = true; 
					$output["success"] = false;
					$output["message"] = 'update ' . $e->getMessage();
					echo  Array2JSON($output);
					die();
				}
				$appoggio = array();
				$appoggio = json_decode($result,true);
				if ($conn->debug==1) var_dump($data);
				
				//field and columns
				foreach($appoggio["fields"] as $sub) {
					$type = $sub["type"];
					$field = $sub["name"];
					$header = isnull($sub["header"],$sub["name"]);
					$editortype = 'textfield'; 
					$filtertype = 'string';
					if ($type == 'number') { $xtype = 'numbercolumn'; $editortype = 'textfield'; $filtertype = 'string'; $formattype =''; }
					//if ($type == 'date') { $xtype = 'datecolumn'; $editortype = 'datefield'; $filtertype = 'date'; $formattype ='n/j/Y'; }
					if ($type == 'date') { $xtype = 'datecolumn'; $editortype = 'datefield'; $filtertype = 'date'; $formattype =	'd-m-Y'; }
					if ($type == 'bool') { $xtype = 'checkcolumn'; $editortype = 'checkbox'; $filtertype = 'string'; $formattype =''; }
					if ($type == 'text') { $xtype = ''; $editortype = 'textfield'; $filtertype = 'string'; $formattype =''; }
					if (strrpos($field,'coll')!==false) $xtype = 'combobox';
					if (strrpos($field,'Coll')!==false) $xtype = 'combobox';
					
					//fields
					$output["fields"][]= array("name"=> $field,
												"type"=>$type
												);
					
					$hiddenfield = true;									
					if ((strrpos($field, "CT") === false) && (strrpos($field, "ID") === false)){
						$hiddenfield = false;
					}
					$fieldheader = '';
					$fieldheader = $field;
					
					//aggiorno nome campo
					foreach($appoggio["columns"] as $subB) {
						if ($subB["dataIndex"] == $field){
							$fieldheader =  $subB["header"] ;
							}
					}
					
					//columns
					$output["columns"][]=array("dataIndex"=>$field ,
												"header"=>$header  , 
												"text"=>$fieldheader  , 
												"format"=> $formattype ,
												"width"=>50, 
												"hidden"=>$hiddenfield,
												"xtype"=>$xtype,
												"editor"=>array("xtype"=>$type, 
																"allowBlank"=>"true"
																), 
												"filter"=>array("type"=>$filtertype)
												);
					
				}
				
				//data
				$RecordCountResult = 0;
				foreach($appoggio["data"] as $sub) {
					$output["data"][]=$sub;
					$RecordCountResult = $RecordCountResult +1;
				}
				
				// misc 
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'DIR':{
				// you can parse field values via your database schema
				$output["fields"][]=array("name"=>"DESCRIZIONE","type"=>"string");
				$output["fields"][]=array("name"=>"FILENAME","type"=>"string");
				$output["fields"][]=array("name"=>"EXT","type"=>"string");
				$output["fields"][]=array("name"=>"DATA","type"=>"date");
				
				$datasource = str_replace("\t", ' ', $datasource); // remove tabs
				$datasource = str_replace("\n", ' ', $datasource); // remove new lines
				$datasource = str_replace("\r", ' ', $datasource); // remove carriage returns
				$datasource = str_replace(";", '', $datasource); // remove carriage returns
			
				if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " Directory:" . $datasource  . BRCRLF;
				
				// you can parse column values via your database schema
				$output["columns"][]=array("dataIndex"=>"DESCRIZIONE","header"=>"Nome File","flex"=>2, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"FILENAME","header"=>"Nome File","flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"EXT","header"=>"Ext","flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"DATA","header"=>"Data","flex"=>1, "xtype"=>"datecolumn", "format"=>"d-m-Y", "editor"=>array("xtype"=>"datefield", "allowBlank"=> "false"), "filter"=>array('type'=>'date'));
				
				$RecordCountResult =0;
				if(is_dir($datasource)){
					if ($conn->debug==1) echo("<b>DIR</b>:OK" . BRCRLF);
					if($dh = opendir($datasource)){
						while(($file = readdir($dh)) != false){
							if($file == "." or $file == ".."){
							} else {
								$output["data"][]= array(
													"DESCRIZIONE"=>$file,
													"FILENAME"=>$file,
													"EXT"=>pathinfo($file, PATHINFO_EXTENSION),
													"DATA"=>date ("Y-m-d", filemtime($datasource . "\\" . $file)) ,
													);
								$RecordCountResult ++;
							}
						}
					}
				}else{
					$output["failure"] = true; 
					$output["success"] = false;
					$output["message"] = 'DIR NOT EXIST :' . $datasource ;
					echo Array2JSON($output);
					die();
				}
				
				// the misc properties
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'WF':{
				//sql di recupero dati
				$sql = "SELECT * 
						FROM  " . $ExtJSDevDB . "formvalues 
						WHERE CT_AAALAYOUT = " . $LayoutId . "
							AND NUMREG = " . $RegistrationId . " 
						ORDER BY ID DESC";	
				if ($conn->debug==1) echo('<b>sql</b>:' . $sql . BRCRLF);
				$rs = $conn->Execute($sql);
				$RecordCountResult = $rs->RecordCount();
				
				//field and columns
				while (!$rs->EOF) {
					$val   = $rs->fields['FIELDVALUE'];
					$field = $rs->fields['FIELDNAME'];					
					$type = 'textfield'; $editortype = 'textfield'; $filtertype = 'string'; $formattype ='';
					
					$output["fields"][]= array("name"=> $field,
												"type"=>$filtertype,
												"dateFormat"=> $formattype 
												);
					
					$output["columns"][]= array("dataIndex"=>$field ,
												"header"=>$field , 
												"format" =>$formattype,
												"width"=>10, 
												"editor"=>array("xtype"=>$editortype, 
																"allowBlank"=>"true",
																"format"=> $formattype 
																), 
												"filter"=>array("type"=>$filtertype)
												);
												
					$output["data"][0][$field] = iconv("ISO-8859-1", "UTF-8", $val);
					
					$rs->MoveNext();
					$RecordCountResult++;
				}
				$rs->close();
				
				// misc 
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'SCHEMA':{
				// you can parse field values via your database schema
				$output["fields"][]=array("name"=>"ID","type"=>"string");
				$output["fields"][]=array("name"=>"DESCNAME","type"=>"string");
				
				// you can parse column values via your database schema
				$output["columns"][]=array("dataIndex"=>"ID","header"=>"ID","width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"DESCNAME","header"=>"DESCNAME","width"=>20, "editor"=>array(), "filter"=>array('type'=>'string'));
				
				//sql di recupero dati
				if (($datasource == '') || ($datasource  == 'TABLE')){
					//TABLES
					if( is_array( $tables = $conn->MetaTables( 'TABLES' , '') ) ) {
						foreach( $tables as $table ) {
							$output["data"][]= array(	"ID"=> iconv("ISO-8859-1", "UTF-8", $table),
														"DESCNAME"=> iconv("ISO-8859-1", "UTF-8", $table),
														"TYPE"=> "table"
													);	
							$RecordCountResult++;
						}
					}
					//VIEWS
					if( is_array( $tables = $conn->MetaTables( 'VIEWS' , '') ) ) {	
						foreach( $tables as $table ) {
							$output["data"][]= array(	"ID"=> iconv("ISO-8859-1", "UTF-8", $table),
														"DESCNAME"=> iconv("ISO-8859-1", "UTF-8", $table),
														"TYPE"=> "view"
													);	
							$RecordCountResult++;
						}	
					}
				}else{
					//FIELD
					$datasource = str_replace("\t", ' ', $datasource); // remove tabs
					$datasource = str_replace("\n", ' ', $datasource); // remove new lines
					$datasource = str_replace("\r", ' ', $datasource); // remove carriage returns
					$datasource = str_replace(";", '', $datasource); // remove carriage returns
					if (strrpos(" " . strtoupper($datasource),"SELECT") > 0){
						$sql = $datasource;
					}else{
						$sql = 'SELECT * FROM  (' . $datasource . ')  ';
					}
					$rs = $conn->SelectLimit($sql,1,-1);
					$ColumnCountResult = $rs->FieldCount();
					for ($i = 0; $i < $ColumnCountResult; $i++) {
						$fld = $rs->FetchField($i);
						$name = $fld->name;
						$type = $rs->MetaType($fld->type);
						$output["data"][]= array(	"ID"=> iconv("ISO-8859-1", "UTF-8", $name),
													"DESCNAME"=> iconv("ISO-8859-1", "UTF-8", $name),
													"TYPE"=> $type
												);	
						$RecordCountResult++;
					}
				}
				
				$output["fields"][]= array("name"=> 'text',
											"type"=> 'string',
											"dateFormat"=> '' 
											);
				$output["fields"][]= array("name"=> 'type',
											"type"=> 'string',
											"dateFormat"=> '' 
											);
											
				$output["columns"][]= array("dataIndex"=>'text' ,
											"header"=>'text' , 
											"format" =>'',
											"width"=>10, 
											"editor" => array("xtype"=>'textfield', 
															"allowBlank"=>"true",
															"format"=> '' 
															), 
											"filter" => array("type"=>'string')
											);
				$output["columns"][]= array("dataIndex"=>'type' ,
											"header"=>'type' , 
											"format" =>'',
											"width"=>10, 
											"editor" => array("xtype"=>'textfield', 
															"allowBlank"=>"true",
															"format"=> '' 
															), 
											"filter" => array("type"=>'string')
											);
				// misc 
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";
			}
			break;
			case 'CODE':{
				WFSendLOG("DataRead", 'Eval (' . $datasource . ';);');
				if (!IsNullOrEmptyString($datasource)) {
					try {
						eval($datasource);
					} catch (Exception $e) {
						WFSendLOG("DataRead", "Error:" . get_class($e) . ', ' . $e->getMessage() . '.');
					}
				}
				
				//WHERE 
				$output['messagecode'] ='';
				if (!IsNullOrEmptyString($combowhere)){
					$output['messagecode'] = $output['messagecode'] . 'case a ';
					$combowhere = strtoupper($combowhere);
					$combowhere = str_replace("'","''",$combowhere);	
					//trova nome del secondo campo nella select
					//$NameFieldWhere = $ast->parsed["SELECT"][1]["no_quotes"];
					$NameFieldWhere = $displayField;
					if (strrpos($NameFieldWhere,".") > 0){
						$NameFieldWhere = explode("[.]",$NameFieldWhere)[1];	
					}
					$indexs = array($NameFieldWhere => $combowhere);
					$appo = clone($output["data"]);
					$output["data"] = getArrayElement($output["data"],$indexs);
				}
				if ((!IsNullOrEmptyString($datawhere)) && ($combowhere == '')){
					$output['messagecode'] = $output['messagecode'] . 'case b ';
					$pieces = explode("=", $datawhere);
					$indexs = array($pieces[0] => str_replace("'","",$pieces[1]));
					$output["data"] = getArrayElement($output["data"],$indexs);
				}
				// WHERE
				if (!IsNullOrEmptyString($gridwhere)){
					//[{"property":"name","type":"string","operator":"like","value":"admin"}]
					//[{"operator":"lt","value":"2016-01-21","property":"DataIns"}]
					$appoggio = json_decode($gridwhere,true);
					foreach ($appoggio as $sub) {
						//normalSearch
						if ($sub["property"] != 'innerSearch'){
							if ($conn->debug==1) echo('NormalSearch');
							if (array_key_exists("type",$sub) == false) $sub["type"] = "string";
							if ( strpos($sub["value"],'/') == true) $sub["type"] = "date";
							if (array_key_exists("operator",$sub) == false) $sub["operator"] = "like";
							if ( $sub["operator"] == 'lt') $sub["operator"] = "<=";
							if ( $sub["operator"] == 'gt') $sub["operator"] = ">=";
							if ( $sub["operator"] == 'eq') $sub["operator"] = "=";
							//if (array_key_exists("value",$sub) == false) $sub["value"] = "";
							if ($sub["type"] == "string"){
								if ($sub["operator"] == "like"){
									$result = ArraySearchByLike($output["data"],array($sub["property"] => $sub["value"]));
									unset($output["data"]);
									$output["data"] = $result ;
								}
								else{
									$result = ArraySearchByEqual($output["data"],array($sub["property"] => $sub["value"]));
									unset($output["data"]);
									$output["data"] = $result ;
								}
							} 
							elseif ($sub["type"] == "date"){
								$result = ArraySearchByEqual($output["data"],array($sub["property"] => $sub["value"]));
								unset($output["data"]);
								$output["data"] = $result ;
							}
							else{
								$result = ArraySearchByEqual($output["data"],array($sub["property"] => $sub["value"]));
								unset($output["data"]);
								$output["data"] = $result ;
							}
						}
						//InnerSearch
						else{
							$output['messagecode'] = $output['messagecode'] . 'e';
							if ($conn->debug==1) echo('InnerSearch');
							$result = ArraySearchByInner($output["data"],$sub["value"]);
							unset($output["data"]);
							$output["data"] = $result ;
						}
					}
				}
				
				//ORDER
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:ORDER" . BRCRLF);
				$ToOrderField = '';
				$ToOrderDirection = '';
				if (!IsNullOrEmptyString($gridorder)){
					//[{"property":"CT_ORDMOVIMENTI","direction":"ASC"}]
					$appoggio = json_decode($gridorder,true);
					if ($conn->debug==1) {echo("<b>gridorder</b>"); var_dump($appoggio); echo(BRCRLF);}
					foreach($appoggio as $sub) {
						$obj = ReturnOnObjectPropertyValue($LayoutEditorJson, "datasourcefield", $sub["property"]);
						if (($obj["xtype"] == 'combobox') || ($obj["xtype"] == "dynamiccombo")){
							$FieldCondition = $sub["name"];
							$ToOrderField = $FieldCondition;
							if ($sub["direction"] == 'DESC'){
								$ToOrderDirection = SORT_DESC;
							}else{
								$ToOrderDirection = SORT_ASC;
							}
							$FieldCondition = str_replace("decoded", "", $FieldCondition);
							$sqlorder[] =  $FieldCondition . " " . $sub["direction"];
						}else{
							$FieldCondition = $sub["property"];
							$ToOrderField = $FieldCondition;
							if ($sub["direction"] == 'DESC'){
								$ToOrderDirection = false;
							}else{
								$ToOrderDirection = true;
							}
							
							$FieldCondition = str_replace("decoded", "", $FieldCondition);
							$sqlorder[] =  $FieldCondition . " " . $sub["direction"];
						}
					}
				}
				
				//ORDER IF OBJECT IS COMBO (ON DECODED)
				if (!IsNullOrEmptyString($ToOrderField)){
					$output["ordered"] = $ToOrderField;
					if ($conn->debug==1) echo("<b>ORDER IF OBJECT IS COMBO (ON DECODED)</b>" . BRCRLF);
					$ToOrderData = object_clone($output["data"]);
					unset($output["data"]);
					//$dataToOrder = array_sort($ToOrderData, $ToOrderField, $ToOrderDirection);
					$dataToOrder = sortArrayByKey($ToOrderData, $ToOrderField,true,$ToOrderDirection);
					$output["data"] = $ToOrderData;
				}
				
				$RecordCountResult = 1;
				$output["total"] = $RecordCountResult;
			}
			break;
			case 'PROC' :{
				WFSendLOG("DataRead", 'Proc (' . $datasource . ';);');
				$sqlSTD = "SELECT " . $ExtJSDevDB  . "proc.ID, "         . $ExtJSDevDB . "proc.SOURCE
							FROM " . $ExtJSDevDB . "proc " ;
																	 
				$sqlOVER = "SELECT " . $ExtJSDevDB . "procoverride.ID, " . $ExtJSDevDB . "procoverride.SOURCE
							FROM " . $ExtJSDevDB . "procoverride ";
				if (is_numeric($datasource) == true){
					$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "proc.ID = " . $datasource;
					$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "procoverride.ID = " . $datasource; 
				} else {
					$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "proc.DESCNAME = '" . $datasource ."'";
					$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "procoverride.DESCNAME = '" . $datasource ."'"; 
				}
				$sql = $sqlOVER . " " . $sqlWhereOVER . " UNION " . $sqlSTD . " " . $sqlWhereSTD;
				
				$rs = $conn->Execute($sql);
				if ($rs != false) { 
					if ($rs->RecordCount() > 0) {
						$ProcessId = $rs->fields['ID']; 
						$Source = $rs->fields['SOURCE']; 
						if ($conn->debug==1) echo('$Source:' . $Source);
						$rs->close();
					}else{
						$output["failure"] = true;
						$output["success"] = false;
						$output["message"] = $output["message"] .  "ProcessId Not Exist!!!!";
						if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
						if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
						$Appo = Array2JSON($output, $debugmessage);
						header("Access-Control-Allow-Origin: *");
						header('Content-Type: application/json');
						echo $Appo;
						WFSendLOG("DataRead:","Error: ProcessId Not Exist STOP");	
						$conn->close();
						die();
					}
				}else{
					$output["failure"] = true;
					$output["success"] = false;
					$output["message"] = $output["message"] . "ProcessId Not coerente!!!!";
					if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
					if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
					$Appo = Array2JSON($output, $debugmessage);
					header("Access-Control-Allow-Origin: *");
					header('Content-Type: application/json');
					echo $Appo;
					WFSendLOG("DataRead:","Error: ProcessId Not coerente STOP");	
					$conn->close();
					die();
				}
				
				//EXECUTE CODE
				if (!IsNullOrEmptyString($Source)) {
					try {
						eval($Source);
					} catch (Exception $e) {
						WFSendLOG("DataRead", "Error:" . get_class($e) . ', ' . $e->getMessage() . '.');
					}
				}
				
				//WHERE 
				$output['messagecode'] ='';
				if (!IsNullOrEmptyString($combowhere)){
					$output['messagecode'] = $output['messagecode'] . 'case a ';
					$combowhere = strtoupper($combowhere);
					$combowhere = str_replace("'","''",$combowhere);	
					//trova nome del secondo campo nella select
					//$NameFieldWhere = $ast->parsed["SELECT"][1]["no_quotes"];
					$NameFieldWhere = $displayField;
					if (strrpos($NameFieldWhere,".") > 0){
						$NameFieldWhere = explode("[.]",$NameFieldWhere)[1];	
					}
					$indexs = array($NameFieldWhere => $combowhere);
					$appo = clone($output["data"]);
					$output["data"] = getArrayElement($output["data"],$indexs);
				}
				if ((!IsNullOrEmptyString($datawhere)) && ($combowhere == '')){
					$output['messagecode'] = $output['messagecode'] . 'case b ';
					$pieces = explode("=", $datawhere);
					$indexs = array($pieces[0] => str_replace("'","",$pieces[1]));
					$output["data"] = getArrayElement($output["data"],$indexs);
				}
				// WHERE
				if (!IsNullOrEmptyString($gridwhere)){
					//[{"property":"name","type":"string","operator":"like","value":"admin"}]
					//[{"operator":"lt","value":"2016-01-21","property":"DataIns"}]
					$appoggio = json_decode($gridwhere,true);
					foreach ($appoggio as $sub) {
						//normalSearch
						if ($sub["property"] != 'innerSearch'){
							if ($conn->debug==1) echo('NormalSearch');
							if (array_key_exists("type",$sub) == false) $sub["type"] = "string";
							if ( strpos($sub["value"],'/') == true) $sub["type"] = "date";
							if (array_key_exists("operator",$sub) == false) $sub["operator"] = "like";
							if ( $sub["operator"] == 'lt') $sub["operator"] = "<=";
							if ( $sub["operator"] == 'gt') $sub["operator"] = ">=";
							if ( $sub["operator"] == 'eq') $sub["operator"] = "=";
							//if (array_key_exists("value",$sub) == false) $sub["value"] = "";
							if ($sub["type"] == "string"){
								if ($sub["operator"] == "like"){
									$result = ArraySearchByLike($output["data"],array($sub["property"] => $sub["value"]));
									unset($output["data"]);
									$output["data"] = $result ;
								}
								else{
									$result = ArraySearchByEqual($output["data"],array($sub["property"] => $sub["value"]));
									unset($output["data"]);
									$output["data"] = $result ;
								}
							} 
							elseif ($sub["type"] == "date"){
								$result = ArraySearchByEqual($output["data"],array($sub["property"] => $sub["value"]));
								unset($output["data"]);
								$output["data"] = $result ;
							}
							else{
								$result = ArraySearchByEqual($output["data"],array($sub["property"] => $sub["value"]));
								unset($output["data"]);
								$output["data"] = $result ;
							}
						}
						//InnerSearch
						else{
							$output['messagecode'] = $output['messagecode'] . 'e';
							if ($conn->debug==1) echo('InnerSearch');
							$result = ArraySearchByInner($output["data"],$sub["value"]);
							unset($output["data"]);
							$output["data"] = $result ;
						}
					}
				}
				//ORDER
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:ORDER" . BRCRLF);
				$ToOrderField = '';
				$ToOrderDirection = '';
				if (!IsNullOrEmptyString($gridorder)){
					//[{"property":"CT_ORDMOVIMENTI","direction":"ASC"}]
					$appoggio = json_decode($gridorder,true);
					if ($conn->debug==1) {echo("<b>gridorder</b>"); var_dump($appoggio); echo(BRCRLF);}
					foreach($appoggio as $sub) {
						$obj = ReturnOnObjectPropertyValue($LayoutEditorJson, "datasourcefield", $sub["property"]);
						if (($obj["xtype"] == 'combobox') || ($obj["xtype"] == "dynamiccombo")){
							$FieldCondition = $sub["name"];
							$ToOrderField = $FieldCondition;
							if ($sub["direction"] == 'DESC'){
								$ToOrderDirection = SORT_DESC;
							}else{
								$ToOrderDirection = SORT_ASC;
							}
							$FieldCondition = str_replace("decoded", "", $FieldCondition);
							$sqlorder[] =  $FieldCondition . " " . $sub["direction"];
						}else{
							$FieldCondition = $sub["property"];
							$ToOrderField = $FieldCondition;
							if ($sub["direction"] == 'DESC'){
								$ToOrderDirection = false;
							}else{
								$ToOrderDirection = true;
							}
							
							$FieldCondition = str_replace("decoded", "", $FieldCondition);
							$sqlorder[] =  $FieldCondition . " " . $sub["direction"];
						}
					}
				}
				
				//ORDER IF OBJECT IS COMBO (ON DECODED)
				if (!IsNullOrEmptyString($ToOrderField)){
					$output["ordered"] = $ToOrderField;
					if ($conn->debug==1) echo("<b>ORDER IF OBJECT IS COMBO (ON DECODED)</b>" . BRCRLF);
					$ToOrderData = object_clone($output["data"]);
					unset($output["data"]);
					//$dataToOrder = array_sort($ToOrderData, $ToOrderField, $ToOrderDirection);
					$dataToOrder = sortArrayByKey($ToOrderData, $ToOrderField,true,$ToOrderDirection);
					$output["data"] = $ToOrderData;
				}
				
				$RecordCountResult = 1;
				$output["total"] = $RecordCountResult;
			}
			break;
			case 'GMAP':{
				//field
				$output["fields"][]=array("name"=>"lat","type"=>"string");
				$output["fields"][]=array("name"=>"lng","type"=>"string");
				$output["fields"][]=array("name"=>"title","type"=>"string");
				
				//column 
				$output["columns"][]=array("dataIndex"=>"lat",
											"header"=>"lat", 
											"text"=>"lat" ,
											"format"=>"" , 
											"hidden"=>false,
											"flex"=>1,
											"editor"=>array(), 
											"filter"=>array('type'=>'string')
											);
				$output["columns"][]=array("dataIndex"=>"lng",
											"header"=>"lng", 
											"text"=>"lng" , 
											"format"=>"" ,
											"hidden"=>false,
											"flex"=>1,
											"editor"=>array(), 
											"filter"=>array('type'=>'string')
											);
				$output["columns"][]=array("dataIndex"=>"geoCodeAddr",
											"header"=>"geoCodeAddr", 
											"text"=>"geoCodeAddr" , 
											"format"=>"" ,
											"hidden"=>false,
											"flex"=>1,
											"editor"=>array(), 
											"filter"=>array('type'=>'string')
											);
				$output["columns"][]=array("dataIndex"=>"title",
											"header"=>"title",
											"text"=>"title" , 
											"format"=>"" ,
											"hidden"=>false,
											"flex"=>1,
											"width"=>20, 
											"editor"=>array(), 
											"filter"=>array('type'=>'string')
											);
				//data
				$RecordCountResult = 2;
				$output["data"][]= array(
										"lat"=>42.339419,
										"lng"=>-71.09077,
										"title"=>"Northeastern University",
										);
				$output["data"][]= array(
										"lat"=>42.339641,
										"lng"=>-71.094224,
										"title"=>"Boston Museum of Fine Arts",
										);
				$output["data"][]= array(
										"geoCodeAddr"=>'4 Yawkey Way, Boston, MA, 02215-3409, USA',
										"title"=>"Boston Museum of Fine Arts",
										);
				//listeners: {click: function(e){Ext.Msg.alert('It\'s fine', 'and it\'s art.');}}
				// misc 
				$output["total"]=$RecordCountResult;
				$output["success"]=true;
				$output["message"]="success";

			}
			break;
			case 'GANTTTASK':{
				
				//$conn->SetFetchMode(ADODB_FETCH_NUM);
				//$conn->SetFetchMode(ADODB_FETCH_BOTH);
				$conn->SetFetchMode(ADODB_FETCH_ASSOC);
				
				if (strrpos(" " . strtoupper($datasource),"SELECT") > 0){
					$sql = $datasource;
				}else{
					$sql = 'SELECT * FROM  ' . $datasource;
				}
				$datasourcetype = 'SELECT';
				$datasource = $sql;
				$sql = "SELECT * FROM (" . $sql .") a ";
				if (!IsNullOrEmptyString($RootNode)){
					//Expand node
					if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " .'WFVALUETREEGETCHILDREN';
					if ($conn->debug==1) echo('<b>TREE Strada</b>: RootNode ' . 'WFVALUETREEGETCHILDREN' . BRCRLF);
					$result = WFVALUETREEGETCHILDREN($sql,$ChildrenIdName, $ParentIdName, $RootNode);
					//$output["data"] =  $result;
				}else{
					//Expand node
					if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . " " .'WFVALUETREEGETCHILDREN';
					if ($conn->debug==1) echo('<b>TREE Strada</b>: RootNode ' . 'WFVALUETREEGETCHILDREN' . BRCRLF);
					$result = WFVALUETREEGETCHILDRENS($sql,$ChildrenIdName, $ParentIdName, 0);
					//$output["data"] =  $result;
				}
				//VAR_DUMP($result );
				$result = WFARRAYTOCHILDRENSEQUENCE($result,$ChildrenIdName, $ParentIdName, 0);
				/*
				$keys['id'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['valueField']]);	
			//	$keys['calendarId'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['groupField']]);	
				$keys['title'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['displayField']]);
				$keys['endDate'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['endDateField']]);
				$keys['startDate'] = iconv("ISO-8859-1", "UTF-8", $rs->fields[$ObjJson['startDateField']]);
				durationField
				percentDoneField
				*/
				
				//$result["MPS_ID_PARENT"]=null;
				$RecordCountResult =1;
				$output["data"] =  $result;
				//$onlydata = true;	
						
				
				/*
					"Id": 1000,
					"StartDate": "2018-07-16",
					"EndDate": "2018-08-13",
					"Name": "Project A",
					"PercentDone": 43,
					"expanded": true,
					"children": [{
						"Id": 1,
						"Name": "Planning",
						"PercentDone": 60,
						"StartDate": "2018-07-21 11:50:00",
						"Duration": 10,
						"expanded": true,
						"Rollup": true,
				*/
			}
			break;
			case 'GANTTCALENDAR':{
				//sql di recupero dati
				//DAFARE max record da restituire con progressivo pagina
				//DAFARE Descrione campo filtro (non è detto che si chiami descrizione)
				//if ($datasourcetype == 'TABLE'){  $sql = 'SELECT a.* FROM (SELECT * FROM '. $datasource . ') a WHERE ROWNUM <= ' . $RecordLimit;	}
				//if ($datasourcetype == 'SELECT'){ $sql = 'SELECT a.* FROM ('. $datasource . ') a WHERE ROWNUM <= ' . $RecordLimit;	}
				
				//$conn->SetFetchMode(ADODB_FETCH_NUM);
				$conn->SetFetchMode(ADODB_FETCH_BOTH);
				//$conn->SetFetchMode(ADODB_FETCH_ASSOC);
				
				if (strrpos(" " . strtoupper($datasource),"SELECT") > 0){
					$sql = $datasource;
				}else{
					$sql = 'SELECT * FROM  ' . $datasource;
				}
				$datasourcetype = 'SELECT';
				$datasource = $sql;
				$sql = "SELECT * FROM (" . $sql .") a ";
				
				//LANCIO SQL
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:LANCIO SQL" . BRCRLF);
				try {   
					//$rs = $conn->Execute($sql);
					if ($conn->debug==1) {
						$start_time = microtime(true); 
						$rs = $conn->selectLimit($sql,$RecordLimit,$RecordStart);
						echo 'Timer' . (microtime(true) - $start_time) . BRCRLF;
					}else{
						$rs = $conn->selectLimit($sql,$RecordLimit,$RecordStart);
					}
				} catch (exception $e){
					$output["failure"] = true; 
					$output["success"] = false;
					$output["message"] = 'select ' . $e->getMessage();
					echo  Array2JSON($output);
					die();
				}
				$RecordCountResult = $rs->RecordCount();
				$ColumnCountResult = $rs->FieldCount();
				
			
				if ($rs){
					//campi della select 
					$keys = array();
					$RecordCountResult = $rs->RecordCount();
					$RecordReaded = 0;
					if ($RecordStart == -1) { $RecordStart = $RecordCountResult-1;}
					$Calendar = array();
					$CalendarRows = array();
					$OldResource = null;
					//estraggo i dati
					while ($RecordStart < $RecordCountResult){
						$rs->Move($RecordStart);
						if ($rs->fields['MPS_CT_RESOURCES'] != $OldResource){
							//data
							if ($OldResource != null) $output["data"][] = $Calendar;
							$Calendar = array();
							$Calendar['Id'] = $rs->fields[$ObjJson['calendarResourceKeyField']];
							$Calendar['Name'] = $rs->fields[$ObjJson['calendarResourceNameField']];
							$Calendar['DaysPerMonth'] = 20;
							$Calendar['DaysPerWeek'] = 5;
							$Calendar['HoursPerDay'] = 8;
							$Calendar['WeekendsAreWorkdays'] = false;
							$Calendar['WeekendFirstDay'] = 6;
							$Calendar['WeekendSecondDay'] = 0;
							$Calendar['DefaultAvailability'] = ["08:00-12:30", "14:00-17:30"];
							$Calendar['leaf'] = true;
							$Calendar['recordCount'] = $RecordStart;
							$Calendar['Days']['rows'] = array();
							
							$OldResource = $rs->fields['MPS_CT_RESOURCES'];
						}
		
						$keys['Id'] = $rs->fields[$ObjJson['calendarKeyField']];
						$keys['Date'] =  $rs->fields[$ObjJson['calendarDataField']];	
						$keys['Availability'] =  array($rs->fields[$ObjJson['calendarStartTimeField']] . '-' . $rs->fields[$ObjJson['calendarEndTimeField']]);
						$Calendar["Days"]["rows"][] =  $keys;	
						
						//record counter limit
						$RecordStart++;
						$RecordReaded++;
						if ($RecordLimit > 0) {
							if ($RecordReaded >= $RecordLimit) break;
						}
					}
					$rs->close();
					if ($Calendar != null) $output["data"][] = $Calendar;
				}

			}
			break;
			case 'GANTTRESOURCE':{
				//sql di recupero dati
				//DAFARE max record da restituire con progressivo pagina
				//DAFARE Descrione campo filtro (non è detto che si chiami descrizione)
				//if ($datasourcetype == 'TABLE'){  $sql = 'SELECT a.* FROM (SELECT * FROM '. $datasource . ') a WHERE ROWNUM <= ' . $RecordLimit;	}
				//if ($datasourcetype == 'SELECT'){ $sql = 'SELECT a.* FROM ('. $datasource . ') a WHERE ROWNUM <= ' . $RecordLimit;	}
				
				//$conn->SetFetchMode(ADODB_FETCH_NUM);
				$conn->SetFetchMode(ADODB_FETCH_BOTH);
				//$conn->SetFetchMode(ADODB_FETCH_ASSOC);
				
				if (strrpos(" " . strtoupper($datasource),"SELECT") > 0){
					$sql = $datasource;
				}else{
					$sql = 'SELECT * FROM  ' . $datasource;
				}
				$datasourcetype = 'SELECT';
				$datasource = $sql;
				$sql = "SELECT * FROM (" . $sql .") a ";
				
				//LANCIO SQL
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:LANCIO SQL" . BRCRLF);
				try {   
					//$rs = $conn->Execute($sql);
					if ($conn->debug==1) {
						$start_time = microtime(true); 
						$rs = $conn->selectLimit($sql,$RecordLimit,$RecordStart);
						echo 'Timer' . (microtime(true) - $start_time) . BRCRLF;
					}else{
						$rs = $conn->selectLimit($sql,$RecordLimit,$RecordStart);
					}
				} catch (exception $e){
					$output["failure"] = true; 
					$output["success"] = false;
					$output["message"] = 'select ' . $e->getMessage();
					echo  Array2JSON($output);
					die();
				}
				$RecordCountResult = $rs->RecordCount();
				$ColumnCountResult = $rs->FieldCount();
				

			
				if ($rs){
					//campi della select 
					$keys = array();
					$RecordCountResult = $rs->RecordCount();
					$RecordReaded = 0;
					if ($RecordStart == -1) { $RecordStart = $RecordCountResult-1;}
					$Calendar = array();
					$CalendarRows = array();
					$OldResource = null;
					//estraggo i dati
					while ($RecordStart < $RecordCountResult){
						$rs->Move($RecordStart);
						
						$keys['Id'] = $rs->fields['ID'];
						$keys['Name'] =  $rs->fields[$ObjJson['resourceNameField']];
						$keys['Bg'] =  "#58c0c7";
						$keys['TextColor'] =  "#fff";
						$keys['Icon'] =  $rs->fields['ICON']; // "fire"  "paint-brush" "scissors" "gear"
						$output["data"][] =  $keys;	
						
						//record counter limit
						$RecordStart++;
						$RecordReaded++;
						if ($RecordLimit > 0) {
							if ($RecordReaded >= $RecordLimit) break;
						}
					}
					$rs->close();
				}

			}
			break;
			case 'IMAP':{
				// you can parse field values via your database schema
				$output["fields"][]=array("name"=>"ID","type"=>"string");
				$output["fields"][]=array("name"=>"UID","type"=>"string");
				$output["fields"][]=array("name"=>"DATE","type"=>"date");
				$output["fields"][]=array("name"=>"SUBJECT","type"=>"string");
				$output["fields"][]=array("name"=>"FROM","type"=>"string");
				$output["fields"][]=array("name"=>"BODY","type"=>"string");
				
				// you can parse column values via your database schema
				$output["columns"][]=array("dataIndex"=>"ID","header"=>"ID","width"=>0, "format"=>"" , "hidden"=>true, "flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"UID","header"=>"ID","width"=>0, "format"=>"" , "hidden"=>true, "flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"DATE","header"=>"DATE","width"=>20, "format"=>"d-m-Y" , "hidden"=>false, "flex"=>1, "xtype"=>"datecolumn", "editor"=>array("xtype"=>"datefield", "allowBlank"=> "false"), "filter"=>array('type'=>'date'));
				$output["columns"][]=array("dataIndex"=>"SUBJECT","header"=>"SUBJECT","width"=>20,  "format"=>"" , "hidden"=>false, "flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"FROM","header"=>"FROM", "format"=>"" , "hidden"=>false, "flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"BODY","header"=>"BODY","width"=>20, "format"=>"" , "hidden"=>false, "flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				
				//IMPORT FROM IMAP
				set_time_limit(3000); 
				
				require_once '../PHPImap/Mailbox.php';
				require_once '../PHPImap/IncomingMail.php';
				require_once '../PHPImap/rfc822_addresses.php';
				require_once '../PHPImap/mime_parser.php';
				//https://github.com/barbushin/php-imap
				$imaplogin = ''; $imappassword = ''; $imapserver = ''; $imapfolder = 'INBOX'; $imapport = '143'; $imapsecure = '/imap/tls/novalidate-cert'; $emailSender = ''; $emailObject = ''; $attachFilter = '';
				
				if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL START' . microtime_float() . CRLF, FILE_APPEND);
				
				$mailbox = array();
				if ($UserId  != '0'){
					$sql = "SELECT * FROM " . $ExtJSDevDB . "user WHERE ID = " . $UserId;
					$rs = $conn->Execute($sql);
					if ($rs !== false) {
						if ($rs->fields['EMAILIMAP'] . '' != '') {$imapserver = $rs->fields['EMAILIMAP'];}
						if ($rs->fields['EMAILIMAPPORT'] . '' != '') {$imapport =  $rs->fields['EMAILIMAPPORT'];}
						if ($rs->fields['EMAILIMAPSECURE'] . '' != '') {$imapsecure = $rs->fields['EMAILIMAPSECURE'];}
						if ($rs->fields['EMAILUSER'] . '' != '') {$imaplogin = $rs->fields['EMAILUSER'];}
						if ($rs->fields['EMAILPWD'] . '' != '') {$imappassword = $rs->fields['EMAILPWD'];}
						$rs->close();
					}
					if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL USER DB' . microtime_float() . CRLF, FILE_APPEND);
				}
				
				
				if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' imapserver:' . $imapserver . BRCRLF;
				if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' imaplogin:' . $imaplogin . BRCRLF;
				try {
					$mailbox = new PhpImap\Mailbox('{'. $imapserver . ':' . $imapport  .$imapsecure .'}' . $imapfolder , $imaplogin, $imappassword, $ExtJSDevTMP);
					
					// Read all messaged into an array:
					//imap_sort($imap, SORTDATE, 1);
					//$mailsIds = $mailbox->searchMailbox('ALL');
				} catch (exception $e){
					WFRaiseError(0, $e->getMessage(), 'WFAlignMail', '');
				}
				
				if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL CONNECTED SRV' . microtime_float() . CRLF, FILE_APPEND);
				
				//WHERE 
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:WHERE" . BRCRLF);
				if (!IsNullOrEmptyString($datawhere)){
					if (strpos ($datawhere, 'D=' ) > 0){
						$uid = explode('=', $datawhere)[1];
						$uid = str_replace("'",'',$uid);
						$mail = $mailbox->getMail($uid);
						$mailHeader = $mailbox->getMailHeader($uid);
						$output["data"][] = array(
							"ID"=> $mailsIds[$i] ,
							"UID"=> $mailHeader->messageId ,
							"DATE"=> $mailHeader->receiveddatetime->format('Y-m-d H:i:00'),
							"SUBJECT"=> $mailHeader->subject ,
							"FROM"=> $mailHeader->fromAddress ,
							"BODY"=> $mail->textHtml
						);
						$mailsIds = null;
					}else{
						$datawhere = str_replace("'",'"',$datawhere);
						$datawhere = str_replace("=", " ", $datawhere);
						$datawhere = str_replace("=", " ", $datawhere);
						if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' datawhere:' . $datawhere . BRCRLF;
					
						if ($conn->debug==1) echo("<b>BOOKMARK</b>:WHERE" . $datawhere . BRCRLF);
						$mailsIds = $mailbox->searchMailbox($datawhere, SE_UID);
						if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL searchMailbox' . microtime_float() . CRLF, FILE_APPEND);
					}
				}else{
					//ORDER 
					$mailsIds = $mailbox->sortMails( SORTARRIVAL, true, 'ALL');
					if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL ORDER' . microtime_float() . CRLF, FILE_APPEND);
				}
				
				if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL START RETRIVE' . microtime_float() . CRLF, FILE_APPEND);
				$RecordCountResult = 0;
				if($mailsIds) {
					for ($i =0; $i < count($mailsIds); $i++) {
						if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL RSATRT' . $i . ' ' . microtime_float() . CRLF, FILE_APPEND);
						$mail = $mailbox->getMail($mailsIds[$i]);
						if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL RGET' . $i . ' ' . microtime_float() . CRLF, FILE_APPEND);
						$mailHeader = $mailbox->getMailHeader($mailsIds[$i]);
						if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL RGETH' . $i . ' ' . microtime_float() . CRLF, FILE_APPEND);
						$output["data"][] = array(
							"ID"=> $mailsIds[$i] ,
							"UID"=> $mailHeader->messageId ,
							"DATE"=> $mailHeader->receiveddatetime->format('Y-m-d H:i:00'),
							"SUBJECT"=> $mailHeader->subject ,
							"FROM"=> $mailHeader->fromAddress ,
							"BODY"=> substr($mail->textPlain, 0, 200)
						);
						$RecordCountResult++;
						if ($RecordCountResult > $RecordLimit){
							break;
						}
						if ($RecordCountResult > 50){
							break;
						}
						if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataRead.txt", ' EMAIL RETRIVE' . $i . ' ' . microtime_float() . CRLF, FILE_APPEND);
					}
				}
				
				// the misc properties
				$output["total"] = $RecordCountResult;
				$output["success"]=true;
			}
			break;
			case 'IMAPAATACH':{
				// you can parse field values via your database schema
				$output["fields"][]=array("name"=>"IMAPATTACHNAME","type"=>"string");
				$output["fields"][]=array("name"=>"IMAPATTACH","type"=>"string");
				$output["fields"][]=array("name"=>"IMAPATTACHEXT","type"=>"string");
				
				// you can parse column values via your database schema
				$output["columns"][]=array("dataIndex"=>"IMAPATTACHNAME","header"=>"SUBJECT","width"=>20,  "format"=>"" , "hidden"=>false, "flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"IMAPATTACH","header"=>"FROM", "format"=>"" , "hidden"=>false, "flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
				$output["columns"][]=array("dataIndex"=>"IMAPATTACHEXT","header"=>"FROM", "format"=>"" , "hidden"=>false, "flex"=>1, "editor"=>array(), "filter"=>array('type'=>'string'));
						
				//IMPORT FROM IMAP
				set_time_limit(3000); 
				
				require_once '../PHPImap/Mailbox.php';
				require_once '../PHPImap/IncomingMail.php';
				require_once '../PHPImap/rfc822_addresses.php';
				require_once '../PHPImap/mime_parser.php';
				//https://github.com/barbushin/php-imap
				$imaplogin = ''; $imappassword = ''; $imapserver = ''; $imapfolder = 'INBOX'; $imapport = '143'; $imapsecure = '/imap/tls/novalidate-cert'; $emailSender = ''; $emailObject = ''; $attachFilter = '';
				
				$mailbox = array();
				if ($UserId  != '0'){
					$sql = "SELECT * FROM " . $ExtJSDevDB . "user WHERE ID = " . $UserId;
					$rs = $conn->Execute($sql);
					if ($rs !== false) {
						if ($rs->fields['EMAILIMAP'] . '' != '') {$imapserver = $rs->fields['EMAILIMAP'];}
						if ($rs->fields['EMAILIMAPPORT'] . '' != '') {$imapport =  $rs->fields['EMAILIMAPPORT'];}
						if ($rs->fields['EMAILIMAPSECURE'] . '' != '') {$imapsecure = $rs->fields['EMAILIMAPSECURE'];}
						if ($rs->fields['EMAILUSER'] . '' != '') {$imaplogin = $rs->fields['EMAILUSER'];}
						if ($rs->fields['EMAILPWD'] . '' != '') {$imappassword = $rs->fields['EMAILPWD'];}
						$rs->close();
					}
				}
				
				if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' imapserver:' . $imapserver . BRCRLF;
				if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . ' imaplogin:' . $imaplogin . BRCRLF;
				try {
					$mailbox = new PhpImap\Mailbox('{'. $imapserver . ':' . $imapport  .$imapsecure .'}' . $imapfolder , $imaplogin, $imappassword, $ExtJSDevTMP);
					
					// Read all messaged into an array:
					//imap_sort($imap, SORTDATE, 1);
					//$mailsIds = $mailbox->searchMailbox('ALL');
				} catch (exception $e){
					WFRaiseError(0, $e->getMessage(), 'WFAlignMail', '');
				}
				
				$mail = $mailbox->getMail($uid);
				$mailHeader = $mailbox->getMailHeader($uid);
				$mailAttachs = $mail->getAttachments();
				
				//WHERE 
				if ($conn->debug==1) echo("<b>BOOKMARK</b>:WHERE" . BRCRLF);
				if (!IsNullOrEmptyString($datawhere)){
					if (strpos ($datawhere, 'IMAPATTACHNAME=' ) > 0){
						$NameFile = explode('=', $datawhere)[1];
						$uid = str_replace("'",'',$uid);
						foreach ($mailAttachs as $mailAttach) {
							$mailAttachExt = strtolower(WFFileExt($mailAttach->name));
							$output["data"][] = array(
														"IMAPATTACHNAME"=>  WFFileName($mailAttach->name) . '.' . $mailAttachExt ,
														"IMAPATTACH"=>  WFFileName($mailAttach->filePath) . '.' . $mailAttachExt ,
														"IMAPATTACHEXT"=> $mailAttachExt
													);
						}
					}
				}else{
					foreach ($mailAttachs as $mailAttach) {
						$mailAttachExt = strtolower(WFFileExt($mailAttach->name));
						$output["data"][] = array(
													"IMAPATTACHNAME"=>  WFFileName($mailAttach->name) . '.' . $mailAttachExt ,
													"IMAPATTACH"=>  WFFileName($mailAttach->filePath) . '.' . $mailAttachExt ,
													"IMAPATTACHEXT"=> $mailAttachExt
												);
					}
				}
				// the misc properties
				$output["total"] = $RecordCountResult;
				$output["success"]=true;
			}
			break;
		}
	}
	
	//preparazione della risposta in base al servizio richiedente (solo dati o solo inserimento)
	if ($onlydata == true){
		if ($conn->debug!=1) header('Content-Type: application/json');
		if (isset($output["data"])){
			$output = object_clone($output["data"]);
			if ($RecordCountResult == 0){
				$output = array();
			}
		}else{
			$output = array();
		}
	}
	
	//restituzione del datasource al browser
	if($debugmessage) file_put_contents($ExtJSDevLOG . "DataRead.txt", 'FORMAT DATA' . microtime_float() . CRLF, FILE_APPEND);
	$Appo = '';
	
	//inversione
	if ($pivot == true){
		if ($conn->debug!=1) header('Content-Type: application/json');
		if (isset($output["data"])){
			
			//data
			$column = 1;
			$record = $output["data"][0];
			foreach ($output["fields"] as &$value) {
				$datapivot[] = array(	'ID' => $value["name"], 
										'GRUPPOA' => explode("_", $value["name"])[0], 
										'GRUPPOB' => explode("_", $value["name"])[0] . "_" . explode("_", $value["name"])[1], 
										'CAMPO' => $value["name"], 
										'VALORE' => $record[$value["name"]] );
				$column++;
			}
			$output["total"] = $column;
			$output["data"] = array();
			$output["data"] = $datapivot;
			
			//field
			$output["fields"] = array();
			$output["fields"][]=array("name"=>"ID","type"=>"string");
			$output["fields"][]=array("name"=>"GRUPPOA","type"=>"string");
			$output["fields"][]=array("name"=>"GRUPPOB","type"=>"string");
			$output["fields"][]=array("name"=>"CAMPO","type"=>"string");
			$output["fields"][]=array("name"=>"VALORE","type"=>"string");
			
			//column
			$output["columns"] = array();				
			$output["columns"][]=array("dataIndex"=>"ID",
										"header"=>"ID",  
										"text"=>"ID"  , 
										"format"=>"" ,
										"hidden"=>false,
										"flex"=>1,
										"width"=>10, 
										"editor"=>array(), 
										"filter"=>array('type'=>'number'),
										"exportStyle"=>array('format'=>'number')
										);
			$output["columns"][]=array("dataIndex"=>"GRUPPOA",
										"header"=>"GRUPPOA",
										"text"=>"GRUPPOA" , 
										"format"=>"" ,
										"hidden"=>false,
										"flex"=>1,
										"width"=>20, 
										"editor"=>array(), 
										"filter"=>array('type'=>'string'),
										"exportStyle"=>array('format'=>'string')
										);
			$output["columns"][]=array("dataIndex"=>"GRUPPOB",
										"header"=>"GRUPPOB",
										"text"=>"GRUPPOB" , 
										"format"=>"" ,
										"hidden"=>false,
										"flex"=>1,
										"width"=>20, 
										"editor"=>array(), 
										"filter"=>array('type'=>'string'),
										"exportStyle"=>array('format'=>'string')
										);
			$output["columns"][]=array("dataIndex"=>"CAMPO",
										"header"=>"CAMPO",
										"text"=>"CAMPO" , 
										"format"=>"" ,
										"hidden"=>false,
										"flex"=>1,
										"width"=>20, 
										"editor"=>array(), 
										"filter"=>array('type'=>'string'),
										"exportStyle"=>array('format'=>'string')
										);
			$output["columns"][]=array("dataIndex"=>"VALORE",
										"header"=>"VALORE",
										"text"=>"VALORE" , 
										"format"=>"" ,
										"hidden"=>false,
										"flex"=>1,
										"width"=>20, 
										"editor"=>array(), 
										"filter"=>array('type'=>'string'),
										"exportStyle"=>array('format'=>'string')
										);
											
		}
	}

	
	if ($formatOutput == 'HTML'){
		$Appo = Array2HTML($output["data"]);
	}
	elseif ($formatOutput == 'HTMLR'){
		$Appo = Array2HTMLRotate($output["data"]);
	}
	elseif ($formatOutput == 'XML'){
		if ($conn->debug!=1) {
			header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/xml');
			header('Content-Disposition: attachment;filename="export.xml"');
		}
		$Appo = Array2XML($output["data"]);
	}
	elseif ($formatOutput == 'JSON'){
		if ($conn->debug!=1) {
			header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/json');
		}
		$Appo = Array2JSON($output, $debugmessage);
	}
	elseif ($formatOutput == 'JSONP'){
		if ($conn->debug!=1) {
			header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/json');
		}
		$Appo = '{"odata.metadata" : "", "value" : '. Array2JSON($output, $debugmessage) . "}";
	}
	elseif ($formatOutput == 'CSV'){
		if ($conn->debug!=1) {
			header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/text');
			$now = gmdate("D, d M Y H:i:s");
			header("Last-Modified: {$now} GMT");
			header('Content-Disposition: attachment;filename="export.csv"');
		}
		$Appo = Array2CSV($output["data"],";");
	}
	elseif (($formatOutput == 'XLS') || ($formatOutput == 'XLSX')){
		if ($conn->debug!=1) {
			header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			header('Content-Disposition: attachment;filename="export.xlsx"');
		}
		$Appo = Array2XLS($output["data"]);
	}
	elseif ($formatOutput == 'ICAL'){
		if ($conn->debug!=1) {
			header("Access-Control-Allow-Origin: *");
			header('Content-Type:  text/csv; text/calendar');
			header('Content-Disposition: attachment;filename="ilMioCalendario.ics"');
		}
		$Appo = Array2ICS($output["data"]);
	}
	else{
		if ($conn->debug!=1){
			header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/json');
		}
		$Appo = Array2JSON($output, $debugmessage);
	}
	
	
	$Appo = str_replace("'true'", "true", $Appo);
	$Appo = str_replace('"true"', "true", $Appo);
	echo $Appo;
	
	WFSendLOG("DataRead:","STOP");
	if($debugmessage) file_put_contents($ExtJSDevLOG . "DataRead.txt", 'STOP' . microtime_float() . CRLF, FILE_APPEND);
	$conn->close();
?>
