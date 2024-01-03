<?php		
	require_once('../var.php');
	function reArrayFiles(&$file_post) {
		$file_ary = array();
		$file_count = count($file_post['name']);
		$file_keys = array_keys($file_post);

		for ($i=0; $i<$file_count; $i++) {
			foreach ($file_keys as $key) {
				$file_ary[$i][$key] = $file_post[$key][$i];
			}
		}
		return $file_ary;
	}

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
	//WFSetDebug(true);
	$debugmessage = 0;
	
	WFSendLOG("DataWrite:","START");
	
//definizioni
	$record = array();
	$record2 = array();
	$message = '';
	$appo = '';
	$sql = '';
	$sqlC = '';
	
	$output["failure"]=false;
	$output["success"]=true;
	$output["recordstatus"] = "";
	$output["total"]=1;
	$output["messagedebuggerField"] = "";
		
	$datasourcetype = '';
	$datasource = '';
	$dataref = '';
	$dataidgen = '';
	$datasourcedbname = '';
	$datasourcefield = 'ID';
	$valuefieldvalue = '';
	
	$autocommit = false;
	$autocommit = isset($_POST["autocommit"]) ? $_POST["autocommit"] : $autocommit;
	$autocommit = isset($_GET["autocommit"])  ? $_GET["autocommit"]  : $autocommit;
	if ($autocommit == 'true') $autocommit = true; else $autocommit = false;
	
	$readOnlyFields = '';
	$readOnlyFields = isset($_POST["READONLYFIELDS"]) ? $_POST["READONLYFIELDS"] : $readOnlyFields;
	$readOnlyFields = isset($_GET["READONLYFIELDS"])  ? $_GET["READONLYFIELDS"]  : $readOnlyFields;
	
/************** COLLECT SENT DATA -> CREATE RECORD ************/
	//POST 
	$record = array();
	foreach($_POST as $key => $value){	
		if ($value == 'true') $value = 1;
		if ($value == 'false') $value = 0;
		if ($value == 'on') $value = 1;
		if ($value == 'off') $value = 0;
		if ($value == 'vero') $value = 1;
		if ($value == 'falso') $value = 0;
		if ($value == 'si') $value = 1;
		if ($value == 'no') $value = 0;
		if ($key == 'data') $value ='';
		if (($key != 'id') && ($key != 'registrationid') && ($key != 'valueField')  && ($key != 'layoutid') && ($key != 'userid')) {
			$record[strtoupper($key)] = $value; 
			if ($record[strtoupper($key)] == '') $record[strtoupper($key)] = null;
		}
		WFSendLOG("DataWrite:","POST-" .$key . "=" . $value );
	}
	//GET
	foreach($_GET as $key => $value){
		if ($value == 'true') $value = 1;
		if ($value == 'false') $value = 0;
		if ($value == 'on') $value = 1;
		if ($value == 'off') $value = 0;
		if ($value == 'vero') $value = 1;
		if ($value == 'falso') $value = 0;
		if ($value == 'si') $value = 1;
		if ($value == 'no') $value = 0;
		if ($key == 'data') $value ='';
		if (($key != 'id') && ($key != 'registrationid') && ($key != 'valueField')  && ($key != 'layoutid') && ($key != 'userid')) {
			$record[strtoupper($key)] = $value; 
			if ($record[strtoupper($key)] == '') $record[strtoupper($key)] = null;
		}
		WFSendLOG("DataWrite:","GET-" .$key . "=" . $value );
	}
	//INPUT
	$queryString = file_get_contents('php://input');
	if($debugmessage) file_put_contents($ExtJSDevArchive . "log/logDataWrite.txt", $queryString, FILE_APPEND);
	$data = array();
	foreach($data as $key => $value){
		if ($value == 'true') $value = 1;
		if ($value == 'false') $value = 0;
		if ($value == 'on') $value = 1;
		if ($value == 'off') $value = 0;
		if ($value == 'vero') $value = 1;
		if ($value == 'falso') $value = 0;
		if ($value == 'si') $value = 1;
		if ($value == 'no') $value = 0;
		if ($key == 'data') $value ='';
		if (($key != 'id') && ($key != 'registrationid') && ($key != 'valueField')  && ($key != 'layoutid') && ($key != 'userid')) {
			//if (!array_key_exists($key, $record)){
				$record[strtoupper($key)] = $value; 
				if ($record[strtoupper($key)] == '') $record[strtoupper($key)] = null;
			//}
		}
		WFSendLOG("DataWrite:","GET-" .$key . "=" . $value );
	}
	//RAW
	$jsonstr = '';
	if (isset($HTTP_RAW_POST_DATA)) $jsonstr = $HTTP_RAW_POST_DATA;
	if (isJson($jsonstr)) {
		$json = array();
		$jsondata = array();
		$json = json_decode($jsonstr, true);
		$jsondata = $json['data'];
		foreach($jsondata as $key => $value){
			if ($value == 'true') $value = 1;
			if ($value == 'false') $value = 0;
			if ($value == 'on') $value = 1;
			if ($value == 'off') $value = 0;
			if ($value == 'vero') $value = 1;
			if ($value == 'falso') $value = 0;
			if ($value == 'si') $value = 1;
			if ($value == 'no') $value = 0;
			if ($key != $datasourcefield) {
				$record[strtoupper($key)] = $value; 
				if ($record[strtoupper($key)] == '') $record[strtoupper($key)] = null;
			}
			WFSendLOG("DataWrite:","RAW-" .$key . "=" . $value );
		}
	}
	//_FILES
	$output["debugfile"] =  "";
	foreach($_FILES as $key => $value){
		WFSendLOG("DataWrite:","FILES-" .$key  );
		if ($_FILES[$key]['error'] == UPLOAD_ERR_NO_FILE){
		}
		elseif ($_FILES[$key]['error'] == UPLOAD_ERR_OK) {
			//salva FILE in repository tmpfile
			$filename = $_FILES[$key]['name'];  
			$filenameext = WFFileExt($filename);
			/*
			if(!in_array($filenameext,$ExtJSDevDOCExt))	{ 
				$output["message"] = $output["message"] .  'The uploaded file have incorrect extension !';
				$output["failure"] = true;
				$output["success"] = false;
			}
			*/
			/*
			if($_FILES[$key]["size"] > $ExtJSDevDOCMaxSize)	{ 
				$output["message"] = $output["message"] . 'The uploaded file ' . $_FILES[$key]["size"] . 'exceeds max_filesize!';  
				$output["failure"] = true;
				$output["success"] = false;
			}
			*/
			move_uploaded_file($_FILES[$key]['tmp_name'], $ExtJSDevTMP . $filename);
			$record['UPLOADEDFILENAME'] = $filename; 
			$record['UPLOADEDARRAY']= false;
			$record['UPLOADEDFILETIMESTAMP'] = time();
			$record['UPLOADEDFILEEXT'] = strtolower($filenameext);
			$record['UPLOADEDFILESIZE'] = $_FILES[$key]["size"];
			$record['UPLOADEDFILEHASH'] = md5_file($ExtJSDevTMP . $filename);
			$output["debugfile"] = $filename;
			
			$date = new DateTime();
			$record['SI'] = $date->getTimestamp(); 
			$record['SR'] = $date->getTimestamp(); 
			$record['SC'] = $date->getTimestamp(); 
			$record['SA'] = $UserId; 
			WFSendLOG("DataWrite:","FILE-" . $filename );
		}
		elseif ($_FILES[$key ]['error'] == UPLOAD_ERR_INI_SIZE){
			WFSendLOG("DataWrite:","FILEErr" . $result_msg );
			$output["failure"] = true;
			$output["success"] = false;
			$output["message"] = $output["message"] .  'The uploaded file ' . $_FILES[$key]["size"] . ' exceeds the upload_max_filesize directive in php.ini' . BRCRLF;
		}
		elseif ($_FILES[$key ]['error'] == UPLOAD_ERR_NO_TMP_DIR){
			WFSendLOG("DataWrite:","FILEErr" . $result_msg );
			$output["failure"] = true;
			$output["success"] = false;
			$output["message"] = $output["message"] .  'Err Temporary folder, check disk space, restart apache' . BRCRLF;
		}
		
		elseif (is_Array($_FILES[$key])){
			$date = new DateTime();
			$file_ary = reArrayFiles($_FILES[$key]);
			foreach ($file_ary as $file) {
				$filename = $file['name'];  
				$filenameext = WFFileExt($filename);
				move_uploaded_file($file['tmp_name'], $ExtJSDevTMP . $filename);
				$record['UPLOADEDFILENAME'] = $record['UPLOADEDFILENAME']. $filename . ';' ; 
				$record['UPLOADEDARRAY']= true;
				$record['UPLOADEDFILETIMESTAMP'] = $record['UPLOADEDFILETIMESTAMP'] . time() . ";" ;
				$record['UPLOADEDFILEEXT'] = $record['UPLOADEDFILEEXT'] . strtolower($filenameext) . ";";
				$record['UPLOADEDFILESIZE'] =$record['UPLOADEDFILESIZE'] .$file['size'] .";";
				$record['UPLOADEDFILEHASH'] = $record['UPLOADEDFILEHASH'] . md5_file($ExtJSDevTMP . $filename) . ";";
				$record['SI'] = $date->getTimestamp(); 
				$record['SR'] = $date->getTimestamp(); 
				$record['SC'] = $date->getTimestamp(); 
				$record['SA'] = $UserId; 
				$output["debugfile"] = $filename;
			}
		}
		else{
			WFSendLOG("DataWrite:","FILEErr" . $_FILES[$key ]['error'] );
			$output["failure"] = true;
			$output["success"] = false;
			$output["message"] = $output["message"] . 'The uploaded file ' . $_FILES[$key ]['error'] . BRCRLF;
		}
	}
	
	if ($conn->debug==1)  {echo("record:"); var_dump($record); echo("<BR>\n"); }

/************** FIND DEFINITION DB FOR CURRENT LAYOUT  ************/
	//Definizione datasource e datasourcetype e datasourcedbname
	if (!IsNullOrEmptyOrZeroString($LayoutId)){
		if ($conn->debug==1) echo('<b>FindLayoutId</b>:' . $LayoutId . "<br>\r\n");
		//$LAYOUT OVERRIDE
		$sqlSTD = "SELECT " . $ExtJSDevDB . "layout.*
					FROM " . $ExtJSDevDB . "layout " ;
															 
		$sqlOVER = "SELECT " . $ExtJSDevDB . "layoutoverride.*
					FROM " . $ExtJSDevDB . "layoutoverride ";
		if (is_numeric($LayoutId) == true){
			$sqlWhereSTD  = "WHERE " . $ExtJSDevDB . "layout.ID = " . $LayoutId;
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.ID = " . $LayoutId; 
		} else {
			$sqlWhereSTD  = "WHERE " . $ExtJSDevDB . "layout.DESCNAME = '" . $LayoutId ."'";
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.DESCNAME = '" . $LayoutId ."'"; 
		}
		$sql = $sqlOVER  . " " . $sqlWhereOVER . " UNION " . $sqlSTD . " " . $sqlWhereSTD;
		$rs = $conn->Execute($sql);
		if ($rs !== false) {
			$LayoutId = $rs->fields['ID']; 
			$datasource = $rs->fields['DATASOURCE'];
			$dataref = $rs->fields['DATAREF'];
			$dataidgen = $rs->fields['DATAIDGEN'];
			$datasourcefield = $rs->fields['DATASOURCEFIELD'];
			$datasourcetype = $rs->fields['DATASOURCETYPE'];
			$datasourcedbname = $rs->fields['DATASOURCEDBNAME'];
		}
	}
	
	//Cerca TABLE da aggiornare da SQL nel datasource nella POST
	if (($datasource != '') && ($datasourcetype == 'TABLE') && ($datasourcefield != '')){
		$datasourcetype = 'TABLE';
		$output["table"] = $datasource;
	}
	elseif (($datasource != '') && ($datasourcetype == 'SELECT') && ($datasourcefield != '')){
		$parsed = $parser->parse($datasource);
		//var_dump($ast->parsed["FROM"][0]);
		//DAFARE DATA WHERE  DATAREF
		$datasourcetype = 'TABLE';
		$datasource = $parsed["FROM"][0]["table"];
		if (($datasource == '') && ($dataref != '')) $datasource = $dataref;
		$output["table"] = $datasource;
	}
	elseif (($datasource != '') && ($datasourcetype == 'TREE') && ($datasourcefield != '')){
		$parsed = $parser->parse($datasource);
		//var_dump($ast->parsed["FROM"][0]);
		$datasource = $parsed["FROM"][0]["table"];
		$datasourcetype = 'TABLE';
		$output["table"] = $datasource;
	}
	
				
	if ($conn->debug==1) {echo ('DEFINIZIONI:' . ' datasource:' . $datasource . ' datasourcetype:' . $datasourcetype . '$autocommit:' . $autocommit); echo("<BR>\n"); }
	
/**************         WRITE RECORD IN DB            ************/

	if ($conn->debug==1)  {echo("recordAAA:"); var_dump($record); echo("<BR>\n"); }
	
	if (($autocommit == true) &&  ($datasourcetype == 'TABLE')) {
		
		//aggiorno tabella 
			
			//CONNECTION
			if (!IsNullOrEmptyString($datasourcedbname)) {
				WFSQLCONNECT($datasourcedbname);
			}
			
			//aggiorno table definita	
			if ($conn->debug==1) echo("Aggiorno Table<BR>\n");
			$sql = "SELECT * FROM ". $datasource;
			
			//where
			if (($datasourcefield != '')  && ($record[$datasourcefield] != '')) {
				if (is_numeric($record[$datasourcefield]) == true){
					$sql = $sql ." WHERE " . $datasourcefield . " = " . $record[$datasourcefield] . "";
				}else{
					$sql = $sql ." WHERE " . $datasourcefield . " = '" . $record[$datasourcefield] . "'";
				}
			}else{
				$sql = $sql ." WHERE 1 = 2";
			}
			
			/* GESTIONE OVERRIDE 
			if (  ( ($datasource == $ExtJSDevDB .'proc') || ($datasource == $ExtJSDevDB . 'layout') || ($datasource == $ExtJSDevDB . 'menu'))
			   && ( (left($datawhere,3) == 'ID=')  || (left($datawhere,4) == 'ID =') )
				){
				//sono nel case
				$sqlSTD  = "SELECT " . $datasource . ".* 			FROM " . $datasource . " " ;
				$sqlOVER = "SELECT " . $datasource . "override.* 	FROM " . $datasource . "override ";
				//where
				if (($datasourcefield != '')  && ($record[$datasourcefield] != '')) {
					if (is_numeric($record[$datasourcefield]) == true){
						$sqlWHERE = " WHERE " . $datasourcefield . " = " . $record[$datasourcefield] . "";
					}else{
						$sqlWHERE = " WHERE " . $datasourcefield . " = '" . $record[$datasourcefield] . "'";
					}
				}else{
					$sqlWHERE = " WHERE 1 = 2";
				}
				$sql = $sqlOVER . $sqlWHERE . " UNION " . $sqlSTD . $sqlWHERE ;
				$datasourcetype = 'SELECT';
				$datasource = $sql;
			}
			*/
		
			//Leggo il record
			if ($conn->debug==1) {var_dump($record); echo("<BR>\n"); }
			$rs = $conn->Execute($sql);
			if ($rs) {
				if ($rs->RecordCount()==1)  {
					//RECORD UPDATE
					$output["recordstatus"] = 'update';
					if ($conn->debug==1) {var_dump($output); var_dump($sql);}
					
					
					//Gestione normale
					$ADODB_FORCE_TYPE = ADODB_FORCE_VALUE;
					
					// READONLYFIELD
					$readOnlyFieldsArray = explode(";",$readOnlyFields);	
					foreach($readOnlyFieldsArray as $readOnlyField) {
						unset($record[$readOnlyField]);
						$output["messagedebuggerField"] = $output["messagedebuggerField"] . '-' . $readOnlyField;
					}
					
					//SR SA
					$date = new DateTime();
					$record['SA'] = $UserId; 
					$record['SR'] = $date->getTimestamp(); 
					unset($record['SL']);
					
					//UPLOADEDIMAGE
					if (is_array($record) && array_key_exists('UPLOADEDFILENAME',$record)){
						copy($ExtJSDevTMP . $record['UPLOADEDFILENAME'], $ExtJSDevDOC . $record['UPLOADEDFILENAME'] );
					}
					
					//WRITE - UPDATE
					$sqlC = $conn->GetUpdateSQL($rs, $record);
					if ($conn->debug==1) var_dump($sqlC);
					if ($debugmessage == 1 ) $output["messagedebug"] = $output["messagedebug"] . $sqlC;
					
					$output["messagedebugger"] = $output["messagedebug"] . $sqlC;
					
					WFSendLOG("DataWrite:","UPDATE:" . $sqlC );
					try {   
						if ($sqlC <> '') $appo = $conn->Execute($sqlC); else $appo = true;
					} catch (exception $e){
						$output["failure"] = true; 
						$output["message"] = $output["message"] . 'update normal commit' . $e->getMessage() . BRCRLF;
						$Appo = Array2JSON($output, $debugmessage);
						header("Access-Control-Allow-Origin: *");
						header('Content-Type: application/json');
						echo $Appo;
						die();
					}
					$valuefieldvalue = $record[$datasourcefield];
					
					//UPLOADEDIMAGEGARBAGE
					if (is_array($record) && array_key_exists('UPLOADEDFILENAME',$record)){
						unlink($ExtJSDevTMP . $record['UPLOADEDFILENAME']);
						$sql = "DELETE FROM " . $ExtJSDevDB . "formvalues 
								WHERE (CT_AAAUSER  = " . $UserId . ") 
									AND (NUMREG = " . $RegistrationId . ") 
									AND (CT_AAALAYOUT = " . $LayoutId . ") 
									AND (FIELDNAME LIKE 'UPLOADEDFILE%')";
						$conn->Execute($sql);
					}
					
					//AAAUSERSLOGS
					WFNOTIFY ($UserId,$datasource,$valuefieldvalue,$sqlC,'UPD');	
					WFLOGUSER($UserId,$datasource,$valuefieldvalue,$sqlC,'UPD');	
				}
				else if ($rs->RecordCount()==0) {
					//RECORD INSERT
					$output["recordstatus"] = 'insert';
					if ($conn->debug==1) {var_dump($output); var_dump($sql);}
					
					$ADODB_FORCE_TYPE = ADODB_FORCE_VALUE;
					
					// READONLYFIELD
					$readOnlyFieldsArray = explode(";",$readOnlyFields);	
					foreach($readOnlyFieldsArray as $readOnlyField) {
						unset($record[$readOnlyField]);
						$output["messagedebuggerField"] = $output["messagedebuggerField"] . '-' . $readOnlyField;
					}
					
					//SI SR SA
					$date = new DateTime();
					//if (!isset($record['CT_AAAUSER'])) $record['CT_AAAUSER'] = $UserId; 
					if (!isset($record['CT_AAAUSERCREATOR'])) $record['CT_AAAUSERCREATOR'] = $UserId; 
					if (!isset($record['CT_OPERATORE'])) $record['CT_OPERATORE'] = $UserId; 
					unset($record['SL']);
					$record['SI'] = $date->getTimestamp(); 
					$record['SR'] = $date->getTimestamp(); 
					$record['SA'] = $UserId;
					
					//UPLOADEDIMAGE
					if (is_array($record) && array_key_exists('UPLOADEDFILENAME',$record)){
						copy($ExtJSDevTMP . $record['UPLOADEDFILENAME'], $ExtJSDevDOC . $record['UPLOADEDFILENAME'] );
					}
					
					//FORCE ID GEN
					if ($dataidgen == 'TIMESTAMP'){
						$record[$datasourcefield] = $date->getTimestamp();
					}
					/*
					if (substr($datasource,0,strlen($ExtJSDevDB)) == $ExtJSDevDB){
						$record[$datasourcefield] = $date->getTimestamp();
					}
					*/
					
					$sqlC = $conn->GetInsertSQL($rs, $record);
					if ($conn->debug==1) var_dump($sqlC);
					if ($debugmessage == 1 ) $output["messagedebug"] = $output["messagedebug"] . $sqlC;
					WFSendLOG("DataWrite:","INSERT:" . $sqlC );
					try {   
						$appo = $conn->Execute($sqlC);
					} catch (exception $e){ 
						$output["failure"] = true; 
						$output["messagedebug"] = $output["messagedebug"] . 'insert normal commit' . $e->getMessage();
						$ERROR = $conn->ErrorNo();
						if (is_array($ERROR)){
							if (array_key_exists('messageerrornum',$ERROR)){
								if ($ERROR["messageerrornum"] == 1062) { 
									$output["message"] = $output["message"] . "RECORD GIA ESISTENTE" . BRCRLF;
								}elseif ($ERROR["messageerrornum"] == 1048) { 
									$output["message"] = $output["message"] . "RECORD CON CAMPI FONDAMENTALI NON COMPILATI" . BRCRLF;
								} else { 
									$output["message"] = $output["message"] . $output["messagedebug"];
								}
							} else { 
								$output["message"] = $output["message"] . $output["messagedebug"];
							}
						}else { 
							$output["message"] = $output["message"] . $output["messagedebug"];
						}
						if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
						if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
						$Appo = Array2JSON($output, $debugmessage);
						header("Access-Control-Allow-Origin: *");
						header('Content-Type: application/json');
						echo $Appo;
						die();
					}
					$valuefieldvalue = $conn->Insert_ID();
					if ($valuefieldvalue == null){
						$valuefieldvalue = $record[$datasourcefield];
					}
					//AAAUSERSLOGS
					WFNOTIFY ($UserId,$datasource,$valuefieldvalue,$sqlC,'INS');	
					WFLOGUSER($UserId,$datasource,$valuefieldvalue,$sqlC,'INS');
					
					//SD
					/*
					if ($datasource ==  $ExtJSDevDB . 'documents' ){
						if (TLookup($conn, 'SD', $record['CT_TABLE']) != ''){
							$sqlC = "UPDATE " . $record['CT_TABLE'] . " 
									SET SD = 1 
									WHERE ID = " . $record['CT_ID'] ;
							$conn->Execute($sqlC);
						}
					}
					*/
					
					//UPLOADEDIMAGEGARBAGE
					if (is_array($record) && array_key_exists('UPLOADEDFILENAME',$record)){
						unlink($ExtJSDevTMP . $record['UPLOADEDFILENAME']);
						$sql = "DELETE FROM " . $ExtJSDevDB . "formvalues 
								WHERE (CT_AAAUSER  = " . $UserId . ") 
									AND (NUMREG = " . $RegistrationId . ") 
									AND (CT_AAALAYOUT = " . $LayoutId . ") 
									AND (FIELDNAME LIKE 'UPLOADEDFILE%')";
						$conn->Execute($sql);
					}
					
					//aggiorno nell formvalues l'id corrente
					$datasource = $ExtJSDevDB . 'formvalues';
					$sql = "SELECT * FROM ". $datasource ." WHERE (CT_AAAUSER  = " . $UserId . ") AND (NUMREG = " . $RegistrationId . ") AND (CT_AAALAYOUT = " . $LayoutId . ") AND (FIELDNAME = '" . $datasourcefield . "')";
					$rs = $conn->Execute($sql);
					$record2['NUMREG'] = $RegistrationId; 
					$record2['CT_AAALAYOUT'] = $LayoutId; 
					$record2['CT_AAAUSER'] = $UserId; 
					$record2['FIELDNAME'] = $datasourcefield; 
					$record2['FIELDVALUE'] = $valuefieldvalue;
					if ($rs) {
						if ($rs->RecordCount()==0) {
							$sqlC = $conn->GetInsertSQL($rs, $record2);
						}else{
							$sqlC = $conn->GetUpdateSQL($rs, $record2);
						}
						$conn->Execute($sqlC);
					}
					
				}
				else if ($rs->RecordCount()>1) {
					//ERRORE CHIAVE DUPLICATA
					$appo = false;
					$output["recordstatus"] = 'duplicate';
					WFSendLOG("DataWrite:","SQLN" . $sqlC );
					$output["failure"] = true; 
					$output["message"] = $output["message"] . "Chiave Non univoca!  " . $datasourcefield . " = " . $record[$datasourcefield] . "count:" . $rs->RecordCount() . " DUPLICATA!" . BRCRLF;
					if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
					if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
					$Appo = Array2JSON($output, $debugmessage);
					header("Access-Control-Allow-Origin: *");
					header('Content-Type: application/json');
					echo $Appo;
					die();
				}
				
				if ($appo == true) {
					$output['datasourcefield'] = $datasourcefield ;
					$output[$datasourcefield] = $valuefieldvalue;
					$output["success"] = true; 
				}elseif ($appo == ''){
					$output["message"] = $output["message"]  . ' - Errore' . BRCRLF;
					$output["success"] = true; 
					
				}else{ 
					$output["failure"] = true; 
					$output["message"] = $output["message"]  . "<br>appo:" .$appo . "<br>datasourcefield:" . $datasourcefield . "<br>SQLSearch:"  . $sql . "<br>SQLCommand:". $sqlC . "<br>Error:". $conn->ErrorMsg() . BRCRLF;
				}
				$output["total"] = $conn->Affected_Rows();
			}else{
				$output["failure"] = true; 
				$output["message"] = $output["message"] . "<br>datasourcefield:" . $datasourcefield . "<br>SQL:"  . $sql . "<br>Error:" . $conn->ErrorMsg() . BRCRLF;
				if ($conn->debug==1) {var_dump($output); var_dump($sql); echo("<BR>\n"); }
			}
	
	} else {	
		
		//aggiorno aaaformvalues
	
		if ($conn->debug==1) echo("Aggiorno formvalues<BR>\n"); 		
		$datasource = $ExtJSDevDB . 'formvalues';
		$record2['NUMREG'] = $RegistrationId; 
		$record2['CT_AAALAYOUT'] = $LayoutId; 
		$record2['CT_AAAUSER'] = $UserId; 
		foreach($record as $chiave => $valore)  {
			
			/* cancellazione ma lenta
			$sql = "DELETE  FROM ". $datasource ." 
					WHERE (CT_AAAUSER  = " . $UserId . ") 
						AND (NUMREG = " . $RegistrationId . ") 
						AND (CT_AAALAYOUT = " . $LayoutId . ") 
						AND (FIELDNAME = '" . $chiave . "')";
			$conn->Execute($sql);
			*/
			
			$record2['FIELDNAME'] = $chiave;
			$FileID = '';
			for( $i = strlen($chiave); $i > 0 ; $i-- ) {
				$char = substr( $chiave, $i-1, 1 );
				if (is_numeric($char)) {$FileID = $FileID . $char; }else{ break; }
			}
			if ($FileID != '') $record2['FIELDID'] = $FileID;
			$record2['FIELDVALUE'] = $valore;
			
			$sql = "SELECT * FROM ". $datasource ." 
					WHERE (CT_AAAUSER  = " . $UserId . ") 
						AND (NUMREG = " . $RegistrationId . ") 
						AND (CT_AAALAYOUT = " . $LayoutId . ") 
						AND (FIELDNAME = '" . $chiave . "')";
			$rs = $conn->Execute($sql);
			if ($rs) {
				$appo = true;
				if ($rs->RecordCount()==1) {
					$output["recordstatus"] = 'update';
					if ($conn->debug==1) {echo('update formvalues'); var_dump($output); var_dump($sql); var_dump($record);}
					$sqlC = $conn->GetUpdateSQL($rs, $record2);
					if ($conn->debug==1) {echo('update formvalues'); var_dump($sqlC);}
					WFSendLOG("DataWrite:","SQLV1" . $sqlC );
					try {   
						if ($sqlC <> '') $appo = $conn->Execute($sqlC); else $appo = true;
					} catch (exception $e){
						$output["failure"] = true; 
						$output["message"] = $output["message"] .  'update normal' . $e->getMessage() . BRCRLF;
						if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
						if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
						header("Access-Control-Allow-Origin: *");
						header('Content-Type: application/json');
						echo Array2JSON($output, $debugmessage);
						die();
					}
				}
				else if ($rs->RecordCount()==0) {
					$output["recordstatus"] = 'formvalues';
					if ($conn->debug==1) {echo('insert formvalues '); var_dump($output); var_dump($sql); var_dump($record);}
					$sqlC = $conn->GetInsertSQL($rs, $record2);
					if ($conn->debug==1) {echo('insert formvalues '); var_dump($sqlC);}
					WFSendLOG("DataWrite:","SQLV0" . $sqlC );
					try {   
						if ($sqlC <> '') $appo = $conn->Execute($sqlC); else $appo = true;
					} catch (exception $e){
						$output["failure"] = true; 
						$output["message"] = $output["message"] .  'insert normal' . $e->getMessage() . BRCRLF;
						if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
						if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
						header("Access-Control-Allow-Origin: *");
						header('Content-Type: application/json');
						echo Array2JSON($output, $debugmessage);
						
						die();
					}
					$valuefieldvalue = $conn->Insert_ID();
				}
				else if ($rs->RecordCount()>1) {
					WFSendLOG("DataWrite:","SQLVN" . $sqlC );
					$appo = false;
				}
				if ($appo == true) {
					$output["success"] = true; 
				}else{ 
					$output["failure"] = true; 
					$output["message"] = $output["message"] . "Field:" . $chiave . "<br>"  . $sql . " <br> " . $sqlC . "<br>". '' . "<br>". $conn->ErrorMsg() . BRCRLF;
				}
				$output["total"] = $conn->Affected_Rows();
				$rs->Close();
			}
		}
	}
		
		
/**************        MANAGE INNER PROCESS            ************/
	$output[$datasourcefield] = $valuefieldvalue;
	
	$fromprocess = false;
	$fromprocess = isset($_POST["fromprocess"]) ? $_POST["fromprocess"] : $fromprocess;
	$fromprocess = isset($_GET["fromprocess"]) ? $_GET["fromprocess"] : $fromprocess;
	if ($fromprocess == 'true') $fromprocess = true; else $fromprocess = false;
	
	if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
	if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
	
	if ($fromprocess == false) {
		$Appo = Array2JSON($output, $debugmessage);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
	}
	if ($conn->debug==1)  {
		header('Content-Type: text/html');
	}
	
	WFSendLOG("DataWrite:","STOP" );
	//$conn->close();
?>