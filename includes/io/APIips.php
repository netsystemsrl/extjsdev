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
	$rfid = isset($_GET["rfid"]) ? $_GET["rfid"] : $rfid;
	
	$positionx = '';
	$positionx = isset($_POST["positionx"]) ? $_POST["positionx"] : $positionx;
	$positionx = isset($_GET["positionx"]) ? $_GET["positionx"] : $positionx;
	
	$positiony = '';
	$positiony = isset($_POST["positiony"]) ? $_POST["positiony"] : $positiony;
	$positiony = isset($_GET["positiony"]) ? $_GET["positiony"] : $positiony;
	
	$positionh = '';
	$positionh = isset($_POST["positionz"]) ? $_POST["positionz"] : $positionh;
	$positionh = isset($_GET["positionz"]) ? $_GET["positionz"] : $positionh;
	
	$map = '';
	$map = isset($_POST["map"]) ? $_POST["map"] : $map;
	$map = isset($_GET["map"]) ? $_GET["map"] : $map;
	
	$mappa = WFVALUEDLOOKUP('*','wms_mappe',"ID = " . $map);
	$veicolo = WFVALUEDLOOKUP('*','wms_veicoli'," RFID = '" . $rfid . "'");
	
	/************************************************/
	/*           POSIZIONE REALE 					*/
	/************************************************/
	//AGGIORNO POSIZIONE XYZ ATTUALE
	$sqlC = "UPDATE wms_veicoli 
			SET  X = '" . $positionx . "',
				 Y = '" . $positiony . "',
				 H = '" . $positionh . "',
				 TIMESTAMP = NOW()
			WHERE RFID = '" . $rfid . "'";
	$conn->Execute($sqlC);
	
	//POSIZIONE POSIZIONE UDC ATTUALE 
	$posizione = WFVALUEDLOOKUP('ID','wms_posizioni',"		WMS_CT_MAPPE  = " . $mappa['ID'] . 
													" AND ABS(WPS_X - " . $positionx . ") < 0.9" .
													" AND ABS(WPS_Y - " . $positiony . ") < 0.9" );
	if ($posizione != ''){
		$sqlC = "UPDATE wms_veicoli 
				SET  WMS_CT_POSIZIONI = " . $posizione . " 
				WHERE RFID = '" . $rfid . "'";
				//"AND WMS_CT_POSIZIONI is null";
		$conn->Execute($sqlC);
	}
	
	//MOVIMENTO RILEVATO
	$moved = False;
	if (
		(abs($veicolo['X'] - $positionx) > 0.3) ||
		(abs($veicolo['Y'] - $positiony) > 0.3) 
		){
		$moved = True;
	}
	
	/************************************************/
	/*           LOG POSIZIONE						*/
	/************************************************/
	//AGGIUNGO LOG POSIZIONE XYH
	if ($moved){
		$sqlC = "INSERT INTO wms_log (TIMER, OBJ, X, Y, H, TYPE, WMS_CT_MAPPE)
							VALUES (NOW(), '" . $rfid ."', '" . $positionx . "', '" . $positiony . "', '" . $positionh . "', 'I', '" . $mappa['ID'] ."')";
		
		//$conn->Execute($sqlC);
	}
	
	
	/************************************************/
	/*           POSIZIONE PROPORZIONALE			*/
	/************************************************/
	//POSIZIONE CALCOLO PROPORZIONALE

	if($mappa['MIRROR'] == 1){
	//	$appo = $positionx ;
	//	$positionx = $positiony;
	//	$positiony = $appo;
	}
	
	//$positionx = $positionx *-1
	//if($mappa['CENTREX'] > 0){
	//	$positionx = ($mappa['CENTREX'] * 2) - $positionx;
	//}
	//if($mappa['CENTREY'] > 0){
	//	$positiony = ($mappa['CENTREY'] * 2) - $positiony ;
	//}
	//$positionx =  $positionx + $mappa['CENTREX'] ;
	
	//inverti Y 
	$positiony =  40 + ( -1 * $positiony);
	
	$positionx = ($positionx  * $mappa['SCALE'] );
	$positiony = ($positiony  * $mappa['SCALE'] );
	
	//ruota
	//$rad = deg2rad(180);
	//$radcos = cos($rad);
	//$radsin = sin($rad);
	
	//$positionx = ($positionx  * $radcos ) - ($positiony * $radsin) ;
	//$positiony = ($positionx  * $radsin ) + ($positiony * $radcos) ; 
	//specchia
	
	$positionx = $positionx  + $mappa['OFFSETX'];
	$positiony = $positiony  + $mappa['OFFSETY'];
	
	$sqlC = "UPDATE wms_veicoli 
			SET XMAP = '" . $positionx . "',
				YMAP = '" . $positiony . "'
			WHERE RFID = '" . $rfid . "'";
	$conn->Execute($sqlC);
	
	//AGGIUNGO LOG POSIZIONE XYZ
	if ($moved){
		$sqlC = "INSERT INTO wms_veicolimovimenti (TIMER, WMS_CT_VEICOLI, X, Y, H, TYPE, WMS_CT_MAPPE)
							VALUES (NOW(), '" . $veicolo['ID'] ."', '" . $positionx . "', '" . $positiony . "', '" . $positionh . "', 'G', '" . $mappa['ID'] ."')";
		$conn->Execute($sqlC);
	}
	
	
	$conn->close();
	echo ('OK');
?>