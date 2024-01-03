<?php
/*
  Amzon Plugin for CodeGun, Net System Framework
  amazonPlg_version 1.0
  
  http://www.net-system.it
  based on https://github.com/rebuy-de/amazon-mws

  Copyright (c) 2021 Net System

  Released under Commercial License
*/

// load server configuration parameters
  if (file_exists('local/.config.inc.php')) { // for developers
    include('local/.config.inc.php');
  } else {
    include('.config.inc.php');
  }

  require('amazon_functions.php');
  
  foreach ($marketplaceArray as $marketplace) {
		if ($marketplace['active'] == 'true' ) $marketplaceIdArray[] = $marketplace;
  }
  /*
  TODO: gestione lingue in geqo
  include ('languages/'.$language.'.php');
  
  $languages_query = tep_db_query("select languages_id, name, code, image, directory from " . TABLE_LANGUAGES . " order by sort_order");
  while ($languages = tep_db_fetch_array($languages_query)) {
  	foreach ($marketplaceArray as $marketplace) {
		if ($marketplace['language_code'] == $languages['code'] && $marketplace['active'] == 'true' ) $marketplaceIdArray[] = $marketplace + array('language_id' => $languages['languages_id']);
  	}
  }
  */

	function arrayTabletoCodeGunStore(){
		global $output;
		//global $handle; 
		global $LogFileWithPath;
		$output["data"] = array();
		
		$FormElabora = WFVALUEFORM('amazon_error');
		//error_log(print_r($FormElabora,true)."\n", 3, $LogFileWithPath);
		$FormFiltroFeed = ($FormElabora['FILTROFEED']);
		if(!empty($FormFiltroFeed)) {
			$handle = FeedSubmissionResultCodeGun($FormElabora['FILTROFEED']);
			$xmlFeedSubmissionResult = simplexml_load_string($handle);

			if(!isset($xmlFeedSubmissionResult->Message->ProcessingReport->Result)) goto fine_amazon_error;

			$ResultLinee = $xmlFeedSubmissionResult->Message->ProcessingReport->Result;
		} else {
			$ResultLinee = [];
		}
		$i = 0;
		foreach ($ResultLinee as $ResultLinea){
			$i = $i+1;
			$AppoField = array();
			$suffix = WFVALUEGLOBAL('AMAZON_CODE_SUFFIX');
			//error_log(print_r($suffix,true)."\n", 3, $LogFileWithPath);
			$AdditionalInfo = $ResultLinea->AdditionalInfo->children();
			$AppoField["SKU"]  = $AdditionalInfo->SKU->__toString();
			//error_log(print_r($AppoField["SKU"],true)."\n", 3, $LogFileWithPath);
			//error_log(print_r(strpos($AppoField["SKU"], $suffix),true)."\n", 3, $LogFileWithPath);
			if($suffix == "" || strpos($AppoField["SKU"], $suffix) !== false) {
				$codice = str_replace($suffix, "",$AppoField["SKU"]);
				$art = WFVALUEDLOOKUP('*','articoli','CODICE = "'.$codice.'"');
				//espone solo gli articoli presenti nel db geqo
				if($art) {
					$AppoField["ID"] = $i;
					$AppoField["MSGID"] = $ResultLinea->MessageID->__toString();
					$AppoField["TIME"] = '';
					//$AppoField["TIME"] = WFSTRTODATETIME(gmdate("Y-m-d H:i:s", $ValueArray[1]/1000));
					$AppoField["CODE"] = $ResultLinea->ResultCode->__toString();
					$AppoField["MESSAGECODE"] = $ResultLinea->ResultMessageCode->__toString();
					$AppoField["DESCRIPTION"] = $ResultLinea->ResultDescription->__toString();
					$AppoField["DESCRIZIONE"] = $art['DESCRIZIONE'];
					$output["data"][] = $AppoField;
				}
			}
		}

		//field
		$output["fields"]= array();
		$output["fields"][]=array("name"=>"ID","type"=>"int");
		$output["fields"][]=array("name"=>"MSGID","type"=>"string");
		$output["fields"][]=array("name"=>"CODE","type"=>"string");
		$output["fields"][]=array("name"=>"DESCRIPTION","type"=>"string");
		$output["fields"][]=array("name"=>"DESCRIZIONE","type"=>"string");

		//column 
		$output["columns"]= array();
		/*
		$output["columns"][]=array("dataIndex"=>"ID",
								   "header"=>"ID", 
								   "text"=>"ID" , 
								   "format"=>"" ,
								   "hidden"=>false,
								   "flex"=>1,
								   "editor"=>array(), 
								   "filter"=>array('type'=>'numeric')
								  );
		*/
		$output["columns"][]=array("dataIndex"=>"SKU",
								   "header"=>"SKU", 
								   "text"=>"SKU" , 
								   "format"=>"" ,
								   "hidden"=>false,
								   //"flex"=>1,
								   "editor"=>array(), 
								   "filter"=>array('type'=>'string'),
								   "width"=>110
								  );
		$output["columns"][]=array("dataIndex"=>"MSGID",
								   "header"=>"MSGID", 
								   "text"=>"MSGID" , 
								   "format"=>"" ,
								   "hidden"=>false,
								   "flex"=>1,
								   "editor"=>array(), 
								   "filter"=>array('type'=>'string'),
								   "maxWidth"=>50
								  );
		/*
		$output["columns"][]=array("dataIndex"=>"TIME",
								   "header"=>"TIME", 
								   "text"=>"TIME" , 
								   "format"=>"" ,
								   "hidden"=>false,
								   "flex"=>1,
								   "editor"=>array(), 
								   "filter"=>array('type'=>'date')
								  );
		*/
		$output["columns"][]=array("dataIndex"=>"CODE",
								   "header"=>"CODE", 
								   "text"=>"CODE" , 
								   "format"=>"" ,
								   "hidden"=>false,
								   "flex"=>1,
								   "editor"=>array(), 
								   "filter"=>array('type'=>'string'),
								   "maxWidth"=>50
								  );
		$output["columns"][]=array("dataIndex"=>"MESSAGECODE",
								   "header"=>"MESSAGECODE", 
								   "text"=>"MESSAGECODE" , 
								   "format"=>"" ,
								   "hidden"=>false,
								   "flex"=>1,
								   "editor"=>array(), 
								   "filter"=>array('type'=>'numeric'),
								   "maxWidth"=>50
								  );
		$output["columns"][]=array("dataIndex"=>"DESCRIPTION",
								   "header"=>"DESCRIPTION", 
								   "text"=>"DESCRIPTION" , 
								   "format"=>"" ,
								   "hidden"=>false,
								   "flex"=>1,
								   "editor"=>array(), 
								   "filter"=>array('type'=>'string')
								  );
		$output["columns"][]=array("dataIndex"=>"DESCRIZIONE",
								   "header"=>"DESCRIZIONE", 
								   "text"=>"DESCRIZIONE" , 
								   "format"=>"" ,
								   "hidden"=>false,
								   "flex"=>1,
								   "editor"=>array(), 
								   "filter"=>array('type'=>'string')
								  );
		fine_amazon_error:
	}

	function arraytoCodeGunStore(){
		global $output;
		$arrayResult = amazonGetFeedSubmissionList();
		$RecordCountResult = 0;
		foreach ($arrayResult as $result) {
			//'FeedSubmissionId'
			//'FeedType'
			//'SubmittedDate'
			//'FeedProcessingStatus'
			//'StartedProcessingDate'
			//'CompletedProcessingDate'
		  
			$CollectObjList[]= array(	"ID"=> $result['FeedSubmissionId'],
										"DESCNAME"=> $result['FeedType'].' '.$result['CompletedProcessingDate']
										);	
			$RecordCountResult = $RecordCountResult+1;
		}
		$output["data"] = $CollectObjList;

		$output["total"] = $RecordCountResult;
		$output["success"]=true;
		$output["message"]="success";

		$output["fields"][]=array("name"=>"ID","type"=>"string");
		$output["fields"][]=array("name"=>"DESCNAME","type"=>"string");

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
		$output["columns"][]=array("dataIndex"=>"DESCNAME",
								   "header"=>"DESCNAME",  
								   "text"=>"DESCNAME"  , 
								   "format"=>"" ,
								   "hidden"=>false,
								   "flex"=>1,
								   "width"=>10, 
								   "editor"=>array(), 
								   "filter"=>array('type'=>'string')
								  );
								
		
	}