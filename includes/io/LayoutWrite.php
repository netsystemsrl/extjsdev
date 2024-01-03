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
			
	//WFSendLOG("LayoutWrite:","START");
	
	$record = array();
	$LayoutId  = 0;
	if (isset($_POST["layoutid"])) { $LayoutId = $_POST["layoutid"]; $record["ID"] = $LayoutId; }
	if (isset($_GET["layoutid"])) { $LayoutId = $_GET["layoutid"]; $record["ID"] = $LayoutId; }
	
	$LayoutJson = '';
	$LayoutJson = isset($_POST["layoutjson"]) ? $_POST["layoutjson"] : $LayoutJson;
	$LayoutJson = isset($_GET["layoutjson"]) ? $_GET["layoutjson"] : $LayoutJson;
	$JsonAppo = array();
	
	$JsonAppo  = Array2JSON($LayoutJson,true);
	$LayoutJson = json_decode($JsonAppo ,true);
	$record = array();
	
	//_FILES
	foreach($_FILES as $key => $value){
		//WFSendLOG("LayoutWrite:","FILES-" .$key  );
		if ($_FILES[$key]['error'] == UPLOAD_ERR_OK) {
			//salva FILE in repository tmpfile
			$filename = $_FILES[$key]['name'];  
			$filenameext = WFFileExt($filename);
			/*
			if(!in_array($filenameext,$ExtJSDevDOCExt))	{ 
				$output["message"] = 'The uploaded file have incorrect extension !';
				$output["failure"] = true;
				$output["success"] = false;
			}
			*/
			/*
			if($_FILES[$key]["size"] > $ExtJSDevDOCMaxSize)	{ 
				$output["message"] = 'The uploaded file ' . $_FILES[$key]["size"] . 'exceeds max_filesize!';  
				$output["failure"] = true;
				$output["success"] = false;
			}
			*/
			move_uploaded_file($_FILES[$key]['tmp_name'], $ExtJSDevTMP . $filename);	
			$record['UPLOADEDFILENAME'] = $filename; 
			$record['UPLOADEDFILETIMESTAMP'] = time();
			$record['UPLOADEDFILEEXT'] = strtolower($filenameext);
			$record['UPLOADEDFILESIZE'] = $_FILES[$key]["size"];
			$record['UPLOADEDFILEHASH'] = md5_file($ExtJSDevTMP . $filename);
			//WFSendLOG("LayoutWrite:","FILE-" . $filename );
		}elseif ($_FILES[$key ]['error'] == UPLOAD_ERR_INI_SIZE){
			WFSendLOG("LayoutWrite:","FILEErr" . $result_msg );
			$output["failure"] = true;
			$output["success"] = false;
			$output["message"] = 'The uploaded file ' . $_FILES[$key]["size"] . ' exceeds the upload_max_filesize directive in php.ini';
		}
	}
	
	
	if (($LayoutId != '') && ($LayoutId != '0')){
		if (is_numeric($LayoutId) == true){
			$sql = "SELECT *,'ov' as TYPEL FROM " . $ExtJSDevDB . "layoutoverride WHERE ID = " . $LayoutId . " 
					union 
					SELECT *,'nm' as TYPEL FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutId ;
		} else {
			$sql = "SELECT *,'ov' as TYPEL FROM " . $ExtJSDevDB . "layoutoverride WHERE DESCNAME = '" . $LayoutId ."' 
					union 
					SELECT *,'nm' as TYPEL FROM " . $ExtJSDevDB . "layout WHERE DESCNAME = '" . $LayoutId ."'";
		}
		$rs = $conn->Execute($sql);
		if ($rs) {
			if ($rs->RecordCount()>0)  {
				$output["message"] = 'update';
				$LayoutId = $rs->fields['ID']; 
				$date = new DateTime();
				$record['SR'] = $date->getTimestamp(); 
				$record['SA'] = $UserId; 
				if ($conn->debug==1) {var_dump($sql); var_dump($record);}
				
				if ($rs->fields['TYPEL'] == 'nm'){
					$sql = "SELECT *,'nm' as TYPEL FROM " . $ExtJSDevDB . "layout WHERE ID = " . $LayoutId;
					$rs = $conn->Execute($sql);
					$sqlC = $conn->GetUpdateSQL($rs, $record);
					if ($conn->debug==1) var_dump($sqlC);
					if ($sqlC <> '')  $appo = $conn->Execute($sqlC); else $appo = true;
					$appo = $conn->UpdateClob($ExtJSDevDB . "layout", 'LAYOUTJSON', $LayoutJson,"ID = " . $LayoutId);
					WFLOGUSER($UserId,$ExtJSDevDB . "layout",$LayoutId,$LayoutJson,'UPD');
				}else{
					$sql = "SELECT *,'ov' as TYPEL FROM " . $ExtJSDevDB . "layoutoverride WHERE ID = " . $LayoutId;
					$rs = $conn->Execute($sql);
					$sqlC = $conn->GetUpdateSQL($rs, $record);
					if ($conn->debug==1) var_dump($sqlC);
					if ($sqlC <> '')  $appo = $conn->Execute($sqlC); else $appo = true;
					$appo = $conn->UpdateClob($ExtJSDevDB . "layoutoverride", 'LAYOUTJSON', $LayoutJson,"ID = " . $LayoutId);
					WFLOGUSER($UserId,$ExtJSDevDB . "layoutoverride",$LayoutId,$LayoutJson,'UPD');
				}
				//WFSendLOG("LayoutWrite",$LayoutJson);
			}
			if ($rs->RecordCount()==0) {
				$output["message"] = 'insert';
				$date = new DateTime();
				$record['SI'] = $date->getTimestamp(); 
				$record['SR'] = $date->getTimestamp(); 
				$record['SA'] = $UserId; 
				if ($conn->debug==1) {var_dump($sql); var_dump($record);}
				$sqlC = $conn->GetInsertSQL($rs, $record);
				if ($conn->debug==1) var_dump($sqlC);
				$appo = $conn->Execute($sqlC); 
				$valuefieldvalue = $conn->Insert_ID();
				$LayoutId = $valuefieldvalue;
				
				$appo = $conn->UpdateClob($ExtJSDevDB . "layout", 'LAYOUTJSON', $LayoutJson,"ID = " . $LayoutId);
				//WFSendLOG("LayoutWrite",$LayoutJson);
				WFLOGUSER($UserId,$ExtJSDevDB . "layout",$LayoutId,$LayoutJson,'UPD');
			}
			if ($appo == true) {
				$output["success"] = true; 
			}else{ 
				$output["failure"] = true; 
				$output["message"] = $output["message"]  . "Errore trovati duplicati --"  . $sql . "--". $sqlC  . "--". $conn->ErrorMsg();
			}
			$output["total"] = $conn->Affected_Rows();
		}else{
			 $output["failure"] = true; 
			 $output["message"] = $output["message"] . "ErrSQL:" . $conn->ErrorMsg();
		}
	}
	
	echo Array2JSON($output);
	$conn->close();
?>