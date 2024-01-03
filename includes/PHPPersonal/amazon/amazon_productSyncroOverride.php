<?php

//include_once (DIR_WS_INCLUDES . '.config.inc.php');
//include_once ('.config.inc.php');
//include_once('amazon_common.php');

// include currencies class and create an instance
require_once(DIR_WS_CLASSES . 'currencies.php');
$currencies = new currencies();

$sellerid = SELLER_ID;

//definizione dei marketplace IT (language_id = 2), EN (language_id = 3), FR (language_id = 4), DE (language_id = 5), ES (language_id = 6)
/*
$marketplaceIdArray = array(array("Id" => array('APJ6JRA9NG5V4'),"language_id" => array('2'),"language_code" => array('IT')),
							array("Id" => array('A1F83G8C2ARO7P'),"language_id" => array('3'),"language_code" => array('UK')),
							array("Id" => array('A13V1IB3VIYZZH'),"language_id" => array('4'),"language_code" => array('FR')),
							array("Id" => array('A1PA6795UKMFR9'),"language_id" => array('5'),"language_code" => array('DE'),"expedited"=>false,"pobox"=>false),
							array("Id" => array('A1RKKUPIHCS9HS'),"language_id" => array('6'),"language_code" => array('ES'),"expedited"=>false)
							);
*/
//$marketplaceIdArray = array(array("Id" => array('APJ6JRA9NG5V4'),"language_id" => array('2')),array("Id" => array('A1F83G8C2ARO7P'),"language_id" => array('3')),array("Id" => array('A13V1IB3VIYZZH'),"language_id" => array('4')),array("Id" => array('A1PA6795UKMFR9'),"language_id" => array('5')),array("Id" => array('A1RKKUPIHCS9HS'),"language_id" => array('6')));
//$marketplaceIdArray = array(NULL, array("Id" => array('A1F83G8C2ARO7P'),"language_id" => array('3')));
//$marketplaceIdArray = array(array("Id" => array(''),"language_id" => array('')),array("Id" => array('A1F83G8C2ARO7P'),"language_id" => array('3')));
//$marketplaceIdArray = array(array("Id" => array('APJ6JRA9NG5V4'),"language_id" => array('2')),array("Id" => array('A1F83G8C2ARO7P'),"language_id" => array('3')),array("Id" => array('A13V1IB3VIYZZH'),"language_id" => array('4')),array("Id" => array('A1PA6795UKMFR9'),"language_id" => array('5')),array("Id" => array('A1RKKUPIHCS9HS'),"language_id" => array('6')));
//$marketplaceIdArray = array(array("Id" => array('APJ6JRA9NG5V4'),"language_id" => array('2')),array("Id" => array('A13V1IB3VIYZZH'),"language_id" => array('4')),array("Id" => array('A1PA6795UKMFR9'),"language_id" => array('5')),array("Id" => array('A1RKKUPIHCS9HS'),"language_id" => array('6')));
//$marketplaceIdArray = array(array("Id" => array('APJ6JRA9NG5V4'),"language_id" => array('2')),array("Id" => array('A13V1IB3VIYZZH'),"language_id" => array('4')),array("Id" => array('A1PA6795UKMFR9'),"language_id" => array('5')));
//$marketplaceIdArray = array(array("Id" => array('APJ6JRA9NG5V4'),"language_id" => array('2')),array("Id" => array('A13V1IB3VIYZZH'),"language_id" => array('4')));
//$marketplaceIdArray = array(array("Id" => array('APJ6JRA9NG5V4')));

foreach ($marketplaceIdArray as $marketplace) {

	$pi_query = tep_db_query("SELECT p.products_model, p.products_price, p.products_tax_class_id, p.products_volume 
		FROM amazon_productstoitems ap INNER JOIN products p ON ap.products_id = p.products_id 
		WHERE p.products_volume = 1; ");

	$xmlStr = <<<EOD
<?xml version="1.0" encoding="utf-8" ?>
	<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
		<Header>
			<DocumentVersion>1.01</DocumentVersion>
			<MerchantIdentifier>$sellerid</MerchantIdentifier>
		</Header>
		<MessageType>Override</MessageType>
		
EOD;
	/*
	echo ('<pre>');
	var_dump ($marketplace);
	echo '$marketplace[Id][0]: '.$marketplace[Id][0];
	echo '<br>';
	echo '$marketplace[language_code][0]:'.$marketplace[language_code][0];
	echo ('</pre>');
	*/
	
	$i=1;
	$shippingPrice_eur = 40;
	$currency = 'EUR';
	$shippingPrice = tep_round($shippingPrice_eur,2);
	
	while ($pi = tep_db_fetch_array($pi_query)) {
	//$price = $currencies->display_price($pi[products_price], tep_get_tax_rate($pi[products_tax_class_id]));

		if ($marketplace[language_code]=='UK') {
			$currency = 'GBP';
			$shippingPrice = tep_round($shippingPrice_eur*0.875,2);
			$xmlStr .= createXmlOverrideMessageUK($pi, $currency, $shippingPrice, $i, $marketplace[language_code]);
		} elseif ($marketplace[language_code]=='IT') {
			$xmlStr .= createXmlOverrideMessageIT($pi, $currency, $shippingPrice, $i, $marketplace[language_code]);
		} elseif ($marketplace[language_code]=='FR') {
			$xmlStr .= createXmlOverrideMessageFR($pi, $currency, $shippingPrice, $i, $marketplace[language_code]);
		} elseif ($marketplace[language_code]=='DE') {
			$xmlStr .= createXmlOverrideMessageDE($pi, $currency, $shippingPrice, $i, $marketplace[language_code], $marketplace[expedited], $marketplace[pobox]);
		} elseif ($marketplace[language_code]=='ES') {
			$xmlStr .= createXmlOverrideMessageES($pi, $currency, $shippingPrice, $i, $marketplace[language_code], $marketplace[expedited]);
		}
		
		$i++;
	}
	
	$xmlStr .=	<<<EOD
	</AmazonEnvelope>
EOD;
	
	/*
	//validazione mxl
	$xdoc = new DomDocument();
	$xdoc->load("ext/amazon/xmlOverride.xml");
	$rit=@$xdoc->schemaValidate("Override.xsd");
	if ($rit) echo "OK"; else echo "FAIL";
	*/

	if (!DRY) {
		$feedType = '_POST_PRODUCT_OVERRIDES_DATA_';
		$feedSubmissionId = startSubmitFeed ($xmlStr, $feedType, $marketplace);
	} else {
		$feedSubmissionId = 'DRY MODE - NOT SUBMITTED';
	}

	/*print and save result for log*/
	echo ('<div style="max-width:10px">');
	echo ('<pre>');
	print_r ($feedSubmissionId);
	print_r ($xmlStr);
	echo ('</pre>');
	echo ('</div>');
	
	// decommentare per mettere in un file la stringa XML
	file_put_contents('ext/amazon/xmlOverride_'. $marketplace[language_code] .'.xml', '<!-- Feed Submission Id: '.$feedSubmissionId." -->\n".$xmlStr);
}

// Italian Override Xml structure
function createXmlOverrideMessageIT ($pi, $currency, $shippingPrice, $i, $language_code) {
	$products_model = $pi["products_model"].WFVALUEGLOBAL('AMAZON_CODE_SUFFIX');
	$xmlStr = <<<EOD
	  <Message>
		<MessageID>$i</MessageID>
		<OperationType>Update</OperationType>
		<Override>
		  <SKU>$products_model</SKU>
		  <ShippingOverride>
			<ShipOption>$language_code Std Domestic</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std EFTA</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std EU10</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std EU27</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Intl NA</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Intl latinamerica</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Intl JP</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Intl ROW</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		</Override>
	  </Message>

EOD;

return $xmlStr;
}

// UK Override Xml structure
function createXmlOverrideMessageUK ($pi, $currency, $shippingPrice, $i, $language_code) {
	$xmlStr = <<<EOD
	  <Message>
		<MessageID>$i</MessageID>
		<OperationType>Update</OperationType>
		<Override>
		  <SKU>$pi[products_model]</SKU>
		  <ShippingOverride>
			<ShipOption>Std $language_code Dom</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 1</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 2</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code NA</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code NorthAmerica</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code ROW</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		</Override>
	  </Message>

EOD;

return $xmlStr;
}

// DE Override Xml structure
function createXmlOverrideMessageDE ($pi, $currency, $shippingPrice, $i, $language_code, $expedited, $pobox) {
	$xmlStr = <<<EOD
	  <Message>
		<MessageID>$i</MessageID>
		<OperationType>Update</OperationType>
		<Override>
		  <SKU>$pi[products_model]</SKU>
		  <ShippingOverride>
			<ShipOption>Std $language_code Dom</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 1</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 2</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 3</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 4</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 5</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code JP</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code NA</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code ROW</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
EOD;

if ($expedited) {
$xmlStr = <<<EOD
		  <ShippingOverride>
			<ShipOption>Exp $language_code Dom</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
  		  <ShippingOverride>
			<ShipOption>Exp $language_code Dom (Versand an Packstation)</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>

EOD;
}

if ($pobox) {
$xmlStr .= <<<EOD
		  <ShippingOverride>
			<ShipOption>Std $language_code POBox</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>

EOD;
}

$xmlStr .= <<<EOD
		</Override>
	  </Message>

EOD;

return $xmlStr;
}

// ES Override Xml structure
function createXmlOverrideMessageES ($pi, $currency, $shippingPrice, $i, $language_code, $expedited) {
	$xmlStr = <<<EOD
	  <Message>
		<MessageID>$i</MessageID>
		<OperationType>Update</OperationType>
		<Override>
		  <SKU>$pi[products_model]</SKU>
		  <ShippingOverride>
			<ShipOption>$language_code Std Domestic</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Europe1</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Europe2</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Europe3</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Intl NA</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Intl Latinamerica</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Intl JP</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>$language_code Std Intl ROW</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>

EOD;

if ($expedited) {
$xmlStr .= <<<EOD
		  <ShippingOverride>
			<ShipOption>$language_code Exp Domestic</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>

EOD;
}

$xmlStr .= <<<EOD
		</Override>
	  </Message>

EOD;

return $xmlStr;
}

// FR Override Xml structure
function createXmlOverrideMessageFR ($pi, $currency, $shippingPrice, $i, $language_code) {
	$xmlStr = <<<EOD
	  <Message>
		<MessageID>$i</MessageID>
		<OperationType>Update</OperationType>
		<Override>
		  <SKU>$pi[products_model]</SKU>
		  <ShippingOverride>
			<ShipOption>Std $language_code Dom</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Dom Tom</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 1</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code Europe 2</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code NA</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code NorthAmerica</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		  <ShippingOverride>
			<ShipOption>Std $language_code ROW</ShipOption>
			<Type>Exclusive</Type>
			<ShipAmount currency="$currency">$shippingPrice</ShipAmount>
		  </ShippingOverride>
		</Override>
	  </Message>

EOD;

return $xmlStr;
}
?>