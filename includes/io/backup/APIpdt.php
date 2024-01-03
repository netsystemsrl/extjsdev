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
	$veicolo = isset($_POST["reader"]) ? $_POST["reader"] : $veicolo;
	$veicolo = isset($_GET["reader"])  ? $_GET["reader"]  : $veicolo;
	$veicolo = WFVALUEDLOOKUP('*','wms_veicoli'," RFID = '" . $veicolo . "'");
	
	$cmd = '';
	$cmd = isset($_POST["cmd"]) ? $_POST["cmd"] : $cmd;
	$cmd = isset($_GET["cmd"]) ? $_GET["cmd"] : $cmd;
	
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
	
	$message = '';
	$message = isset($_POST["message"]) ? $_POST["message"] : $message;
	$message = isset($_GET["message"]) ? $_GET["message"] : $message;
	
	
	//POSITION 
	$ErrorUDC  = 0.000002;
	$positionMaga = '';
	$positionMaga = isset($_POST["positionmaga"]) ? $_POST["positionmaga"] : $positionMaga;
	$positionMaga = isset($_GET["positionmaga"]) ? $_GET["positionmaga"] : $positionMaga;
	
	$positionEvent = '';
	$positionEvent = isset($_POST["positionevent"]) ? $_POST["positionevent"] : $positionEvent;
	$positionEvent = isset($_GET["positionevent"])  ? $_GET["positionevent"]  : $positionEvent;
	
	$positionDuration = '';
	$positionDuration = isset($_POST["positionduration"]) ? $_POST["positionduration"] : $positionDuration;
	$positionDuration = isset($_GET["positionduration"])  ? $_GET["positionduration"]  : $positionDuration;
	
	$positionDistance = '';
	$positionDistance = isset($_POST["positiondistance"]) ? $_POST["positiondistance"] : $positionDistance;
	$positionDistance = isset($_GET["positiondistance"])  ? $_GET["positiondistance"]  : $positionDistance;
	
	$positionLatDeg = 0;
	$positionLatDeg = isset($_POST["positionlatdeg"]) ? $_POST["positionlatdeg"] : $positionLatDeg;
	$positionLatDeg = isset($_GET["positionlatdeg"])  ? $_GET["positionlatdeg"]  : $positionLatDeg;
	$positionLatDeg = Cdec($positionLatDeg);
	
	$positionLngDeg = 0;
	$positionLngDeg = isset($_POST["positionlngdeg"]) ? $_POST["positionlngdeg"] : $positionLngDeg;
	$positionLngDeg = isset($_GET["positionlngdeg"])  ? $_GET["positionlngdeg"]  : $positionLngDeg;
	$positionLngDeg = Cdec($positionLngDeg);
	
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
	}
	if (($positionLatDeg >0) && ($positionLngDeg >0)){
		$veicolo['WPS_GPSX'] = $positionLatDeg;
		$veicolo['WPS_GPSY'] = $positionLngDeg;
		$veicolo['WPS_GPSH'] = $positionAltitude;
		$veicolo['WPS_GPST'] = time();
		
		$conn->AutoExecute("wms_veicoli", $veicolo, 'UPDATE', 'ID = ' . $veicolo['ID']);
		
		
		$posizione = WFVALUEDLOOKUP('ID','wms_posizioni',"WMS_CT_MAPPE  = " . $positionMap['ID'] . 
													" AND ABS(WPS_GPSX - " . $veicolo['WPS_GPSX'] . ") < " . $ErrorUDC .
													" AND ABS(WPS_GPSY - " . $veicolo['WPS_GPSY'] . ") < " . $ErrorUDC );
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
	
	$SERIALBATCH = '';
	$ArtQty = 0;
	$ArtCode = '';
	$articolo = '';
	
	//SERIALBATCH
	$SERIALBATCH = isset($_POST["serialbatch"]) ? $_POST["serialbatch"] : $SERIALBATCH;
	$SERIALBATCH = isset($_GET["serialbatch"]) ? $_GET["serialbatch"] : $SERIALBATCH;
	
	//CODE SSCC
	$SSCC = '';
	$SSCC = isset($_POST["sscc"]) ? $_POST["sscc"] : $SSCC;
	$SSCC = isset($_GET["sscc"]) ? $_GET["sscc"] : $SSCC;
	if ($SSCC != ''){
		$UDC = WFVALUEDLOOKUP('*','wms_udc',"SSCC = '" . $SSCC . "'");
		$articolo = WFVALUEDLOOKUP('*','articoli',"ID = " . $UDC['CT_ARTICOLI'] . "");
		$SERIALBATCH = $UDC['SERIALBATCH'];
		$ArtCode = $articolo['CODICE'];
		$ArtQty = 0;
	}
	
	//CODE QTY
	$ArtQty = isset($_POST["qty"]) ? $_POST["qty"] : $ArtQty;
	$ArtQty = isset($_GET["qty"]) ? $_GET["qty"] : $ArtQty;
	//$ArtQty = Cdec($ArtQty);
	$appoggio['QTA'] = $ArtQty;
	
	$ArtCode = isset($_POST["code"]) ? $_POST["code"] : $ArtCode;
	$ArtCode = isset($_GET["code"]) ? $_GET["code"] : $ArtCode;
	if ($ArtCode != ''){ 
		$appoggio['CODICE'] = $ArtCode;
	}

	//DOCUMENT
	$DocumentId = '';
	$DocumentId = isset($_POST["documentid"]) ? $_POST["documentid"] : $DocumentId;
	$DocumentId = isset($_GET["documentid"]) ? $_GET["documentid"] : $DocumentId;
	
	$DocumentType = '';
	$DocumentType = isset($_POST["documenttype"]) ? $_POST["documenttype"] : $DocumentType;
	$DocumentType = isset($_GET["documenttype"]) ? $_GET["documenttype"] : $DocumentType;

	
	$appoggio['CODICE'] = $ArtCode;
	//	var_dump($appoggio);
	
	if ($ArtCode != ''){
		$articolo = WFVALUEDLOOKUP('*','articoli',"CODICE = '" . $ArtCode . "'");
	}

	if ($cmd == 'gps'){
		$veicoloMovimento['TIMER'] = WFVALUENOW();
		$veicoloMovimento['WPS_GPSX'] = $veicolo['WPS_GPSX'];
		$veicoloMovimento['WPS_GPSY'] = $veicolo['WPS_GPSY'];
		$veicoloMovimento['WPS_GPSH'] = $veicolo['WPS_GPSH'];
		$veicoloMovimento['WPS_GPST'] = $veicolo['WPS_GPST'];
		$veicoloMovimento['WMS_CT_VEICOLI'] = $veicolo['ID'];
		$veicoloMovimento['WMS_CT_MAPPE'] = $positionMap['ID'];
		
		$veicoloMovimento['STATO'] = $positionEvent;
		if ($positionEvent==0){
			$veicoloMovimento['EVENTO'] = 'IN';
		}elseif ($positionEvent==1){
			$veicoloMovimento['EVENTO'] = 'MOVE';
		}elseif ($positionEvent==2){
			$veicoloMovimento['EVENTO'] = 'OUT';
		}elseif ($positionEvent==3){
			$veicoloMovimento['EVENTO'] = 'LOAD';
		}elseif ($positionEvent==4){
			$veicoloMovimento['EVENTO'] = 'UNLOAD';
		}elseif ($positionEvent==5){
			$veicoloMovimento['EVENTO'] = 'STOP';
		}
		//$veicoloMovimento['PESO'] = $positionEvent; 
		
		$veicoloMovimento['DURATA'] = $positionDuration;
		$veicoloMovimento['DISTANZA'] = $positionDistance;
		$conn->AutoExecute("wms_veicolimovimenti", $veicoloMovimento, 'INSERT' );
		$output["message"] = "OK";	
	}
	
	if ($message != ''){
		$veicoloMovimento['TIMER'] = WFVALUENOW();
		$veicoloMovimento['INTERFACE'] = $message;
		//$veicoloMovimento['MACHINE'] = $veicolo['ID'];
		$veicoloMovimento['RFID'] = $message;
		$conn->AutoExecute("aaaamessage", $veicoloMovimento, 'INSERT' );
		$output["message"] = "OK";	
	}
	
	if ($cmd == 'ins'){
		if ( ($ArtQty != 0) ) {
			$appoggio['CT_ARTICOLI'] = $articolo['ID'];
			$conn->AutoExecute("appoggio", $appoggio, 'INSERT');
				$output["message"] = "OK";
		}else{
			var_dump($articolo);
		}
		if ($DocumentId != ''){
			$ordmovimenti = WFVALUEDLOOKUP('*','ordmovimenti',"CT_ORD = " . $DocumentId . " AND CT_ARTICOLI " . $articolo['ID']);
			if ($ordmovimenti != ''){
				$output["message"] = "ART NON IN ORDINE";
			}
		}
	}
	
	if ($cmd == 'doc'){
		$ord = WFVALUEDLOOKUP('*','ord',"ID = " . $DocumentId . "");
		$ordmovimenti = WFVALUEDLOOKUP('*','ordmovimenti',"CT_ORD = " . $DocumentId . " AND QTORD > 0");
		//QTORD
		$output["message"] = "Prossimo Articolo da Spedire";
		var_dump($ord);
	}
	
	$output["gps_radius"] = 90.1;
	
	$Appo = Array2JSON($output, $debugmessage);
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo $Appo;
	
?>