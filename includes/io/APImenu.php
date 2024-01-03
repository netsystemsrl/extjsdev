<?php
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
	
	//error_reporting(E_ALL);
	//ini_set('display_errors', 1);
	//$conn->debug=1; 
	//WFSetDebug(false);
	//WFSendLOG("MenuRead:","START");
	
	//$algorithm = 'HS256';
	$algorithm = 'RS256';
	$secret = 'secret';
	$time = time();
	$leeway = 5; // seconds
	$ttl = 30; // seconds
	$claims = array('sub'=>'1234567890','name'=>'John Doe','admin'=>true);

	// test that the functions are working
	//$token = generateToken($claims,$time,$ttl,$algorithm,$secret);
	//$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJmYXJpbmFuIiwiZXhwIjoxNTA1MjIwMDY0fQ.eSHYMQAs4b4IqHV3D7j4e3hLA3zyI9Qh99TucOiUG62W0Nr-vwA007AtyKJO5NI1weDIShQ7ILSq8kAopqaC-ZqaZu4ckFxF5brrgPGQfX7BbJ3CbjeN4POf2JIP8TPlR-bpe4UKwgkyoOj1BddpkfJiq_8esIvqRCbyWpz21vMdvYbqzCLd0cFK3A_vW-1hPplfGPOBXkC8iiK1ywWxRIaL981oaj1uLngTImhy62fpIaCqPKL9vhnuzDYL2LQn3td8WVYuAHFAiWaFMtM5ME0w8LKnekPinlX4Bmd87s0VlhtOdW0wPNaOFN0uGCwG-NBatMqej6zIbpuEXRdgdw';

	$token = $_COOKIE["infoline-auth"];
	//echo "$token\n";

	$claims = getVerifiedClaims($token,$time,$leeway,$ttl,$algorithm,$secret);
	
	//var_dump($claims);
	//var_dump (date('m/d/Y', $claims['exp']));
	//$date = new DateTime();
	//$now = new DateTime();
	//var_dump($date);
	//print_r($now);
	//var_dump(time());
	//var_dump($claims['exp']);

	if($claims['exp'] < time()) {
		echo "date expiration is in the past\n";
		die();
	} else {

		//error_reporting(E_ALL);
		//ini_set('display_errors', 1);
		//$conn->debug=1; 

		$parent_id = 0;
		$parent_id = isset($_POST["node"]) ? $_POST["node"] : $parent_id;
		$parent_id = isset($_GET["node"]) ? $_GET["node"] : $parent_id;
		if ($parent_id == '') $parent_id  = '0';

		$sql =  "SELECT * FROM A_MENUPORTAL " . 
				" WHERE ID > 0 AND CT_PROFILO < 4 " . 
				" ORDER BY PARENT_ID ASC, ID ASC";
		$rs = $conn->Execute($sql);

		//Permission
		$PermissionOn = true;
		if (($_SESSION['UserDeveloper'] === true) || ($_SESSION['UserAdmin'] === true)){
			$PermissionOn = false;
		}
		
		$output["edges"][]=array(
						"parentId"=>"",
						"childId"=>"portale-" ."0"
					);
				
		$output["vertices"][]=array(
						"id"=>"portale-" ."0",
						"title"=>"Portale Dipendente"
					);	
		//data
		$RecordCountResult = 0;
		while (!$rs->EOF) {	
			//gruppo permessi
			$EnableMenu = true;
			
			//conta se ha figli per cambiare icona
			$sql =  "SELECT ID " .
					" FROM A_MENUPORTAL " . 
					" WHERE ID >0 AND PARENT_ID = " . $rs->fields['ID'] .
					" ORDER BY ORDINE ASC, TEXT ASC";
			$rscount = $conn->SelectLimit($sql,1,-1);
			
			//stampa menu
			if ($EnableMenu == true){
				//edges (sopo padri)
				//if ($rscount->RecordCount()!=0){
					$output["edges"][]=array(
						"childId"=>"portale-" . $rs->fields['ID'],
						"parentId"=>"portale-" . $rs->fields['PARENT_ID']
					);
				//}
				
				//vertices
				$output["vertices"][]=array(
					"id"=>"portale-" . $rs->fields['ID'],
					"title"=>$rs->fields['TEXT'],
					"href"=>"/portale/direct.php?aziendaid=" . '15001' . 
												"&matricolaid=" . '32031' . 
												"&userid=" . '32031' . 
												"&formid=" . $rs->fields['CT_FORM'] . 
												"&procid=" . $rs->fields['CT_ACTIVITY']
				);
				
			}
			$rscount->close();
			$rs->MoveNext();
			$RecordCountResult++;
		}	
		$rs->close();
		
		echo json_encode($output);
		$conn->close();
	}
?>
