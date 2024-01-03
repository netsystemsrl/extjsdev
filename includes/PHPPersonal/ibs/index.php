<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../../includes/configure.php';
require_once 'ibs_config.php';
//call the "class" file
require_once 'expibs.php';
//instantiate class
$export = new ExpIbs();

if (!isset($_REQUEST['act'])) $_REQUEST['act'] = '';

if ($_REQUEST['act'] == 'products') {
	$export->getProducts();
} elseif ($_REQUEST['act'] == 'productsLight') {
	$export->getProductsLight();
} elseif ($_REQUEST['act'] == 'offers') {
	$export->getOffers();
} else {
	$export->getOffers();
}
?>