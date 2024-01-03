<?php
//verifica utente
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
	WFSendLOG("Login:","START");
	/*
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	$conn->debug=1; 
	*/
	$output = array();
	$output['UserId'] = 0;
	$output['UserName'] = '';
	$output['UserLogin'] = '';
	$output['UserGroup'] = 0;
	$output['UserDeveloper'] = 0;
	$output['UserAdmin'] = 0;
	$output['UserThemeName'] = '';
	$output['UserThemeNameUI'] = '';
	$output['UserAnagraficaId'] = 0;
	$output['message'] = '';
	$output['success'] = false;
	$output['failure'] = true;
	if( isset($wftoken) &&  $wftoken != '' ){
		$sql =  "SELECT * 
				 FROM " . $ExtJSDevDB . "usersession 
				 WHERE NUMREG = '" . $wftoken . "'
				 ORDER BY ID DESC
				 LIMIT 1";
		$rs = $conn->Execute($sql);
		if ($rs) {
			$usernameID = $rs->fields['CT_AAAUSER'];
				
			$sql =  "SELECT * 
					 FROM " . $ExtJSDevDB . "user 
					 WHERE ID = " . $usernameID;
			$rs = $conn->Execute($sql);
			if ($rs && $rs->RecordCount()==1) {
				$output['success']       = true;
				$output['failure'] 		 = false;
		
				$UserId = $rs->fields['ID'];
				$UserDescName = $rs->fields['DESCNAME'];
				$UserLogin = $rs->fields["LOGIN"];
				$UserGroup = $rs->fields['CT_AAAGROUP'];
				$UserLocale = $rs->fields['LOCALE'];
				$UserAnagrafiche = $rs->fields['CT_ANAGRAFICHE'];
				$UserDeveloper = false;	
				if ($rs->fields['DEVELOPER'] == true){ $UserDeveloper = true;}
				$UserAdmin = false;
				if ($rs->fields['ADMINISTRATOR'] == true){$UserAdmin = true;}
				$UserThemeName = $rs->fields["LAYOUTTHEMENAME"];
				$UserThemeNameUI = $rs->fields["LAYOUTTHEMEUI"];
				$UserStartProc = $rs->fields["CT_AAAPROC"];
				$UserAnagraficaId = $rs->fields["CT_ANAGRAFICHE"];
				
				WFVALUESESSIONSETPRIV('UserId',$UserId);
				WFVALUESESSIONSETPRIV('UserDescName',$UserId);
				WFVALUESESSIONSETPRIV('UserGroup',$UserGroup);
				WFVALUESESSIONSETPRIV('UserLocale',$UserLocale);
				WFVALUESESSIONSETPRIV('UserDeveloper',$UserDeveloper);
				WFVALUESESSIONSETPRIV('UserAdmin',$UserAdmin);
				WFVALUESESSIONSETPRIV('UserThemeName',$UserThemeName);
				WFVALUESESSIONSETPRIV('UserThemeNameUI',$UserThemeNameUI);
				WFVALUESESSIONSETPRIV('UserStartProc',$UserStartProc);
				WFVALUESESSIONSETPRIV('username',$username);
				WFVALUESESSIONSETPRIV('UserLogin',$UserLogin);
				WFVALUESESSIONSETPRIV('password',$password);
				WFVALUESESSIONSETPRIV('dbname',$dbname);
				WFVALUESESSIONSETPRIV('RegistrationId',$RegistrationId);
				WFVALUESESSIONSETPRIV('UserAnagraficaId',$UserAnagraficaId);
				
				$output['UserId'] = $UserId;
				$output['UserName'] = $UserDescName;
				$output['UserLogin'] = $UserLogin;
				$output['UserGroup'] = $UserGroup;
				$output['UserLocale'] = $UserLocale;
				$output['UserAdmin'] = $UserAdmin;
				$output['UserDeveloper'] = $UserDeveloper;
				$output['UserThemeName'] = $UserThemeName;
				$output['UserThemeNameUI'] = $UserThemeNameUI;
				$output['UserStartProc'] = $UserStartProc;
				$output['UserDBname'] = $dbname;
				$output['RegistrationId'] = $RegistrationId;
				$output['UserAnagraficaId'] = $UserAnagraficaId;

				//USER COOKIE
				$cookie_name = "LOGIN";
				$cookie_value = $UserLogin;
				setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/"); // 86400 = 1 day
				$cookie_name = "PASSWORD";
				$cookie_value = $rs->fields["PASSWORD"];
				setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/"); // 86400 = 1 day
				$cookie_name = "DBNAME";
				$cookie_value = $dbname;
				setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/"); // 86400 = 1 day

				//USER SESSION
				$sqlC = "INSERT INTO " . $ExtJSDevDB . "usersession (CT_AAAUSER, NUMREG, IP, LASTACTIVITY) 
						VALUES ('" . $UserId . "', '". $RegistrationId . "', '" . WFVALUECLIENTIP() . "', NOW())";
				$conn->Execute($sqlC);	
			}
		}
	}
	elseif ( $username != '' ) {
		$sql =  "SELECT * 
				 FROM " . $ExtJSDevDB . "user 
				 WHERE LOGIN = '" . $username . "' 
					AND PASSWORD = '" . $password . "'";
		$rs = $conn->Execute($sql);
		if ($rs && $rs->RecordCount()==1) {
			$output['success']       = true;
			$output['failure'] 		 = false;
	
			$UserId = $rs->fields['ID'];
			$UserDescName = $rs->fields['DESCNAME'];
			$UserLogin = $rs->fields["LOGIN"];
			$UserGroup = $rs->fields['CT_AAAGROUP'];
			$UserLocale = $rs->fields['LOCALE'];
			$UserAnagrafiche = $rs->fields['CT_ANAGRAFICHE'];
			$UserDeveloper = false;	
			if ($rs->fields['DEVELOPER'] == true){ $UserDeveloper = true;}
			$UserAdmin = false;
			if ($rs->fields['ADMINISTRATOR'] == true){$UserAdmin = true;}
			$UserThemeName = $rs->fields["LAYOUTTHEMENAME"];
			$UserThemeNameUI = $rs->fields["LAYOUTTHEMEUI"];
			$UserStartProc = $rs->fields["CT_AAAPROC"];
			$UserAnagraficaId = $rs->fields["CT_ANAGRAFICHE"];
			
			WFVALUESESSIONSETPRIV('UserId',$UserId);
			WFVALUESESSIONSETPRIV('UserDescName',$UserId);
			WFVALUESESSIONSETPRIV('UserGroup',$UserGroup);
			WFVALUESESSIONSETPRIV('UserLocale',$UserLocale);
			WFVALUESESSIONSETPRIV('UserDeveloper',$UserDeveloper);
			WFVALUESESSIONSETPRIV('UserAdmin',$UserAdmin);
			WFVALUESESSIONSETPRIV('UserThemeName',$UserThemeName);
			WFVALUESESSIONSETPRIV('UserThemeNameUI',$UserThemeNameUI);
			WFVALUESESSIONSETPRIV('UserStartProc',$UserStartProc);
			WFVALUESESSIONSETPRIV('username',$username);
			WFVALUESESSIONSETPRIV('UserLogin',$UserLogin);
			WFVALUESESSIONSETPRIV('password',$password);
			WFVALUESESSIONSETPRIV('dbname',$dbname);
			WFVALUESESSIONSETPRIV('RegistrationId',$RegistrationId);
			WFVALUESESSIONSETPRIV('UserAnagraficaId',$UserAnagraficaId);
			
			$output['UserId'] = $UserId;
			$output['UserName'] = $UserDescName;
			$output['UserLogin'] = $UserLogin;
			$output['UserGroup'] = $UserGroup;
			$output['UserLocale'] = $UserLocale;
			$output['UserAdmin'] = $UserAdmin;
			$output['UserDeveloper'] = $UserDeveloper;
			$output['UserThemeName'] = $UserThemeName;
			$output['UserThemeNameUI'] = $UserThemeNameUI;
			$output['UserStartProc'] = $UserStartProc;
			$output['UserDBname'] = $dbname;
			$output['RegistrationId'] = $RegistrationId;
			$output['UserAnagraficaId'] = $UserAnagraficaId;

			//USER COOKIE
			$cookie_name = "LOGIN";
			$cookie_value = $UserLogin;
			setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/"); // 86400 = 1 day
			$cookie_name = "PASSWORD";
			$cookie_value = $rs->fields["PASSWORD"];
			setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/"); // 86400 = 1 day
			$cookie_name = "DBNAME";
			$cookie_value = $dbname;
			setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/"); // 86400 = 1 day

			//USER SESSION
			$sqlC = "INSERT INTO " . $ExtJSDevDB . "usersession (CT_AAAUSER, NUMREG, IP, LASTACTIVITY) 
					VALUES ('" . $UserId . "', '". $RegistrationId . "', '" . WFVALUECLIENTIP() . "', NOW())";
			$conn->Execute($sqlC);	
			
		}else{
			$UserId = 0;
			$_SESSION = array();
			session_destroy();
			$output['failure'] 		 = true; 
			$output['message'] 		 = "user / password error"; 
		}
	}
?>