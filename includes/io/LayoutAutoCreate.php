<?php	
	require_once('../var.php');
	$debugmessage = 0;
	//WFSetDebug(true);
			
	WFSendLOG("LayoutRead:","START");

	$output = array();
	$LAYOUTJSONDEF = array();
	
	//passo param indietro
	$output["metaData"]["totalProperty"] = "total";
	$output["metaData"]["successProperty"] = "success";
	$output["metaData"]["root"]="data"; 
	
	if (($LayoutId != '') && ($LayoutId != '0')){
		//Record layout
		if (is_numeric($LayoutId) == true){
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutId ;
		} else {
			$sql = "SELECT * FROM " . $ExtJSDevDB . "layout WHERE DESCNAME = '" . $LayoutId ."'";
		}
		$Layoutrs = $conn->Execute($sql);
		if ($Layoutrs !== false) {
			$LayoutId = $Layoutrs->fields["ID"];
			$LAYOUTJSON = $Layoutrs->fields["LAYOUTJSON"];
		}
		
		//recover auto definition fields
		$JsonAppo = 'dictionarydbfield.php';
		$JsonAppo = do_post_get($JsonAppo);
		//WFSetDebug(true);
		$DataSourceFieldStore = JSON2Array($JsonAppo);
				
		//create dynamic form
		$arr_length = count($DataSourceFieldStore); 
		$shiftx = 0;
		$shifty = 0;
		$posx = 0;
		$posy = 0;
		for($i=0; $i<$arr_length; $i++) { 
			if ($i < 269) {
				$CurrentObjectId = '';
				$CurrentObjectName =  ObjAdd($DataSourceFieldStore[$i], $posx + (300 * $shiftx), $posy + (40 *  $shifty));
				if ($conn->debug==1) echo('<b>CurrentObjectName</b>:' . var_dump($CurrentObjectName) . "<br>\r\n");
				$LAYOUTJSONDEF[] = $CurrentObjectName;
			}
			$shifty = $shifty +1;
			if ($shifty > 16) {$shifty = 0; $shiftx = $shiftx + 1;}
		};
		
		if ($Layoutrs !== false) {
			$JsonAppo = Array2JSON($LAYOUTJSONDEF);
			$sqlC = $conn->UpdateClob($ExtJSDevDB . "layout",'LAYOUTJSON',	$JsonAppo , "ID = " . $LayoutId);
			$output["total"]=0;
			$output["sucess"]=true;
		} else {
			$output["total"]=0;
			$output["failure"]=true;
		}
	} else {
		$output["total"]=0;
		$output["failure"]=true;
	}
	
	if ($conn->debug!=1) header('Content-Type: application/json');
	$Appo =  Array2JSON($output,$debugmessage);
	echo $Appo;
	
	
	/********************************************************/
	//creo un nuovo oggetto extjs
	/********************************************************/
	function ObjAdd($record, $posx, $posy){
		$keys = array();
		$keys += ['x' => $posx];
		$keys += ['y' => $posy];
		
		//eredita parametri dall dictionarydb
		foreach ($record as $paramname => $paramvalue) {
			if (($paramvalue . '' != '') && (substr($paramname,0, 3) == 'obj' )) {
				$paramname = substr($paramname, 3, strlen($paramname));
				$keys += [$paramname => $paramvalue];
			}
		}
		
		//imposta param in base al tipo campo
		if ( strrpos($keys['xtype'],'datefield') == true){
			$keys += [ "format" => 'd-m-Y'];
			$keys += [ "submitFormat" => 'Y-m-d'];
		}
		elseif (strrpos($keys['xtype'],'timefield') == true){
			$keys += [ "format" => 'H:i'];
			$keys += [ "submitFormat" => 'H:i'];
		}
		elseif (strrpos($keys['xtype'],'button') == true){
			$keys += [ "width" => 100];
			$keys += [ "procremoteonclick" => 1];
			$keys += [ "text" => $keys['name']];
		}
		elseif (strrpos($keys['xtype'],'image') == true){
			$keys += [ "width" => 100];
			$keys += [ "height" => 100];
			$keys += [ "src" => '/repositorycom/logo.png'];
		}
		elseif (strrpos($keys['xtype'],'label') == true){
			$keys += [ "margins" => '0 0 0 10'];
			$keys += [ "text" => $keys['name']];
		}
		elseif (strrpos($keys['xtype'],'checkbox') == true){
			$keys += [ "width" => 150];
		}
		elseif (strrpos($keys['xtype'],'combobox') == true){
			$keys += [ "width" => 600];
			$keys += [ "queryMode" => 'remote'];
			$keys += [ "queryParam" => 'searchStr'];
			$keys += [ "typeAhead" => true];
			$keys += [ "typeAheadDelay" => 100];
			$keys += [ "minChars" => true];
			$keys += [ "editable" => true];
			$keys += [ "rowlimit" => 1000];
			if ($keys['datasource'] == '') $keys['datasource'] = 'SELECT * FROM ' + $keys['name'] ;
			if ($keys['datasourcetype'] == '') $keys['datasourcetype'] = 'SELECT';
			if ($keys['valueField'] == '') $keys['valueField'] = 'ID';
			if ($keys['displayField'] == '') $keys['displayField'] = 'DESCRIZIONE'; 
		}
		elseif (strrpos($keys['xtype'],'dynamiccombo') == true){
			$keys += [ "layouteditorid" => 0];
			$keys += [ "layouteditorWindowMode" => 'acWindowNormal'];
		}
		
		//if ($keys['datasourcefield'] == '') $keys['datasourcefield'] = $keys['name'];
		
		if (array_key_exists('xtype',$keys) == false) $keys['xtype'] = $keys['textfield'];
		if (array_key_exists('width',$keys) == false) $keys['width'] = 600;
		
		return $keys;
	}
?>