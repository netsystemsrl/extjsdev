<?php	
	require_once('../var.php');
	//WFSetDebug(true);
	$debugmessage = 0;
	
	$code = '';
	$code = isset($_POST["code"]) ? $_POST["code"] : $code;
	$code = isset($_GET["code"])  ? $_GET["code"]  : $code;
	
	$type = 'JSON';
	$type = isset($_POST["type"]) ? $_POST["type"] : $type;
	$type = isset($_GET["type"])  ? $_GET["type"]  : $type;
	
	if ($type == 'JSON') echo JsonPrettyPrint($code);
	if ($type == 'SQL') echo SQLPrettyPrint($code);
	if ($type == 'PHP') echo PHPPrettyPrint($code);
	if ($type == 'XML') echo XMLPrettyPrint($code);
?>