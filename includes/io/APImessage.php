<?php
//	http://172.16.9.250/index.php?username=prod&machine=PINZAINTRADOSSO1&operator=15&api=message&timer=0&interface=PINZA&password=135792468&dbname=isocell&rfid=S31216593&datetime=2021-04-26+17%3A57%3A10
//http://172.16.9.250/index.php?username=prod&machine=CAM4&operator=&api=message&timer=216&interface=CAMION&password=135792468&dbname=isocell&rfid=E28011057000020EEE1E7945&datetime=2021-04-26+09%3A27%3A49
require_once($_SERVER['DOCUMENT_ROOT'] . '/includes/var.php');
WFSetDebug(false);

	$output = array();
	$output["metaData"]["idProperty"] = "ID";
	$output["metaData"]["totalProperty"] = "total";
	$output["metaData"]["successProperty"] = "success";
	$output["metaData"]["rootProperty"] = "data";
	$output["metaData"]["root"] = "data";
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
	$debugmessage = 0;
	$readeddataArray = array();

	//MAIN
	$interface = '';    //mixer
	$interface = isset($_POST["interface"]) ? $_POST["interface"] : $interface;
	$interface = isset($_GET["interface"]) ? $_GET["interface"] : $interface;
	$interface = trim($interface);

	$machine = '';  //seria0
	$machine = isset($_POST["machine"]) ? $_POST["machine"] : $machine;
	$machine = isset($_GET["machine"]) ? $_GET["machine"] : $machine;
	$machine = trim($machine);

	$poscode = '';
	$poscode = isset($_POST["poscode"]) ? $_POST["poscode"] : $poscode;
	$poscode = isset($_GET["poscode"]) ? $_GET["poscode"] : $poscode;

	$palcode = '';
	$palcode = isset($_POST["palcode"]) ? $_POST["palcode"] : $palcode;
	$palcode = isset($_GET["palcode"]) ? $_GET["palcode"] : $palcode;
	
	$planningid = '';
	$planningid = isset($_POST["planningid"]) ? $_POST["planningid"] : $planningid;
	$planningid = isset($_GET["planningid"]) ? $_GET["planningid"] : $planningid;

	$timer = '';
	$timer = isset($_POST["timer"]) ? $_POST["timer"] : $timer;
	$timer = isset($_GET["timer"]) ? $_GET["timer"] : $timer;

	$status = '';
	$status = isset($_POST["status"]) ? $_POST["status"] : $status;
	$status = isset($_GET["status"]) ? $_GET["status"] : $status;

	$peso = 0;
	$peso = isset($_POST["peso"]) ? $_POST["peso"] : $peso;
	$peso = isset($_GET["peso"]) ? $_GET["peso"] : $peso;

	$address = '';
	$address = isset($_POST["address"]) ? $_POST["address"] : $address;
	$address = isset($_GET["address"]) ? $_GET["address"] : $address;
	
	$operator = '';
	$operator = isset($_POST["operator"]) ? $_POST["operator"] : $operator;
	$operator = isset($_GET["operator"]) ? $_GET["operator"] : $operator;

	$latitude = '';
	$latitude = isset($_POST["latitude"]) ? $_POST["poslatitude"] : $latitude;
	$latitude = isset($_GET["latitude"]) ? $_GET["poslatitude"] : $latitude;
	if ($latitude == 'nan') $latitude = '';

	$longitude = '';
	$longitude = isset($_POST["poslongitude"]) ? $_POST["poslongitude"] : $longitude;
	$longitude = isset($_GET["poslongitude"]) ? $_GET["poslongitude"] : $longitude;
	if ($longitude == 'nan') $longitude = '';
	
	$distancegps = '';
	$distancegps = isset($_POST["distancegps"]) ? $_POST["distancegps"] : $distancegps;
	$distancegps = isset($_GET["distancegps"]) ? $_GET["distancegps"] : $distancegps;

	$posy = '';
	$posy = isset($_POST["posy"]) ? $_POST["posy"] : $posy;
	$posy = isset($_GET["posy"]) ? $_GET["posy"] : $posy;

	$posx = '';
	$posx = isset($_POST["posx"]) ? $_POST["posx"] : $posx;
	$posx = isset($_GET["posx"]) ? $_GET["posx"] : $posx;

	$height = '';
	$height = isset($_POST["height"]) ? $_POST["height"] : $height;
	$height = isset($_GET["height"]) ? $_GET["height"] : $height;

	$distance = '';
	$distance = isset($_POST["distance"]) ? $_POST["distance"] : $distance;
	$distance = isset($_GET["distance"]) ? $_GET["distance"] : $distance;

	$fileimage = '';
	$fileimage = isset($_POST["fileimage"]) ? $_POST["fileimage"] : $fileimage;
	$fileimage = isset($_GET["fileimage"]) ? $_GET["fileimage"] : $fileimage;

	$CurDateTime = new DateTime();

	$datetime = '';
	$datetime = isset($_POST["datetime"]) ? $_POST["datetime"] : $datetime;
	$datetime = isset($_GET["datetime"]) ? $_GET["datetime"] : $datetime;
	
	$datetimeobj = New DateTime($datetime);
	$data = $datetimeobj->format('Y-m-d');
	$time = $datetimeobj->format('H:i:s');
	$date = new DateTime();
					
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
	
	
	/*CASA
	$longitude = 10.4485555;
	$latitude = 44.7018405;
	*/
	/* CHIESA
	$longitude = 10.44815267;
	$latitude = 44.70228583;
	*/
	/* PALTINA 
	$longitude =  10.4491500;
	$latitude  = 44.70231000;
	*/

//UPDATE IDENTIFICAZIONE  IOT 
$ip = $_SERVER['REMOTE_ADDR'];
$iot = WFVALUEDLOOKUP('*', 'iot', "DESCNAME  = '" . $machine . "'");
if ($iot == '') {
	$iot = WFVALUEDLOOKUP('*', 'iot', "IP  = '" . $ip . "'");
}
if ($iot == '') {
	$iot = array();
	$iot['DESCNAME'] = $machine;
	$iot['IP'] = $ip;
	$iot['PORT'] = 80;
	$iot['LIBRARY'] = 'APIEXTJSDEV';
	$iot['NOTE'] = 'AUTO ADD';
	$conn->AutoExecute("iot", $iot, 'INSERT');
	$iot['ID'] = $conn->Insert_ID();
}
$iot['SR'] = $datetime;
$iot['SC'] = $CurDateTime->getTimestamp();
$conn->AutoExecute("iot", $iot, 'UPDATE', 'ID = ' . $iot['ID']);

// UPDATE ANAGRAFICHE
$AnagraficaAziendaID = WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA');
$CausaleAutoProduzione = WFVALUEDLOOKUP('*','causali','ID = ' . WFVALUEGLOBAL('MRP_CAUSALEAUTOPRODUZIONE'));
$CausalePrenotazione = WFVALUEDLOOKUP('*','causali','ID = ' . WFVALUEGLOBAL('MRP_CAUSALEPRENOTAZIONE'));
$CausaleVendita = WFVALUEDLOOKUP('*','causali','ID = ' . 1);
$recordEsercizio  = WFVALUEDLOOKUP('*', 'cg_contabileesercizi', "DATAFINE >= " . WFSQLTODATE(WFVALUENOW('Y-m-d') ) . " AND DATAINIZIO <= " . WFSQLTODATE(WFVALUENOW('Y-m-d') ) );
$MagazzinoID  = WFVALUEGLOBAL('MAGAZZINO');
$VeicoloWMS   = '';
$VeicoloIOT   = '';
$PosizioneWMS = '';
$UDCWMS       = '';
$ResourceIOT  = '';
$ResourceMPS  = '';
$spostamentotempo = '';
$spostamento = '';

if ($interface != ''){
	$VeicoloWMS     = WFVALUEDLOOKUP('*', 'wms_veicoli',   "CT_IOT  = " . $iot['ID']);
	$VeicoloIOT     = WFVALUEDLOOKUP('*', 'iot',           "DESCNAME  = '" . $machine . "'");
	//$ResourceIOT    = WFVALUEDLOOKUP('*', 'mes_resourcesiot', "CT_IOT  =" . $iot['ID'] ); 
	//$ResourceMPS    = WFVALUEDLOOKUP('*', 'mps_resources', "ID  = " . $ResourceIOT['MPS_CT_RESOURCES']); 
	$AppoVeicoloWMS = array();
	$AppoVeicoloWMS['SR'] = $datetime;
	$AppoVeicoloWMS['SC'] = $CurDateTime->getTimestamp();
	
	/* RICERCA POSIZIONE */
	$VeicoloMappa  = WFVALUEDLOOKUP('*','wms_veicolimappe',"WMS_CT_VEICOLI = " . $VeicoloWMS['ID']); 
	$Mappa         = WFVALUEDLOOKUP('*','wms_mappe',       "ID = " . $VeicoloMappa['WMS_CT_MAPPE']);
	
	
	//POSIZIONE poscode
	if ($poscode!= ''){
		$PosizioneWMS = WFVALUEDLOOKUP('ID','wms_posizioni',"WMS_CT_MAPPE  = " . $Mappa['ID'] . " AND RFID = '" . $poscode . "'"  );
	}
	//POSIZIONE ADDRESS
	elseif ($address!= ''){
		$PosizioneWMS = WFVALUEDLOOKUP('ID','wms_posizioni',"WMS_CT_MAPPE  = " . $Mappa['ID'] . " AND ADDRESS = '" . $address . "'"  );
	}
	//POSIZIONE gradi assoluti longitude latitude
	elseif ($longitude!= ''){
		$AppoVeicoloWMS['WPS_GPSLON'] = $longitude;
		$AppoVeicoloWMS['WPS_GPSLAT'] = $latitude;
		$AppoVeicoloWMS['WPS_GPSALT'] = $height;
		$AppoVeicoloWMS['WPS_GPSUTC'] = $datetime;
		$AppoVeicoloWMS['STATO'] = $distance;
		if ($status != ''){
			$AppoVeicoloWMS['STATO'] = $status;
		}
		$ErrorUDC = 0.00000001;
		//$PosizioneWMS = WFVALUEDLOOKUP('ID','wms_posizioni',"WMS_CT_MAPPE  = " . $Mappa['ID'] . 
		//												" AND ABS(WPS_GPSLON - " . $AppoVeicoloWMS['WPS_GPSLON'] . ") <= " . $ErrorUDC .
		//												" AND ABS(WPS_GPSLAT - " . $AppoVeicoloWMS['WPS_GPSLAT'] . ") <= " . $ErrorUDC );
		$PosizioneWMS = '';
	}
	//POSIZIONE XYZ
	elseif ($posx!= ''){
		$AppoVeicoloWMS['WPS_X'] = $posx;
		$AppoVeicoloWMS['WPS_Y'] = $posy;
		$AppoVeicoloWMS['WPS_H'] = $height;
		$ErrorUDC = 1;
		$PosizioneWMS = WFVALUEDLOOKUP('ID','wms_posizioni',"WMS_CT_MAPPE  = " . $Mappa['ID'] . 
														" AND ABS(WPS_POSX - " . $AppoVeicoloWMS['WPS_POSX'] . ") <= " . $ErrorUDC .
														" AND ABS(WPS_POSY - " . $AppoVeicoloWMS['WPS_POSY'] . ") <= " . $ErrorUDC );
	}
	
	//POSIZIONE UDC 
	if ($PosizioneWMS != ''){
		$AppoVeicoloWMS['WMS_CT_POSIZIONI'] = $PosizioneWMS['ID'];
	}
	$conn->AutoExecute("wms_veicoli", $AppoVeicoloWMS, 'UPDATE', 'ID = ' . $VeicoloWMS['ID']);	
}

/* MESSAGE IOT*/
$aaaamessage = array();
$aaaamessage['SI'] = $date->getTimestamp(); 
$aaaamessage['SR'] = $date->getTimestamp(); 
$aaaamessage['SC'] = $date->getTimestamp(); 
$aaaamessage['SA'] = $UserId; 
$aaaamessage['URL'] =  $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
$aaaamessage['INTERFACE'] =  $interface;
$aaaamessage['MACHINE'] =  $machine;
$aaaamessage['RFID'] =  $palcode;
$aaaamessage['INFO'] =  $poscode;
$aaaamessage['TIMER'] =  $timer;
$aaaamessage['DATA'] =  $datetime;
$aaaamessage['OPERATOR'] =  $operator;
$aaaamessage['STATO'] =  $status;
$aaaamessage['EVENTO'] = $status;
$aaaamessage['WPS_GPSX'] = $longitude;
$aaaamessage['WPS_GPSY'] = $latitude;
if ($PosizioneWMS != '')	$aaaamessage['WMS_CT_POSIZIONI'] =  $PosizioneWMS['ID'];
if ($VeicoloWMS != '')		$aaaamessage['WMS_CT_VEICOLI'] =  $VeicoloWMS['ID'];
$conn->AutoExecute("aaaamessage", $aaaamessage, 'INSERT');
$MsgID = $conn->Insert_ID();

// ADD MOVIMENTI
if ($conn->debug == 1) echo('ADD MOVIMENTI' . BRCRLF);

if ($interface == 'PINZA') {
	//DATI DA PINZA CODICE BARCODE
	if ($conn->debug == 1) echo('DATI DA PINZA CODICE BARCODE' . BRCRLF);

	$UDCvalid = 0;
	//DATI DA VMT 
	if ($UDCWMS == '') {
		try {
			$cnVMT = ADONewConnection('mssqlnative');
			$cnVMT->debug = $conn->debug;
			$cnVMT->SetFetchMode(ADODB_FETCH_ASSOC);
			$cnVMT->setConnectionParameter('characterSet', 'UTF-8');
			$cnVMT->connect('172.16.10.5', 'View', 'ExternalVIEW', 'SDS31_DB');
			$sqlSegmenti = "SELECT * 
							FROM [SDS31_DB].[View].[CustomExport01] 
							WHERE BARCODE = '" . $barcode . "'";
			$rsSegmenti = $cnVMT->Execute($sqlSegmenti);
			if ($rsSegmenti) {
				$ConcioProgressivo = $rsSegmenti->fields['SEGMENT']; //PEZZO PROGRESSIVO    $rfid
				$ConcioArticoloCodice = $rsSegmenti->fields['SEGMENT_TYPE']; //PEZZO ARTICOLO
				$ConcioArticolo = WFVALUEDLOOKUP('*', 'articoli', "CODICE = '" . $ConcioArticoloCodice . "'");

				$ConcioDataOraStart = $rsSegmenti->fields['MOULDED_DATE']; //PEZZO INIZIO
				$ConcioDataOraEnd = $rsSegmenti->fields['FINISHED_DATE']; //PEZZO FINE

				$ConcioStampoCodice = $rsSegmenti->fields['MOU_NAME']; //PEZZO STAMPO
				$ConcioStampoPosizione = WFVALUEDLOOKUP('*', 'wms_posizioni', "CODICE LIKE '%" . $ConcioStampoCodice . "%'");

				$GabbiaProgressivo =  $rsSegmenti->fields['REINFORCEMENT']; //GABBIA PROGRESSIVO
				$GabbiaArticoloCodice = $rsSegmenti->fields['REINFORCEMENT_TYPE']; //GABBIA ARTICOLO
				$GabbiaArticolo = WFVALUEDLOOKUP('*', 'articoli', "CODICE = '" . $GabbiaArticoloCodice . "'");

				$UDCWMS = array();
				$UDCWMS['CT_DDT'] = null;
				$UDCWMS['CT_DDTMOVIMENTI'] = null;
				$UDCWMS['MES_CT_PLANNING'] = null;
				$UDCWMS['CT_ARTICOLI'] = $ConcioArticolo['ID'];
				$UDCWMS['MPS_CT_RESOURCES'] = 24; //STAMPAGGIO
				$UDCWMS['SSCC'] = $ConcioProgressivo;
				$UDCWMS['EANUDC'] = $rfid;
				$UDCWMS['DATA'] = $datetime;
				$UDCWMS['SI'] = $datetime;
				$UDCWMS['SR'] = $datetime;
				$UDCWMS['SC'] = $CurDateTime->getTimestamp();
				$UDCWMS['SSCCPARENT'] = null;
				$UDCWMS['SERIALBATCH'] = $rfid;
				$UDCWMS['PESO'] = 0;
				$UDCWMS['QTA'] = 1;
				
				
				/* SCRIVE PLANNING */
				$Planning = array();
				
				//3 turni inzio e fine GETTO
				$Turno = 0;
				$Momento = New DateTime($time);
				$Planning['RIGA'] = $Momento->format('H:m:s');
				
				$date1S = New DateTime("05:00");
				$date1E = New DateTime("13:59");
				
				$date2S = New DateTime("14:00");
				$date2E = New DateTime("21:59");
				
				$date3S = New DateTime("22:00");
				$date3E = New DateTime("23:59");
				$date3BS = New DateTime("00:00");
				$date3BE = New DateTime("04:59");
				if ($Momento > $date1S && $Momento < $date1E){
					$Turno = 'A';
					$Planning['DATEPLANAT'] = $data;
					$Planning['DATESTART'] = $data . ' ' . $date1S->format('H:i:s');
				}
				elseif ($Momento > $date2S && $Momento < $date2E){
					$Turno = 'B';
					$Planning['DATEPLANAT'] = $data;
					$Planning['DATESTART'] = $data . ' ' . $date2S->format('H:i:s');
				}
				elseif ($Momento > $date3S && $Momento < $date3E){
					$Turno = 'C';
					$Planning['DATEPLANAT'] = $data;
					$Planning['DATESTART'] = $data . ' ' . $date3S->format('H:i:s');
				}
				elseif ($Momento > $date3BS && $Momento < $date3BE){
					$Turno = 'C';
					$UDCWMS['DATA'] = WFVALUEDATEADD($data ,-1,'d')->format('Y-m-d');
					$data = WFVALUEDATEADD($data ,-1,'d')->format('Y-m-d');
					$Planning['DATEPLANAT'] = $UDCWMS['DATA'];
					$Planning['DATESTART'] = $data . ' ' . $date3S->format('H:i:s');
				}
				$Planning['SERIALBATCH'] = WFVALUEYEAR($UDCWMS['DATA']) . '-' . WFVALUEDAYOFYEAR($UDCWMS['DATA']) . $Turno;
				$Stampaggio = WFVALUEDLOOKUP('*','mps_resources',"DESCRIZIONE = 'STAMPAGGIO'");
				$Planning['MPS_CT_RESOURCES'] = $Stampaggio['ID'];
				$PlanningFind = WFVALUEDLOOKUP('*', 'mes_planning', "SERIALBATCH = '" . $Planning['SERIALBATCH'] . "' and MPS_CT_RESOURCES = " .$Planning['MPS_CT_RESOURCES'], ADODB_FETCH_ASSOC);
				$AppoDdtCarico = array();
				$AppoDdtScarico = array();
				if ($PlanningFind == ''){
					//$Planning['CT_ARTICOLI'] = $Articolo['ID'];
					$Planning['CT_ORDMOVIMENTI'] = null;
					$Planning['QTYPLAN'] = NULL;
					$Planning['QTYPRO'] = NULL;
					$conn->AutoExecute("mes_planning", $Planning, 'INSERT');
					$Planning['ID'] = $conn->Insert_ID();
					
					/* SCRIVE DDT CARICO TESTA  */
					$AppoDdtCarico['PDMORIGIN'] = 4;
					//$AppoDdtCarico['CT_OPERATORE'] = $Planning['CT_OPERATORE'];
					$AppoDdtCarico['CT_FATTURAZIONE'] = $AnagraficaAziendaID;
					$AppoDdtCarico['RIF'] = $Planning['SERIALBATCH'];
					$AppoDdtCarico['DOCDATA'] = $Planning['DATEPLANAT'];

					$AppoDdtCarico['CT_MAGAZZINI'] = $MagazzinoID;
					$AppoDdtCarico['CG_CT_CONTABILEESERCIZI'] = $recordEsercizio['ID'];
					$AppoDdtCarico['CT_CAUSALI'] = $CausaleAutoProduzione['ID']; 
					$AppoDdtCarico['SEGNO'] = $CausaleAutoProduzione['SEGNO'];
					$AppoDdtCarico['CT_SEZIONALI'] = $CausaleAutoProduzione['CT_SEZIONALI'];
					$AppoDdtCarico['DOCNUM'] = 'PFC-' . $Planning['SERIALBATCH'];
					$conn->AutoExecute("ddt", $AppoDdtCarico, 'INSERT');
					$AppoDdtCarico['ID'] = $conn->Insert_ID();
					$AppoDdtCarico['CT_DDTGROUP'] = $AppoDdtCarico['ID'];
					$conn->AutoExecute("ddt", $AppoDdtCarico, 'UPDATE', 'ID=' . $AppoDdtCarico['ID']);
					
					/* SCRIVE DDT SCARICO TESTA  */
					$AppoDdtScarico['PDMORIGIN'] = 4;
					$AppoDdtScarico['CT_DDTGROUP'] = $AppoDdtCarico['ID'];
					$AppoDdtScarico['CT_FATTURAZIONE'] = $AnagraficaAziendaID;
					$AppoDdtScarico['RIF'] = $Planning['PROGRESSIVO'];
					$AppoDdtScarico['DOCDATA'] = $Planning['DATEPLANAT'];
					$AppoDdtScarico['CT_MAGAZZINI'] = $MagazzinoID;
					$AppoDdtScarico['CG_CT_CONTABILEESERCIZI'] = $recordEsercizio['ID'];
					$AppoDdtScarico['CT_CAUSALI'] = $CausalePrenotazione['ID']; 
					$AppoDdtScarico['SEGNO'] = $CausalePrenotazione['SEGNO'];
					$AppoDdtScarico['CT_SEZIONALI'] = $CausalePrenotazione['CT_SEZIONALI'];
					$AppoDdtScarico['DOCNUM'] = 'PFS-' . $Planning['SERIALBATCH'];
					$conn->AutoExecute("ddt", $AppoDdtScarico, 'INSERT');
					$AppoDdtScarico['ID'] = $conn->Insert_ID();

				}else{
					$Planning['QTYPLAN'] = NULL;
					$Planning['QTYPRO'] = NULL;
					$conn->AutoExecute("mes_planning", $Planning, 'UPDATE', 'ID = ' . $PlanningFind['ID']);
					$Planning = $PlanningFind;
					
					$AppoDdtCarico  = WFVALUEDLOOKUP('*','ddt',"DOCNUM =  'PFC-" . $Planning['SERIALBATCH'] ."'");
					$AppoDdtScarico = WFVALUEDLOOKUP('*','ddt',"DOCNUM =  'PFS-" . $Planning['SERIALBATCH'] ."'");
				}
				
				/* SCRIVE DDT CARICO RIGHE */
				$AppoDdtCaricoMovimenti = array();
				$AppoDdtCaricoMovimenti['CT_DDT'] = $AppoDdtCarico['ID'];
				$AppoDdtCaricoMovimenti['CT_ARTICOLI'] = $ConcioArticolo['ID'];
				$AppoDdtCaricoMovimenti['QTA'] = 1;
				$AppoDdtCaricoMovimenti['QTARIGA'] = 1;
				$AppoDdtCaricoMovimenti['SERIALBATCH'] = $Planning['SERIALBATCH'];
				$conn->AutoExecute("ddtmovimenti", $AppoDdtCaricoMovimenti, 'INSERT');
				$AppoDdtCaricoMovimenti['ID'] = $conn->Insert_ID();
				
				/* SCRIVE DDT SCARICO RIGHE */
				$sqlSegmentiDB = "SELECT * 
							FROM articoliarticoli
							WHERE CT_ARTICOLIPARENT  = " . $AppoDdtCaricoMovimenti['CT_ARTICOLI'];
				$rsSegmentiDB = $conn->Execute($sqlSegmentiDB);
				while (!$rsSegmentiDB->EOF) {	
					$AppoDdtScaricoMovimenti = array();
					$AppoDdtScaricoMovimenti['CT_DDT'] = $AppoDdtScarico['ID'];
					$AppoDdtScaricoMovimenti['CT_ARTICOLI'] = $rsSegmentiDB->fields['CT_ARTICOLI'];
					$AppoDdtScaricoMovimenti['QTA'] = $rsSegmentiDB->fields['MOLTIPLICA'] * $AppoDdtCaricoMovimenti['QTARIGA'];
					$AppoDdtScaricoMovimenti['QTARIGA'] = $AppoDdtScaricoMovimenti['QTA'];
					$conn->AutoExecute("ddtmovimenti", $AppoDdtScaricoMovimenti, 'INSERT');
					$AppoDdtScaricoMovimenti['ID'] = $conn->Insert_ID();
					$rsSegmentiDB->MoveNext();
				}
				
				/* SCRIVE UDC CARICO */
				$conn->AutoExecute("wms_udc", $UDCWMS, 'INSERT');
				$UDCWMS['ID'] = $conn->Insert_ID();
				$UDCvalid = 1;
			} else {
				//lettura sbagliata
				$UDCvalid = 0;
			}
		} catch (exception $e) {
			echo ('ERR VMT ' . BRCRLF);
			$UDCWMS = array();
			$UDCWMS['CT_DDT'] = null;
			$UDCWMS['CT_DDTMOVIMENTI'] = null;
			$UDCWMS['MES_CT_PLANNING'] = null;
			$UDCWMS['CT_ARTICOLI'] = null;
			$UDCWMS['MPS_CT_RESOURCES'] = 24; //STAMPAGGIO
			$UDCWMS['SSCC'] = null;
			$UDCWMS['EANUDC'] = $barcode;
			$UDCWMS['DATA'] = $datetime;
			$UDCWMS['SI'] = $datetime;
			$UDCWMS['SR'] = $datetime;
			$UDCWMS['SC'] = $CurDateTime->getTimestamp();
			$UDCWMS['SSCCPARENT'] = null;
			$UDCWMS['SERIALBATCH'] = $ConcioProgressivo;
			$UDCWMS['PESO'] = 0;
			$UDCWMS['QTA'] = 1;
			$conn->AutoExecute("wms_udc", $UDCWMS, 'INSERT');
			$UDCWMS['ID'] = $conn->Insert_ID();
			$UDCvalid = 1;
		}
	} else {
		$UDCvalid = 2;
	}
	
	$wms_udcmovimenti = array();
	$wms_udcmovimenti['EANUDC'] =  $barcode;
	$wms_udcmovimenti['DATA'] = $datetime;
	$wms_udcmovimenti['SI'] = $datetime;
	$wms_udcmovimenti['SR'] = $datetime;
	$wms_udcmovimenti['SC'] = $CurDateTime->getTimestamp();
	$wms_udcmovimenti['CT_IOT'] = $iot['ID'];
	$wms_udcmovimenti['WMS_CT_UDC'] = $UDCWMS['ID'];
	$wms_udcmovimenti['DATA'] = $datetime;
	//DATI DA GRU POSIZIONE 
	if ($VeicoloWMS != '') {
		$wms_udcmovimenti['WMS_CT_VEICOLI']   = $VeicoloWMS['ID'];
		$wms_udcmovimenti['X'] 			      = $VeicoloWMS['WPS_X'];
		$wms_udcmovimenti['Y'] 				  = $VeicoloWMS['WPS_Y'];
		$wms_udcmovimenti['H'] 				  = $VeicoloWMS['WPS_H'];
		$wms_udcmovimenti['WMS_CT_POSIZIONI'] = $VeicoloWMS['WMS_CT_POSIZIONI'];
		$wms_udcmovimenti['PESOLETTO'] 		  = $VeicoloWMS['PESO'];
	}
	if ($UDCvalid > 0) {
		if ($UDCvalid <2){
			//NASCITA UDC DA FERRO
			$wms_udcmovimentiPrimo = object_clone($wms_udcmovimenti);
			$wms_udcmovimentiPrimo['RFID'] = $GabbiaProgressivo;
			$wms_udcmovimentiPrimo['EVENTO'] = '2FERRO';
				//DAFARE RICERCA SU GABBIE UDC CON GLI RFID
			$wms_udcmovimentiPrimo['WMS_CT_VEICOLI']   = null;
			$wms_udcmovimentiPrimo['DATA'] = $datetime;
			$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimentiPrimo, 'INSERT');
			$wms_udcmovimentiPrimo['ID'] = $conn->Insert_ID();
			
			//NASCITA UDC DA CAMION
			$wms_udcmovimentiSecondo = object_clone($wms_udcmovimenti);
			$wms_udcmovimentiPrimo['RFID'] = 'CAMION';
			$wms_udcmovimentiPrimo['EVENTO'] = '3GETTO';
			$wms_udcmovimentiSecondo['WMS_CT_VEICOLI']   = null;
			$wms_udcmovimentiSecondo['DATA'] = $datetime;
			$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimentiSecondo, 'INSERT');
			$wms_udcmovimentiSecondo['ID'] = $conn->Insert_ID();
			
			//POSIZIONE ATTUALE
			$wms_udcmovimentiPrimo['EVENTO'] = '5SCASSERO';
			$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT');
			$wms_udcmovimenti['ID'] = $conn->Insert_ID();
		}
		else{
			//POSIZIONE ATTUALE
			$wms_udcmovimenti['EVENTO'] = '8MOVIMENTO';
			$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT');
			$wms_udcmovimenti['ID'] = $conn->Insert_ID();
		}
	}
} 
elseif ($interface == 'CAMION') {
	if ($conn->debug == 1) echo('CAMION' . BRCRLF);
	
	$spostamento = 0;
	$spostamentotempo  =0;
	if (($PosizioneWMS != '') && ($VeicoloWMS != '')){
		if($VeicoloWMS['WMS_CT_POSIZIONI'] != $PosizioneWMS['ID']){
			$spostamento = 1;
			$spostamentotempo 	= WFVALUEDATEDIF($VeicoloWMS['LASTSR'], $datetime, 'n', false );
		}
	}
	$DNote = '';
	if ($spostamento && pingsite($VeicoloIOT['IP']) && pingsite($MixerIOT['IP'])) {
		
		//AGGIORNAMENTO VEICOLO
		$wms_veicoli = array();
		$wms_veicoli['SR'] = $datetime;
		$wms_veicoli['LASTSR'] = $VeicoloWMS['SR'];
		$wms_veicoli['SC'] = $CurDateTime->getTimestamp();
		$wms_veicoli['WMS_CT_POSIZIONI'] = $PosizioneWMS['ID'];
		$wms_veicoli['WPS_X'] = $PosizioneWMS['WPS_X'];
		$wms_veicoli['WPS_Y'] = $PosizioneWMS['WPS_Y'];
		$wms_veicoli['WPS_H'] = $PosizioneWMS['WPS_H'];
		$conn->AutoExecute("wms_veicoli", $wms_veicoli, 'UPDATE', 'CT_IOT = ' . $iot['ID']);

		//MOVIMENTO VEICOLO
		$wms_veicolimovimenti = array();
		$wms_veicolimovimenti['WMS_CT_UDC'] = $VeicoloWMS['WMS_CT_UDC']; //UDC Prodotto dal MIXER
		$wms_veicolimovimenti['RFID'] =  $rfid;
		$wms_veicolimovimenti['DATA'] = $datetime;
		$wms_veicolimovimenti['SI'] = $datetime;
		$wms_veicolimovimenti['SR'] = $datetime;
		$wms_veicolimovimenti['SC'] = $CurDateTime->getTimestamp();
		$wms_veicolimovimenti['CT_IOT'] = $iot['ID'];
		$wms_veicolimovimenti['DATA'] = $datetime;
		$wms_veicolimovimenti['X'] 				  =  $PosizioneWMS['WPS_X'];
		$wms_veicolimovimenti['Y'] 				  =  $PosizioneWMS['WPS_Y'];
		$wms_veicolimovimenti['H'] 				  =  $PosizioneWMS['WPS_H'];
		$wms_veicolimovimenti['WMS_CT_POSIZIONI'] = $PosizioneWMS['ID'];
		$wms_veicolimovimenti['WMS_CT_VEICOLI'] = $VeicoloWMS['ID'];
		$wms_veicolimovimenti['EVENTO'] = 'SCARICO';
		$wms_veicolimovimenti['DURATA'] = $spostamentotempo;
		$wms_veicolimovimenti['DATA'] = $datetime;
		$conn->AutoExecute("wms_veicolimovimenti", $wms_veicolimovimenti, 'INSERT');
		$wms_veicolimovimenti['ID'] = $conn->Insert_ID();

		/* MOVIMENTO UDC (CHE NON CE ANCORA)
		$wms_udcmovimenti = array();
		$wms_udcmovimenti['WMS_CT_UDC'] = $UDCWMS['ID'];
		$wms_udcmovimenti['EANUDC'] =  $barcode;
		$wms_udcmovimenti['RFID'] =  $rfid;
		$wms_udcmovimenti['SI'] = $datetime;
		$wms_udcmovimenti['SR'] = $datetime;
		$wms_udcmovimenti['SC'] = $CurDateTime->getTimestamp();
		$wms_udcmovimenti['CT_IOT'] = $iot['ID'];
		$wms_udcmovimenti['DATA'] = $datetime;
		$wms_udcmovimenti['X'] 				  =  $PosizioneWMS['WPS_X'];
		$wms_udcmovimenti['Y'] 				  =  $PosizioneWMS['WPS_Y'];
		$wms_udcmovimenti['H'] 				  =  $PosizioneWMS['WPS_H'];
		$wms_udcmovimenti['WMS_CT_POSIZIONI'] =  $PosizioneWMS['ID'];
		$wms_udcmovimenti['WMS_CT_VEICOLI'] = $VeicoloWMS['ID'];
		$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT');
		$wms_udcmovimenti['ID'] = $conn->Insert_ID();
		*/
	}else{
		$wms_veicoli = array();
		$wms_veicoli['SR'] = $datetime;
		$wms_veicoli['SC'] = $CurDateTime->getTimestamp();
		$wms_veicoli['WMS_CT_POSIZIONI'] = $PosizioneWMS['ID'];
		$wms_veicoli['WPS_X'] = $PosizioneWMS['WPS_X'];
		$wms_veicoli['WPS_Y'] = $PosizioneWMS['WPS_Y'];
		$wms_veicoli['WPS_H'] = $PosizioneWMS['WPS_H'];
		$conn->AutoExecute("wms_veicoli", $wms_veicoli, 'UPDATE', 'CT_IOT = ' . $iot['ID']);
		$wms_veicoli['ID'] = $conn->Insert_ID();
	}
} 
elseif ($interface == 'MIXER') {
	if ($conn->debug == 1) echo('MIXER' . BRCRLF);

	$spostamento = 0;
	$spostamentotempo  =0;
	if (($PosizioneWMS != '') && ($VeicoloWMS != '')){
		if($VeicoloWMS['WMS_CT_POSIZIONI'] != $PosizioneWMS['ID']){
			$spostamento = 1;
			$spostamentotempo 	= WFVALUEDATEDIF($VeicoloWMS['LASTSR'], $datetime, 'n', false );
		}
	}
	$DNote = '';
	//CONTROLLA SE iot CAMION ACCESO
	if ($spostamento && pingsite($VeicoloIOT['IP']) && pingsite($MixerIOT['IP'])) {
		$wms_veicoli = array();
		$wms_veicoli['SR'] = $datetime;
		$wms_veicoli['LASTSR'] = $VeicoloWMS['SR'];
		$wms_veicoli['WMS_CT_UDC'] = $ResourceMPS['WMS_CT_UDC'];
		$wms_veicoli['SC'] = $CurDateTime->getTimestamp();
		$wms_veicoli['WMS_CT_POSIZIONI'] = $PosizioneWMS['ID'];
		$wms_veicoli['WPS_X'] = $PosizioneWMS['WPS_X'];
		$wms_veicoli['WPS_Y'] = $PosizioneWMS['WPS_Y'];
		$wms_veicoli['WPS_H'] = $PosizioneWMS['WPS_H'];
		$conn->AutoExecute("wms_veicoli", $wms_veicoli, 'UPDATE', 'CT_IOT = ' . $iot['ID']);
		$wms_veicoli['ID'] = $conn->Insert_ID();
		
		$wms_veicolimovimenti = array();
		$wms_veicolimovimenti['WMS_CT_UDC'] = $wms_veicoli['WMS_CT_UDC'];
		$wms_veicolimovimenti['RFID'] =  $rfid;
		$wms_veicolimovimenti['DATA'] = $datetime;
		$wms_veicolimovimenti['SI'] = $datetime;
		$wms_veicolimovimenti['SR'] = $datetime;
		$wms_veicolimovimenti['SC'] = $CurDateTime->getTimestamp();
		$wms_veicolimovimenti['CT_IOT'] = $iot['ID'];
		$wms_veicolimovimenti['X'] 				=  $PosizioneWMS['WPS_X'];
		$wms_veicolimovimenti['Y'] 				=  $PosizioneWMS['WPS_Y'];
		$wms_veicolimovimenti['H'] 				=  $PosizioneWMS['WPS_H'];
		$wms_veicolimovimenti['WMS_CT_POSIZIONI'] = $PosizioneWMS['ID'];
		$wms_veicolimovimenti['WMS_CT_VEICOLI'] = $VeicoloWMS['ID'];
		$wms_veicolimovimenti['EVENTO'] = 'CARICO';
		$wms_veicolimovimenti['DURATA'] = $spostamentotempo;
		$wms_veicolimovimenti['DATA'] = $datetime;
		$conn->AutoExecute("wms_veicolimovimenti", $wms_veicolimovimenti, 'INSERT');
		$wms_veicolimovimenti['ID'] = $conn->Insert_ID();
		
		
		/*MOVIMENTO UDC (CHE NON CE ANCORA)
		$wms_udcmovimenti = array();
		$wms_udcmovimenti['RFID'] =  $rfid;
		$wms_udcmovimenti['DATA'] = $datetime;
		$wms_udcmovimenti['SI'] = $datetime;
		$wms_udcmovimenti['SR'] = $datetime;
		$wms_udcmovimenti['SC'] = $CurDateTime->getTimestamp();
		$wms_udcmovimenti['CT_IOT'] = $iot['ID'];
		$wms_udcmovimenti['DATA'] = $datetime;
		$wms_udcmovimenti['X'] 				  =  $PosizioneWMS['WPS_X'];
		$wms_udcmovimenti['Y'] 				  =  $PosizioneWMS['WPS_Y'];
		$wms_udcmovimenti['H'] 				  =  $PosizioneWMS['WPS_H'];
		$wms_udcmovimenti['WMS_CT_POSIZIONI'] =  $PosizioneWMS['ID'];
		$wms_udcmovimenti['WMS_CT_VEICOLI'] = $VeicoloWMS['ID'];
		$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT');
		$wms_udcmovimenti['ID'] = $conn->Insert_ID();
		*/
	}else{
		$wms_veicoli = array();
		$wms_veicoli['SR'] = $datetime;
		$wms_veicoli['SC'] = $CurDateTime->getTimestamp();
		$wms_veicoli['WMS_CT_POSIZIONI'] = $PosizioneWMS['ID'];
		$wms_veicoli['WPS_X'] = $PosizioneWMS['WPS_X'];
		$wms_veicoli['WPS_Y'] = $PosizioneWMS['WPS_Y'];
		$wms_veicoli['WPS_H'] = $PosizioneWMS['WPS_H'];
		$conn->AutoExecute("wms_veicoli", $wms_veicoli, 'UPDATE', 'CT_IOT = ' . $iot['ID']);
		$wms_veicoli['ID'] = $conn->Insert_ID();
	}

	/*
		$wms_udcmovimenti = array();
		$wms_udcmovimenti['RFID'] =  $rfid ;
		$wms_udcmovimenti['DATA'] = $datetime;
		$wms_udcmovimenti['SI'] = $datetime;
		$wms_udcmovimenti['SR'] = $datetime;
		$wms_udcmovimenti['SC'] = $CurDateTime->getTimestamp();
		$wms_udcmovimenti['CT_IOT'] = $iot['ID'];
		$wms_udcmovimenti['DATA'] = $datetime;
		$wms_udcmovimenti['X'] 				=  $PosizioneWMS['WPS_X'];
		$wms_udcmovimenti['Y'] 				=  $PosizioneWMS['WPS_Y'];
		$wms_udcmovimenti['H'] 				=  $PosizioneWMS['WPS_H'];
		$wms_udcmovimenti['WMS_CT_POSIZIONI'] = $PosizioneWMS['ID'];
		$wms_udcmovimenti['WMS_CT_VEICOLI'] = $VeicoloWMS['ID'];
		$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT' );
	*/
} 
elseif ($interface == 'UPPY') {
	if ($conn->debug == 1) echo('UPPY' . BRCRLF);
	
	//UDC
	if ($palcode != ''){
		$UDCWMS = WFVALUEDLOOKUP('*','wms_udc',"RFID = '" . $palcode . "'");
		if ($UDCWMS == '') {
			$UDCWMS = WFVALUEDLOOKUP('*','wms_udc',"EANUDC = '" . $palcode . "'");
		}
		if ($UDCWMS == '' ) {
			$UDCWMS = array();
			$UDCWMS['RFID'] = $palcode;
			$UDCWMS['EANUDC'] = $palcode;
			$UDCWMS['SSCC'] = $palcode;
			$UDCWMS['CT_DDT'] = null;
			$UDCWMS['CT_DDTMOVIMENTI'] = null;
			$UDCWMS['MES_CT_PLANNING'] = null;
			$UDCWMS['CT_ARTICOLI'] = null;
			$UDCWMS['MPS_CT_RESOURCES'] = null;
			$UDCWMS['DATA'] = $datetime;
			$UDCWMS['SI'] = $CurDateTime->getTimestamp();
			$UDCWMS['SR'] = null;
			$UDCWMS['SC'] = $CurDateTime->getTimestamp();
			$UDCWMS['SSCCPARENT'] = null;
			$UDCWMS['SERIALBATCH'] = $ConcioProgressivo;
			$UDCWMS['PESO'] = 0;
			$UDCWMS['QTA'] = 1;
			$conn->AutoExecute("wms_udc", $UDCWMS, 'INSERT');
			$UDCWMS['ID'] = $conn->Insert_ID();
		}
		
		$wms_udcmovimenti = array();
		$wms_udcmovimenti['EANUDC'] =  $palcode;
		$wms_udcmovimenti['RFID'] = $palcode;
		$wms_udcmovimenti['DATA'] = $datetime;
		$wms_udcmovimenti['SI'] = $datetime;
		$wms_udcmovimenti['SR'] = $CurDateTime->getTimestamp();
		$wms_udcmovimenti['SC'] = $CurDateTime->getTimestamp();
		$wms_udcmovimenti['CT_IOT'] = $iot['ID'];
		$wms_udcmovimenti['WMS_CT_UDC'] = $UDCWMS['ID'];
		$wms_udcmovimentiPrimo['EVENTO'] = $status;
		
		if ($VeicoloWMS != '') {
			$wms_udcmovimenti['WMS_CT_MAPPE']	  = $Mappa['ID'];
			$wms_udcmovimenti['WMS_CT_VEICOLI']   = $VeicoloWMS['ID'];
			$wms_udcmovimenti['WPS_X'] 			  = $VeicoloWMS['WPS_X'];
			$wms_udcmovimenti['WPS_Y'] 			  = $VeicoloWMS['WPS_Y'];
			$wms_udcmovimenti['WPS_H'] 			  = $VeicoloWMS['WPS_H'];
			$wms_udcmovimenti['WPS_GPSLAT'] 	  = $VeicoloWMS['WPS_GPSLAT'];
			$wms_udcmovimenti['WPS_GPSLON'] 	  = $VeicoloWMS['WPS_GPSLON'];
			$wms_udcmovimenti['WPS_GPSALT'] 	  = $VeicoloWMS['WPS_GPSALT'];
			$wms_udcmovimenti['WMS_CT_POSIZIONI'] = $VeicoloWMS['WMS_CT_POSIZIONI'];
			$wms_udcmovimenti['PESOLETTO'] 		  = $VeicoloWMS['PESO'];
		}
		
		//LOG MOVIMENTI
		$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT');
		$wms_udcmovimenti['ID'] = $conn->Insert_ID();
	}

	//MOVIMENTO VEICOLO
	$wms_veicolimovimenti = array();
	$wms_veicolimovimenti['CT_IOT'] = $iot['ID'];
	$wms_veicolimovimenti['DATA'] = $datetime;
	$wms_veicolimovimenti['SI'] = $datetime;
	$wms_veicolimovimenti['SR'] = $CurDateTime->getTimestamp();
	$wms_veicolimovimenti['SC'] = $CurDateTime->getTimestamp();
	$wms_veicolimovimenti['IMMAGINE'] 	= $fileimage;
	$wms_veicolimovimenti['DISTANZA'] 	= $distancegps;
	$wms_veicolimovimenti['DISTANZACARICO'] = $distance;
	$wms_veicolimovimenti['PESO'] 		= $peso;
	$wms_veicolimovimenti['EVENTO'] 	= $status;
	$wms_veicolimovimenti['STATO'] 		= $poscode;
	$wms_veicolimovimenti['WMS_CT_MAPPE']	= $Mappa['ID'];
	
	if (!empty($wms_udcmovimenti)){
		$wms_veicolimovimenti['WMS_CT_UDC'] = $UDCWMS['ID'];
		$wms_veicolimovimenti['WMS_CT_UDCMOVIMENTI'] =  $wms_udcmovimenti['ID'];
	}		
	if ($VeicoloWMS != '') {
		$wms_veicolimovimenti['WPS_X']			= $VeicoloWMS['WPS_X'];
		$wms_veicolimovimenti['WPS_Y']			= $VeicoloWMS['WPS_Y'];
		$wms_veicolimovimenti['WPS_H']			= $VeicoloWMS['WPS_H'];
		$wms_veicolimovimenti['WPS_GPSLAT']		= $VeicoloWMS['WPS_GPSLAT'];
		$wms_veicolimovimenti['WPS_GPSLON']		= $VeicoloWMS['WPS_GPSLON'];
		$wms_veicolimovimenti['WPS_GPSALT']		= $VeicoloWMS['WPS_GPSALT'];
		$wms_veicolimovimenti['WMS_CT_VEICOLI']	= $VeicoloWMS['ID'];
		$wms_veicolimovimenti['WMS_CT_POSIZIONI'] = $VeicoloWMS['WMS_CT_POSIZIONI'];
	}
	$wms_veicolimovimenti['DURATA'] = $spostamentotempo;
	$conn->AutoExecute("wms_veicolimovimenti", $wms_veicolimovimenti, 'INSERT');
	$wms_veicolimovimenti['ID'] = $conn->Insert_ID();


	//EVENTO VEICOLO
	if ($status != 'hb'){
		$wms_veicolieventi = array();
		$wms_veicolieventi = array_clone($wms_veicolimovimenti);
		$wms_veicolieventi['ID'] = null;
		$conn->AutoExecute("wms_veicolieventi", $wms_veicolieventi, 'INSERT');
		$wms_veicolieventi['ID'] = $conn->Insert_ID();
	}
	
	$output["success"] = false;
	$output["failure"] = true;
}
elseif ($interface == 'RFIDFERRO') {
	if ($conn->debug == 1) echo('RFIDFERRO' . BRCRLF);
	$wms_udcmovimenti = array();
	//DATI DA RFIDFERRO RFID BARCODE
	$wms_udcmovimenti['EANUDC'] =  $rfid;
	$wms_udcmovimenti['DATA'] = $datetime;
	$wms_udcmovimenti['SI'] = $datetime;
	$wms_udcmovimenti['SR'] = $datetime;
	$wms_udcmovimenti['SC'] = $CurDateTime->getTimestamp();
	$wms_udcmovimenti['CT_IOT'] = $iot['ID'];

	//DATI DA VMT 
	$UDCvalid = false;
	if ($UDCWMS == '') {
		try {
			$cnVMT = ADONewConnection('mssqlnative');
			$cnVMT->debug = $conn->debug;
			$cnVMT->SetFetchMode(ADODB_FETCH_ASSOC);
			$cnVMT->setConnectionParameter('characterSet', 'UTF-8');
			$cnVMT->connect('172.16.10.5', 'View', 'ExternalVIEW', 'SDS31_DB');

			$sqlSegmenti = "SELECT * 
							FROM [SDS31_DB].[View].[CustomExport01] 
							WHERE REINFORCEMENT = '" . 'R31' . substr($operator, -6) . "'";
			$rsSegmenti = $cnVMT->Execute($sqlSegmenti);
			if ($rsSegmenti) {
				$ConcioProgressivo = $rsSegmenti->fields['SEGMENT']; //PEZZO PROGRESSIVO    $rfid
				$ConcioArticoloCodice = $rsSegmenti->fields['SEGMENT_TYPE']; //PEZZO ARTICOLO
				$ConcioArticolo = WFVALUEDLOOKUP('*', 'articoli', "CODICE = '" . $ConcioArticoloCodice . "'");

				$ConcioDataOraStart = $rsSegmenti->fields['MOULDED_DATE']; //PEZZO INIZIO
				$ConcioDataOraEnd = $rsSegmenti->fields['FINISHED_DATE']; //PEZZO FINE

				$ConcioStampoCodice = $rsSegmenti->fields['MOU_NAME']; //PEZZO STAMPO
				$ConcioStampoPosizione = WFVALUEDLOOKUP('*', 'wms_posizioni', "CODICE LIKE '%" . $ConcioStampoCodice . "%'");

				$GabbiaProgressivo =  $rsSegmenti->fields['REINFORCEMENT']; //GABBIA PROGRESSIVO
				$GabbiaArticoloCodice = $rsSegmenti->fields['REINFORCEMENT_TYPE']; //GABBIA ARTICOLO
				$GabbiaArticolo = WFVALUEDLOOKUP('*', 'articoli', "CODICE = '" . $GabbiaArticoloCodice . "'");

				$UDCWMS = array();
				$UDCWMS['CT_DDT'] = null;
				$UDCWMS['CT_DDTMOVIMENTI'] = null;
				$UDCWMS['MES_CT_PLANNING'] = null;
				$UDCWMS['CT_ARTICOLI'] = $ConcioArticolo['ID'];
				$UDCWMS['MPS_CT_RESOURCES'] = 20; //	FERRO GABBIA STAZIONE2
				$UDCWMS['RFID'] = $rfid;
				$UDCWMS['EANUDC'] = $barcode;
				$UDCWMS['DATA'] = $ConcioDataOraStart;
				$UDCWMS['SI'] = $datetime;
				$UDCWMS['SR'] = $datetime;
				$UDCWMS['SC'] = $CurDateTime->getTimestamp();
				$UDCWMS['SSCCPARENT'] = null;
				$UDCWMS['SERIALBATCH'] = $ConcioProgressivo;
				$UDCWMS['PESO'] = 0;
				$UDCWMS['QTA'] = 1;
				$conn->AutoExecute("wms_udc", $wms_udc, 'INSERT');
				$UDCWMS['ID'] = $conn->Insert_ID();
				$UDCvalid = true;
			} else {
				//lettura sbagliata
				$UDCvalid = false;
			}
		} catch (exception $e) {
			echo ('ERR VMT ' . BRCRLF);
			$UDCWMS = array();
			$UDCWMS['CT_DDT'] = null;
			$UDCWMS['CT_DDTMOVIMENTI'] = null;
			$UDCWMS['MES_CT_PLANNING'] = null;
			$UDCWMS['CT_ARTICOLI'] = null;
			$UDCWMS['MPS_CT_RESOURCES'] = 24; //STAMPAGGIO
			$UDCWMS['SSCC'] = null;
			$UDCWMS['EANUDC'] = $rfid;
			$UDCWMS['DATA'] = $datetime;
			$UDCWMS['SI'] = $datetime;
			$UDCWMS['SR'] = $datetime;
			$UDCWMS['SC'] = $CurDateTime->getTimestamp();
			$UDCWMS['SSCCPARENT'] = null;
			$UDCWMS['SERIALBATCH'] = $rfid;
			$UDCWMS['PESO'] = 0;
			$UDCWMS['QTA'] = 1;
			$conn->AutoExecute("wms_udc", $UDCWMS, 'INSERT');
			$UDCWMS['ID'] = $conn->Insert_ID();
			$UDCvalid = true;
		}
	} else {
		$UDCvalid = true;
	}
	$wms_udcmovimenti['WMS_CT_UDC'] = $UDCWMS['ID'];
	$wms_udcmovimenti['DATA'] = $datetime;

	//DAFARE CON CONTATTI SU PINZA
	$iotConnected = $operator;

	//DATI DA GRU POSIZIONE 
	$iot_veicolo = WFVALUEDLOOKUP('*', 'iot', "PARAM1  = '" . $operator . "'");
	if ($iot_veicolo != '') {
		$VeicoloWMS = WFVALUEDLOOKUP('*', 'wms_veicoli', "CT_IOT  = " . $iot_veicolo['ID']);
		if ($VeicoloWMS != '') {
			$wms_udcmovimenti['WMS_CT_VEICOLI'] = $VeicoloWMS['ID'];
			$wms_udcmovimenti['X'] 				=  $VeicoloWMS['WPS_X'];
			$wms_udcmovimenti['Y'] 				=  $VeicoloWMS['WPS_Y'];
			$wms_udcmovimenti['H'] 				=  $VeicoloWMS['WPS_H'];
			$wms_udcmovimenti['WMS_CT_POSIZIONI'] = $VeicoloWMS['WMS_CT_POSIZIONI'];
			$wms_udcmovimenti['PESOLETTO'] 		= $VeicoloWMS['PESO'];
		}
	}
	if ($UDCvalid) {
		$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT');
	}
} 
elseif ($interface == 'INKTRACK'){
	$UDCWMS = WFVALUEDLOOKUP('*','wms_udc',"RFID = '" . $palcode . "'");
	if ($UDCWMS == '') {
		$UDCWMS = WFVALUEDLOOKUP('*','wms_udc',"EANUDC = '" . $palcode . "'");
	}
	if ($UDCWMS == '') {
		$UDCWMS = array();
		$UDCWMS['RFID'] = $palcode;
		$UDCWMS['EANUDC'] = $palcode;
		$UDCWMS['SSCC'] = null;
		$UDCWMS['CT_DDT'] = null;
		$UDCWMS['CT_DDTMOVIMENTI'] = null;
		$UDCWMS['MES_CT_PLANNING'] = null;
		$UDCWMS['CT_ARTICOLI'] = null;
		$UDCWMS['MPS_CT_RESOURCES'] = null;
		$UDCWMS['DATA'] = $datetime;
		$UDCWMS['SI'] = $CurDateTime->getTimestamp();
		$UDCWMS['SR'] = null;
		$UDCWMS['SC'] = $CurDateTime->getTimestamp();
		$UDCWMS['SSCCPARENT'] = null;
		$UDCWMS['SERIALBATCH'] = $ConcioProgressivo;
		$UDCWMS['PESO'] = 0;
		$UDCWMS['QTA'] = 1;
		$conn->AutoExecute("wms_udc", $UDCWMS, 'INSERT');
		$UDCWMS['ID'] = $conn->Insert_ID();
	}
	
	$Articolo = WFVALUEDLOOKUP('*', 'articoli', "ID = '" . $UDCWMS['CT_ARTICOLI'] . "'");
	
	$wms_udcmovimenti = array();
	$wms_veicolimovimenti['CT_IOT'] = $iot['ID'];
	$wms_veicolimovimenti['DATA'] = $datetime;
	$wms_veicolimovimenti['SI'] = $CurDateTime->getTimestamp();
	$wms_veicolimovimenti['SR'] = null;
	$wms_veicolimovimenti['SC'] = $CurDateTime->getTimestamp();
	
	$wms_udcmovimenti['WMS_CT_UDC'] = $UDCWMS['ID'];
	$wms_veicolimovimenti['WMS_CT_UDCMOVIMENTI'] = $wms_udcmovimenti['ID'];
	$wms_udcmovimenti['MES_CT_PLANNING'] = $planningid;
	
	//DATI POSIZIONE 
	if ($VeicoloWMS != '') {
		$wms_udcmovimenti['WMS_CT_VEICOLI']   = $VeicoloWMS['ID'];
		$wms_udcmovimenti['WPS_X'] 			  = $VeicoloWMS['WPS_X'];
		$wms_udcmovimenti['WPS_Y'] 			  = $VeicoloWMS['WPS_Y'];
		$wms_udcmovimenti['WPS_H'] 			  = $VeicoloWMS['WPS_H'];
		$wms_udcmovimenti['WMS_CT_POSIZIONI'] = $VeicoloWMS['WMS_CT_POSIZIONI'];
		$wms_udcmovimenti['PESOLETTO'] 		  = $VeicoloWMS['PESO'];
	}
		
	//POSIZIONE ATTUALE
	$wms_udcmovimenti['EVENTO'] = 'ULOAD';
	$conn->AutoExecute("wms_udcmovimenti", $wms_udcmovimenti, 'INSERT');
	$wms_udcmovimenti['ID'] = $conn->Insert_ID();


	$output["message"] = $output["message"] .
						'' . $Articolo['DESCRIZIONE']. "        " .
						' Lotto:'. $UDCWMS['SERIALBATCH'] .
						' SCAD:' . $UDCWMS['SCADENZA'];
	$output["success"] = false;
	$output["failure"] = true;
}
else {
	$output["message"] = $output["message"]  . " interface " . $interface . " NOT VALID" . BRCRLF ;
}

$conn->close();

$Appo = Array2JSON($output, $debugmessage);

if ($conn->debug != 1){
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
}
echo $Appo;
?>