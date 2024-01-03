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
	
	WFSendLOG("DictionaryLayout:","START");

	$CollectObjList = array();
	$RecordCountResult = 0;
	
	$filedir = '../../repositorycom';
	$filedir = isset($_POST["filedir"]) ? $_POST["filedir"] : $filedir;
	$filedir = isset($_GET["filedir"]) ? $_GET["filedir"] : $filedir;
	
	$dh  = opendir($filedir);
	$i = 0;
	while (false !== ($fileName = readdir($dh))) {
		if ($i > 100) break;
		$ext = substr($fileName, strrpos($fileName, '.') + 1);
		if(in_array($ext, array("jpg","jpeg","png","gif"))){
			$CollectObjList[] = array(	"name"=> $fileName,
								"url"=> $filedir . '/' . $fileName
								);	
			$RecordCountResult = $RecordCountResult +1;
		}
		$i = $i +1;
	}
	
	$output["data"] = $CollectObjList;
	$output["total"] = $RecordCountResult;
	$output["success"]=true;
	$output["message"]="success";
	
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	echo Array2JSON($output);
?>