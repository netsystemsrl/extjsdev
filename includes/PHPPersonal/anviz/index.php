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
	global $_SESSION;
	session_write_close();
	//WFSetDebug(true);
	$debugmessage = 0;

	// https://techearl.com/php/installing-gearman-module-for-php7-on-ubuntu
	require "PHPAnviz.php";
	//third parameter is optional, if not set class uses default config.ini we've created earlier
	$anviz = new PHPAnviz(1, 5010, "config.ini");

	//format is optional, by default method getDateTime returns datetime in Y-m-d H:i:s format
	echo $anviz->getDateTime("Y/m/d H:i:s");
	//$result = $anviz->setDateTime("2020-07-25 22:16:00"); 
	
	$TimbratoreId  = $anviz->getDeviceId();
	$TimbratoreMAC = $anviz->getTCPIPParameters()['mac_address'];
	
	/**/
	
	echo('dump' . BRCRLF);
	echo('getInfo1');
	var_dump($anviz->getInfo1()); //array
	
	echo('getInfo2');
	var_dump($anviz->getInfo2()); //array
	
	echo('getTCPIPParameters');
	var_dump($anviz->getTCPIPParameters()); //array
	
	echo('getRecordInformation');
	var_dump($anviz->getRecordInformation()); //array
	
	echo('downloadStaffInfo');
	var_dump($anviz->downloadStaffInfo());//array of users
	
	echo('downloadTARecords');
	var_dump($anviz->downloadTARecords(PHPAnviz::DOWNLOAD_ALL)); //array 
	
	$result = $anviz->getAttendanceStateTable(); //returns array of states (MAX 16)
	echo('getAttendanceStateTable');
	var_dump($result);
	
	//OPEN DOOR
	$result = $anviz->openDoor();
	
	//UPLOAD
	//$result = $anviz->setAttendanceStateTable(); //returns array of states (MAX 16)
	
	/*states
	$states = array('IN', 'OUT', 'BREAK');
	$result = $anviz->setTAStateTable($states); 
	if ((!$result) && ($i>0)){
		echo('OK State');
	}else{
		echo('KO State');
	}
	*/
	
	//setting
	//							password, sleep time, volume, language, date format, attendance state, and setting flag.
	//$result = $anviz->setInfo1("12345",           10,      4,        1,          12,             0xFF, 0xFF);
	
	//user 
	
	echo('UPLOAD USER' . BRCRLF);
	if (true){
		echo('DELETE USER' . BRCRLF);
		//$result = $anviz->clearUsers(); 
		
		$sql = "SELECT * 
				FROM aaauser 
				WHERE NFC is not null ";
		// $sql = $sql . " AND MON_TIMBRA = 0";	
		$RsUser = $conn->Execute($sql);
		$users = array();
		$users[] =  array(	'user_id' => 1,
							'pwd' => '32015',
							'card_id' => '77421231',
							'name' => 'Test user 1',
							'department' => 0xFF,
							'group' => 1,
							'attendance_mode' => 0xFF,
							'pwd_8_digit' => 0xFF,
							'keep' => 0,
							'special_info' => 0xFF
						);
		$i=0;
		while (!$RsUser->EOF) {
			$users[] =  array(	'user_id' => $RsUser->fields['ID'],
								'pwd' => $RsUser->fields['PASSWORD'],
								'card_id' => $RsUser->fields['NFC'],
								'name' => $RsUser->fields['DESCNAME'],
								'department' => 0xFF,
								'group' => 1,
								'attendance_mode' => 0xFF,
								'pwd_8_digit' => 0xFF,
								'keep' => 0,
								'special_info' => 0xFF
							);
			$i = $i +1;
			$RsUser->MoveNext();
		}
		$RsUser->close();
		echo('ADD USER' . BRCRLF);
		$result = $anviz->uploadStaffInfo($users); //true if successful, false if failed
		if (($result) && ($i>0)){
			echo('OK USER' .  BRCRLF);
			//$sql = "SELECT aaauser SET MON_TIMBRA = 1 WHERE NFC is not null AND MON_TIMBRA = 0";
			//$conn->Execute($sql);			
		}else{
			echo('KO USER' .  BRCRLF);
			var_dump($result);
		}
	}
	
	//DOWNLOAD
	echo('DOWNLOAD TIMBRA' . BRCRLF);
	$timbrature = $anviz->downloadTARecords(PHPAnviz::DOWNLOAD_ALL);
	$errore = false;
	$i = 0;
	foreach ($timbrature as $timbratura) {
		var_dump($timbratura);
		$AppoRecord = array();
		$AppoRecord['TIMBRATORE'] = $TimbratoreId;
		$AppoRecord['TIMBRATOREMAC'] = $TimbratoreMAC;
		//0entrata   //1uscita  //2 pausa 
		$AppoRecord['TIPOLOGIA'] = $timbratura['record_type'];
		$AppoRecord['BADGE'] = $timbratura['user_code'];
		$AppoRecord['DATA'] = $timbratura['datetime'];
		$AppoRecord['ORA'] = $timbratura['datetime'];
		
		$User = WFVALUEDLOOKUP('*','aaauser',"ID = " . trim($timbratura['user_code']) . "");
		
		if ($User != ''){
			$AppoRecord['CT_AAAUSER'] = $User['ID'];
		}
		$i = $i +1;
		try {
			$conn->AutoExecute("hr_timbrature", $AppoRecord, 'INSERT');
			$existed = 0;
		} catch (Exception $e) {
			echo('ERRORE' . BRCRLF);
			$errore = true;
		}
	}
	
	echo('DELETE ALL DATA' . BRCRLF); 
	if (($errore) && ($i>0)){
		echo('OK DATA' . $result . BRCRLF);
		$result = $anviz->clearRecords(PHPAnviz::CLEAR_ALL);
		//PHPAnviz::CLEAR_ALL -> if you want to delete all records
		//PHPAnviz::CLEAR_NEW -> remove all "new record" signs
		//PHPAnviz::CLEAR_NEW_PARTIALY, int $n -> remove first $n "new records" signs
	}else{
		echo('KO DATA' . $result . BRCRLF);
	}
