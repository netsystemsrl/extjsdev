<?php
	// https://api.chsweb.it/index.php?api=wildixin&dbname=pasina&type=incomingCall&callerNum=+393482906120&callerName=&userNum=+390522580649&userName=+390522580649&installazioneId=08df4472-a797-400f-ac0d-f229744eae90&destination=&state=ring&destinationType=&url=https:/h2software.wildixin.com&token=4e3e853041064182911ea6ef38d19a559e80d6ead4e1432d87f72c422454fa32
	error_reporting(E_ALL ^ E_DEPRECATED ^ E_WARNING);
	ini_set('max_execution_time', 100);
	setlocale(LC_MONETARY, 'it_IT');
	date_default_timezone_set('europe/rome');
	$_SESSION['debug'] = 'false';
	
	# report all errors
	/*	
	error_reporting(E_ALL); 
	ini_set('display_startup_errors', 1);
	ini_set('display_errors', 1);
	error_reporting(-1);
	*/
	//AUTH

	
	$dbname = 'pasina';
	$dbname = isset($_POST["dbname"]) ? $_POST["dbname"] : $dbname;
	$dbname = isset($_GET["dbname"]) ? $_GET["dbname"] : $dbname;
	$username = 'prod';
	$password = '135792468';

	if (($username != '') && ($password != '' )){
		//login da url
		require("LoginAuth.php");
	}else{
		//basic auth
		$authorization =  '';
		if (!isset($_SERVER['PHP_AUTH_USER']) && !isset($_SERVER['PHP_AUTH_PW'])) {
			header('WWW-Authenticate: Basic realm="ExtJSDEVDB interface"');
			header('HTTP/1.0 401 Unauthorized');
			echo _('Access denied');
			exit();
		}else{
			$username = $_SERVER['PHP_AUTH_USER'];
			$password = $_SERVER['PHP_AUTH_PW'];
			require("LoginAuth.php");
		}
	}
		
	if ($output['failure'] == true) {
		echo Array2JSON($output);
		$conn->close(); 
		die();
	}

	//PROGRAM
	WFSetDebug(false);

	//MAIN
	$date = new DateTime();
	
	$installazioneId = '';
	$installazioneId = isset($_POST["installazioneId"]) ? $_POST["installazioneId"] : $installazioneId;
	$installazioneId = isset($_GET["installazioneId"]) ? $_GET["installazioneId"] : $installazioneId;

	$type = '';
	$type = isset($_POST["type"]) ? $_POST["type"] : $type;
	$type = isset($_GET["type"]) ? $_GET["type"] : $type;
	
	$callerNum = '';
	$callerNum = isset($_POST["callerNum"]) ? $_POST["callerNum"] : $callerNum;
	$callerNum = isset($_GET["callerNum"]) ? $_GET["callerNum"] : $callerNum;
	$callerNum = str_replace(" 39", "+39", $callerNum);

	$callerName = '';
	$callerName = isset($_POST["callerName"]) ? $_POST["callerName"] : $callerName;
	$callerName = isset($_GET["callerName"]) ? $_GET["callerName"] : $callerName;
	$callerName = str_replace(" 39", "+39", $callerName);
	
	$userNum = '';
	$userNum = isset($_POST["userNum"]) ? $_POST["userNum"] : $userNum;
	$userNum = isset($_GET["userNum"]) ? $_GET["userNum"] : $userNum;
	$userNum = str_replace(" 39", "+39", $userNum);
	
	$userName = '';
	$userName = isset($_POST["userName"]) ? $_POST["userName"] : $userName;
	$userName = isset($_GET["userName"]) ? $_GET["userName"] : $userName;
	$userName = str_replace(" 39", "+39", $userName);

	$destination = '';
	$destination = isset($_POST["destination"]) ? $_POST["destination"] : $destination;
	$destination = isset($_GET["destination"]) ? $_GET["destination"] : $destination;
	
	$destinationType = '';
	$destinationType = isset($_POST["destinationType"]) ? $_POST["destinationType"] : $destinationType;
	$destinationType = isset($_GET["destinationType"]) ? $_GET["destinationType"] : $destinationType;
	
	$state = '';
	$state = isset($_POST["state"]) ? $_POST["state"] : $state;
	$state = isset($_GET["state"]) ? $_GET["state"] : $state;
	
	/***************************/
	/*  ricerca impianto		*/
	/***************************/
	$type = trim($type);
	$callerNum = trim($callerNum);
	$callerNum = str_replace("+39", "", $callerNum);

	$callerName = trim($callerName);
	$callerName = str_replace("+39", "", $callerName);

	$userNum = trim($userNum);
	$userNum = str_replace("+39", "", $userNum);

	$userName = trim($userName);
	$destination = trim($destination);
	$destinationType = trim($destinationType);
	$state = trim($state);
	if ($callerNum == ''){
		$type = '';
	}

	$calLen = strlen($callerNum);
	if ($calLen <4) {$conn->close(); return;}

	$srm_comunicazioni = WFVALUEDLOOKUP('*','srm_comunicazioni',"CALLER = '" . $callerNum . "' AND DATE(OPENAT) = DATE(CURDATE()) ");
	if ($type == 'incomingCall'){
		if ($srm_comunicazioni == ''){
			$srm_comunicazioni = array();
			$srm_comunicazioni['CANALE'] = 'centralino';
			$srm_comunicazioni['USERNUM'] = $userNum;
			$srm_comunicazioni['CALLERNAME'] = $callerName;
			$srm_comunicazioni['CALLER'] = $callerNum;
			$srm_comunicazioni['STATE'] = $state;
			$srm_comunicazioni['OPENAT'] = $date->getTimestamp(); 
			$conn->AutoExecute("srm_comunicazioni", $srm_comunicazioni, 'INSERT' );
			$srm_comunicazioni['ID'] = $conn->Insert_ID();		
			$conn->Execute("UPDATE srm_comunicazioni
								INNER JOIN soggetticontatti on soggetticontatti.RIFERIMENTO LIKE CONCAT('%',srm_comunicazioni.CALLER)
							SET srm_comunicazioni.CT_SOGGETTI = soggetticontatti.CT_SOGGETTI
							WHERE LENGTH(soggetticontatti.RIFERIMENTO) > 6
								AND srm_comunicazioni.ID = " . $srm_comunicazioni['ID']);
								
			$conn->Execute("UPDATE srm_comunicazioni
								INNER JOIN soggetticontatti on  srm_comunicazioni.CALLER LIKE CONCAT('%',soggetticontatti.RIFERIMENTO)
							SET srm_comunicazioni.CT_SOGGETTI = soggetticontatti.CT_SOGGETTI
							WHERE LENGTH(soggetticontatti.RIFERIMENTO) > 6
								AND srm_comunicazioni.ID = " . $srm_comunicazioni['ID']);

			$conn->Execute("UPDATE ignore srm_comunicazioni
								INNER JOIN gestioniunitaimmobiliarisoggetti on gestioniunitaimmobiliarisoggetti.CT_SOGGETTI = srm_comunicazioni.CT_SOGGETTI
								INNER JOIN unitaimmobiliari ON gestioniunitaimmobiliarisoggetti.CT_UNITAIMMOBILIARI = unitaimmobiliari.ID AND unitaimmobiliari.CATDATI_CLASSE = 3
							SET srm_comunicazioni.CT_UNITAIMMOBILIARI = unitaimmobiliari.ID
							WHERE srm_comunicazioni.ID = " . $srm_comunicazioni['ID']);
							
			$conn->Execute("UPDATE srm_comunicazioni
								INNER JOIN gestioniunitaimmobiliarisoggetti on gestioniunitaimmobiliarisoggetti.CT_SOGGETTI = srm_comunicazioni.CT_SOGGETTI
								INNER JOIN unitaimmobiliari ON gestioniunitaimmobiliarisoggetti.CT_UNITAIMMOBILIARI = unitaimmobiliari.ID
							SET srm_comunicazioni.CT_CONDOMINI = unitaimmobiliari.CT_CONDOMINI
							WHERE srm_comunicazioni.ID = " . $srm_comunicazioni['ID']);

		}
		else{
			$srm_comunicazioni['USERNUM'] = $userNum;
			$srm_comunicazioni['STATE'] = $state;
			$srm_comunicazioni['OPENAT'] = $date->getTimestamp(); 
			$conn->AutoExecute("srm_comunicazioni", $srm_comunicazioni, 'UPDATE' ,' ID = ' . $srm_comunicazioni['ID'] );
		}
		
	}
	if ($type == 'updatedCall'){
		if ($srm_comunicazioni != ''){
			$srm_comunicazioni['USERNUM'] = $userNum;
			$srm_comunicazioni['STATE'] = $state;
			$srm_comunicazioni['UPDATEAT'] = $date->getTimestamp(); 
			$conn->AutoExecute("srm_comunicazioni", $srm_comunicazioni, 'UPDATE' ,' ID = ' . $srm_comunicazioni['ID'] );
		}
	}
	if ($type == 'closedCall'){
		if ($srm_comunicazioni != ''){
			$srm_comunicazioni['USERNUM'] = $userNum;
			$srm_comunicazioni['STATE'] = $state;
			$srm_comunicazioni['CLOSEAT'] = $date->getTimestamp(); 
			$conn->AutoExecute("srm_comunicazioni", $srm_comunicazioni, 'UPDATE' ,' ID = ' . $srm_comunicazioni['ID'] );

			$conn->Execute("update srm_comunicazioni 
							SET TIMEELAPSED = ABS(TIMESTAMPDIFF(MINUTE, CLOSEAT,OPENAT) )
							WHERE srm_comunicazioni.TIMEELAPSED is null AND CLOSEAT IS NOT NULL 
							AND srm_comunicazioni.ID = " . $srm_comunicazioni['ID']);
					
		}
	}
	$conn->close();
?>