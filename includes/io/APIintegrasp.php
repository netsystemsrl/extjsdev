<?php
//http://iot.integra-fragrances.com/devices/update.html?mac=353606082816247&lastUpdate=1683126425631&fluxState=N&relay0Program=0&relay1Program=0&rssi=6&ver=35

	$dbname   = 'integra';
	$username = 'pro';
	$password = '135792468';
    require ($_SERVER['DOCUMENT_ROOT'].'/includes/io/LoginAuth.php');
	
	require_once($_SERVER['DOCUMENT_ROOT'] . '/includes/var.php');

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
	WFSetDebug(false);
	$date = new DateTime();
	$debugmessage = 0;

	//MAIN
	$mac = '';
	$mac = isset($_POST["mac"]) ? $_POST["mac"] : $mac;
	$mac = isset($_GET["mac"]) ? $_GET["mac"] : $mac;
	
	$lastUpdate = '';
	$lastUpdate = isset($_POST["lastUpdate"]) ? $_POST["lastUpdate"] : $lastUpdate;
	$lastUpdate = isset($_GET["lastUpdate"]) ? $_GET["lastUpdate"] : $lastUpdate;
	
	$fluxState = '';
	$fluxState = isset($_POST["fluxState"]) ? $_POST["fluxState"] : $fluxState;
	$fluxState = isset($_GET["fluxState"]) ? $_GET["fluxState"] : $fluxState;
	
	$relay0Program = '';
	$relay0Program = isset($_POST["relay0Program"]) ? $_POST["relay0Program"] : $relay0Program;
	$relay0Program = isset($_GET["relay0Program"]) ? $_GET["relay0Program"] : $relay0Program;
	
	$relay1Program = '';
	$relay1Program = isset($_POST["relay1Program"]) ? $_POST["relay1Program"] : $relay1Program;
	$relay1Program = isset($_GET["relay1Program"]) ? $_GET["relay1Program"] : $relay1Program;
	
	$sensors = '';
	$sensorsObj = null;
	$sensors = isset($_POST["sensors"]) ? $_POST["sensors"] : $sensors;
	$sensors = isset($_GET["sensors"]) ? $_GET["sensors"] : $sensors;
	if ($sensors != ''){
		$sensorsChr = base64_decode($sensors);
		$sensorsObj = json_decode($sensorsChr);
	}
	
	$rssi = '';
	$rssi = isset($_POST["rssi"]) ? $_POST["rssi"] : $rssi;
	$rssi = isset($_GET["rssi"]) ? $_GET["rssi"] : $rssi;
	
	/***************************/
	/*  ricerca impianto		*/
	/***************************/
	$srm_impianto = WFVALUEDLOOKUP('*','srm_impianti',"MAC = '" . $mac . "'");
	if ($srm_impianto == ''){
		$srm_impianto = array();
		$srm_impianto['DESCRIZIONE'] = $mac;
		$srm_impianto['MAC'] = $mac;
		$srm_impianto['CODICE'] = $mac;
		$srm_impianto['SI'] = $date->getTimestamp(); 
		$srm_impianto['DATAINSTALLAZIONE'] = $date->getTimestamp(); 
		$conn->AutoExecute("srm_impianti", $srm_impianto, 'INSERT' );
		$srm_impianto['ID'] = $conn->Insert_ID();
	}
	
	/***************************/
	/*  Aggiorna impianto      */
	/***************************/
	$srm_impianto['SC'] = $date->getTimestamp(); 
	$srm_impianto = WFARRAYEPURE($srm_impianto);
	$conn->AutoExecute("srm_impianti", $srm_impianto, 'UPDATE','ID = ' . $srm_impianto['ID'] );
	
	//aggiorna campi sensore
	$srm_impianto['lastUpdate'] = $lastUpdate;
	$srm_impianto['fluxState'] = $fluxState;
	$srm_impianto['relay0Program'] = $relay0Program;
	$srm_impianto['relay1Program'] = $relay1Program;
	
	if ($sensorsObj){
		$srm_impianto['FIELDCHR01'] = $sensorsObj->TN;//TimeNow
		$srm_impianto['FIELDCHR02'] = $sensorsObj->CW;//WIFIOn
		$srm_impianto['FIELDCHR03'] = $sensorsObj->CE;//ETHOn
		$srm_impianto['FIELDCHR04'] = $sensorsObj->CG;//GSM
		$srm_impianto['FIELDDEC01'] = $sensorsObj->L1;//LivelloT1
		$srm_impianto['FIELDDEC02'] = $sensorsObj->L2;//LivelloT2
		$srm_impianto['FIELDDEC03'] = $sensorsObj->L3;//LivelloT3
		$srm_impianto['FIELDDEC04'] = $sensorsObj->L4;//LivelloT4
		$srm_impianto['FIELDDEC05'] = $sensorsObj->L5;//LivelloT5

		$srm_impianto['AriaNonRilevata'] = $sensorsObj->AA;//ARIA NON AriaNonRilevata
		//$srm_impianto['MAC'] = $sensorsObj->MAC;
		$srm_impianto['FIELDINT01'] = $sensorsObj->dA; 
		$srm_impianto['FIELDINT02'] = $sensorsObj->dB;
		$srm_impianto['FIELDINT03'] = $sensorsObj->dC;
		$srm_impianto['FIELDINT04'] = $sensorsObj->dD;
		$srm_impianto['FIELDINT05'] = $sensorsObj->dE;
		$srm_impianto['FIELDINT06'] = $sensorsObj->dF;
		$srm_impianto['FIELDINT07'] = $sensorsObj->dG;
		$srm_impianto['FIELDINT08'] = $sensorsObj->dH;
		$srm_impianto['FIELDINT09'] = $sensorsObj->dI;
		$srm_impianto['FIELDINT10'] = $sensorsObj->dJ;
		$srm_impianto['FIELDINT11'] = $sensorsObj->dK;
		$srm_impianto['FIELDINT12'] = $sensorsObj->dL;
		$srm_impianto['FIELDINT13'] = $sensorsObj->dM;
		$srm_impianto['FIELDINT14'] = $sensorsObj->dN;
		$srm_impianto['FIELDINT15'] = $sensorsObj->dO;
		$srm_impianto['FIELDINT16'] = $sensorsObj->dP;
		
		$srm_impianto['FIELDINT17'] = $sensorsObj->dQ; 
		$srm_impianto['FIELDINT18'] = $sensorsObj->dR; 
		$srm_impianto['FIELDINT19'] = $sensorsObj->dS; 
		$srm_impianto['FIELDINT20'] =$sensorsObj->dT; 
		$srm_impianto['FIELDINT21'] =$sensorsObj->dU; 
		$srm_impianto['FIELDINT22'] =$sensorsObj->dV; 
		$srm_impianto['FIELDINT23'] =$sensorsObj->dW; 
		$srm_impianto['FIELDINT24'] =$sensorsObj->dX; 
		$srm_impianto['FIELDINT25'] =$sensorsObj->dY; 
		$srm_impianto['FIELDINT26'] =$sensorsObj->dZ; 
		$srm_impianto['FIELDINT27'] =$sensorsObj->d1; 
		$srm_impianto['FIELDINT28'] =$sensorsObj->d2; 
		$srm_impianto['FIELDINT29'] =$sensorsObj->d3; 
		$srm_impianto['FIELDINT30'] =$sensorsObj->d4; 
		$srm_impianto['FIELDINT31'] =$sensorsObj->d5; 
		$srm_impianto['FIELDINT32'] =$sensorsObj->d6; 
		$srm_impianto['FIELDINT33'] =$sensorsObj->AS; //ARIA SPEED
		$srm_impianto['FIELDINT34'] =$sensorsObj->VV; //VERSION
	}
	$srm_impianto = WFARRAYEPURE($srm_impianto);
	$conn->AutoExecute("srm_impianti", $srm_impianto, 'UPDATE','ID = ' . $srm_impianto['ID'] );

	/***************************/
	/*  LOG COMUNICAZIONI */
	/***************************/
	$srm_impiantolog = array();
	$srm_impiantolog = object_clone($srm_impianto);
	$srm_impiantolog['SI'] = $date->getTimestamp(); 
	$srm_impiantolog['SC'] = $date->getTimestamp(); 
	$srm_impiantolog['SR'] = $date->getTimestamp(); 
	$srm_impiantolog['SRM_CT_IMPIANTI'] = $srm_impianto['ID'];
	$srm_impiantolog['ID'] =  null;
	$srm_impiantolog = WFARRAYEPURE($srm_impiantolog);
	$conn->AutoExecute("srm_impianti_log", $srm_impiantolog, 'INSERT' );

	/***************************/
	/*  ESPOSIZIONE PROGRAMMA DA CARICARE */
	/***************************/
	echo ('<html>');
	echo ('<head/>');
	echo ('<body>');
	echo ('<ver>1</ver>');
	echo ('<program_update>');
	
	$prog = string2datetime($srm_impianto['SR'],'Y-m-d H:i:s','Europe/Rome');
	echo ('<program_time>' . date2unixtime($prog) . '</program_time>');
	
	$now = string2datetime(null,'Y-m-d H:i:s',$srm_impianto['TIMEZONE']);
	echo ('<system_time>' . date2unixtime($now) . '</system_time>');
	
	echo ('<flux_control>0</flux_control>');
	echo ('<machineid>' .  $srm_impianto['ID'] . '</machineid>');
	
	echo ('<programs>');
	
	$Sql = "SELECT * 
			FROM srm_impiantitimer 
			WHERE SRM_CT_IMPIANTI = " . $srm_impianto['ID'];
	$TotaliGGrs = $conn->execute($Sql);
	$countProg = 1;
	while (!$TotaliGGrs->EOF){
		echo ('<pr>');
			echo ('<pr_id>' . $TotaliGGrs->fields['PRODNUM'] .'</pr_id>');
			echo ('<pr_active>' . !$TotaliGGrs->fields['DISATTIVATO'] .'</pr_active>');
			echo ('<on>');
				$DayArray = array();
				if ($TotaliGGrs->fields['M']) $DayArray[] = 'm';
				if ($TotaliGGrs->fields['T']) $DayArray[] = 't';
				if ($TotaliGGrs->fields['W']) $DayArray[] = 'w';
				if ($TotaliGGrs->fields['R']) $DayArray[] = 'r';
				if ($TotaliGGrs->fields['F']) $DayArray[] = 'f';
				if ($TotaliGGrs->fields['S']) $DayArray[] = 's';
				if ($TotaliGGrs->fields['U']) $DayArray[] = 'u';
				echo(implode(",", $DayArray));
			echo ('</on>');
			echo ('<r0>' . $TotaliGGrs->fields['R0'] .'</r0>');
			echo ('<r1>' . $TotaliGGrs->fields['R1'] .'</r1>');
			echo ('<start_hour>' . date_format( date_create($TotaliGGrs->fields['STARTHH']),"H:i") .'</start_hour>');
			echo ('<end_hour>' . date_format( date_create($TotaliGGrs->fields['ENDHH']),"H:i") .'</end_hour>');
			echo ('<cy_seconds>' . $TotaliGGrs->fields['CYCLEEVERY'] .'</cy_seconds>');
			echo ('<cy_percent>' . $TotaliGGrs->fields['CYCLEON'] .'</cy_percent>');
		echo ('</pr>');
		$countProg = $countProg +1;
		$TotaliGGrs->MoveNext();
	}
	echo ('</programs>');
	echo ('<exceptions/>');
	echo ('<next_update>' . $srm_impianto['UPDATECYCLE'] .'</next_update>');
	echo ('</program_update>');
	echo ('</body>');
	echo ('</html>');

	$conn->close();
?>