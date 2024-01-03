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
	
	WFSendLOG("LayoutRead:","START");

	$LAYOUTJSON = "";
	$DATASOURCE = "";
	$DATASOURCETYPE = "";
	$DATASOURCEFIELD = "";
	$VIEWTYPE = "";

	$LayoutId = 0;
	$LayoutId = isset($_POST["layoutid"]) ? $_POST["layoutid"] : $LayoutId;
	$LayoutId = isset($_GET["layoutid"]) ? $_GET["layoutid"] : $LayoutId;
	if ($LayoutId == '') $LayoutId = 0;
	
	//passo param indietro
	if (($LayoutId != '') && ($LayoutId != '0')){
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
		$Layoutrs = $conn->Execute($sql);
		if ($Layoutrs !== false) {
			$output["total"] = 1;
			$output["success"] = true;
			
			$LayoutId = $Layoutrs->fields["ID"];
			
			$VIEWTYPE = $Layoutrs->fields["VIEWTYPE"];
			//$VIEWTYPE = ExecFuncInStringSQL($VIEWTYPE);
			
			$LAYOUTJSON = $Layoutrs->fields["LAYOUTJSON"];
			if ($LAYOUTJSON == '') $LAYOUTJSON = '[]';
			//$LAYOUTJSON = str_replace("combobox", "dynamiccombobox", $LAYOUTJSON);
						
			$DATASOURCE = $Layoutrs->fields["DATASOURCE"];	
			//$DATASOURCE = ExecFuncInStringSQL($DATASOURCE);

			$DATASOURCETYPE =  $Layoutrs->fields["DATASOURCETYPE"];
			//$DATASOURCETYPE = ExecFuncInStringSQL($DATASOURCETYPE);
			
			$DATASOURCEFIELD = $Layoutrs->fields["DATASOURCEFIELD"];
			//$DATASOURCEFIELD = ExecFuncInStringSQL($DATASOURCEFIELD);
			
			$VIEWTYPE = $Layoutrs->fields["VIEWTYPE"];
			//$VIEWTYPE = ExecFuncInStringSQL($VIEWTYPE);

			$output["data"][] = array( 	"id" => $Layoutrs->fields["ID"],
										"name" => $Layoutrs->fields["DESCNAME"],
										"datasource" => $DATASOURCE,
										"datasourcetype" => $DATASOURCETYPE,
										"datasourcefield" => $DATASOURCEFIELD,				
										"datasourcedbname" => $Layoutrs->fields["DATASOURCEDBNAME"],						
										"parentidname" => $Layoutrs->fields["PARENTIDNAME"],	
										"parentidstart" => $Layoutrs->fields["PARENTIDSTART"],
										"childrenidname" => $Layoutrs->fields["CHILDRENIDNAME"],	
										"displayfield" => $Layoutrs->fields["DISPLAYFIELD"],	
										"requirevalidation" => ($Layoutrs->fields["VALIDATEJSON"] != '' ? true : false),
										"actioncolumn" => ($Layoutrs->fields["ACTIONCOLUMN"] == null ? 0 : $Layoutrs->fields["ACTIONCOLUMN"]),
										"actiontruefalsecolumn" => ($Layoutrs->fields["ACTIONTRUEFALSECOLUMN"] == null ? 0 : $Layoutrs->fields["ACTIONTRUEFALSECOLUMN"]),
										"checkcolumn" =>  ($Layoutrs->fields["CHECKCOLUMN"] == null ? 0 : $Layoutrs->fields["CHECKCOLUMN"]),
										//"layoutjson" => json_decode($LAYOUTJSON,true),
										"layoutjson" => ($VIEWTYPE == 'label' ? $LAYOUTJSON :  json_decode($LAYOUTJSON,true)),
										"layoutskin" => $Layoutrs->fields["LAYOUTSKIN"],
										"autoupdate" => $Layoutrs->fields["AUTOUPDATE"],
										"recordbar" => $Layoutrs->fields["RECORDBAR"],
										"actionsave" => ($Layoutrs->fields["ACTIONSAVE"] == null ? 0 : $Layoutrs->fields["ACTIONSAVE"]),
										"viewtype" => $VIEWTYPE,
										"windowmode" => $Layoutrs->fields["WINDOWMODE"],
										"columnwidthsplit" => $Layoutrs->fields["COLUMNWIDTH"],
										"groupfield" => $Layoutrs->fields["GROUPFIELD"],
										"remote" => ($Layoutrs->fields["DATASOURCEREMOTE"] == 0 ? false : true),
										"aggregate" => $Layoutrs->fields["AGGREGATEJSON"],
										"leftaxis" => $Layoutrs->fields["LEFTAXISJSON"],
										"topaxis" => $Layoutrs->fields["TOPAXISJSON"],
										"printertemplate" => $Layoutrs->fields["PRINTERTEMPLATE"]
										);
			$Layoutrs->close();
		} else {
			$output["total"]=0;
			$output["failure"]=true;
		}
	}else {
		$output["total"]=0;
		$output["failure"]=true;
	}
	
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>