<?php
	require_once('../Generic.php');
	$id = null;
	$CollectObjList = array();
	$datasource = "../dbconnection/";
	$RecordCountResult = 0;
	
	if(is_dir($datasource)){
		if($dh = opendir($datasource)){
			$files = scandir($datasource);
			asort($files);
			foreach ($files as $file) {
				if ($file != '.' && $file != '..') {
				$CollectObjList[]= array(	"ID"=> htmlentities(pathinfo($file, PATHINFO_FILENAME)),
									"DESCRIZIONE"=> htmlentities(pathinfo($file, PATHINFO_FILENAME))
									);	
				$RecordCountResult = $RecordCountResult+1;
				}
			}
		}
	}
	$output["data"] = $CollectObjList;

	$output["total"] = $RecordCountResult;
	$output["success"]=true;
	$output["message"]="success";

	$output["fields"][]=array("name"=>"ID","type"=>"string");
	$output["fields"][]=array("name"=>"DESCRIZIONE","type"=>"string");

	$output["columns"][]=array("dataIndex"=>"ID",
							   "header"=>"ID",
							   "text"=>"ID" , 
							   "format"=>"" ,
							   "hidden"=>false,
							   "flex"=>1,
							   "width"=>20, 
							   "editor"=>array(), 
							   "filter"=>array('type'=>'string')
							  );
	$output["columns"][]=array("dataIndex"=>"DESCRIZIONE",
							   "header"=>"DESCRIZIONE",  
							   "text"=>"DESCRIZIONE"  , 
							   "format"=>"" ,
							   "hidden"=>false,
							   "flex"=>1,
							   "width"=>10, 
							   "editor"=>array(), 
							   "filter"=>array('type'=>'string')
							  );
							  
	if (! isset($objname)) 	{
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo Array2JSON($output);
	}
?>