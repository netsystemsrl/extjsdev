<?php

$sellerid = SELLER_ID;

$pi_sql = "
	SELECT
		a.CODICE AS products_model,
		a.IMMAGINE AS products_image
	FROM articoli a
		INNER JOIN angcategorie c ON c.ID = a.CT_CATEGORIE
		LEFT JOIN (SELECT CT_ARTICOLI , CODICEALTERNATIVO FROM articolilistini WHERE CT_ANAGRAFICHE = ".WFVALUEGLOBAL('AMAZON_ANAG_ID').") al ON al.CT_ARTICOLI = a.ID
	WHERE a.IMMAGINE IS NOT NULL AND c.WEB = 1
";

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
<?xml version="1.0" encoding="iso-8859-1" ?> 
<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd"> 
	<Header> 
		<DocumentVersion>1.01</DocumentVersion> 
		<MerchantIdentifier>$sellerid</MerchantIdentifier> 
	</Header>
	<MessageType>ProductImage</MessageType>
	
EOD;

$i=1;
while (!$pi->EOF) {
	$products_model = $pi->fields['products_model'].WFVALUEGLOBAL('AMAZON_CODE_SUFFIX');
	$image = 'https://'.$dbname.'.geqo.it/archive/'.$dbname.'/repository/'.$pi->fields['products_image'];
	//$image = 'http://api.geqo.it/archive/'.$dbname.'/repository/'.$pi->fields['products_image'];
	$xmlStr .=	<<<EOD
	<Message>
		<MessageID>$i</MessageID>
		<OperationType>Update</OperationType> 
		<ProductImage>
		<SKU>$products_model</SKU>
		<ImageType>Main</ImageType>
		<ImageLocation>$image</ImageLocation>
		</ProductImage>
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

file_put_contents($ExtJSDevTMP.'xmlImages.xml', $xmlStr);

/*
//validazione mxl
$xdoc = new DomDocument();
$xdoc->load("ext/amazon/xmlImages.xml");
$rit=@$xdoc->schemaValidate("ProductImage.xsd");
if ($rit) echo "OK"; else echo "FAIL";
*/

$feedType = '_POST_PRODUCT_IMAGE_DATA_';
startSubmitFeed ($xmlStr, $feedType);
$output['message'] .= '_POST_PRODUCT_IMAGE_DATA_ FATTO';

?>