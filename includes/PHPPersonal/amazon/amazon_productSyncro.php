<?php
/*
  Amzon Plugin for CodeGun, Net System Framework
  amazonPlg_version 1.0
  
  http://www.net-system.it

  Copyright (c) 2021 Net System

  Released under Commercial License
*/

//error_log(print_r($output,true)."\n", 3, $LogFileWithPath);

$sellerid = SELLER_ID;
$amazonParentCat = WFVALUEGLOBAL('AMAZON_PARENT_CAT');

foreach ($marketplaceIdArray as $marketplace) {
/*
	$pi_query = tep_db_query('SELECT ap.products_id, actc.amazon_cat_id, p.products_model, pd.products_description, pd.products_name, p.products_ean, IF(m.manufacturers_name IS NULL, "TOYLAND", m.manufacturers_name) as manufact_name'.
		' FROM (products_description AS pd RIGHT JOIN (((amazon_productstoitems AS ap LEFT JOIN products_to_categories AS ptc ON ap.products_id = ptc.products_id) LEFT JOIN products AS p ON ap.products_id = p.products_id) LEFT JOIN amazon_cattoshopcat AS actc ON ptc.categories_id = actc.shop_cat_id) ON pd.products_id = p.products_id) LEFT JOIN manufacturers m ON p.manufacturers_id = m.manufacturers_id '.
		' WHERE ((pd.language_id)=' . $marketplace[language_id] . ');');	

	$pi_query = tep_db_query('SELECT ap.items_id, ap.products_id, actc.amazon_cat_id, p.products_model, pd.products_description, pd.products_name, p.products_ean, IF(m.manufacturers_name Is Null,"TOYLAND",m.manufacturers_name) AS manufact_name, IF(b.brands_name Is Null,"TOYLAND",b.brands_name) AS brand_name '.
		' FROM ((products_description AS pd RIGHT JOIN (((amazon_productstoitems AS ap LEFT JOIN products_to_categories AS ptc ON ap.products_id = ptc.products_id) LEFT JOIN products AS p ON ap.products_id = p.products_id) LEFT JOIN amazon_cattoshopcat AS actc ON ptc.categories_id = actc.shop_cat_id) ON pd.products_id = p.products_id) LEFT JOIN manufacturers AS m ON p.manufacturers_id = m.manufacturers_id) LEFT JOIN brands AS b ON p.brands_id = b.brands_id '.
		' WHERE ((pd.language_id)=' . $marketplace[language_id] . ');');	
*/		
	$pi_sql = "
		SELECT
		   al.CODICEALTERNATIVO AS items_id,
		   a.ID AS products_id,
		   ".WFVALUEGLOBAL('AMAZON_PARENT_CAT')." AS cat_id,
		   a.CODICE AS products_model,
		   IF(a.WEB_METATITLE Is Null,a.DESCRIZIONE,a.WEB_METATITLE) AS products_name,
		   a.WEB_METADESC AS products_description,
		   a.CODICE AS products_ean,
		   IF(m.DESCRIZIONE Is Null,'".UNDEFINED_MANUFACTURER."',m.DESCRIZIONE) AS manufact_name,
		   IF(b.DESCRIZIONE Is Null,'".UNDEFINED_BRAND."',b.DESCRIZIONE) AS brand_name,
		   0 AS minAge,
		   '' AS shipping_cost,
		   al.VALORE as VALORELISTINOAMAZON
		FROM articoli a
		   INNER JOIN angcategorie c ON c.ID = a.CT_CATEGORIE
		   LEFT JOIN anagrafiche m ON m.ID = a.CT_PRODUTTORE
		   LEFT JOIN brand b ON b.ID = a.CT_BRAND
		   LEFT JOIN (SELECT CT_ARTICOLI , CODICEALTERNATIVO, VALORE FROM articolilistini WHERE CT_ANAGRAFICHE = ".WFVALUEGLOBAL('AMAZON_ANAG_ID').") al ON al.CT_ARTICOLI = a.ID
		WHERE c.WEB = 1
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
	//error_log(print_r($pi,true)."\n", 3, $LogFileWithPath);
	
	/*
	echo '<pre>';
	var_dump ($marketplace['language_id']);
	echo '<pre>';
	*/
	
	//error_log("\n".date("Y-m-d h:i:s",time())." amazon syncroProduct marketplace['language_id'] ".$marketplace['language_id'], 3, $LogFileWithPath);
		
	$xmlStr = <<<EOD
<?xml version="1.0" encoding="iso-8859-1"?>
	<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
		<Header>
			<DocumentVersion>1.01</DocumentVersion>
			<MerchantIdentifier>$sellerid</MerchantIdentifier>
		</Header>
		<MessageType>Product</MessageType>
		
EOD;

	$i=1; 
	$eanErr = '';
	while (!$pi->EOF) {
		//salta artcoli con valore listino nullo
		if($pi->fields['VALORELISTINOAMAZON'] === null || $pi->fields['VALORELISTINOAMAZON'] != 0) {;
		
			if (!empty($pi->fields['items_id'])) {
				$type = 'ASIN';
				$typeValue = $pi->fields['items_id'];
				$xmlStr .= amazon_createXmlProductMessage($pi, $type, $typeValue, $i);
				$i++;
			} elseif (strlen($pi->fields['products_ean']) == 13 ) {
				$type = 'EAN';
				$typeValue = $pi->fields['products_ean'];
				$xmlStr .= amazon_createXmlProductMessage($pi, $type, $typeValue, $i);
				$i++;
			} elseif (strlen($pi->fields['products_ean']) == 12 ) {
				$type = 'UPC';
				$typeValue = $pi->fields['products_ean'];
				$xmlStr .= amazon_createXmlProductMessage($pi, $type, $typeValue, $i);
				$i++;
			} else {
				$eanErr .= 'SKU: ' . $pi->fields['products_model'] . ' -> EAN: ' . $pi->fields['products_ean'] . '\n';
			}
		}
		//error_log("\n".date("Y-m-d h:i:s",time())." amazon syncroProduct $pi->fields['products_ean'] ".$pi->fields['products_ean'], 3, $LogFileWithPath);
		$pi->Movenext(); 
	}
	$xmlStr .=	<<<EOD
	</AmazonEnvelope>
EOD;

	$xmlStr = preg_replace("/&/",'&amp;', $xmlStr);
	$xmlStr = preg_replace("/Ã©/", "é", $xmlStr);

	/*
	echo ('<div style="height:500px; width: 1000px; overflow-y:auto"><pre>');
	print '_POST_PRODUCT_DATA_<br>';
	echo htmlentities($xmlStr);
	//print_r ($xmlStr);
	echo ('</pre></div>');
	*/

	// decommentare per mettere in un file la stringa XML e/o il file degli ean errati
	file_put_contents($ExtJSDevTMP.'xmlProducts_'. $marketplace['language_code'] .'.xml', $xmlStr);
	file_put_contents($ExtJSDevTMP.'xmlEanErrors_'. $marketplace['language_code'] .'.xml', $eanErr);

	//validazione xml
	/*
	require(__DIR__.'/xmlValidator.php');
	$validator = new XmlValidator;
	$validated = $validator->validateFeeds($xmlStr);
	error_log(print_r($validated,true)."\n", 3, $LogFileWithPath);
	if ($validated) {
	  $output['message'] = "Feed successfully validated";
	} else {
	  $output['message'] = print_r($validator->displayErrors(), true);
	}
	*/
	
	$feedType = '_POST_PRODUCT_DATA_';
	startSubmitFeed ($xmlStr, $feedType, $marketplace);
	$output['message'] = $output['message'].'_POST_PRODUCT_DATA_ FATTO';
}

function amazon_createXmlProductTypePart($prodType, $pi) {
	if (empty($pi->fields['minAge']) || $pi->fields['minAge'] == ''){
		$minAge = MINIMUM_AGE;
	} else {
		$minAge = $pi->fields['minAge'];
	}
	if($prodType == 'Toys'){
		$xmlStr = '
			<ProductData>
				<Toys>
					<ProductType>
						<ToysAndGames></ToysAndGames>
					</ProductType>
					<AgeRecommendation>
						<MinimumManufacturerAgeRecommended unitOfMeasure="years">'.$minAge.'</MinimumManufacturerAgeRecommended>
					</AgeRecommendation>
				</Toys>
			</ProductData>
		';
	} else if($prodType == 'Tools') {
		$xmlStr = '
			<ProductData>
				<Tools>
					<NumberOfItemsInPackage>1</NumberOfItemsInPackage>
				</Tools>
			</ProductData>
		';	
	} else {
		$xmlStr = '';
	}
	return $xmlStr;
}

function amazon_createXmlProductMessage($pi, $type, $typeValue, $i) {
	global $LogFileWithPath;
	/*
	if (empty($pi->fields['minAge']) || $pi->fields['minAge'] == ''){
		$minAge = MINIMUM_AGE;
	} else {
		$minAge = $pi->fields['minAge'];
	}
	*/
	$products_model = $pi->fields['products_model'].WFVALUEGLOBAL('AMAZON_CODE_SUFFIX');
	$products_name = $pi->fields['products_name'];
	$brand_name = $pi->fields['brand_name'];
	$products_description = (!empty($pi->fields['products_description']) ? $pi->fields['products_description'] : ' ');
	$products_description = strip_tags($products_description);
	$products_description = utf8_encode($products_description);
	$products_bulletPoint = substr($products_description, 0, 200);
	$manufact_name = $pi->fields['manufact_name'];
	$cat_id = $pi->fields['cat_id'];
	//error_log(print_r($brand_name,true)."\n", 3, $LogFileWithPath);
	$shipGoup = WFVALUEGLOBAL('AMAZON_MWS_MERCHANTSHIPPINGGROUPNAME');
	$prodType = WFVALUEGLOBAL('AMAZON_PRODUCT_TYPE');
	
	$xmlStr =	<<<EOD
	<Message>
		<MessageID>$i</MessageID>
		<OperationType>Update</OperationType>
		<Product>
			<SKU>$products_model</SKU>
			<StandardProductID>
				<Type><![CDATA[$type]]></Type>
				<Value><![CDATA[$typeValue]]></Value>
			</StandardProductID>
			<DescriptionData>
				<Title><![CDATA[$products_name]]></Title>
				<Brand><![CDATA[$brand_name]]></Brand>
				<Description><![CDATA[$products_description]]></Description>
				<BulletPoint><![CDATA[$products_bulletPoint]]></BulletPoint>
				<Manufacturer><![CDATA[$manufact_name]]></Manufacturer>
				<RecommendedBrowseNode>$cat_id</RecommendedBrowseNode>
				<MerchantShippingGroupName>$shipGoup</MerchantShippingGroupName>
				<CountryOfOrigin>IT</CountryOfOrigin>
			</DescriptionData>
EOD;

$xmlStr .= amazon_createXmlProductTypePart ($prodType, $pi);

$xmlStr .=<<<EOD
		</Product>
	</Message>
	
EOD;

return $xmlStr;
}
?>