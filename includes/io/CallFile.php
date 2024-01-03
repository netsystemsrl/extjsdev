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
	/*
	if ($UserId == 0) {
		$output["failure"]=true;
		$output["success"]=false;
		$Appo = Array2JSON($output,$debugmessage);
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo $Appo;
		die();
	}
	*/
	WFSetDebug(false);
	$debugmessage = 0;
	session_write_close();
	
	WFSendLOG("CallFile:","START");
	
	$downloadable = 'false';
	$downloadable = isset($_POST["downloadable"]) ? $_POST["downloadable"] : $downloadable;
	$downloadable = isset($_GET["downloadable"]) ? $_GET["downloadable"] : $downloadable;
	if ($downloadable == 'false') $downloadable = false;
	if ($downloadable == 'true') $downloadable = true;
	
	if ($conn->debug==1){
		if (isset($_GET['fileid']))  $FileId = $_GET['fileid'] ;
		if (isset($_POST['fileid'])) $FileId = $_POST['fileid'] ;
		echo(BRCRLF . 'DEFINIZIONI'. BRCRLF);
		var_dump( $FileId);
		if ($FileId != ''){
			$FileAppo = WFVALUESESSIONPRIV($FileId);
			if ($FileAppo !='') $FileId = $FileAppo;
		}
		var_dump( $FileId);
	}
	
	if ($FileId == '') {
		echo("<B>FILE SESSION VUOTA</B><BR>\n");
		die();
	}else{
		$file_path = WFFileAbsolute($FileId);
	}
	
	if (file_exists($file_path)){
		$filename = basename($file_path);
		//FILE READ DISPLAY
		if ($conn->debug==1){
			echo(BRCRLF . 'DEFINIZIONI'. BRCRLF);
			echo('fileid:' . $FileId . BRCRLF);
			echo('file_path:' . $file_path . BRCRLF);
			echo('filename:' . $filename . BRCRLF);
			echo('Content-Type:' . safe_mime_content_type($filename). BRCRLF);
			echo('Content-Disposition:' . safe_content_disposition($filename,$downloadable). BRCRLF);
		}else{
			
			//HEADER
			header('Content-Description: File Transfer');
			//header('Content-Type: application/octet-stream');
			//header('Content-Type: application/xml');
			header('Content-Type:' . safe_mime_content_type($filename));
			header('Content-Disposition: attachment; filename="'.$filename.'"');
			//header('Content-Disposition:' . safe_content_disposition($filename,$downloadable));
			header('Expires: 0');
			header('Cache-Control: must-revalidate');
			header('Pragma: public');
			header('Content-Length: ' . filesize($file_path));
 
			//header('Content-Description: File Transfer');
			//header('Content-Type:' . safe_mime_content_type($filename));
			//header('Content-Disposition:' . safe_content_disposition($filename,$downloadable));
			//header('Expires: 0');
			//header('Cache-Control: must-revalidate');
			//header('Pragma: public');
			//header('Content-Length: ' . filesize($file_path));
			readfile($file_path);
			exit;
		}
	}else{
		echo("<B>FILE " . $file_path ."NON PRESENTE</B><BR>\n");
		die();
	}
?>