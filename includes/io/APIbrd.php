<?php
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
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
	WFSetDebug(false);
	$debugmessage = 0;

	//MAIN
	$rfid = '';
	$rfid = isset($_POST["rfid"]) ? $_POST["rfid"] : $rfid;
	$rfid = isset($_GET["rfid"])  ? $_GET["rfid"]  : $rfid;
	
	$barcode = '';
	$barcode = isset($_POST["barcode"]) ? $_POST["barcode"] : $barcode;
	$barcode = isset($_GET["barcode"]) ? $_GET["barcode"] : $barcode;
	
	$status = '';
	$status = isset($_POST["status"]) ? $_POST["status"] : $status;
	$status = isset($_GET["status"]) ? $_GET["status"] : $status;
	
	$timestamp = '';
	$timestamp = isset($_POST["timestamp"]) ? $_POST["timestamp"] : $timestamp;
	$timestamp = isset($_GET["timestamp"])  ? $_GET["timestamp"]  : $timestamp;
	
	$veicolo = WFVALUEDLOOKUP('*','wms_veicoli'," RFID = '" . $rfid . "'");
	
	/* _FILES */
	foreach($_FILES as $key => $value){
		WFSendLOG("DataWrite:","FILES-" .$key  );
		if ($_FILES[$key]['error'] == UPLOAD_ERR_OK) {
			//salva FILE in repository tmpfile
			$filename = $_FILES[$key]['name'];  
			$filenameext = WFFileExt($filename);
			 	
			move_uploaded_file($_FILES[$key]['tmp_name'], $ExtJSDevDOC . $filename);
			move_uploaded_file($_FILES[$key]['tmp_name'], $ExtJSDevTMP . $filename);
			
			$record['UPLOADEDFILENAME'] = $filename; 
			$record['UPLOADEDFILETIMESTAMP'] = time();
			$record['UPLOADEDFILEEXT'] = strtolower($filenameext);
			$record['UPLOADEDFILESIZE'] = $_FILES[$key]["size"];
			$record['UPLOADEDFILEHASH'] = md5_file($ExtJSDevTMP . $filename);
			
		}elseif ($_FILES[$key ]['error'] == UPLOAD_ERR_INI_SIZE){
			echo('The uploaded file ' . $_FILES[$key]["size"] . ' exceeds the upload_max_filesize directive in php.ini');
		}
	}
		
	
	/************************************************/
	/*           SCARICO CARICO      				*/
	/************************************************/
	if ($status != ''){
		if ($status == 'unload'){
			$sqlC = "UPDATE wms_veicoli 
					SET STATO = '" . $status . "',
						STATOEND = NOW()
					WHERE RFID = '" . $rfid . "'";
			$conn->Execute($sqlC);
		}elseif ($status == 'load'){
			$sqlC = "UPDATE wms_veicoli 
					SET STATO = '" . $status . "',
						STATOSTART = NOW(),
						STATOEND = null
					WHERE RFID = '" . $rfid . "'";
			$conn->Execute($sqlC);
		}else{
			$sqlC = "UPDATE wms_veicoli 
					SET STATO = '" . $status . "',
						BARCODE = null,
						STATOEND = null,
						STATOSTART = null
					WHERE RFID = '" . $rfid . "'";
			$conn->Execute($sqlC);
		}
	
	}
	
	/************************************************/
	/*           ULTIMA LETTURA BARCODE				*/
	/************************************************/
	//AGGIORNO POSIZIONE XYZ ATTUALE
	if ($barcode != ''){
		$sqlC = "UPDATE wms_veicoli 
				SET BARCODE = '" . $barcode . "'
				WHERE RFID = '" . $rfid . "'";
		$conn->Execute($sqlC);
	}
	
	echo ('OK');
?>