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
	
	if (($LayoutId != '') && ($LayoutId != '0')){

		//$LAYOUT OVERRIDE
		$sqlSTD = "SELECT " . $ExtJSDevDB . "layout.*
					FROM " . $ExtJSDevDB . "layout " ;
															 
		$sqlOVER = "SELECT " . $ExtJSDevDB . "layoutoverride.*
					FROM " . $ExtJSDevDB . "layoutoverride ";
		if (is_numeric($LayoutId) == true){
			$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layout.ID = " . $LayoutId;
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.ID = " . $LayoutId; 
		} else {
			$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layout.DESCNAME = '" . $LayoutId ."'";
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.DESCNAME = '" . $LayoutId ."'"; 
		}
		$sql = $sqlOVER  . " " . $sqlWhereOVER . " UNION " . $sqlSTD . " " . $sqlWhereSTD;
		$output["debugmessage"] = $sql;
		$Layoutrs = $conn->Execute($sql);
		if ($Layoutrs !== false) {
			$output["total"] = 1;
			$output["success"] = true;
			$LayoutId = $Layoutrs->fields["ID"];
			
			$VIEWTYPE = $Layoutrs->fields["VIEWTYPE"];
			//$VIEWTYPE = ExecFuncInStringSQL($VIEWTYPE);
			
			$LAYOUTTYPE = $Layoutrs->fields["LAYOUTTYPE"];
			
			$LAYOUTJSON = $Layoutrs->fields["LAYOUTJSON"];
			if ($LAYOUTJSON == '') $LAYOUTJSON = '[]';
			//$LAYOUTJSON = str_replace("combobox", "dynamiccombobox", $LAYOUTJSON);
			if ($conn->debug==1) echo('<b>LAYOUTJSON</b>:->' . $LAYOUTJSON . "<- " . "<br>\r\n");
			
			$DATASOURCE = $Layoutrs->fields["DATASOURCE"];	
			//$DATASOURCE = ExecFuncInStringSQL($DATASOURCE);

			$DATASOURCETYPE =  $Layoutrs->fields["DATASOURCETYPE"];
			//$DATASOURCETYPE = ExecFuncInStringSQL($DATASOURCETYPE);
			
			$DATASOURCEFIELD = $Layoutrs->fields["DATASOURCEFIELD"];
			//$DATASOURCEFIELD = ExecFuncInStringSQL($DATASOURCEFIELD);
			
			$VIEWTYPE = $Layoutrs->fields["VIEWTYPE"];
			//$VIEWTYPE = ExecFuncInStringSQL($VIEWTYPE);

			//$LAYOUTJSONDEF =($VIEWTYPE == 'label' ? $LAYOUTJSON :  json_decode($LAYOUTJSON,true));
			$LAYOUTJSONDEF =($VIEWTYPE == 'label' ? $LAYOUTJSON :  JSON2Array($LAYOUTJSON,true));
			
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
										"detailmodal" => $Layoutrs->fields["DETAILMODAL"],
										"layoutjson" => $LAYOUTJSONDEF,
										"layoutskin" => $Layoutrs->fields["LAYOUTSKIN"],
										"recordbar" => $Layoutrs->fields["RECORDBAR"],
										"autoupdate" => $Layoutrs->fields["AUTOUPDATE"],
										"datamode" => $DATAMODE,
										"layoutoverride" => $LAYOUTOVERRIDE,
										"guidetooltip" => $Layoutrs->fields["GUIDETOOLTIP"],
										"guidelink" => $Layoutrs->fields["GUIDELINK"],
										"layoutthemeui" => ($Layoutrs->fields["LAYOUTTHEMEUI"] == null ? '' : $Layoutrs->fields["LAYOUTTHEMEUI"]), 
										"actionsave" => ($Layoutrs->fields["ACTIONSAVE"] == null ? 0 : $Layoutrs->fields["ACTIONSAVE"]),
										"actionclone" => ($Layoutrs->fields["ACTIONCLONE"] == null ? 0 : $Layoutrs->fields["ACTIONCLONE"]),
										"viewtype" => $VIEWTYPE,
										"windowmode" => $Layoutrs->fields["WINDOWMODE"],
										"columnwidthsplit" => $Layoutrs->fields["COLUMNWIDTH"],
										"groupfield" => $Layoutrs->fields["GROUPFIELD"],
										"groupstartcollapsed" =>  ($Layoutrs->fields["GROUPCOLLAPSED"] != '' ? true : false),
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