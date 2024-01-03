<?php
	/*
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	*/
	$dbname   = 'netsystem';
	$username = 'admin';
	$password = '258';
	$formatOutput = 'HTML';
	include ($_SERVER['DOCUMENT_ROOT'] . '/includes/io/LoginAuth.php');
	require_once ($_SERVER['DOCUMENT_ROOT'] . '/includes/var.php');
	
	$sql = "SELECT * FROM aaalayout WHERE DESCNAME = 'web_main'";
	$rs = $conn->Execute($sql);
	$LAYOUTJSON = '';
	$LAYOUTTYPE ='';
	if ($rs) {
		$LAYOUTJSON = $rs->fields['LAYOUTJSON'];
		$LAYOUTTYPE = $rs->fields['LAYOUTTYPE'];
		$rs->close();
	}
	if ($LAYOUTTYPE == 'CODE') {
		eval($LAYOUTJSON);
		$LAYOUTJSON = $CollectEchoString;
	}
	$LAYOUTJSON = ExecFuncInStringLAYOUT($LAYOUTJSON);
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Title of the document</title>
<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
</head>
<body>
pippo
<?php 
	echo($LAYOUTJSON); ?>
</body>
</html>