<?php

$sellerid = SELLER_ID;

//estrai le quantità dei prodotti mettendo 0 dove negativa oppure DISATTIVATO = 1
$pi_sql = '
	SELECT
		a.CODICE AS products_model,
		IF(a.MAGAGIACENTE <= '.MIN_QTY.' OR a.DISATTIVATO = 1 OR al.VALORE = 0, 0, a.MAGAGIACENTE) as quantity,
		IF(al.VALORE IS NOT NULL AND al.VALORE = 0, 0, 1) as available
	FROM articoli a
		INNER JOIN angcategorie c ON c.ID = a.CT_CATEGORIE
		LEFT JOIN (SELECT CT_ARTICOLI , CODICEALTERNATIVO, VALORE FROM articolilistini WHERE CT_ANAGRAFICHE = '.WFVALUEGLOBAL('AMAZON_ANAG_ID').') al ON al.CT_ARTICOLI = a.ID
	WHERE c.WEB = 1
';

//riceve filtri di where dalla proc di chiamata
if(isset($moreWhere) && !empty($moreWhere)) {
	$pi_sql .= " AND ".$moreWhere;
}
//riceve filtri di where dalla proc amazon_Filters
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
	<MessageType>Inventory</MessageType>
	
EOD;

$i=1;

while (!$pi->EOF) {
	$products_model = $pi->fields['products_model'].WFVALUEGLOBAL('AMAZON_CODE_SUFFIX');
	$quantity = (int)$pi->fields['quantity'];
	$available = (int)$pi->fields['available'];
	//<Available>$available</Available>
	//pezzo da agguingere alla stringa xml ma mi ha dato errore:
	//XML Parsing Error at Line 285, Column 16: cvc-complex-type.2.4.a: Invalid content was found starting with element 'Available'. One of '{SwitchFulfillmentTo}' is expected.
	
	$xmlStr .=	<<<EOD
		<Message>
			<MessageID>$i</MessageID>
			<OperationType>Update</OperationType>
			<Inventory>
				<SKU>$products_model</SKU>
				<Quantity>$quantity</Quantity>
				<FulfillmentLatency>$fulfillmentlatency</FulfillmentLatency>
			</Inventory>
		</Message>
		
EOD;
	$pi->Movenext(); 
	$i++;
}

$xmlStr .=	<<<EOD
</AmazonEnvelope>
EOD;

//print_r ($xmlStr);
//echo htmlentities($xmlStr);
//echo getcwd() . "\n";

file_put_contents($ExtJSDevTMP.'xmlQuantity.xml', $xmlStr);

/*
//validazione mxl
$xdoc = new DomDocument();
$xdoc->load("ext/amazon/xmlQuantity.xml");
$rit=@$xdoc->schemaValidate("Inventory.xsd");
if ($rit) echo "OK"; else echo "FAIL";
*/

$feedType = '_POST_INVENTORY_AVAILABILITY_DATA_';
startSubmitFeed ($xmlStr, $feedType);
$output['message'] .= '_POST_INVENTORY_AVAILABILITY_DATA_ FATTO';
?>