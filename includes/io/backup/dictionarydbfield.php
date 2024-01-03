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
	
	WFSendLOG("DictionaryDB:","START");

	$id = null;
	$type  = "textfield";
	$max_length = 0;
	$max_lengthtext = "";
	$min_length = 0;
	$min_lengthtext = "";
	$objdatasourcefield = '';
	$objdisplayfield = '';
	$objvaluefield = '';	
	$objdatasource = '' ;
	$objdatasourcetype = '';
	
	$datasourcetype = '';
	$datasourcetype = isset($_POST["datasourcetype"]) ? $_POST["datasourcetype"] : $datasourcetype;
	$datasourcetype = isset($_GET["datasourcetype"]) ? $_GET["datasourcetype"] : $datasourcetype;
	
	$datasource = '';
	$datasource = isset($_POST["datasource"]) ? $_POST["datasource"] : $datasource;
	$datasource = isset($_GET["datasource"]) ? $_GET["datasource"] : $datasource;
	
	$datasourcefield = 'ID';
	
	$datasourcedbname = '';
	$datasourcedbname = isset($_POST["datasourcedbname"]) ? $_POST["datasourcedbname"] : $datasourcedbname;
	$datasourcedbname = isset($_GET["datasourcedbname"]) ? $_GET["datasourcedbname"] : $datasourcedbname;
	
	$objname = '';
	$objname = isset($_POST["objname"]) ? $_POST["objname"] : $objname;
	$objname = isset($_GET["objname"]) ? $_GET["objname"] : $objname;
	
	//definition for tree
	$ParentIdName = "ID_PARENT";
	$ParentIdStart = "";
	$ChildrenIdName = "ID";
	
	//parameters
	$RecordCountResult = 0;
	$ColumnCountResult = 0;
	$fields = array();
	$indexes = array();
	
	//Recupero layout 
	//Definizione datasource e datasourcetype e datasourcedbname
	$LayoutJson = array();
	$LayoutObjList = array();
	if (!IsNullOrEmptyString($LayoutId)){
		//$LAYOUT OVERRIDE
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
			$JsonAppo = $rs->fields['LAYOUTJSON']; 
			$LayoutJson = json_decode($JsonAppo,true);
			$FormName = $rs->fields['DESCNAME'];
			if ($datasource == '') $datasource = $rs->fields['DATASOURCE'];
			if ($datasourcefield == '') $datasourcefield = $rs->fields['DATASOURCEFIELD'];
			if ($datasourcetype == '') $datasourcetype = $rs->fields['DATASOURCETYPE'];
			if ($datasourcedbname == '') $datasourcedbname = $rs->fields['DATASOURCEDBNAME'];
			if ($rs->fields['CHILDRENIDNAME'] != '') $ChildrenIdName = $rs->fields['CHILDRENIDNAME']; 
			if ($rs->fields['PARENTIDNAME'] != '') $ParentIdName = $rs->fields['PARENTIDNAME']; 
			if ($rs->fields['DISPLAYFIELD'] != '') $displayField = $rs->fields['DISPLAYFIELD']; 
			if ($rs->fields['PARENTIDSTART'] != '') $ParentIdStart = $rs->fields['PARENTIDSTART']; 
			$rs->close();
			$CollectObjList = array();
			CollectOnObjectPropertyExist($LayoutJson,'datasourcefield');
			//HA SOLO IL NOME MANCANO IL RESTO DEGLI OGGETTI
			$LayoutObjList = object_clone($CollectObjList);
		}
	}
	
	//Recupero oggetto nella form  
	//Definizione datasource e datasourcetype
	$ObjJson = array();
	if (!IsNullOrEmptyString($objname) && IsNumericID($LayoutId)) {
		$ObjJson = ReturnOnObjectPropertyValue($LayoutJson,'name',$objname);
		if ($objname != 'Form00') $LayoutObjList = array();
		if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'LayoutId' . $LayoutId . "<br>\r\n";
			
		if ($conn->debug==1) echo('<b>obj->name</b>:' . $objname . "<br>\r\n");
		//if ($conn->debug==1) var_dump($ObjJson);
		
		if (isset($ObjJson["displayField"])		|| property_exists($ObjJson,"displayField")) {
			if ($conn->debug==1) echo('<b>obj->displayField</b>:' . $displayField . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["displayField"])) $displayField = $ObjJson["displayField"];
		}
		if (isset($ObjJson["valueField"])		|| property_exists($ObjJson,"valueField")) {
			if ($conn->debug==1) echo('<b>obj->valueField</b>:' . $valueField . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["valueField"])) $valueField = $ObjJson["valueField"];
		}
		if (isset($ObjJson["layouteditorid"])	|| property_exists($ObjJson,"layouteditorid")) {
			if ($conn->debug==1) echo('<b>obj->LayoutEditorId</b>:' . $LayoutEditorId . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["layouteditorid"])) $LayoutEditorId = $ObjJson["layouteditorid"];
		}
		if (isset($ObjJson["keyField"])			|| property_exists($ObjJson,"keyField")) {
			if ($conn->debug==1) echo('<b>obj->keyField</b>:' . $keyField . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["keyField"])) $keyField = $ObjJson["keyField"];
		}
		if (isset($ObjJson["datasourcefield"])	|| property_exists($ObjJson,"datasourcefield")) {
			if ($conn->debug==1) echo('<b>obj->datasourcefield</b>:' . $datasourcefield . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["datasourcefield"])) $datasourcefield = $ObjJson["datasourcefield"];
		}
		if (isset($ObjJson["datasource"])		|| property_exists($ObjJson,"datasource")) {
			if ($conn->debug==1) echo('<b>obj->datasource</b>:' . $datasource . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["datasource"])) $datasource = $ObjJson["datasource"];
		}
		if (isset($ObjJson["datasourcetype"])	|| property_exists($ObjJson,"datasourcetype")) {
			if ($conn->debug==1) echo('<b>obj->datasourcetype</b>:' . $datasource . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["datasourcetype"])) $datasourcetype = $ObjJson["datasourcetype"];
		}
		if (isset($ObjJson["datasourcedbname"]) || property_exists($ObjJson,"datasourcedbname")) {
			if ($conn->debug==1) echo('<b>obj->datasourcedbname</b>:' . $datasourcedbname . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["datasourcedbname"])) $datasourcedbname = $ObjJson["datasourcedbname"];
		}
		if (isset($ObjJson["parentidname"]) || property_exists($ObjJson,"parentidname")) {
			if ($conn->debug==1) echo('<b>obj->ParentIdName</b>:' . $ParentIdName . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["parentidname"])) $ParentIdName = $ObjJson["parentidname"];
		}
		if (isset($ObjJson["childrenidname"]) || property_exists($ObjJson,"childrenidname")) {
			if ($conn->debug==1) echo('<b>obj->ChildrenIdName</b>:' . $ChildrenIdName . "<br>\r\n");
			if (!IsNullOrEmptyString($ObjJson["childrenidname"])) $ChildrenIdName = $ObjJson["childrenidname"];
		}
	}
	
	//override se passati
	$ParentIdName = isset($_POST["parentidname"]) 	? $_POST["parentidname"] : $ParentIdName;
	$ParentIdName = isset($_GET["parentidname"]) 	? $_GET["parentidname"]  : $ParentIdName;
	
	$ParentIdValue = $ParentIdStart;
	$ParentIdValue = isset($_POST["node"]) 	? $_POST["node"] : $ParentIdValue;
	$ParentIdValue = isset($_GET["node"]) 	? $_GET["node"] : $ParentIdValue;
	$ParentIdValue = isset($_POST[$ParentIdName]) 	? $_POST[$ParentIdName] : $ParentIdValue;
	$ParentIdValue = isset($_GET[$ParentIdName]) 	? $_GET[$ParentIdName] : $ParentIdValue;
	if ($ParentIdValue == '') $ParentIdValue  = $ParentIdStart;
	if ($ParentIdValue == 'root') $ParentIdValue  = $ParentIdStart;
	if ($ParentIdValue == '0') $ParentIdValue  = $ParentIdStart;

	$ChildrenIdName = isset($_POST["childrenidname"]) ? $_POST["childrenidname"] : $ChildrenIdName;
	$ChildrenIdName = isset($_GET["childrenidname"])  ? $_GET["childrenidname"]  : $ChildrenIdName;
	
	//compilo la datasource con funzioni in parametri 
	if ($datasourcetype != 'CODE'){
	if ($conn->debug==1) echo('<b>datasource</b>:' . $datasource . "<br>\r\n");
		$datasource = ExecFuncInStringSQL($datasource);
		if ((Left($datasource, 1) == '"') && (Right($datasource, 1) == '"')) $datasource = Mid($datasource,1,Len($datasource)-2);
		if ((Left($datasource, 1) == "'") && (Right($datasource, 1) == "'")) $datasource = Mid($datasource,1,Len($datasource)-2);
		if ($conn->debug==1) echo('<b>datasource</b>:' . $datasource . "<br><br>\r\n");
	} 
	
	if ($conn->debug==1) echo('<b>ParentIdName</b>:' . $ParentIdName . "<br>\r\n");
	$ParentIdName = ExecFuncInStringSQL($ParentIdName);
	if ((Left($ParentIdName, 1) == '"') && (Right($ParentIdName, 1) == '"')) $ParentIdName = Mid($ParentIdName,1,Len($ParentIdName)-2);
	if ((Left($ParentIdName, 1) == "'") && (Right($ParentIdName, 1) == "'")) $ParentIdName = Mid($ParentIdName,1,Len($ParentIdName)-2);
	if ($conn->debug==1) echo('<b>ParentIdName</b>:' . $ParentIdName . "<br><br>\r\n");
	
	if ($conn->debug==1) echo('<b>ChildrenIdName</b>:' . $ChildrenIdName . "<br>\r\n");
	$ChildrenIdName = ExecFuncInStringSQL($ChildrenIdName);
	if ((Left($ChildrenIdName, 1) == '"') && (Right($ChildrenIdName, 1) == '"')) $ChildrenIdName = Mid($ChildrenIdName,1,Len($ChildrenIdName)-2);
	if ((Left($ChildrenIdName, 1) == "'") && (Right($ChildrenIdName, 1) == "'")) $ChildrenIdName = Mid($ChildrenIdName,1,Len($ChildrenIdName)-2);
	if ($conn->debug==1) echo('<b>ChildrenIdName</b>:' . $ChildrenIdName . "<br><br>\r\n");
	
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasourcetype:' . $datasourcetype . "<br>\r\n";
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasource:' . $datasource . "<br>\r\n";
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasourcedbnamedef:' . $dbname . "<br>\r\n";
	if($debugmessage) $output["messagedebug"] = $output["messagedebug"] . 'datasourcedbname:' . $datasourcedbname . "<br>\r\n";
	
	//CONNECTION
	if (!IsNullOrEmptyString($datasourcedbname)) {
		WFSQLCONNECT($datasourcedbname);
	}
	
	//Esecuzione datasource in base al datasourcetype
	if ($conn->debug==1) echo('<b>datasourcetype</b>:' . $datasourcetype . "<br>\r\n");
	if ($datasource != ''){
	switch ($datasourcetype) {
		case '':{
			}
			break;
		case 'ESEMPIO':{
			$output[]= array(	
				"objname"=> 'ID',
				"objfieldLabel"=>'ID',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> null,
				"objmaxLengthText"=> "",
				"objminLength"=> null,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'ID',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'ID',
				"text"=>  'ID',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			$output[]= array(	
				"objname"=> 'DESCRIZIONE',
				"objfieldLabel"=>'DESCRIZIONE',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> null,
				"objmaxLengthText"=> "",
				"objminLength"=> null,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'DESCRIZIONE',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'DESCRIZIONE',
				"text"=>  'DESCRIZIONE',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			}
			break;
		case 'MESI':{
			$output[]= array(	
				"objname"=> 'ID',
				"objfieldLabel"=>'ID',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> null,
				"objmaxLengthText"=> "",
				"objminLength"=> null,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'ID',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'ID',
				"text"=>  'ID',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			$output[]= array(	
				"objname"=> 'DESCRIZIONE',
				"objfieldLabel"=>'DESCRIZIONE',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> null,
				"objmaxLengthText"=> "",
				"objminLength"=> null,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'DESCRIZIONE',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'DESCRIZIONE',
				"text"=>  'DESCRIZIONE',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			}
			break;
		case 'TREE' :
		case 'TABLE' :
		case 'SELECT':{
			$datasource = str_replace("\t", ' ', $datasource); // remove tabs
			$datasource = str_replace("\n", ' ', $datasource); // remove new lines
			$datasource = str_replace("\r", ' ', $datasource); // remove carriage returns
			$datasource = str_replace(";", '', $datasource); // remove carriage returns
			
			if (strrpos(" " . strtoupper($datasource),"SELECT") > 0){
				$sql = $datasource;
			}else{
				$sql = 'SELECT * FROM  ' . $datasource;
			}
			
			//LANCIO SQL
			//$rs = $conn->Execute( $sql);
			$rs = $conn->SelectLimit($sql,1,-1);
			
			//field and columns
			$ColumnCountResult = $rs->FieldCount();
			for ($i = 0; $i < $ColumnCountResult; $i++) {
				$max_length = '';
				$max_lengthtext = '';
				$min_length = '';
				$min_lengthtext = '';
				$objdatasourcefield = '';
				$objdisplayfield = '';
				$objvaluefield = '';	
				$objdatasourcedbname = '' ;
				$objdatasource = '' ;
				$objdatasourcetype = '';
				$objparentidname  = '';
				$objchildrenidname  = '';
				$objlayouteditorid = '';
				$tabname = '';
				$rendered = '';
				$xtype = '';	
				$decimal = '';
				$editable = '';
				
				$fld = $rs->FetchField($i);
				$name = $fld->name;
				$type = $rs->MetaType($fld->type);
				$max_length = $fld->max_length;
				$objdatasourcefield = $fld->name;
				if ($type == 'C') { 
					if ($max_length > 1000) { 
						$type = 'textarea';$editortype = 'textarea';	$filtertype = 'string'; $formattype =''; $width = 600; $max_length = '';  //VCHR - CLOB
					}else{
						$type = 'textfield';	$editortype = 'textfield';	$filtertype = 'string'; $formattype =''; $width = 150;   //VCHR
					}
				}
				elseif ($type == 'X') { $type = 'textarea';		$editortype = 'textarea';	$filtertype = 'string'; $formattype =''; $width = 600; $max_length = ''; }  //CLOB
				elseif ($type == 'B') { $type = 'textarea';		$editortype = 'textarea';	$filtertype = 'string'; $formattype =''; $width = 600; $max_length = ''; }  //BLOB
				
				elseif ($type == 'L') { $type = 'checkbox';		$editortype = 'checkbox';	$filtertype = 'string'; $formattype =''; $width = 50; $max_length = '';}   //BIT
				
				elseif ($type == 'I') { $type = 'numberfield';	$editortype = 'numberfield';	$filtertype = 'number'; $formattype =''; $width = 70; $max_length = '';}   //INT
				elseif ($type == 'N') { $type = 'numberfield';		$editortype = 'numberfield';	$filtertype = 'number'; $formattype =''; $width = 70; $max_length = ''; $decimal = 2;}   //NUM (DEC)
				elseif ($type == 'R') { $type = 'numberfield';	$editortype = 'numberfield';	$filtertype = 'number'; $formattype =''; $width = 70; $max_length = ''; $editable = false;}   //COUNT
				
				elseif ($type == 'D') { $type = 'datefield';	$editortype = 'datefield';	$filtertype = 'date';   $formattype ='Y-m-d'; $width = 100; $max_length = '';} //DATE
				
				elseif ($type == 'T') { $type = 'textfield';	$editortype = 'textfield';	$filtertype = 'string'; $formattype =''; $width = 120; $max_length = '';}  //TIMESTAMP

				if ($conn->debug==1) var_dump($fld);
				
				if (stripos($fld->name,'CT_') !== false) { $type = 'combobox'; $tabname = explode("_", $fld->name); $tabname = strtolower($tabname[count($tabname)-1]);}
				
				//test table name
				if( is_array( $tables = $conn->MetaTables( 'TABLES' , '') ) ) {
					$tableexist = false;
					foreach( $tables as $table ) {
						if ($table == $tabname) {$tableexist = true; break;}
					}
					if ($tableexist == false){
						$tabname = 'ang' . $tabname;
						foreach( $tables as $table ) {
							if ($table == $tabname) {$tableexist = true; break;}
						}
					}
				}
				
				//find definition of combo
				if ($type == 'combobox') {
					$objvaluefield = 'ID';
					$objdisplayfield = 'DESCRIZIONE';
					$objdatasourcetype = 'ESEMPIO';
					$objdatasource = 'ESEMPIO' ;
					$fieldsForeign = array();
					$indexesForeign = array();
					if (($tabname != '') && ($tableexist == true)){
						$fieldsForeign = $conn->MetaColumns( $tabname );
						if ($conn->debug==1) var_dump($fieldsForeign);
						$indexesForeign = $conn->MetaIndexes( $tabname );
						$objdatasourcetype = 'SELECT';
					}
					//cerca nella tabella il primo campo descrizione
					if( is_array( $fieldsForeign )  && ($tableexist == true)) {
						$k = 0;
						$objdisplayfield = '';
						foreach( $fieldsForeign as $detailsForeign ) {
							if ($k == 0) $objvaluefield = $detailsForeign->name;
							if ((stripos($detailsForeign->name,'DES') !== false)                             ) $objdisplayfield = $detailsForeign->name;
							if ((stripos($detailsForeign->name,'TEX') !== false) && ($objdisplayfield  == '')) $objdisplayfield = $detailsForeign->name;
							if ((stripos($detailsForeign->name,'NAM') !== false) && ($objdisplayfield  == '')) $objdisplayfield = $detailsForeign->name; 
							if ($objdisplayfield  != '') break;
							$k=$k+1;
						}
						if ($objdisplayfield == '') $objdisplayfield = 'DESCRIZIONE';
						$objdatasource = 'SELECT ' . $tabname . '.' . $objvaluefield. ',' . $tabname . '.' . $objdisplayfield .' FROM ' . $tabname;
					}
				}
				if ($fld->name == 'ID') $editable =false;
				
				//genera field
				if ($max_length != '') $max_lengthtext = 'Lunghezza Massima Superata';
				if ($min_length != '') $min_lengthtext = 'Lunghezza Minima';
				if ($max_length == '0') $max_length = '';
				
				$aaaFieldDef = WFVALUEDLOOKUP('*',$ExtJSDevDB . "fieldef ","FIELDNAME = '" . $fld->name . "'");
				if ($aaaFieldDef){
					$type = $aaaFieldDef['XTYPE'];
					$objdefinitionjson = $aaaFieldDef['DEFINITIONJSON'];
					$objdatasource = $aaaFieldDef['DATASOURCE'];
					$objdatasourcetype = $aaaFieldDef['DATASOURCETYPE'];
					$objdatasourcefield = $aaaFieldDef['DATASOURCEFIELD'];
					$objvaluefield = $aaaFieldDef['VALUEFIELD'];
					$objdisplayfield = $aaaFieldDef['DISPLAYFIELD'];
					$objparentidname = $aaaFieldDef['PARENTIDNAME'];
					$objchildrenidname = $aaaFieldDef['CHILDRENIDNAME'];
					$objlayouteditorid = $aaaFieldDef['LAYOUTEDITORID'];
					$objdatasourcedbname = $aaaFieldDef['DATASOURCEDBNAME'];
				}
				
				$output[]= array(	
									"objname"=> $fld->name,
									"objfieldLabel"=>$fld->name,
									"objxtype"=> $type,
									"objregex"=> "",
									"objeditable" => $editable,
									"objdecimalPrecision"=> $decimal,
									"objmaxLength"=> $max_length,
									"objmaxLengthText"=> $max_lengthtext,
									"objminLength"=> $min_length,
									"objminLengthText"=> $min_lengthtext,
									"objinputType"=> "",
									"objdatasourcedbname"=> $objdatasourcedbname,
									"objdatasource"=> $objdatasource,
									"objdatasourcetype"=> $objdatasourcetype,
									"objdatasourcefield"=> $objdatasourcefield,
									"objvalueField"=> $objvaluefield,
									"objdisplayField"=> $objdisplayfield,
									"objparentidname"=> $objparentidname,
									"objchildrenidname"=> $objchildrenidname,
									"objlayouteditorid"=> $objlayouteditorid,
									"objonclick"=> "",
									"id"=> $fld->name,
									"text"=>  $fld->name,
									"cls"=> $type,
									"leaf"=> true,
									"draggable"=> true,
								);
			}
			
		}
			break;
		case 'CSV':{
			$output[]= array(	
				"objname"=> 'ID',
				"objfieldLabel"=>'ID',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'ID',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'ID',
				"text"=>  'ID',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			}
			break;
		case 'PSV':{
			$output[]= array(	
				"objname"=> 'ID',
				"objfieldLabel"=>'ID',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'ID',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'ID',
				"text"=>  'ID',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			}
			break;
		case 'CSV2':{
			$output[]= array(	
				"objname"=> 'ID',
				"objfieldLabel"=>'ID',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'ID',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'ID',
				"text"=>  'ID',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			$output[]= array(	
				"objname"=> 'DESCRIZIONE',
				"objfieldLabel"=>'DESCRIZIONE',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'DESCRIZIONE',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'DESCRIZIONE',
				"text"=>  'DESCRIZIONE',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
				
			}
			break;
		case 'PSV2':{
			$output[]= array(	
				"objname"=> 'ID',
				"objfieldLabel"=>'ID',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'ID',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'ID',
				"text"=>  'ID',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			$output[]= array(	
				"objname"=> 'DESCRIZIONE',
				"objfieldLabel"=>'DESCRIZIONE',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'DESCRIZIONE',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'DESCRIZIONE',
				"text"=>  'DESCRIZIONE',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			}
			break;
		case 'PROC':{
			if ($conn->debug==1) echo('PROC');
			//imposta sql di chiamata
			$sql =  "begin " . $datasource . " end;";
			$stmt = $conn->Prepare($sql); 
			$conn->InParameter($stmt,$UserId,'UserId');
			$conn->InParameter($stmt,$LayoutId,'LayoutId');
			$conn->InParameter($stmt,$RegistrationId,'RegistrationId');
			$conn->InParameter($stmt,$combowhere, 'combowhere');
			$conn->OutParameter($stmt,$result,'result',400000);
			$conn->Execute($stmt);
			$appoggio = array();
			$appoggio = json_decode($result,true);
			if ($conn->debug==1) var_dump($data);
			
			//field and columns
			foreach($appoggio["fields"] as $sub) {
				$type = $sub["type"];
				$field = $sub["name"];
				$editortype = 'textfield'; 
				$filtertype = 'string';
				if ($type == 'number') { $xtype = 'numbercolumn'; $editortype = 'textfield'; $filtertype = 'string'; $formattype =''; }
				//if ($type == 'date') { $xtype = 'datecolumn'; $editortype = 'datefield'; $filtertype = 'date'; $formattype ='n/j/Y'; }
				if ($type == 'date') { $xtype = 'datecolumn'; $editortype = 'datefield'; $filtertype = 'date'; $formattype =	'd-m-Y'; }
				if ($type == 'bool') { $xtype = 'checkcolumn'; $editortype = 'checkbox'; $filtertype = 'string'; $formattype =''; }
				if ($type == 'text') { $xtype = ''; $editortype = 'textfield'; $filtertype = 'string'; $formattype =''; }
				if (strrpos($field,'coll')!==false) $xtype = 'combobox';
				if (strrpos($field,'Coll')!==false) $xtype = 'combobox';
				
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
				
				$output[]= array(	
					"objname"=> $fieldheader,
					"objfieldLabel"=>$fieldheader,
					"objxtype"=> $xtype,
					"objregex"=> "",
					"objmaxLength"=> 0,
					"objmaxLengthText"=> "",
					"objminLength"=> 0,
					"objminLengthText"=> "",
					"objinputType"=> "",
					"objdatasource"=> "",
					"objdatasourcetype"=> "",
					"objdatasourcefield"=> "",
					"objvalueField"=> "",
					"objdisplayField"=> "",
					"objonclick"=> "",
					"id"=> $fieldheader,
					"text"=>  $fieldheader,
					"cls"=> $xtype,
					"leaf"=> true,
					"draggable"=> true,
					);
			}	
		}
			break;
		case 'DIR':{
			$output[]= array(	
				"objname"=> 'NOMEFILE',
				"objfieldLabel"=>'NOMEFILE',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'NOMEFILE',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'NOMEFILE',
				"text"=>  'NOMEFILE',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			$output[]= array(	
				"objname"=> 'TIPOLOGIA',
				"objfieldLabel"=>'TIPOLOGIA',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'TIPOLOGIA',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'TIPOLOGIA',
				"text"=>  'TIPOLOGIA',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			$output[]= array(	
				"objname"=> 'DATA',
				"objfieldLabel"=>'DATA',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'DATA',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'DATA',
				"text"=>  'DATA',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
		}
			break;
		case 'WF':{
			//sql di recupero dati
			$sql = 'SELECT * FROM  " . $ExtJSDevDB . "formvalues WHERE NUMREG = ' . $RegistrationId . ' ORDER BY ID DESC';	
			$rs = $conn->Execute($sql);
			$RecordCountResult = $rs->RecordCount();
			
			//field and columns
			while (!$rs->EOF) {
				$val   = $rs->fields['FIELDVALUE'];
				$field = $rs->fields['FIELDNAME'];					
				$type = 'textfield'; $editortype = 'textfield'; $filtertype = 'string'; $formattype ='';
				
				$output[]= array(	
					"objname"=> $field,
					"objfieldLabel"=>$field,
					"objxtype"=> $filtertype,
					"objregex"=> "",
					"objmaxLength"=> 0,
					"objmaxLengthText"=> "",
					"objminLength"=> 0,
					"objminLengthText"=> "",
					"objinputType"=> "",
					"objdatasource"=> "",
					"objdatasourcetype"=> "",
					"objdatasourcefield"=> "",
					"objvalueField"=> "",
					"objdisplayField"=> "",
					"objonclick"=> "",
					"id"=> $field,
					"text"=>  $field,
					"cls"=> $filtertype,
					"leaf"=> true,
					"draggable"=> true,
					);
					
				$rs->MoveNext();
				$RecordCountResult++;
			}
			$rs->close();
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
		}
			break;
		case 'GMAP':{
			$output[]= array(	
				"objname"=> 'lat',
				"objfieldLabel"=>'lat',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'lat',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'lat',
				"text"=>  'lat',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			$output[]= array(	
				"objname"=> 'lng',
				"objfieldLabel"=>'lng',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'lng',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'lng',
				"text"=>  'lng',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			$output[]= array(	
				"objname"=> 'title',
				"objfieldLabel"=>'title',
				"objxtype"=> 'textfield',
				"objregex"=> "",
				"objmaxLength"=> 0,
				"objmaxLengthText"=> "",
				"objminLength"=> 0,
				"objminLengthText"=> "",
				"objinputType"=> "",
				"objdatasource"=> "",
				"objdatasourcetype"=> "",
				"objdatasourcefield"=> 'title',
				"objvalueField"=> "",
				"objdisplayField"=> "",
				"objonclick"=> "",
				"id"=> 'title',
				"text"=>  'title',
				"cls"=> 'textfield',
				"leaf"=> true,
				"draggable"=> true,
				);
			}
			break;
	}
	}
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>