<?php
function url_origin( $s, $use_forwarded_host = false ){
    $ssl      = ( ! empty( $s['HTTPS'] ) && $s['HTTPS'] == 'on' );
    $sp       = strtolower( $s['SERVER_PROTOCOL'] );
    $protocol = substr( $sp, 0, strpos( $sp, '/' ) ) . ( ( $ssl ) ? 's' : '' );
    $port     = $s['SERVER_PORT'];
    $port     = ( ( ! $ssl && $port=='80' ) || ( $ssl && $port=='443' ) ) ? '' : ':'.$port;
    $host     = ( $use_forwarded_host && isset( $s['HTTP_X_FORWARDED_HOST'] ) ) ? $s['HTTP_X_FORWARDED_HOST'] : ( isset( $s['HTTP_HOST'] ) ? $s['HTTP_HOST'] : null );
    $host     = isset( $host ) ? $host : $s['SERVER_NAME'] . $port;
    return $protocol . '://' . $host;
}
function full_url( $s, $use_forwarded_host = false ){
    return url_origin( $s, $use_forwarded_host ) . $s['REQUEST_URI'];
}
$urlAbsolute = full_url( $_SERVER );
$urlParts = parse_url($urlAbsolute);
$isIP = (bool)ip2long($urlParts['host']);
$urlArray = explode(".", parse_url($urlAbsolute, PHP_URL_HOST));

//var_dump($_SERVER);
//var_dump($urlArray);

define("ERP_DB", $urlArray[0]);
define("ERP_USER", "WEBPUBLIC");
define("ERP_PASSWORD", "WEBPUBLIC");
define("BASEROUTE", "eshop/");
define("ERP_ROOT_URL", "http://localhost/");
//define("ERP_ROOT_URL", $_SERVER['REQUEST_SCHEME']."://" . $urlArray[0] .".geqo.it/");

//da impostare per url non automatizzabili
$customBaseUrl = '';

if(!empty($customBaseUrl)) {
	define("BASEURL", $_SERVER['REQUEST_SCHEME']."://" . $customBaseUrl ."/");
} else if(isset($_SERVER['HTTP_X_FORWARDED_HOST'])){
	define("BASEURL", $_SERVER['REQUEST_SCHEME']."://" . $_SERVER['HTTP_X_FORWARDED_HOST']."/");
} else if($isIP) {
	define("BASEURL", $_SERVER['REQUEST_SCHEME']."://" . $_SERVER['SERVER_NAME'] ."/".BASEROUTE);
} else {
	define("BASEURL", $_SERVER['REQUEST_SCHEME']."://" . $urlArray[0] .".geqo.it/".BASEROUTE);
}
define("BASEURLFILE", "http://" . $urlArray[0] .".geqo.it/");

define("VERSION", '1.0.3');
define("LOGFILE", getcwd()."/my-errors.log");

define("BOOSTRAP_VERSION", 5);

define("DEBUG", false);
//define("DEBUG_MODE", 'display');
//define("DEBUG_MODE", 'ajax');
//define("DEBUG_MODE", 'console');
