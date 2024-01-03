<?php
/** 
 *  PHP Version 5
 *
 *  @category    Amazon
 *  @package     FBAInventoryServiceMWS
 *  @copyright   Copyright 2009 Amazon.com, Inc. All Rights Reserved.
 *  @link        http://mws.amazon.com
 *  @license     http://aws.amazon.com/apache2.0  Apache License, Version 2.0
 *  @version     2010-10-01
 */
/******************************************************************************* 
 * 
 *  FBA Inventory Service MWS PHP5 Library
 *  Generated: Fri Oct 22 09:52:21 UTC 2010
 * 
 */

/**
 * Ottenere l'elenco dei prodotti
 */

include_once (DIR_WS_INCLUDES . '.config.inc.php'); 

/************************************************************************
* Configuration settings are:
*
* - MWS endpoint URL: it defined in the .config.inc.php located in the 
*                     same directory as this sample.
* - Proxy host and port.
* - MaxErrorRetry.
***********************************************************************/
$configFBA = array (
  'ServiceURL' => MWS_ENDPOINT_URL,
  'ProxyHost' => null,
  'ProxyPort' => -1,
  'MaxErrorRetry' => 3
);

$serviceUrl = "https://mws.amazonservices.it";
$configMWS = array (
  'ServiceURL' => $serviceUrl,
  'ProxyHost' => null,
  'ProxyPort' => -1,
  'MaxErrorRetry' => 3,
);

/************************************************************************
 * Instantiate Implementation of FBAInventoryServiceMWS
 * 
 * ACCESS_KEY_ID and SECRET_ACCESS_KEY constants 
 * are defined in the .config.inc.php located in the same 
 * directory as this sample
 ***********************************************************************/
 $serviceFBA = new FBAInventoryServiceMWS_Client(
     ACCESS_KEY_ID, 
     SECRET_ACCESS_KEY, 
     $configFBA,
     APPLICATION_NAME,
     APPLICATION_VERSION);

 $serviceMWS = new MarketplaceWebService_Client(
     AWS_ACCESS_KEY_ID, 
     AWS_SECRET_ACCESS_KEY, 
     $configMWS,
     APPLICATION_NAME,
     APPLICATION_VERSION);
	 
/************************************************************************
 * Setup request parameters and uncomment invoke to try out 
 * sample for Get Service Status Action
 ***********************************************************************/

 $requestFBA = new FBAInventoryServiceMWS_Model_GetServiceStatusRequest();
  $requestFBA->setSellerId(SELLER_ID);

  $amazonAPIStatus = invokeGetServiceStatus($serviceFBA, $requestFBA);

  echo ("Service Response Status -> ". $amazonAPIStatus ."\n<br>");

//finisce status e inizia report list
  
   $parameters = array (
   'Merchant' => MERCHANT_ID,
   'AvailableToDate' => new DateTime('now', new DateTimeZone('UTC')),
   'AvailableFromDate' => new DateTime('-6 months', new DateTimeZone('UTC')),
   'Acknowledged' => false, 
 );
 
 $requestMWS = new MarketplaceWebService_Model_GetReportListRequest($parameters);
  
   $amazon_reportInfo = invokeGetReportList($serviceMWS, $requestMWS);

	foreach ( $amazon_reportInfo as $chiave => $valore) {
		echo ( $chiave . " -> " . $valore . "<br>");
	}

// finisce report list inizia get report
	$reportId = array_search('_GET_FLAT_FILE_OPEN_LISTINGS_DATA_', $amazon_reportInfo);
	 
	 $parameters = array (
	   'Merchant' => MERCHANT_ID,
	   'Report' => @fopen('php://memory', 'rw+'),
	   'ReportId' => $reportId,
	 );
	 $requestMWS = new MarketplaceWebService_Model_GetReportRequest($parameters);

	$handle = invokeGetReport($serviceMWS, $requestMWS);
	$handle = explode ("\n", $handle );
	//var_dump($handle);
	//file_put_contents('ext/amazon/esempio.txt', $handle);
	
	//pulisce tabella ed importa dati
	//$StrSQL = "DELETE FROM amazon_productstoitems";
	//mysql_query($StrAPPO) or  die(Mysql_error());
	$StrSQL = "INSERT INTO amazon_productstoitems (amazon_productstoitems_products_id, amazon_productstoitems_items_id)";
	$waste = array_shift($handle); //toglie la testa dall'array
	foreach ($handle as $StrAPPO) {
		If ($StrAPPO <> "")
		{
			$rows = explode ("\t", $StrAPPO );
			$rows = array_slice($rows,0,2);
			$StrAPPO = implode ("','",$rows);
			/*$StrAPPO = str_replace("''","' '",$StrAPPO);
			$StrAPPO = str_replace(chr(0),"",$StrAPPO);
			$StrAPPO = str_replace("\t","','",$StrAPPO);*/
			//$sql[]= "('".$StrAPPO."')";
			$StrAPPO = $StrSQL . " VALUES ( '" . $StrAPPO . "' )";
			//echo $StrAPPO . '<br>';
			//mysql_query($StrAPPO) or  die(Mysql_error());
			ob_flush();
			flush();
		}
	}
	//$StrAPPO = implode (",",$sql);
	//$StrAPPO = $StrSQL . " VALUES " . $StrAPPO . ";";
	//mysql_query($StrAPPO) or  die(Mysql_error());
	//echo $StrAPPO . '<br>';

	
// da qui in giù parte delle funzioni	
/**
  * Get Service Status Action Sample
  * Gets the status of the service.
  * Status is one of GREEN, RED representing:
  * GREEN: This API section of the service is operating normally.
  * RED: The service is disrupted.
  *   
  * @param FBAInventoryServiceMWS_Interface $service instance of FBAInventoryServiceMWS_Interface
  * @param mixed $request FBAInventoryServiceMWS_Model_GetServiceStatus or array of parameters
  */
  function invokeGetServiceStatus(FBAInventoryServiceMWS_Interface $service, $request) 
  {
      try {
              $response = $service->getServiceStatus($request);
              
                if ($response->isSetGetServiceStatusResult()) { 

                    $getServiceStatusResult = $response->getGetServiceStatusResult();
                    if ($getServiceStatusResult->isSetStatus()) 
                    {
                        $amazonAPIStatus = $getServiceStatusResult->getStatus();
						return $amazonAPIStatus;
                    }
  
                } 

     } catch (FBAInventoryServiceMWS_Exception $ex) {
         echo("Caught Exception: " . $ex->getMessage() . "\n");
         echo("Response Status Code: " . $ex->getStatusCode() . "\n");
         echo("Error Code: " . $ex->getErrorCode() . "\n");
         echo("Error Type: " . $ex->getErrorType() . "\n");
         echo("Request ID: " . $ex->getRequestId() . "\n");
         echo("XML: " . $ex->getXML() . "\n");

	 }
 }
 
 /**
  * Get Report List Action Sample
  * returns a list of reports; by default the most recent ten reports,
  * regardless of their acknowledgement status
  *   
  * @param MarketplaceWebService_Interface $service instance of MarketplaceWebService_Interface
  * @param mixed $request MarketplaceWebService_Model_GetReportList or array of parameters
  */
  function invokeGetReportList(MarketplaceWebService_Interface $service, $request) 
  {
      try {
              $response = $service->getReportList($request);

				if ($response->isSetGetReportListResult()) { 

                    $getReportListResult = $response->getGetReportListResult();
                    if ($getReportListResult->isSetNextToken()) 
                    {
						$nextToken = $getReportListResult->getNextToken();
                    }
                    if ($getReportListResult->isSetHasNext()) 
                    {
                        $next = $getReportListResult->getHasNext();
                    }
                    $reportInfoList = $getReportListResult->getReportInfoList();
					$i=0;
					$amazon_reportInfo = array();
                    foreach ($reportInfoList as $reportInfo) {

                        if ($reportInfo->isSetReportId() AND $reportInfo->isSetReportType()) 
                        {
                            $amazon_reportInfo[$reportInfo->getReportId()] = $reportInfo->getReportType();
							//$amazon_reportInfo +=  array ($reportInfo->getReportId() => $reportInfo->getReportType());
                        }
                    }

					return $amazon_reportInfo;
				}
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

/**
  * Get Report Action Sample
  * The GetReport operation returns the contents of a report. Reports can potentially be
  * very large (>100MB) which is why we only return one report at a time, and in a
  * streaming fashion.
  *   
  * @param MarketplaceWebService_Interface $service instance of MarketplaceWebService_Interface
  * @param mixed $request MarketplaceWebService_Model_GetReport or array of parameters
  */
  function invokeGetReport(MarketplaceWebService_Interface $service, $request) 
  {
      try {
		  $response = $service->getReport($request);
		  
			$report = stream_get_contents($request->getReport());
			return $report;

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
 