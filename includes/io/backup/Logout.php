<?php 
//verifica utente
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');

	$output['success'] 		 = true; 
	$output['failure'] 		 = false; 
	$output['message'] 		 = "logout"; 
			
	if ($UserId != 0) {
		//USER SESSION
		$sqlC = "DELETE FROM " . $ExtJSDevDB . "usersession 
				WHERE CT_AAAUSER = " . $UserId . " 
					AND NUMREG = ". $RegistrationId . " 
					AND IP = '" . WFVALUECLIENTIP() . "'";
		$rs = $conn->Execute($sqlC);	
		if (!$rs) {
			$output['success'] 		 = false; 
			$output['failure'] 		 = true; 
			$output['message'] 		 = "errore SQL "; 
		}	
	}
	
	if(!isset($_SESSION)) {
		session_start();
	}
	$_SESSION = array();
	session_destroy();
	session_write_close();
	$output['messagedebug'] 		 = 'session reset';
	
	
	if (ini_get("session.use_cookies")) {
		$params = session_get_cookie_params();
		unset($_COOKIE['LOGIN']);
		unset($_COOKIE['PASSWORD']);
		unset($_COOKIE['DBNAME']);
		setcookie('LOGIN', null, -1, '/');
		setcookie('PASSWORD', null, -1, '/');
		setcookie('DBNAME', null, -1, '/');
		$output['messagedebug'] 		 = 'cookies reset';
	}
	
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>