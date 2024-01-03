<?php
	// https://api.chsweb.it/index.php?api=whatsapp&type=incomingCall&callerNum=+393482906120&callerName=&userNum=+390522580649&userName=+390522580649&installazioneId=08df4472-a797-400f-ac0d-f229744eae90&destination=&state=ring&destinationType=&url=https:/h2software.wildixin.com&token=4e3e853041064182911ea6ef38d19a559e80d6ead4e1432d87f72c422454fa32
	error_reporting(E_ALL ^ E_DEPRECATED ^ E_WARNING);
	ini_set('max_execution_time', 100);
	setlocale(LC_MONETARY, 'it_IT');
	date_default_timezone_set('europe/rome');
	$_SESSION['debug'] = 'false';
	
	# report all errors
	/*	*/
	error_reporting(E_ALL); 
	ini_set('display_startup_errors', 1);
	ini_set('display_errors', 1);
	error_reporting(-1);
	
	//AUTH
    $dbname = 'pasina';
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
	require_once("./includes/PHPPersonal/whatsapp/whatsapp.php");

	$waSDK = new WhatsappSDK();
	$waSDK->debug = false;
	
	$waSDK->VERIFY_TOKEN = "HAPPYDAY";

	//MAIN
	$date = new DateTime();
	$waSDK->webhooksHandler($_SERVER);
	$messageR = $waSDK->events[0];
	$message = $messageR[0];
	$messageS = json_encode($message);
	exec("echo '$messageS\n' >> ./debugM.log");
	
	$mittenteNum  = $message['contact']['wa_id'];
	$mittenteName = $message['contact']['name'];
	
	$messageContent = $message['content'][0];
	$messaggioId =  $messageContent['id'];
	$messaggioId =  $messageContent['type'];
	$messaggioFrom = $messageContent['from'];
	$messaggioData =  $messageContent['data'];

	//scarto chiamate interne
	if (strlen($mittenteNum) < 4){ die();}

	$srm_comunicazioni = array();
	$srm_comunicazioni['CANALE'] = 'wapp';
	$srm_comunicazioni['USERNUM'] = '+1 (555) 062-3692'; 
	$srm_comunicazioni['CALLERNAME'] = $mittenteName;
	$srm_comunicazioni['CALLER'] = $mittenteNum;
	$srm_comunicazioni['STATE'] = 'wapp';
	$srm_comunicazioni['NOTE'] = $messaggioData;
	$srm_comunicazioni['OPENAT'] = $date->getTimestamp(); 
	$conn->AutoExecute("srm_comunicazioni", $srm_comunicazioni, 'INSERT' );
	$srm_comunicazioni['ID'] = $conn->Insert_ID();
		
	$conn->Execute("update srm_comunicazioni
					inner join soggetticontatti on soggetticontatti.RIFERIMENTO = srm_comunicazioni.CALLER
								inner join soggetti on soggetti.ID = soggetticontatti.CT_SOGGETTI
					set srm_comunicazioni.CT_SOGGETTI = soggetti.ID
					WHERE srm_comunicazioni.CT_SOGGETTI is null
					AND srm_comunicazioni.ID = " . $srm_comunicazioni['ID']);

	$conn->Execute("update srm_comunicazioni
						inner join gestioniunitaimmobiliarisoggetti on gestioniunitaimmobiliarisoggetti.CT_SOGGETTI = srm_comunicazioni.CT_SOGGETTI
						inner join unitaimmobiliari ON gestioniunitaimmobiliarisoggetti.CT_UNITAIMMOBILIARI = unitaimmobiliari.ID
					set srm_comunicazioni.CT_CONDOMINI = unitaimmobiliari.CT_CONDOMINI
					WHERE srm_comunicazioni.CT_CONDOMINI is null
					AND srm_comunicazioni.ID = " . $srm_comunicazioni['ID']);

	$conn->Execute("update ignore srm_comunicazioni
					inner join gestioniunitaimmobiliarisoggetti on gestioniunitaimmobiliarisoggetti.CT_SOGGETTI = srm_comunicazioni.CT_SOGGETTI
					inner join unitaimmobiliari ON gestioniunitaimmobiliarisoggetti.CT_UNITAIMMOBILIARI = unitaimmobiliari.ID AND unitaimmobiliari.CATDATI_CLASSE = 3
				set srm_comunicazioni.CT_UNITAIMMOBILIARI = unitaimmobiliari.ID
				WHERE srm_comunicazioni.CT_UNITAIMMOBILIARI is null
				AND srm_comunicazioni.ID = " . $srm_comunicazioni['ID']);

	$conn->close();
?>