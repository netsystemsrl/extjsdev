<?php
/*
  Amazon Plugin for CodeGun, a Net System's Solutions
  amazonPlg_version 1.0
  
  http://www.net-system.it

  Copyright (c) 2021 Net System

  Released under Commercial License
*/

	//global $ExtJSDevLOG;
	global $LogFileWithPath, $service;
	
	$LogFileWithPath = $ExtJSDevLOG."amazonLog.log";
	define('AMAZONLOGFILE', $ExtJSDevLOG."amazonLog.log");

	define('AMAZON_APPLICATION_VERSION', '1.0');
   /************************************************************************
    * REQUIRED
    * 
    * Access Key ID and Secret Acess Key ID, obtained from:
    * http://mws.amazon.com
    ***********************************************************************/

	//define('ACCESS_KEY_ID', 'AKIAJAXHBJ4UYLSLVX2Q');
	define('ACCESS_KEY_ID', WFVALUEGLOBAL('AMAZON_MWS_ACCESS_KEY_ID'));
    //define('SECRET_ACCESS_KEY', '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');
	define('SECRET_ACCESS_KEY', WFVALUEGLOBAL('AMAZON_AWS_SECRET_ACCESS_KEY'));

	//define('AWS_ACCESS_KEY_ID', 'AKIAJAXHBJ4UYLSLVX2Q');
	define('AWS_ACCESS_KEY_ID', WFVALUEGLOBAL('AMAZON_AWS_ACCESS_KEY_ID'));
	//define('AWS_SECRET_ACCESS_KEY', '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');
	define('AWS_SECRET_ACCESS_KEY', WFVALUEGLOBAL('AMAZON_AWS_SECRET_ACCESS_KEY'));

	/************************************************************************
    * REQUIRED
    * 
    * All MWS requests must contain a User-Agent header. The application
    * name and version defined below are used in creating this value.
    ***********************************************************************/

	define('AMAZON_APPLICATION_NAME', 'codeGunAmazonSyncro');
    define('FBA_APPLICATION_VERSION', '2010-10-01');
	define('AWS_APPLICATION_VERSION', '2009-01-01');
	define('DATE_FORMAT_AMAZON', 'Y-m-d\TH:i:s\Z');
	
   /************************************************************************
    * REQUIRED
    * 
    * All MWS requests must contain the seller's seller ID.
    ***********************************************************************/

    //define ('SELLER_ID', 'A57SHBLZ59N1S');
	define ('SELLER_ID', WFVALUEGLOBAL('AMAZON_SELLER_ID'));
    //define ('MERCHANT_ID', 'A57SHBLZ59N1S');
	define ('MERCHANT_ID', WFVALUEGLOBAL('AMAZON_MERCHANT_ID'));

   /************************************************************************
    * REQUIRED
    * 
    * All MWS requests must contain the MWS endpoint URL,
    * please set appropiate domain name for the country you wish.
    *
    * US: mws.amazonservices.com
    * UK: mws.amazonservices.co.uk
    * Germany: mws.amazonservices.de
    * France: mws.amazonservices.fr
    * Japan: mws.amazonservices.jp
    * China: mws.amazonservices.com.cn
    * Italy: mws.amazonservices.it
    ***********************************************************************/

    define ('MWS_ENDPOINT_URL', 'https://mws.amazonservices.it/FulfillmentInventory/2010-10-01/');
	define ('MWS_SERVICE_URL', 'https://mws.amazonservices.it');

	/************************************************************************ 
    * OPTIONAL ON SOME INSTALLATIONS
    *
    * Set include path to root of library, relative to Samples directory.
    * Only needed when running library from local directory.
    * If library is installed in PHP include path, this is not needed
    ***********************************************************************/  

	//error_log(print_r( __DIR__,true)."\n", 3, $LogFileWithPath);

    //set_include_path(get_include_path() . PATH_SEPARATOR . DIR_WS_EXT . 'amazon');   
	set_include_path(__DIR__);
	
   /************************************************************************ 
    * OPTIONAL ON SOME INSTALLATIONS  
    * 
    * Autoload function is reponsible for loading classes of the library on demand
    * 
    * NOTE: Only one __autoload function is allowed by PHP per each PHP installation,
    * and this function may need to be replaced with individual require_once statements
    * in case where other framework that define an __autoload already loaded.
    * 
    * However, since this library follow common naming convention for PHP classes it
    * may be possible to simply re-use an autoload mechanism defined by other frameworks
    * (provided library is installed in the PHP include path), and so classes may just 
    * be loaded even when this function is removed
    ***********************************************************************/   
    //function __autoload($className){
	spl_autoload_register(function($className) {
        $filePath = str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';
        $includePaths = explode(PATH_SEPARATOR, get_include_path());
        foreach($includePaths as $includePath){
            if(file_exists($includePath . DIRECTORY_SEPARATOR . $filePath)){
                require_once $filePath;
                return;
            }
        }
    });

   /***************************************************************************
   * AMAZON MWS VARIABLES
   ***************************************************************************/
   
	$config = array (
		'ServiceURL' => MWS_SERVICE_URL,
		'ProxyHost' => null,
		'ProxyPort' => -1,
		'MaxErrorRetry' => 3,
	);
	
	$service = new MarketplaceWebService_Client(
		AWS_ACCESS_KEY_ID,
		AWS_SECRET_ACCESS_KEY,
		$config,
		AMAZON_APPLICATION_NAME,
		AMAZON_APPLICATION_VERSION
	);

   /***************************************************************************
   * APPLICATION VARIABLEs AND DEFINITIONS
   ***************************************************************************/
    define ('PRODUCT_DATA_LAYOUT', 'TOYS_GAMES');
   	//define ('PARENT_CATEGORY', '632679031');	//spostata nelle globals di geqo
   	define ('UNDEFINED_MANUFACTURER', 'Abiti e Maschere');
	define ('UNDEFINED_BRAND', 'Abiti e Maschere');
	
	/*
	$marketplaceArray = array(array("Id" => array('APJ6JRA9NG5V4'),"language_code" => 'it',"active" => 'true'),
							array("Id" => array('A1F83G8C2ARO7P'),"language_code" => 'en',"active" => 'false'),
							array("Id" => array('A13V1IB3VIYZZH'),"language_code" => 'fr',"active" => 'true'),
							array("Id" => array('A1PA6795UKMFR9'),"language_code" => 'de',"active" => 'true'),
							array("Id" => array('A1RKKUPIHCS9HS'),"language_code" => 'es',"active" => 'false'));
	*/
	$marketplaceArray = array(array("Id" => array('APJ6JRA9NG5V4'),"language_code" => 'it',"active" => 'true'));
	
	define ('MIN_QTY', is_numeric(WFVALUEGLOBAL('AMAZON_MIN_QTY')) ? WFVALUEGLOBAL('AMAZON_MIN_QTY') : 0);
	define ('DEFAULT_QTY', 0);
	define ('PRICELIST', 'products_price');
	define ('MINIMUM_AGE', 14);
	$fulfillmentlatency = 2;
	
	/* correction from submission Feed Result on Cronjobs*/
	$cron = true;
	if (!$cron) {
		//configurazione per le operazioni manuali
		$correctFeedErrors = true; //correct Feed Errors during Cronjobs
		$importManufacturers = false; //if true will import manufacturers from amazon during Cronjobs feedErrors.php
		$importBrands = true; //if true will import brands from amazon during Cronjobs feedErrors.php
		$importASIN_err8541 = true; //if true will import ASIN from amazon during Cronjobs feedErrors.php
		$importASIN_err8542 = true; //if true will import ASIN from amazon during Cronjobs feedErrors.php
	} else {
		//configuarazione in caso di jobcron
		$correctFeedErrors = true; //correct Feed Errors during Cronjobs
		$importManufacturers = false; //if true will import manufacturers from amazon during Cronjobs feedErrors.php
		$importBrands = true; //if true will import brands from amazon during Cronjobs feedErrors.php
		$importASIN_err8541 = true; //if true will import ASIN from amazon during Cronjobs feedErrors.php
		$importASIN_err8542 = true; //if true will import ASIN from amazon during Cronjobs feedErrors.php
	}
