<?php	
	include('../var.php');
//	WFSetDebug(true);

	WFSendLOG("API:","START");
		
	require 'vendor/autoload.php';
	// This is your id token
	$token ='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2xvZ2luLmF1dGgwLmNvbS8iLCJzdWIiOiJnaXRodWJ8MTc4NTEyIiwiYXVkIjoiS2dTak1OM09Dd21yanZ0ako4YmZ1WnlBYW9LT3JnSDMiLCJleHAiOjEzODI3NDcxMTgsImlhdCI6MTM4MjcxMTExOCwiYmxvZyI6Imh0dHA6Ly90d2l0dGVyLmNvbS9qZnJvbWEiLCJjbGllbnRJRCI6IktnU2pNTjNPQ3dtcmp2dGpKOGJmdVp5QWFvS09yZ0gzIiwiY3JlYXRlZF9hdCI6IjIwMTMtMTAtMjRUMDE6MDk6NDIuMDQyWiIsImVtYWlsIjoiamZyb21hbmllbGxvQGdtYWlsLmNvbSIsImV2ZW50c191cmwiOiJodHRwczovL2FwaS5naXRodWIuY29tL3VzZXJzL2pmcm9tYW5pZWxsby9ldmVudHN7L3ByaXZhY3l9IiwiZm9sbG93ZXJzIjo0OCwiZm9sbG93ZXJzX3VybCI6Imh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlcnMvamZyb21hbmllbGxvL2ZvbGxvd2VycyIsImZvbGxvd2luZyI6MjcsImZvbGxvd2luZ191cmwiOiJodHRwczovL2FwaS5naXRodWIuY29tL3VzZXJzL2pmcm9tYW5pZWxsby9mb2xsb3dpbmd7L290aGVyX3VzZXJ9IiwiZ2lzdHNfdXJsIjoiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy9qZnJvbWFuaWVsbG8vZ2lzdHN7L2dpc3RfaWR9IiwiZ3JhdmF0YXJfaWQiOiJkMWE3ZTBmYmZiMmMxZDlhOGIxMGZkMDM2NDhkYTc4ZiIsImhpcmVhYmxlIjpmYWxzZSwiaHRtbF91cmwiOiJodHRwczovL2dpdGh1Yi5jb20vamZyb21hbmllbGxvIiwiaWRlbnRpdGllcyI6W3siYWNjZXNzX3Rva2VuIjoiYjk2YmRkZDg5MjRhNmZiY2YwYWVkMTljMWFjY2FjNjUwOWI4OGRmMiIsInByb3ZpZGVyIjoiZ2l0aHViIiwidXNlcl9pZCI6MTc4NTEyLCJjb25uZWN0aW9uIjoiZ2l0aHViIiwiaXNTb2NpYWwiOnRydWV9XSwibG9jYXRpb24iOiJDw7NyZG9iYSwgQXJnZW50aW5hIiwibmFtZSI6Ikpvc8OpIEYuIFJvbWFuaWVsbG8iLCJuaWNrbmFtZSI6Impmcm9tYW5pZWxsbyIsIm9yZ2FuaXphdGlvbnNfdXJsIjoiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy9qZnJvbWFuaWVsbG8vb3JncyIsInBpY3R1cmUiOiJodHRwczovLzIuZ3JhdmF0YXIuY29tL2F2YXRhci9kMWE3ZTBmYmZiMmMxZDlhOGIxMGZkMDM2NDhkYTc4Zj9kPWh0dHBzJTNBJTJGJTJGaWRlbnRpY29ucy5naXRodWIuY29tJTJGMzc1MmRiYzViYzYyYzAxZmI2M2FhNzRjM2RhMjgwOTcucG5nJnI9eCIsInB1YmxpY19naXN0cyI6MjAyLCJwdWJsaWNfcmVwb3MiOjExOSwicmVjZWl2ZWRfZXZlbnRzX3VybCI6Imh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlcnMvamZyb21hbmllbGxvL3JlY2VpdmVkX2V2ZW50cyIsInJlcG9zX3VybCI6Imh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlcnMvamZyb21hbmllbGxvL3JlcG9zIiwic2l0ZV9hZG1pbiI6ZmFsc2UsInN0YXJyZWRfdXJsIjoiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy9qZnJvbWFuaWVsbG8vc3RhcnJlZHsvb3duZXJ9ey9yZXBvfSIsInN1YnNjcmlwdGlvbnNfdXJsIjoiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy9qZnJvbWFuaWVsbG8vc3Vic2NyaXB0aW9ucyIsInR5cGUiOiJVc2VyIiwidXBkYXRlZF9hdCI6IjIwMTMtMTAtMjRUMTQ6NTY6NDFaIiwidXJsIjoiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy9qZnJvbWFuaWVsbG8iLCJ1c2VyX2lkIjoiZ2l0aHVifDE3ODUxMiJ9.ZVdzRntRHoIK1VObdyoswFpRAuL5doCBa5rHZsZY_XQ';
	// This is your client secret
	$key = '5yy6vCe0ChxadKGsVcX47VMCNZLBwWVrBLQdWeFJZ0_S2fLFi2o9wifuzE-U3MRX';
	$decoded = JWT::decode( $token, base64_decode(strtr($key, '-_', '+/')) );
	print_r($decoded);

	die();


	$asset = base64_encode(file_get_contents('http://lorempixel.com/200/300/cats/'));
	$token = JWT::decode($jwt, $secretKey, array('HS512'));
	
	$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
	$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
	$key = array_shift($request)+0;
 
	// escape the columns and values from the input object
	$input = json_decode(file_get_contents('php://input'),true);
	$columns = preg_replace('/[^a-z0-9_]+/i','',array_keys($input));
	$values = array_map(function ($value) use ($link) {
		if ($value === null) return null;
		return mysqli_real_escape_string($link,(string)$value);
	},array_values($input));
 
	// build the SET part of the SQL command
	$set = '';
	for ($i=0;$i<count($columns);$i++) {
	  $set.=($i>0?',':'').'`'.$columns[$i].'`=';
	  $set.=($values[$i]===null?'NULL':'"'.$values[$i].'"');
	}
 
	// create SQL based on HTTP method
	$method = $_SERVER['REQUEST_METHOD'];
	switch ($method) {
	  case 'GET':
		$sql = "select * from `$table`".($key?" WHERE id=$key":''); break;
	  case 'PUT':
		$sql = "update `$table` set $set where id=$key"; break;
	  case 'POST':
		$sql = "insert into `$table` set $set"; break;
	  case 'DELETE':
		$sql = "delete `$table` where id=$key"; break;
	}
		 
	// excecute SQL statement
	$result = mysqli_query($link,$sql);
	 
	// die if SQL statement failed
	if (!$result) {
	  http_response_code(404);
	  die(mysqli_error());
	}
	 
	// print results, insert id or affected row count
	if ($method == 'GET') {
	  if (!$key) echo '[';
	  for ($i=0;$i<mysqli_num_rows($result);$i++) {
		echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
	  }
	  if (!$key) echo ']';
	} elseif ($method == 'POST') {
	  echo mysqli_insert_id($link);
	} else {
	  echo mysqli_affected_rows($link);
	}
	 
	// close mysql connection
	mysqli_close($link);



	$parent_id = 0;
	$parent_id = isset($_POST["node"]) ? $_POST["node"] : $parent_id;
	$parent_id = isset($_GET["node"]) ? $_GET["node"] : $parent_id;
	if ($parent_id == '') $parent_id  = '0';
	
	$sql =  "SELECT * FROM " . $ExtJSDevDB . "menu " . 
			" WHERE PARENT_ID = " . $parent_id . 
			" ORDER BY ORDPRIORITY ASC, DESCNAME ASC";
	$rs = $conn->Execute($sql);

	//can pre-define
	$output["metaData"]["idProperty"]="ID";
	$output["metaData"]["totalProperty"]="total";
	$output["metaData"]["successProperty"]="success";
	$output["metaData"]["root"]="data"; 
				
	//field
	$output["fields"][]=array("name"=>"id","type"=>"int");
	$output["fields"][]=array("name"=>"text","type"=>"string");
	$output["fields"][]=array("name"=>"leaf","type"=>"string");
	$output["fields"][]=array("name"=>"iconCls","type"=>"string");
	$output["fields"][]=array("name"=>"cls","type"=>"string");
	$output["fields"][]=array("name"=>"draggable","type"=>"string");
	
	//Permission
	$PermissionOn = true;
	if (($UserDeveloper === true) || ($UserAdmin === true)){
		$PermissionOn = false;
	}
	
	//data
	$RecordCountResult = 0;
	while (!$rs->EOF) {	
		//gruppo permessi
		$EnableMenu = true;
		if ($PermissionOn == true){
			$sql =  "SELECT * FROM " . $ExtJSDevDB . "menugroup " . 
					" WHERE CT_AAAGROUP = 0" .
					" AND CT_AAAMENU  = " . $rs->fields['ID'];
			$rsgroup = $conn->Execute($sql);
			if (!$rsgroup->EOF) {
				if ($rsgroup->fields['VISIBLE'] == 0) {
					$EnableMenu = false;
				}
			}
			$rsgroup->close();
			$sql =  "SELECT * FROM " . $ExtJSDevDB . "menugroup " . 
					" WHERE CT_AAAGROUP = " . $UserGroup . 
					" AND CT_AAAMENU  = " . $rs->fields['ID'];
			$rsgroup = $conn->Execute($sql);
			if (!$rsgroup->EOF) {
				if ($rsgroup->fields['VISIBLE'] == 0) {
					$EnableMenu = false;
				}else{
					$EnableMenu = true;
				}
			}
			$rsgroup->close();
			$sql =  "SELECT * FROM " . $ExtJSDevDB . "menugroup " . 
					" WHERE CT_AAAUSER = " . $UserId . 
					" AND CT_AAAMENU  = " . $rs->fields['ID'];
			$rsgroup = $conn->Execute($sql);
			if (!$rsgroup->EOF) {
				if ($rsgroup->fields['VISIBLE'] == 0) {
					$EnableMenu = false;
				}else{
					$EnableMenu = true;
				}
			}
			$rsgroup->close();
		}
		
		//conta se ha figli per cambiare icona
		$sql =  "SELECT ID " .
				" FROM " . $ExtJSDevDB . "menu " . 
				" WHERE PARENT_ID = " . $rs->fields['ID'];
		$rscount = $conn->SelectLimit($sql,1,-1);
		//stampa menu
		if ($EnableMenu == true){
			$output["data"][]=array("id"=>$rs->fields['ID'],
									"text"=>$rs->fields['DESCNAME'],
									"leaf"=>($rscount->RecordCount()==0),
									"iconCls"=>$rs->fields['ICONCLS'],
									"rowCls"=>$rs->fields['CLS'],
									"draggable"=>false,
									);
		}
		$rscount->close();
		$rs->MoveNext();
		$RecordCountResult++;
	}	
	$rs->close();

	// misc 
	$output["total"]=$RecordCountResult;
	$output["success"]=true;
	$output["message"]="success";
	
	echo Array2JSON($output);
	$conn->close();
?>