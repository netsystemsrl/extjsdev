<?php
	$strurl = '';
	
	foreach($_POST as $key => $value){	
		$strurl = $strurl . "&" . $key . '=' . $value;
	}
	foreach($_GET as $key => $value){
		$strurl = $strurl . "&" . $key . '=' . $value;
	}

	header("Location: ../index.php?" . $strurl); 
	exit;
?>