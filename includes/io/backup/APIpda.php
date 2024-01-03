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
	WFSetDebug(false);
	$debugmessage = 0;
	
	$readeddataArray = array();
	
	$qta = '';
	$code = '';
	$articolo = '';
	$posmaga = '';
	$readeddata = '';
	$datetime = '';
	$operator = '';
	$antenna = '';
	
	//MAIN
	$process = '';
	$process = isset($_POST["process"]) ? $_POST["process"] : $process;
	$process = isset($_GET["process"]) ? $_GET["process"] : $process;
	if ($process != ''){
		WFPROCESS($process);
		echo ('OK');
	}
	
	
	$readeddata = isset($_POST["readeddata"]) ? $_POST["readeddata"] : $readeddata;
	$readeddata = isset($_GET["readeddata"]) ? $_GET["readeddata"] : $readeddata;
	if ($readeddata != ''){
		$readeddataArray = explode(';',$readeddata);
		if (count($readeddataArray) == 0){
			$readeddataArray = explode(',',$readeddata);
		}
		$dataora = $readeddataArray[1];
		$codice = $readeddataArray[2];
		$qta = $readeddataArray[3];
		$articolo = WFVALUEDLOOKUP('ID','articoli',"CODICE = '" . $code . "'");
	}
	
	$operator = isset($_POST["operator"]) ? $_POST["operator"] : $operator;
	$operator = isset($_GET["operator"]) ? $_GET["operator"] : $operator;
	
	$antenna = isset($_POST["antenna"]) ? $_POST["antenna"] : $antenna;
	$antenna = isset($_GET["antenna"]) ? $_GET["antenna"] : $antenna;
	
	$datetime = isset($_POST["datetime"]) ? $_POST["datetime"] : $datetime;
	$datetime = isset($_GET["datetime"]) ? $_GET["datetime"] : $datetime;
	
	$qta = isset($_POST["qta"]) ? $_POST["qta"] : $qta;
	$qta = isset($_GET["qta"]) ? $_GET["qta"] : $qta;
	
	$code = isset($_POST["code"]) ? $_POST["code"] : $code;
	$code = isset($_GET["code"]) ? $_GET["code"] : $code;
	if ($code != ''){
		$code = str_replace("None", "", $code);
		$articolo = WFVALUEDLOOKUP('ID','articoli',"CODICE = '" . $code . "'");
	}
	
	$posmaga = isset($_POST["posmaga"]) ? $_POST["posmaga"] : $posmaga;
	$posmaga = isset($_GET["posmaga"]) ? $_GET["posmaga"] : $posmaga;
	
	
	if ($articolo != '') {
		$sqlC = "INSERT INTO appoggio(CODICE, CT_ARTICOLI, QTA, MAGAPOSIZIONE,PDTUSER,PDTANTENNA,PDTDATETIME )
				VALUES('" . $code . "', " . $articolo . ", " . $qta . ", '" . $posmaga . "','" . $operator . "','" . $antenna . "','" . $datetime ."')";
		$conn->Execute($sqlC);
		echo ('OK Find ID:' . $articolo );
	}else{
		$sqlC = "INSERT INTO appoggio(CODICE,              QTA, MAGAPOSIZIONE,PDTUSER,PDTANTENNA,PDTDATETIME)
				VALUES('" . $code . "', " . $qta . ", '" . $posmaga . "','" . $operator . "','" . $antenna . "','" . $datetime ."')";
		$conn->Execute($sqlC);
		echo ('OK Find Code:' . $code );
	}
	$conn->Close();
?>