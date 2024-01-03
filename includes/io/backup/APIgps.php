<?php
	// report all errors
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
	$rfid = isset($_GET["rfid"]) ? $_GET["rfid"] : $rfid;
	
	//$positionLat = '';
	//$positionLat = isset($_POST["positionlat"]) ? $_POST["positionlat"] : $positionLat;
	//$positionLat = isset($_GET["positionlat"]) ? $_GET["positionlat"] : $positionLat;
	$positionLatDeg = 0;
	$positionLatDeg = isset($_POST["positionlatdeg"]) ? $_POST["positionlatdeg"] : $positionLatDeg;
	$positionLatDeg = isset($_GET["positionlatdeg"])  ? $_GET["positionlatdeg"]  : $positionLatDeg;
	//$positionLatDir = '';
	//$positionLatDir = isset($_POST["positionlatdir"]) ? $_POST["positionlatdir"] : $positionLatDir;
	//$positionLatDir = isset($_GET["positionlatdir"]) ? $_GET["positionlatdir"] : $positionLatDir;
	
	//$positionLon = '';
	//$positionLon = isset($_POST["positionlon"]) ? $_POST["positionlon"] : $positionLon;
	//$positionLon = isset($_GET["positionlon"]) ? $_GET["positionlon"] : $positionLon;
	$positionLonDeg = 0;
	$positionLonDeg = isset($_POST["positionlondeg"]) ? $_POST["positionlondeg"] : $positionLonDeg;
	$positionLonDeg = isset($_GET["positionlondeg"])  ? $_GET["positionlondeg"]  : $positionLonDeg;
	//$positionLonDir = '';
	//$positionLonDir = isset($_POST["positionlondir"]) ? $_POST["positionlondir"] : $positionLonDir;
	//$positionLonDir = isset($_GET["positionlondir"]) ? $_GET["positionlondir"] : $positionLonDir;
	
	$positionAltitude = '';
	$positionAltitude = isset($_POST["positionaltitude"]) ? $_POST["positionaltitude"] : $positionAltitude;
	$positionAltitude = isset($_GET["positionaltitude"])  ? $_GET["positionaltitude"]  : $positionAltitude;
	
	$positionTimeStamp = '';
	$positionTimeStamp = isset($_POST["positiontimestamp"]) ? $_POST["positiontimestamp"] : $positionTimeStamp;
	$positionTimeStamp = isset($_GET["positiontimestamp"])  ? $_GET["positiontimestamp"]  : $positionTimeStamp;
	
	$positionQuality = '';
	//positionquality
	//positionnsat
	$positionQuality = isset($_POST["positionnsat"]) ? $_POST["positionnsat"] : $positionQuality;
	$positionQuality = isset($_GET["positionnsat"])  ? $_GET["positionnsat"]  : $positionQuality;
	
	$timestamp = '';
	$timestamp = isset($_POST["timestamp"]) ? $_POST["timestamp"] : $timestamp;
	$timestamp = isset($_GET["timestamp"])  ? $_GET["timestamp"]  : $timestamp;
	
	$map = '1';
	$map = isset($_POST["map"]) ? $_POST["map"] : $map;
	$map = isset($_GET["map"]) ? $_GET["map"] : $map;
	
	$mappa   = WFVALUEDLOOKUP('*','wms_mappe',"ID = " . $map);
	$veicolo = WFVALUEDLOOKUP('*','wms_veicoli'," RFID = '" . $rfid . "'");
	
	/************************************************/
	/*        AGGIORNA POSIZIONE VEICOLO			*/
	/************************************************/
	$ErrorUDC  = 0.000002;
	$positionx = Cdec($positionLatDeg);
	$positiony = Cdec($positionLonDeg);
	$positionh = Cdec($positionAltitude);
	if ((abs($veicolo['WPS_GPSX'] - $positionx) > $ErrorUDC) || (abs($veicolo['WPS_GPSY'] - $positiony) > $ErrorUDC) ){
		$moved = True;
	}else{
		$moved = False;
	}
	$veicolo['WPS_GPSX'] = $positionx;
	$veicolo['WPS_GPSY'] = $positiony;
	$veicolo['WPS_GPSH'] = $positionh;
	$veicolo['WPS_GPST'] = $positionTimeStamp;
	$veicolo['WPS_GPSQ'] = $positionQuality;
	$veicolo['TIMESTAMP'] = $timestamp;
	$veicolo['WPS_GPSXO'] = $positionx;
	$veicolo['WPS_GPSYO'] = $positiony;
	
	
	/*           POSIZIONE REALE RTK
	// GPSZERO,44.70188800,10.44846400   ZERO del .240
	if ($veicolo['ID'] == 240){
		//PUNTO FISSO 
		$zero = array();
		$zero['WPS_GPSX'] =44.70188800;
		$zero['WPS_GPSY'] =10.44846400;
		$zero['WPS_GPSH'] =100;
		//DIFFERENZIALE
		$mappa['WPS_GPSXC'] = $positionx - $zero['WPS_GPSX'];
		$mappa['WPS_GPSYC'] = $positiony - $zero['WPS_GPSY'];
		$mappa['WPS_GPSHC'] = $zero['WPS_GPSH'] - $veicolo['WPS_GPSH'];
		$conn->AutoExecute("wms_mappe", $mappa, 'UPDATE', 'ID = ' . $mappa['ID']);
	}else{
		//APPLICO CORREZIONE
		$veicolo['WPS_GPSX'] = $veicolo['WPS_GPSX'] + abs($mappa['WPS_GPSXC']);
		$veicolo['WPS_GPSY'] = $veicolo['WPS_GPSY'] + abs($mappa['WPS_GPSYC']);
		$veicolo['WPS_GPSH'] = $veicolo['WPS_GPSH'] + $mappa['WPS_GPSHC'];
	}
	*/
	
	//POSIZIONE POSIZIONE UDC ATTUALE 
	$posizione = WFVALUEDLOOKUP('ID','wms_posizioni',"WMS_CT_MAPPE  = " . $mappa['ID'] . 
												" AND ABS(WPS_GPSX - " . $veicolo['WPS_GPSX'] . ") < " . $ErrorUDC .
												" AND ABS(WPS_GPSY - " . $veicolo['WPS_GPSY'] . ") < " . $ErrorUDC );
	if ($posizione != ''){
		$veicolo['WMS_CT_POSIZIONI'] =  $posizione;
	}
	
	
	//deprecated
	//POSIZIONE CALCOLO PROPORZIONALE
	$positionx = $positionx -44.65000000;
	$positiony = $positiony -10.77000000;
	$positionx = number_format((float)$positionx, 2, '.', '');
	$positiony = number_format((float)$positiony, 2, '.', '');
	
	$positionx = ($positionx  * $mappa['GPSSCALE'] );
	$positiony = ($positiony  * $mappa['GPSSCALE'] );
	
	$positionx = $positionx  + $mappa['GPSOFFSETX'];
	$positiony = $positiony  + $mappa['GPSOFFSETY'];
	
	$veicolo['XMAP'] = $positionx; 
	$veicolo['YMAP'] = $positiony;
	
	$conn->AutoExecute("wms_veicoli", $veicolo, 'UPDATE', 'ID = ' . $veicolo['ID']);
	
	
	/************************************************/
	/*          AGGIUNGO LOG POSIZIONE XYZ         	*/
	/************************************************/
	$moved = 0;
	if ($veicolo['ID'] != 240){
		$moved = 1;
	}
	if ($moved){
		$veicoloMovimento = array();
		$veicoloMovimento['X'] = $veicolo['X'];
		$veicoloMovimento['Y'] = $veicolo['Y'];
		$veicoloMovimento['H'] = $veicolo['H'];
		$veicoloMovimento['WPS_GPST'] = $veicolo['WPS_GPST'];
		$veicoloMovimento['WPS_GPSX'] = $veicolo['WPS_GPSX'];
		$veicoloMovimento['WPS_GPSY'] = $veicolo['WPS_GPSY'];
		$veicoloMovimento['WPS_GPSH'] = $veicolo['WPS_GPSH'];
		$veicoloMovimento['WPS_GPSQ'] = $veicolo['WPS_GPSQ'];
		$veicoloMovimento['WPS_GPST'] = $veicolo['WPS_GPST'];
		$veicoloMovimento['WPS_GPSXO'] = $veicolo['WPS_GPSXO'];
		$veicoloMovimento['WPS_GPSYO'] = $veicolo['WPS_GPSYO'];
		$veicoloMovimento['TIMER'] = $veicolo['TIMESTAMP'];
		$veicoloMovimento['WMS_CT_VEICOLI'] = $veicolo['ID'];
		$veicoloMovimento['WMS_CT_MAPPE'] = $mappa['ID'];
		$conn->AutoExecute("wms_veicolimovimenti", $veicoloMovimento, 'INSERT' );
	}
	
	
	$conn->close();
	echo ('OK');
?>