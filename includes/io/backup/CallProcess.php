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
	//WFSetDebug(true);
	$debugmessage = 0;
	
//definizioni
	$ReportId = 0;
	$FlowId = 0;
	$FileId = 0;
	$PivotId = 0;
	$NewChiave = '';
	$ViewType = '';
	$DataWhere = '';
	$Type = '';
	$Source = '';
	$OnlyProc = true;
	$FlowLayout = array();
		
	$output["total"] = 1;
	$output["processid"] = 0;
	$output["ctid"] = 0;
	$output["success"] = true;
	$output["failure"] = false;
	$output["message"] = '';
	
	$LayoutActionSave ='';
	$LayoutActionPost ='';
	$LayoutActionClone = '';
	
	$time_start_process = microtime(true);
	$ProcessId = '0';
	if (isset($_GET['processid'])) $ProcessId = $_GET['processid'] ;
	if (isset($_POST['processid'])) $ProcessId = $_POST['processid'] ;
	if ($ProcessId == '') $ProcessId = '0';
	
//leggi definizione del process	
	if (!IsNullOrEmptyString($ProcessId)){
		//$PROC OVERRIDE
		$sqlSTD = "SELECT " . $ExtJSDevDB  . "proc.ID, "         . $ExtJSDevDB . "proc.SOURCE
					FROM " . $ExtJSDevDB . "proc " ;
															 
		$sqlOVER = "SELECT " . $ExtJSDevDB . "procoverride.ID, " . $ExtJSDevDB . "procoverride.SOURCE
					FROM " . $ExtJSDevDB . "procoverride ";
		if (is_numeric($ProcessId) == true){
			$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "proc.ID = " . $ProcessId;
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "procoverride.ID = " . $ProcessId; 
		} else {
			$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "proc.DESCNAME = '" . $ProcessId ."'";
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "procoverride.DESCNAME = '" . $ProcessId ."'"; 
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
				WFSendLOG("CallProcess:","Error: ProcessId Not Exist STOP");	
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
			WFSendLOG("CallProcess:","Error: ProcessId Not coerente STOP");	
			$conn->close();
			die();
		}
		$output["id"] = $ProcessId;
	}
	WFSendLOG("CallProcess:" . $ProcessId ,'Inform: Execute',1,1);

/************************************************************************************/
/*                   		  	  CREA collezione POST 								*/
/************************************************************************************/
	$_POST = array();

//leggi definizione da layout
	WFSendLOG("CallProcess:","Inform: **ricerca LayoutId");
	if (!IsNullOrEmptyString($LayoutId)){
		if ($conn->debug==1) echo('<b>FindLayoutId</b>:' . $LayoutId . "<br>\r\n");
		
		$sqlSTD = "SELECT *
					FROM " . $ExtJSDevDB . "layout " ;
															 
		$sqlOVER = "SELECT *
					FROM " . $ExtJSDevDB . "layoutoverride ";
		if (is_numeric($LayoutId) == true){
			$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layout.ID = " . $LayoutId;
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.ID = " . $LayoutId; 
		} else {
			$sqlWhereSTD = "WHERE " . $ExtJSDevDB . "layout.DESCNAME = '" . $LayoutId ."'";
			$sqlWhereOVER = "WHERE " . $ExtJSDevDB . "layoutoverride.DESCNAME = '" . $LayoutId ."'"; 
		}
		$sql = $sqlOVER . " " . $sqlWhereOVER . " UNION " . $sqlSTD . " " . $sqlWhereSTD;
		$rs = $conn->Execute($sql);
		if ($rs !== false) {
			if ($rs->RecordCount() > 0) {
				$LayoutId = $rs->fields['ID']; 
				$FormName = $rs->fields['DESCNAME'];
				$LayoutActionSave = $rs->fields["ACTIONSAVE"];
				$LayoutActionPost = $rs->fields["ACTIONPOST"];
				$LayoutActionClone = $rs->fields["ACTIONCLONE"];
				
				$datasource = $rs->fields['DATASOURCE'];
				$dataref = $rs->fields['DATAREF'];
				$dataidgen = $rs->fields['DATAIDGEN'];
				$datasourcefield = $rs->fields['DATASOURCEFIELD'];
				$datasourcetype = $rs->fields['DATASOURCETYPE'];
				$datasourcedbname = $rs->fields['DATASOURCEDBNAME'];
				
				$_POST["layoutid"] = $LayoutId;
				$_POST["datasource"] = $rs->fields['DATASOURCE'];
				$_POST["datasourcetype"] = $rs->fields['DATASOURCETYPE']; 
				$_POST["datasourcefield"] = $rs->fields['DATASOURCEFIELD'];
				$_POST["datasourcedbname"] = $rs->fields['DATASOURCEDBNAME'];
			}
			$rs->close();
		}
	}
	
/************************************************************************************/
/*                   		  	  ESEGUO COMANDI	 								*/
/************************************************************************************/
//variabili e funzioni in SQL
	$Source = str_replace(',,',',NULL,',$Source);
	
//Comandi a basso livello
	
	if ($Source == "NEW")    {
		WFSendLOG("CallProcess:","Inform: STOP");	
		die();
	}
	else if ($Source == "SAVE")   {
		//POST
		WFSendLOG("CallProcess:","Inform: SAVEONPOST");  
		if ($LayoutActionPost != '') {	WFPROCESS($LayoutActionPost); } 
		
		//TEST ERROR
		if (is_array($output) && !array_key_exists("success" , $output)) $output["success"] = true;
		if (is_array($output) && !array_key_exists("failure" , $output)) $output["failure"] = false;
		if (is_array($output) && !array_key_exists("message" , $output)) $output["message"] = '';
		
		
		if (is_array($output) && array_key_exists('requeryid',$output)){
			$mycallprocessmessage["requeryid"] = $output["requeryid"];
		}
		if (is_array($output) && array_key_exists('message',$output)){
			$mycallprocessmessage["message"] = $output["message"];
		}
		if (is_array($output) && array_key_exists('messagedebug',$output)){
			$mycallprocessmessage["messagedebug"] = $output["messagedebug"];
		}
		
		if (($output["success"] == false) || ($output["failure"] == true)){
			$Appo = Array2JSON($output, $debugmessage);
			if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
			if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
			header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/json');
			echo $Appo;
			die();
		}
		
		//SAVE
		WFSendLOG("CallProcess:","Inform: SAVECOMMIT");  
		//ricerca field nei campi postati formvalues e li post alla datawrite AND (CT_AAALAYOUT = " . $LayoutId . "  )
		if (IsNumericID($LayoutId)){
			$sql = "SELECT * FROM " . $ExtJSDevDB . "formvalues 
					WHERE (
						(NUMREG = " . $RegistrationId . ") AND 
						(CT_AAALAYOUT = " . $LayoutId . ") AND  
						(CT_AAAUSER = " . $UserId . ")
					)";
			$rs = $conn->Execute($sql);
			while (!$rs->EOF) {
				$_POST[$rs->fields['FIELDNAME']] = $rs->fields['FIELDVALUE'];
				$rs->MoveNext();
			}
			$rs->close(); 
		}
		$_POST["autocommit"] = 'true';	
		$_POST["fromprocess"] = 'true';	
		
		//WFSetDebug(true);
		include('DataWrite.php');
		
		//AFTER SAVE
		if (is_array($mycallprocessmessage) && array_key_exists('requeryid',$mycallprocessmessage)){
			$output["requeryid"] = $mycallprocessmessage["requeryid"];
		}
		if (is_array($mycallprocessmessage) && array_key_exists('message',$mycallprocessmessage)){
			$output["message"] = $mycallprocessmessage["message"];
		}
		if (is_array($mycallprocessmessage) && array_key_exists('messagedebug',$mycallprocessmessage)){
			$output["messagedebug"] = $mycallprocessmessage["messagedebug"];
		}
		WFSendLOG("CallProcess:","Inform: SAVEAFTER");
		if ($LayoutActionSave != '') {	WFPROCESS($LayoutActionSave); } 
		if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
		if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
		$Appo = Array2JSON($output, $debugmessage);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
		die();
	}
	else if ($Source == "CLONE") {
		//CLONE
		WFSendLOG("CallProcess:","Inform: CLONE SAVECOMMIT");  
		
		if (IsNumericID($LayoutId) && ($datasourcefield != '')){
			$sql = "SELECT * FROM " . $ExtJSDevDB . "formvalues 
					WHERE (
						(NUMREG = " . $RegistrationId . ") AND 
						(CT_AAALAYOUT = " . $LayoutId . ") AND  
						(CT_AAAUSER = " . $UserId . ")
					)";
			$rs = $conn->Execute($sql);
			while (!$rs->EOF) {
				$_POST[$rs->fields['FIELDNAME']] = $rs->fields['FIELDVALUE'];
				$rs->MoveNext();
			}
			$rs->close(); 
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
		if (($datasourcetype == 'TABLE')) {
			
			//CONNECTION
			if (!IsNullOrEmptyString($datasourcedbname)) {
				WFSQLCONNECT($datasourcedbname);
			}

			//aggiorno table definita	
			if ($conn->debug==1) echo("Aggiorno Table<BR>\n");
			$sql = "SELECT * FROM ". $datasource;
			
			//where
			if (($datasourcefield != '')  && ($_POST[$datasourcefield] != '')) {
				if (is_numeric($record[$datasourcefield]) == true){
					$sql = $sql ." WHERE " . $datasourcefield . " = " . $_POST[$datasourcefield] . "";
				}else{
					$sql = $sql ." WHERE " . $datasourcefield . " = '" . $_POST[$datasourcefield] . "'";
				}
			}else{
				$sql = $sql ." WHERE 1 = 2";
			}
			
			//Leggo il record
			//$conn->SetFetchMode(ADODB_FETCH_NUM);
			//$conn->SetFetchMode(ADODB_FETCH_BOTH);
			$conn->SetFetchMode(ADODB_FETCH_ASSOC);
			$rs = $conn->Execute($sql);
			if ($rs) {
				if ($rs->RecordCount()==1)  {
					//RECORD UPDATE
					$output["recordstatus"] = 'clone';
					if ($conn->debug==1) {var_dump($output); var_dump($sql);}
					
					$ColumnCountResult = $rs->FieldCount();
					for ($i = 0; $i < $ColumnCountResult; $i++) {
						$fld = $rs->FetchField($i);
						$name = $fld->name;
						$_POST[$name] = $rs->fields[$name]; 
					}
					
					//SR SA
					$date = new DateTime();
					$_POST['SA'] = $UserId; 
					$_POST['SR'] = $date->getTimestamp(); 
					$_POST['SI'] = $date->getTimestamp(); 
					$_POST['SC'] = $date->getTimestamp(); 
					
					unset($_POST[$datasourcefield]);
					unset($_POST['SL']);
					
					$_POST["autocommit"] = 'true';	
					$_POST["fromprocess"] = 'true';	
					
					//WFSetDebug(true);
					include('DataWrite.php');
					
					//AFTER CLONE SAVE
					if (is_array($mycallprocessmessage) && array_key_exists('requeryid',$mycallprocessmessage)){
						$output["requeryid"] = $mycallprocessmessage["requeryid"];
					}
					if (is_array($mycallprocessmessage) && array_key_exists('message',$mycallprocessmessage)){
						$output["message"] = $mycallprocessmessage["message"];
					}
					if (is_array($mycallprocessmessage) && array_key_exists('messagedebug',$mycallprocessmessage)){
						$output["messagedebug"] = $mycallprocessmessage["messagedebug"];
					}
					WFSendLOG("CallProcess:","Inform: CLONEAFTER");
					if ($LayoutActionClone != '') {	WFPROCESS($LayoutActionClone); } 
					
				}
			}
			
				
		}
	
		if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
		if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
		$Appo = Array2JSON($output, $debugmessage);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
		die();
	}
	else if ($Source == "DELETE") {
		WFSendLOG("CallProcess:","Inform: DELETE");
		//WFSetDebug(true);
		WFDELETE(); 
		if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
		if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
		$Appo = Array2JSON($output, $debugmessage);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
		die();
	}
	else if ($Source == "DOCS")   {
		$Source = "WFOpenObject('aaadocuments',acForm,'CT_ID =' . WFVALUE('ID'),,acDialog );";
	}
	
	//DEBUG VISUAL EXTJSDEV
	if (WFVALUESESSIONPRIV('debug') == 'true') WFSetDebug(true);
	if ((strpos($Source,'WFDEBUG(true)') == true) || (WFVALUESESSIONPRIV('ForceDebug') == 'true')){
		$Source = str_replace('/*',"echo('<b>",$Source);
		$Source = str_replace('*/',"</b>' . BRCRLF);",$Source);
		WFSetDebug(true);
	}
	
	//EVAL PROCESS
	WFSendLOG("CallProcess:","**eseguo:" . $Source);
	$ProcessId = '0';	
	try {
		eval($Source);
	} catch (Throwable $e) {
		WFRaiseError(0, 'CallProcess ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:');
	}catch (EntityNotFoundException $e) {
		WFRaiseError(0, 'CallProcess ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
	}catch(Exception $e){
		WFRaiseError(0, 'CallProcess ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
	}catch (ParseError $e) {
		WFRaiseError(0, 'CallProcess ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
	}catch (ArithmeticError $e) {
		WFRaiseError(0, 'CallProcess ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
	}catch (DivisionByZeroError $e) {
		WFRaiseError(0, 'CallProcess ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
	}catch (Error $e) {
		WFRaiseError(0, 'CallProcess ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
	}catch (TypeError $e) {
		WFRaiseError(0, 'CallProcess ' . get_class($e) . ', ' . $e->getMessage() . ' Row:' . $e->getLine() . '<BR> Called from Trace:' . $e->getTraceAsString(), 'WFPROCESS', 'Id:' . $ProcessIdExec);
	}
	
	
	$execution_time = (microtime(true) - $time_start_process)/60;
/************************************************************************************/
/*                   		  	  DOPO EVAL PROCESS 								*/
/************************************************************************************/
//preparo i dati da postare	
//dico cosa dovra aprire il pannello
	if ($ProcessId == '') $ProcessId = '0';
	WFSendLOG("CallProcess:","Inform: ProcessId" . $ProcessId, $execution_time );
	WFSendLOG("CallProcess:","Inform: messagereturn:" . $output["message"], $execution_time);
	$output["total"] = 1;
	//$output["message"] = $message;
	$output["processid"] = $ProcessId;
	if (! array_key_exists('processfree',$output)){
		$output["processfree"] = false;
	}
	$output["usrsession"] = WFVALUESESSIONLIST();
	$output["registrationid"] = $RegistrationId;
	if ($ProcessId != '0'){
		WFSendLOG("CallProcess:","Inform: **riaproNewProcess:", $execution_time);
		$_POST["layoutid"] =  $LayoutId;
		$_POST['processid'] = $ProcessId;
		include('CallProcess.php');
	}else{
		if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
		$Appo = Array2JSON($output, $debugmessage);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
	}
	
	if (($output["success"] == '') && ($output["failure"] == '')) $output["success"] = true;
	if (($output["failure"] == true) || ($output["success"] == false)) {$output["success"] = false; $output["failure"] = true;}
			
	$_SESSION['debug'] = 'false';
	$_SESSION['ForceDebug'] = false;
	$execution_time = (microtime(true) - $time_start_process)/60;
	WFSendLOG("CallProcess:","Inform: STOP", $execution_time);	
	$conn->close();	
?>