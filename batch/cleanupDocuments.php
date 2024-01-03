<?php	
	include('../includes/var.php');	
	//WFSetDebug(true);
	$debugmessage = 0;
	$output = array();
	$CollectObjList = array();
	$result = array(); 
	
	ini_set('memory_limit', '-1'); set_time_limit(0); 
	ini_set("zlib.output_compression", 0);  // off
	ini_set("implicit_flush", 1);  // on 
	// ini_set("output_buffering", 0);  // off 
	
	echo('CLEAN UP DOCUMENTS'. BRCRLF);
	
	chdir($ExtJSDevDOC);
	$dirIN = glob($ExtJSDevDOC . '*.*', GLOB_BRACE);
	$i = 0;
	foreach ($dirIN as $key => $FileINName){
		$infoName = pathinfo($FileINName);
	
		$sql = "SELECT * FROM " . $ExtJSDevDB . "documents WHERE FILENAME = '" . $infoName['basename'] . "'";
		$RsDocuments = $conn->Execute($sql);
		if ($RsDocuments->RecordCount() == 0){
			echo('Erase:'. $FileINName . BRCRLF);
			unlink($ExtJSDevDOC . $FileINName);
			ob_flush();
			flush();
		}else{
			$i++;
			$RsDocuments->close();
		}
	}
	echo('File Linked:'. $i . BRCRLF);
?>