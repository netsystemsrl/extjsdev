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
	$appoggio = array();
	
	$veicolo = '';
	$veicolo = isset($_POST["rfid"]) ? $_POST["rfid"] : $veicolo;
	$veicolo = isset($_GET["rfid"])  ? $_GET["rfid"]  : $veicolo;
	$veicolo = WFVALUEDLOOKUP('*','wms_veicoli'," RFID = '" . $veicolo . "'");
	
	$status = '';
	$status = isset($_POST["status"]) ? $_POST["status"] : $status;
	$status = isset($_GET["status"]) ? $_GET["status"] : $status;
	
	$timestamp = '';
	$timestamp = isset($_POST["timestamp"]) ? $_POST["timestamp"] : $timestamp;
	$timestamp = isset($_GET["timestamp"])  ? $_GET["timestamp"]  : $timestamp;
	$appoggio['PDTDATETIME'] = $timestamp;
	
	$operator = '';
	$operator = isset($_POST["operator"]) ? $_POST["operator"] : $operator;
	$operator = isset($_GET["operator"]) ? $_GET["operator"] : $operator;
	$operator = WFVALUEDLOOKUP('*','aaauser'," NFC = '" . $operator . "'");
	if ($operator != ''){
		$appoggio['PDTUSER'] = $operator['ID'];
	}
	
	//POSITION 
	$ErrorUDC  = 0.000002;
	$positionMaga = '';
	$positionMaga = isset($_POST["positionMaga"]) ? $_POST["positionMaga"] : $positionMaga;
	$positionMaga = isset($_GET["positionMaga"]) ? $_GET["positionMaga"] : $positionMaga;
	
	$positionLatDeg = 0;
	$positionLatDeg = isset($_POST["positionlatdeg"]) ? $_POST["positionlatdeg"] : $positionLatDeg;
	$positionLatDeg = isset($_GET["positionlatdeg"])  ? $_GET["positionlatdeg"]  : $positionLatDeg;
	$positionLatDeg = Cdec($positionLatDeg);
	
	$positionLonDeg = 0;
	$positionLonDeg = isset($_POST["positionlondeg"]) ? $_POST["positionlondeg"] : $positionLonDeg;
	$positionLonDeg = isset($_GET["positionlondeg"])  ? $_GET["positionlondeg"]  : $positionLonDeg;
	$positionLonDeg = Cdec($positionLonDeg);
	
	$positionAltitude = '';
	$positionAltitude = isset($_POST["positionaltitude"]) ? $_POST["positionaltitude"] : $positionAltitude;
	$positionAltitude = isset($_GET["positionaltitude"])  ? $_GET["positionaltitude"]  : $positionAltitude;
	$positionAltitude = Cdec($positionAltitude);
	
	$positionMap = '1';
	$positionMap = isset($_POST["position"]) ? $_POST["position"] : $positionMap;
	$positionMap = isset($_GET["position"])  ? $_GET["position"]  : $positionMap;
	$positionMap = WFVALUEDLOOKUP('*','wms_mappe',"ID = " . $positionMap);
	
	//POSIZIONE POSIZIONE UDC ATTUALE 
	$posizione  = '';
	if ($positionMaga != ''){
		$posizione = WFVALUEDLOOKUP('ID','wms_posizioni',"CODICE  = '" . $positionMaga ."'" );
	}else if (($positionLatDeg >0) && ($positionLonDeg >0)){
		$posizione = WFVALUEDLOOKUP('ID','wms_posizioni',"WMS_CT_MAPPE  = " . $positionMap['ID'] . 
													" AND ABS(WPS_GPSX - " . $veicolo['WPS_GPSX'] . ") < " . $ErrorUDC .
													" AND ABS(WPS_GPSY - " . $veicolo['WPS_GPSY'] . ") < " . $ErrorUDC );
		$veicolo['WPS_GPSX'] = $positionLatDeg;
		$veicolo['WPS_GPSY'] = $positionLonDeg;
		$veicolo['WPS_GPSH'] = $positionAltitude;
	}
	
	if ($posizione != ''){
		$veicolo['WMS_CT_POSIZIONI'] = $posizione['ID'];
		$appoggio['MAGAPOSIZIONE'] = $posizione['ID'];
		$conn->AutoExecute("wms_veicoli", $veicolo, 'UPDATE', 'ID = ' . $veicolo['ID']);
	}
	
	//BOX 
	$boxNum = '';
	$boxNum = isset($_POST["boxnum"]) ? $_POST["boxnum"] : $boxNum;
	$boxNum = isset($_GET["boxnum"]) ? $_GET["boxnum"] : $boxNum;
	
	$boxDim = 0;
	$boxDim = isset($_POST["boxdim"]) ? $_POST["boxdim"] : $boxDim;
	$boxDim = isset($_GET["boxdim"])  ? $_GET["boxdim"]  : $boxDim;
	
	$boxPeso = 0;
	$boxPeso = isset($_POST["boxpeso"]) ? $_POST["boxpeso"] : $boxPeso;
	$boxPeso = isset($_GET["boxpeso"])  ? $_GET["boxpeso"]  : $boxPeso;
	
	if ($boxNum != ''){
		$appoggio['BOX'] = $boxNum . ' ' . $boxDim . ' ' . $boxPeso;
	}
	
	// FILE
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
		
	//CODE QTY
	$qty = 0;
	$qty = isset($_POST["qty"]) ? $_POST["qty"] : $qty;
	$qty = isset($_GET["qty"]) ? $_GET["qty"] : $qty;
	$qty = Cdec($qty);
	$appoggio['QTA'] = $qty;
	
	$code = '';
	$code = isset($_POST["code"]) ? $_POST["code"] : $code;
	$code = isset($_GET["code"]) ? $_GET["code"] : $code;
	$articolo = '';
	if ($code != ''){
		$articolo = WFVALUEDLOOKUP('ID','articoli',"CODICE = '" . $code . "'");
	}
	if ($articolo != '') {
		$appoggio['CT_ARTICOLI'] = $articolo['ID'];
		$conn->AutoExecute("appoggio", $appoggio, 'INSERT');
	}
	
	
	
?>