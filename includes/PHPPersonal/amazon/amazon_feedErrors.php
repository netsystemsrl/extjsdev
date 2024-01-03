<?php
/*
  Amzon Plugin for CodeGun, a Net System's Framework
  amazonPlg_version 1.0
  
  http://www.net-system.it

  Copyright (c) 2021 Net System

  Released under Commercial License
*/

//$output['message'] .= "sono in feedErrors.php \n";

/*
do=correctAll
do=correctASIN8541
do=correctASIN8542
do=correctManu
do=correctBrands
*/
$do = (isset($HTTP_GET_VARS['do']) ? $HTTP_GET_VARS['do'] : '');

//inizia FeedSubmissionList

$parameters = array (
  'Merchant' => MERCHANT_ID,
  'FeedProcessingStatusList' => array ('Status' => array ('_DONE_')),
);

//error_log(print_r($parameters,true)."\n", 3, $LogFileWithPath);

$request = new MarketplaceWebService_Model_GetFeedSubmissionListRequest($parameters);

//error_log(print_r($service,true)."\n", 3, $LogFileWithPath);
//error_log(print_r($request,true)."\n", 3, $LogFileWithPath);

$amazon_feedSubList = invokeGetFeedSubmissionList($service, $request);

//error_log(print_r($amazon_feedSubList,true)."\n", 3, $LogFileWithPath);

$productsFeedList = array();

foreach ( $amazon_feedSubList as $submittedFeed ) {
	if ($submittedFeed['FeedType'] == '_POST_PRODUCT_DATA_') {
		$productsFeedList[$submittedFeed['FeedSubmissionId']] = $submittedFeed['CompletedProcessingDate'];
	}
}

//var_dump($productsFeedList);
//error_log(print_r($productsFeedList,true)."\n", 3, $LogFileWithPath);

//trova la chiave(FeedSubmissionId) con data più recente
if(!empty($productsFeedList)){
	$FeedSubmissionId_Last = array_keys(array_intersect($productsFeedList, array(max($productsFeedList))));

	/*
	echo '<pre>';
	echo 'productsFeedList di tipo _POST_PRODUCT_DATA_<br>';
	print_r ($productsFeedList); 
	echo '</pre>';

	echo '<pre>';
	echo '$id più recente di tipo _POST_PRODUCT_DATA_<br>';
	print_r ($FeedSubmissionId_Last[0]); 
	echo '</pre>';
	*/
	//$output['message'] .= print_r($FeedSubmissionId_Last[0], true);
	//error_log(print_r($productsFeedList,true)."\n", 3, $LogFileWithPath);
	
	foreach (array_keys($productsFeedList) as $FeedSubmissionId) {
		//error_log(print_r($FeedSubmissionId,true)."\n", 3, $LogFileWithPath);
		//FeedSubmissionResult($FeedSubmissionId, $do);
		$handle = FeedSubmissionResultCodeGun($FeedSubmissionId, $do);
		//error_log(print_r($FeedSubmissionId,true)."\n", 3, $LogFileWithPath);
		amazon_correctErrors($handle);
	}
} else {
	//echo 'Nessun feed di tipo _POST_PRODUCT_DATA_ trovato ';
	$output['message'] = 'Nessun feed di tipo _POST_PRODUCT_DATA_ trovato ';
}
