<?php

$sellerid = SELLER_ID;

foreach ($marketplaceIdArray as $marketplace) {

	$pi_sql = "
		SELECT
			a.CODICE AS products_model,
			IF(al.VALORE Is Null, a.LISTINOVENDITACONIVA , al.VALORE) AS products_price
		FROM articoli a
			INNER JOIN angcategorie c ON c.ID = a.CT_CATEGORIE
			LEFT JOIN (SELECT CT_ARTICOLI , CODICEALTERNATIVO, VALORE FROM articolilistini WHERE CT_ANAGRAFICHE = ".WFVALUEGLOBAL('AMAZON_ANAG_ID').") al ON al.CT_ARTICOLI = a.ID
		WHERE c.WEB = 1 
	";

	//riceve filtri di where dalla proc di chiamata
	if(isset($moreWhere) && !empty($moreWhere)) {
		$pi_sql .= " AND ".$moreWhere;
	}
	//riceve filtri di where dalla proc amazon_filtri
	if(isset($output['moreWhere']) && !empty($output['moreWhere'])) {
		$pi_sql .= " AND ".$output['moreWhere'];
	}

	//error_log(print_r($pi_sql,true)."\n", 3, $LogFileWithPath);
	$pi = $conn->Execute($pi_sql);

	$xmlStr = <<<EOD
<?xml version="1.0" encoding="utf-8" ?>
	<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
		<Header>
			<DocumentVersion>1.01</DocumentVersion>
			<MerchantIdentifier>$sellerid</MerchantIdentifier>
		</Header>
		<MessageType>Price</MessageType>
		
EOD;
	/*
		echo ('<pre>');
		var_dump ($marketplace);
		echo '$marketplace[Id][0]'.$marketplace[Id][0]; 
		echo ('</pre>');
	*/
	$i=1;
	while (!$pi->EOF) {
		if($pi->fields['products_price'] > 0) {
			//$price = $currencies->display_price($pi[products_price], tep_get_tax_rate($pi[products_tax_class_id]));
			if ($marketplace['Id'][0]=='A1F83G8C2ARO7P') {
				$currency = 'GBP';
				$price = round($pi->fields['products_price']*0.875,2);
				$xmlStr .= createXmlPriceMessage($pi, $currency, $price, $i);
				$i++;
			} else {
				$currency = 'EUR';
				$price = round($pi->fields['products_price'],2);
				$xmlStr .= createXmlPriceMessage($pi, $currency, $price, $i);
				$i++;
			}
		}
		$pi->Movenext();
	}

	$xmlStr .=	<<<EOD
	</AmazonEnvelope>
EOD;

	//print_r ($xmlStr);
	//echo htmlentities($xmlStr);

	file_put_contents($ExtJSDevTMP.'xmlPrices_'. $marketplace["language_code"] .'.xml', $xmlStr);

	/*
	//validazione mxl
	$xdoc = new DomDocument();
	$xdoc->load("ext/amazon/xmlPrices.xml");
	$rit=@$xdoc->schemaValidate("Price.xsd");
	if ($rit) echo "OK"; else echo "FAIL";
	*/

	$feedType = '_POST_PRODUCT_PRICING_DATA_';
	startSubmitFeed ($xmlStr, $feedType, $marketplace);
	$output['message'] .= '_POST_PRODUCT_PRICING_DATA_ FATTO';
}

function createXmlPriceMessage ($pi, $currency, $price, $i) {
	$products_model = $pi->fields['products_model'].WFVALUEGLOBAL('AMAZON_CODE_SUFFIX');
	
	$xmlStr = <<<EOD
		<Message>
			<MessageID>$i</MessageID>
			<Price>
				<SKU>$products_model</SKU>
				<StandardPrice currency="$currency">$price</StandardPrice>
			</Price>
		</Message>
EOD;

	return $xmlStr;
}
?>