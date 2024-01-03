<?php

//include_once (DIR_WS_INCLUDES . '.config.inc.php'); 
include_once ('.config.inc.php');

$serviceUrl = "https://mws.amazonservices.it";
$config = array (
  'ServiceURL' => $serviceUrl,
  'ProxyHost' => null,
  'ProxyPort' => -1,
  'MaxErrorRetry' => 3,
);

$service = new MarketplaceWebService_Client(
     AWS_ACCESS_KEY_ID, 
     AWS_SECRET_ACCESS_KEY, 
     $config,
     APPLICATION_NAME,
     AWS_APPLICATION_VERSION);

//inizia FeedSubmissionList

$parameters = array (
  'Merchant' => MERCHANT_ID,
  'FeedProcessingStatusList' => array ('Status' => array ('_DONE_')),
);

$request = new MarketplaceWebService_Model_GetFeedSubmissionListRequest($parameters);

$amazon_feedSubList = invokeGetFeedSubmissionList($service, $request);
/*
   echo '<pre>';
   var_dump ($amazon_feedSubList);
   echo '</pre>';
*/
foreach ( $amazon_feedSubList as $submittedFeed ) {
	if ($submittedFeed[FeedType] == '_POST_PRODUCT_DATA_') {
		$productsFeedList[$submittedFeed[FeedSubmissionId]] = $submittedFeed[CompletedProcessingDate];
	}
}

//trova la chiave(FeedSubmissionId) con data più recente
$FeedSubmissionIds = array_keys(array_intersect($productsFeedList, array(max($productsFeedList))));

echo '<pre>';
echo 'productsFeedList di tipo _POST_PRODUCT_DATA_<br>';
print_r ($productsFeedList); 
echo '</pre>';

echo '<pre>';
echo '$id più reccente di tipo _POST_PRODUCT_DATA_<br>';
print_r ($FeedSubmissionIds[0]); 
echo '</pre>';

//finisce FeedSubmissionList, inizia FeedSubmissionResult

$parameters = array (
  'Merchant' => MERCHANT_ID,
  'FeedSubmissionId' => $FeedSubmissionIds[0],
  'FeedSubmissionResult' => @fopen('php://memory', 'rw+'),
);

$request = new MarketplaceWebService_Model_GetFeedSubmissionResultRequest($parameters);

//invokeGetFeedSubmissionResult($service, $request);
$handle = invokeGetFeedSubmissionResult($service, $request);
//file_put_contents('ext/amazon/xmlFeedSubmissionResult.xml', $handle);

/*
echo '<pre>';
print_r($handle);
echo '</pre>';
*/

//if true will import manufacturers and/or brands from amazon
$importManufacturers = false;
$importBrands = false;

$xmlFeedSubmissionResult = simplexml_load_string($handle);

foreach ($xmlFeedSubmissionResult->Message->ProcessingReport->Result as $result) {
/*
	printf(
			"<p>>%s SKU con errore %d la cui descrizione è %s.</p>",
			$result->AdditionalInfo->SKU,
			$result->ResultMessageCode,
			$result->ResultDescription
		);
*/
	$strAppo = $result->ResultDescription;

	if ($result->ResultMessageCode == 8541) {
		if ($strMerchant = strstr ($strAppo, '\'manufacturer\' Merchant: ')) {
			$posStart = strpos ($strMerchant, 'Amazon: ');
			$posEnd = strpos ($strMerchant, '\', ');
			$strMerchant = substr($strMerchant, $posStart+9, ($posEnd)-($posStart+9));
			echo 'Allert: manufacturer, SKU: ' . $result->AdditionalInfo->SKU . ' -> posStart ' . $posStart . ' -> posEnd ' . $posEnd . ' -> lenght ' . (($posEnd)-($posStart+9)) . '->' . $strMerchant . '<br>';
			if ($importManufacturers) {
				$sqlAppo = "INSERT INTO `manufacturers` (`manufacturers_name`) " .
							" SELECT * FROM (SELECT '" . $strMerchant . "') AS tmp " .
							" WHERE NOT EXISTS (SELECT `manufacturers_name` " .
												" FROM `manufacturers` tbl1 " .
												" WHERE tbl1.`manufacturers_name` = '" . $strMerchant . "') ";
				mysql_query($sqlAppo) or  die(Mysql_error());
				
				$sqlAppo = "UPDATE products p, (SELECT * FROM manufacturers WHERE `manufacturers_name` = '" . $strMerchant . "') m " . 
							" SET p.manufacturers_id = m.manufacturers_id WHERE (p.products_model= '" . $result->AdditionalInfo->SKU . "');";
				mysql_query($sqlAppo) or  die(Mysql_error());
				
				print "aggiornato product vs. manufacturer per SKU " . $result->AdditionalInfo->SKU . " con errore 8541 <br>";
				ob_flush();
				flush(); 
			}
		}
		if ($strBrand = strstr ($strAppo, '\'brand\' Merchant: ')) {
			$posStart = strpos ($strBrand, 'Amazon: ');
			$posEnd = strpos ($strBrand, '\'). ');
			$strBrand = substr($strBrand, $posStart+9, ($posEnd)-($posStart+9));
			echo 'Allert: brand, SKU: ' . $result->AdditionalInfo->SKU . ' -> posStart ' . $posStart . ' -> posEnd ' . $posEnd . ' -> lenght ' . (($posEnd)-($posStart+9)) . '->' . $strBrand . '<br>';
			if ($importBrands) {
				$sqlAppo = "INSERT INTO `brands` (`brands_name`) " .
							" SELECT * FROM (SELECT '" . $strBrand . "') AS tmp " .
							" WHERE NOT EXISTS (SELECT `brands_name` " .
												" FROM `brands` tbl1 " .
												" WHERE tbl1.`brands_name` = '" . $strBrand . "') ";
				mysql_query($sqlAppo) or  die(Mysql_error());
				
				$sqlAppo = "UPDATE products p, (SELECT * FROM brands WHERE `brands_name` = '" . $strBrand. "') b " . 
							" SET p.brands_id = b.brands_id WHERE (p.products_model= '" . $result->AdditionalInfo->SKU . "');";
				mysql_query($sqlAppo) or  die(Mysql_error());
				
				print "aggiornato product vs. brand per SKU " . $result->AdditionalInfo->SKU . " con errore 8541 <br>";
				ob_flush();
				flush();
			}
		}
		if ($strASIN = strstr ($strAppo, 'ASIN')) {
			$posEnd = strpos ($strASIN, ',');
			$strASIN = substr($strASIN, 5, $posEnd-5);
			echo 'Allert: ASIN (error '. $result->ResultMessageCode. '), SKU: ' . $result->AdditionalInfo->SKU . ' -> posEnd ' . $posEnd . ' -> lenght ' . ($posEnd-5) . '->' . $strASIN . '<br>';
			
			$sqlAppo = "UPDATE amazon_productstoitems ap, (SELECT * FROM products WHERE `products_model` = '" . $result->AdditionalInfo->SKU. "') p " . 
						" SET ap.items_id = '" . $strASIN . "' WHERE (ap.products_id = p.products_id);";
			
			//mysql_query($sqlAppo) or  die(Mysql_error());
			
			print "aggiornato ASIN per SKU " . $result->AdditionalInfo->SKU . " con errore 8541 <br>";
			ob_flush();
			flush();
		}
	}

	if ($result->ResultMessageCode == 8542) {
		$strASIN = strstr ($strAppo, 'ASIN');
		$posEnd = strpos ($strASIN, ',');
		$strASIN = substr($strASIN, 5, $posEnd-5);
		echo 'Allert: ASIN (error '. $result->ResultMessageCode. '), SKU: ' . $result->AdditionalInfo->SKU . ' -> posEnd ' . $posEnd . ' -> lenght ' . ($posEnd-5) . '->' . $strASIN . '<br>';
		$sqlAppo = "UPDATE amazon_productstoitems ap, (SELECT products_id FROM products WHERE `products_model` = '" . $result->AdditionalInfo->SKU. "') p " . 
					" SET ap.items_id = '" . $strASIN . "' WHERE (ap.products_id = p.products_id);";

		//mysql_query($sqlAppo) or  die(Mysql_error());
		
		print "aggiornato ASIN per SKU " . $result->AdditionalInfo->SKU . " con errore 8542 <br>";
		ob_flush();
		flush();
	}

}


// da qui in giù parte delle funzioni

function invokeGetFeedSubmissionList(MarketplaceWebService_Interface $service, $request) 
  {
      try {
              $response = $service->getFeedSubmissionList($request);

                if ($response->isSetGetFeedSubmissionListResult()) { 
                    $getFeedSubmissionListResult = $response->getGetFeedSubmissionListResult();
                    $feedSubmissionInfoList = $getFeedSubmissionListResult->getFeedSubmissionInfoList();
					$amazon_SubmissionList = array();
                    foreach ($feedSubmissionInfoList as $feedSubmissionInfo) {
                            $amazon_SubmissionList[] = array(FeedSubmissionId => $feedSubmissionInfo->getFeedSubmissionId(), 
															FeedType => $feedSubmissionInfo->getFeedType(), 
															SubmittedDate => $feedSubmissionInfo->getSubmittedDate()->format(DATE_FORMAT_AMAZON), 
															FeedProcessingStatus => $feedSubmissionInfo->getFeedProcessingStatus(), 
															StartedProcessingDate => $feedSubmissionInfo->getStartedProcessingDate()->format(DATE_FORMAT_AMAZON), 
															CompletedProcessingDate => $feedSubmissionInfo->getCompletedProcessingDate()->format('Y-m-d\TH:i:s\Z') 
															);
                    }
					
                } 

				return $amazon_SubmissionList;
				
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

 function invokeGetFeedSubmissionResult(MarketplaceWebService_Interface $service, $request) 
  {
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