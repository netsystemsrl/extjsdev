<?php		
	require_once('../var.php');
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
	//WFSetDebug(true);
	$debugmessage = 0;
	$UserManager = 0;
	WFSendLOG("UserInfo:","START");
	
	//USER DEF
	$sql =  "SELECT * 
			 FROM " . $ExtJSDevDB . "user 
			 WHERE ID = '" . $UserId . "'";
	$rs = $conn->Execute($sql);
	if ($rs->RecordCount()==1) {
		$UserManager = $rs->fields["MANAGER"];
		$item = array(	"UserId" => $UserId,
						"UserDescName" => $rs->fields['DESCNAME'],
						"UserLogin" => $rs->fields["LOGIN"],
						"UserGroup" => $UserGroup,
						"UserLocale" => $UserLocale,
						"UserAdmin" => $UserAdmin,
						"UserManager" => $UserManager,
						"UserDeveloper" => $UserDeveloper,
						"UserThemeName" => $rs->fields["LAYOUTTHEMENAME"],
						"UserThemeNameUI" => $rs->fields["LAYOUTTHEMEUI"],
						"UserStartProc" => $rs->fields["CT_AAAPROC"],
						"UserDBname" => $dbname,
						"UserArchive" => $ExtJSDevArchive,
						"RegistrationId" => $RegistrationId
					);
		//USER VAR
		$sql =  "SELECT * 
				FROM " . $ExtJSDevDB . "userglobal 
				WHERE CT_AAAUSER = " . $UserId . "";
		$rs = $conn->Execute($sql);	
		while (!$rs->EOF) {
			$item[] = array($rs->fields['DESCNAME'] => $rs->fields['KEYVALUE']);
			$rs->MoveNext();
		}
		$rs->close();
		
		$output["data"][] = $item;
		$output["failure"]=false;
		$output["success"]=true;
	}else{
		$output["failure"]=true;
		$output["success"]=false;
		$output["message"]='UserID not found';
	}
	
	//RESULT
	$Appo = Array2JSON($output,$debugmessage);
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo $Appo;
?>