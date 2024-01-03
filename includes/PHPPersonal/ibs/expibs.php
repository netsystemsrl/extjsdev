<?php
class ExpIbs{

	private $con;
	private $sile_url;
	private $langId = 2; /*it*/

	//this constructor connects with the database
	public function __construct(){
	//$this->con = new mysqli("Your_Host","Your_User","Your_Pass","Your_DatabaseName");
	//$this->con = new mysqli("62.149.150.149","Sql530810","050c53fb","Sql530810_1");
	$this->con = new mysqli(DB_SERVER,DB_SERVER_USERNAME,DB_SERVER_PASSWORD,DB_DATABASE);

	$this->sile_url = $_SERVER["SERVER_NAME"];
	$this->domain = $this->getDomainFromUrl();

	if($this->con->connect_errno > 0){
		die('There was a problem [' . $con->connect_error . ']');
		}
	}

	public function getDomainFromUrl() {
		//$host = parse_url($_SERVER["HTTP_HOST"],PHP_URL_HOST);
		$pieces = explode( '.', $_SERVER["HTTP_HOST"] );
		$popped = array_pop( $pieces ); //remove tld extension from stack
		//if( strlen( $popped ) <= 3 ) array_pop( $pieces ); //tld was likely a multi-part ext like .co.uk so pop next element off stack too!

		$domain = array_pop( $pieces );

		return $domain;
	}

	public function getProducts(){
		$count = 0;
		$header = "";
		$data = "";
		//$langId = 2; /*it*/
		//query
		//$result = $this->con->query("SELECT * FROM Your_TableName");
		
		/* prerequisiti: 
		* - l'ean non deve esere nullo
		* - la quantità deve essere positiva o nulla
		* - se il prodotto è disabilitato mette qty 0
		* - manufacturer viene esportato con nome colonna brand, se campo vuoto mette DEFAULT_BRAND
		* - il campo shop_product_unique_identifier_1 è compilato con i nomi delle categorie di RakutenES
		*/
		$query = "SELECT 
			'17839' as 'ID_CATEGORY',
			c.categories_name as 'CATEGORY_NAME',
			LPAD(p.products_ean, 13, '0') 'EAN',
			pd.products_name Title,
			p.products_model ID_SHOP_SKU,
			pd.products_description description,
			CONCAT('".$this->sile_url."/catalog/images/',p.products_image) URL_IMAGE_1,
			'' as URL_IMAGE_2,
			IF (m.manufacturers_name IS NULL OR m.manufacturers_name = '', '".DEFAULT_BRAND."', m.manufacturers_name) brand_name,
			'' as Variant_ID,
			'' as URL_IMAGE_3,
			'' as URL_IMAGE_4,
			'' as URL_IMAGE_5,
			'' as colour,
			p.products_model as sku,
			p.products_model as 'product-id',
			'product-id-type' as 'SHOP_SKU',
			replace(format(p.products_price,2),'.',',') price,
			IF (p.products_quantity < 0 OR p.products_status = 0, 0, p.products_quantity) quantity
			FROM (((products AS p LEFT JOIN manufacturers AS m ON p.manufacturers_id = m.manufacturers_id) 
				LEFT JOIN products_description AS pd ON p.products_id = pd.products_id) 
					LEFT JOIN products_to_categories AS ptc ON p.products_id = ptc.products_id)
						LEFT JOIN categories AS c ON ptc.categories_id = c.categories_id
			WHERE pd.language_id = ".$this->langId." AND 
				p.products_ean Is Not Null AND
				LENGTH(p.products_ean) > 11 AND
				p.products_quantity > 0 AND
				p.products_automation = 1";
		/*
		echo $query;
		die();
		*/
		$result = $this->con->query($query);
		
		$this->downloadCsv($result, 'products');
	}

	public function getProductsLight(){
		$count = 0;
		$header = "";
		$data = "";
		//$langId = 2; /*it*/
		//query
		//$result = $this->con->query("SELECT * FROM Your_TableName");
		
		/* prerequisiti: 
		* - l'ean non deve esere nullo
		* - la quantità deve essere positiva o nulla
		* - se il prodotto è disabilitato mette qty 0
		* - manufacturer viene esportato con nome colonna brand, se campo vuoto mette Toyland
		* - il campo shop_product_unique_identifier_1 è compilato con i nomi delle categorie di RakutenES
		*/
		$query = "SELECT 
			LPAD(p.products_ean, 13, '0') 'EAN associato al prodotto',
			pd.products_name as 'NOME PRODOTTO',
			c.categories_name as 'CATEGORIA PRODOTTO',
			IF (m.manufacturers_name IS NULL OR m.manufacturers_name = '', '".DEFAULT_BRAND."', m.manufacturers_name) as 'MARCA',
			pd.products_description as 'DESCRIZIONE',
			CONCAT('".$this->sile_url."/catalog/images/',p.products_image) as 'URL IMMAGINE',
			replace(format(p.products_price,2),'.',',') as 'PREZZO',
			p.products_model as 'CODICE INTERNO',
			IF (p.products_quantity < 0 OR p.products_status = 0, 0, p.products_quantity) as 'GIACENZA'
			FROM (((products AS p LEFT JOIN manufacturers AS m ON p.manufacturers_id = m.manufacturers_id) 
				LEFT JOIN products_description AS pd ON p.products_id = pd.products_id) 
					LEFT JOIN products_to_categories AS ptc ON p.products_id = ptc.products_id)
						LEFT JOIN categories AS c ON ptc.categories_id = c.categories_id
			WHERE pd.language_id = ".$this->langId." AND 
				p.products_ean Is Not Null AND
				LENGTH(p.products_ean) > 11 AND
				p.products_quantity > 0 AND
				p.products_automation = 1";
		/*
		echo $query;
		die();
		*/
		$result = $this->con->query($query);
		
		$row_cnt = $result->num_rows;
		/*
		echo $row_cnt;
		die();		
		*/
		$this->downloadCsv($result, 'productsLight', true);
	}
	
	public function getOffers(){
		$count = 0;
		$header = "";
		$data = "";
		$fulfillmentLatency = '1'; /*Giorni previsti per la preparazione della spedizione*/
		$logisticClass = 'B'; /*tabella dei costi di spedizione, vedere tabella su info ePRICE*/
		
		//query
		//$result = $this->con->query("SELECT * FROM Your_TableName");
		
		/* prerequisiti: 
		* - l'ean non deve esere nullo e deve essere di almeno 11 cifre
		* - la quantità deve essere positiva o nulla
		* - se il prodotto è disabilitato mette qty 0
		* - manufacturer viene esportato con nome colonna brand, se campo vuoto mette Toyland
		* - il campo shop_product_unique_identifier_1 è compilato con i nomi delle categorie di RakutenES
		*/
		$query = "SELECT 
			p.products_model sku,
			LPAD(p.products_ean, 13, '0') as 'product-id',
			'EAN' as 'product-id-type',
			pd.products_description as 'description',
			pd.products_description as 'internal-description',
			replace(format(p.products_price,2),'.',',') price,
			'Prezzo tasse incluse' as 'price-additional-info',
			IF (p.products_quantity <= 0, 0, p.products_quantity) quantity,
			'0' as 'min-quantity-alert',
			'11' as 'state',
			'' as 'available-start-date',
			'' as 'available-end-date',
			'' as 'logistic-class',
			'1' as 'favorite-rank',
			'' as 'discount-price',
			'' as 'discount-start-date',
			'' as 'discount-end-date',
			'' as 'discount-ranges',
			'' as 'leadtime-to-ship',
			'AGGIORNA' as 'update-delete',
			CONCAT('".$this->sile_url."/catalog/images/',p.products_image) as 'immpers1',
			'' as 'immpers2', 
			'' as 'immpers3',
			'' as 'immpers4'
			FROM products p LEFT JOIN products_description pd ON p.products_id = pd.products_id
			WHERE pd.language_id = ".$this->langId." AND 
				p.products_ean Is Not Null AND 
				LENGTH(p.products_ean) > 11 AND 
				p.products_automation=1;";
		/*
		echo $query;
		die();
		*/
		$result = $this->con->query($query);
		
		$this->downloadCsv($result, 'offers');
	}
	
	public function downloadCsv($result, $type, $filterNoImg = false){
		
		//count fields
		$count = $result->field_count;
		//columns names
		$names = $result->fetch_fields();
		//put column names into header
		$header = '';
		foreach($names as $value) {
			$header .= $value->name.";";
		}
		//put rows from your query
		$data = '';
		$lineCount = 0;
		while($row = $result->fetch_assoc())  {
			$line = '';
			//var_dump($row['GIACENZA']);
			//var_dump($row['URL IMMAGINE']);
			//check img exist solo per productsLight
			if ($filterNoImg && !file_exists(str_replace($this->sile_url, $_SERVER["DOCUMENT_ROOT"], $row['URL IMMAGINE']))) continue;
			foreach($row as $value) {
				if(!isset($value) || $value == "")  {
					$value = ";"; //in this case, ";" separates columns
			} else {
					$value = str_replace('"', '""', $value);
					$value = '"' . $value . '"' . ";"; //if you change the separator before, change this ";" too
				}
				$line .= $value;
			} //end foreach
			$data .= trim($line)."\n";
			$lineCount++;
		} //end while
		//avoiding problems with data that includes "\r"
		$data = str_replace("\r", "", $data);
		//if empty query
		if ($data == "") {
			$data = "\no matching records found\n";
		}
		
		/*
		var_dump($lineCount);
		//var_dump($data);
		die();
		*/
		
		$output = $header."\n".$data."\n";

		//Download csv file
		$now = gmdate("D, d M Y H:i:s");
		header("Content-type: application/octet-stream");
		//header("HTTP/1.1 200 OK");
		//http_response_code(201);
		header("Status: 200 All rosy");
		header("Content-Disposition: attachment; filename=".$type."_".$this->domain."ExpIbs_".date("Ymd").".csv");
		header("Content-length: ".strlen($output));
		header("Last-Modified: {$now} GMT");
		header("Pragma: no-cache");
		header("Expires: 0");
		echo $output;
	}
}
?>