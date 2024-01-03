<?php

//include_once (DIR_WS_INCLUDES . '.config.inc.php'); 
include_once ('.config.inc.php');

$serviceUrl = "https://mws-eu.amazonservices.com/Orders/2011-01-01";  // Europe
$config = array (
  'ServiceURL' => $serviceUrl,
  'ProxyHost' => null,
  'ProxyPort' => -1,
  'MaxErrorRetry' => 3,
);

$service = new MarketplaceWebServiceOrders_Client(
       AWS_ACCESS_KEY_ID,
       AWS_SECRET_ACCESS_KEY,
       APPLICATION_NAME,
       MWS_APPLICATION_VERSION,
       $config);

 // @TODO: set request. Action can be passed as MarketplaceWebServiceOrders_Model_ListOrdersRequest
 $request = new MarketplaceWebServiceOrders_Model_ListOrdersRequest();
 $request->setSellerId(MERCHANT_ID);

 // List all orders udpated after a certain date
 $request->setCreatedAfter(new DateTime('2011-01-01 12:00:00', new DateTimeZone('UTC')));

 // Set the marketplaces queried in this ListOrdersRequest
 $marketplaceIdList = new MarketplaceWebServiceOrders_Model_MarketplaceIdList();
 $marketplaceIdList->setId(array(MARKETPLACE_ID));
 $request->setMarketplaceId($marketplaceIdList);

 // Set the order statuses for this ListOrdersRequest (optional)
 // $orderStatuses = new MarketplaceWebServiceOrders_Model_OrderStatusList();
 // $orderStatuses->setStatus(array('Shipped'));
 // $request->setOrderStatus($orderStatuses);

 // Set the Fulfillment Channel for this ListOrdersRequest (optional)
 //$fulfillmentChannels = new MarketplaceWebServiceOrders_Model_FulfillmentChannelList();
 //$fulfillmentChannels->setChannel(array('MFN'));
 //$request->setFulfillmentChannel($fulfillmentChannels);

 // @TODO: set request. Action can be passed as MarketplaceWebServiceOrders_Model_ListOrdersRequest
 // object or array of parameters
 //invokeListOrders($service, $request);
//invokeListOrders($service, $request);
$handle = invokeListOrders($service, $request);
file_put_contents('ext/amazon/xmlOrders.xml', $handle);
   
   echo '<pre>';
   var_dump ($handle);
   echo '</pre>';

                                        
/**
  * List Orders Action Sample
  * ListOrders can be used to find orders that meet the specified criteria.
  *   
  * @param MarketplaceWebServiceOrders_Interface $service instance of MarketplaceWebServiceOrders_Interface
  * @param mixed $request MarketplaceWebServiceOrders_Model_ListOrders or array of parameters
  */
  function invokeListOrders(MarketplaceWebServiceOrders_Interface $service, $request) 
  {
      try {
              $response = $service->listOrders($request);
            
                if ($response->isSetListOrdersResult()) { 
                    $listOrdersResult = $response->getListOrdersResult();

                    if ($listOrdersResult->isSetNextToken()) 
                    {
                        $NextToken = $listOrdersResult->getNextToken();
                    }
                    if ($listOrdersResult->isSetCreatedBefore()) 
                    {
                        $CreatedBefore = $listOrdersResult->getCreatedBefore();
                    }
                    if ($listOrdersResult->isSetLastUpdatedBefore()) 
                    {
                        $LastUpdatedBefore = $listOrdersResult->getLastUpdatedBefore();
                    }
                    if ($listOrdersResult->isSetOrders()) { 
                        $orders = $listOrdersResult->getOrders();
                        $orderList = $orders->getOrder();
						$amazon_orderList = array();
                        foreach ($orderList as $order) {
							$shippingAddress = $order->getShippingAddress();
							$orderTotal = $order->getOrderTotal();
							$amazon_orderList[] = array(AmazonOrderId => $order->getAmazonOrderId(),
														SellerOrderId => $order->getSellerOrderId(),
														PurchaseDate => $order->getPurchaseDate(),
														LastUpdateDate => $order->getLastUpdateDate(),
														OrderStatus => $order->getOrderStatus(),
														FulfillmentChannel => $order->getFulfillmentChannel(),
														SalesChannel => $order->getSalesChannel(),
														OrderChannel => $order->getOrderChannel(),
														ShipServiceLevel => $order->getShipServiceLevel(),
														Name => $shippingAddress->getName(),
														AddressLine1 => $shippingAddress->getAddressLine1(),
														AddressLine2 => $shippingAddress->getAddressLine2(),
														AddressLine3 => $shippingAddress->getAddressLine3(),
														City => $shippingAddress->getCity(),
														County => $shippingAddress->getCounty(),
														District => $shippingAddress->getDistrict(),
														StateOrRegion  => $shippingAddress->getStateOrRegion(),
														PostalCode => $shippingAddress->getPostalCode(),
														CountryCode => $shippingAddress->getCountryCode(),
														Phone => $shippingAddress->getPhone(),
														CurrencyCode => $orderTotal->getCurrencyCode(),
														Amount => $orderTotal->getAmount(),
														NumberOfItemsShipped => $order->getNumberOfItemsShipped(),
														NumberOfItemsUnshipped => $order->getNumberOfItemsUnshipped(),
                            }
                            if ($order->isSetPaymentExecutionDetail()) { 
                                echo("                        PaymentExecutionDetail<br>");
                                $paymentExecutionDetail = $order->getPaymentExecutionDetail();
                                $paymentExecutionDetailItemList = $paymentExecutionDetail->getPaymentExecutionDetailItem();
                                foreach ($paymentExecutionDetailItemList as $paymentExecutionDetailItem) {
                                    echo("                            PaymentExecutionDetailItem<br>");
                                    if ($paymentExecutionDetailItem->isSetPayment()) { 
                                        echo("                                Payment<br>");
                                        $payment = $paymentExecutionDetailItem->getPayment();
                                        if ($payment->isSetCurrencyCode()) 
                                        {
                                            echo("                                    CurrencyCode<br>");
                                            echo("                                        " . $payment->getCurrencyCode() . "<br>");
                                        }
                                        if ($payment->isSetAmount()) 
                                        {
                                            echo("                                    Amount<br>");
                                            echo("                                        " . $payment->getAmount() . "<br>");
                                        }
                                    } 
                                    if ($paymentExecutionDetailItem->isSetPaymentMethod()) 
                                    {
                                        echo("                                PaymentMethod<br>");
                                        echo("                                    " . $paymentExecutionDetailItem->getPaymentMethod() . "<br>");
                                    }
                                }
                            } 
                            if ($order->isSetPaymentMethod()) 
                            {
                                echo("                        PaymentMethod<br>");
                                echo("                            " . $order->getPaymentMethod() . "<br>");
                            }
                            if ($order->isSetMarketplaceId()) 
                            {
                                echo("                        MarketplaceId<br>");
                                echo("                            " . $order->getMarketplaceId() . "<br>");
                            }
                            if ($order->isSetBuyerEmail()) 
                            {
                                echo("                        BuyerEmail<br>");
                                echo("                            " . $order->getBuyerEmail() . "<br>");
                            }
                            if ($order->isSetBuyerName()) 
                            {
                                echo("                        BuyerName<br>");
                                echo("                            " . $order->getBuyerName() . "<br>");
                            }
                            if ($order->isSetShipmentServiceLevelCategory()) 
                            {
                                echo("                        ShipmentServiceLevelCategory<br>");
                                echo("                            " . $order->getShipmentServiceLevelCategory() . "<br>");
                            }
                            if ($order->isSetShippedByAmazonTFM()) 
                            {
                                echo("                        ShippedByAmazonTFM<br>");
                                echo("                            " . $order->getShippedByAmazonTFM() . "<br>");
                            }
                            if ($order->isSetTFMShipmentStatus()) 
                            {
                                echo("                        TFMShipmentStatus<br>");
                                echo("                            " . $order->getTFMShipmentStatus() . "<br>");
                            }
                        }
                    } 
                } 
                if ($response->isSetResponseMetadata()) { 
                    echo("            ResponseMetadata<br>");
                    $responseMetadata = $response->getResponseMetadata();
                    if ($responseMetadata->isSetRequestId()) 
                    {
                        echo("                RequestId<br>");
                        echo("                    " . $responseMetadata->getRequestId() . "<br>");
                    }
                } 

              echo("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "<br>");
*/			  
			  return $response;

     } catch (MarketplaceWebServiceOrders_Exception $ex) {
         echo("Caught Exception: " . $ex->getMessage() . "<br>");
         echo("Response Status Code: " . $ex->getStatusCode() . "<br>");
         echo("Error Code: " . $ex->getErrorCode() . "<br>");
         echo("Error Type: " . $ex->getErrorType() . "<br>");
         echo("Request ID: " . $ex->getRequestId() . "<br>");
         echo("XML: " . $ex->getXML() . "<br>");
         echo("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "<br>");
     }
 }