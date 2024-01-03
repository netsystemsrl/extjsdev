<?php
/*
  Amzon Plugin for CodeGun, Net System Framework
  amazonPlg_version 1.0
  
  http://www.net-system.it
  based on https://github.com/rebuy-de/amazon-mws

  Copyright (c) 2021 Net System

  Released under Commercial License
*/

define("DATE_FORMAT", "Y-m-d\TH:i:s\Z");

function amazon_local_get_quantity($products_id) {
	$product_info_query = tep_db_query("select products_quantity from products where products_id = '" . (int)$products_id . "'");
	$product_info = tep_db_fetch_array($product_info_query);
	return $product_info['products_quantity'];
}
function amazon_local_get_pricetotwithattributes($completeproducts_id) {
	global $languages_id;
	$products_price = amazon_local_get_price((int)$completeproducts_id);
	$products_attrprice = 0;
	if($completeproducts_id != "") {
		foreach(explode("{", substr($completeproducts_id, 1, strlen($completeproducts_id)-1)) as $key => $value) {
			$value2 = explode("}", $value);
			if($value2[0] != "" && $value2[1] != "")
				$HTTP_POST_VARS['id'][$value2[0]] = $value2[1];
		}
	}
	$products_attributes_query = tep_db_query("select count(*) as total from " . TABLE_PRODUCTS_OPTIONS . " popt, " . TABLE_PRODUCTS_ATTRIBUTES . " patrib where patrib.products_id='" . (int)$completeproducts_id . "' and patrib.options_id = popt.products_options_id and popt.language_id = '" . (int)$languages_id . "'");
	$products_attributes = tep_db_fetch_array($products_attributes_query);
	if ($products_attributes['total'] > 0) {
		$products_options_name_query = tep_db_query("select distinct popt.products_options_id, popt.products_options_name from " . TABLE_PRODUCTS_OPTIONS . " popt, " . TABLE_PRODUCTS_ATTRIBUTES . " patrib where patrib.products_id='" . (int)$completeproducts_id . "' and patrib.options_id = popt.products_options_id and popt.language_id = '" . (int)$languages_id . "' order by popt.products_options_name");
		while ($products_options_name = tep_db_fetch_array($products_options_name_query)) {
			$products_options_array = array();
			$products_options_query = tep_db_query("select pov.products_options_values_id, pov.products_options_values_name, pa.options_values_price, pa.price_prefix from " . TABLE_PRODUCTS_ATTRIBUTES . " pa, " . TABLE_PRODUCTS_OPTIONS_VALUES . " pov where pa.products_id = '" . (int)$completeproducts_id . "' and pa.options_id = '" . (int)$products_options_name['products_options_id'] . "' and pa.options_values_id = pov.products_options_values_id and pov.language_id = '" . (int)$languages_id . "'");
			while ($products_options = tep_db_fetch_array($products_options_query)) {
				$products_options_array[] = array('id' => $products_options['products_options_values_id'], 'text' => $products_options['products_options_values_name'], 'name' => $products_options['products_options_values_name'], 'price' => $products_options['price_prefix'].$products_options['options_values_price']);
				if ($products_options['options_values_price'] != '0') {
					$products_options_array[sizeof($products_options_array)-1]['text'] .= ' (' . $products_options['price_prefix'] . amazon_local_format_price($products_options['options_values_price'], tep_get_tax_rate($product_info['products_tax_class_id'])) .') ';
				}
			}
			$selected_attribute = $HTTP_POST_VARS['id'][$products_options_name['products_options_id']];
			for ($i=0, $n=sizeof($products_options_array); $i<$n; $i++) {
				if($products_options_array[$i]['id'] == $selected_attribute) {

					$products_attrprice += $products_options_array[$i]['price'];
				}
			}
		}
	}
	$product_info_query = tep_db_query("select products_tax_class_id from " . TABLE_PRODUCTS . " where products_id = '" . (int)$completeproducts_id . "'");
	$product_info = tep_db_fetch_array($product_info_query);
	$products_tax = tep_get_tax_rate($product_info['products_tax_class_id']);
	$products_pricetot = $products_price + $products_attrprice;
	return amazon_local_format_price($products_pricetot, $products_tax);
}

function amazon_local_get_price($products_id) {
	$product_info_query = tep_db_query("select products_price from " . TABLE_PRODUCTS . " where products_id = '" . (int)$products_id . "'");
	$product_info = tep_db_fetch_array($product_info_query);
	return $product_info['products_price'];
}

function amazon_local_format_price($products_price, $products_tax) {
	return tep_round(tep_round($products_price, 2) + tep_round($products_price * $products_tax / 100, 2), 2);
}

function startSubmitFeed ($xmlStr, $feedType, $marketplaceIdArray = NULL) {
	global $service;
	
	/*
	echo ('<pre>');
	var_dump ($marketplaceIdArray);
	echo ('</pre>');
	*/
	
	$feedHandle = @fopen('php://temp', 'rw+');
	//stream_encoding($feedHandle, 'iso-8859-1');
	fwrite($feedHandle, $xmlStr);	
	rewind($feedHandle);	
	$parameters = array (	  
			'Merchant' => MERCHANT_ID,	  
			'MarketplaceIdList' => $marketplaceIdArray,	  
			'FeedType' => $feedType,	  
			'FeedContent' => $feedHandle,	  
			'PurgeAndReplace' => false,	  
			'ContentMd5' => base64_encode(md5(stream_get_contents($feedHandle), true)),	);	
	rewind($feedHandle);
	//var_dump($parameters);
	$request = new MarketplaceWebService_Model_SubmitFeedRequest($parameters);

	/********* Begin Comment Block *********/
	//$feedHandle = @fopen('php://memory', 'rw+');
	//fwrite($feedHandle, $feed);
	//rewind($feedHandle);
	
	//$request = new MarketplaceWebService_Model_SubmitFeedRequest();
	//$request->setMerchant(MERCHANT_ID);
	//$request->setMarketplaceIdList($marketplaceIdArray);
	//$request->setFeedType('_POST_PRODUCT_DATA_');
	//$request->setContentMd5(base64_encode(md5(stream_get_contents($feedHandle), true)));
	//rewind($feedHandle);
	//$request->setPurgeAndReplace(false);
	//$request->setFeedContent($feedHandle);
	
	//rewind($feedHandle);
	/********* End Comment Block *********/
	
	invokeAjaxSubmitFeed($service, $request);	
	@fclose($feedHandle);
}

function invokeSubmitFeed(MarketplaceWebService_Interface $service, $request)   
{
	      try {
	     	$response = $service->submitFeed($request);
			echo ('<pre>');
		    echo ("Service Response" . BRCRLF);
		    echo ("=============================================================================" . BRCRLF);
		    
		    echo("        SubmitFeedResponse" . BRCRLF);
		    if ($response->isSetSubmitFeedResult()) {
		    	echo("            SubmitFeedResult" . BRCRLF);
		    	$submitFeedResult = $response->getSubmitFeedResult();
		    	if ($submitFeedResult->isSetFeedSubmissionInfo()) {
		    		echo("                FeedSubmissionInfo" . BRCRLF);
		    		$feedSubmissionInfo = $submitFeedResult->getFeedSubmissionInfo();
		    		if ($feedSubmissionInfo->isSetFeedSubmissionId())
		    		{
		    			echo("                    FeedSubmissionId" . BRCRLF);

		    			echo("                        " . $feedSubmissionInfo->getFeedSubmissionId() . "" . BRCRLF);
		    		}
		    		if ($feedSubmissionInfo->isSetFeedType())
		    		{
		    			echo("                    FeedType" . BRCRLF);
						echo("                        " . $feedSubmissionInfo->getFeedType() . "" . BRCRLF);
		    		}
		    		if ($feedSubmissionInfo->isSetSubmittedDate())
		    		{
		    			echo("                    SubmittedDate" . BRCRLF);
		    			echo("                        " . $feedSubmissionInfo->getSubmittedDate()->format(DATE_FORMAT) . "" . BRCRLF);
		    		}
		    		if ($feedSubmissionInfo->isSetFeedProcessingStatus())
		    		{
		    			echo("                    FeedProcessingStatus" . BRCRLF);
		    			echo("                        " . $feedSubmissionInfo->getFeedProcessingStatus() . "" . BRCRLF);
		    		}
		    		if ($feedSubmissionInfo->isSetStartedProcessingDate())
		    		{
		    			echo("                    StartedProcessingDate" . BRCRLF);
		    			echo("                        " . $feedSubmissionInfo->getStartedProcessingDate()->format(DATE_FORMAT) . "" . BRCRLF);
		    		}
		    		if ($feedSubmissionInfo->isSetCompletedProcessingDate())
		    		{
		    			echo("                    CompletedProcessingDate" . BRCRLF);
		    			echo("                        " . $feedSubmissionInfo->getCompletedProcessingDate()->format(DATE_FORMAT) . "" . BRCRLF);
		    		}
		    	}
		     }
		     if ($response->isSetResponseMetadata()) {
		     	echo("            ResponseMetadata" . BRCRLF);
		     	$responseMetadata = $response->getResponseMetadata();
		     	if ($responseMetadata->isSetRequestId())
		     	{
		     		echo("                RequestId" . BRCRLF);
		     		echo("                    " . $responseMetadata->getRequestId() . "" . BRCRLF);
		     	}
		     }
		     
		     echo("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "" . BRCRLF);
		     echo ('</pre>');
	      } catch (MarketplaceWebService_Exception $ex) {
	      	echo ('<pre>');
	      	echo("Caught Exception: " . $ex->getMessage() . "" . BRCRLF);
	      	echo("Response Status Code: " . $ex->getStatusCode() . "" . BRCRLF);
	      	echo("Error Code: " . $ex->getErrorCode() . "" . BRCRLF);
	      	echo("Error Type: " . $ex->getErrorType() . "" . BRCRLF);
	      	echo("Request ID: " . $ex->getRequestId() . "" . BRCRLF);
	      	echo("XML: " . $ex->getXML() . "" . BRCRLF);
	      	echo("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "" . BRCRLF);
	      	echo ('</pre>');
	      }
}

function invokeAjaxSubmitFeed(MarketplaceWebService_Interface $service, $request) {
	global $output;
	try {
		$response = $service->submitFeed($request);
		    $output['message'] = $output['message']."Service Response" . BRCRLF;
		    $output['message'] = $output['message']."=============================================================================" . BRCRLF;
		    
		    $output['message'] = $output['message']."        SubmitFeedResponse" . BRCRLF;
		    if ($response->isSetSubmitFeedResult()) {
		    	$output['message'] = $output['message']."            SubmitFeedResult" . BRCRLF;
		    	$submitFeedResult = $response->getSubmitFeedResult();
		    	if ($submitFeedResult->isSetFeedSubmissionInfo()) {
		    		$output['message'] = $output['message']."                FeedSubmissionInfo" . BRCRLF;
		    		$feedSubmissionInfo = $submitFeedResult->getFeedSubmissionInfo();
		    		if ($feedSubmissionInfo->isSetFeedSubmissionId())
		    		{
		    			$output['message'] = $output['message']."                    FeedSubmissionId" . BRCRLF;

		    			$output['message'] = $output['message']."                        " . $feedSubmissionInfo->getFeedSubmissionId() . "" . BRCRLF;
		    		}
		    		if ($feedSubmissionInfo->isSetFeedType())
		    		{
		    			$output['message'] = $output['message']."                    FeedType" . BRCRLF;
						$output['message'] = $output['message']."                        " . $feedSubmissionInfo->getFeedType() . "" . BRCRLF;
		    		}
		    		if ($feedSubmissionInfo->isSetSubmittedDate())
		    		{
		    			$output['message'] = $output['message']."                    SubmittedDate" . BRCRLF;
		    			$output['message'] = $output['message']."                        " . $feedSubmissionInfo->getSubmittedDate()->format(DATE_FORMAT) . "" . BRCRLF;
		    		}
		    		if ($feedSubmissionInfo->isSetFeedProcessingStatus())
		    		{
		    			$output['message'] = $output['message']."                    FeedProcessingStatus" . BRCRLF;
		    			$output['message'] = $output['message']."                        " . $feedSubmissionInfo->getFeedProcessingStatus() . "" . BRCRLF;
		    		}
		    		if ($feedSubmissionInfo->isSetStartedProcessingDate())
		    		{
		    			$output['message'] = $output['message']."                    StartedProcessingDate" . BRCRLF;
		    			$output['message'] = $output['message']."                        " . $feedSubmissionInfo->getStartedProcessingDate()->format(DATE_FORMAT) . "" . BRCRLF;
		    		}
		    		if ($feedSubmissionInfo->isSetCompletedProcessingDate())
		    		{
		    			$output['message'] = $output['message']."                    CompletedProcessingDate" . BRCRLF;
		    			$output['message'] = $output['message']."                        " . $feedSubmissionInfo->getCompletedProcessingDate()->format(DATE_FORMAT) . "" . BRCRLF;
		    		}
		    	}
		     }
		     if ($response->isSetResponseMetadata()) {
		     	$output['message'] = $output['message']."            ResponseMetadata" . BRCRLF;
		     	$responseMetadata = $response->getResponseMetadata();
		     	if ($responseMetadata->isSetRequestId())
		     	{
		     		$output['message'] = $output['message']."                RequestId" . BRCRLF;
		     		$output['message'] = $output['message']."                    " . $responseMetadata->getRequestId() . "" . BRCRLF;
		     	}
		     }
		     
		     $output['message'] = $output['message']."            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "" . BRCRLF;
	} catch (MarketplaceWebService_Exception $ex) {
		$output['message'] = $output['message']."Caught Exception: " . $ex->getMessage() . "" . BRCRLF;
		$output['message'] = $output['message']."Response Status Code: " . $ex->getStatusCode() . "" . BRCRLF;
		$output['message'] = $output['message']."Error Code: " . $ex->getErrorCode() . "" . BRCRLF;
		$output['message'] = $output['message']."Error Type: " . $ex->getErrorType() . "" . BRCRLF;
		$output['message'] = $output['message']."Request ID: " . $ex->getRequestId() . "" . BRCRLF;
		$output['message'] = $output['message']."XML: " . $ex->getXML() . "" . BRCRLF;
		$output['message'] = $output['message']."ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "" . BRCRLF;
	}
}
function amazon_investigate_categories(){
	$facts_array = array();
	$shopCatToCat_query = tep_db_query(" SELECT categories_id, categories_name FROM amazon_cattoshopcat ac RIGHT JOIN " . TABLE_CATEGORIES . " c ON shop_cat_id = categories_id WHERE shop_cat_id IS NULL AND c.parent_id <>0;");
	
	if (tep_db_num_rows($shopCatToCat_query)) {
		while ($shopCatToCat = tep_db_fetch_array($shopCatToCat_query)) {
			$facts_array[]= $shopCatToCat[categories_name];
		}
	}
	
	return $facts_array;
}

function invokeGetFeedSubmissionList(MarketplaceWebService_Interface $service, $request) {
	global $LogFileWithPath;
	global $output;

	try {
		$response = $service->getFeedSubmissionList($request);
		
		//error_log(print_r($response,true)."\n", 3, $LogFileWithPath);
		
		if ($response->isSetGetFeedSubmissionListResult()) { 
			$getFeedSubmissionListResult = $response->getGetFeedSubmissionListResult();
			//error_log(print_r($getFeedSubmissionListResult,true)."\n", 3, $LogFileWithPath);
			$amazon_SubmissionList = array();
			if ($getFeedSubmissionListResult->isSetNextToken()) {
				$amazon_SubmissionList['NextToken'] = $getFeedSubmissionListResult->getNextToken();
            }
            if ($getFeedSubmissionListResult->isSetHasNext()) {
				$amazon_SubmissionList['HasNext'] = $getFeedSubmissionListResult->getHasNext();
            }
			$feedSubmissionInfoList = $getFeedSubmissionListResult->getFeedSubmissionInfoList();
			foreach ($feedSubmissionInfoList as $feedSubmissionInfo) {
				$amazon_SubmissionList[] = array(
					'FeedSubmissionId' => $feedSubmissionInfo->getFeedSubmissionId(), 
					'FeedType' => $feedSubmissionInfo->getFeedType(), 
					'SubmittedDate' => $feedSubmissionInfo->getSubmittedDate()->format(DATE_FORMAT_AMAZON), 
					'FeedProcessingStatus' => $feedSubmissionInfo->getFeedProcessingStatus(), 
					'StartedProcessingDate' => $feedSubmissionInfo->getStartedProcessingDate()->format(DATE_FORMAT_AMAZON), 
					'CompletedProcessingDate' => $feedSubmissionInfo->getCompletedProcessingDate()->format('Y-m-d\TH:i:s\Z') 
				);
			}
		} 

		return $amazon_SubmissionList;
		
	} catch (MarketplaceWebService_Exception $ex) {
		$msg = "Caught Exception: " . $ex->getMessage() . "\n
			Response Status Code: " . $ex->getStatusCode() . "\n
			Error Code: " . $ex->getErrorCode() . "\n
			Error Type: " . $ex->getErrorType() . "\n
			Request ID: " . $ex->getRequestId() . "\n
			XML: " . $ex->getXML() . "\n
			ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n";
		$output['message'] = $msg;
		//error_log(print_r($ex,true)."\n", 3, $LogFileWithPath);
		error_log(print_r($msg,true)."\n", 3, $LogFileWithPath);
		/*
		echo("Caught Exception: " . $ex->getMessage() . "\n");
		echo("Response Status Code: " . $ex->getStatusCode() . "\n");
		echo("Error Code: " . $ex->getErrorCode() . "\n");
		echo("Error Type: " . $ex->getErrorType() . "\n");
		echo("Request ID: " . $ex->getRequestId() . "\n");
		echo("XML: " . $ex->getXML() . "\n");
		echo("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
		*/
	}
 }


function invokeGetFeedSubmissionListByNextToken(MarketplaceWebService_Interface $service, $request) {
	global $LogFileWithPath;
	global $output;

	try {
		$response = $service->getFeedSubmissionListByNextToken($request);
		
		//error_log(print_r($response,true)."\n", 3, $LogFileWithPath);
		
		if ($response->isSetGetFeedSubmissionListByNextTokenResult()) { 
			$getFeedSubmissionListByNextTokenResult  = $response->getGetFeedSubmissionListByNextTokenResult();
			//error_log(print_r($getFeedSubmissionListByNextTokenResult,true)."\n", 3, $LogFileWithPath);
			$amazon_SubmissionListByNextToken = array();
			if ($getFeedSubmissionListByNextTokenResult->isSetNextToken()) {
				$amazon_SubmissionListByNextToken['NextToken'] = $getFeedSubmissionListByNextTokenResult->getNextToken();
            }
            if ($getFeedSubmissionListByNextTokenResult ->isSetHasNext()) {
				$amazon_SubmissionListByNextToken['HasNext'] = $getFeedSubmissionListByNextTokenResult->getNextToken();
            }
			$feedSubmissionInfoListByNextToken = $getFeedSubmissionListByNextTokenResult ->getFeedSubmissionInfoList();
			foreach ($feedSubmissionInfoListByNextToken as $feedSubmissionInfo) {
				$amazon_SubmissionListByNextToken[] = array(
					'FeedSubmissionId' => $feedSubmissionInfo->getFeedSubmissionId(), 
					'FeedType' => $feedSubmissionInfo->getFeedType(), 
					'SubmittedDate' => $feedSubmissionInfo->getSubmittedDate()->format(DATE_FORMAT_AMAZON), 
					'FeedProcessingStatus' => $feedSubmissionInfo->getFeedProcessingStatus(), 
					'StartedProcessingDate' => $feedSubmissionInfo->getStartedProcessingDate()->format(DATE_FORMAT_AMAZON), 
					'CompletedProcessingDate' => $feedSubmissionInfo->getCompletedProcessingDate()->format('Y-m-d\TH:i:s\Z') 
				);
			}
		} 

		return $amazon_SubmissionListByNextToken;
		
	} catch (MarketplaceWebService_Exception $ex) {
		$msg = "Caught Exception: " . $ex->getMessage() . "\n
			Response Status Code: " . $ex->getStatusCode() . "\n
			Error Code: " . $ex->getErrorCode() . "\n
			Error Type: " . $ex->getErrorType() . "\n
			Request ID: " . $ex->getRequestId() . "\n
			XML: " . $ex->getXML() . "\n
			ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n";
		$output['message'] = $msg;
		//error_log(print_r($ex,true)."\n", 3, $LogFileWithPath);
		error_log(print_r($msg,true)."\n", 3, $LogFileWithPath);
		/*
		echo("Caught Exception: " . $ex->getMessage() . "\n");
		echo("Response Status Code: " . $ex->getStatusCode() . "\n");
		echo("Error Code: " . $ex->getErrorCode() . "\n");
		echo("Error Type: " . $ex->getErrorType() . "\n");
		echo("Request ID: " . $ex->getRequestId() . "\n");
		echo("XML: " . $ex->getXML() . "\n");
		echo("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
		*/
	}
 }

 function invokeGetFeedSubmissionResult(MarketplaceWebService_Interface $service, $request) {
	try {
		$response = $service->getFeedSubmissionResult($request);

		$feedSubmissionResult = stream_get_contents($request->getFeedSubmissionResult());
		return $feedSubmissionResult;
	} catch (MarketplaceWebService_Exception $ex) {
		echo("Caught Exception: " . $ex->getMessage() . "\n");
		echo("Response Status Code: " . $ex->getStatusCode() . "\n");
		echo("Error Code: " . $ex->getErrorCode() . "\n");
		echo("Error Type: " . $ex->getErrorType() . "\n");
		echo("Request ID: " . $ex->getRequestId() . "\n");
		echo("XML: " . $ex->getXML() . "\n");
		echo("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
	}
}

function amazonGetFeedSubmissionList($onlyLastFeedProductsData = false){
	global $service, $LogFileWithPath;
	
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
	
	$nextToken = false;
	if($amazon_feedSubList['HasNext'] == 'true') {
		$nextToken = $amazon_feedSubList['NextToken'];
	}
	unset($amazon_feedSubList['HasNext']);
	unset($amazon_feedSubList['NextToken']);
	
	//elimina i feeds che non sono di sindro dati
	$permittedFeedTypes = ['_POST_PRODUCT_DATA_', '_POST_PRODUCT_PRICING_DATA_', '_POST_PRODUCT_IMAGE_DATA_', '_POST_INVENTORY_AVAILABILITY_DATA_'];
	$found = false;
	foreach ( $amazon_feedSubList as $key => $submittedFeed ) {
		//error_log(print_r($submittedFeed,true)."\n", 3, $LogFileWithPath);
		if ($submittedFeed['FeedType'] == '_POST_PRODUCT_DATA_'){
			$found = true;
			$productsFeedList[$submittedFeed['FeedSubmissionId']] = $submittedFeed['CompletedProcessingDate'];
		}
		if (!in_array($submittedFeed['FeedType'], $permittedFeedTypes)) {
			unset($amazon_feedSubList[$key]);
		}
	}
	
	//if(!$found && $nextToken) {
	if($nextToken) {
		$parameters['NextToken'] = $nextToken;
		$requestNextToken = new MarketplaceWebService_Model_GetFeedSubmissionListByNextTokenRequest($parameters);
		$amazon_feedSubListByNextToken = invokeGetFeedSubmissionListByNextToken($service, $requestNextToken);
		foreach ($amazon_feedSubListByNextToken as $key => $submittedFeed ) {
			//if ($submittedFeed['FeedType'] == '_POST_PRODUCT_DATA_') $found = true;
			if ($submittedFeed['FeedType'] == '_POST_PRODUCT_DATA_'){
				$found = true;
				$productsFeedList[$submittedFeed['FeedSubmissionId']] = $submittedFeed['CompletedProcessingDate'];
			}
			if (in_array($submittedFeed['FeedType'], $permittedFeedTypes)) {
				$amazon_feedSubList[] = $submittedFeed;
			}
		}
	}

	if($onlyLastFeedProductsData){
		//error_log(print_r($productsFeedList,true)."\n", 3, $LogFileWithPath);
		$FeedSubmissionId_Last = array_keys(array_intersect($productsFeedList, array(max($productsFeedList))));
		//error_log(print_r($FeedSubmissionId_Last,true)."\n", 3, $LogFileWithPath);
		return $FeedSubmissionId_Last[0];
	}
	
	return $amazon_feedSubList;
} 

function FeedSubmissionResultCodeGun ($FeedSubmissionId, $do = '') {
	global $ExtJSDevTMP, $handle, $service, $importManufacturers, $importBrands, $importASIN_err8541, $importASIN_err8542;
	
	$parameters = array (
	  'Merchant' => MERCHANT_ID,
	  'FeedSubmissionId' => $FeedSubmissionId,
	  'FeedSubmissionResult' => @fopen('php://memory', 'rw+'),
	);

	$request = new MarketplaceWebService_Model_GetFeedSubmissionResultRequest($parameters);

	//invokeGetFeedSubmissionResult($service, $request);
	$handle = invokeGetFeedSubmissionResult($service, $request);

	//put FeedResult on a file
	file_put_contents($ExtJSDevTMP.'xmlFeedSubmissionResult.xml', $handle);

	/*
	echo '<pre>';
	print_r($handle);
	echo '</pre>';
	*/

	return $handle;
}

function populateGridFeedSubmissionList(){
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
	  
		$CollectObjList[]= array(
			"FeedProcessingStatus" => $result['FeedProcessingStatus'],
			"FeedSubmissionId"=> $result['FeedSubmissionId'],
			"FeedType"=> $result['FeedType'],
			"StartedProcessingDate"=> $result['StartedProcessingDate'],
			"SubmittedDate"=> $result['SubmittedDate'],
			"CompletedProcessingDate"=> $result['CompletedProcessingDate']
		);	
		$RecordCountResult = $RecordCountResult+1;
	}
	$output["data"] = $CollectObjList;

	$output["total"] = $RecordCountResult;
	$output["success"]=true;
	$output["message"]="success";

	//field
	$output["fields"]= array();
	$output["fields"][]=array("name"=>"FeedProcessingStatus","type"=>"string");
	$output["fields"][]=array("name"=>"FeedType","type"=>"string");
	$output["fields"][]=array("name"=>"FeedSubmissionId","type"=>"string");
	$output["fields"][]=array("name"=>"StartedProcessingDate","type"=>"string");
	$output["fields"][]=array("name"=>"SubmittedDate","type"=>"string");
	$output["fields"][]=array("name"=>"CompletedProcessingDate","type"=>"string");

	//column 
	$output["columns"]= array();
	$output["columns"][]=array(
		"dataIndex"=>"FeedType",
		"header"=>"FeedType", 
		"text"=>"FeedType" , 
		"format"=>"" ,
		"hidden"=>false,
		"flex"=>1,
		"editor"=>array(), 
		"filter"=>array('type'=>'string')
	);
	$output["columns"][]=array(
		"dataIndex"=>"FeedProcessingStatus",
		"header"=>"FeedProcessingStatus", 
		"text"=>"FeedProcessingStatus" , 
		"format"=>"" ,
		"hidden"=>false,
		//"flex"=>1,
		"editor"=>array(), 
		"filter"=>array('type'=>'string'),
		"width"=>110
	);
	$output["columns"][]=array(
		"dataIndex"=>"FeedSubmissionId",
		"header"=>"FeedSubmissionId", 
		"text"=>"FeedSubmissionId" , 
		"format"=>"" ,
		"hidden"=>false,
		"flex"=>1,
		"editor"=>array(), 
		"filter"=>array('type'=>'string')
	);
	$output["columns"][]=array(
		"dataIndex"=>"StartedProcessingDate",
		"header"=>"StartedProcessingDate", 
		"text"=>"StartedProcessingDate" , 
		"format"=>"" ,
		"hidden"=>false,
		"flex"=>1,
		"editor"=>array(), 
		"filter"=>array('type'=>'string')
	);
	$output["columns"][]=array(
		"dataIndex"=>"SubmittedDate",
		"header"=>"SubmittedDate", 
		"text"=>"SubmittedDate" , 
		"format"=>"" ,
		"hidden"=>false,
		"flex"=>1,
		"editor"=>array(), 
		"filter"=>array('type'=>'string')
	);
	$output["columns"][]=array(
		"dataIndex"=>"CompletedProcessingDate",
		"header"=>"CompletedProcessingDate", 
		"text"=>"CompletedProcessingDate" , 
		"format"=>"" ,
		"hidden"=>false,
		"flex"=>1,
		"editor"=>array(), 
		"filter"=>array('type'=>'string')
	);
}

function amazon_correctErrors($handle){
	global $conn, $ExtJSDevTMP, $LogFileWithPath, $handle, $service, $importManufacturers, $importBrands, $importASIN_err8541, $importASIN_err8542;

	$xmlFeedSubmissionResult = simplexml_load_string($handle);
	//error_log(print_r($xmlFeedSubmissionResult,true)."\n", 3, $LogFileWithPath);
	
	if(!isset($xmlFeedSubmissionResult->Message->ProcessingReport->Result)) return;
	
	foreach ($xmlFeedSubmissionResult->Message->ProcessingReport->Result as $result) {

		/*
		printf(
				"<p>%s SKU con errore %d la cui descrizione è %s.</p>",
				$result->AdditionalInfo->SKU,
				$result->ResultMessageCode,
				$result->ResultDescription
			);
		*/
		$suffix = WFVALUEGLOBAL('AMAZON_CODE_SUFFIX');
		//error_log(print_r($suffix,true)."\n", 3, $LogFileWithPath);
		$sku = $result->AdditionalInfo->SKU;
		//error_log(print_r($sku,true)."\n", 3, $LogFileWithPath);
		$codice = str_replace($suffix, "",$sku);
		//error_log(print_r($codice,true)."\n", 3, $LogFileWithPath);
		//error_log("boh: ".print_r($sku == "",true)."\n", 3, $LogFileWithPath);
		//error_log("mah: ".print_r(strpos($sku, $suffix),true)."\n", 3, $LogFileWithPath);
		if($suffix == "" || strpos($sku, $suffix) !== false) {
			$strAppo = $result->ResultDescription;
			$artId = WFVALUEDLOOKUP('ID','articoli','CODICE = "'.$codice.'"');
			//error_log(print_r($artId,true)."\n", 3, $LogFileWithPath);
			//error_log(" CODICE:".print_r($codice,true)." artId:".print_r($artId,true)."\n", 3, $LogFileWithPath);
			
			if($artId == '') {
				//salta codici a cui non corrisponde articolo
				//error_log(" articolo non trovato per CODICE:".print_r($codice,true)."\n", 3, $LogFileWithPath);
			} else if ($result->ResultMessageCode == 8541) {
				//$strMerchant_it = strstr ($strAppo, 'manufacturer (Venditore: ');
				//error_log(print_r($strMerchant_it,true)."\n", 3, $LogFileWithPath);
				if ($strMerchant_en = strstr ($strAppo, '\'manufacturer\' Merchant: ') || $strMerchant_it = strstr ($strAppo, 'manufacturer (Venditore: ')) {
					$strMerchant = $strMerchant_en.$strMerchant_it;
					$posStart = strpos ($strMerchant, 'Amazon: ');
					$posEnd = strpos ($strMerchant, "'). ");
					$strMerchant = substr($strMerchant, $posStart+9, ($posEnd)-($posStart+9));
					//error_log(print_r($strMerchant,true)."\n", 3, $LogFileWithPath);
					//if ($do == '' || $do == 'correctManu' )	echo 'Allert: manufacturer, SKU: ' . $sku . ' -> posStart ' . $posStart . ' -> posEnd ' . $posEnd . ' -> lenght ' . (($posEnd)-($posStart+9)) . ' -> ' . $strMerchant . '<br>';
					if (($importManufacturers || $do == 'correctAll' || $do == 'correctManu') && $strMerchant ) {
						$anagID = WFVALUEDLOOKUP('ID','anagrafiche','DESCRIZIONE = "'.$strMerchant.'"');
						//error_log(print_r($anagID,true)."\n", 3, $LogFileWithPath);
						
						if(!$anagID) {
							$AppoRecordAnag = [];
							$AppoRecordAnag['DESCRIZIONE'] = $strMerchant;
							$conn->AutoExecute("anagrafiche", $AppoRecordAnag, 'INSERT');
							$anagID = $conn->Insert_ID();
						}

						$AppoArt = [];
						$AppoArt['CT_PRODUTTORE'] = $anagID;
						$conn->AutoExecute("articoli", $AppoArt, 'UPDATE', 'ID = '.$artId);

						$output['message'] .= "aggiornato product vs. manufacturer per SKU " . $sku . " con errore 8541 <br>";
					}
				}

				if ($strBrand_en = strstr ($strAppo, '\'brand\' Merchant: ') || $strBrand_it = strstr ($strAppo, 'brand (Venditore: ')) {
					$strBrand = $strBrand_en.$strBrand_it;
					$posStart = strpos ($strBrand, 'Amazon: ');
					if (!$posEnd = strpos ($strBrand, '\', ')) $posEnd = strpos ($strBrand, "'). ");
					$strBrand = substr($strBrand, $posStart+9, ($posEnd)-($posStart+9));
					//error_log(print_r($strBrand,true)."\n", 3, $LogFileWithPath);
					//if ($do == '' || $do == 'correctAll' || $do == 'correctBrands' ) echo 'Allert: brand, SKU: ' . $sku . ' -> posStart ' . $posStart . ' -> posEnd ' . $posEnd . ' -> lenght ' . (($posEnd)-($posStart+9)) . ' -> ' . $strBrand . '<br>';
					if (($importBrands || $do == 'correctAll' || $do == 'correctBrands') && $strBrand) {
						$brandID = WFVALUEDLOOKUP('ID','brand','DESCRIZIONE = "'.$strBrand.'"');
						//error_log(print_r($brandID,true)."\n", 3, $LogFileWithPath);
						
						if(!$brandID) {
							$AppoBrand = [];
							$AppoBrand['DESCRIZIONE'] = $strBrand;
							$conn->AutoExecute("brand", $AppoBrand, 'INSERT');
							$brandID = $conn->Insert_ID();
						}

						$AppoArt = [];
						$AppoArt['CT_BRAND'] = $brandID;
						$conn->AutoExecute("articoli", $AppoArt, 'UPDATE', 'ID = '.$artId);

						$output['message'] .= "aggiornato product vs. brand per SKU " . $sku . " con errore 8541 <br>";
					}
				}
				
				if ($strASIN = strstr ($strAppo, 'ASIN')) {
					$strASIN = str_replace(' ','',$strASIN);
					$strASIN = str_replace('ASIN','',$strASIN);
					$posEnd = strpos ($strASIN, ',');
					$strASIN = trim(substr($strASIN, 0, $posEnd));
					//error_log(print_r($strASIN,true)."\n", 3, $LogFileWithPath);
					//error_log(" CODICE:".print_r($codice,true)." ASIN:".print_r($strASIN,true)."\n", 3, $LogFileWithPath);
					//if ($do == '' || $do == 'correctAll' || $do == 'correctASIN8541' ) echo 'Allert: ASIN (error '. $result->ResultMessageCode. '), SKU: ' . $sku . ' -> posEnd ' . $posEnd . ' -> lenght ' . ($posEnd-5) . ' -> ' . $strASIN . '<br>';
					if (($importASIN_err8541 || $do == 'correctAll' || $do == 'correctASIN8541') && $strASIN ) {
						//error_log(print_r($artId,true)."\n", 3, $LogFileWithPath);
						if($artId) {
							$artlist = WFVALUEDLOOKUP('*','articolilistini','CT_ARTICOLI = '.$artId.' AND CT_ANAGRAFICHE = '.WFVALUEGLOBAL('AMAZON_ANAG_ID').'');
							if($artlist){
								$pi_sql = 'UPDATE articolilistini SET CODICEALTERNATIVO = "' . $strASIN . '" WHERE CT_ARTICOLI = '.$artId.' AND CT_ANAGRAFICHE = '.WFVALUEGLOBAL('AMAZON_ANAG_ID').'';
							} else {
								$pi_sql = 'INSERT INTO articolilistini (CODICEALTERNATIVO, CT_ARTICOLI ,CT_ANAGRAFICHE) VALUES ("' . $strASIN . '", '.$artId.', '.WFVALUEGLOBAL('AMAZON_ANAG_ID').')';
							}
							error_log(print_r($pi_sql,true)."\n", 3, $LogFileWithPath);
							$pi = $conn->Execute($pi_sql);
							$output['message'] .= "aggiornato ASIN per SKU " . $sku . " con errore 8541 \n";
						}	
					}
				}
			} else if ($result->ResultMessageCode == 8542) {
				//cerco ASIN per estrarre l'ASIN dalla stringa
				$strASIN = strstr ($strAppo, '\'ASIN');
				$strASIN = str_replace(' ','',$strASIN);
				$strASIN = str_replace('\'','',$strASIN);
				$strASIN = str_replace('ASIN','',$strASIN);
				$posEnd = strpos ($strASIN, ',');
				$strASIN = trim(substr($strASIN, 0, $posEnd));
				//error_log(print_r($strASIN,true)."\n", 3, $LogFileWithPath);
				if (strlen($strASIN) !=10) {
					//echo "estrazione ASIN dal testo non riuscitaper SKU ".$sku;
					//$output["message"] .= "estrazione ASIN dal testo non riuscitaper SKU ".$sku."\n";
				} else {
					//if ($do == '' || $do == 'correctAll' || $do == 'correctASIN8542' ) echo 'Allert: ASIN (error '. $result->ResultMessageCode. '), SKU: ' . $sku . ' -> posEnd ' . $posEnd . ' -> lenght ' . ($posEnd-5) . '->' . $strASIN . '<br>';
					if (($importASIN_err8542 || $do == 'correctAll' || $do == 'correctASIN8542') && $strASIN ) {
						//error_log(print_r($artId,true)."\n", 3, $LogFileWithPath);
						if($artId) {
							$artlist = WFVALUEDLOOKUP('*','articolilistini','CT_ARTICOLI = '.$artId.' AND CT_ANAGRAFICHE = '.WFVALUEGLOBAL('AMAZON_ANAG_ID').'');
							if($artlist){
								$pi_sql = 'UPDATE articolilistini SET CODICEALTERNATIVO = "' . $strASIN . '" WHERE CT_ARTICOLI = '.$artId.' AND CT_ANAGRAFICHE = '.WFVALUEGLOBAL('AMAZON_ANAG_ID').'';
							} else {
								$pi_sql = 'INSERT INTO articolilistini (CODICEALTERNATIVO, CT_ARTICOLI ,CT_ANAGRAFICHE) VALUES ("' . $strASIN . '", '.$artId.', '.WFVALUEGLOBAL('AMAZON_ANAG_ID').')';
							}
							//error_log(print_r($pi_sql,true)."\n", 3, $LogFileWithPath);
							$pi = $conn->Execute($pi_sql);
							$output['message'] .= "aggiornato ASIN per SKU " . $sku . " con errore 8542 \n";
						}	
					}
				}
			}
		}
	}
}