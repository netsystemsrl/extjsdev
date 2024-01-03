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
	WFSendLOG("LayoutReadRun:","START");

	$LAYOUTJSON = "";
	$DATASOURCE = "";
	$DATASOURCETYPE = "";
	$DATASOURCEFIELD = "";
	$VIEWTYPE = "";
	$LAYOUTTYPE = "";
	$DATAMODE = "edit";
	
	$LayoutThemeName = '';
	$LayoutThemeName = isset($_POST["layoutthemename"]) ? $_POST["layoutthemename"] : $LayoutThemeName;
	$LayoutThemeName = isset($_GET["layoutthemename"]) ? $_GET["layoutthemename"] : $LayoutThemeName;
	
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
				
			//LAYOUT LOAD xxs
			$ACTIONLOAD = $Layoutrs->fields["ACTIONLOAD"];
			if (!IsNullOrEmptyOrZeroString($ACTIONLOAD)) WFPROCESS($ACTIONLOAD);
			
			//LAYOUT CSS 0.3s
			$LAYOUTOVERRIDE = '';
			$LAYOUTTHEMEUI = '';		
			
			//CODEBASE FORM 0.01S
			$CollectEchoString = '';
			if ($LAYOUTTYPE == 'CODE') {
				eval($LAYOUTJSON);
				$LAYOUTJSON = $CollectEchoString;
			}
			
			//EXECUDE CODE IN FORM 0.00s
			if (($VIEWTYPE != 'raw') && ($VIEWTYPE != 'label') && ($VIEWTYPE != 'report') && ($LAYOUTTYPE != 'PHTML')){
				$LAYOUTARRAY = JSON2Array($LAYOUTJSON,true);
				if ($conn->debug==1) {echo('<b>LAYOUTJSONEXE</b>:'); var_dump($LAYOUTARRAY); echo("<br>\r\n");}
				
				$CollectObjList = array();
				CollectOnObjectPropertyExist($LAYOUTARRAY, 'emptyText');
				foreach($CollectObjList as $sub) {
					if (!IsNullOrEmptyString($sub["emptyText"])){
						$LAYOUTJSON = str_replace($sub["emptyText"],ExecFuncInStringLAYOUT($sub["emptyText"]),$LAYOUTJSON);
					}
				}
				
				$CollectObjList = array();
				CollectOnObjectPropertyExist($LAYOUTARRAY, 'hiddenInGrid');
				foreach($CollectObjList as $sub) {
					if (!IsNullOrEmptyString($sub["hiddenInGrid"])){
						$Appo = WFFUNCTION($sub["hiddenInGrid"],'boolean');
						if ($Appo == '') $Appo = false;
						if ($conn->debug==1) echo('<b>hiddenInGrid</b>:'  . $sub["hiddenInGrid"] . '->' . $Appo . "<br>\r\n");
						$LAYOUTJSON = str_replace($sub["hiddenInGrid"],$Appo,$LAYOUTJSON);
					}
				}
				
				$CollectObjList = array();
				CollectOnObjectPropertyExist($LAYOUTARRAY, 'hiddenInForm');
				foreach($CollectObjList as $sub) {
					if (!IsNullOrEmptyString($sub["hiddenInForm"])){
						$Appo = WFFUNCTION($sub["hiddenInForm"],'boolean');
						if ($Appo == '') $Appo = false;
						if ($conn->debug==1) echo('<b>hiddenInForm</b>:' . $sub["hiddenInForm"] . '->' . $Appo . "<br>\r\n");
						$LAYOUTJSON = str_replace($sub["hiddenInForm"],$Appo,$LAYOUTJSON);
					}
				}
				
				$CollectObjList = array();
				CollectOnObjectPropertyExist($LAYOUTARRAY, 'datasourcefield');
				foreach($CollectObjList as $sub) {
					if (!IsNullOrEmptyString($sub["datasourcefield"])){
						$LAYOUTJSON = str_replace($sub["datasourcefield"],ExecFuncInStringLAYOUT($sub["datasourcefield"]),$LAYOUTJSON);
					}
				}
				
				$CollectObjList = array();
				CollectOnObjectPropertyExist($LAYOUTARRAY, 'displayField');
				foreach($CollectObjList as $sub) {
					if (!IsNullOrEmptyString($sub["displayField"])){
						$LAYOUTJSON = str_replace($sub["displayField"],ExecFuncInStringLAYOUT($sub["displayField"]),$LAYOUTJSON);
					}
				}
				
				$CollectObjList = array();
				CollectOnObjectPropertyExist($LAYOUTARRAY, 'fieldLabel');
				foreach($CollectObjList as $sub) {
					if (!IsNullOrEmptyString($sub["fieldLabel"])){
						$LAYOUTJSON = str_replace($sub["fieldLabel"],ExecFuncInStringLAYOUT($sub["fieldLabel"]),$LAYOUTJSON);
					}
				}
				
				//$LAYOUTJSON = ExecFuncInStringSQL($LAYOUTJSON);
				$LAYOUTJSONDEF = JSON2Array($LAYOUTJSON, true);
			}
			else if (($VIEWTYPE == 'raw') || ($LAYOUTTYPE == 'PHTML')){
				
				$LAYOUTJSON = ExecFuncInStringLAYOUT($LAYOUTJSON,true);
				
				ob_start();
				$CollectEchoString = ob_get_contents();
				eval($LAYOUTJSON);
				$CollectEchoString = ob_get_contents();
				ob_end_clean();

				$LAYOUTJSON = $CollectEchoString;
				$LAYOUTJSONDEF = $LAYOUTJSON;
			}
			else{
				$LAYOUTJSON = ExecFuncInStringLAYOUT($LAYOUTJSON);
				$LAYOUTJSONDEF = $LAYOUTJSON;
			}
			
			//$LAYOUTARRAY = JSON2Array($LAYOUTJSON,true);
			if ($conn->debug==1) echo('<b>LAYOUTJSONEXE</b>:' . $LAYOUTJSON . "<br>\r\n");
			
			/* LAYOUTGROUP ACL */
			$layoutgroup = "";
			
			if (($UserDeveloper == false) && ($UserAdmin == false) && (($VIEWTYPE != 'raw') && ($VIEWTYPE != 'label') && ($VIEWTYPE != 'report'))){
				$ResultVisible = True;
				$ResultDisable = False;
				$layoutgroup = "evaluate" . ' || ';
				$output["messageacl"] = "testing";
				$sql = "SELECT * 
						FROM " . $ExtJSDevDB . "layoutgroup 
						WHERE CT_AAALAYOUT = " . $LayoutId ." 
						ORDER BY VISIBLE, READONLY";
				$LayoutGrouprs = $conn->Execute($sql);
				while (!$LayoutGrouprs->EOF) {
					//verifica x group
					$layoutgroup = $layoutgroup . "acl exist" . ' || ';
					$nameACLObj = $LayoutGrouprs->fields['NAME'];
					
					if (!IsNullOrEmptyOrZeroString($LayoutGrouprs->fields['CT_AAAGROUP'])){
						//verifica utente che appartiene a quel gruppo
						$sql = "SELECT * 
								FROM  " . $ExtJSDevDB . "usergroup 
								WHERE CT_AAAUSER = " . $UserId . " 
									AND CT_AAAGROUP = " . $LayoutGrouprs->fields['CT_AAAGROUP'] ;
						$rsgroup = $conn->Execute($sql);
						$layoutgroup = $layoutgroup . "acl SQL " . $sql . ' || ';
						if ($rsgroup->RecordCount()>0){
							if ($LayoutGrouprs->fields['VISIBLE'] == 0) {
								$layoutgroup = $layoutgroup . $nameACLObj . " Group Removed V" . ' || ';
								$ResultVisible = False;
							}elseif ($LayoutGrouprs->fields['VISIBLE'] == 1) {
								$layoutgroup = $layoutgroup . $nameACLObj . " Group dded V" . ' || ';
								$ResultVisible = True;
							}
							if ($LayoutGrouprs->fields['READONLY'] == 1) {
								$layoutgroup = $layoutgroup . $nameACLObj . " Group Added R" . ' || ';
								$ResultDisable = True;
							}elseif ($LayoutGrouprs->fields['READONLY'] == 0) {
								$layoutgroup = $layoutgroup . $nameACLObj . " Group Removed R" . ' || ';
								$ResultDisable = False;
							}
						}
						$rsgroup->Close();
					}
					
					//verifica x user
					if ($LayoutGrouprs->fields['CT_AAAUSER'] == $UserId ){
							$layoutgroup = $layoutgroup . "acl user exist". ' || ';
						if ($LayoutGrouprs->fields['VISIBLE'] == 0) {
							$layoutgroup = $layoutgroup . $nameACLObj . " User Removed V" . ' || ';
							$ResultVisible = False;
						}elseif ($LayoutGrouprs->fields['VISIBLE'] == 1) {
							$layoutgroup = $layoutgroup . $nameACLObj . " User Added V" . ' || ';
							$ResultVisible = True;
						}
						if ($LayoutGrouprs->fields['READONLY'] == 1) {
							$layoutgroup = $layoutgroup . $nameACLObj . " User Added R" . ' || ';
							$ResultDisable = True;
						}elseif ($LayoutGrouprs->fields['READONLY'] == 0) {
							$layoutgroup = $layoutgroup . $nameACLObj . " User Removed R" . ' || ';
							$ResultDisable = False;
						}
					}

					//disattivazione con acl
					if ($ResultVisible == False){
						$layoutgroup = $layoutgroup . "Removed:" . $nameACLObj . ' || ';
						$objTochange = & getSubItemFromName($LAYOUTJSONDEF, $nameACLObj);
						$objTochange['hidden'] = True;
						$objTochange['hiddenInGrid'] = True;
						$objTochange['hiddenInForm'] = True;
					}
					if ($ResultDisable == True){
						$layoutgroup = $layoutgroup . "ReadOnly:" . $nameACLObj . ' || ';
						$objTochange = & getSubItemFromName($LAYOUTJSONDEF, $nameACLObj);
						if (strpos($objTochange['xtype'], 'grid') !== false) { 
							$objTochange['allowedit'] = False;
						}else{
							$objTochange['disabled'] = True;
						}
					}
					
					$LayoutGrouprs->MoveNext();
				}
				$LayoutGrouprs->close();
			}
			else{
				$layoutgroup = "NOT TO DO " . '-' . $UserDeveloper . '-' . $UserAdmin  . '-' . $VIEWTYPE ;
			}
			
			//LANGUAGE
			if (('IT' != $UserLocale) && ('' != $UserLocale) ){
				
			}
			
			if (($UserDeveloper == true) || ($UserAdmin == true)){
				$Layoutrs->fields["TOOLBAR"] = true;
				$Layoutrs->fields["RECORDBAR"] = true;
			}
			$DATASOURCE = $Layoutrs->fields["DATASOURCE"];	
			//$DATASOURCE = ExecFuncInStringSQL($DATASOURCE);

			$DATASOURCETYPE =  $Layoutrs->fields["DATASOURCETYPE"];
			//$DATASOURCETYPE = ExecFuncInStringSQL($DATASOURCETYPE);
			
			$DATASOURCEFIELD = $Layoutrs->fields["DATASOURCEFIELD"];
			//$DATASOURCEFIELD = ExecFuncInStringSQL($DATASOURCEFIELD);
			
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
										"groupfield" => $Layoutrs->fields["GROUPFIELD"],
										"detailmodal" => $Layoutrs->fields["DETAILMODAL"],
										"layoutjson" => $LAYOUTJSONDEF,
										"layoutskin" => $Layoutrs->fields["LAYOUTSKIN"],
										"recordbar" => $Layoutrs->fields["RECORDBAR"],
										"toolbar" => $Layoutrs->fields["TOOLBAR"],
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
										"windowheight" => intval($Layoutrs->fields["WINDOWHEIGHT"] == null ? 0 : $Layoutrs->fields["WINDOWHEIGHT"]),  
										"windowwidth" => intval($Layoutrs->fields["WINDOWWIDTH"] == null ? 0 : $Layoutrs->fields["WINDOWWIDTH"]),  
										"columnwidthsplit" => $Layoutrs->fields["COLUMNWIDTH"],
										"groupfield" => $Layoutrs->fields["GROUPFIELD"],
										"enumeratefield" => $Layoutrs->fields["ENUMERATEFIELD"],
										"identityfield" => $Layoutrs->fields["IDENTYFIELD"],
										"groupstartcollapsed" =>  ($Layoutrs->fields["GROUPCOLLAPSED"] == 1 ? true : false),
										"remote" => ($Layoutrs->fields["DATASOURCEREMOTE"] == 0 ? false : true),
										"aggregate" => $Layoutrs->fields["AGGREGATEJSON"],
										"leftaxis" => $Layoutrs->fields["LEFTAXISJSON"],
										"topaxis" => $Layoutrs->fields["TOPAXISJSON"],
										"printertemplate" => '' . $Layoutrs->fields["PRINTERTEMPLATE"]
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
	
	$output["acldebug"] = $layoutgroup;
	$output["registrationid"] = $RegistrationId;
	
	if ($conn->debug!=1) header('Content-Type: application/json');
	$Appo =  Array2JSON($output, $debugmessage);
	
	echo $Appo;
?>